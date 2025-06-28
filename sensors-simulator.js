const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

// Initial environment (optimal state)
let environment = {
    Airflow: 1.5,
    Humidity: 85,
    Light: 1,  // 1 = ON, 0 = OFF
    Moisture: 55,
    Temperature: 22
};

// Initial actuators' state
let actuators = {
    Ventilation_fan: false,
    Humidifier: false,
    LED_Grow_Lights: false,
    Water_pump: false,
    Heater: false,
    Cooler: false
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function updateEnvironment() {
    // Airflow (increases with fan)
    environment.Airflow = actuators.Ventilation_fan
        ? 1.5 + Math.random() * 1
        : 0.5 + Math.random() * 0.5;

    // Humidity
    if (actuators.Humidifier)
        environment.Humidity += 0.5;
    if (actuators.Ventilation_fan)
        environment.Humidity -= 0.4;

    // Light
    environment.Light = actuators.LED_Grow_Lights ? 1 : 0;

    // Moisture
    if (actuators.Water_pump)
        environment.Moisture += 0.7;
    environment.Moisture -= 0.2;  // Natural evaporation

    // Temperature
    if (actuators.Heater)
        environment.Temperature += 0.3;
    if (actuators.Cooler)
        environment.Temperature -= 0.3;

    // Natural drift
    environment.Humidity += (Math.random() - 0.5) * 0.2;
    environment.Moisture += (Math.random() - 0.5) * 0.2;
    environment.Temperature += (Math.random() - 0.5) * 0.2;

    // Clamp values
    environment.Temperature = clamp(environment.Temperature, 10, 35);  // 10 – 35°C
    environment.Humidity = clamp(environment.Humidity, 40, 100);  // 40 - 100%
    environment.Airflow = clamp(environment.Airflow, 0, 5);  // 0 - 5m/s
    environment.Moisture = clamp(environment.Moisture, 20, 100);  // 20 - 100%
}

function publishSensorData() {
    const data = {
        Airflow: +environment.Airflow.toFixed(2),
        Humidity: +environment.Humidity.toFixed(2),
        Light: environment.Light,
        Moisture: +environment.Moisture.toFixed(2),
        Temperature: +environment.Temperature.toFixed(2),
        Timestamp: new Date().toISOString()
    };

    client.publish('house/mushroom/sensors', JSON.stringify(data));
    console.log('Published:', data);
}

client.on('connect', () => {
    client.subscribe('house/mushroom/actuators');
    console.log('Subscribed to actuators');
    
    setInterval(() => {
        updateEnvironment();
        publishSensorData();
    }, 5000);  // Every 5 seconds
});

client.on('message', (topic, message) => {
    if (topic === 'house/mushroom/actuators') {
        try {
            actuators = JSON.parse(message.toString());
            console.log('Received actuators\' state:', actuators);
        } catch (err) {
            console.error('Error parsing actuators\' state:', err);
        }
    }
});