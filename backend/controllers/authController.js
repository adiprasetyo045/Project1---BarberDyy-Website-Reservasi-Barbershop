const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail, createTemplate } = require('../services/emailService');
const JWT_SECRET = process.env.JWT_SECRET || 'KUNCI_RAHASIA_KITA_123';

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUserQuery = `
            INSERT INTO users (name, email, password, phone, role, is_member, membership_status, membership_expiry) 
            VALUES ($1, $2, $3, $4, 'user', FALSE, 'inactive', NULL) 
            RETURNING id, name, email, phone, role, profile_pic, is_member, membership_status, membership_expiry, payment_proof
        `;
        const newUser = await db.query(newUserQuery, [name, email, hashedPassword, phone]);
        const user = newUser.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ 
            success: true, message: 'Registrasi berhasil', token, user 
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mendaftar.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Email tidak ditemukan' });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password salah' });
        }
        if (user.is_member && user.membership_expiry) {
            const now = new Date();
            const expiry = new Date(user.membership_expiry);
            if (now > expiry) {
                await db.query("UPDATE users SET is_member = FALSE, membership_status = 'inactive' WHERE id = $1", [user.id]);
                user.is_member = false; 
                user.membership_status = 'inactive';
            }
        }
        await db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        const { password: _, ...userData } = user;
        res.json({ success: true, message: 'Login berhasil', token, user: userData });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, password } = req.body;
        let profilePicPath = null;
        if (req.file) {
            profilePicPath = `uploads/profiles/${req.file.filename}`;
        }
        let query = 'UPDATE users SET updated_at = NOW()';
        let params = [];
        let paramIndex = 1;

        if (name) {
            query += `, name = $${paramIndex}`;
            params.push(name);
            paramIndex++;
        }
        if (phone) {
            query += `, phone = $${paramIndex}`;
            params.push(phone);
            paramIndex++;
        }
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += `, password = $${paramIndex}`;
            params.push(hashedPassword);
            paramIndex++;
        }
        if (profilePicPath) {
            query += `, profile_pic = $${paramIndex}`;
            params.push(profilePicPath);
            paramIndex++;
        }

        query += ` WHERE id = $${paramIndex} RETURNING id, name, email, phone, role, profile_pic, is_member, membership_status`;
        params.push(userId);

        const result = await db.query(query, params);
        
        res.json({ success: true, message: 'Profil berhasil diperbarui!', user: result.rows[0] });

    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ success: false, message: 'Gagal update profil.' });
    }
};

exports.buyMembership = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) return res.status(400).json({ success: false, message: 'Wajib upload bukti pembayaran!' });

        const proofImage = req.file.filename; 

        const query = `
            UPDATE users 
            SET membership_status = 'pending', payment_proof = $1, updated_at = NOW()
            WHERE id = $2 
            RETURNING id, name, email, phone, role, profile_pic, is_member, membership_status, membership_expiry, payment_proof
        `;
        const result = await db.query(query, [proofImage, userId]);
        const updatedUser = result.rows[0];

        const userSubject = '⏳ Bukti Pembayaran Diterima';
        const userContent = `
            <h3>Halo ${updatedUser.name},</h3>
            <p>Terima kasih! Bukti pembayaran membership Anda sudah kami terima.</p>
            <div style="background: #fcf8e3; padding: 10px; border-radius: 5px; color: #8a6d3b;">
                Status: <b>MENUNGGU VERIFIKASI ADMIN</b>
            </div>
        `;
        await sendEmail(updatedUser.email, userSubject, createTemplate(userSubject, userContent));

        const adminEmail = process.env.SMTP_USER;
        if (adminEmail) {
            const adminSubject = '🔔 ALERT: Pengajuan Membership Baru!';
            const adminContent = `
                <h3>Halo Admin,</h3>
                <p>User <b>${updatedUser.name}</b> (${updatedUser.email}) baru saja mengupload bukti transfer.</p>
                <p>Silakan cek Dashboard Admin untuk verifikasi.</p>
            `;
            await sendEmail(adminEmail, adminSubject, createTemplate(adminSubject, adminContent));
        }

        res.json({ 
            success: true, 
            message: 'Bukti terkirim! Tunggu verifikasi admin.', 
            user: updatedUser,
            image: proofImage
        });

    } catch (error) {
        console.error('Membership Error:', error);
        res.status(500).json({ success: false, message: 'Gagal memproses data.' });
    }
};

exports.getPendingMemberships = async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, email, payment_proof, updated_at FROM users WHERE membership_status = 'pending' ORDER BY updated_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Pending Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
    }
};

exports.verifyMembership = async (req, res) => {
    try {
        const { userId, action } = req.body; 

        if (!userId || !['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Data tidak valid.' });
        }

        const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        
        const user = userCheck.rows[0];

        if (action === 'approve') {
            await db.query(`
                UPDATE users SET is_member = TRUE, membership_status = 'active', 
                membership_expiry = NOW() + INTERVAL '30 days', updated_at = NOW()
                WHERE id = $1
            `, [userId]);

            const subject = '🎉 Selamat! Membership BarberDyy Aktif';
            const html = `
                <h2 style="color: #27ae60;">Membership Disetujui!</h2>
                <p>Halo <b>${user.name}</b>, akun Anda kini sudah <b>PREMIUM</b> selama 30 hari.</p>
            `;
            await sendEmail(user.email, subject, createTemplate(subject, html));
            return res.json({ success: true, message: 'User berhasil di-approve!' });

        } else {
            await db.query(`
                UPDATE users SET is_member = FALSE, membership_status = 'rejected', 
                payment_proof = NULL, updated_at = NOW()
                WHERE id = $1
            `, [userId]);

            const subject = '⚠️ Pembayaran Ditolak';
            const html = `
                <h2 style="color: #c0392b;">Mohon Maaf</h2>
                <p>Halo <b>${user.name}</b>, bukti pembayaran membership Anda tidak valid. Silakan upload ulang.</p>
            `;
            await sendEmail(user.email, subject, createTemplate(subject, html));
            return res.json({ success: true, message: 'Pengajuan ditolak.' });
        }

    } catch (error) {
        console.error('Verifikasi Error:', error);
        res.status(500).json({ success: false, message: 'Gagal verifikasi.' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT id, name, email, phone, role, membership_status, created_at, last_login 
            FROM users 
            WHERE role != 'admin' 
            ORDER BY created_at DESC
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data user.' });
    }
};