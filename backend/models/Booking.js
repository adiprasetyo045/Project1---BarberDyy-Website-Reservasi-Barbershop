const db = require('../config/database');

const Booking = {
    // 1. Create new booking
    async create(bookingData) {
        const { user_id, service_id, barber_id, booking_date, start_time, end_time, payment_method, payment_proof, status } = bookingData;
        
        // Default status jika tidak ada
        const bookingStatus = status || 'pending';

        const query = `
            INSERT INTO bookings 
            (user_id, service_id, barber_id, booking_date, start_time, end_time, payment_method, payment_proof, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const values = [user_id, service_id, barber_id, booking_date, start_time, end_time, payment_method, payment_proof, bookingStatus];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw err;
        }
    },

    // 2. Get user's bookings (History)
    async getByUserId(userId) {
        const query = `
            SELECT 
                b.id, b.booking_date, b.start_time, b.status, b.payment_method,
                s.name as service_name, s.price, s.duration,
                br.name as barber_name, br.image as barber_image
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN barbers br ON b.barber_id = br.id
            WHERE b.user_id = $1
            ORDER BY b.booking_date DESC, b.start_time DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    },

    // 3. Get all bookings (For Admin Dashboard)
    async getAll() {
        const query = `
            SELECT 
                b.*, 
                u.name as customer_name, 
                u.email as customer_email,
                u.phone as customer_phone,
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

    // 4. Update booking status (Approve/Reject/Complete)
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

    // 5. Get Booked Slots (PENTING: Ini yang dipakai frontend booking.js)
    // Mengambil daftar jam yang SUDAH terisi untuk barber tertentu di tanggal tertentu
    async getBookedSlots(date, barberId) {
        const query = `
            SELECT start_time 
            FROM bookings 
            WHERE barber_id = $1 
            AND booking_date = $2 
            AND status NOT IN ('cancelled', 'rejected')
        `;
        
        const result = await db.query(query, [barberId, date]);
        
        // Mengembalikan array jam saja, misal: ['10:00:00', '14:00:00']
        return result.rows.map(row => row.start_time);
    },

    // 6. Check for conflicting bookings (Validasi Ganda)
    // Pastikan tidak ada booking yang tumpang tindih sebelum insert
    async checkConflict(barberId, date, startTime, endTime) {
        const query = `
            SELECT COUNT(*) as conflict_count
            FROM bookings
            WHERE barber_id = $1
                AND booking_date = $2
                AND status NOT IN ('cancelled', 'rejected')
                AND (
                    (start_time < $4 AND end_time > $3)
                )
        `;
        
        const result = await db.query(query, [barberId, date, startTime, endTime]);
        return parseInt(result.rows[0].conflict_count) > 0;
    }
};

module.exports = Booking;