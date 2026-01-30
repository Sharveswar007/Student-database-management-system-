'use server';

import { query } from '@/lib/db';
import { ActionResponse, Course } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Get all courses
export async function getAllCourses(): Promise<ActionResponse<Course[]>> {
    try {
        const result = await query<Course>(`
      SELECT c.*, 
             COUNT(e.id)::integer as student_count
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      GROUP BY c.id
      ORDER BY c.code ASC
    `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error fetching courses:', error);
        return { success: false, error: error.message };
    }
}

// Create course
export async function createCourse(data: {
    code: string;
    name: string;
    credits?: number;
    description?: string;
}): Promise<ActionResponse<Course>> {
    try {
        const result = await query<Course>(
            `INSERT INTO courses (code, name, credits, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [data.code, data.name, data.credits || 3, data.description || null]
        );
        revalidatePath('/dashboard/courses');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        if (error.message.includes('duplicate key')) {
            return { success: false, error: 'Course code already exists' };
        }
        return { success: false, error: error.message };
    }
}

// Delete course
export async function deleteCourse(id: number): Promise<ActionResponse<void>> {
    try {
        await query('DELETE FROM courses WHERE id = $1', [id]);
        revalidatePath('/dashboard/courses');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
