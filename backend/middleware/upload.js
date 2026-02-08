const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Import OS untuk mendeteksi folder temporary sistem

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // ✅ PENTING UNTUK VERCEL:
        // Kita tidak boleh menulis di root folder project ('../uploads').
        // Kita harus gunakan folder temporary sistem ('/tmp' di Linux/Vercel).
        
        let uploadPath = os.tmpdir(); // Otomatis mendeteksi folder /tmp

        // (Opsional) Jika ingin merapikan, bisa buat subfolder di dalam /tmp
        // Tapi untuk Vercel, simpan flat saja biar aman & tidak error permission.
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Ganti spasi dengan strip biar link tidak putus
        const cleanName = file.originalname.replace(/\s+/g, '-');
        const prefix = file.fieldname === 'payment_proof' ? 'transaksi' : 'profile';
        
        cb(null, prefix + '-' + uniqueSuffix + path.extname(cleanName));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
    fileFilter: fileFilter
});

module.exports = upload;