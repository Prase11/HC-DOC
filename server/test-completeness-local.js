import { sequelize } from './src/config/database.js';
import { getCompletenessReport } from './src/controllers/report.controller.js';

async function test() {
    await sequelize.authenticate();
    console.log('DB connected');

    const req = { query: {} };
    const res = {
        json: (data) => console.log('JSON returned:', JSON.stringify(data, null, 2).slice(0, 500) + '...'),
        status: (code) => {
            console.log('Status set to:', code);
            return {
                json: (data) => console.log('JSON error returned:', JSON.stringify(data, null, 2))
            };
        }
    };

    console.log('Running getCompletenessReport...');
    try {
        await getCompletenessReport(req, res);
    } catch (e) {
        console.error("Uncaught error:", e);
    }

    process.exit(0);
}

test();
