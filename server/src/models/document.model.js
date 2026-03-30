import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Document = sequelize.define('documents', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'incomplete',
        validate: {
            isIn: {
                args: [['complete', 'incomplete', 'optional']],
                msg: 'Status must be complete, incomplete, or optional'
            }
        }
    }
}, {
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['employee_id'] },
        { fields: ['category_id'] },
        { fields: ['status'] },
        { fields: ['employee_id', 'category_id'], unique: true }
    ]
});

export default Document;
