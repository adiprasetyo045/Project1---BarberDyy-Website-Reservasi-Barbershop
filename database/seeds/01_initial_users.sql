-- Seed: Initial users (Updated for Membership Feature)
-- Created: 2024-01-31

-- 1. HAPUS DATA LAMA
DELETE FROM users;

-- 2. RESET ID SUPAYA MULAI DARI 1 LAGI
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- 3. INSERT USERS LENGKAP
-- Password Hash ('prasetyaadhi045' untuk Admin, 'password123' untuk User)
INSERT INTO users (email, password, name, phone, role, profile_pic, is_member, membership_status, membership_expiry, payment_proof) VALUES

-- 1. ADMIN UTAMA (Member Premium Aktif)
('ownerbarberdyy@gmail.com', '$2b$10$YourGeneratedHashHere...', 'Owner BarberDyy', '081234567899', 'admin', 'uploads/profiles/default.png', TRUE, 'active', NOW() + INTERVAL '1 year', NULL),

-- 2. USER BIASA (Belum Member / Inactive)
('user1@gmail.com', '$2b$10$YourGeneratedHashHere...', 'Adi User', '081200000001', 'user', 'uploads/profiles/default.png', FALSE, 'inactive', NULL, NULL),

-- 3. USER CONTOH (Pending - Pura2 sudah upload bukti)
('user2@gmail.com', '$2b$10$YourGeneratedHashHere...', 'Budi User', '081200000002', 'user', 'uploads/profiles/default.png', FALSE, 'pending', NULL, 'uploads/profiles/default_proof.jpg');

-- 4. CEK HASIL
SELECT 'Users seeded successfully' as message;
SELECT id, email, name, role, membership_status FROM users ORDER BY id;