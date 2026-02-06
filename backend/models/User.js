const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // 1. MENCARI USER BERDASARKAN EMAIL
    static async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0];
    }

    // 2. MENCARI USER BERDASARKAN ID
    static async findById(id) {
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0];
    }

    // 3. MEMBUAT USER BARU (REGISTER)
    static async create({ name, email, password, phone }) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Default Values
        const role = 'user';
        const profile_pic = 'uploads/profiles/default.png';
        const is_member = false;
        const membership_status = 'inactive';
        const membership_expiry = null;
        const payment_proof = null;

        const query = `
            INSERT INTO users (
                name, email, password, phone, role, 
                profile_pic, is_member, membership_status, membership_expiry, payment_proof
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, name, email, phone, role, profile_pic, is_member, membership_status
        `;
        
        const values = [
            name, email, hashedPassword, phone, role, 
            profile_pic, is_member, membership_status, membership_expiry, payment_proof
        ];

        const { rows } = await db.query(query, values); 
        return rows[0];
    }

    // 4. UPDATE DATA USER (FITUR TAMBAHAN)
    // Fungsi ini sangat berguna untuk Admin atau saat User upload bukti
    static async update(id, data) {
        // Kita buat query dinamis agar bisa update field apa saja
        const keys = Object.keys(data);
        const values = Object.values(data);

        if (keys.length === 0) return null;

        // Membuat string query: "name = $1, phone = $2, ..."
        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        
        // Menambahkan ID ke array values terakhir
        values.push(id);

        const query = `
            UPDATE users 
            SET ${setClause} 
            WHERE id = $${values.length} 
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = User;