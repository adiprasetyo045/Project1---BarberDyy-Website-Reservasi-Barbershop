-- Seed: Initial working hours
-- Created: 2024-01-15

-- Clear existing working hours
DELETE FROM working_hours;

-- Reset sequence
ALTER SEQUENCE working_hours_id_seq RESTART WITH 1;

-- Insert working hours for all barbers
DO $$
DECLARE
    barber RECORD;
BEGIN
    FOR barber IN SELECT id FROM barbers LOOP
        
        -- Kita buat Toko Buka SETIAP HARI (Senin-Minggu / 0-6)
        -- Jam: 10:00 - 21:00 (Sesuai Frontend booking.js)
        FOR day IN 0..6 LOOP
            INSERT INTO working_hours (day_of_week, start_time, end_time, barber_id)
            VALUES (day, '10:00:00', '21:00:00', barber.id);
        END LOOP;

    END LOOP;
END $$;

-- Verify insertion
SELECT 'Working hours seeded:' as message;
SELECT 
    wh.id,
    b.name as barber,
    CASE wh.day_of_week 
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END as day,
    wh.start_time,
    wh.end_time
FROM working_hours wh
JOIN barbers b ON wh.barber_id = b.id
ORDER BY b.name, wh.day_of_week;