const express = require('express');
const {Pool} = require('pg');
const dotenv = require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tendbcuam',
    password: 'passwordcuam@',
    port: 8888,
});

// '/hallo' is a common API URL
app.use('/house/mushroom', require('./routes'));

app.listen(PORT, () => {
    console.log(`The server is running on PORT ${PORT}.`);
})