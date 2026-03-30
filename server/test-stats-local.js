import { sequelize } from './src/config/database.js';
import { getStatistics } from './src/controllers/report.controller.js';

async function test() {
    await sequelize.authenticate();
    console.log('DB connected');

    const req = {};
    const res = {
        json: (data) => console.log('JSON returned:', JSON.stringify(data, null, 2)),
        status: (code) => {
            console.log('Status set to:', code);
            return {
                json: (data) => console.log('JSON error returned:', JSON.stringify(data, null, 2))
            };
        }
    };

    console.log('Running getStatistics...');
    await getStatistics(req, res);

    process.exit(0);
}

test();
