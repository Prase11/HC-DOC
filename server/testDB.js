import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const DocumentCategory = sequelize.define('DocumentCategory', {
    name: { type: DataTypes.STRING },
    doc_group: { type: DataTypes.STRING },
    is_multiple: { type: DataTypes.BOOLEAN },
    letter_types: { type: DataTypes.JSON }
}, {
    tableName: 'document_categories',
    timestamps: true
});

async function run() {
    const row = await DocumentCategory.findOne({ where: { name: 'SK Pengangkatan Pegawai' } });
    console.log(JSON.stringify(row, null, 2));
}

run();
