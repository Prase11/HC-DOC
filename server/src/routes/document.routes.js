import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { Document, Employee, DocumentCategory, DocumentVersion } from '../models/index.js';
import ApiResponse from '../utils/response.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { logActivity } from '../controllers/activity.controller.js';

const router = Router();

// Single documents — only one entry allowed per employee
const SINGLE_DOCS = ['SK Pengangkatan Pegawai'];

// ── GET /api/documents/:employee_id — Get all documents for an employee ──
router.get('/:employee_id', protect, async (req, res, next) => {
    try {
        const { employee_id } = req.params;
        const docs = await Document.findAll({
            where: { employee_id },
            include: [
                { model: DocumentCategory, as: 'category' },
                { model: DocumentVersion, as: 'versions' }
            ],
            order: [
                [{ model: DocumentCategory, as: 'category' }, 'doc_group', 'ASC'],
                [{ model: DocumentVersion, as: 'versions' }, 'version_number', 'DESC']
            ]
        });

        // Map back to expected frontend shape
        const formattedDocs = [];
        for (const doc of docs) {
            const catGroup = doc.category ? doc.category.doc_group : 'unknown';
            const category = catGroup === 'employee_letters' ? 'employment' : catGroup;
            const docName = doc.category ? doc.category.name : 'unknown';
            const isRequired = doc.category ? doc.category.is_required : false;

            const isMultiple = doc.category ? doc.category.is_multiple : false;

            if (isMultiple && doc.versions && doc.versions.length > 0) {
                // For multi-version docs: return one entry per version
                for (const ver of doc.versions) {
                    formattedDocs.push({
                        id: doc.id,
                        version_id: ver.id,
                        employee_id: doc.employee_id,
                        category,
                        document_name: docName,
                        is_required: isRequired,
                        status: doc.status,
                        created_at: doc.created_at,
                        updated_at: doc.updated_at,
                        version: ver.version_number,
                        document_number: ver.letter_number,
                        document_date: ver.letter_date,
                        file_path: ver.file_path,
                        original_filename: ver.file_path ? ver.file_path.split(/[\\\/]/).pop() : null,
                        sub_type: ver.letter_type
                    });
                }
            } else {
                // Single docs: return latest version data
                const latestVersion = (doc.versions && doc.versions.length > 0) ? doc.versions[0] : null;
                formattedDocs.push({
                    id: doc.id,
                    employee_id: doc.employee_id,
                    category,
                    document_name: docName,
                    is_required: isRequired,
                    status: doc.status,
                    created_at: doc.created_at,
                    updated_at: doc.updated_at,
                    version: latestVersion ? latestVersion.version_number : 1,
                    document_number: latestVersion ? latestVersion.letter_number : null,
                    document_date: latestVersion ? latestVersion.letter_date : null,
                    file_path: latestVersion ? latestVersion.file_path : null,
                    original_filename: latestVersion ? (latestVersion.file_path.split(/[\\/]/).pop()) : null,
                    sub_type: latestVersion ? latestVersion.letter_type : null
                });
            }
        }

        return ApiResponse.success(res, formattedDocs, 'Documents retrieved');
    } catch (error) { next(error); }
});

// Helper to find category
const findCategory = async (category_group, document_name) => {
    const dbGroup = category_group === 'employment' ? 'employee_letters' : category_group;
    return await DocumentCategory.findOne({
        where: {
            doc_group: dbGroup,
            name: document_name
        }
    });
};

// ── PUT /api/documents/:employee_id/:category/:document_name — Upload/update single doc ──
router.put('/:employee_id/:category/:document_name', protect, authorize('superadmin', 'hrstaff'), upload.single('file'), async (req, res, next) => {
    try {
        const { employee_id, category, document_name } = req.params;

        const employee = await Employee.findByPk(employee_id);
        if (!employee) return ApiResponse.notFound(res, `Employee ${employee_id} not found`);

        const catRecord = await findCategory(category, document_name);
        if (!catRecord) return ApiResponse.notFound(res, `Category mapping not found for ${category}/${document_name}`);

        // Validate letter_type for multi-doc types with defined letter_types
        if (catRecord.is_multiple) {
            const letterTypes = catRecord.letter_types; // getter returns parsed array
            if (letterTypes && letterTypes.length > 0) {
                const subType = req.body.sub_type;
                if (!subType) {
                    return ApiResponse.error(res, 'Letter type (sub_type) is required for this document type.', 400);
                }
                if (!letterTypes.includes(subType)) {
                    return ApiResponse.error(res, `Invalid letter type. Must be one of: ${letterTypes.join(', ')}`, 400);
                }
            }
        }

        const [doc, created] = await Document.findOrCreate({
            where: { employee_id, category_id: catRecord.id },
            defaults: { status: 'complete' }
        });

        if (!created) {
            doc.status = 'complete';
            await doc.save();
        }

        let newVersion = null;
        if (req.file) {
            let relativePath = req.file.filename;
            const pathParts = req.file.path.split(/[\\/]storage[\\/]/i);
            if (pathParts.length > 1) {
                relativePath = '/storage/' + pathParts[1].replace(/\\/g, '/');
            } else {
                relativePath = '/storage/e-dossier/' + employee_id + '/' + category + '/' + req.file.filename;
            }

            const subType = req.body.sub_type || null;

            // For multi-doc types with a specific letter_type, replace existing version with same letter_type
            let existingVersion = null;
            if (catRecord.is_multiple && subType) {
                existingVersion = await DocumentVersion.findOne({
                    where: { document_id: doc.id, letter_type: subType }
                });
            }

            if (existingVersion) {
                // Update existing version (replace)
                existingVersion.letter_number = req.body.document_number || null;
                existingVersion.letter_date = req.body.document_date || null;
                existingVersion.file_path = relativePath;
                existingVersion.uploaded_by = req.user ? req.user.id : null;
                await existingVersion.save();
                newVersion = existingVersion;
            } else {
                // Create new version
                const versionCount = await DocumentVersion.count({ where: { document_id: doc.id } });
                newVersion = await DocumentVersion.create({
                    document_id: doc.id,
                    version_number: versionCount + 1,
                    letter_type: subType,
                    letter_number: req.body.document_number || null,
                    letter_date: req.body.document_date || null,
                    file_path: relativePath,
                    uploaded_by: req.user ? req.user.id : null
                });
            }
        }

        const actionType = created ? 'Uploaded Document' : 'Updated Document';
        await logActivity(actionType, employee_id, document_name, req.user ? req.user.name : 'Unknown');

        return ApiResponse.success(res, {
            ...doc.toJSON(),
            original_filename: newVersion ? newVersion.file_path.split(/[\\/]/).pop() : null,
            file_path: newVersion ? newVersion.file_path : null
        }, created ? 'Document created' : 'Document updated');
    } catch (error) { next(error); }
});

// ── POST /api/documents/:employee_id/:category/:document_name/version — Create new version ──
router.post('/:employee_id/:category/:document_name/version', protect, authorize('superadmin', 'hrstaff'), upload.single('file'), async (req, res, next) => {
    // Left empty/stubbed out because we migrated this to /api/letters/version
    // The frontend must be updated to use the new letters endpoint to upload files.
    return ApiResponse.error(res, `Endpoint deprecated. Please use /api/letters/version`, 400);
});

// ── DELETE /api/documents/:id — Delete a specific document by ID (reset to incomplete) ──
router.delete('/:id', protect, authorize('superadmin', 'hrstaff'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const doc = await Document.findByPk(id);

        if (!doc) return ApiResponse.notFound(res, 'Document not found');

        doc.status = 'incomplete';
        await doc.save();

        let docName = 'Unknown Document';
        if (doc.category_id) {
            const cat = await DocumentCategory.findByPk(doc.category_id);
            if (cat) docName = cat.name;
        }
        await logActivity('Deleted Document', doc.employee_id, docName, req.user ? req.user.name : 'Unknown');

        return ApiResponse.success(res, doc, 'Document reset to incomplete');
    } catch (error) { next(error); }
});

// ── Legacy DELETE by path params (reset to incomplete) ──
router.delete('/:employee_id/:category/:document_name', protect, authorize('superadmin', 'hrstaff'), async (req, res, next) => {
    try {
        const { employee_id, category, document_name } = req.params;

        const catRecord = await findCategory(category, document_name);
        if (!catRecord) return ApiResponse.notFound(res, 'Category not found');

        const doc = await Document.findOne({ where: { employee_id, category_id: catRecord.id } });
        if (!doc) return ApiResponse.notFound(res, 'Document not found');

        doc.status = 'incomplete';
        await doc.save();

        await logActivity('Deleted Document', employee_id, document_name, req.user ? req.user.name : 'Unknown');

        return ApiResponse.success(res, doc, 'Document reset to incomplete');
    } catch (error) { next(error); }
});

// ── PATCH /api/documents/:employee_id/:category/:document_name/status — Mark N/A or unlock ──
router.patch('/:employee_id/:category/:document_name/status', protect, authorize('superadmin', 'hrstaff'), async (req, res, next) => {
    try {
        const { employee_id, category, document_name } = req.params;
        const { status } = req.body;

        if (!['optional', 'incomplete'].includes(status)) {
            return ApiResponse.validationError(res, [{ field: 'status', message: 'Status must be optional or incomplete' }]);
        }

        const catRecord = await findCategory(category, document_name);
        if (!catRecord) return ApiResponse.notFound(res, 'Category not found');

        const [doc, created] = await Document.findOrCreate({
            where: { employee_id, category_id: catRecord.id },
            defaults: { status }
        });

        if (!created) {
            doc.status = status;
            await doc.save();
        }

        const actionType = status === 'optional' ? 'Marked Document N/A' : 'Unlocked Document';
        await logActivity(actionType, employee_id, document_name, req.user ? req.user.name : 'Unknown');

        return ApiResponse.success(res, doc, `Document marked as ${status}`);
    } catch (error) { next(error); }
});

export default router;
