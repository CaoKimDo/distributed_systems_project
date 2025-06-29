const dotenv = require('dotenv').config();
const express = require('express');
const {createProxyMiddleware } = require('http-proxy-middleware');
const mqtt = require('mqtt');

const pool = require('./database-connection');

const PORT = process.env.PORT;
const app = express();
const client = mqtt.connect('mqtt://localhost');
const topic = 'house/mushroom';

client.on('connect', () => {
    client.subscribe(`${topic}/sensors`);
    client.subscribe(`${topic}/action`);
    client.subscribe(`${topic}/actuators`);
    
    console.log("Subscribed to sensors, action, and actuators");
});

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