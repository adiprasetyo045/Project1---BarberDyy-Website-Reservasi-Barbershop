const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 👇 PERBAIKAN TYPO: Huruf 'l' (el) bukan angka '1'
cloudinary.config({
    cloud_name: 'ds0uzbxl8', // <--- SUDAH DIPERBAIKI (Huruf L kecil)
    api_key: '737677695786219', 
    api_secret: '7cRFvjM_uWdT-f0Pgc0eQtezS_g' 
});

console.log("✅ CLOUDINARY CONFIG LOADED MANUALLY (FIXED TYPO)");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberdyy-uploads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }] 
    }
});

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
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;