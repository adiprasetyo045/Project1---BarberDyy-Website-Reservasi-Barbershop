const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0];
    }

    static async findById(id) {
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0];
    }

    static async create({ name, email, password, phone }) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (
                name, email, password, phone, role, 
                profile_pic, is_member, membership_status, membership_expiry, payment_proof
            )
            VALUES ($1, $2, $3, $4, 'user', NULL, FALSE, 'inactive', NULL, NULL)
            RETURNING id, name, email, phone, role, profile_pic, is_member, membership_status
        `;
        
        const { rows } = await db.query(query, [name, email, hashedPassword, phone]); 
        return rows[0];
    }

    static async update(id, data) {
        const keys = Object.keys(data);
        if (keys.length === 0) return null;

        const values = keys.map(key => data[key]);
        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        
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