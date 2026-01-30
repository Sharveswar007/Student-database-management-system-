'use server';

import { query } from '@/lib/db';
import { ActionResponse, Student } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Get all students
export async function getAllStudents(): Promise<ActionResponse<Student[]>> {
    try {
        const result = await query<Student>(
            'SELECT * FROM students ORDER BY created_at DESC'
        );
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error fetching students:', error);
        return { success: false, error: error.message };
    }
}

// Get student by ID
export async function getStudentById(id: number): Promise<ActionResponse<Student>> {
    try {
        const result = await query<Student>(
            'SELECT * FROM students WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return { success: false, error: 'Student not found' };
        }
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Create new student with all fields
export async function createStudent(data: Partial<Student>): Promise<ActionResponse<Student>> {
    try {
        // Calculate pending dues
        const pendingDues = (Number(data.total_fees) || 0) - (Number(data.fees_paid) || 0) - (Number(data.scholarship_amount) || 0);

        // Calculate attendance percentage
        const attendancePercentage = data.total_classes && data.total_classes > 0
            ? ((data.classes_attended || 0) / data.total_classes) * 100
            : 0;

        const result = await query<Student>(
            `INSERT INTO students (
        student_id, full_name, date_of_birth, gender, address, phone, email,
        guardian_name, guardian_phone, guardian_email,
        enrollment_status, academic_program, department, semester, credit_hours, gpa, cgpa,
        attendance_percentage, classes_attended, total_classes,
        internal_marks, quiz_marks, semester_marks, total_marks, grade,
        total_fees, fees_paid, pending_dues, payment_status, scholarship_amount, scholarship_type,
        admission_date, admission_form_submitted, id_proof_submitted, certificates_submitted,
        library_card_number, books_issued, disciplinary_remarks, club_memberships, extracurricular_activities
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31,
        $32, $33, $34, $35,
        $36, $37, $38, $39, $40
      ) RETURNING *`,
            [
                data.student_id,
                data.full_name,
                data.date_of_birth || null,
                data.gender || null,
                data.address || null,
                data.phone || null,
                data.email || null,
                data.guardian_name || null,
                data.guardian_phone || null,
                data.guardian_email || null,
                data.enrollment_status || 'Active',
                data.academic_program || null,
                data.department || null,
                data.semester || null,
                data.credit_hours || 0,
                data.gpa || 0,
                data.cgpa || 0,
                attendancePercentage,
                data.classes_attended || 0,
                data.total_classes || 0,
                data.internal_marks || 0,
                data.quiz_marks || 0,
                data.semester_marks || 0,
                data.total_marks || 0,
                data.grade || null,
                data.total_fees || 0,
                data.fees_paid || 0,
                pendingDues > 0 ? pendingDues : 0,
                pendingDues <= 0 ? 'Paid' : 'Pending',
                data.scholarship_amount || 0,
                data.scholarship_type || null,
                data.admission_date || null,
                data.admission_form_submitted || false,
                data.id_proof_submitted || false,
                data.certificates_submitted || false,
                data.library_card_number || null,
                data.books_issued || 0,
                data.disciplinary_remarks || null,
                data.club_memberships || null,
                data.extracurricular_activities || null,
            ]
        );
        revalidatePath('/');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        if (error.message.includes('duplicate key')) {
            return { success: false, error: 'Student ID already exists' };
        }
        return { success: false, error: error.message };
    }
}

// Delete student
export async function deleteStudent(id: number): Promise<ActionResponse<void>> {
    try {
        await query('DELETE FROM students WHERE id = $1', [id]);
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get student count
export async function getStudentCount(): Promise<ActionResponse<number>> {
    try {
        const result = await query<{ count: number }>('SELECT COUNT(*)::integer as count FROM students');
        return { success: true, data: result.rows[0].count };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
