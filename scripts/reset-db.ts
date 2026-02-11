// Reset database - Drop all old tables and create fresh schema
// Run with: npx tsx scripts/reset-db.ts

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    console.log('🔄 Connecting to Neon PostgreSQL...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 60000,
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected!');

        // Drop all tables (child tables first due to FK constraints)
        console.log('🗑️  Dropping old tables...');
        await client.query(`
      DROP TABLE IF EXISTS fee_records CASCADE;
      DROP TABLE IF EXISTS assessments CASCADE;
      DROP TABLE IF EXISTS attendance CASCADE;
      DROP TABLE IF EXISTS academic_records CASCADE;
      DROP TABLE IF EXISTS guardians CASCADE;
      DROP TABLE IF EXISTS enrollments CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
    `);
        console.log('✅ Old tables dropped!');

        // Read and execute new schema
        const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log('🔄 Creating new schema (6 normalized tables)...');
        await client.query(schema);
        console.log('✅ Schema created!');

        // Verify
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

        console.log('\n📊 Tables in database:');
        tablesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });

        client.release();
        console.log('\n🎉 Database reset complete!');
        console.log('   You now have 6 normalized tables: students, guardians, academic_records, attendance, assessments, fee_records');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

resetDatabase();
