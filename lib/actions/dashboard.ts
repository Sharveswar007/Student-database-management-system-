'use server';

import { query } from '@/lib/db';
import { ActionResponse, DashboardStats, Student } from '@/lib/types';

// Get dashboard statistics
export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
    try {
        // Get counts
        const statsResult = await query<{
            total_students: number;
            total_courses: number;
            total_enrollments: number;
        }>(`
      SELECT 
        (SELECT COUNT(*)::integer FROM students) as total_students,
        (SELECT COUNT(*)::integer FROM courses) as total_courses,
        (SELECT COUNT(*)::integer FROM enrollments) as total_enrollments
    `);

        // Get students by class
        const classResult = await query<{ class: string; count: number }>(`
      SELECT class, COUNT(*)::integer as count 
      FROM students 
      WHERE class IS NOT NULL 
      GROUP BY class 
      ORDER BY class
    `);

        // Get recent students
        const recentResult = await query<Student>(`
      SELECT * FROM students 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

        return {
            success: true,
            data: {
                total_students: statsResult.rows[0]?.total_students || 0,
                total_courses: statsResult.rows[0]?.total_courses || 0,
                total_enrollments: statsResult.rows[0]?.total_enrollments || 0,
                students_by_class: classResult.rows,
                recent_students: recentResult.rows,
            },
        };
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: error.message };
    }
}
