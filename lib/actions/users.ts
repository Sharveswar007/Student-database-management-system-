'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ActionResponse, User, UserFilters } from '@/lib/types';

// Get all users with optional filtering
export async function getAllUsers(filters?: UserFilters): Promise<ActionResponse<User[]>> {
    try {
        let sql = 'SELECT id, email, name, role, created_at, updated_at FROM users WHERE 1=1';
        const params: any[] = [];
        let paramCount = 1;

        if (filters?.role) {
            sql += ` AND role = $${paramCount}`;
            params.push(filters.role);
            paramCount++;
        }

        if (filters?.search) {
            sql += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
            paramCount++;
        }

        sql += ' ORDER BY created_at DESC';

        if (filters?.limit) {
            sql += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
            paramCount++;
        }

        if (filters?.offset) {
            sql += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }

        const result = await query<User>(sql, params);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: 'Failed to fetch users' };
    }
}

// Get a single user by ID
export async function getUserById(id: number): Promise<ActionResponse<User>> {
    try {
        const result = await query<User>(
            'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: 'Failed to fetch user' };
    }
}

// Create a new user
export async function createUser(data: {
    email: string;
    name: string;
    password: string;
    role?: 'user' | 'admin';
}): Promise<ActionResponse<User>> {
    try {
        const result = await query<User>(
            `INSERT INTO users (email, name, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role, created_at, updated_at`,
            [data.email, data.name, data.password, data.role || 'user']
        );

        revalidatePath('/dashboard/users');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // Unique violation
            return { success: false, error: 'A user with this email already exists' };
        }
        return { success: false, error: 'Failed to create user' };
    }
}

// Update an existing user
export async function updateUser(
    id: number,
    data: { name?: string; email?: string; role?: 'user' | 'admin' }
): Promise<ActionResponse<User>> {
    try {
        const result = await query<User>(
            `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           role = COALESCE($3, role),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, email, name, role, created_at, updated_at`,
            [data.name, data.email, data.role, id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'User not found' };
        }

        revalidatePath('/dashboard/users');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error updating user:', error);
        if (error.code === '23505') {
            return { success: false, error: 'A user with this email already exists' };
        }
        return { success: false, error: 'Failed to update user' };
    }
}

// Delete a user
export async function deleteUser(id: number): Promise<ActionResponse<void>> {
    try {
        const result = await query('DELETE FROM users WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return { success: false, error: 'User not found' };
        }

        revalidatePath('/dashboard/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

// Search users by name or email
export async function searchUsers(searchTerm: string): Promise<ActionResponse<User[]>> {
    try {
        const result = await query<User>(
            `SELECT id, email, name, role, created_at, updated_at 
       FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY name ASC`,
            [`%${searchTerm}%`]
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error searching users:', error);
        return { success: false, error: 'Search failed' };
    }
}

// Get user count
export async function getUserCount(): Promise<ActionResponse<number>> {
    try {
        const result = await query<{ count: string }>('SELECT COUNT(*) as count FROM users');
        return { success: true, data: parseInt(result.rows[0].count) };
    } catch (error) {
        console.error('Error counting users:', error);
        return { success: false, error: 'Failed to count users' };
    }
}
