'use server';

import { query, getClient } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ActionResponse, Order, OrderItem, OrderFilters } from '@/lib/types';

// Get all orders with user info
export async function getAllOrders(filters?: OrderFilters): Promise<ActionResponse<Order[]>> {
    try {
        let sql = `
      SELECT o.*, 
             u.name as user_name, 
             u.email as user_email
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramCount = 1;

        if (filters?.user_id) {
            sql += ` AND o.user_id = $${paramCount}`;
            params.push(filters.user_id);
            paramCount++;
        }

        if (filters?.status) {
            sql += ` AND o.status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        sql += ' ORDER BY o.created_at DESC';

        if (filters?.limit) {
            sql += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
            paramCount++;
        }

        if (filters?.offset) {
            sql += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }

        const result = await query<Order>(sql, params);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
}

// Get a single order by ID with items
export async function getOrderById(id: number): Promise<ActionResponse<Order>> {
    try {
        // Get order details
        const orderResult = await query<Order>(
            `SELECT o.*, 
              u.name as user_name, 
              u.email as user_email
       FROM orders o
       INNER JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
            [id]
        );

        if (orderResult.rows.length === 0) {
            return { success: false, error: 'Order not found' };
        }

        // Get order items with product info
        const itemsResult = await query<OrderItem>(
            `SELECT oi.*, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
            [id]
        );

        const order = orderResult.rows[0];
        order.items = itemsResult.rows;

        return { success: true, data: order };
    } catch (error) {
        console.error('Error fetching order:', error);
        return { success: false, error: 'Failed to fetch order' };
    }
}

// Create a new order with items (using transaction)
export async function createOrder(data: {
    user_id: number;
    items: Array<{ product_id: number; quantity: number; price: number }>;
}): Promise<ActionResponse<Order>> {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // Calculate total amount
        const totalAmount = data.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Insert order
        const orderResult = await client.query<Order>(
            `INSERT INTO orders (user_id, total_amount, status) 
       VALUES ($1, $2, 'pending') 
       RETURNING *`,
            [data.user_id, totalAmount]
        );

        const order = orderResult.rows[0];

        // Insert order items
        for (const item of data.items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.quantity, item.price]
            );

            // Update product stock
            await client.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        await client.query('COMMIT');

        revalidatePath('/dashboard/orders');
        return { success: true, data: order };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', error);
        return { success: false, error: 'Failed to create order' };
    } finally {
        client.release();
    }
}

// Update order status
export async function updateOrderStatus(
    id: number,
    status: Order['status']
): Promise<ActionResponse<Order>> {
    try {
        const result = await query<Order>(
            `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Order not found' };
        }

        revalidatePath('/dashboard/orders');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error updating order:', error);
        return { success: false, error: 'Failed to update order' };
    }
}

// Delete an order
export async function deleteOrder(id: number): Promise<ActionResponse<void>> {
    try {
        const result = await query('DELETE FROM orders WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return { success: false, error: 'Order not found' };
        }

        revalidatePath('/dashboard/orders');
        return { success: true };
    } catch (error) {
        console.error('Error deleting order:', error);
        return { success: false, error: 'Failed to delete order' };
    }
}

// Get order count by status
export async function getOrderCountByStatus(): Promise<ActionResponse<Record<string, number>>> {
    try {
        const result = await query<{ status: string; count: string }>(`
      SELECT status, COUNT(*)::integer as count 
      FROM orders 
      GROUP BY status
    `);

        const counts: Record<string, number> = {};
        result.rows.forEach(row => {
            counts[row.status] = parseInt(row.count);
        });

        return { success: true, data: counts };
    } catch (error) {
        console.error('Error counting orders:', error);
        return { success: false, error: 'Failed to count orders' };
    }
}

// Get total revenue
export async function getTotalRevenue(): Promise<ActionResponse<number>> {
    try {
        const result = await query<{ total: string }>(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM orders 
      WHERE status != 'cancelled'
    `);
        return { success: true, data: parseFloat(result.rows[0].total) };
    } catch (error) {
        console.error('Error calculating revenue:', error);
        return { success: false, error: 'Failed to calculate revenue' };
    }
}
