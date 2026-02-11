-- =============================================
-- Student Database Management System - Schema
-- 6 Normalized Tables with Foreign Key Relationships
-- =============================================

-- 1. Core Student Identity & Contact Information
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  admission_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Guardian / Parent Information
CREATE TABLE IF NOT EXISTS guardians (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guardian_name VARCHAR(255) NOT NULL,
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  relationship VARCHAR(50) DEFAULT 'Parent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Academic Records (Enrollment, Program, GPA)
CREATE TABLE IF NOT EXISTS academic_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrollment_status VARCHAR(50) DEFAULT 'Active',
  academic_program VARCHAR(255),
  department VARCHAR(255),
  semester VARCHAR(50),
  credit_hours INTEGER DEFAULT 0,
  gpa DECIMAL(5, 2) DEFAULT 0.00,
  cgpa DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendance Tracking
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  semester VARCHAR(50),
  classes_attended INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  attendance_percentage DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Assessment & Examination Results
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  semester VARCHAR(50),
  internal_marks DECIMAL(5, 2) DEFAULT 0.00,
  quiz_marks DECIMAL(5, 2) DEFAULT 0.00,
  semester_marks DECIMAL(5, 2) DEFAULT 0.00,
  total_marks DECIMAL(5, 2) DEFAULT 0.00,
  grade VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Financial & Fee Records
CREATE TABLE IF NOT EXISTS fee_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  total_fees DECIMAL(10, 2) DEFAULT 0.00,
  fees_paid DECIMAL(10, 2) DEFAULT 0.00,
  pending_dues DECIMAL(10, 2) DEFAULT 0.00,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  scholarship_amount DECIMAL(10, 2) DEFAULT 0.00,
  scholarship_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_guardians_student ON guardians(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_student ON academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_department ON academic_records(department);
CREATE INDEX IF NOT EXISTS idx_academic_enrollment ON academic_records(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_student ON fee_records(student_id);
