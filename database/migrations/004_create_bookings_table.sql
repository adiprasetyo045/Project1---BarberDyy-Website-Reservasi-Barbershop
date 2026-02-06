-- 1. HAPUS TABEL LAMA (BERSIH-BERSIH)
-- 'CASCADE' akan otomatis menghapus trigger/relasi yang nempel di tabel ini
DROP TABLE IF EXISTS bookings CASCADE;

-- 2. BUAT ULANG TABEL DENGAN STRUKTUR BENAR (Ada total_price)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    barber_id INT REFERENCES barbers(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- INI KOLOM YANG TADI BIKIN ERROR (SEKARANG SUDAH ADA)
    total_price DECIMAL(10, 2) DEFAULT 0, 
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PASANG ULANG INDEX (Supaya cepat)
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_barber_id ON bookings(barber_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 4. PASANG ULANG TRIGGER UPDATE TIMESTAMP
-- (Pastikan fungsi 'update_updated_at_column' sudah ada di database)
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. PASANG ULANG TRIGGER CEK BENTROK (OVERLAP)
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE barber_id = NEW.barber_id
        AND booking_date = NEW.booking_date
        AND status NOT IN ('cancelled', 'rejected')
        AND id != COALESCE(NEW.id, -1)
        AND (
            (booking_time < NEW.end_time AND end_time > NEW.booking_time)
        )
    ) THEN
        RAISE EXCEPTION 'Maaf, Barber ini sudah dibooking pada jam tersebut.';
    END IF;
    return NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_booking_overlap_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION check_booking_overlap();