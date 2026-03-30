import express from 'express';
import { login, register, getMe } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});

router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

// Only superadmin can create new admins/users
router.post('/register', protect, authorize('superadmin'), register);

export default router;
