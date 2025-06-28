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
    client.subscribe(`${commonAPIURL}/sensors`);
    console.log("Subscribed to sensors");
})

client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log("Received sensors' data:", data);

    try {
        await pool.query(
            'INSERT INTO "FACTORS" ("Airflow", "Humidity", "Light", "Moisture", "Temperature", "Timestamp") VALUES ($1, $2, $3, $4, $5, $6)',
            [data.Airflow, data.Humidity, data.Light, data.Moisture, data.Temperature, data.Timestamp]);
    } catch (err) {
        console.error("Database INSERT error:", err);
    }
    
    /*// Decision logic (examples)
    if (data.Temperature < ...)
        client.publish(`${commonAPIURL}/action`, 'Turn on heater');
    if (data.Humidity < ...)
        client.publish(`${commonAPIURL}/action`, '...');
    if (data.Airflow > ...)
        client.publish(`${commonAPIURL}/alert`, '...');*/
});

app.use(`/${commonAPIURL}`, routes);

app.listen(PORT, () => {
    console.log(`The server is running on PORT ${PORT}.`);
})