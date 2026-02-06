-- Migration: Create holidays table
-- Created: 2024-01-15

-- UP Migration
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_holidays_date ON holidays(date);

-- Insert sample holidays for 2026 (Updated)
INSERT INTO holidays (date, reason) VALUES
('2026-01-01', 'Tahun Baru Masehi'),
('2026-04-03', 'Wafat Isa Al Masih'), -- Good Friday 2026
('2026-05-01', 'Hari Buruh'),
('2026-08-17', 'Hari Kemerdekaan RI'),
('2026-12-25', 'Hari Raya Natal');

-- Create function to check if date is a holiday
CREATE OR REPLACE FUNCTION is_holiday(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM holidays WHERE date = check_date);
END;
$$ LANGUAGE plpgsql;

-- Create function to get next working day
CREATE OR REPLACE FUNCTION get_next_working_day(barber_id INT, from_date DATE)
RETURNS DATE AS $$
DECLARE
    next_date DATE;
    day_counter INT := 0;
BEGIN
    next_date := from_date;
    
    -- Loop maksimal 30 hari ke depan untuk mencari hari kerja
    WHILE day_counter < 30 LOOP
        next_date := next_date + 1;
        day_counter := day_counter + 1;
        
        -- Cek apakah hari tersebut ada di working_hours DAN bukan hari libur
        IF EXISTS (
            SELECT 1 FROM working_hours wh 
            WHERE wh.barber_id = $1 
            AND wh.day_of_week = EXTRACT(DOW FROM next_date)
        ) AND NOT is_holiday(next_date) THEN
            RETURN next_date;
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- DOWN Migration (for rollback)
-- DROP FUNCTION IF EXISTS get_next_working_day(INT, DATE);
-- DROP FUNCTION IF EXISTS is_holiday(DATE);
-- DROP TABLE IF EXISTS holidays;