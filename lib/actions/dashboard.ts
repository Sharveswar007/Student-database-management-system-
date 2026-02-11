'use server';

import { query } from '@/lib/db';
import { ActionResponse, DashboardStats, StudentFull } from '@/lib/types';

// Get dashboard statistics
export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
    try {
        // Get total student count
        const countResult = await query<{ total_students: number }>(`
            SELECT COUNT(*)::integer as total_students FROM students
        `);

        // Get students by department
        const deptResult = await query<{ department: string; count: number }>(`
            SELECT COALESCE(ar.department, 'Unassigned') as department, COUNT(*)::integer as count
            FROM students s
            LEFT JOIN academic_records ar ON ar.student_id = s.id
            GROUP BY ar.department
            ORDER BY count DESC
        `);

        // Get recent students (full join)
        const recentResult = await query<StudentFull>(`
            SELECT 
                s.id, s.student_id, s.full_name, s.date_of_birth, s.gender,
                s.address, s.phone, s.email, s.admission_date,
                s.created_at, s.updated_at,
                g.guardian_name, g.guardian_phone, g.guardian_email,
                COALESCE(ar.enrollment_status, 'Active') as enrollment_status,
                ar.academic_program, ar.department, ar.semester,
                COALESCE(ar.credit_hours, 0) as credit_hours,
                COALESCE(ar.gpa, 0) as gpa,
                COALESCE(ar.cgpa, 0) as cgpa,
                COALESCE(att.attendance_percentage, 0) as attendance_percentage,
                COALESCE(att.classes_attended, 0) as classes_attended,
                COALESCE(att.total_classes, 0) as total_classes,
                COALESCE(a.internal_marks, 0) as internal_marks,
                COALESCE(a.quiz_marks, 0) as quiz_marks,
                COALESCE(a.semester_marks, 0) as semester_marks,
                COALESCE(a.total_marks, 0) as total_marks,
                a.grade,
                COALESCE(f.total_fees, 0) as total_fees,
                COALESCE(f.fees_paid, 0) as fees_paid,
                COALESCE(f.pending_dues, 0) as pending_dues,
                COALESCE(f.payment_status, 'Pending') as payment_status,
                COALESCE(f.scholarship_amount, 0) as scholarship_amount,
                f.scholarship_type
            FROM students s
            LEFT JOIN guardians g ON g.student_id = s.id
            LEFT JOIN academic_records ar ON ar.student_id = s.id
            LEFT JOIN attendance att ON att.student_id = s.id
            LEFT JOIN assessments a ON a.student_id = s.id
            LEFT JOIN fee_records f ON f.student_id = s.id
            ORDER BY s.created_at DESC
            LIMIT 5
        `);

        return {
            success: true,
            data: {
                total_students: countResult.rows[0]?.total_students || 0,
                students_by_department: deptResult.rows,
                recent_students: recentResult.rows,
            },
        };
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: error.message };
    }
}
