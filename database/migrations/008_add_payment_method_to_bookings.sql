-- Migration: Add payment details to bookings table
-- Created: 2026-02-01
-- Updated: Menambahkan kolom untuk bukti transfer dan detail pengirim

-- UP Migration
-- Menggunakan IF NOT EXISTS agar tidak error jika dijalankan ulang
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'offline', -- 'offline' atau 'online'
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50), -- Nama Bank / E-Wallet (misal: BCA, Dana)
ADD COLUMN IF NOT EXISTS payment_account VARCHAR(50),  -- Nomor Rekening / HP Pengirim
ADD COLUMN IF NOT EXISTS payment_proof VARCHAR(255);   -- Path file gambar bukti transfer

-- DOWN Migration (Rollback)
-- ALTER TABLE bookings 
-- DROP COLUMN IF EXISTS payment_method,
-- DROP COLUMN IF EXISTS payment_provider,
-- DROP COLUMN IF EXISTS payment_account,
-- DROP COLUMN IF EXISTS payment_proof;