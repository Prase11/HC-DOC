import http from 'http';

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    try {
        console.log('0. Logging in...');
        const loginRes = await request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'admin@hcdoc.com',
            password: 'Password123!'
        });

        const token = loginRes.data?.token;
        if (!token) {
            console.log('Login failed:', loginRes);
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('1. Creating Document Type with letter_types...');
        const createRes = await request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/doctypes',
            method: 'POST',
            headers
        }, {
            name: 'Test Surat Custom',
            doc_group: 'employment',
            is_multiple: true,
            letter_types: ['Tipe A', 'Tipe B']
        });
        console.log(JSON.stringify(createRes, null, 2));

        console.log('\n2. Fetching Document Types...');
        const getRes = await request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/doctypes',
            method: 'GET',
            headers
        });
        const myDoc = getRes.data ? getRes.data.find(d => d.name === 'Test Surat Custom') : null;
        console.log(JSON.stringify(myDoc, null, 2));

        if (myDoc && myDoc.id) {
            console.log('\n3. Updating Document Type...');
            const updateRes = await request({
                hostname: 'localhost',
                port: 3001,
                path: `/api/doctypes/${myDoc.id}`,
                method: 'PUT',
                headers
            }, {
                name: 'Test Surat Custom',
                letter_types: ['Tipe A', 'Tipe B', 'Tipe C']
            });
            console.log(JSON.stringify(updateRes, null, 2));

            console.log('\n4. Deleting Document Type (Cleanup)...');
            const delRes = await request({
                hostname: 'localhost',
                port: 3001,
                path: `/api/doctypes/${myDoc.id}`,
                method: 'DELETE',
                headers
            });
            console.log(JSON.stringify(delRes, null, 2));
        }

    } catch (e) {
        console.error('ERROR OCCURRED:');
        console.error(e.message);
        console.error(e.stack);
    }
}

runTest();
