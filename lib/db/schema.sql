-- =============================================
-- Student Database Management System - Schema
-- Comprehensive Student Information Database
-- =============================================

-- Single comprehensive students table with all information
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  
  -- Personal and Demographic Data
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  
  -- Academic Records
  enrollment_status VARCHAR(50) DEFAULT 'Active',
  academic_program VARCHAR(255),
  department VARCHAR(255),
  semester VARCHAR(50),
  credit_hours INTEGER DEFAULT 0,
  gpa DECIMAL(3, 2) DEFAULT 0.00,
  cgpa DECIMAL(3, 2) DEFAULT 0.00,
  
  -- Attendance
  attendance_percentage DECIMAL(5, 2) DEFAULT 0.00,
  classes_attended INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  
  -- Assessment and Examination
  internal_marks DECIMAL(5, 2) DEFAULT 0.00,
  quiz_marks DECIMAL(5, 2) DEFAULT 0.00,
  semester_marks DECIMAL(5, 2) DEFAULT 0.00,
  total_marks DECIMAL(5, 2) DEFAULT 0.00,
  grade VARCHAR(5),
  
  -- Financial and Fee Records
  total_fees DECIMAL(10, 2) DEFAULT 0.00,
  fees_paid DECIMAL(10, 2) DEFAULT 0.00,
  pending_dues DECIMAL(10, 2) DEFAULT 0.00,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  scholarship_amount DECIMAL(10, 2) DEFAULT 0.00,
  scholarship_type VARCHAR(100),
  
  -- Document and Compliance
  admission_date DATE DEFAULT CURRENT_DATE,
  admission_form_submitted BOOLEAN DEFAULT FALSE,
  id_proof_submitted BOOLEAN DEFAULT FALSE,
  certificates_submitted BOOLEAN DEFAULT FALSE,
  
  -- Administrative and Activity Records
  library_card_number VARCHAR(50),
  books_issued INTEGER DEFAULT 0,
  disciplinary_remarks TEXT,
  club_memberships TEXT,
  extracurricular_activities TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students(enrollment_status);
