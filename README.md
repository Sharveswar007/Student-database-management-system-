# Student Database Management System (DBMS)

A comprehensive, full-stack student management solution built with modern web technologies. This application allows educational institutions to manage student records efficiently, covering personal, academic, financial, and administrative data across a **normalized 6-table relational database**.

## 🚀 Features

-   **Modern UI/UX**: Built with a custom Zinc/Indigo design system, featuring dark/light mode, smooth animations (`fade-in`, `slide-up`), and glassmorphism effects.
-   **Normalized Database**: 6 related tables with foreign key constraints, ensuring data integrity and eliminating redundancy.
-   **Comprehensive Data Management**: Track student data across multiple dimensions:
    -   👤 **Students**: Core identity, demographics, and contact info.
    -   👨‍👩‍👧 **Guardians**: Parent/guardian details linked to each student.
    -   🎓 **Academic Records**: Program, department, semester, GPA/CGPA, enrollment status.
    -   📅 **Attendance**: Classes attended vs. total classes with auto-calculated percentage.
    -   📝 **Assessments**: Internal marks, quizzes, semester exams, grades.
    -   💰 **Fee Records**: Fee tracking, payments, scholarships, pending dues (auto-calculated).
-   **Interactive Dashboard**:
    -   **Enter Data Component**: A multi-section form with validation and progress tracking.
    -   **View Students Component**: A searchable, filterable list with expandable details and colorful avatars.
-   **Transactional Writes**: Student creation inserts into all 6 tables atomically using database transactions.
-   **Robust Backend**: Powered by PostgreSQL with foreign key constraints and cascade deletes.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Directory)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: Custom CSS Design System (Zinc/Indigo theme)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (e.g., Neon DB)
-   **Driver**: `pg` (node-postgres)
-   **Icons**: `lucide-react`

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Sharveswar007/Student-database-management-system-
    cd Student-database-management-system-
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory. **Do not commit this file.**
    You need a PostgreSQL connection string (DATABASE_URL).

    ```env
    # .env
    DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
    ```

4.  **Initialize Database**
    Run the setup script to create the necessary tables.
    ```bash
    npx tsx scripts/init-db.ts
    ```
    To completely reset the database (drop and recreate all tables):
    ```bash
    npx tsx scripts/reset-db.ts
    ```

5.  **Run Development Server**
    ```bash
    npm run next:dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses a **normalized 6-table relational schema** with foreign key constraints:

```
┌──────────────┐
│   students   │ (Core identity & contact)
│──────────────│
│ id (PK)      │───┐
│ student_id   │   │
│ full_name    │   │
│ dob, gender  │   │  1:N relationships
│ phone, email │   │  (ON DELETE CASCADE)
│ address      │   │
└──────────────┘   │
                   │
    ┌──────────────┼──────────────┬──────────────┬──────────────┐
    │              │              │              │              │
    ▼              ▼              ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│guardians │ │academic_ │ │attendance│ │assessments│ │fee_      │
│          │ │records   │ │          │ │          │ │records   │
│──────────│ │──────────│ │──────────│ │──────────│ │──────────│
│id (PK)   │ │id (PK)   │ │id (PK)   │ │id (PK)   │ │id (PK)   │
│student_id│ │student_id│ │student_id│ │student_id│ │student_id│
│name      │ │status    │ │semester  │ │semester  │ │total_fees│
│phone     │ │program   │ │attended  │ │internal  │ │fees_paid │
│email     │ │department│ │total     │ │quiz      │ │pending   │
│relation  │ │semester  │ │percent   │ │semester  │ │status    │
│          │ │gpa, cgpa │ │          │ │total     │ │scholar.  │
└──────────┘ └──────────┘ └──────────┘ │grade     │ └──────────┘
                                       └──────────┘
```

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **students** | Core identity & contact | `student_id`, `full_name`, `dob`, `gender`, `phone`, `email`, `address` |
| **guardians** | Guardian/parent info | `guardian_name`, `guardian_phone`, `guardian_email`, `relationship` |
| **academic_records** | Enrollment & GPA | `enrollment_status`, `program`, `department`, `semester`, `gpa`, `cgpa` |
| **attendance** | Attendance tracking | `classes_attended`, `total_classes`, `attendance_percentage` |
| **assessments** | Marks & grades | `internal_marks`, `quiz_marks`, `semester_marks`, `total_marks`, `grade` |
| **fee_records** | Fees & scholarships | `total_fees`, `fees_paid`, `pending_dues`, `payment_status`, `scholarship_amount` |

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
