const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration: 001_fix_gpa_overflow.sql');
        await client.query('BEGIN');

        // Check current column type before altering (optional safety check, but here we just alter)
        await client.query('ALTER TABLE students ALTER COLUMN gpa TYPE DECIMAL(5, 2)');
        await client.query('ALTER TABLE students ALTER COLUMN cgpa TYPE DECIMAL(5, 2)');

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
