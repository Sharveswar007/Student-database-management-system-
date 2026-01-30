import { Pool, QueryResult } from 'pg';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create a connection pool for PostgreSQL
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 30000, // Increased for Neon cold start (30 seconds)
});

// Helper function for executing SQL queries with parameterized values
export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
        const result = await pool.query<T>(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', {
            text: text.substring(0, 100),
            duration: `${duration}ms`,
            rows: result.rowCount
        });
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Get a single client from the pool for transactions
export async function getClient() {
    const client = await pool.connect();
    return client;
}

// Graceful shutdown
export async function closePool() {
    await pool.end();
}
