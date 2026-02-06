-- Seed: Sample bookings
-- Created: 2024-01-15

-- Clear existing bookings
DELETE FROM bookings;

-- Reset sequence
ALTER SEQUENCE bookings_id_seq RESTART WITH 1;

-- Helper function to get random date within range
CREATE OR REPLACE FUNCTION random_date(start_date DATE, end_date DATE)
RETURNS DATE AS $$
BEGIN
    RETURN start_date + (random() * (end_date - start_date))::INT;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get random time between hours
CREATE OR REPLACE FUNCTION random_time(start_hour INT, end_hour INT)
RETURNS TIME AS $$
DECLARE
    hour INT;
    minute INT;
BEGIN
    hour := floor(random() * (end_hour - start_hour + 1)) + start_hour;
    minute := floor(random() * 4) * 15; -- 0, 15, 30, or 45 minutes
    RETURN make_time(hour, minute, 0);
END;
$$ LANGUAGE plpgsql;

-- Generate sample bookings
DO $$
DECLARE
    user_ids INT[];
    service_ids INT[];
    barber_ids INT[];
    i INT;
    booking_date DATE;
    booking_time TIME; 
    
    -- Variabel harga
    v_price DECIMAL(10,2); 
    
    status TEXT;
    -- [PERBAIKAN] Ubah 'cancelled' jadi 'canceled' (satu L) sesuai schema.sql
    status_options TEXT[] := ARRAY['pending', 'confirmed', 'completed', 'canceled'];
    status_weights INT[] := ARRAY[10, 30, 50, 10]; 
    total_weight INT;
    random_weight INT;
    cumulative_weight INT;
    selected_service_id INT;
BEGIN
    -- Get IDs
    SELECT array_agg(id) INTO user_ids FROM users WHERE role = 'user';
    SELECT array_agg(id) INTO service_ids FROM services;
    SELECT array_agg(id) INTO barber_ids FROM barbers;
    
    -- Calculate total weight for status
    total_weight := 0;
    FOR i IN 1..array_length(status_weights, 1) LOOP
        total_weight := total_weight + status_weights[i];
    END LOOP;
    
    -- Generate 50 sample bookings
    FOR i IN 1..50 LOOP
        booking_date := random_date(CURRENT_DATE, CURRENT_DATE + 30);
        booking_time := random_time(10, 20);
        
        selected_service_id := service_ids[floor(random() * array_length(service_ids, 1)) + 1];
        
        -- Ambil harga
        SELECT price INTO v_price
        FROM services 
        WHERE id = selected_service_id;
        
        -- Logic status random
        random_weight := floor(random() * total_weight);
        cumulative_weight := 0;
        
        FOR j IN 1..array_length(status_options, 1) LOOP
            cumulative_weight := cumulative_weight + status_weights[j];
            IF random_weight < cumulative_weight THEN
                status := status_options[j];
                EXIT;
            END IF;
        END LOOP;
        
        -- INSERT
        INSERT INTO bookings (
            user_id, service_id, barber_id, booking_date, booking_time, total_price, status, notes
        ) VALUES (
            user_ids[floor(random() * array_length(user_ids, 1)) + 1],
            selected_service_id,
            barber_ids[floor(random() * array_length(barber_ids, 1)) + 1],
            booking_date,
            booking_time,
            v_price, 
            status, -- Sekarang isinya pasti cocok ('canceled' dgn 1 L)
            CASE 
                WHEN random() < 0.3 THEN 'Tolong jangan terlalu pendek'
                WHEN random() < 0.6 THEN 'Mau buru-buru ya mas'
                ELSE NULL
            END
        );
    END LOOP;
END $$;

-- Clean up helper functions
DROP FUNCTION random_date(DATE, DATE);
DROP FUNCTION random_time(INT, INT);

-- Verify insertion
SELECT 'Sample bookings seeded:' as message;
SELECT 
    b.id,
    u.name as customer,
    s.name as service,
    b.booking_date,
    b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN services s ON b.service_id = s.id
ORDER BY b.booking_date DESC
LIMIT 5;