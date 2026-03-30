import { DocumentCategory } from '../models/index.js';

// GET /api/doctypes — list all, grouped by doc_group
export const getDocTypes = async (req, res) => {
    try {
        const rows = await DocumentCategory.findAll({ order: [['doc_group', 'ASC'], ['name', 'ASC']] });
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('getDocTypes error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch document types' });
    }
};

// POST /api/doctypes — create
export const createDocType = async (req, res) => {
    try {
        const { name, doc_group, is_required, is_multiple, letter_types } = req.body;
        if (!name || !doc_group) {
            return res.status(400).json({ success: false, message: 'name and doc_group are required' });
        }
        const validGroups = ['identity', 'family', 'education', 'employment', 'employee_letters'];
        if (!validGroups.includes(doc_group)) {
            return res.status(400).json({ success: false, message: `doc_group must be one of: ${validGroups.join(', ')}` });
        }
        // Check duplicate
        const existing = await DocumentCategory.findOne({ where: { name, doc_group } });
        if (existing) {
            return res.status(409).json({ success: false, message: `Document "${name}" already exists in ${doc_group}` });
        }
        const row = await DocumentCategory.create({ name, doc_group, is_required: is_required !== false, is_multiple: is_multiple === true, letter_types });
        res.status(201).json({ success: true, data: row });
    } catch (err) {
        console.error('createDocType error:', err);
        res.status(500).json({ success: false, message: 'Failed to create document type' });
    }
};

// PUT /api/doctypes/:id — update
export const updateDocType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, doc_group, is_required, is_multiple, letter_types } = req.body;
        const row = await DocumentCategory.findByPk(id);
        if (!row) return res.status(404).json({ success: false, message: 'Document type not found' });

        if (name) row.name = name;
        if (doc_group) {
            const validGroups = ['identity', 'family', 'education', 'employment', 'employee_letters'];
            if (!validGroups.includes(doc_group)) {
                return res.status(400).json({ success: false, message: `doc_group must be one of: ${validGroups.join(', ')}` });
            }
            row.doc_group = doc_group;
        }
        if (typeof is_required === 'boolean') row.is_required = is_required;
        if (typeof is_multiple === 'boolean') row.is_multiple = is_multiple;
        if (letter_types !== undefined) row.letter_types = letter_types;

        await row.save();
        res.json({ success: true, data: row });
    } catch (err) {
        console.error('updateDocType error:', err);
        res.status(500).json({ success: false, message: 'Failed to update document type' });
    }
};

// DELETE /api/doctypes/:id — delete
export const deleteDocType = async (req, res) => {
    try {
        const { id } = req.params;
        const row = await DocumentCategory.findByPk(id);
        if (!row) return res.status(404).json({ success: false, message: 'Document type not found' });
        await row.destroy();
        res.json({ success: true, message: `Document type "${row.name}" deleted` });
    } catch (err) {
        console.error('deleteDocType error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete document type' });
    }
};
