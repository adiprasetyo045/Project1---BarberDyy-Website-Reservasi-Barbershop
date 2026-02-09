const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// 👇 FUNGSI RAHASIA: PEMBURU ERROR UPLOAD
// Fungsi ini akan menangkap error "Object Object" dan memaksanya bicara jujur!
const uploadMiddleware = (req, res, next) => {
    const uploadFunc = upload.single('profile_pic');
    
    uploadFunc(req, res, (err) => {
        if (err) {
            console.error("======================================");
            console.error("❌ ERROR UPLOAD TERTANGKAP (DETAIL):");
            // Cek apakah errornya dari Cloudinary atau Multer
            if (err.message) console.error("Pesan:", err.message);
            if (err.http_code) console.error("HTTP Code:", err.http_code);
            console.error("Full Error:", JSON.stringify(err, null, 2));
            console.error("======================================");

            return res.status(500).json({ 
                success: false, 
                message: 'Gagal Upload ke Cloudinary: ' + (err.message || JSON.stringify(err)) 
            });
        }
        next();
    });
};

// Hal yang sama untuk bukti pembayaran
const uploadPaymentMiddleware = (req, res, next) => {
    const uploadFunc = upload.single('payment_proof');
    uploadFunc(req, res, (err) => {
        if (err) {
            console.error("❌ ERROR UPLOAD PAYMENT:", JSON.stringify(err, null, 2));
            return res.status(500).json({ success: false, message: 'Gagal Upload Bukti: ' + err.message });
        }
        next();
    });
};

// === DAFTAR RUTE ===
router.post('/register', authController.register);
router.post('/login', authController.login);

// 👇 KITA PAKAI MIDDLEWARE BARU DI SINI
router.put('/update-profile', auth, uploadMiddleware, authController.updateProfile);
router.post('/buy-membership', auth, uploadPaymentMiddleware, authController.buyMembership);

router.post('/verify-membership', auth, authController.verifyMembership);
router.get('/pending-memberships', auth, authController.getPendingMemberships);
router.get('/', auth, authController.getAllUsers);

module.exports = router;