// Working Hours model

const db = require('../config/database');

const WorkingHours = {
    // Get working hours for a barber
    async getByBarberId(barberId) {
        try {
            const query = `
                SELECT * FROM working_hours 
                WHERE barber_id = $1 
                ORDER BY day_of_week
            `;
            const result = await db.query(query, [barberId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting working hours:', error);
            throw error;
        }
    },

    // Get working hours for specific day
    async getByBarberAndDay(barberId, dayOfWeek) {
        try {
            const query = `
                SELECT * FROM working_hours 
                WHERE barber_id = $1 AND day_of_week = $2
            `;
            const result = await db.query(query, [barberId, dayOfWeek]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting working hours by day:', error);
            throw error;
        }
    },

    // Create working hours
    async create(workingHoursData) {
        try {
            const { barber_id, day_of_week, start_time, end_time } = workingHoursData;
            
            const query = `
                INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const values = [barber_id, day_of_week, start_time, end_time];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating working hours:', error);
            throw error;
        }
    },

    // Update working hours
    async update(id, updates) {
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 1;
            
            if (updates.day_of_week !== undefined) {
                updateFields.push(`day_of_week = $${paramCount}`);
                values.push(updates.day_of_week);
                paramCount++;
            }
            
            if (updates.start_time !== undefined) {
                updateFields.push(`start_time = $${paramCount}`);
                values.push(updates.start_time);
                paramCount++;
            }
            
            if (updates.end_time !== undefined) {
                updateFields.push(`end_time = $${paramCount}`);
                values.push(updates.end_time);
                paramCount++;
            }
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            values.push(id);
            
            const query = `
                UPDATE working_hours 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating working hours:', error);
            throw error;
        }
    },

    // Delete working hours
    async delete(id) {
        try {
            const query = 'DELETE FROM working_hours WHERE id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting working hours:', error);
            throw error;
        }
    },

    // Delete all working hours for a barber
    async deleteByBarberId(barberId) {
        try {
            const query = 'DELETE FROM working_hours WHERE barber_id = $1';
            await db.query(query, [barberId]);
            return true;
        } catch (error) {
            console.error('Error deleting working hours by barber:', error);
            throw error;
        }
    },

    // Check if barber is working on specific date
    async isWorkingOnDate(barberId, date) {
        try {
            const dayOfWeek = new Date(date).getDay();
            const query = `
                SELECT EXISTS (
                    SELECT 1 FROM working_hours 
                    WHERE barber_id = $1 AND day_of_week = $2
                ) as is_working
            `;
            const result = await db.query(query, [barberId, dayOfWeek]);
            return result.rows[0]?.is_working || false;
        } catch (error) {
            console.error('Error checking if barber is working:', error);
            throw error;
        }
    },

    // Get working hours for multiple barbers
    async getByBarberIds(barberIds) {
        try {
            const query = `
                SELECT * FROM working_hours 
                WHERE barber_id = ANY($1)
                ORDER BY barber_id, day_of_week
            `;
            const result = await db.query(query, [barberIds]);
            
            // Group by barber_id
            const grouped = {};
            result.rows.forEach(row => {
                if (!grouped[row.barber_id]) {
                    grouped[row.barber_id] = [];
                }
                grouped[row.barber_id].push(row);
            });
            
            return grouped;
        } catch (error) {
            console.error('Error getting working hours for multiple barbers:', error);
            throw error;
        }
    },

    // Get next available working day
    async getNextWorkingDay(barberId, fromDate) {
        try {
            const query = `
                SELECT wh.day_of_week,
                       $2::date + (wh.day_of_week - EXTRACT(DOW FROM $2::date)::int + 7) % 7 as next_date
                FROM working_hours wh
                WHERE wh.barber_id = $1
                ORDER BY (wh.day_of_week - EXTRACT(DOW FROM $2::date)::int + 7) % 7
                LIMIT 1
            `;
            
            const result = await db.query(query, [barberId, fromDate]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting next working day:', error);
            throw error;
        }
    }
};

module.exports = WorkingHours;