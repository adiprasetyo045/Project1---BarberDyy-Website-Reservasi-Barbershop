const db = require('../config/database');

exports.getAllServices = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM services ORDER BY id ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createService = async (req, res) => {
    try {
        const { name, price, duration, description } = req.body;

        const result = await db.query(
            'INSERT INTO services (name, price, duration, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, duration, description]
        );

        res.status(201).json({
            success: true,
            message: 'Layanan berhasil ditambahkan!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambah layanan' });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM services WHERE id = $1', [id]);
        
        res.json({ success: true, message: 'Layanan berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menghapus layanan' });
    }
};