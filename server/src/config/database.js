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

// Detect database connection method:
// 1. DATABASE_URL (Railway reference or manual)
// 2. PGHOST (Railway PostgreSQL auto-injected)
// 3. DB_HOST (local development .env)
const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const pgHost = process.env.PGHOST;

if (dbUrl) {
    // Railway / production: use DATABASE_URL directly
    console.log('🔗 Connecting via DATABASE_URL...');
    sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: dbUrl.includes('.railway.internal') ? {} : {
            ssl: {
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
} else if (pgHost) {
    // Railway PostgreSQL: use PG* variables
    console.log('🔗 Connecting via PG* variables...');
    sequelize = new Sequelize(
        process.env.PGDATABASE || 'railway',
        process.env.PGUSER || 'postgres',
        process.env.PGPASSWORD || '',
        {
            host: pgHost,
            port: parseInt(process.env.PGPORT, 10) || 5432,
            dialect: 'postgres',
            logging: false,
            dialectOptions: {
                ssl: {
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
        }
    );
} else {
    // Local development: use individual DB_ variables
    console.log('🔗 Connecting via DB_* variables (local)...');
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
