const express = require('express');
const router = express.Router();

router.route('/').get((req, res) => {
    res.send('Hallo from server.');
})

// GET ./data - Return recent sensor readings
router.route('/data').get(async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mushroom_house_sensors ORDER BY timestamp DESC LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data.');
    }
});

module.exports = router;