const dotenv = require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');

const pool = require('./database-connection');
const routes = require('./routes');

const PORT = process.env.PORT;

const app = express();
app.use(express.json());

const client = mqtt.connect('mqtt://localhost');
const commonAPIURL = 'house/mushroom';

client.on('connect', () => {
    client.subscribe(`${commonAPIURL}/sensors_data`);
    console.log("Subscribed to sensors data");
})

client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log("Received data:", data);

    try {
        await pool.query(
            'INSERT INTO mushroom_house_sensors (temperature, humidity, wind, timestamp) VALUES ($1, $2, $3, $4)',
            [data.temperature, data.humidity, data.wind, data.timestamp]);
    } catch (err) {
        console.error("Database INSERT error:", err);
    }
    
    /*// Decision logic
    if (data.temperature < 18)
        mqttClient.publish(`${commonAPIURL}/action`, 'Turn on heater');
    if (data.humidity < 70)
        mqttClient.publish(`${commonAPIURL}/action`, 'Start irrigation');
    if (data.wind > 10)
        mqttClient.publish(`${commonAPIURL}/alert`, 'Wind too strong!');*/
});

app.use(`/${commonAPIURL}`, routes);

app.listen(PORT, () => {
    console.log(`The server is running on PORT ${PORT}.`);
})