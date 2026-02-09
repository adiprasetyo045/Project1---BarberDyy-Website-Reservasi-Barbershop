const db = require('../config/database');

// 1. AMBIL SEMUA DATA BARBER
exports.getAllBarbers = async (req, res) => {
    try {
        // Mengambil data urut dari yang terbaru (ID terbesar)
        const result = await db.query('SELECT * FROM barbers ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get Barbers Error:", error); // 👇 PENTING: Biar kelihatan errornya di terminal
        res.status(500).json({ success: false, message: 'Gagal mengambil data barber.' });
    }
};

// 2. TAMBAH BARBER BARU (Dengan Upload Foto)
exports.createBarber = async (req, res) => {
    try {
        const { name, specialization, experience } = req.body;
        
        // Cek apakah ada file gambar yang diupload via Cloudinary
        // req.file.path biasanya berisi URL Cloudinary (https://res.cloudinary...)
        const image = req.file ? req.file.path : null; 

        // Validasi Input
        if (!name || !specialization) {
            return res.status(400).json({ success: false, message: 'Nama dan Spesialisasi wajib diisi!' });
        }

        // Query Insert
        // Pastikan tabel 'barbers' di database Neon sudah punya kolom 'image'
        const query = `
            INSERT INTO barbers (name, specialization, experience, image) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;
        
        // experience || 0 artinya kalau kosong diisi 0 tahun
        const result = await db.query(query, [name, specialization, experience || 0, image]);

        res.status(201).json({
            success: true,
            message: 'Barber berhasil ditambahkan!',
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Create Barber Error:", error); // 👇 PENTING: Debugging
        res.status(500).json({ success: false, message: 'Gagal menambah barber.' });
    }
};

// 3. HAPUS BARBER
exports.deleteBarber = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query('DELETE FROM barbers WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Barber tidak ditemukan.' });
        }
        
        res.json({ success: true, message: 'Barber berhasil dihapus.' });

    } catch (error) {
        console.error("Delete Barber Error:", error); // 👇 PENTING: Debugging
        res.status(500).json({ success: false, message: 'Gagal menghapus barber.' });
    }
};