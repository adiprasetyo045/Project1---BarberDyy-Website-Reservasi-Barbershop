const multer = require('multer');
const path = require('path');
const os = require('os'); // ✅ Import OS untuk akses folder tmp sistem

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // ✅ PERBAIKAN VERCEL:
        // Jangan simpan di folder project ('../uploads') karena Vercel Read-Only.
        // Gunakan folder temporary sistem operasi ('/tmp').
        const uploadPath = os.tmpdir();
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Hapus spasi di nama file biar aman
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
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
    fileFilter: fileFilter
});

module.exports = upload;