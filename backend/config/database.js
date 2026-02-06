const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log(`✅ Database Connected: ${process.env.DB_NAME}`);
        client.release();
    } catch (err) {
        console.error('❌ Database Connection Failed:', err.message);
        process.exit(-1); 
    }
};
module.exports = { 
    query: (text, params) => pool.query(text, params), 
    testConnection,
    pool 
};