// Clear all sample data from the database
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

        // Delete in correct order (respecting foreign keys)
        await client.query('DELETE FROM attendance');
        await client.query('DELETE FROM enrollments');
        await client.query('DELETE FROM students');
        await client.query('DELETE FROM courses');

        console.log('✅ All data cleared!');

        // Verify
        const counts = await Promise.all([
            client.query('SELECT COUNT(*)::int as count FROM students'),
            client.query('SELECT COUNT(*)::int as count FROM courses'),
        ]);

        console.log('\n📈 Current data:');
        console.log(`   - Students: ${counts[0].rows[0].count}`);
        console.log(`   - Courses: ${counts[1].rows[0].count}`);

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
