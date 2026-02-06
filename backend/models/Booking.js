const db = require('../config/database');

const Booking = {
    // Create new booking
    async create(bookingData) {
        const { user_id, service_id, barber_id, booking_date, start_time, end_time, notes } = bookingData;
        
        const query = `
            INSERT INTO bookings 
            (user_id, service_id, barber_id, booking_date, start_time, end_time, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [user_id, service_id, barber_id, booking_date, start_time, end_time, notes];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    // Get user's bookings
    async getByUserId(userId) {
        const query = `
            SELECT b.*, s.name as service_name, s.price, br.name as barber_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN barbers br ON b.barber_id = br.id
            WHERE b.user_id = $1
            ORDER BY b.booking_date DESC, b.start_time DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    },

    // Get all bookings (for admin)
    async getAll() {
        const query = `
            SELECT b.*, 
                   u.full_name as customer_name, 
                   u.email as customer_email,
                   s.name as service_name, 
                   s.price,
                   br.name as barber_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN services s ON b.service_id = s.id
            JOIN barbers br ON b.barber_id = br.id
            ORDER BY b.booking_date DESC, b.start_time DESC
        `;
        const result = await db.query(query);
        return result.rows;
    },

    // Update booking status
    async updateStatus(id, status) {
        const query = `
            UPDATE bookings 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    },

    // Get available time slots
    async getAvailableSlots(date, barberId) {
        const query = `
            SELECT 
                wh.start_time,
                wh.end_time,
                s.duration,
                ARRAY_AGG(b.start_time) as booked_times
            FROM working_hours wh
            JOIN barbers br ON wh.barber_id = br.id
            CROSS JOIN services s
            LEFT JOIN bookings b ON b.barber_id = wh.barber_id 
                AND b.booking_date = $1 
                AND b.status NOT IN ('cancelled')
            WHERE EXTRACT(DOW FROM $1::date) = wh.day_of_week
                AND wh.barber_id = $2
                AND br.is_active = true
                AND s.is_active = true
            GROUP BY wh.start_time, wh.end_time, s.duration
        `;
        
        const result = await db.query(query, [date, barberId]);
        return result.rows;
    },

    // Check for conflicting bookings
    async checkConflict(barberId, date, startTime, endTime) {
        const query = `
            SELECT COUNT(*) as conflict_count
            FROM bookings
            WHERE barber_id = $1
                AND booking_date = $2
                AND status NOT IN ('cancelled')
                AND (
                    (start_time < $4 AND end_time > $3)
                )
        `;
        
        const result = await db.query(query, [barberId, date, startTime, endTime]);
        return parseInt(result.rows[0].conflict_count) > 0;
    }
};

module.exports = Booking;