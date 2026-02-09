const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const handleProfileUpload = (req, res, next) => {
    upload.single('profile_pic')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: 'Gagal Upload Profil: ' + err.message });
        }
        next();
    });
};
const handlePaymentUpload = (req, res, next) => {
    upload.single('payment_proof')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: 'Gagal Upload Bukti: ' + err.message });
        }
        next();
    });
};
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/update-profile', auth, handleProfileUpload, authController.updateProfile);
router.post('/buy-membership', auth, handlePaymentUpload, authController.buyMembership);
router.get('/pending-memberships', auth, authController.getPendingMemberships);
router.post('/verify-membership', auth, authController.verifyMembership);
router.get('/', auth, authController.getAllUsers);
module.exports = router;