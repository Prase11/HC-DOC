import { Employee, Document, DocumentCategory } from '../models/index.js';
import ApiResponse from '../utils/response.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        // Total active employees
        const totalEmployees = await Employee.count({ where: { status: 'active' } });

        // Required docs globally (Strictly Identity, Family, Education, 1x Employee letters)
        const TOTAL_REQUIRED_PER_EMP = 15;
        const globalTargetDocs = totalEmployees * TOTAL_REQUIRED_PER_EMP;

        // Sum complete docs belonging to 'is_required: true'
        const globalCompletedDocs = await Document.count({
            where: { status: 'complete' },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    where: { status: 'active' }
                },
                {
                    model: DocumentCategory,
                    as: 'category',
                    where: { is_required: true }
                }
            ]
        });

        const globalMissingDocs = Math.max(0, globalTargetDocs - globalCompletedDocs);
        const globalPercentage = globalTargetDocs === 0 ? 0 : Math.round((globalCompletedDocs / globalTargetDocs) * 100);

        return ApiResponse.success(res, {
            total_employees: totalEmployees,
            global_completion_percentage: globalPercentage,
            documents_status: {
                required_total: globalTargetDocs,
                completed: globalCompletedDocs,
                incomplete: globalMissingDocs
            }
        }, 'Dashboard stats retrieved successfully');
    } catch (error) {
        next(error);
    }
};
