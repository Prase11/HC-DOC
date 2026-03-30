import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import { sequelize, testConnection } from './src/config/database.js';
import User from './src/models/user.model.js';

const createAdmin = async () => {
    try {
        await testConnection();
        // Force sync user table just in case it's not created
        await User.sync();

        const existingAdmin = await User.findOne({ where: { email: 'admin@hcdoc.com' } });
        if (existingAdmin) {
            console.log('✅ Admin user already exists. Email: admin@hcdoc.com, Password: Password123!');
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Super Administrator',
            email: 'admin@hcdoc.com',
            password: 'Password123!',
            role: 'superadmin',
            status: 'active'
        });

        console.log('✅ Admin user created successfully!');
        console.log(`👤 Name: ${admin.name}`);
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Password: Password123!`);
        console.log(`🛡️ Role: ${admin.role}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create admin user:', error.message);
        process.exit(1);
    }
};

createAdmin();
