import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
    try {
        const employeeId = '582131';

        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign({ id: 1, role: 'superadmin' }, process.env.JWT_SECRET || 'hcdoc_secure_jwt_secret_key_2026', { expiresIn: '1h' });

        const uploadRes = await fetch(`http://localhost:3001/api/documents/${employeeId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const json = await uploadRes.json();
        fs.writeFileSync('output.txt', JSON.stringify(json, null, 2));

    } catch (e) {
        console.error('SCRIPT ERROR: ', e);
    }
}
run();
