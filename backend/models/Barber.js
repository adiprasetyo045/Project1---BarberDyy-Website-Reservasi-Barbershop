const db = require('../config/database');
const Barber = {
    async getAll() {
        try {
            const query = 'SELECT * FROM barbers WHERE is_active = true ORDER BY name';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting all barbers:', error);
            throw error;
        }
    },
    async getById(id) {
        try {
            const query = 'SELECT * FROM barbers WHERE id = $1 AND is_active = true';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting barber by ID:', error);
            throw error;
        }
    },
    async getWithWorkingHours(id) {
        try {
            const query = `
                SELECT b.*, 
                        json_agg(
                            json_build_object(
                                'day_of_week', wh.day_of_week,
                                'start_time', wh.start_time,
                                'end_time', wh.end_time
                            )
                        ) as working_hours
                FROM barbers b
                LEFT JOIN working_hours wh ON b.id = wh.barber_id
                WHERE b.id = $1 AND b.is_active = true
                GROUP BY b.id
            `;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting barber with working hours:', error);
            throw error;
        }
    },
    async create(barberData) {
        try {
            const { name, specialization, photo_url } = barberData;
            
            const query = `
                INSERT INTO barbers (name, specialization, photo_url)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const values = [name, specialization || null, photo_url || null];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating barber:', error);
            throw error;
        }
    },
    async update(id, updates) {
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 1;
            if (updates.name !== undefined) {
                updateFields.push(`name = $${paramCount}`);
                values.push(updates.name);
                paramCount++;
            }
            if (updates.specialization !== undefined) {
                updateFields.push(`specialization = $${paramCount}`);
                values.push(updates.specialization);
                paramCount++;
            }
            if (updates.photo_url !== undefined) {
                updateFields.push(`photo_url = $${paramCount}`);
                values.push(updates.photo_url);
                paramCount++;
            }
            if (updates.is_active !== undefined) {
                updateFields.push(`is_active = $${paramCount}`);
                values.push(updates.is_active);
                paramCount++;
            }
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);
            
            const query = `
                UPDATE barbers 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating barber:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            const query = `
                UPDATE barbers 
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting barber:', error);
            throw error;
        }
    },

    async getStats() {
        try {
            const totalQuery = 'SELECT COUNT(*) as total FROM barbers WHERE is_active = true';
            const totalResult = await db.query(totalQuery);
            
            const popularQuery = `
                SELECT b.id, b.name, COUNT(bk.id) as booking_count
                FROM barbers b
                LEFT JOIN bookings bk ON b.id = bk.barber_id
                WHERE b.is_active = true
                GROUP BY b.id, b.name
                ORDER BY booking_count DESC
                LIMIT 5
            `;
            const popularResult = await db.query(popularQuery);
            
            const performanceQuery = `
                SELECT b.id, b.name, 
                        COUNT(bk.id) as completed_bookings,
                        COALESCE(SUM(s.price), 0) as total_revenue
                FROM barbers b
                LEFT JOIN bookings bk ON b.id = bk.barber_id AND bk.status = 'completed'
                LEFT JOIN services s ON bk.service_id = s.id
                WHERE b.is_active = true
                GROUP BY b.id, b.name
                ORDER BY total_revenue DESC
            `;
            const performanceResult = await db.query(performanceQuery);
            
            return {
                total: parseInt(totalResult.rows[0].total),
                popular: popularResult.rows,
                performance: performanceResult.rows
            };
        } catch (error) {
            console.error('Error getting barber stats:', error);
            throw error;
        }
    },

    async getAvailability(barberId, date) {
        try {
            const query = `
                SELECT wh.*,
                        EXISTS (
                            SELECT 1 FROM bookings bk
                            WHERE bk.barber_id = wh.barber_id
                            AND bk.booking_date = $2
                            AND bk.status NOT IN ('cancelled')
                            AND (
                                (bk.start_time < wh.end_time AND bk.end_time > wh.start_time)
                            )
                        ) as is_booked
                FROM working_hours wh
                WHERE wh.barber_id = $1
                AND wh.day_of_week = EXTRACT(DOW FROM $2::date)
            `;
            
            const result = await db.query(query, [barberId, date]);
            return result.rows;
        } catch (error) {
            console.error('Error getting barber availability:', error);
            throw error;
        }
    },

    async isAvailable(barberId, date, startTime, endTime) {
        try {
            const query = `
                SELECT
                    CASE
                        WHEN EXISTS (
                            SELECT 1 FROM bookings bk
                            WHERE bk.barber_id = $1
                            AND bk.booking_date = $2
                            AND bk.status NOT IN ('cancelled')
                            AND (
                                (bk.start_time < $4 AND bk.end_time > $3)
                            )
                        ) THEN false
                        WHEN EXISTS (
                            SELECT 1 FROM working_hours wh
                            WHERE wh.barber_id = $1
                            AND wh.day_of_week = EXTRACT(DOW FROM $2::date)
                            AND $3 >= wh.start_time AND $4 <= wh.end_time
                        ) THEN true
                        ELSE false
                    END as is_available
            `;

            const result = await db.query(query, [barberId, date, startTime, endTime]);
            return result.rows[0]?.is_available || false;
        } catch (error) {
            console.error('Error checking barber availability:', error);
            throw error;
        }
    },

    async getWorkingHours(barberId) {
        try {
            const query = `
                SELECT wh.*
                FROM working_hours wh
                WHERE wh.barber_id = $1
                ORDER BY wh.day_of_week
            `;
            const result = await db.query(query, [barberId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting barber working hours:', error);
            throw error;
        }
    },

    async updateWorkingHours(barberId, workingHours) {
        try {
            await db.query('BEGIN');

            const deleteQuery = 'DELETE FROM working_hours WHERE barber_id = $1';
            await db.query(deleteQuery, [barberId]);

            for (const hour of workingHours) {
                const { day_of_week, start_time, end_time } = hour;

                if (day_of_week < 0 || day_of_week > 6) {
                    await db.query('ROLLBACK');
                    throw new Error('Invalid day of week (0-6)');
                }

                if (!start_time || !end_time) {
                    await db.query('ROLLBACK');
                    throw new Error('Start time and end time are required');
                }

                const insertQuery = `
                    INSERT INTO working_hours (day_of_week, start_time, end_time, barber_id)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `;

                const values = [day_of_week, start_time, end_time, barberId];
                await db.query(insertQuery, values);
            }

            await db.query('COMMIT');
            return workingHours;
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error updating barber working hours:', error);
            throw error;
        }
    },

    async getSchedule(barberId, startDate, endDate) {
        try {
            const bookingsQuery = `
                SELECT bk.*, s.name as service_name, s.duration, u.full_name as customer_name
                FROM bookings bk
                JOIN services s ON bk.service_id = s.id
                JOIN users u ON bk.user_id = u.id
                WHERE bk.barber_id = $1
                AND bk.booking_date BETWEEN $2 AND $3
                AND bk.status NOT IN ('cancelled')
                ORDER BY bk.booking_date, bk.start_time
            `;

            const bookingsResult = await db.query(bookingsQuery, [barberId, startDate, endDate]);
            const bookings = bookingsResult.rows;

            const workingHours = await this.getWorkingHours(barberId);

            const schedule = [];
            const currentDate = new Date(startDate);

            while (currentDate <= new Date(endDate)) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const dayOfWeek = currentDate.getDay();

                const dayWorkingHours = workingHours.find(wh => wh.day_of_week === dayOfWeek);

                const dayBookings = bookings.filter(b => b.booking_date === dateStr);

                schedule.push({
                    date: dateStr,
                    day_of_week: dayOfWeek,
                    is_working_day: !!dayWorkingHours,
                    working_hours: dayWorkingHours ? {
                        start_time: dayWorkingHours.start_time,
                        end_time: dayWorkingHours.end_time
                    } : null,
                    bookings: dayBookings.map(b => ({
                        id: b.id,
                        start_time: b.start_time,
                        end_time: b.end_time,
                        service: b.service_name,
                        duration: b.duration,
                        customer: b.customer_name,
                        status: b.status
                    }))
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return schedule;
        } catch (error) {
            console.error('Error getting barber schedule:', error);
            throw error;
        }
    }
};

module.exports = Barber;