import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Document from './document.model.js';
import User from './user.model.js';

const DocumentVersion = sequelize.define('document_versions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'documents',
            key: 'id'
        }
    },
    version_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    letter_type: {
        type: DataTypes.STRING(255)
    },
    letter_number: {
        type: DataTypes.STRING(255)
    },
    letter_date: {
        type: DataTypes.DATEONLY
    },
    file_path: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'document_versions',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: false,
    underscored: true
});

export default DocumentVersion;
