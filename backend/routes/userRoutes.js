const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth'); 

router.get('/profile', auth, async (req, res) => {
    try {
        // Ambil ID dari token user yang sedang login (req.user.id)
        const userId = req.user.id;

        const result = await db.query(`
            SELECT id, name, email, phone, role, created_at, 
            membership_status, membership_expiry, profile_pic
            FROM users 
            WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        res.json({ success: true, data: result.rows[0] });

    } catch (err) {
        console.error("Error fetching profile:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// =================================================
// 2. GET ALL USERS (Untuk Admin)
// =================================================
// Route: GET /api/users
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