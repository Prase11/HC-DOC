import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Employee from '../models/employee.model.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for CSV uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', '..', 'uploads', 'csv');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `import_${Date.now()}.csv`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.csv') {
            return cb(new Error('Only CSV files are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ── Parse CSV text into rows ──
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    // Parse header
    const headers = lines[0].split(/[,;]/).map(h => h.trim().replace(/^"|"$/g, ''));

    // Parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,;]/).map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length >= 2 && values[0]) {
            rows.push(values);
        }
    }
    return { headers, rows };
}

// ── POST /api/import/csv — Upload & preview CSV ──
router.post('/csv', protect, authorize('superadmin', 'hrstaff'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const content = fs.readFileSync(req.file.path, 'utf-8');
        const { headers, rows } = parseCSV(content);

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'CSV file is empty or invalid' });
        }

        // Return preview data
        res.json({
            success: true,
            data: {
                filename: req.file.originalname,
                headers,
                rows,
                totalRows: rows.length,
                filePath: req.file.path
            }
        });
    } catch (error) {
        console.error('CSV upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── POST /api/import/confirm — Confirm import into database ──
router.post('/confirm', protect, authorize('superadmin', 'hrstaff'), async (req, res) => {
    try {
        const { rows, mapping } = req.body;
        // mapping: { employee_id: columnIndex, name: columnIndex, unit: columnIndex, position: columnIndex }

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No data to import' });
        }

        const idIdx = mapping.employee_id ?? 0;
        const nameIdx = mapping.name ?? 1;
        const unitIdx = mapping.unit ?? -1;
        const positionIdx = mapping.position ?? -1;

        const employees = rows.map(row => ({
            employee_id: String(row[idIdx] || '').trim(),
            name: String(row[nameIdx] || '').trim(),
            unit: unitIdx >= 0 && row[unitIdx] ? String(row[unitIdx]).trim() : null,
            position: positionIdx >= 0 && row[positionIdx] ? String(row[positionIdx]).trim() : null,
            status: 'active'
        })).filter(e => e.employee_id && e.name);

        if (employees.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid rows found' });
        }

        // Upsert (insert or update)
        let inserted = 0;
        let updated = 0;
        for (const emp of employees) {
            const [record, created] = await Employee.upsert(emp);
            if (created) inserted++;
            else updated++;
        }

        res.json({
            success: true,
            message: `Import complete! ${inserted} new, ${updated} updated.`,
            data: { inserted, updated, total: employees.length }
        });
    } catch (error) {
        console.error('Import confirm error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
