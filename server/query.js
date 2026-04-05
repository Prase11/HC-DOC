import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query("SELECT unit FROM employees LIMIT 5;");
    console.log("SAMPLE UNITS:", res.rows);

    const res2 = await pool.query("SELECT * FROM employees WHERE unit ILIKE '%THS%';");
    console.log("SEARCH ILIKE:", res2.rowCount, "rows found");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
