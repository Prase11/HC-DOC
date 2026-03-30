import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Employee = sequelize.define('employees', {
    employee_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Employee ID is required' }
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Employee name is required' },
            len: {
                args: [2, 100],
                msg: 'Name must be between 2 and 100 characters'
            }
        }
    },
    unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null
    },
    position: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null
    },
    photo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: {
                args: [['active', 'inactive', 'suspended']],
                msg: 'Status must be active, inactive, or suspended'
            }
        }
    }
}, {
    tableName: 'employees',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['name'] },
        { fields: ['unit'] },
        { fields: ['status'] }
    ]
});

export default Employee;
