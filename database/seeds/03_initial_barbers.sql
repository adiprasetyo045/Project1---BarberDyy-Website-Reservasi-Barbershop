-- Seed: Initial barbers
-- Created: 2024-01-15

-- Clear existing barbers
DELETE FROM barbers;

-- Reset sequence
ALTER SEQUENCE barbers_id_seq RESTART WITH 1;

-- Insert barbers
-- PERBAIKAN: Kolom 'photo_url' diganti 'image' dan data disesuaikan dengan booking.js
INSERT INTO barbers (name, specialization, image) VALUES
-- Barber Utama (Sesuai Frontend)
('Andi Saputra', 'Classic & Modern Cuts', 'assets/images/ahmad-nasukha.jpg'),
('Budi Santoso', 'Beard Specialist', 'assets/images/hafiz-nur-syafiq.jpg'),
('Citra Dewi', 'Color & Styling Expert', 'assets/images/Adi-nur-khalifah.jpg'),

-- Barber Tambahan (Opsional, pakai gambar default biar aman)
('David Professional', 'Fade Master', 'assets/images/default-barber.jpg'),
('Alex Young', 'Kids Haircut Specialist', 'assets/images/default-barber.jpg');

-- Verify insertion
SELECT 'Barbers seeded:' as message;
SELECT id, name, specialization, image FROM barbers ORDER BY id;