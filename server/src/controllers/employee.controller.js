import employeeService from '../services/employee.service.js';
import ApiResponse from '../utils/response.js';

class EmployeeController {
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 10, search = '', unit = '', status = '', docStatus = '' } = req.query;
            const { employees, total } = await employeeService.getAll({ page, limit, search, unit, status, docStatus });
            return ApiResponse.paginated(res, employees, total, page, limit);
        } catch (error) { next(error); }
    }

    async getStats(req, res, next) {
        try {
            const stats = await employeeService.getStats();
            return ApiResponse.success(res, stats, 'Stats retrieved');
        } catch (error) { next(error); }
    }

    async search(req, res, next) {
        try {
            const { q } = req.query;
            if (!q) return ApiResponse.validationError(res, [{ field: 'q', message: 'Search query is required' }]);
            const employees = await employeeService.search(q);
            return ApiResponse.success(res, employees, 'Search results retrieved');
        } catch (error) { next(error); }
    }

    async getUnits(req, res, next) {
        try {
            const units = await employeeService.getUnits();
            return ApiResponse.success(res, units, 'Units retrieved successfully');
        } catch (error) { next(error); }
    }

    async getById(req, res, next) {
        try {
            const { employee_id } = req.params;
            const employee = await employeeService.getById(employee_id);
            if (!employee) return ApiResponse.notFound(res, `Employee with ID ${employee_id} not found`);
            return ApiResponse.success(res, employee, 'Employee retrieved successfully');
        } catch (error) { next(error); }
    }

    async create(req, res, next) {
        try {
            const { employee_id, name, unit, position, photo, status } = req.body;
            const errors = [];
            if (!employee_id) errors.push({ field: 'employee_id', message: 'Employee ID is required' });
            if (!name) errors.push({ field: 'name', message: 'Name is required' });
            if (errors.length > 0) return ApiResponse.validationError(res, errors);

            const employee = await employeeService.create({ employee_id, name, unit, position, photo, status });
            return ApiResponse.created(res, employee, 'Employee created successfully');
        } catch (error) {
            if (error.statusCode === 409) return ApiResponse.error(res, error.message, 409);
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { employee_id } = req.params;
            const employee = await employeeService.update(employee_id, req.body);
            if (!employee) return ApiResponse.notFound(res, `Employee with ID ${employee_id} not found`);
            return ApiResponse.success(res, employee, 'Employee updated successfully');
        } catch (error) { next(error); }
    }

    async delete(req, res, next) {
        try {
            const { employee_id } = req.params;
            const deleted = await employeeService.delete(employee_id);
            if (!deleted) return ApiResponse.notFound(res, `Employee with ID ${employee_id} not found`);
            return ApiResponse.success(res, null, 'Employee deleted successfully');
        } catch (error) { next(error); }
    }

    async sync(req, res, next) {
        try {
            const { employees } = req.body;
            if (!employees || !Array.isArray(employees)) {
                return ApiResponse.validationError(res, [{ field: 'employees', message: 'Employees array is required' }]);
            }
            const results = await employeeService.bulkUpsert(employees);
            return ApiResponse.success(res, results, 'Sync completed');
        } catch (error) { next(error); }
    }
}

export default new EmployeeController();
