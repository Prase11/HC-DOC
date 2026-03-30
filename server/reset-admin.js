import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

const sequelize = new Sequelize('postgres://postgres:admin1107@localhost:5432/edossier_db');

const User = sequelize.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(20), defaultValue: 'superadmin' },
    status: { type: DataTypes.STRING(20), defaultValue: 'active' }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin@123', salt);

        const [user, created] = await User.upsert({
            name: 'Super Admin',
            email: 'admin@hr.com',
            password: hashedPassword,
            role: 'superadmin',
            status: 'active'
        }, { returning: true });

        console.log('User synced:', user.email, 'password: admin@123');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

run();
