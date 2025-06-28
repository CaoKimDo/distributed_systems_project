const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

function generateData() {
    return {
        temperature: +(Math.random() * 10 + 15).toFixed(2),  // 15 – 25°C
        humidity: +(Math.random() * 30 + 60).toFixed(2),  // 60 – 90%
        wind: +(Math.random() * 15).toFixed(2),  // 0 – 15m/s
        timestamp: new Date().toISOString(),
    };
}

client.on('connect', () => {
    setInterval(() => {
        const data = generateData();
        client.publish('house/mushroom/sensors_data', JSON.stringify(data));
        console.log('Published:', data);
    }, 5000);  // Every 5 seconds
});