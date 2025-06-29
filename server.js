const dotenv = require('dotenv').config();
const express = require('express');
const {createProxyMiddleware } = require('http-proxy-middleware');
const mqtt = require('mqtt');

const pool = require('./database-connection');
require('./factors-simulator');
const autoControl = require('./automatic-control');

const PORT = process.env.PORT;
const app = express();
const client = mqtt.connect('mqtt://localhost');
const topic = 'house/mushroom';

client.on('connect', async() => {
    client.subscribe(`${topic}/actuators`);
    client.subscribe(`${topic}/automation`);
    client.subscribe(`${topic}/sensors`);
    
    console.log('Subscribed to actuators, automation, and sensors');

    try {
        const lastActuatorStates = await pool.query('SELECT * FROM "ACTUATORS" ORDER BY "Timestamp" DESC LIMIT 1');
        const lastAutomationStates = await pool.query('SELECT * FROM "AUTOMATION" ORDER BY "Timestamp" DESC LIMIT 1');

        if (lastActuatorStates.rows.length > 0 && lastAutomationStates.rows.length > 0) {
            client.publish(`${topic}/actuators`, JSON.stringify(lastActuatorStates.rows[0]), {retain: true});
            client.publish(`${topic}/automation`, JSON.stringify(lastAutomationStates.rows[0]), {retain: true});

            console.log('Published last actuator states:', lastActuatorStates.rows[0]);
            console.log('Published last automation states:', lastAutomationStates.rows[0]);
        } else
            console.warn('Actuators/automation data is empty in the database.');
    } catch (err) {
        console.log('Failed to retreive data from the database:', err);
    }
});

client.on('message', async(msgTopic, message) => {
    const data = JSON.parse(message.toString());

    switch (msgTopic) {
        case `${topic}/actuators`:
            try {
                await pool.query(
                    'INSERT INTO "ACTUATORS" VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT ("Timestamp") DO NOTHING',
                    [data.Ventilation_fan, data.Humidifier, data.LED_grow_lights, data.Water_pump, data.Heater, data.Cooler, data.Timestamp]);
                console.log('Received actuators\' data:', data);
            } catch (err) {
                console.error('Database INSERT error:', err);
            }

            break;
        case `${topic}/automation`:
            try {
                await pool.query(
                    'INSERT INTO "AUTOMATION" VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ("Timestamp") DO NOTHING',
                    [data.Airflow, data.Humidity, data.Light, data.Moisture, data.Temperature, data.Timestamp]);
                console.log('Received automation data:', data);
            } catch (err) {
                console.error('Database INSERT error:', err);
            }

            break;
        case `${topic}/sensors`:
            try {
                await pool.query(
                    'INSERT INTO "FACTORS" VALUES ($1, $2, $3, $4, $5, $6)',
                    [data.Airflow, data.Humidity, data.Light, data.Moisture, data.Temperature, data.Timestamp]);
                console.log('Received sensors\' data:', data);

                const lastAutomationStates = await pool.query('SELECT * FROM "AUTOMATION" ORDER BY "Timestamp" DESC LIMIT 1');

                autoControl({
                    automation: lastAutomationStates.rows[0],
                    sensors: data,
                    client: client,
                    topic: topic
                });
            } catch (err) {
                console.error('Database INSERT error:', err);
            }

            break;
        default:
            break;
    }
});

// Proxy / to the Node-RED dashboard
app.use('/', createProxyMiddleware({
    target: 'http://localhost:1880/ui',  // Node-RED dashboard URL
    changeOrigin: true
}));

// Block all others
app.use((req, res) => {
    res.status(404).send(`Not available. Please visit http://localhost:${PORT} to access the mushroom house dashboard.`);
});

app.listen(PORT, () => {
    console.log(`The server is running. The dashboard is available at http://localhost:${PORT}.`);
});