function controlActuators({automation, sensors, client, topic}) {
    const commands = {};

    if (automation.Airflow)
        commands.Ventilation_fan = sensors.Airflow < 1;

    if (automation.Humidity)
        commands.Humidifier = sensors.Humidity < 85;

    if (automation.Light)
        commands.LED_grow_lights = sensors.Light === 0;

    if (automation.Moisture)
        commands.Water_pump = sensors.Moisture < 55;

    if (automation.Temperature) {
        commands.Heater = sensors.Temperature < 18;
        commands.Cooler = sensors.Temperature > 24;
    }

    // Only publish if we have any updates
    if (Object.keys(commands).length > 0) {
        const payload = {
            ...commands,
            Timestamp: new Date().toLocaleString()
        };

        client.publish(`${topic}/actuators`, JSON.stringify(payload), {retain: true});
        console.log("Automation updated actuators:", payload);
    }
};

module.exports = controlActuators;