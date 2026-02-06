-- Hapus semua booking yang error/hantu
DELETE FROM bookings;

-- Reset nomor ID booking biar mulai dari 1 lagi
ALTER SEQUENCE bookings_id_seq RESTART WITH 1;