const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = '';

        if (file.fieldname === 'profile_pic') {
            uploadPath = path.join(__dirname, '../uploads/profiles');
        } else if (file.fieldname === 'payment_proof') {
            uploadPath = path.join(__dirname, '../uploads/transaksi');
        } else {
            uploadPath = path.join(__dirname, '../uploads/others');
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'payment_proof' ? 'transaksi' : 'profile';
        
        cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
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
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: fileFilter
});

module.exports = upload;