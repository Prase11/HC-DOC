import { Router } from 'express';
import employeeController from '../controllers/employee.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Static routes MUST come before parameterized routes
router.get('/stats', protect, (req, res, next) => employeeController.getStats(req, res, next));
router.get('/search', protect, (req, res, next) => employeeController.search(req, res, next));
router.get('/units', protect, (req, res, next) => employeeController.getUnits(req, res, next));
router.post('/sync', protect, authorize('superadmin', 'hrstaff'), (req, res, next) => employeeController.sync(req, res, next));

// CRUD routes
router.get('/', protect, (req, res, next) => employeeController.getAll(req, res, next));
router.get('/:employee_id', protect, (req, res, next) => employeeController.getById(req, res, next));
router.post('/', protect, authorize('superadmin', 'hrstaff'), (req, res, next) => employeeController.create(req, res, next));
router.put('/:employee_id', protect, authorize('superadmin', 'hrstaff'), (req, res, next) => employeeController.update(req, res, next));
router.delete('/:employee_id', protect, authorize('superadmin'), (req, res, next) => employeeController.delete(req, res, next));

export default router;
