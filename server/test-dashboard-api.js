async function test() {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'admin@hr.com', password: 'admin@123' })
    });

    if (!loginRes.ok) {
        console.error('Login failed', loginRes.status);
        console.log(await loginRes.text());
        return;
    }

    const loginJson = await loginRes.json();
    const token = loginJson.data.token;
    console.log('Logged in successfully', !!token);

    console.log('\nFetching /api/reports/statistics...');
    const statRes = await fetch('http://localhost:3001/api/reports/statistics', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    console.log('Stats Response Status:', statRes.status);
    console.log(JSON.stringify(await statRes.json(), null, 2));

    console.log('\nFetching /api/reports/missing?status=incomplete...');
    const missingRes = await fetch('http://localhost:3001/api/reports/missing?status=incomplete', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    console.log('Missing Response Status:', missingRes.status);
    console.log(JSON.stringify(await missingRes.json(), null, 2).slice(0, 1000) + '...\n(truncated)');

    console.log('\nFetching /api/reports/completeness...');
    const completenessRes = await fetch('http://localhost:3001/api/reports/completeness', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    console.log('Completeness Response Status:', completenessRes.status);
    console.log(JSON.stringify(await completenessRes.json(), null, 2).slice(0, 500) + '...\n(truncated)');
}

test();
