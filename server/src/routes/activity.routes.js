import { Router } from 'express';
import { getActivities } from '../controllers/activity.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/activities -> returns array of latest activities
router.get('/', protect, authorize('superadmin', 'hrstaff', 'viewer'), getActivities);

export default router;
