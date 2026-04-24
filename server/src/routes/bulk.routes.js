import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { Op } from 'sequelize';
import { Document, DocumentCategory, DocumentVersion, Employee } from '../models/index.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_ROOT = path.resolve(__dirname, '..', '..', 'storage');

/**
 * GET /api/bulk/preview
 * Preview which employees have a given document type uploaded.
 * Query: docName (required), unit (optional), employeeIds (optional, comma-separated)
 */
router.get('/preview', protect, async (req, res, next) => {
    try {
        const { docName, unit, employeeIds } = req.query;
        if (!docName) return res.status(400).json({ success: false, message: 'docName is required' });

        const category = await DocumentCategory.findOne({ where: { name: docName } });
        if (!category) return res.status(404).json({ success: false, message: 'Document type not found' });

        const empWhere = {};
        if (unit) empWhere.unit = unit;
        if (employeeIds) {
            const ids = employeeIds.split(',').map(s => s.trim()).filter(Boolean);
            if (ids.length) empWhere.employee_id = { [Op.in]: ids };
        }

        const docs = await Document.findAll({
            where: { category_id: category.id, status: 'complete' },
            include: [
                { model: Employee, as: 'employee', where: Object.keys(empWhere).length ? empWhere : undefined, required: true },
                { model: DocumentVersion, as: 'versions', required: true,
                  where: { file_path: { [Op.ne]: null } },
                  order: [['version_number', 'DESC']], limit: 1 }
            ]
        });

        const items = docs.map(doc => {
            const ver = doc.versions[0];
            const filePath = ver ? path.join(STORAGE_ROOT, ver.file_path.replace(/^\/storage/, '')) : null;
            const fileExists = filePath ? fs.existsSync(filePath) : false;
            return {
                employeeId: doc.employee_id,
                name: doc.employee?.name || '-',
                unit: doc.employee?.unit || '-',
                filePath: ver?.file_path || null,
                hasFile: fileExists,
                ext: ver?.file_path ? path.extname(ver.file_path) : ''
            };
        }).filter(i => i.hasFile);

        res.json({ success: true, data: items, total: items.length });
    } catch (err) { next(err); }
});

/**
 * POST /api/bulk/download
 * Download a ZIP of all matching documents.
 * Body: { docName, employeeIds?: string[], unit?: string }
 */
router.post('/download', protect, async (req, res, next) => {
    try {
        const { docName, employeeIds, unit } = req.body;
        if (!docName) return res.status(400).json({ success: false, message: 'docName is required' });

        const category = await DocumentCategory.findOne({ where: { name: docName } });
        if (!category) return res.status(404).json({ success: false, message: 'Document type not found' });

        const empWhere = {};
        if (unit) empWhere.unit = unit;
        if (employeeIds && employeeIds.length > 0) {
            empWhere.employee_id = { [Op.in]: employeeIds };
        }

        const docs = await Document.findAll({
            where: { category_id: category.id, status: 'complete' },
            include: [
                { model: Employee, as: 'employee', where: Object.keys(empWhere).length ? empWhere : undefined, required: true },
                { model: DocumentVersion, as: 'versions', required: true,
                  where: { file_path: { [Op.ne]: null } },
                  order: [['version_number', 'DESC']], limit: 1 }
            ]
        });

        if (!docs.length) {
            return res.status(404).json({ success: false, message: 'No files found for the selected criteria' });
        }

        const safeName = docName.replace(/[^a-zA-Z0-9_\-]/g, '_');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}_bulk.zip"`);
        res.setHeader('Content-Type', 'application/zip');

        const archive = archiver('zip', { zlib: { level: 6 } });
        archive.on('error', err => { throw err; });
        archive.pipe(res);

        let added = 0;
        for (const doc of docs) {
            const ver = doc.versions[0];
            if (!ver?.file_path) continue;

            const absPath = path.join(STORAGE_ROOT, ver.file_path.replace(/^\/storage/, ''));
            if (!fs.existsSync(absPath)) continue;

            const ext = path.extname(ver.file_path);
            const empName = (doc.employee?.name || doc.employee_id).replace(/[^a-zA-Z0-9 _\-]/g, '');
            const filename = `${doc.employee_id}_${empName}${ext}`;

            archive.file(absPath, { name: filename });
            added++;
        }

        if (added === 0) {
            archive.abort();
            return res.status(404).json({ success: false, message: 'No physical files found on server' });
        }

        await archive.finalize();
    } catch (err) { next(err); }
});

export default router;
