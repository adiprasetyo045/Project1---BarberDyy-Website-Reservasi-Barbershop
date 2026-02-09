const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Konfigurasi Cloudinary (Mengambil kunci dari Vercel Environment Variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Setting Penyimpanan Langsung ke Cloud
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberdyy-uploads', // Nama folder yang akan dibuat di Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Format yang diizinkan
        // Opsi Transformasi (Otomatis resize gambar biar hemat kuota & cepat loading)
        transformation: [{ width: 500, height: 500, crop: 'limit' }] 
    }
});

// 3. Filter File (Validasi tipe file)
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
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal ukuran file 5MB
    fileFilter: fileFilter
});

module.exports = upload;