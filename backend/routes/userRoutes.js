const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth'); 
router.get('/', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, name, email, phone, role, created_at, 
            membership_status, last_login 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
module.exports = router;