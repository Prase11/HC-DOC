import { Document, DocumentCategory } from '../models/index.js';

export const calculateCompletionPercentage = async (employeeId) => {
    // Strictly the 15 required documents count towards completion.
    const REQUIRED_DOCS_COUNT = 15;

    // Count how many complete documents are linked to 'required' categories
    const completedRequiredDocsCount = await Document.count({
        where: {
            employee_id: employeeId,
            status: 'complete'
        },
        include: [{
            model: DocumentCategory,
            as: 'category', // Changed to match the as: 'category' in index.js
            where: {
                is_required: true
            }
        }]
    });

    if (completedRequiredDocsCount >= REQUIRED_DOCS_COUNT) return 100;

    const percentage = Math.round((completedRequiredDocsCount / REQUIRED_DOCS_COUNT) * 100);
    return percentage;
};

export const documentService = {
    calculateCompletionPercentage
};
