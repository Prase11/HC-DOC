async function run() {
    try {
        const res = await fetch('http://localhost:3001/storage/e-dossier/582131/identity/ktp_1772888820481-892075246.png');
        console.log('STATUS:', res.status);
        console.log('CONTENT-TYPE:', res.headers.get('content-type'));
        console.log('CONTENT-LENGTH:', res.headers.get('content-length'));
    } catch (e) {
        console.error(e);
    }
}
run();
