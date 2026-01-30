'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ActionResponse, Review } from '@/lib/types';

// Get all reviews for a product
export async function getProductReviews(productId: number): Promise<ActionResponse<Review[]>> {
    try {
        const result = await query<Review>(
            `SELECT r.*, u.name as user_name
       FROM reviews r
       INNER JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
            [productId]
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return { success: false, error: 'Failed to fetch reviews' };
    }
}

// Get all reviews by a user
export async function getUserReviews(userId: number): Promise<ActionResponse<Review[]>> {
    try {
        const result = await query<Review>(
            `SELECT r.*, p.name as product_name
       FROM reviews r
       INNER JOIN products p ON r.product_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
            [userId]
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        return { success: false, error: 'Failed to fetch reviews' };
    }
}

// Create a new review
export async function createReview(data: {
    product_id: number;
    user_id: number;
    rating: number;
    comment?: string;
}): Promise<ActionResponse<Review>> {
    try {
        // Check if user already reviewed this product
        const existing = await query(
            'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
            [data.product_id, data.user_id]
        );

        if (existing.rows.length > 0) {
            return { success: false, error: 'You have already reviewed this product' };
        }

        const result = await query<Review>(
            `INSERT INTO reviews (product_id, user_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [data.product_id, data.user_id, data.rating, data.comment || null]
        );

        revalidatePath('/dashboard/products');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating review:', error);
        return { success: false, error: 'Failed to create review' };
    }
}

// Update a review
export async function updateReview(
    id: number,
    data: { rating?: number; comment?: string }
): Promise<ActionResponse<Review>> {
    try {
        const result = await query<Review>(
            `UPDATE reviews 
       SET rating = COALESCE($1, rating), 
           comment = COALESCE($2, comment)
       WHERE id = $3 
       RETURNING *`,
            [data.rating, data.comment, id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Review not found' };
        }

        revalidatePath('/dashboard/products');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error updating review:', error);
        return { success: false, error: 'Failed to update review' };
    }
}

// Delete a review
export async function deleteReview(id: number): Promise<ActionResponse<void>> {
    try {
        const result = await query('DELETE FROM reviews WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return { success: false, error: 'Review not found' };
        }

        revalidatePath('/dashboard/products');
        return { success: true };
    } catch (error) {
        console.error('Error deleting review:', error);
        return { success: false, error: 'Failed to delete review' };
    }
}

// Get average rating for a product
export async function getProductAverageRating(productId: number): Promise<ActionResponse<number>> {
    try {
        const result = await query<{ avg_rating: string }>(
            `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) as avg_rating 
       FROM reviews 
       WHERE product_id = $1`,
            [productId]
        );
        return { success: true, data: parseFloat(result.rows[0].avg_rating) };
    } catch (error) {
        console.error('Error calculating rating:', error);
        return { success: false, error: 'Failed to calculate rating' };
    }
}
