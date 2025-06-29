const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');
const topic = 'house/mushroom';

// Initial environment (optimal state)
let environment = {
    Airflow: 1.5,
    Humidity: 88,
    Light: 1,  // 1 = ON, 0 = OFF
    Moisture: 60,
    Temperature: 22
};

// Initial actuators' state
let actuators = {};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
};

function updateEnvironment() {
    // Airflow (based on ventilation fan)
    environment.Airflow = actuators.Ventilation_fan
        ? 1.5 + Math.random() * 1  // Fan ON: 1.5 – 2.5 m/s
        : 0.3 + Math.random() * 0.7;   // Fan OFF: 0.3 – 1.0 m/s (natural drift)

    // Humidity (increased by humidifier, reduced by airflow)
    if (actuators.Humidifier)
        environment.Humidity += 0.5;
    if (actuators.Ventilation_fan)
        environment.Humidity -= 0.4;
    environment.Humidity -= environment.Airflow * 0.1;  // Airflow causes humidity loss.
    environment.Humidity += (Math.random() - 0.5) * 0.2;  // Natural drift

    // Light
    environment.Light = 1;

    // Moisture (increased by water pump, reduced by temp & evaporation)
    if (actuators.Water_pump)
        environment.Moisture += 0.7;
    environment.Moisture -= 0.2 + (environment.Temperature - 20) * 0.02;  // Warmer = more evaporation
    environment.Moisture += (Math.random() - 0.5) * 0.2;  // Natural drift

    // Temperature (affected by heater, cooler & ventilation fan)
    if (actuators.Heater)
        environment.Temperature += 0.3;
    if (actuators.Cooler)
        environment.Temperature -= 0.3;
    if (actuators.Ventilation_fan)
        environment.Temperature -= 0.05;  // Slight cooling effect if the ventilation fan is running.
    environment.Temperature += (Math.random() - 0.5) * 0.2;  // Natural drift

    // Clamp values
    environment.Temperature = clamp(environment.Temperature, 12, 28);  // 12 – 28°C
    environment.Humidity = clamp(environment.Humidity, 75, 95);  // 75 - 95%
    environment.Airflow = clamp(environment.Airflow, 0.3, 3.0);  // 0.3 - 3.0m/s
    environment.Moisture = clamp(environment.Moisture, 50, 70);  // 50 - 70%
};

function publishSensorData() {
    const data = {
        Airflow: +environment.Airflow.toFixed(2),
        Humidity: +environment.Humidity.toFixed(2),
        Light: environment.Light,
        Moisture: +environment.Moisture.toFixed(2),
        Temperature: +environment.Temperature.toFixed(2),
        Timestamp: new Date().toLocaleString()
    };

    client.publish(`${topic}/sensors`, JSON.stringify(data));
    console.log('Published:', data);
};

client.on('connect', () => {
    client.subscribe(`${topic}/actuators`);
    console.log('Subscribed to actuators');
    
    setInterval(() => {
        updateEnvironment();
        publishSensorData();
    }, 5000);  // Every 5 seconds
});

client.on('message', (topic, message) => {
    try {
        actuators = JSON.parse(message.toString());
        console.log('Received actuators\' state:', actuators);
    } catch (err) {
        console.error('Error parsing actuators\' state:', err);
    }
});