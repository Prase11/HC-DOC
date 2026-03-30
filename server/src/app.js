import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { sequelize, testConnection } from './config/database.js';
import './models/index.js'; // Ensure models & associations are loaded
import employeeRoutes from './routes/employee.routes.js';
import importRoutes from './routes/import.routes.js';
import documentRoutes from './routes/document.routes.js';
import reportRoutes from './routes/report.routes.js';
import authRoutes from './routes/auth.routes.js';
import letterRoutes from './routes/letter.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import activityRoutes from './routes/activity.routes.js';
import adminRoutes from './routes/admin.routes.js';
import doctypeRoutes from './routes/doctype.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security ──────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin, localhost, or any local network IP (like QNAP IP e.g. 192.168.x.x, 10.x.x.x)
        if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            // Alternatively, allow all in production if needed by setting origin: true
            callback(null, true); // Permissive CORS for QNAP deployment ease
        }
    },
    credentials: true
}));

// ── Rate Limiting ─────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Increased for development
    message: { success: false, message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased for development
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/storage', express.static(path.join(__dirname, '..', 'storage')));

// ── Health Check ───────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'HR E-Dossier API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// ── API Routes ─────────────────────────
app.use('/api/employees', employeeRoutes);
app.use('/api/import', importRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/doctypes', doctypeRoutes);

// ── Serve Frontend ─────────────────────
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));
    
    // Fallback all other routes to Vue index.html
    app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) {
            return next(); // Let API 404 handler take over
        }
        res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
}

// ── Error Handling ─────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ───────────────────────
const startServer = async () => {
    try {
        await testConnection();
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Database models synchronized.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Health: http://localhost:${PORT}/api/health`);
            console.log(`👥 Employees: http://localhost:${PORT}/api/employees`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

export default app;
