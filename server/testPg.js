import { sequelize } from './src/config/database.js';
import DocumentCategory from './src/models/document_category.model.js';

async function run() {
    try {
        await sequelize.authenticate();
        const row = await DocumentCategory.findOne({ where: { name: 'SK Pengangkatan Pegawai' } });
        console.log("DB RESULT:");
        console.log(JSON.stringify(row, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

run();
