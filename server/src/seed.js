/**
 * Enterprise HR E-Dossier Database Seeder
 * Run with: npm run seed:pg
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

import { sequelize, testConnection } from './config/database.js';
// Import index.js to ensure all associations and models load
import { DocumentCategory } from './models/index.js';
import employeeService from './services/employee.service.js';

const sampleEmployees = [
    { employee_id: '782795', name: 'Prasetyo Nugroho', unit: 'THS-1', position: 'Technician', status: 'active' },
    { employee_id: '781234', name: 'Siti Nurhaliza', unit: 'HRD', position: 'HR Manager', status: 'active' },
    { employee_id: '783456', name: 'Budi Santoso', unit: 'THS-2', position: 'Lead Engineer', status: 'active' },
    { employee_id: '784567', name: 'Dewi Lestari', unit: 'FIN', position: 'Finance Analyst', status: 'active' },
    { employee_id: '785678', name: 'Eko Prasetyo', unit: 'THS-1', position: 'Senior Technician', status: 'active' },
    { employee_id: '786789', name: 'Fitri Handayani', unit: 'HRD', position: 'Recruitment Specialist', status: 'active' },
    { employee_id: '787890', name: 'Gunawan Wibowo', unit: 'IT', position: 'System Administrator', status: 'active' },
    { employee_id: '788901', name: 'Hana Permata', unit: 'MKT', position: 'Marketing Lead', status: 'active' },
    { employee_id: '789012', name: 'Irfan Maulana', unit: 'THS-2', position: 'Mechanical Engineer', status: 'active' },
    { employee_id: '790123', name: 'Joko Widodo', unit: 'OPS', position: 'Operations Manager', status: 'active' },
    { employee_id: '791234', name: 'Kartika Sari', unit: 'FIN', position: 'Accountant', status: 'active' },
    { employee_id: '792345', name: 'Lukman Hakim', unit: 'IT', position: 'Full Stack Developer', status: 'active' },
    { employee_id: '793456', name: 'Maya Angelina', unit: 'HRD', position: 'Training Coordinator', status: 'active' },
    { employee_id: '794567', name: 'Nanda Pratama', unit: 'THS-1', position: 'Instrument Technician', status: 'inactive' },
    { employee_id: '795678', name: 'Oscar Firmansyah', unit: 'OPS', position: 'Shift Supervisor', status: 'active' }
];

const documentCategories = [
    // Identity
    { name: 'KTP', doc_group: 'identity', is_required: true },
    { name: 'KK', doc_group: 'identity', is_required: true },
    { name: 'NPWP', doc_group: 'identity', is_required: true },
    { name: 'Akta Kelahiran', doc_group: 'identity', is_required: true },
    { name: 'Buku Rekening', doc_group: 'identity', is_required: true },
    // Family
    { name: 'Buku Nikah', doc_group: 'family', is_required: true },
    { name: 'KTP Istri', doc_group: 'family', is_required: true },
    { name: 'Akta Kelahiran Anak', doc_group: 'family', is_required: true },
    { name: 'KK Orang Tua', doc_group: 'family', is_required: true },
    { name: 'Mertua', doc_group: 'family', is_required: true },
    // Education
    { name: 'Ijazah S1', doc_group: 'education', is_required: true },
    { name: 'Ijazah S2', doc_group: 'education', is_required: true },
    { name: 'Transkrip Nilai', doc_group: 'education', is_required: true },
    { name: 'Sertifikat Kompetensi', doc_group: 'education', is_required: true },
    // Letters
    { name: 'SK Pengangkatan Pegawai', doc_group: 'employee_letters', is_required: true },
    { name: 'SK Promosi', doc_group: 'employee_letters', is_required: false },
    { name: 'SK Non-Struktural', doc_group: 'employee_letters', is_required: false },
    { name: 'SK Mutasi Struktural', doc_group: 'employee_letters', is_required: false },
    { name: 'SK Perbantuan', doc_group: 'employee_letters', is_required: false },
    { name: 'SK CDTP', doc_group: 'employee_letters', is_required: false },
    { name: 'SK Mutasi OSA', doc_group: 'employee_letters', is_required: false }
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting Enterprise database seed...\n');

        await testConnection();
        // Drop and recreate all tables based on index.js relationships
        await sequelize.sync({ force: true });
        console.log('✅ Tables created.\n');

        // 0. Seed Admin User
        console.log('⏳ Seeding Admin User...');
        const User = (await import('./models/user.model.js')).default;
        await User.create({
            name: 'Admin HC',
            email: 'admin@hc.com',
            password: '123456789',
            role: 'superadmin',
            status: 'active'
        });
        console.log('✅ Admin user created (admin@hc.com).\n');

        // 1. Seed Categories
        console.log('⏳ Seeding Document Categories...');
        await DocumentCategory.bulkCreate(documentCategories);
        console.log('✅ Categories created.\n');

        // 2. Seed Employees AND Auto-Generate their Document Stubs
        console.log('⏳ Seeding Employees...');
        for (const emp of sampleEmployees) {
            await employeeService.create(emp);
            console.log(`   ✓ Created: ${emp.employee_id} - ${emp.name} (with 15 required document stubs)`);
        }

        console.log(`\n✅ Seeded ${sampleEmployees.length} employees successfully.`);
        console.log('🎉 Database is ready for enterprise usage!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
