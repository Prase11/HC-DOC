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
        if (!token) return;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const getRes = await request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/doctypes',
            method: 'GET',
            headers
        });
        console.log("ALL DOCTYPES:");
        console.log(JSON.stringify(getRes.data, null, 2));

    } catch (e) {
        console.error(e);
    }
}

runTest();
