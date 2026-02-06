const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Akses ditolak! Token tidak ditemukan.' });
        }
        const token = authHeader.replace('Bearer ', '');
        const secretKey = process.env.JWT_SECRET || 'KUNCI_RAHASIA_KITA_123';
        const verified = jwt.verify(token, secretKey);
        req.user = verified;
        next();
    } catch (error) {
        console.error("❌ Auth Error:", error.message); 
        res.status(401).json({ success: false, message: 'Sesi habis atau token tidak valid. Silakan Login Ulang.' });
    }
};