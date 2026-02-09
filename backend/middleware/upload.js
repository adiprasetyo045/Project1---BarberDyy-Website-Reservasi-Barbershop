const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// 👇 Tambahan: Pastikan env vars terbaca
require('dotenv').config();

// 👇 --- AREA DIAGNOSA (CCTV) ---
// Cek Log Vercel setelah upload file. Kalau isinya "❌ KOSONG", berarti settingan Vercel belum benar.
console.log("========================================");
console.log("🔍 CEK KONEKSI CLOUDINARY (upload.js):");
console.log("1. CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? `✅ Terbaca (${process.env.CLOUDINARY_CLOUD_NAME})` : "❌ KOSONG/TIDAK TERBACA");
console.log("2. API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Terbaca (Disensor)" : "❌ KOSONG/TIDAK TERBACA");
console.log("3. API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Terbaca (Disensor)" : "❌ KOSONG/TIDAK TERBACA");
console.log("========================================");
// 👆 --- BATAS AREA DIAGNOSA ---

// 1. Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Setting Penyimpanan Langsung ke Cloud
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberdyy-uploads', // Nama folder di Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }] 
    }
});

// 3. Filter File
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
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