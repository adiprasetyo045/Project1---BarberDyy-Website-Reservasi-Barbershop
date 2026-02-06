-- ====================================================
-- 1. HAPUS TABEL LAMA & BERSIHKAN RELASI
-- ====================================================
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ====================================================
-- 2. BUAT TABEL USERS BARU (VERSI FINAL FITUR MEMBER)
-- ====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_pic TEXT DEFAULT 'uploads/profiles/default.png',
    
    -- KOLOM MEMBERSHIP LENGKAP
    is_member BOOLEAN DEFAULT FALSE,             -- Akses fitur (TRUE/FALSE)
    membership_expiry TIMESTAMP NULL,            -- Tanggal habis
    membership_status VARCHAR(20) DEFAULT 'inactive', -- inactive, pending, active, rejected
    payment_proof TEXT DEFAULT NULL,             -- Path foto bukti bayar
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- 3. BUAT TABEL PENDUKUNG (Agar tidak error saat seed)
-- ====================================================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INT DEFAULT 30, 
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    experience INT DEFAULT 0,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    barber_id INT REFERENCES barbers(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- 4. BUAT TRIGGER UPDATE JAM
-- ====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();