import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Activity = sequelize.define('activities', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    employee_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    document_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    performed_by: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'activities',
    timestamps: true,
    updatedAt: false, // We only need created_at usually for log
    underscored: true
});

export default Activity;
