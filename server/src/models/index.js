import User from './user.model.js';
import Employee from './employee.model.js';
import DocumentCategory from './document_category.model.js';
import Document from './document.model.js';
import DocumentVersion from './document_version.model.js';
import Activity from './activity.model.js';

// ---- Relationships ----

// Employee <-> Document
Employee.hasMany(Document, { foreignKey: 'employee_id', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// DocumentCategory <-> Document
DocumentCategory.hasMany(Document, { foreignKey: 'category_id', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(DocumentCategory, { foreignKey: 'category_id', as: 'category' });

// Document <-> DocumentVersion
Document.hasMany(DocumentVersion, { foreignKey: 'document_id', as: 'versions', onDelete: 'CASCADE' });
DocumentVersion.belongsTo(Document, { foreignKey: 'document_id', as: 'parent_document' });

// User <-> DocumentVersion (Uploader)
User.hasMany(DocumentVersion, { foreignKey: 'uploaded_by', as: 'uploaded_versions' });
DocumentVersion.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

export {
    User,
    Employee,
    DocumentCategory,
    Document,
    DocumentVersion,
    Activity
};
