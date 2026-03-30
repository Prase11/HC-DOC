import { Op } from 'sequelize';
import Employee from '../models/employee.model.js';

class EmployeeService {
    async getAll({ page = 1, limit = 10, search = '', unit = '', status = '', docStatus = '' }) {
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { employee_id: { [Op.iLike]: `%${search}%` } },
                { unit: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (unit) {
            where.unit = unit;
        }
        if (status) {
            where.status = status;
        }

        if (docStatus === 'completed') {
            where.employee_id = {
                [Op.in]: (await import('../config/database.js')).sequelize.literal(`(
                    SELECT d.employee_id 
                    FROM documents d
                    JOIN document_categories dc ON d.category_id = dc.id
                    WHERE (d.status = 'complete' OR d.status = 'optional') 
                      AND dc.is_required = true
                    GROUP BY d.employee_id
                    HAVING COUNT(DISTINCT d.category_id) >= (SELECT COUNT(*) FROM document_categories WHERE is_required = true)
                )`)
            };
        } else if (docStatus === 'incomplete') {
            where.employee_id = {
                [Op.notIn]: (await import('../config/database.js')).sequelize.literal(`(
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

        const { count, rows } = await Employee.findAndCountAll({
            where,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['name', 'ASC']],
            attributes: ['employee_id', 'name', 'unit', 'position', 'status', 'photo', 'created_at', 'updated_at']
        });

        return { employees: rows, total: count };
    }

    async getById(employeeId) {
        return await Employee.findByPk(employeeId);
    }

    async search(keyword) {
        if (!keyword || keyword.length < 1) return [];

        return await Employee.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${keyword}%` } },
                    { employee_id: { [Op.iLike]: `%${keyword}%` } },
                    { unit: { [Op.iLike]: `%${keyword}%` } }
                ]
            },
            limit: 20,
            order: [['name', 'ASC']],
            attributes: ['employee_id', 'name', 'unit', 'position', 'status']
        });
    }

    async create(data) {
        const existing = await Employee.findByPk(data.employee_id);
        if (existing) {
            const error = new Error('Employee with this ID already exists');
            error.statusCode = 409;
            throw error;
        }

        const newEmployee = await Employee.create({
            employee_id: data.employee_id,
            name: data.name,
            unit: data.unit || null,
            position: data.position || null,
            photo: data.photo || null,
            status: data.status || 'active'
        });

        // Enterprise Requirement: Auto Create Documents
        const { DocumentCategory, Document } = await import('../models/index.js');
        const allCategories = await DocumentCategory.findAll();

        const documentStubs = allCategories.map(cat => ({
            employee_id: newEmployee.employee_id,
            category_id: cat.id,
            status: 'incomplete'
        }));
        await Document.bulkCreate(documentStubs, { ignoreDuplicates: true });

        return newEmployee;
    }

    async update(employeeId, data) {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) return null;

        const updateFields = {};
        if (data.name !== undefined) updateFields.name = data.name;
        if (data.unit !== undefined) updateFields.unit = data.unit;
        if (data.position !== undefined) updateFields.position = data.position;
        if (data.photo !== undefined) updateFields.photo = data.photo;
        if (data.status !== undefined) updateFields.status = data.status;

        await employee.update(updateFields);
        return employee;
    }

    async delete(employeeId) {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) return false;
        await employee.destroy();
        return true;
    }

    async bulkUpsert(employeesData) {
        const results = { created: 0, updated: 0, errors: [] };

        // Fetch categories once for efficiency
        const { DocumentCategory, Document } = await import('../models/index.js');
        const allCategories = await DocumentCategory.findAll();

        for (const data of employeesData) {
            try {
                const [emp, created] = await Employee.upsert({
                    employee_id: data.employee_id,
                    name: data.name,
                    unit: data.unit || null,
                    position: data.position || null,
                    photo: data.photo || null,
                    status: data.status || 'active'
                });

                if (created) {
                    results.created++;
                    // Auto-assign documents
                    const documentStubs = allCategories.map(cat => ({
                        employee_id: emp.employee_id,
                        category_id: cat.id,
                        status: 'incomplete'
                    }));
                    await Document.bulkCreate(documentStubs, { ignoreDuplicates: true });
                } else {
                    results.updated++;
                }
            } catch (err) {
                results.errors.push({ employee_id: data.employee_id, error: err.message });
            }
        }

        return results;
    }

    async getStats() {
        const total = await Employee.count();
        const active = await Employee.count({ where: { status: 'active' } });
        const inactive = total - active;
        return { total, active, inactive };
    }

    async getUnits() {
        const units = await Employee.findAll({
            attributes: [[Employee.sequelize.fn('DISTINCT', Employee.sequelize.col('unit')), 'unit']],
            where: { unit: { [Op.ne]: null } },
            order: [['unit', 'ASC']],
            raw: true
        });
        return units.map(u => u.unit);
    }
}

export default new EmployeeService();
