// Clear all data from the database
// Run with: npx tsx scripts/clear-data.ts

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function clearData() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    console.log('🔄 Connecting to database...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 60000,
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected!');

        console.log('🗑️  Clearing all data...');

        // Delete in correct order (child tables first, respecting FK constraints)
        await client.query('DELETE FROM fee_records');
        await client.query('DELETE FROM assessments');
        await client.query('DELETE FROM attendance');
        await client.query('DELETE FROM academic_records');
        await client.query('DELETE FROM guardians');
        await client.query('DELETE FROM students');

        console.log('✅ All data cleared!');

        // Verify
        const tables = ['students', 'guardians', 'academic_records', 'attendance', 'assessments', 'fee_records'];
        console.log('\n📈 Current data:');
        for (const table of tables) {
            const countResult = await client.query(`SELECT COUNT(*)::int as count FROM ${table}`);
            console.log(`   - ${table}: ${countResult.rows[0].count}`);
        }

        client.release();
        console.log('\n✅ Database is now empty. Add real data through the app!');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

clearData();
