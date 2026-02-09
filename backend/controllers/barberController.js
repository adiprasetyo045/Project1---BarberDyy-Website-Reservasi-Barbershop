const db = require('../config/database');

exports.getAllBarbers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM barbers ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data barber.' });
    }
};

exports.createBarber = async (req, res) => {
    try {
        const { name, specialization, experience } = req.body;
        const image = req.file ? req.file.path : null;

        if (!name || !specialization) {
            return res.status(400).json({ success: false, message: 'Nama dan Spesialisasi wajib diisi!' });
        }

        const query = `
            INSERT INTO barbers (name, specialization, experience, image) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;
        
        const result = await db.query(query, [name, specialization, experience || 0, image]);

        res.status(201).json({
            success: true,
            message: 'Barber berhasil ditambahkan!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menambah barber.' });
    }
};

exports.deleteBarber = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query('DELETE FROM barbers WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Barber tidak ditemukan.' });
        }
        
        res.json({ success: true, message: 'Barber berhasil dihapus.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus barber.' });
    }
};