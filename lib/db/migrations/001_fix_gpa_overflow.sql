-- Migration to fix numeric overflow for GPA/CGPA
ALTER TABLE students ALTER COLUMN gpa TYPE DECIMAL(5, 2);
ALTER TABLE students ALTER COLUMN cgpa TYPE DECIMAL(5, 2);
