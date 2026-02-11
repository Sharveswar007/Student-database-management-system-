'use server';

import { query, getClient } from '@/lib/db';
import { ActionResponse, StudentFull } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Get all students with full details (JOIN all 6 tables)
export async function getAllStudents(): Promise<ActionResponse<StudentFull[]>> {
    try {
        const result = await query<StudentFull>(`
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
        `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error fetching students:', error);
        return { success: false, error: error.message };
    }
}

// Get student by ID with full details
export async function getStudentById(id: number): Promise<ActionResponse<StudentFull>> {
    try {
        const result = await query<StudentFull>(`
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
            WHERE s.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Student not found' };
        }
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Create new student — inserts into all 6 tables in a transaction
export async function createStudent(data: Partial<StudentFull>): Promise<ActionResponse<StudentFull>> {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // 1. Insert into students (core table)
        const studentResult = await client.query(
            `INSERT INTO students (student_id, full_name, date_of_birth, gender, address, phone, email, admission_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
                data.student_id,
                data.full_name,
                data.date_of_birth || null,
                data.gender || null,
                data.address || null,
                data.phone || null,
                data.email || null,
                data.admission_date || null,
            ]
        );
        const studentDbId = studentResult.rows[0].id;

        // 2. Insert into guardians
        if (data.guardian_name) {
            await client.query(
                `INSERT INTO guardians (student_id, guardian_name, guardian_phone, guardian_email)
                 VALUES ($1, $2, $3, $4)`,
                [studentDbId, data.guardian_name, data.guardian_phone || null, data.guardian_email || null]
            );
        }

        // 3. Insert into academic_records
        await client.query(
            `INSERT INTO academic_records (student_id, enrollment_status, academic_program, department, semester, credit_hours, gpa, cgpa)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                studentDbId,
                data.enrollment_status || 'Active',
                data.academic_program || null,
                data.department || null,
                data.semester || null,
                data.credit_hours || 0,
                data.gpa || 0,
                data.cgpa || 0,
            ]
        );

        // 4. Insert into attendance
        const attendancePercentage = data.total_classes && Number(data.total_classes) > 0
            ? ((Number(data.classes_attended) || 0) / Number(data.total_classes)) * 100
            : 0;

        await client.query(
            `INSERT INTO attendance (student_id, semester, classes_attended, total_classes, attendance_percentage)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                studentDbId,
                data.semester || null,
                data.classes_attended || 0,
                data.total_classes || 0,
                attendancePercentage,
            ]
        );

        // 5. Insert into assessments
        await client.query(
            `INSERT INTO assessments (student_id, semester, internal_marks, quiz_marks, semester_marks, total_marks, grade)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                studentDbId,
                data.semester || null,
                data.internal_marks || 0,
                data.quiz_marks || 0,
                data.semester_marks || 0,
                data.total_marks || 0,
                data.grade || null,
            ]
        );

        // 6. Insert into fee_records
        const pendingDues = (Number(data.total_fees) || 0) - (Number(data.fees_paid) || 0) - (Number(data.scholarship_amount) || 0);

        await client.query(
            `INSERT INTO fee_records (student_id, total_fees, fees_paid, pending_dues, payment_status, scholarship_amount, scholarship_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                studentDbId,
                data.total_fees || 0,
                data.fees_paid || 0,
                pendingDues > 0 ? pendingDues : 0,
                pendingDues <= 0 ? 'Paid' : 'Pending',
                data.scholarship_amount || 0,
                data.scholarship_type || null,
            ]
        );

        await client.query('COMMIT');

        // Fetch the complete student record to return
        const fullResult = await getStudentById(studentDbId);
        revalidatePath('/');
        return fullResult;
    } catch (error: any) {
        await client.query('ROLLBACK');
        if (error.message.includes('duplicate key')) {
            return { success: false, error: 'Student ID already exists' };
        }
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

// Delete student (CASCADE handles child rows)
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
