# Student Database Management System (DBMS)

A comprehensive, full-stack student management solution built with modern web technologies. This application allows educational institutions to manage student records efficiently, covering personal, academic, financial, and administrative data.

## 🚀 Features

-   **Modern UI/UX**: Built with a custom Zinc/Indigo design system, featuring dark/light mode, smooth animations (`fade-in`, `slide-up`), and glassmorphism effects.
-   **Comprehensive Data Management**: Track over 40 data points per student, including:
    -   👤 **Personal**: Demographics, contact info, guardian details.
    -   🎓 **Academic**: Program, semester, GPA/CGPA, credit hours.
    -   📅 **Attendance**: Tracking classes attended vs. total classes.
    -   📝 **Assessment**: Internal marks, quizzes, semester exams, grades.
    -   💰 **Financial**: Fee tracking, payments, scholarships, pending dues (auto-calculated).
    -   🗂️ **Documents**: Submission status for admission forms, IDs, certificates.
-   **Interactive Dashboard**:
    -   **Enter Data Component**: A multi-section form with validation and progress tracking.
    -   **View Students Component**: A searchable, filterable list with expandable details and colorful avatars.
-   **Robust Backend**: Powered by PostgreSQL for data integrity and reliability.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: Custom CSS (Tailwind concepts without the build step overhead for this specific implementation)
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
    npm run db:setup
    ```
    *Note: This runs `scripts/init-db.ts` which applies the schema.*

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

 The application uses a single comprehensive `students` table designed for simplified management while maintaining data depth.

| Column Category | Examples |
|-----------------|----------|
| **Identity** | `student_id` (Unique), `full_name`, `dob`, `gender` |
| **Contact** | `email`, `phone`, `address`, `guardian_details` |
| **Academic** | `enrollment_status`, `program`, `gpa`, `cgpa` |
| **Performance** | `attendance_percentage`, `total_marks`, `grade` |
| **Financial** | `total_fees`, `fees_paid`, `pending_dues` |

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
