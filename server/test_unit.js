import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function run() {
  try {
    const res = await pool.query("SELECT DISTINCT unit FROM employees LIMIT 10;");
    console.log("SAMPLE UNITS:", res.rows.map(r=>r.unit));
    
    const res2 = await pool.query("SELECT employee_id, name, unit FROM employees WHERE unit ILIKE '%THS%';");
    console.log("SEARCH ILIKE THS:", res2.rows.slice(0, 3));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
