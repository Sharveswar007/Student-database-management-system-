-- ============================================================
-- PBL II – Review 2: SQL Queries for Student DBMS
-- Schema: students, guardians, academic_records,
--         attendance, assessments, fee_records
-- ============================================================


-- ============================================================
-- TASK 1: DML, CONSTRAINTS, SET OPERATIONS
-- ============================================================


-- ── 1A. DML: INSERT ─────────────────────────────────────────
-- (Already handled transactionally in the app via students.ts)
-- Demonstrative example:
INSERT INTO students (student_id, full_name, date_of_birth, gender, phone, email, address, admission_date)
VALUES
  ('PBL001', 'Arjun Sharma',    '2003-05-12', 'Male',   '9876543210', 'arjun@mail.com',  'Chennai',    '2023-08-01'),
  ('PBL002', 'Priya Nair',      '2003-11-20', 'Female', '9876543211', 'priya@mail.com',  'Bangalore',  '2023-08-01'),
  ('PBL003', 'Rahul Verma',     '2004-02-15', 'Male',   '9876543212', 'rahul@mail.com',  'Mumbai',     '2023-08-01'),
  ('PBL004', 'Sneha Pillai',    '2003-07-30', 'Female', '9876543213', 'sneha@mail.com',  'Hyderabad',  '2023-08-01'),
  ('PBL005', 'Kiran Reddy',     '2002-12-05', 'Male',   '9876543214', 'kiran@mail.com',  'Pune',       '2022-08-01')
ON CONFLICT (student_id) DO NOTHING;

-- Insert guardian records for the sample students
INSERT INTO guardians (student_id, guardian_name, guardian_phone, guardian_email, relationship)
SELECT s.id, g.guardian_name, g.guardian_phone, g.guardian_email, g.relationship
FROM (VALUES
  ('PBL001', 'Ramesh Sharma',  '9111111110', 'ramesh@mail.com',  'Father'),
  ('PBL002', 'Suma Nair',      '9111111111', 'suma@mail.com',    'Mother'),
  ('PBL003', 'Vijay Verma',    '9111111112', 'vijay@mail.com',   'Father'),
  ('PBL004', 'Geeta Pillai',   '9111111113', 'geeta@mail.com',   'Mother'),
  ('PBL005', 'Mohan Reddy',    '9111111114', 'mohan@mail.com',   'Father')
) AS g(student_id, guardian_name, guardian_phone, guardian_email, relationship)
JOIN students s ON s.student_id = g.student_id
WHERE NOT EXISTS (SELECT 1 FROM guardians WHERE guardians.student_id = s.id);

-- Insert academic records
INSERT INTO academic_records (student_id, enrollment_status, academic_program, department, semester, credit_hours, gpa, cgpa)
SELECT s.id, a.enrollment_status, a.academic_program, a.department, a.semester, a.credit_hours, a.gpa, a.cgpa
FROM (VALUES
  ('PBL001', 'Active',      'B.Tech', 'CSE',  '4', 24, 8.5, 8.3),
  ('PBL002', 'Active',      'B.Tech', 'ECE',  '4', 24, 9.0, 8.9),
  ('PBL003', 'Active',      'B.Tech', 'CSE',  '2', 20, 7.2, 7.0),
  ('PBL004', 'Inactive',    'B.Tech', 'MECH', '6', 28, 6.8, 7.1),
  ('PBL005', 'Active',      'B.Tech', 'CSE',  '6', 28, 8.8, 8.6)
) AS a(student_id, enrollment_status, academic_program, department, semester, credit_hours, gpa, cgpa)
JOIN students s ON s.student_id = a.student_id
WHERE NOT EXISTS (SELECT 1 FROM academic_records WHERE academic_records.student_id = s.id);

-- Insert attendance records
INSERT INTO attendance (student_id, semester, classes_attended, total_classes, attendance_percentage)
SELECT s.id, a.semester, a.classes_attended, a.total_classes,
       ROUND((a.classes_attended::DECIMAL / a.total_classes) * 100, 2)
FROM (VALUES
  ('PBL001', '4', 72, 80),
  ('PBL002', '4', 78, 80),
  ('PBL003', '2', 55, 80),
  ('PBL004', '6', 60, 80),
  ('PBL005', '6', 75, 80)
) AS a(student_id, semester, classes_attended, total_classes)
JOIN students s ON s.student_id = a.student_id
WHERE NOT EXISTS (SELECT 1 FROM attendance WHERE attendance.student_id = s.id);

-- Insert assessment records
INSERT INTO assessments (student_id, semester, internal_marks, quiz_marks, semester_marks, total_marks, grade)
SELECT s.id, a.semester, a.internal_marks, a.quiz_marks, a.semester_marks,
       (a.internal_marks + a.quiz_marks + a.semester_marks), a.grade
FROM (VALUES
  ('PBL001', '4', 28.0, 9.5, 62.0, 'A'),
  ('PBL002', '4', 30.0, 10.0, 70.0, 'O'),
  ('PBL003', '2', 22.0, 7.0, 45.0, 'B'),
  ('PBL004', '6', 20.0, 6.5, 40.0, 'C'),
  ('PBL005', '6', 29.0, 9.0, 65.0, 'A')
) AS a(student_id, semester, internal_marks, quiz_marks, semester_marks, grade)
JOIN students s ON s.student_id = a.student_id
WHERE NOT EXISTS (SELECT 1 FROM assessments WHERE assessments.student_id = s.id);

-- Insert fee records
INSERT INTO fee_records (student_id, total_fees, fees_paid, pending_dues, payment_status, scholarship_amount, scholarship_type)
SELECT s.id, f.total_fees, f.fees_paid,
       GREATEST(f.total_fees - f.fees_paid - f.scholarship_amount, 0),
       CASE WHEN f.fees_paid >= f.total_fees THEN 'Paid' ELSE 'Pending' END,
       f.scholarship_amount, f.scholarship_type
FROM (VALUES
  ('PBL001', 80000.00, 80000.00, 5000.00, 'Merit'),
  ('PBL002', 80000.00, 75000.00, 0.00,    'None'),
  ('PBL003', 80000.00, 40000.00, 0.00,    'None'),
  ('PBL004', 80000.00, 80000.00, 8000.00, 'Sports'),
  ('PBL005', 80000.00, 60000.00, 0.00,    'None')
) AS f(student_id, total_fees, fees_paid, scholarship_amount, scholarship_type)
JOIN students s ON s.student_id = f.student_id
WHERE NOT EXISTS (SELECT 1 FROM fee_records WHERE fee_records.student_id = s.id);


-- ── 1B. DML: UPDATE ─────────────────────────────────────────
-- Update GPA for a student after re-evaluation
UPDATE academic_records
SET gpa = 8.9, cgpa = 8.7, updated_at = NOW()
FROM students
WHERE academic_records.student_id = students.id
  AND students.student_id = 'PBL003';

-- Update fee payment status when fees are fully paid
UPDATE fee_records
SET fees_paid   = total_fees,
    pending_dues = 0.00,
    payment_status = 'Paid'
FROM students
WHERE fee_records.student_id = students.id
  AND students.student_id = 'PBL003';


-- ── 1C. DML: DELETE ─────────────────────────────────────────
-- Since ON DELETE CASCADE is set, deleting a student also removes
-- all their guardians, academic_records, attendance, assessments, fee_records.
-- The statement below is kept as a demonstration. PBL999 does not exist so it
-- runs safely and affects 0 rows.
DELETE FROM students WHERE student_id = 'PBL999';


-- ── 1D. CONSTRAINTS ─────────────────────────────────────────
-- Add CHECK constraints to enforce business rules
ALTER TABLE academic_records
  ADD CONSTRAINT chk_gpa_range  CHECK (gpa  BETWEEN 0.00 AND 10.00),
  ADD CONSTRAINT chk_cgpa_range CHECK (cgpa BETWEEN 0.00 AND 10.00);

ALTER TABLE attendance
  ADD CONSTRAINT chk_attendance_pct   CHECK (attendance_percentage BETWEEN 0.00 AND 100.00),
  ADD CONSTRAINT chk_classes_positive CHECK (classes_attended >= 0 AND total_classes >= 0);

ALTER TABLE assessments
  ADD CONSTRAINT chk_marks_positive CHECK (
    internal_marks  >= 0 AND
    quiz_marks      >= 0 AND
    semester_marks  >= 0
  );

ALTER TABLE fee_records
  ADD CONSTRAINT chk_fees_positive    CHECK (total_fees >= 0 AND fees_paid >= 0),
  ADD CONSTRAINT chk_pending_positive CHECK (pending_dues >= 0);

-- NOT NULL constraint on a critical column (if not already set)
ALTER TABLE students ALTER COLUMN full_name SET NOT NULL;

-- UNIQUE constraint example
-- First nullify any duplicate emails so the unique index can be created
UPDATE students s
SET email = NULL
WHERE email IS NOT NULL
  AND EXISTS (
      SELECT 1 FROM students s2
      WHERE s2.email = s.email
        AND s2.id < s.id
  );

ALTER TABLE students DROP CONSTRAINT IF EXISTS uq_student_email;
ALTER TABLE students ADD CONSTRAINT uq_student_email UNIQUE (email);


-- ── 1E. SET OPERATIONS ──────────────────────────────────────
-- UNION: All unique student/guardian email addresses in the system
SELECT email AS contact_email, 'Student' AS type
FROM students
WHERE email IS NOT NULL
UNION
SELECT guardian_email, 'Guardian'
FROM guardians
WHERE guardian_email IS NOT NULL
ORDER BY type, contact_email;

-- INTERSECT: Students who have BOTH a pending fee AND low attendance (<75%)
SELECT s.student_id, s.full_name
FROM students s
JOIN fee_records f ON f.student_id = s.id
WHERE f.payment_status = 'Pending'
INTERSECT
SELECT s.student_id, s.full_name
FROM students s
JOIN attendance att ON att.student_id = s.id
WHERE att.attendance_percentage < 75;

-- EXCEPT: Active students who do NOT have any scholarship
SELECT s.student_id, s.full_name
FROM students s
JOIN academic_records ar ON ar.student_id = s.id
WHERE ar.enrollment_status = 'Active'
EXCEPT
SELECT s.student_id, s.full_name
FROM students s
JOIN fee_records f ON f.student_id = s.id
WHERE f.scholarship_amount > 0
ORDER BY student_id;


-- ============================================================
-- TASK 2: SUBQUERIES, JOINS, VIEWS
-- ============================================================


-- ── 2A. JOIN Types ──────────────────────────────────────────
-- INNER JOIN: Only students who have both academic AND fee records
SELECT s.student_id, s.full_name, ar.department, ar.gpa, f.payment_status
FROM students s
INNER JOIN academic_records ar ON ar.student_id = s.id
INNER JOIN fee_records       f  ON f.student_id  = s.id
ORDER BY ar.gpa DESC;

-- LEFT JOIN: All students with their attendance (NULL if not recorded)
SELECT s.student_id, s.full_name, att.attendance_percentage
FROM students s
LEFT JOIN attendance att ON att.student_id = s.id
ORDER BY s.student_id;

-- RIGHT JOIN (as LEFT JOIN reversed): All fee_records rows, with student info if linked
SELECT s.full_name, f.total_fees, f.pending_dues, f.payment_status
FROM fee_records f
LEFT JOIN students s ON s.id = f.student_id
ORDER BY f.pending_dues DESC;

-- FULL OUTER JOIN: All students and all fee_records, matched where possible
SELECT s.student_id, s.full_name, f.total_fees, f.payment_status
FROM students s
FULL OUTER JOIN fee_records f ON f.student_id = s.id;

-- SELF JOIN: Students in the same department (peer pairs)
SELECT a.full_name AS student_1, b.full_name AS student_2, ar1.department
FROM students a
JOIN students b                  ON a.id < b.id
JOIN academic_records ar1        ON ar1.student_id = a.id
JOIN academic_records ar2        ON ar2.student_id = b.id
WHERE ar1.department = ar2.department
ORDER BY ar1.department;


-- ── 2B. SUBQUERIES ──────────────────────────────────────────
-- Non-correlated subquery: Students with GPA above average
SELECT s.student_id, s.full_name, ar.gpa
FROM students s
JOIN academic_records ar ON ar.student_id = s.id
WHERE ar.gpa > (
    SELECT AVG(gpa) FROM academic_records
)
ORDER BY ar.gpa DESC;

-- Correlated subquery: Students whose fee pending > dept average pending
SELECT s.student_id, s.full_name, ar.department, f.pending_dues
FROM students s
JOIN fee_records       f  ON f.student_id  = s.id
JOIN academic_records ar  ON ar.student_id = s.id
WHERE f.pending_dues > (
    SELECT AVG(f2.pending_dues)
    FROM fee_records f2
    JOIN academic_records ar2 ON ar2.student_id = f2.student_id
    WHERE ar2.department = ar.department
)
ORDER BY f.pending_dues DESC;

-- EXISTS subquery: Students who have a scholarship
SELECT s.student_id, s.full_name
FROM students s
WHERE EXISTS (
    SELECT 1
    FROM fee_records f
    WHERE f.student_id = s.id AND f.scholarship_amount > 0
);

-- IN subquery: Students in the CSE department with grade 'A' or 'O'
SELECT s.student_id, s.full_name
FROM students s
WHERE s.id IN (
    SELECT ar.student_id
    FROM academic_records ar
    WHERE ar.department = 'CSE'
) AND s.id IN (
    SELECT a.student_id
    FROM assessments a
    WHERE a.grade IN ('A', 'O')
);

-- Scalar subquery in SELECT: Each student with total student count
SELECT s.student_id, s.full_name,
       (SELECT COUNT(*) FROM students) AS total_students_in_system
FROM students s
ORDER BY s.student_id;


-- ── 2C. CTEs (Common Table Expressions) ─────────────────────
-- CTE: Students with low attendance who still have outstanding fees
WITH low_attendance AS (
    SELECT student_id
    FROM attendance
    WHERE attendance_percentage < 75
),
fee_defaulters AS (
    SELECT student_id
    FROM fee_records
    WHERE payment_status = 'Pending'
)
SELECT s.student_id, s.full_name, att.attendance_percentage, f.pending_dues
FROM students s
JOIN attendance       att ON att.student_id = s.id
JOIN fee_records        f ON f.student_id   = s.id
WHERE s.id IN (SELECT student_id FROM low_attendance)
  AND s.id IN (SELECT student_id FROM fee_defaulters);

-- Recursive CTE: Generate semester numbers 1 through 8
WITH RECURSIVE semester_series AS (
    SELECT 1 AS sem_num
    UNION ALL
    SELECT sem_num + 1 FROM semester_series WHERE sem_num < 8
)
SELECT sem_num AS semester FROM semester_series;


-- ── 2D. VIEWS ───────────────────────────────────────────────
-- View 1: Complete student profile (mirrors getAllStudents query)
CREATE OR REPLACE VIEW vw_student_full_profile AS
SELECT
    s.id,
    s.student_id,
    s.full_name,
    s.date_of_birth,
    s.gender,
    s.phone,
    s.email,
    s.address,
    s.admission_date,
    g.guardian_name,
    g.guardian_phone,
    ar.enrollment_status,
    ar.academic_program,
    ar.department,
    ar.semester,
    ar.gpa,
    ar.cgpa,
    att.classes_attended,
    att.total_classes,
    att.attendance_percentage,
    a.internal_marks,
    a.quiz_marks,
    a.semester_marks,
    a.total_marks,
    a.grade,
    f.total_fees,
    f.fees_paid,
    f.pending_dues,
    f.payment_status,
    f.scholarship_amount,
    f.scholarship_type
FROM students s
LEFT JOIN guardians        g   ON g.student_id   = s.id
LEFT JOIN academic_records ar  ON ar.student_id  = s.id
LEFT JOIN attendance       att ON att.student_id = s.id
LEFT JOIN assessments      a   ON a.student_id   = s.id
LEFT JOIN fee_records      f   ON f.student_id   = s.id;

-- View 2: Students at risk (attendance < 75% OR pending fees > 0)
CREATE OR REPLACE VIEW vw_at_risk_students AS
SELECT
    s.student_id,
    s.full_name,
    ar.department,
    att.attendance_percentage,
    f.pending_dues,
    f.payment_status
FROM students s
JOIN academic_records ar  ON ar.student_id  = s.id
JOIN attendance       att ON att.student_id = s.id
JOIN fee_records      f   ON f.student_id   = s.id
WHERE att.attendance_percentage < 75.00
   OR f.payment_status = 'Pending';

-- View 3: Department-wise topper (highest GPA per department)
CREATE OR REPLACE VIEW vw_department_toppers AS
SELECT DISTINCT ON (ar.department)
    ar.department,
    s.student_id,
    s.full_name,
    ar.gpa,
    ar.cgpa
FROM students s
JOIN academic_records ar ON ar.student_id = s.id
ORDER BY ar.department, ar.gpa DESC, ar.cgpa DESC;

-- Query the views
SELECT * FROM vw_student_full_profile;
SELECT * FROM vw_at_risk_students;
SELECT * FROM vw_department_toppers;


-- ============================================================
-- TASK 3: FUNCTIONS, TRIGGERS, CURSORS, EXCEPTION HANDLING
-- ============================================================


-- ── 3A. STORED FUNCTIONS ────────────────────────────────────

-- Function 1: Calculate letter grade from total marks
CREATE OR REPLACE FUNCTION fn_calculate_grade(total_marks DECIMAL)
RETURNS VARCHAR AS $$
BEGIN
    RETURN CASE
        WHEN total_marks >= 90 THEN 'O'
        WHEN total_marks >= 80 THEN 'A+'
        WHEN total_marks >= 70 THEN 'A'
        WHEN total_marks >= 60 THEN 'B+'
        WHEN total_marks >= 50 THEN 'B'
        WHEN total_marks >= 40 THEN 'C'
        ELSE 'F'
    END;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get full student report by student_id (returns SETOF)
CREATE OR REPLACE FUNCTION fn_get_student_report(p_student_id VARCHAR)
RETURNS TABLE (
    student_id       VARCHAR,
    full_name        VARCHAR,
    department       VARCHAR,
    gpa              DECIMAL,
    attendance_pct   DECIMAL,
    grade            VARCHAR,
    payment_status   VARCHAR,
    pending_dues     DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.student_id,
        s.full_name,
        ar.department,
        ar.gpa,
        att.attendance_percentage,
        a.grade,
        f.payment_status,
        f.pending_dues
    FROM students s
    JOIN academic_records ar  ON ar.student_id  = s.id
    JOIN attendance       att ON att.student_id = s.id
    JOIN assessments      a   ON a.student_id   = s.id
    JOIN fee_records      f   ON f.student_id   = s.id
    WHERE s.student_id = p_student_id;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Count students in a department
CREATE OR REPLACE FUNCTION fn_department_student_count(p_department VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM academic_records
    WHERE department = p_department
      AND enrollment_status = 'Active';
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Calculate pending dues automatically
CREATE OR REPLACE FUNCTION fn_calculate_pending_dues(
    p_total_fees       DECIMAL,
    p_fees_paid        DECIMAL,
    p_scholarship_amt  DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN GREATEST(p_total_fees - p_fees_paid - p_scholarship_amt, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Demonstrate function calls
SELECT fn_calculate_grade(85.5);
SELECT * FROM fn_get_student_report('PBL001');
SELECT fn_department_student_count('CSE');
SELECT fn_calculate_pending_dues(80000, 60000, 5000);


-- ── 3B. TRIGGERS ────────────────────────────────────────────

-- Trigger 1: Auto-update attendance_percentage whenever attendance row changes
CREATE OR REPLACE FUNCTION trg_fn_update_attendance_pct()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_classes > 0 THEN
        NEW.attendance_percentage :=
            ROUND((NEW.classes_attended::DECIMAL / NEW.total_classes) * 100, 2);
    ELSE
        NEW.attendance_percentage := 0.00;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_attendance_pct ON attendance;
CREATE TRIGGER trg_update_attendance_pct
BEFORE INSERT OR UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION trg_fn_update_attendance_pct();

-- Trigger 2: Auto-calculate pending_dues and payment_status in fee_records
CREATE OR REPLACE FUNCTION trg_fn_update_pending_dues()
RETURNS TRIGGER AS $$
BEGIN
    NEW.pending_dues :=
        GREATEST(NEW.total_fees - NEW.fees_paid - NEW.scholarship_amount, 0.00);
    NEW.payment_status :=
        CASE WHEN NEW.pending_dues <= 0 THEN 'Paid' ELSE 'Pending' END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_pending_dues ON fee_records;
CREATE TRIGGER trg_update_pending_dues
BEFORE INSERT OR UPDATE ON fee_records
FOR EACH ROW EXECUTE FUNCTION trg_fn_update_pending_dues();

-- Trigger 3: Auto-assign grade in assessments based on total_marks
CREATE OR REPLACE FUNCTION trg_fn_assign_grade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_marks := NEW.internal_marks + NEW.quiz_marks + NEW.semester_marks;
    -- Scale to 100 for grading (total out of 110, normalise to 100)
    NEW.grade := fn_calculate_grade((NEW.total_marks / 110.0) * 100);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_grade ON assessments;
CREATE TRIGGER trg_assign_grade
BEFORE INSERT OR UPDATE ON assessments
FOR EACH ROW EXECUTE FUNCTION trg_fn_assign_grade();

-- Trigger 4: Log student deletions to an audit table
CREATE TABLE IF NOT EXISTS student_audit_log (
    log_id        SERIAL PRIMARY KEY,
    student_id    VARCHAR(50),
    full_name     VARCHAR(255),
    deleted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by    VARCHAR(100) DEFAULT CURRENT_USER
);

CREATE OR REPLACE FUNCTION trg_fn_audit_student_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO student_audit_log (student_id, full_name)
    VALUES (OLD.student_id, OLD.full_name);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_student_delete ON students;
CREATE TRIGGER trg_audit_student_delete
BEFORE DELETE ON students
FOR EACH ROW EXECUTE FUNCTION trg_fn_audit_student_delete();


-- ── 3C. CURSORS ─────────────────────────────────────────────

-- Cursor 1: Iterate all active students, raise notice for each
CREATE OR REPLACE FUNCTION fn_cursor_active_students_report()
RETURNS VOID AS $$
DECLARE
    cur_students CURSOR FOR
        SELECT s.student_id, s.full_name, ar.department, ar.gpa
        FROM students s
        JOIN academic_records ar ON ar.student_id = s.id
        WHERE ar.enrollment_status = 'Active'
        ORDER BY ar.gpa DESC;

    rec RECORD;
    v_count INTEGER := 0;
BEGIN
    OPEN cur_students;
    LOOP
        FETCH cur_students INTO rec;
        EXIT WHEN NOT FOUND;

        v_count := v_count + 1;
        RAISE NOTICE 'Student #%: % | % | % | GPA: %',
            v_count, rec.student_id, rec.full_name, rec.department, rec.gpa;
    END LOOP;
    CLOSE cur_students;

    RAISE NOTICE '--- Total Active Students Processed: % ---', v_count;
END;
$$ LANGUAGE plpgsql;

-- Cursor 2: Update grades for all students using a cursor loop
CREATE OR REPLACE FUNCTION fn_cursor_refresh_all_grades()
RETURNS INTEGER AS $$
DECLARE
    cur_assess CURSOR FOR
        SELECT id, internal_marks, quiz_marks, semester_marks
        FROM assessments
        FOR UPDATE;

    rec        RECORD;
    v_total    DECIMAL;
    v_grade    VARCHAR(5);
    v_updated  INTEGER := 0;
BEGIN
    OPEN cur_assess;
    LOOP
        FETCH cur_assess INTO rec;
        EXIT WHEN NOT FOUND;

        v_total := rec.internal_marks + rec.quiz_marks + rec.semester_marks;
        v_grade := fn_calculate_grade((v_total / 110.0) * 100);

        UPDATE assessments
        SET total_marks = v_total,
            grade       = v_grade
        WHERE CURRENT OF cur_assess;

        v_updated := v_updated + 1;
    END LOOP;
    CLOSE cur_assess;

    RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

-- Demonstrate cursors
SELECT fn_cursor_active_students_report();
SELECT fn_cursor_refresh_all_grades();


-- ── 3D. EXCEPTION HANDLING ──────────────────────────────────

-- Function with full exception handling: safe student enrollment
CREATE OR REPLACE FUNCTION fn_safe_enroll_student(
    p_student_id   VARCHAR,
    p_full_name    VARCHAR,
    p_email        VARCHAR,
    p_department   VARCHAR,
    p_semester     VARCHAR
) RETURNS TEXT AS $$
DECLARE
    v_student_db_id INTEGER;
BEGIN
    -- Validate inputs
    IF p_student_id IS NULL OR TRIM(p_student_id) = '' THEN
        RAISE EXCEPTION 'Student ID cannot be empty [SQLSTATE: 22023]';
    END IF;

    IF p_full_name IS NULL OR TRIM(p_full_name) = '' THEN
        RAISE EXCEPTION 'Full name cannot be empty';
    END IF;

    -- Begin transactional insert
    INSERT INTO students (student_id, full_name, email)
    VALUES (p_student_id, p_full_name, p_email)
    RETURNING id INTO v_student_db_id;

    INSERT INTO academic_records (student_id, enrollment_status, department, semester)
    VALUES (v_student_db_id, 'Active', p_department, p_semester);

    INSERT INTO attendance (student_id, semester, classes_attended, total_classes, attendance_percentage)
    VALUES (v_student_db_id, p_semester, 0, 0, 0.00);

    INSERT INTO assessments (student_id, semester, internal_marks, quiz_marks, semester_marks, total_marks, grade)
    VALUES (v_student_db_id, p_semester, 0, 0, 0, 0, 'N/A');

    INSERT INTO fee_records (student_id, total_fees, fees_paid, pending_dues, payment_status, scholarship_amount)
    VALUES (v_student_db_id, 0, 0, 0, 'Pending', 0);

    RETURN 'SUCCESS: Student ' || p_student_id || ' enrolled successfully.';

EXCEPTION
    WHEN unique_violation THEN
        RETURN 'ERROR: Student ID or Email already exists – ' || SQLERRM;
    WHEN not_null_violation THEN
        RETURN 'ERROR: A required field is missing – ' || SQLERRM;
    WHEN check_violation THEN
        RETURN 'ERROR: A value violates a CHECK constraint – ' || SQLERRM;
    WHEN OTHERS THEN
        RETURN 'ERROR: Unexpected error [' || SQLSTATE || '] – ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Demonstrate exception handling
-- Valid enrolment
SELECT fn_safe_enroll_student('PBL010', 'Test Student', 'test@mail.com', 'CSE', '1');
-- Duplicate student_id (triggers unique_violation)
SELECT fn_safe_enroll_student('PBL001', 'Duplicate', 'dup@mail.com', 'CSE', '1');
-- Empty name (triggers custom exception)
SELECT fn_safe_enroll_student('PBL011', '', 'empty@mail.com', 'CSE', '1');


-- ============================================================
-- END OF PBL II REVIEW 2 QUERIES
-- ============================================================
