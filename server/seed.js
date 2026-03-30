import { getDb } from './db.js'
import bcrypt from 'bcryptjs'

async function seed() {
    const db = await getDb()

    console.log('Clearing existing data...')
    await db.exec('DELETE FROM activities;')
    await db.exec('DELETE FROM documents;')
    await db.exec('DELETE FROM employees;')
    await db.exec('DELETE FROM admin_users;')

    console.log('Seeding admin user...')
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash('admin123', salt)
    await db.run(
        'INSERT INTO admin_users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        ['Admin HR', 'admin@hr.com', hash, 'Super Admin', 'Active']
    )

    console.log('Seeding employees...')
    const employees = [
        { id: '782795', name: 'Ahmad Fauzi Rahman', unit: 'Human Capital', pos: 'HR Manager' },
        { id: '781234', name: 'Siti Nurhaliza', unit: 'Finance', pos: 'Finance Analyst' },
        { id: '783456', name: 'Budi Santoso', unit: 'Information Technology', pos: 'Software Engineer' },
        { id: '784567', name: 'Dewi Lestari', unit: 'Marketing', pos: 'Marketing Manager' },
        { id: '785678', name: 'Eko Prasetyo', unit: 'Operations', pos: 'Operations Lead' },
        { id: '786789', name: 'Fitri Handayani', unit: 'Human Capital', pos: 'HR Staff' },
        { id: '787890', name: 'Gunawan Wibowo', unit: 'Finance', pos: 'Accounting Staff' },
        { id: '788901', name: 'Hana Permata', unit: 'Information Technology', pos: 'UI/UX Designer' }
    ]

    const stmtEmp = await db.prepare('INSERT INTO employees (id, name, unit, position, photo, join_date) VALUES (?, ?, ?, ?, ?, ?)')
    for (const emp of employees) {
        await stmtEmp.run(emp.id, emp.name, emp.unit, emp.pos, null, '2023-01-01')
    }
    await stmtEmp.finalize()

    console.log('Seeding documents...')
    const docCats = [
        { cat: 'identity', items: ['KTP', 'KK', 'NPWP', 'Paspor', 'SIM'] },
        { cat: 'family', items: ['Akta Nikah', 'Kartu BPJS Keluarga', 'Akta Kelahiran Anak'] },
        { cat: 'education', items: ['Ijazah S1', 'Ijazah S2', 'Transkrip Nilai', 'Sertifikat Kompetensi'] },
        { cat: 'employment', items: ['SK Pengangkatan', 'Kontrak Kerja', 'Surat Mutasi'] }
    ]

    const stmtDoc = await db.prepare('INSERT INTO documents (employee_id, category, name, status, doc_number, doc_date) VALUES (?, ?, ?, ?, ?, ?)')

    for (const emp of employees) {
        for (const cat of docCats) {
            for (const item of cat.items) {
                // Mock logic for status
                let status = 'complete'
                if (['785678', '788901'].includes(emp.id) && ['KK', 'NPWP'].includes(item)) status = 'incomplete'
                if (emp.id === '782795' && ['NPWP', 'Kartu BPJS Keluarga'].includes(item)) status = 'incomplete'
                // Some optional ones
                if (['Paspor', 'SIM', 'Ijazah S2'].includes(item)) status = 'optional'

                await stmtDoc.run(emp.id, cat.cat, item, status, status === 'complete' ? '123456' : null, status === 'complete' ? '2023-01-01' : null)
            }
        }
    }
    await stmtDoc.finalize()

    console.log('Seeding activities...')
    await db.run('INSERT INTO activities (employee_id, action, document_name, performed_by, created_at) VALUES (?, ?, ?, ?, ?)',
        ['782795', 'Upload KTP', 'KTP', 'Admin HR', new Date(Date.now() - 14 * 86400000).toISOString()]
    )
    await db.run('INSERT INTO activities (employee_id, action, document_name, performed_by, created_at) VALUES (?, ?, ?, ?, ?)',
        ['782795', 'Replace KTP', 'KTP', 'Admin HR', new Date(Date.now() - 30 * 86400000).toISOString()]
    )

    console.log('Database seeded successfully.')
}

seed().catch(console.error)
