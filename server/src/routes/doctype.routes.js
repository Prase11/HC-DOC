import express from 'express';
import {
    getDocTypes,
    createDocType,
    updateDocType,
    deleteDocType
} from '../controllers/doctype.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All doctype routes require authentication
router.use(protect);

// GET is available to all authenticated users
router.get('/', getDocTypes);

// CUD requires superadmin
router.post('/', authorize('superadmin'), createDocType);
router.put('/:id', authorize('superadmin'), updateDocType);
router.delete('/:id', authorize('superadmin'), deleteDocType);

export default router;
