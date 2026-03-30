import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';
import { Employee, Document, DocumentCategory } from '../models/index.js';

export const getCompletenessReport = async (req, res, next) => {
    try {
        const { unit, search, status, page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const whereClause = { status: 'active' };
        if (unit) whereClause.unit = unit;
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { employee_id: { [Op.iLike]: `%${search}%` } },
                { unit: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (status === 'complete') {
            whereClause.employee_id = {
                [Op.in]: sequelize.literal(`(
                    SELECT d.employee_id 
                    FROM documents d
                    JOIN document_categories dc ON d.category_id = dc.id
                    WHERE (d.status = 'complete' OR d.status = 'optional') 
                      AND dc.is_required = true
                    GROUP BY d.employee_id
                    HAVING COUNT(DISTINCT d.category_id) >= (SELECT COUNT(*) FROM document_categories WHERE is_required = true)
                )`)
            };
        } else if (status === 'incomplete') {
            whereClause.employee_id = {
                [Op.notIn]: sequelize.literal(`(
                    SELECT d.employee_id 
                    FROM documents d
                    JOIN document_categories dc ON d.category_id = dc.id
                    WHERE (d.status = 'complete' OR d.status = 'optional') 
                      AND dc.is_required = true
                    GROUP BY d.employee_id
                    HAVING COUNT(DISTINCT d.category_id) >= (SELECT COUNT(*) FROM document_categories WHERE is_required = true)
                )`)
            };
        }

        const { count, rows: employees } = await Employee.findAndCountAll({
            where: whereClause,
            attributes: ['employee_id', 'name', 'unit'],
            order: [['name', 'ASC']],
            limit: limitNum,
            offset: offset
        });

        // Get all categories to calculate maximum required docs manually if needed
        const reqCategories = await DocumentCategory.findAll({ where: { is_required: true } });
        const TOTAL_REQUIRED = reqCategories.length;

        // Fetch all documents joined with categories for THESE SPECIFIC PAGE employees
        const employeeIds = employees.map(e => e.employee_id);
        const documents = await Document.findAll({
            where: { employee_id: { [Op.in]: employeeIds } },
            include: [{
                model: DocumentCategory,
                as: 'category',
                attributes: ['name', 'doc_group', 'is_required']
            }]
        });

        // Build a lookup map O(N) for documents by employee_id to avoid O(N^2) array filtering
        const empDocsMap = {};
        for (const doc of documents) {
            if (!empDocsMap[doc.employee_id]) empDocsMap[doc.employee_id] = [];
            empDocsMap[doc.employee_id].push(doc);
        }

        const report = employees.map(emp => {
            // Filter docs for this employee - now O(1) map lookup
            const eDocs = empDocsMap[emp.employee_id] || [];

            let total = TOTAL_REQUIRED;
            let complete = 0;
            let incomplete = 0;
            let optional = 0;

            for (const doc of eDocs) {
                if (doc.category && doc.category.is_required) {
                    if (doc.status === 'complete') complete++;
                    else incomplete++;
                } else {
                    if (doc.status === 'complete' || doc.status === 'optional') optional++;
                }
            }
            // Some incomplete docs might not even have rows if they weren't seeded properly, 
            // so incomplete is max(0, TOTAL_REQUIRED - complete)
            incomplete = Math.max(0, TOTAL_REQUIRED - complete);

            const percentage = TOTAL_REQUIRED > 0 ? Math.round((complete / TOTAL_REQUIRED) * 100) : 100;

            return {
                id: emp.employee_id,
                name: emp.name,
                unit: emp.unit,
                initials: emp.name.split(' ').map(w => w[0]).join('').slice(0, 2),
                total,
                complete,
                incomplete,
                optional,
                percentage
            };
        });

        const totalPages = Math.ceil(count / limitNum);

        res.json({ 
            success: true, 
            data: {
                items: report,
                pagination: {
                    total: count,
                    page: pageNum,
                    limit: limitNum,
                    totalPages
                }
            } 
        });
    } catch (error) {
        console.error('Error fetching completeness report:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getMissingDocuments = async (req, res) => {
    try {
        const { unit, type, status, docName, page = 1, limit = 10, format = 'flat', search } = req.query;

        const whereClause = { status: 'active' };
        if (unit) whereClause.unit = unit;
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { employee_id: { [Op.iLike]: `%${search}%` } },
                { unit: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Get all active employees
        const employees = await Employee.findAll({
            where: whereClause,
            attributes: ['employee_id', 'name', 'unit'],
            order: [['name', 'ASC']]
        });

        // Get all required categories
        const reqCategories = await DocumentCategory.findAll({ where: { is_required: true } });

        // Optional filter by doc group
        let filteredCategories = reqCategories;
        if (type) {
            const targetGroup = type === 'employment' ? 'employee_letters' : type;
            filteredCategories = reqCategories.filter(c => c.doc_group === targetGroup);
        }
        // Optional filter by doc name
        if (docName) {
            filteredCategories = filteredCategories.filter(c => c.name === docName);
        }

        // Get all existing documents for active employees with required categories
        const existingDocs = await Document.findAll({
            include: [
                { model: Employee, as: 'employee', where: whereClause, attributes: ['employee_id'] },
                { model: DocumentCategory, as: 'category', where: { is_required: true }, attributes: ['id', 'name', 'doc_group'] }
            ]
        });

        // Build a lookup: employeeId -> Set of category_ids that have docs
        const empDocMap = {};
        const empStatusMap = {}; // employeeId_categoryId -> status
        for (const doc of existingDocs) {
            if (!doc.employee || !doc.category) continue;
            const empId = doc.employee.employee_id;
            if (!empDocMap[empId]) empDocMap[empId] = new Set();
            empDocMap[empId].add(doc.category.id);
            empStatusMap[`${empId}_${doc.category.id}`] = doc.status;
        }

        // Build the full missing list
        const allMissing = [];
        for (const emp of employees) {
            const empCatSet = empDocMap[emp.employee_id] || new Set();
            for (const cat of filteredCategories) {
                const key = `${emp.employee_id}_${cat.id}`;
                const existingStatus = empStatusMap[key];

                // Include if: no document exists, OR document exists but not complete
                if (!empCatSet.has(cat.id) || (existingStatus && existingStatus !== 'complete' && existingStatus !== 'optional')) {
                    // If status filter is provided, only include matching statuses
                    const docStatus = existingStatus || 'incomplete';
                    if (status && status !== docStatus) {
                        continue;
                    }

                    allMissing.push({
                        employeeId: emp.employee_id,
                        employeeName: emp.name,
                        unit: emp.unit,
                        docName: cat.name,
                        category: cat.doc_group === 'employee_letters' ? 'Employee Letters' :
                            (cat.doc_group.charAt(0).toUpperCase() + cat.doc_group.slice(1)),
                        status: docStatus
                    });
                }
            }
        }

        // Calculate top missing docs summary (before pagination)
        const topMissingSummary = {};
        for (const item of allMissing) {
            topMissingSummary[item.docName] = (topMissingSummary[item.docName] || 0) + 1;
        }
        const topMissingDocs = Object.entries(topMissingSummary)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const startIdx = (pageNum - 1) * limitNum;

        let resultData = [];
        let totalItems = 0;

        if (format === 'grouped') {
            // Group by employee for the incomplete employees table
            const grouped = {};
            for (const item of allMissing) {
                if (!grouped[item.employeeId]) {
                    grouped[item.employeeId] = {
                        id: item.employeeId,
                        name: item.employeeName,
                        unit: item.unit,
                        missingDocs: []
                    };
                }
                grouped[item.employeeId].missingDocs.push({
                    name: item.docName,
                    status: item.status
                });
            }

            const incompleteEmployees = Object.values(grouped)
                .map(emp => ({
                    ...emp,
                    missingCount: emp.missingDocs.length,
                    missingDocs: emp.missingDocs.map(d => d.name).join(', ')
                }))
                .sort((a, b) => b.missingCount - a.missingCount);

            totalItems = incompleteEmployees.length;
            resultData = incompleteEmployees.slice(startIdx, startIdx + limitNum);
        } else {
            // Flat format for Reporting page
            totalItems = allMissing.length;
            resultData = allMissing.slice(startIdx, startIdx + limitNum);
        }

        const totalPages = Math.ceil(totalItems / limitNum);

        res.json({
            success: true,
            data: {
                items: resultData,
                topMissingDocs,
                pagination: {
                    total: totalItems,
                    page: pageNum,
                    limit: limitNum,
                    totalPages
                }
            }
        });
    } catch (error) {
        console.error('Error fetching missing documents report:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getDocumentExport = async (req, res) => {
    try {
        const { unit, type, docName, status, tab = 'missing', search } = req.query;

        const whereClause = { status: 'active' };
        if (unit) whereClause.unit = unit;
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { employee_id: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // ── TAB: completeness ──
        if (tab === 'completeness') {
            const employees = await Employee.findAll({
                where: whereClause,
                attributes: ['employee_id', 'name', 'unit'],
                order: [['name', 'ASC']]
            });
            const reqCategories = await DocumentCategory.findAll({ where: { is_required: true } });
            const TOTAL_REQUIRED = reqCategories.length;
            const documents = await Document.findAll({
                include: [{ model: DocumentCategory, as: 'category', attributes: ['name', 'doc_group', 'is_required'] }]
            });

            const empDocsMap = {};
            for (const doc of documents) {
                if (!empDocsMap[doc.employee_id]) empDocsMap[doc.employee_id] = [];
                empDocsMap[doc.employee_id].push(doc);
            }

            let rows = employees.map(emp => {
                const eDocs = empDocsMap[emp.employee_id] || [];
                let complete = 0;
                for (const doc of eDocs) {
                    if (doc.category && doc.category.is_required && (doc.status === 'complete' || doc.status === 'optional')) complete++;
                }
                const incomplete = Math.max(0, TOTAL_REQUIRED - complete);
                const percentage = TOTAL_REQUIRED > 0 ? Math.round((complete / TOTAL_REQUIRED) * 100) : 100;
                return {
                    'Employee ID': emp.employee_id,
                    'Name': emp.name,
                    'Unit': emp.unit,
                    'Total Required': TOTAL_REQUIRED,
                    'Complete': complete,
                    'Incomplete': incomplete,
                    'Completion %': percentage
                };
            });

            if (status) {
                rows = rows.filter(r => status === 'complete' ? r['Completion %'] === 100 : r['Completion %'] < 100);
            }

            return res.json({ success: true, data: rows, title: 'Employee Document Completeness' });
        }

        // ── TAB: statistics ──
        if (tab === 'statistics') {
            const activeEmployees = await Employee.count({ where: { status: 'active' } });
            const categories = await DocumentCategory.findAll();
            const reqCategories = categories.filter(c => c.is_required);

            const catStats = {};
            for (const cat of reqCategories) {
                const group = cat.doc_group === 'employee_letters' ? 'Employee Letters'
                    : (cat.doc_group.charAt(0).toUpperCase() + cat.doc_group.slice(1));
                if (!catStats[group]) catStats[group] = { total: 0, complete: 0, incomplete: 0 };
                catStats[group].total += activeEmployees;
                catStats[group].incomplete += activeEmployees;
            }

            const docs = await Document.findAll({
                where: { status: ['complete', 'optional'] },
                include: [
                    { model: Employee, as: 'employee', where: { status: 'active' } },
                    { model: DocumentCategory, as: 'category', where: { is_required: true } }
                ]
            });

            for (const doc of docs) {
                if (!doc.category) continue;
                const group = doc.category.doc_group === 'employee_letters' ? 'Employee Letters'
                    : (doc.category.doc_group.charAt(0).toUpperCase() + doc.category.doc_group.slice(1));
                if (catStats[group]) {
                    catStats[group].complete++;
                    catStats[group].incomplete--;
                }
            }

            const rows = Object.entries(catStats).map(([name, stats]) => ({
                'Category': name,
                'Total': stats.total,
                'Complete': stats.complete,
                'Incomplete': stats.incomplete
            }));

            return res.json({ success: true, data: rows, title: 'Document Statistics by Category' });
        }

        // ── TAB: missing (default) — supports complete/incomplete/missing ──
        const employees = await Employee.findAll({
            where: whereClause,
            attributes: ['employee_id', 'name', 'unit'],
            order: [['name', 'ASC']]
        });

        const reqCategories = await DocumentCategory.findAll({ where: { is_required: true } });
        let filteredCategories = reqCategories;
        if (type) {
            const targetGroup = type === 'employment' ? 'employee_letters' : type;
            filteredCategories = reqCategories.filter(c => c.doc_group === targetGroup);
        }
        if (docName) {
            filteredCategories = filteredCategories.filter(c => c.name === docName);
        }

        const existingDocs = await Document.findAll({
            include: [
                { model: Employee, as: 'employee', where: whereClause, attributes: ['employee_id', 'name', 'unit'] },
                { model: DocumentCategory, as: 'category', where: { is_required: true }, attributes: ['id', 'name', 'doc_group'] }
            ]
        });

        const empDocMap = {};
        const empStatusMap = {};
        const empDocDetails = {};
        for (const doc of existingDocs) {
            if (!doc.employee || !doc.category) continue;
            const empId = doc.employee.employee_id;
            if (!empDocMap[empId]) empDocMap[empId] = new Set();
            empDocMap[empId].add(doc.category.id);
            const key = `${empId}_${doc.category.id}`;
            empStatusMap[key] = doc.status;
            empDocDetails[key] = {
                document_number: doc.document_number,
                document_date: doc.document_date,
                original_filename: doc.original_filename
            };
        }

        const rows = [];

        if (status === 'complete') {
            // Show employees who HAVE the document(s) complete
            for (const emp of employees) {
                const empCatSet = empDocMap[emp.employee_id] || new Set();
                for (const cat of filteredCategories) {
                    const key = `${emp.employee_id}_${cat.id}`;
                    if (empCatSet.has(cat.id) && (empStatusMap[key] === 'complete' || empStatusMap[key] === 'optional')) {
                        const details = empDocDetails[key] || {};
                        rows.push({
                            'Employee ID': emp.employee_id,
                            'Name': emp.name,
                            'Unit': emp.unit,
                            'Document': cat.name,
                            'Category': cat.doc_group === 'employee_letters' ? 'Employee Letters'
                                : (cat.doc_group.charAt(0).toUpperCase() + cat.doc_group.slice(1)),
                            'Status': 'Complete',
                            'Document Number': details.document_number || '-',
                            'Document Date': details.document_date || '-',
                            'File': details.original_filename || '-'
                        });
                    }
                }
            }
        } else {
            // Show missing/incomplete documents
            for (const emp of employees) {
                const empCatSet = empDocMap[emp.employee_id] || new Set();
                for (const cat of filteredCategories) {
                    const key = `${emp.employee_id}_${cat.id}`;
                    const existingStatus = empStatusMap[key];

                    if (!empCatSet.has(cat.id) || (existingStatus && existingStatus !== 'complete' && existingStatus !== 'optional')) {
                        const docStatus = existingStatus || 'incomplete';
                        if (status && status !== docStatus) {
                            continue;
                        }
                        rows.push({
                            'Employee ID': emp.employee_id,
                            'Name': emp.name,
                            'Unit': emp.unit,
                            'Document': cat.name,
                            'Category': cat.doc_group === 'employee_letters' ? 'Employee Letters'
                                : (cat.doc_group.charAt(0).toUpperCase() + cat.doc_group.slice(1)),
                            'Status': docStatus.charAt(0).toUpperCase() + docStatus.slice(1)
                        });
                    }
                }
            }
        }

        // Build a descriptive title
        const parts = ['Document Report'];
        if (docName) parts.push(`— ${docName}`);
        if (status) parts.push(`(${status})`);
        if (unit) parts.push(`— Unit: ${unit}`);

        res.json({ success: true, data: rows, title: parts.join(' ') });
    } catch (error) {
        console.error('Error generating export data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getStatistics = async (req, res) => {
    try {
        const activeEmployees = await Employee.count({ where: { status: 'active' } });
        const categories = await DocumentCategory.findAll();

        const reqCategories = categories.filter(c => c.is_required);
        const REQUIRED_DOC_COUNT = reqCategories.length;
        const totalTargetDocs = activeEmployees * REQUIRED_DOC_COUNT;

        // Count per group
        const catStats = {
            Identity: { total: activeEmployees * 5, complete: 0, incomplete: activeEmployees * 5, optional: 0 },
            Family: { total: activeEmployees * 5, complete: 0, incomplete: activeEmployees * 5, optional: 0 },
            Education: { total: activeEmployees * 4, complete: 0, incomplete: activeEmployees * 4, optional: 0 },
            Employment: { total: activeEmployees * 1, complete: 0, incomplete: activeEmployees * 1, optional: 0 }
        };

        // Get actual complete docs
        const docs = await Document.findAll({
            where: { status: ['complete', 'optional'] },
            include: [{ model: Employee, as: 'employee', where: { status: 'active' } }, { model: DocumentCategory, as: 'category' }]
        });

        let completeDocs = 0, optionalDocs = 0;
        const employeeCompletionCount = {};

        for (const doc of docs) {
            if (!doc.category || !doc.employee) continue;
            // Only aggregate if this is a globally required document for metric tracking
            if (!doc.category.is_required) continue;

            // Legacy mapping for employment
            let mappedGroup = doc.category.doc_group === 'employee_letters' ? 'Employment' :
                (doc.category.doc_group.charAt(0).toUpperCase() + doc.category.doc_group.slice(1));

            if (catStats[mappedGroup]) {
                if (doc.status === 'complete') {
                    catStats[mappedGroup].complete++;
                    catStats[mappedGroup].incomplete--;
                    completeDocs++;
                } else if (doc.status === 'optional') {
                    catStats[mappedGroup].optional++;
                    catStats[mappedGroup].incomplete--;
                    optionalDocs++;
                }

                const empId = doc.employee.employee_id;
                employeeCompletionCount[empId] = (employeeCompletionCount[empId] || 0) + 1;
            }
        }

        let employeesComplete = 0;
        for (const empId in employeeCompletionCount) {
            if (employeeCompletionCount[empId] === REQUIRED_DOC_COUNT) {
                employeesComplete++;
            }
        }

        const employeesIncomplete = activeEmployees - employeesComplete;
        const totalIncomplete = Math.max(0, totalTargetDocs - completeDocs - optionalDocs);

        res.json({
            success: true,
            data: {
                summary: {
                    totalEmployees: activeEmployees,
                    employeesComplete: employeesComplete,
                    employeesIncomplete: employeesIncomplete,
                    totalDocs: totalTargetDocs,
                    totalComplete: completeDocs + optionalDocs,
                    totalIncomplete: totalIncomplete,
                    totalOptional: optionalDocs
                },
                categories: Object.entries(catStats).map(([name, stats]) => ({ name, ...stats }))
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
