const { Pool } = require('pg');
require('dotenv').config();

// Cek apakah di .env isinya DB_SSL=true (buat Neon)
const isSSL = process.env.DB_SSL === 'true';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // 👇 INI KUNCINYA: Kalau pakai Neon, aktifkan SSL-nya
    ssl: isSSL ? { rejectUnauthorized: false } : false
});

// Tes koneksi biar ketahuan kalau error
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error koneksi database:', err.message);
    } else {
        console.log('✅ Berhasil terhubung ke Database Neon!');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};