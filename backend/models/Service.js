const db = require('../config/database');

const Service = {
    // Get all active services
    async getAll() {
        const query = 'SELECT * FROM services WHERE is_active = true ORDER BY price';
        const result = await db.query(query);
        return result.rows;
    },

    // Get service by ID
    async getById(id) {
        const query = 'SELECT * FROM services WHERE id = $1 AND is_active = true';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    // Create new service
    async create(serviceData) {
        const { name, description, duration, price } = serviceData;
        const query = `
            INSERT INTO services (name, description, duration, price)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [name, description || null, duration, price];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    // Update service
    async update(id, updateData) {
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (updateData.name !== undefined) {
            updateFields.push(`name = $${paramCount}`);
            values.push(updateData.name);
            paramCount++;
        }

        if (updateData.description !== undefined) {
            updateFields.push(`description = $${paramCount}`);
            values.push(updateData.description);
            paramCount++;
        }

        if (updateData.duration !== undefined) {
            updateFields.push(`duration = $${paramCount}`);
            values.push(updateData.duration);
            paramCount++;
        }

        if (updateData.price !== undefined) {
            updateFields.push(`price = $${paramCount}`);
            values.push(updateData.price);
            paramCount++;
        }

        if (updateData.is_active !== undefined) {
            updateFields.push(`is_active = $${paramCount}`);
            values.push(updateData.is_active);
            paramCount++;
        }

        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE services
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    },

    // Delete service (soft delete)
    async delete(id) {
        const query = `
            UPDATE services
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    // Get service statistics
    async getStats() {
        // Get total services
        const totalQuery = 'SELECT COUNT(*) as total FROM services WHERE is_active = true';
        const totalResult = await db.query(totalQuery);
        const totalServices = parseInt(totalResult.rows[0].total);

        // Get most popular services
        const popularQuery = `
            SELECT s.id, s.name, COUNT(b.id) as booking_count
            FROM services s
            LEFT JOIN bookings b ON s.id = b.service_id
            WHERE s.is_active = true
            GROUP BY s.id, s.name
            ORDER BY booking_count DESC
            LIMIT 5
        `;
        const popularResult = await db.query(popularQuery);

        // Get revenue by service
        const revenueQuery = `
            SELECT s.id, s.name,
                   COALESCE(SUM(b.price), 0) as total_revenue,
                   COUNT(b.id) as completed_bookings
            FROM services s
            LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'completed'
            WHERE s.is_active = true
            GROUP BY s.id, s.name
            ORDER BY total_revenue DESC
        `;
        const revenueResult = await db.query(revenueQuery);

        return {
            total: totalServices,
            popular: popularResult.rows,
            revenue: revenueResult.rows
        };
    }
};

module.exports = Service;
