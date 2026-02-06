-- Migration: Create working_hours table
-- Created: 2024-01-15

-- UP Migration
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Minggu, 1=Senin, dst
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    barber_id INT REFERENCES barbers(id) ON DELETE CASCADE,
    UNIQUE(day_of_week, barber_id)
);

-- Create indexes
CREATE INDEX idx_working_hours_barber_id ON working_hours(barber_id);
CREATE INDEX idx_working_hours_day ON working_hours(day_of_week);

-- Insert default working hours
-- Kita set jam 10:00 - 21:00 (Agar booking jam 20:00 masih bisa selesai jam 21:00)
DO $$
DECLARE
    barber RECORD;
BEGIN
    FOR barber IN SELECT id FROM barbers LOOP
        
        -- Senin (1) sampai Minggu (0/7) -> Anggap buka setiap hari
        -- Loop 0..6 artinya buka Senin-Minggu
        FOR day IN 0..6 LOOP
            INSERT INTO working_hours (day_of_week, start_time, end_time, barber_id)
            VALUES (day, '10:00:00', '21:00:00', barber.id);
        END LOOP;

    END LOOP;
END $$;

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS working_hours;