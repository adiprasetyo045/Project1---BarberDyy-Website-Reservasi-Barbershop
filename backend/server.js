const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import Database & Routes
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const barberRoutes = require('./routes/barberRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes'); 

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================
// 1. MIDDLEWARE UTAMA (Wajib Paling Atas)
// =========================================
app.use(helmet({ 
    contentSecurityPolicy: false, 
    crossOriginResourcePolicy: false 
})); 
app.use(cors());   
app.use(morgan('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// =========================================
// 2. API ROUTES (🔥 PRIORITAS UTAMA 🔥)
// =========================================
// Taruh ini SEBELUM express.static supaya request API tidak dianggap cari file.
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes); 

// =========================================
// 3. STATIC FILES (Frontend & Uploads)
// =========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use(express.static(path.join(__dirname, '../frontend')));

// =========================================
// 4. HALAMAN HTML MANUAL
// =========================================
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

// =========================================
// 5. ERROR HANDLER (404)
// =========================================
app.use((req, res) => {
    // Kalau yang minta adalah browser (HTML), kasih halaman 404 cantik
    if (req.accepts('html')) {
        const errorPage = path.join(__dirname, '../frontend/404.html');
        res.status(404).sendFile(errorPage, (err) => {
            if (err) res.send("<h1>404 - Halaman Tidak Ditemukan</h1>");
        });
    } else {
        // Kalau yang minta adalah API (JSON), kasih pesan JSON
        res.status(404).json({ success: false, message: "API endpoint tidak ditemukan" });
    }
});

// =========================================
// 6. JALANKAN SERVER
// =========================================
app.listen(PORT, async () => {
    try {
        await db.query('SELECT NOW()'); 
        console.log(`✅ Database Connected!`);
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    } catch (error) {
        console.error('❌ Database Failed:', error.message);
    }
});