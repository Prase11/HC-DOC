import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect routes - Verify Token
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ success: false, message: 'Server configuration error' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email', 'role', 'status']
            });

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            if (req.user.status !== 'active') {
                return res.status(403).json({ success: false, message: 'Not authorized, account disabled' });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
