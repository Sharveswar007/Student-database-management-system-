'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ActionResponse, Category } from '@/lib/types';

// Get all categories with product counts
export async function getAllCategories(): Promise<ActionResponse<Category[]>> {
    try {
        const result = await query<Category>(`
      SELECT c.*, 
             COUNT(p.id)::integer as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: 'Failed to fetch categories' };
    }
}

// Get a single category by ID
export async function getCategoryById(id: number): Promise<ActionResponse<Category>> {
    try {
        const result = await query<Category>(
            `SELECT c.*, 
              COUNT(p.id)::integer as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       WHERE c.id = $1
       GROUP BY c.id`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Category not found' };
        }

        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error fetching category:', error);
        return { success: false, error: 'Failed to fetch category' };
    }
}

// Create a new category
export async function createCategory(data: {
    name: string;
    description?: string;
}): Promise<ActionResponse<Category>> {
    try {
        const result = await query<Category>(
            `INSERT INTO categories (name, description) 
       VALUES ($1, $2) 
       RETURNING *`,
            [data.name, data.description || null]
        );

        revalidatePath('/dashboard/categories');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error creating category:', error);
        if (error.code === '23505') {
            return { success: false, error: 'A category with this name already exists' };
        }
        return { success: false, error: 'Failed to create category' };
    }
}

// Update an existing category
export async function updateCategory(
    id: number,
    data: { name?: string; description?: string }
): Promise<ActionResponse<Category>> {
    try {
        const result = await query<Category>(
            `UPDATE categories 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description)
       WHERE id = $3 
       RETURNING *`,
            [data.name, data.description, id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Category not found' };
        }

        revalidatePath('/dashboard/categories');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error updating category:', error);
        if (error.code === '23505') {
            return { success: false, error: 'A category with this name already exists' };
        }
        return { success: false, error: 'Failed to update category' };
    }
}

// Delete a category
export async function deleteCategory(id: number): Promise<ActionResponse<void>> {
    try {
        const result = await query('DELETE FROM categories WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return { success: false, error: 'Category not found' };
        }

        revalidatePath('/dashboard/categories');
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: 'Failed to delete category' };
    }
}

// Get category count
export async function getCategoryCount(): Promise<ActionResponse<number>> {
    try {
        const result = await query<{ count: string }>('SELECT COUNT(*) as count FROM categories');
        return { success: true, data: parseInt(result.rows[0].count) };
    } catch (error) {
        console.error('Error counting categories:', error);
        return { success: false, error: 'Failed to count categories' };
    }
}
