import { Document, DocumentCategory, DocumentVersion, Employee } from '../models/index.js';
import ApiResponse from '../utils/response.js';
import { logActivity } from './activity.controller.js';

export const uploadLetterVersion = async (req, res, next) => {
    try {
        const { document_id, letter_type, letter_number, letter_date } = req.body;
        const file = req.file;

        if (!file) {
            return ApiResponse.error(res, 'PDF or Image block required.', 400);
        }

        const parentDocument = await Document.findByPk(document_id);
        if (!parentDocument) {
            return ApiResponse.notFound(res, 'Parent document record not found.');
        }

        // Validate letter_type if the category has defined letter_types
        if (parentDocument.category_id) {
            const catRecord = await DocumentCategory.findByPk(parentDocument.category_id);
            if (catRecord && catRecord.is_multiple) {
                const definedLetterTypes = catRecord.letter_types;
                if (definedLetterTypes && definedLetterTypes.length > 0) {
                    if (!letter_type) {
                        return ApiResponse.error(res, 'Letter type is required for this document type.', 400);
                    }
                    if (!definedLetterTypes.includes(letter_type)) {
                        return ApiResponse.error(res, `Invalid letter type. Must be one of: ${definedLetterTypes.join(', ')}`, 400);
                    }
                }
            }
        }

        // Build proper relative path for the uploaded file
        let relativePath = `/storage/e-dossier/${file.filename}`;
        const pathParts = file.path.split(/[\\/]storage[\\/]/i);
        if (pathParts.length > 1) {
            relativePath = '/storage/' + pathParts[1].replace(/\\/g, '/');
        }

        // Check if a version with the same letter_type already exists (replace instead of duplicate)
        let existingVersion = null;
        if (letter_type) {
            existingVersion = await DocumentVersion.findOne({
                where: { document_id: document_id, letter_type: letter_type }
            });
        }

        let newVersion;
        if (existingVersion) {
            // Update existing version (replace)
            existingVersion.letter_number = letter_number;
            existingVersion.letter_date = letter_date;
            existingVersion.file_path = relativePath;
            existingVersion.uploaded_by = req.user.id;
            await existingVersion.save();
            newVersion = existingVersion;
        } else {
            const existingVersionsCount = await DocumentVersion.count({
                where: { document_id: document_id }
            });
            const nextVersionNumber = existingVersionsCount + 1;

            newVersion = await DocumentVersion.create({
                document_id: document_id,
                version_number: nextVersionNumber,
                letter_type: letter_type || 'Unknown Type',
                letter_number: letter_number,
                letter_date: letter_date,
                file_path: relativePath,
                uploaded_by: req.user.id
            });
        }

        if (parentDocument.status !== 'complete') {
            await parentDocument.update({ status: 'complete' });
        }

        let docName = 'Unknown Document';
        if (parentDocument.category_id) {
            const cat = await DocumentCategory.findByPk(parentDocument.category_id);
            if (cat) docName = cat.name;
        }
        await logActivity('Uploaded Document Version', parentDocument.employee_id, docName, req.user ? req.user.name : 'Unknown');

        return ApiResponse.created(res, newVersion, `Version ${nextVersionNumber} uploaded successfully.`);
    } catch (error) {
        next(error);
    }
};

export const getLetterVersions = async (req, res, next) => {
    try {
        const { document_id } = req.params;
        const versions = await DocumentVersion.findAll({
            where: { document_id },
            order: [['version_number', 'DESC']]
        });
        return ApiResponse.success(res, versions, 'Letter versions retrieved successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteLetterVersion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const version = await DocumentVersion.findByPk(id);

        if (!version) {
            return ApiResponse.notFound(res, 'Version not found');
        }

        const document_id = version.document_id;
        
        await version.destroy();
        
        // Log activity
        const parentDocument = await Document.findByPk(document_id);
        if (parentDocument) {
            let docName = 'Unknown Document';
            if (parentDocument.category_id) {
                const cat = await DocumentCategory.findByPk(parentDocument.category_id);
                if (cat) docName = cat.name;
            }
            // If no more versions exist, mark document as incomplete
            const remainingVersions = await DocumentVersion.count({ where: { document_id } });
            if (remainingVersions === 0) {
                await parentDocument.update({ status: 'incomplete' });
            }
            await logActivity(`Deleted Version ${version.version_number}`, parentDocument.employee_id, docName, req.user ? req.user.name : 'Unknown');
        }

        return ApiResponse.success(res, null, 'Version deleted successfully');
    } catch (error) {
        next(error);
    }
};
