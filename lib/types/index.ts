// Student Database Management System - Type Definitions

// Comprehensive Student entity with all data categories
export interface Student {
    id: number;

    // Personal and Demographic Data
    student_id: string;
    full_name: string;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_email: string | null;

    // Academic Records
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

    // Assessment and Examination
    internal_marks: number;
    quiz_marks: number;
    semester_marks: number;
    total_marks: number;
    grade: string | null;

    // Financial and Fee Records
    total_fees: number;
    fees_paid: number;
    pending_dues: number;
    payment_status: string;
    scholarship_amount: number;
    scholarship_type: string | null;

    // Document and Compliance
    admission_date: string | null;
    admission_form_submitted: boolean;
    id_proof_submitted: boolean;
    certificates_submitted: boolean;

    // Administrative and Activity Records
    library_card_number: string | null;
    books_issued: number;
    disciplinary_remarks: string | null;
    club_memberships: string | null;
    extracurricular_activities: string | null;

    // Timestamps
    created_at: Date;
    updated_at: Date;
}

// API Response wrapper
export interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Dashboard statistics
export interface DashboardStats {
    total_students: number;
    total_courses: number;
    total_enrollments: number;
    students_by_class: { class: string; count: number }[];
    recent_students: Student[];
}
