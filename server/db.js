import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.resolve(__dirname, 'dossier.db')

// Make sure the uploads folder exists
const uploadsPath = path.resolve(__dirname, 'uploads')
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true })
}

let dbInstance = null

export async function getDb() {
    if (dbInstance) return dbInstance

    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })

    await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      position TEXT NOT NULL,
      photo TEXT,
      join_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      doc_number TEXT,
      doc_date TEXT,
      file_path TEXT,
      version TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      action TEXT NOT NULL,
      document_name TEXT,
      performed_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      last_login TEXT,
      status TEXT NOT NULL
    );
  `)

    return dbInstance
}
