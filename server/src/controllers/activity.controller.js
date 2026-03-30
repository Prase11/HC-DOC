import { Activity } from '../models/index.js';

export const getActivities = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 1000;
        const activities = await Activity.findAll({
            limit,
            order: [['created_at', 'DESC']]
        });

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
