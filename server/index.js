import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDb } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// For serving uploaded files statically (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const JWT_SECRET = 'your-super-secret-key-for-dev'

// --- Middleware: Auth ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' })
        req.user = user
        next()
    })
}

// --- Multer config ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage })

// --- ROUTES: Auth ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const db = await getDb()
        const user = await db.get('SELECT * FROM admin_users WHERE email = ?', email)
        if (!user) return res.status(400).json({ error: 'User not found' })

        const validPass = await bcrypt.compare(password, user.password)
        if (!validPass) return res.status(400).json({ error: 'Invalid password' })

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' })

        // update last login
        await db.run('UPDATE admin_users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id])

        res.json({ token, user: { name: user.name, email: user.email, role: user.role } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// --- ROUTES: Employees ---
app.get('/api/employees', async (req, res) => {
    try {
        const db = await getDb()
        const emps = await db.all('SELECT * FROM employees')
        res.json(emps)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.get('/api/employees/:id', async (req, res) => {
    try {
        const db = await getDb()
        const emp = await db.get('SELECT * FROM employees WHERE id = ?', req.params.id)
        if (!emp) return res.status(404).json({ error: 'Employee not found' })
        res.json(emp)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// --- ROUTES: Documents ---
app.get('/api/documents/:employeeId', async (req, res) => {
    try {
        const db = await getDb()
        const docs = await db.all('SELECT * FROM documents WHERE employee_id = ?', req.params.employeeId)
        // Format them by category for the frontend
        const categorized = { identity: [], family: [], education: [], employment: [] }
        for (const d of docs) {
            if (categorized[d.category] !== undefined) {
                categorized[d.category].push({
                    id: d.id,
                    name: d.name,
                    status: d.status,
                    number: d.doc_number,
                    date: d.doc_date,
                    file: d.file_path,
                    version: d.version
                })
            }
        }
        res.json(categorized)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
    try {
        const { employeeId, docName, category, number, date } = req.body
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

        const db = await getDb()

        // Check if doc exists
        let doc = await db.get('SELECT id FROM documents WHERE employee_id = ? AND name = ?', [employeeId, docName])

        if (doc) {
            // Update existing
            await db.run(
                'UPDATE documents SET status = ?, doc_number = ?, doc_date = ?, file_path = ? WHERE id = ?',
                ['complete', number, date, req.file.path, doc.id]
            )
        } else {
            // Create new
            await db.run(
                'INSERT INTO documents (employee_id, category, name, status, doc_number, doc_date, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [employeeId, category, docName, 'complete', number, date, req.file.path]
            )
        }

        // Add activity
        await db.run(
            'INSERT INTO activities (employee_id, action, document_name, performed_by, created_at) VALUES (?, ?, ?, ?, ?)',
            [employeeId, doc ? 'Replace' : 'Upload', docName, 'Admin HR', new Date().toISOString()]
        )

        res.json({ message: 'Document uploaded successfully', filePath: req.file.path })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// --- ROUTES: Activities ---
app.get('/api/activities', async (req, res) => {
    try {
        const db = await getDb()
        const activities = await db.all('SELECT * FROM activities ORDER BY created_at DESC LIMIT 50')
        res.json(activities)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.get('/api/reports/statistics', async (req, res) => {
    try {
        const db = await getDb()
        const emps = await db.all('SELECT id FROM employees')
        const allDocs = await db.all('SELECT employee_id, status FROM documents WHERE status != "optional"')

        let completeCount = 0
        let incompleteCount = 0

        for (const emp of emps) {
            const eDocs = allDocs.filter(d => d.employee_id === emp.id)
            const hasIncomplete = eDocs.some(d => d.status === 'incomplete')
            if (hasIncomplete) incompleteCount++
            else completeCount++
        }

        res.json({
            success: true,
            data: {
                summary: {
                    totalEmployees: emps.length,
                    totalComplete: completeCount,
                    totalIncomplete: incompleteCount,
                    completionPercentage: emps.length > 0 ? Math.round((completeCount / emps.length) * 100) : 0
                },
                categories: []
            }
        })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// --- ROUTES: Analytics/Stats ---
app.get('/api/stats', async (req, res) => {
    try {
        const db = await getDb()
        const emps = await db.all('SELECT id FROM employees')
        const allDocs = await db.all('SELECT employee_id, status FROM documents WHERE status != "optional"')

        let completeCount = 0
        let incompleteCount = 0

        for (const emp of emps) {
            const eDocs = allDocs.filter(d => d.employee_id === emp.id)
            const hasIncomplete = eDocs.some(d => d.status === 'incomplete')
            if (hasIncomplete) incompleteCount++
            else completeCount++
        }

        res.json({
            totalEmployees: emps.length,
            totalComplete: completeCount,
            totalIncomplete: incompleteCount,
            completionPercentage: emps.length > 0 ? Math.round((completeCount / emps.length) * 100) : 0
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.get('/api/reports/missing', async (req, res) => {
    try {
        res.json({ success: true, data: [] })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// --- Admin ---
app.get('/api/admin/users', async (req, res) => {
    try {
        const db = await getDb()
        const users = await db.all('SELECT id, name, email, role, last_login, status FROM admin_users')
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
