const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); 

router.post('/register', authController.register);

router.post('/login', authController.login);

router.put('/update-profile', 
    auth, 
    upload.single('profile_pic'), 
    authController.updateProfile
);

router.post('/buy-membership', 
    auth, 
    upload.single('payment_proof'), 
    authController.buyMembership
);

router.get('/pending-memberships', 
    auth, 
    authController.getPendingMemberships
);

router.post('/verify-membership', 
    auth, 
    authController.verifyMembership
);

module.exports = router;