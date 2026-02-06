-- Hapus tabel lama jika ada (untuk reset bersih saat development)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabel Users (Menyimpan data pelanggan dan admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Sesuai register.html
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- Sesuai auth.js
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Barbers (Data tukang cukur)
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100), -- [UBAH] bio jadi specialization (biar sama kayak seed)
    image VARCHAR(255) DEFAULT 'assets/images/default-barber.jpg', -- [UBAH] photo_url jadi image
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Services (Layanan potong rambut)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL, -- [UBAH] duration_minutes jadi duration (biar simpel)
    image VARCHAR(255) DEFAULT 'assets/images/default-service.jpg', -- [UBAH] image_url jadi image
    is_active BOOLEAN DEFAULT true
);

-- 4. Tabel Working Hours (Jadwal kerja barber per hari)
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Minggu, 1=Senin, dst.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_day_off BOOLEAN DEFAULT false,
    UNIQUE(barber_id, day_of_week)
);

-- 5. Tabel Bookings (Transaksi reservasi)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    barber_id INTEGER REFERENCES barbers(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL, -- Sesuai booking.js
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled')),
    notes TEXT,
    total_price DECIMAL(10, 2) NOT NULL, -- Penting untuk riwayat harga
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk optimasi query (Ini sudah mantap!)
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_barber ON bookings(barber_id);