-- ====================================================
-- 1. DROP TABLE LAMA (Agar bersih)
-- ====================================================
DROP TABLE IF EXISTS barbers CASCADE;

-- ====================================================
-- 2. BUAT FUNGSI UPDATE TIMESTAMP (Solusi Error Function Missing)
-- ====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================================
-- 3. BUAT TABEL BARBERS BARU (Dengan kolom experience)
-- ====================================================
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    experience INTEGER DEFAULT 0, -- Kolom baru experience
    image VARCHAR(255), 
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- 4. BUAT INDEX & TRIGGER
-- ====================================================
CREATE INDEX idx_barbers_active ON barbers(is_active);
CREATE INDEX idx_barbers_name ON barbers(name);

CREATE TRIGGER update_barbers_updated_at 
    BEFORE UPDATE ON barbers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- 5. ISI DATA AWAL (SEED)
-- ====================================================
INSERT INTO barbers (name, specialization, experience, image) VALUES
('Andi Saputra', 'Senior Stylist', 5, 'assets/images/ahmad-nasukha.jpg'),
('Budi Santoso', 'Beard & Fade Expert', 3, 'assets/images/hafiz-nur-syafiq.jpg'),
('Citra Dewi', 'Coloring Specialist', 4, 'assets/images/Adi-nur-khalifah.jpg');