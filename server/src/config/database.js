import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server/.env
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

let sequelize;

if (process.env.DATABASE_URL) {
    // Railway / production: use DATABASE_URL directly
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === 'false' ? false : {
                require: true,
                rejectUnauthorized: false
            }
        },
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
    });
} else {
    // Local development: use individual DB_ variables
    sequelize = new Sequelize(
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
}

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
