// Database initialization script
// Run with: npx tsx scripts/init-db.ts

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    console.log('🔄 Connecting to Neon PostgreSQL...');
    console.log('   (This may take up to 30 seconds if the database is waking up)');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 60000,
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected to database successfully!');

        // Read schema file
        const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log('🔄 Running schema...');

        // Execute the entire schema as one transaction
        await client.query(schema);

        console.log('✅ Schema executed successfully!');

        // Verify tables exist
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

        // Count student data
        const counts = await Promise.all([
            client.query('SELECT COUNT(*)::int as count FROM students'),
            client.query('SELECT COUNT(*)::int as count FROM courses'),
        ]);

        console.log('\n📈 Data counts:');
        console.log(`   - Students: ${counts[0].rows[0].count}`);
        console.log(`   - Courses: ${counts[1].rows[0].count}`);

        client.release();
        console.log('\n🎉 Database initialization complete!');
        console.log('   You can now use the app at http://localhost:3000');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initDatabase();
