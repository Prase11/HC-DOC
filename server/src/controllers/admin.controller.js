import User from '../models/user.model.js';
import { Op } from 'sequelize';

// Role display mapping
const ROLE_DISPLAY = { superadmin: 'Super Admin', hrstaff: 'Admin' };
const ADMIN_ROLES = ['superadmin', 'hrstaff'];

// Map display role back to DB value
function mapRoleToDB(displayRole) {
    if (displayRole === 'super_admin' || displayRole === 'Super Admin') return 'superadmin';
    if (displayRole === 'admin' || displayRole === 'Admin') return 'hrstaff';
    return displayRole;
}

// Format user for API response
function formatAdmin(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        employee_id: user.employee_id || null,
        role: ROLE_DISPLAY[user.role] || user.role,
        status: user.status === 'active' ? 'active' : 'disabled',
        last_login: user.last_login
            ? new Date(user.last_login).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
            : 'Never',
        created_at: user.created_at,
        updated_at: user.updated_at
    };
}

// GET /api/admins
export const getAdmins = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: { [Op.in]: ADMIN_ROLES } },
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: users.map(formatAdmin) });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/admins
export const createAdmin = async (req, res) => {
    try {
        const { name, email, password, role, status, employee_id } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        // Check duplicate email
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Map role from frontend display value to DB value
        const dbRole = mapRoleToDB(role || 'hrstaff');
        if (!ADMIN_ROLES.includes(dbRole)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Must be Super Admin or Admin' });
        }

        const dbStatus = (status === 'inactive' || status === 'disabled') ? 'disabled' : 'active';

        const user = await User.create({
            name,
            email,
            password, // hashed by model hook
            role: dbRole,
            status: dbStatus,
            employee_id: employee_id || null
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: formatAdmin(user)
        });
    } catch (error) {
        console.error('Create admin error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// PUT /api/admins/:id
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, status, employee_id } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Check if role is admin-level
        if (!ADMIN_ROLES.includes(user.role)) {
            return res.status(403).json({ success: false, message: 'This user is not an admin' });
        }

        // Check email uniqueness if changed
        if (email && email !== user.email) {
            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (role) {
            const dbRole = mapRoleToDB(role);
            if (ADMIN_ROLES.includes(dbRole)) user.role = dbRole;
        }
        if (status) {
            user.status = (status === 'inactive' || status === 'disabled') ? 'disabled' : 'active';
        }
        if (password && password.length >= 8) {
            user.password = password; // hashed by model hook
        }
        if (employee_id !== undefined) {
            user.employee_id = employee_id || null;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Admin updated successfully',
            data: formatAdmin(user)
        });
    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PATCH /api/admins/:id/toggle
export const toggleAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        if (!ADMIN_ROLES.includes(user.role)) {
            return res.status(403).json({ success: false, message: 'This user is not an admin' });
        }

        // Prevent disabling yourself
        if (req.user && req.user.id === user.id) {
            return res.status(400).json({ success: false, message: 'You cannot disable your own account' });
        }

        user.status = user.status === 'active' ? 'disabled' : 'active';
        await user.save({ hooks: false });

        res.json({
            success: true,
            message: `Admin ${user.status === 'active' ? 'enabled' : 'disabled'} successfully`,
            data: formatAdmin(user)
        });
    } catch (error) {
        console.error('Toggle admin error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/admins/:id
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        if (!ADMIN_ROLES.includes(user.role)) {
            return res.status(403).json({ success: false, message: 'This user is not an admin' });
        }

        // Prevent deleting yourself
        if (req.user && req.user.id === user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        await user.destroy();

        res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
