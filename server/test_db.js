import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query("SELECT * FROM employees WHERE unit ILIKE '%THS%' LIMIT 5;");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
