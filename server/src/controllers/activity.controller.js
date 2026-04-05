import { Activity, User } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { QueryTypes } from 'sequelize';

export const getActivities = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 1000;
        const activities = await sequelize.query(
            `SELECT a.*, u.employee_id as admin_employee_id
             FROM activities a
             LEFT JOIN users u ON a.performed_by = u.name
             ORDER BY a.created_at DESC
             LIMIT :limit`,
            {
                replacements: { limit },
                type: QueryTypes.SELECT
            }
        );

        // Frontend expects a raw array based on `Array.isArray(acts)`
        return res.json(activities);
    } catch (error) {
        next(error);
    }
};

export const logActivity = async (action, employee_id, document_name, performed_by) => {
    try {
        await Activity.create({
            action,
            employee_id: String(employee_id),
            document_name,
            performed_by
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};
