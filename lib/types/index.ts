// Student Database Management System - Type Definitions
// 6-Table Normalized Schema

// ===== Individual Table Interfaces =====

// Table 1: Core Student Identity
export interface Student {
    id: number;
    student_id: string;
    full_name: string;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    admission_date: string | null;
    created_at: Date;
    updated_at: Date;
}

// Table 2: Guardian Information
export interface Guardian {
    id: number;
    student_id: number;
    guardian_name: string;
    guardian_phone: string | null;
    guardian_email: string | null;
    relationship: string;
    created_at: Date;
}

// Table 3: Academic Records
export interface AcademicRecord {
    id: number;
    student_id: number;
    enrollment_status: string;
    academic_program: string | null;
    department: string | null;
    semester: string | null;
    credit_hours: number;
    gpa: number;
    cgpa: number;
    created_at: Date;
}

// Table 4: Attendance
export interface Attendance {
    id: number;
    student_id: number;
    semester: string | null;
    classes_attended: number;
    total_classes: number;
    attendance_percentage: number;
    created_at: Date;
}

// Table 5: Assessment & Examination
export interface Assessment {
    id: number;
    student_id: number;
    semester: string | null;
    internal_marks: number;
    quiz_marks: number;
    semester_marks: number;
    total_marks: number;
    grade: string | null;
    created_at: Date;
}

// Table 6: Fee Records
export interface FeeRecord {
    id: number;
    student_id: number;
    total_fees: number;
    fees_paid: number;
    pending_dues: number;
    payment_status: string;
    scholarship_amount: number;
    scholarship_type: string | null;
    created_at: Date;
}

// ===== Composite Type (JOIN result for display) =====

export interface StudentFull {
    // Student core
    id: number;
    student_id: string;
    full_name: string;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    admission_date: string | null;
    created_at: Date;
    updated_at: Date;

    // Guardian
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_email: string | null;

    // Academic
    enrollment_status: string;
    academic_program: string | null;
    department: string | null;
    semester: string | null;
    credit_hours: number;
    gpa: number;
    cgpa: number;

    // Attendance
    attendance_percentage: number;
    classes_attended: number;
    total_classes: number;

    // Assessment
    internal_marks: number;
    quiz_marks: number;
    semester_marks: number;
    total_marks: number;
    grade: string | null;

    // Financial
    total_fees: number;
    fees_paid: number;
    pending_dues: number;
    payment_status: string;
    scholarship_amount: number;
    scholarship_type: string | null;
}

// ===== API Response wrapper =====

export interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// ===== Dashboard statistics =====

export interface DashboardStats {
    total_students: number;
    students_by_department: { department: string; count: number }[];
    recent_students: StudentFull[];
}
