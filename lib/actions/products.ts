'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ActionResponse, Product, ProductFilters, ProductStats } from '@/lib/types';

// Get all products with filtering, sorting, and pagination
export async function getAllProducts(filters?: ProductFilters): Promise<ActionResponse<Product[]>> {
    try {
        let sql = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramCount = 1;

        if (filters?.category_id) {
            sql += ` AND p.category_id = $${paramCount}`;
            params.push(filters.category_id);
            paramCount++;
        }

        if (filters?.min_price !== undefined) {
            sql += ` AND p.price >= $${paramCount}`;
            params.push(filters.min_price);
            paramCount++;
        }

        if (filters?.max_price !== undefined) {
            sql += ` AND p.price <= $${paramCount}`;
            params.push(filters.max_price);
            paramCount++;
        }

        if (filters?.search) {
            sql += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
            paramCount++;
        }

        sql += ' GROUP BY p.id, c.name';

        // Sorting
        const sortColumn = filters?.sort_by || 'created_at';
        const sortOrder = filters?.sort_order || 'DESC';
        sql += ` ORDER BY p.${sortColumn} ${sortOrder}`;

        if (filters?.limit) {
            sql += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
            paramCount++;
        }

        if (filters?.offset) {
            sql += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }

        const result = await query<Product>(sql, params);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching products:', error);
        return { success: false, error: 'Failed to fetch products' };
    }
}

// Get a single product by ID with category info
export async function getProductById(id: number): Promise<ActionResponse<Product>> {
    try {
        const result = await query<Product>(
            `SELECT p.*, c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, c.name`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Product not found' };
        }

        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error fetching product:', error);
        return { success: false, error: 'Failed to fetch product' };
    }
}

// Create a new product
export async function createProduct(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category_id?: number;
}): Promise<ActionResponse<Product>> {
    try {
        const result = await query<Product>(
            `INSERT INTO products (name, description, price, stock, category_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [data.name, data.description || null, data.price, data.stock, data.category_id || null]
        );

        revalidatePath('/dashboard/products');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating product:', error);
        return { success: false, error: 'Failed to create product' };
    }
}

// Update an existing product
export async function updateProduct(
    id: number,
    data: {
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
        category_id?: number;
    }
): Promise<ActionResponse<Product>> {
    try {
        const result = await query<Product>(
            `UPDATE products 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           category_id = COALESCE($5, category_id),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING *`,
            [data.name, data.description, data.price, data.stock, data.category_id, id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Product not found' };
        }

        revalidatePath('/dashboard/products');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: 'Failed to update product' };
    }
}

// Delete a product
export async function deleteProduct(id: number): Promise<ActionResponse<void>> {
    try {
        const result = await query('DELETE FROM products WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return { success: false, error: 'Product not found' };
        }

        revalidatePath('/dashboard/products');
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}

// Get product statistics using aggregate functions
export async function getProductStats(): Promise<ActionResponse<ProductStats>> {
    try {
        const result = await query<ProductStats>(`
      SELECT 
        COUNT(*)::integer as total_products,
        COALESCE(SUM(stock), 0)::integer as total_stock,
        COALESCE(AVG(price), 0)::numeric(10,2) as avg_price,
        COALESCE(MAX(price), 0)::numeric(10,2) as max_price,
        COALESCE(MIN(price), 0)::numeric(10,2) as min_price
      FROM products
    `);
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error getting product stats:', error);
        return { success: false, error: 'Failed to get stats' };
    }
}

// Get low stock products
export async function getLowStockProducts(threshold: number = 10): Promise<ActionResponse<Product[]>> {
    try {
        const result = await query<Product>(
            `SELECT p.*, c.name as category_name
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock < $1
       ORDER BY p.stock ASC`,
            [threshold]
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        return { success: false, error: 'Failed to fetch low stock products' };
    }
}
