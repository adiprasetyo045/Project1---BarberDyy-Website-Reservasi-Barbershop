const db = require('../config/database');

// 1. LIHAT SEMUA LAYANAN
exports.getAllServices = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM services ORDER BY id ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get Services Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2. TAMBAH LAYANAN (ADMIN)
exports.createService = async (req, res) => {
    try {
        const { name, price, duration, description } = req.body;

        // Validasi: Pastikan data penting terisi
        if (!name || !price || !duration) {
            return res.status(400).json({ success: false, message: 'Mohon lengkapi Nama, Harga, dan Durasi.' });
        }

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
        console.error("Create Service Error:", error);
        res.status(500).json({ success: false, message: 'Gagal menambah layanan' });
    }
};

// 3. HAPUS LAYANAN (ADMIN)
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM services WHERE id = $1', [id]);
        
        // Cek apakah ada data yang terhapus (rowCount > 0)
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
        }

        res.json({ success: true, message: 'Layanan berhasil dihapus' });
    } catch (error) {
        console.error("Delete Service Error:", error);
        res.status(500).json({ success: false, message: 'Gagal menghapus layanan' });
    }
};