import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server/.env
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'edossier_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to PostgreSQL:', error.message);
        process.exit(1);
    }
};

export { sequelize, testConnection };
