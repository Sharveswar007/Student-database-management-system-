// PBL II Review 2 — Push all queries to Neon PostgreSQL
// Run with: npx tsx scripts/run-pbl-queries.ts

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// ─── Split SQL into individual statements ─────────────────────────────────────
// We split on semicolons but ignore those inside string literals and $$ blocks.
function splitStatements(sql: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inDollarBlock = false;
    let dollarTag = '';
    let i = 0;

    while (i < sql.length) {
        // Detect start/end of $$ dollar-quoted blocks (functions, triggers)
        if (!inDollarBlock) {
            const tagMatch = sql.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
            if (tagMatch) {
                inDollarBlock = true;
                dollarTag = tagMatch[1];
                current += dollarTag;
                i += dollarTag.length;
                continue;
            }
        } else {
            if (sql.slice(i).startsWith(dollarTag)) {
                inDollarBlock = false;
                current += dollarTag;
                i += dollarTag.length;
                continue;
            }
        }

        const char = sql[i];

        if (char === ';' && !inDollarBlock) {
            const stmt = current.trim();
            if (stmt.length > 0) statements.push(stmt);
            current = '';
        } else {
            current += char;
        }
        i++;
    }

    const last = current.trim();
    if (last.length > 0) statements.push(last);

    return statements.filter(s => {
        // Skip pure comment-only blocks
        const stripped = s.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        return stripped.length > 0;
    });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function runPBLQueries() {
    if (!process.env.DATABASE_URL) {
        console.error('❌  DATABASE_URL is not set in .env');
        console.error('    Create a .env file in the project root with:');
        console.error('    DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"');
        process.exit(1);
    }

    console.log('🔄  Connecting to Neon PostgreSQL...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 60_000,
    });

    const client = await pool.connect();
    console.log('✅  Connected!\n');

    const sqlPath = path.join(__dirname, 'pbl-queries.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const statements = splitStatements(sql);

    console.log(`📋  Found ${statements.length} SQL statements to execute.\n`);

    let passed = 0;
    let skipped = 0;
    let failed = 0;

    for (let idx = 0; idx < statements.length; idx++) {
        const stmt = statements[idx];

        // Extract a short label from the statement
        const firstLine = stmt.split('\n').find(l => l.trim() && !l.trim().startsWith('--')) || stmt;
        const label = firstLine.slice(0, 80).trim();

        process.stdout.write(`[${String(idx + 1).padStart(3, '0')}] ${label}... `);

        try {
            const result = await client.query(stmt);

            // If it's a SELECT, print the rows
            if (result.rows && result.rows.length > 0) {
                console.log(`✅  (${result.rows.length} rows)`);
                // Print up to 5 rows for SELECT statements
                if (stmt.trim().toUpperCase().startsWith('SELECT')) {
                    const preview = result.rows.slice(0, 5);
                    preview.forEach(row => console.log('    ', JSON.stringify(row)));
                    if (result.rows.length > 5) {
                        console.log(`    ... and ${result.rows.length - 5} more rows`);
                    }
                }
            } else {
                const rowcount = result.rowCount ?? 0;
                console.log(`✅  (${result.command} — ${rowcount} row(s) affected)`);
            }
            passed++;
        } catch (err: any) {
            // Some ALTER statements may fail if constraint already exists — treat as warning
            if (
                err.message.includes('already exists') ||
                err.message.includes('does not exist') ||
                err.code === '42710' || // duplicate_object
                err.code === '42P07'    // duplicate_table
            ) {
                console.log(`⚠️   Skipped (already exists): ${err.message.slice(0, 80)}`);
                skipped++;
            } else {
                console.error(`❌  FAILED: ${err.message}`);
                failed++;
            }
        }
    }

    client.release();
    await pool.end();

    console.log('\n' + '═'.repeat(60));
    console.log(`✅  Passed  : ${passed}`);
    console.log(`⚠️   Skipped : ${skipped}`);
    console.log(`❌  Failed  : ${failed}`);
    console.log('═'.repeat(60));

    if (failed === 0) {
        console.log('\n🎉  All PBL II Review 2 SQL queries pushed to Neon successfully!');
    } else {
        console.log('\n⚠️  Some statements failed — review the output above.');
        process.exit(1);
    }
}

runPBLQueries().catch(err => {
    console.error('❌  Fatal error:', err.message);
    process.exit(1);
});
