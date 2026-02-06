const db = require('../config/database');
const { sendEmail, createTemplate } = require('../services/emailService');

exports.getAllBookings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                b.id, 
                u.name as customer, u.phone as user_phone, u.email as user_email,
                s.name as service_name,
                br.name as barber_name,
                b.booking_date, b.booking_time, b.end_time,
                b.total_price, b.status, b.payment_method,
                b.payment_provider, b.payment_account, b.payment_proof
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN services s ON b.service_id = s.id
            LEFT JOIN barbers br ON b.barber_id = br.id
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("❌ Error Admin Dashboard:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        let { status } = req.body; 
        
        if (status === 'canceled') status = 'cancelled'; 

        const result = await db.query(
            "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        
        res.json({ success: true, message: 'Status berhasil diperbarui', data: result.rows[0] });
    } catch (err) {
        console.error("Error Update:", err.message);
        res.status(500).json({ success: false, message: 'Gagal update status: ' + err.message });
    }
};

exports.getNotificationCount = async (req, res) => {
    try {
        const result = await db.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
        const count = parseInt(result.rows[0].count);
        res.json({ success: true, count });
    } catch (err) {
        console.error("Error Notification:", err.message);
        res.status(500).json({ success: false, count: 0 });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { service_id, barber_id, booking_date, booking_time, notes, payment_method, payment_provider, payment_account } = req.body;
        const user_id = req.user.id; 
        
        const payment_proof = req.file ? `uploads/transaksi/${req.file.filename}` : null;

        if (!service_id || !barber_id || !booking_date || !booking_time) {
            return res.status(400).json({ success: false, message: 'Data booking utama tidak lengkap.' });
        }

        const serviceResult = await db.query('SELECT price, name, duration FROM services WHERE id = $1', [service_id]);
        if (serviceResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
        
        const { price, name: service_name, duration } = serviceResult.rows[0];

        const [hours, minutes] = booking_time.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0);
        const endDate = new Date(startDate.getTime() + (duration * 60000));
        const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;

        const check = await db.query(
            `SELECT * FROM bookings 
             WHERE barber_id = $1 AND booking_date = $2 
             AND status NOT IN ('cancelled', 'canceled')
             AND ((booking_time < $4 AND end_time > $3))`, 
            [barber_id, booking_date, booking_time, end_time]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Barber sibuk di jam tersebut.' });
        }

        const finalMethod = payment_method || 'offline';
        const newBooking = await db.query(
            `INSERT INTO bookings 
            (user_id, service_id, barber_id, booking_date, booking_time, end_time, status, total_price, notes, payment_method, payment_provider, payment_account, payment_proof) 
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10, $11, $12) 
             RETURNING *`,
            [user_id, service_id, barber_id, booking_date, booking_time, end_time, price, notes, finalMethod, 
             finalMethod === 'online' ? payment_provider : null, 
             finalMethod === 'online' ? payment_account : null, 
             payment_proof]
        );

        res.status(201).json({ success: true, message: 'Booking Berhasil!', data: newBooking.rows[0] });

    } catch (err) {
        console.error("❌ Error Create Booking:", err);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT b.*, s.name as service_name, s.price as service_price, bar.name as barber_name 
             FROM bookings b 
             LEFT JOIN services s ON b.service_id = s.id 
             LEFT JOIN barbers bar ON b.barber_id = bar.id 
             WHERE b.user_id = $1 
             ORDER BY b.booking_date DESC, b.booking_time DESC`, 
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal ambil history' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        const check = await db.query("SELECT * FROM bookings WHERE id = $1 AND user_id = $2", [bookingId, userId]);
        if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
        
        await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [bookingId]);
        res.json({ success: true, message: 'Booking berhasil dibatalkan.' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal membatalkan booking.' });
    }
};

exports.getBookedSlots = async (req, res) => {
    try {
        const { barber_id, date } = req.query;
        const result = await db.query(
            "SELECT booking_time FROM bookings WHERE barber_id=$1 AND booking_date=$2 AND status NOT IN ('cancelled', 'canceled')",
            [barber_id, date]
        );
        res.json({ success: true, data: result.rows.map(r => r.booking_time.slice(0, 5)) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error check slots' });
    }
};