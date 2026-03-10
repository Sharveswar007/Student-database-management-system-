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
        // Clamp to >= 0 to satisfy chk_classes_positive / chk_attendance_pct constraints
        const classesAttended = Math.max(0, Number(data.classes_attended) || 0);
        const totalClasses = Math.max(0, Number(data.total_classes) || 0);
        const attendancePercentage = totalClasses > 0
            ? Math.min(100, (classesAttended / totalClasses) * 100)
            : 0;

        await client.query(
            `INSERT INTO attendance (student_id, semester, classes_attended, total_classes, attendance_percentage)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                studentDbId,
                data.semester || null,
                classesAttended,
                totalClasses,
                attendancePercentage,
            ]
        );

        // 5. Insert into assessments — clamp marks >= 0 (chk_marks_positive)
        const internalMarks = Math.max(0, Number(data.internal_marks) || 0);
        const quizMarks = Math.max(0, Number(data.quiz_marks) || 0);
        const semesterMarks = Math.max(0, Number(data.semester_marks) || 0);
        const totalMarks = internalMarks + quizMarks + semesterMarks;

        await client.query(
            `INSERT INTO assessments (student_id, semester, internal_marks, quiz_marks, semester_marks, total_marks, grade)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                studentDbId,
                data.semester || null,
                internalMarks,
                quizMarks,
                semesterMarks,
                totalMarks,
                data.grade || null,
            ]
        );

        // 6. Insert into fee_records — clamp fees >= 0 (chk_fees_positive)
        const totalFees = Math.max(0, Number(data.total_fees) || 0);
        const feesPaid = Math.max(0, Number(data.fees_paid) || 0);
        const scholarshipAmt = Math.max(0, Number(data.scholarship_amount) || 0);
        const pendingDues = Math.max(0, totalFees - feesPaid - scholarshipAmt);

        await client.query(
            `INSERT INTO fee_records (student_id, total_fees, fees_paid, pending_dues, payment_status, scholarship_amount, scholarship_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                studentDbId,
                totalFees,
                feesPaid,
                pendingDues,
                pendingDues <= 0 ? 'Paid' : 'Pending',
                scholarshipAmt,
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

// Update student — updates all 6 tables atomically
export async function updateStudent(id: number, data: Partial<StudentFull>): Promise<ActionResponse<StudentFull>> {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // 1. Update core student record
        await client.query(
            `UPDATE students SET
               full_name      = COALESCE($1, full_name),
               date_of_birth  = $2,
               gender         = $3,
               address        = $4,
               phone          = $5,
               email          = $6,
               admission_date = $7,
               updated_at     = NOW()
             WHERE id = $8`,
            [
                data.full_name || null,
                data.date_of_birth || null,
                data.gender || null,
                data.address || null,
                data.phone || null,
                data.email || null,
                data.admission_date || null,
                id,
            ]
        );

        // 2. Update guardian
        await client.query(
            `UPDATE guardians SET
               guardian_name  = $1,
               guardian_phone = $2,
               guardian_email = $3
             WHERE student_id = $4`,
            [data.guardian_name || null, data.guardian_phone || null, data.guardian_email || null, id]
        );

        // 3. Update academic_records
        const gpa = Math.min(10, Math.max(0, Number(data.gpa) || 0));
        const cgpa = Math.min(10, Math.max(0, Number(data.cgpa) || 0));
        await client.query(
            `UPDATE academic_records SET
               enrollment_status = $1,
               academic_program  = $2,
               department        = $3,
               semester          = $4,
               credit_hours      = $5,
               gpa               = $6,
               cgpa              = $7
             WHERE student_id = $8`,
            [
                data.enrollment_status || 'Active',
                data.academic_program || null,
                data.department || null,
                data.semester || null,
                Math.max(0, Number(data.credit_hours) || 0),
                gpa, cgpa, id,
            ]
        );

        // 4. Update attendance
        const classesAttended = Math.max(0, Number(data.classes_attended) || 0);
        const totalClasses = Math.max(0, Number(data.total_classes) || 0);
        const attendancePct = totalClasses > 0 ? Math.min(100, (classesAttended / totalClasses) * 100) : 0;
        await client.query(
            `UPDATE attendance SET
               semester              = $1,
               classes_attended      = $2,
               total_classes         = $3,
               attendance_percentage = $4
             WHERE student_id = $5`,
            [data.semester || null, classesAttended, totalClasses, attendancePct, id]
        );

        // 5. Update assessments
        const internalMarks = Math.max(0, Number(data.internal_marks) || 0);
        const quizMarks = Math.max(0, Number(data.quiz_marks) || 0);
        const semesterMarks = Math.max(0, Number(data.semester_marks) || 0);
        const totalMarks = internalMarks + quizMarks + semesterMarks;
        await client.query(
            `UPDATE assessments SET
               semester       = $1,
               internal_marks = $2,
               quiz_marks     = $3,
               semester_marks = $4,
               total_marks    = $5,
               grade          = $6
             WHERE student_id = $7`,
            [data.semester || null, internalMarks, quizMarks, semesterMarks, totalMarks, data.grade || null, id]
        );

        // 6. Update fee_records
        const totalFees = Math.max(0, Number(data.total_fees) || 0);
        const feesPaid = Math.max(0, Number(data.fees_paid) || 0);
        const scholarshipAmt = Math.max(0, Number(data.scholarship_amount) || 0);
        const pendingDues = Math.max(0, totalFees - feesPaid - scholarshipAmt);
        await client.query(
            `UPDATE fee_records SET
               total_fees         = $1,
               fees_paid          = $2,
               pending_dues       = $3,
               payment_status     = $4,
               scholarship_amount = $5,
               scholarship_type   = $6
             WHERE student_id = $7`,
            [totalFees, feesPaid, pendingDues, pendingDues <= 0 ? 'Paid' : 'Pending', scholarshipAmt, data.scholarship_type || null, id]
        );

        await client.query('COMMIT');
        revalidatePath('/');
        return await getStudentById(id);
    } catch (error: any) {
        await client.query('ROLLBACK');
        return { success: false, error: error.message };
    } finally {
        client.release();
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
