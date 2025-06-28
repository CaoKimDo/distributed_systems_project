const express = require('express');
const router = express.Router();
const pool = require('./database-connection')

router.route('/').get(async (req, res) => {
    // Welcome to the mushroom house monitoring site!
    try {
        const result = await pool.query('SELECT * FROM mushroom_house_sensors ORDER BY timestamp DESC LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error('Database SELECT error:', err);
        res.status(500).send('Error retrieving data.');
    }
});

router.route('/').post(async (req, res) => {
    res.send('POST request')
})

module.exports = router;