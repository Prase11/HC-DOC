import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: support QNAP NAS path via ENV var
const BASE_STORAGE_PATH = process.env.BASE_STORAGE_PATH || path.join(__dirname, '..', '..', 'storage', 'e-dossier');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // We expect client to send employee_id and group in the body or params
        const employee_id = req.params.employee_id || req.body.employee_id || 'unknown_emp';
        const doc_group = req.params.group || req.body.doc_group || req.params.category || 'misc';

        const dir = path.join(BASE_STORAGE_PATH, employee_id, doc_group);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const letter_type = req.body.letter_type || req.params.document_name || 'document';
        cb(null, `${letter_type.replace(/\s+/g, '_').toLowerCase()}_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit requested conceptually
    fileFilter
});
