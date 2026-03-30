import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const DocumentCategory = sequelize.define('document_categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    doc_group: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_multiple: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    letter_types: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('letter_types');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('letter_types', value ? JSON.stringify(value) : null);
        }
    }
}, {
    tableName: 'document_categories',
    timestamps: false,
    underscored: true
});

export default DocumentCategory;
