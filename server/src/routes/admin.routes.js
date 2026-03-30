import express from 'express';
import {
    getAdmins,
    createAdmin,
    updateAdmin,
    toggleAdmin,
    deleteAdmin
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication
router.use(protect);
router.use(authorize('superadmin'));

router.get('/', getAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.patch('/:id/toggle', toggleAdmin);
router.delete('/:id', deleteAdmin);

export default router;
