'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { deleteStudent } from '@/lib/actions/students';
import { Student } from '@/lib/types';

interface ViewClientProps {
    initialStudents: Student[];
}

export default function ViewClient({ initialStudents }: ViewClientProps) {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            setIsDark(false);
            document.body.classList.add('light');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const newTheme = !prev;
            if (newTheme) {
                document.body.classList.remove('light');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light');
                localStorage.setItem('theme', 'light');
            }
            return newTheme;
        });
    };

    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        setIsDeleting(id);
        const result = await deleteStudent(id);
        if (result.success) {
            setStudents(students.filter(s => s.id !== id));
        }
        setIsDeleting(null);
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const InfoRow = ({ label, value }: { label: string, value: any }) => {
        let displayValue = value;
        if (value instanceof Date) {
            displayValue = value.toLocaleDateString();
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Handle cases where Date might not be a direct instance if serialization weirdness happened, but "found: [object Date]" suggests it is.
            // Actually, safely toString it if it's an object to avoid crash
            displayValue = value.toString();
        }

        return (
            <div style={{ padding: '8px 0', borderBottom: `1px solid ${isDark ? '#27272a' : '#f4f4f5'}` }}>
                <span style={{ fontSize: '13px', color: isDark ? '#a1a1aa' : '#71717a', display: 'block', marginBottom: '4px' }}>{label}</span>
                <span style={{ fontSize: '14px', color: isDark ? '#fafafa' : '#18181b', fontWeight: '500' }}>{displayValue || '-'}</span>
            </div>
        );
    };

    return (
        <div className="animate-fade-in" style={{ minHeight: '100vh', paddingBottom: '48px' }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                backgroundColor: isDark ? 'rgba(9, 9, 11, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: '16px 24px'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/" className="btn-secondary" style={{ padding: '8px 16px', textDecoration: 'none' }}>
                            ← Back
                        </Link>
                        <div style={{ width: '1px', height: '24px', backgroundColor: isDark ? '#3f3f46' : '#d4d4d8' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>View All Students</span>
                    </div>
                    <button onClick={toggleTheme} className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, fontSize: '18px' }}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            {/* Main */}
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                {/* Search & Actions */}
                <div className="animate-slide-up" style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '32px',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }}>🔍</span>
                        <input
                            className="input"
                            type="text"
                            placeholder="Search by name, ID, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '48px', borderWidth: 0, backgroundColor: 'transparent' }}
                        />
                    </div>
                    <div style={{ width: '1px', backgroundColor: isDark ? '#27272a' : '#e4e4e7' }} />
                    <Link href="/enter">
                        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                            + Add Student
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="animate-fade-in delay-100" style={{ marginBottom: '24px', color: '#a1a1aa', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Total Records: <strong style={{ color: isDark ? '#fafafa' : '#18181b' }}>{students.length}</strong></span>
                    {searchTerm && <span className="badge badge-primary">Showing: {filteredStudents.length}</span>}
                </div>

                {/* List */}
                {filteredStudents.length === 0 ? (
                    <div className="card animate-scale-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>No students found</h3>
                        <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>
                            {students.length === 0 ? "Your database is empty." : "Try adjusting your search terms."}
                        </p>
                        {students.length === 0 && (
                            <Link href="/enter">
                                <button className="btn btn-primary">Add First Student</button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredStudents.map((student, index) => (
                            <div
                                key={student.id}
                                className="card animate-slide-up"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Header Row */}
                                <div
                                    onClick={() => toggleExpand(student.id)}
                                    style={{
                                        padding: '24px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: expandedId === student.id ? (isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.05)') : 'transparent',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: `linear-gradient(135deg, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981'][student.id % 4]} 0%, ${['#4f46e5', '#db2777', '#d97706', '#059669'][student.id % 4]} 100%)`,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {student.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: isDark ? '#fafafa' : '#18181b' }}>{student.full_name}</h3>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span className="badge" style={{ backgroundColor: isDark ? '#27272a' : '#f4f4f5', color: isDark ? '#a1a1aa' : '#71717a', border: `1px solid ${isDark ? '#3f3f46' : '#d4d4d8'}` }}>
                                                    {student.student_id}
                                                </span>
                                                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>•</span>
                                                <span style={{ fontSize: '14px', color: '#a1a1aa' }}>{student.department || 'No Dept'}</span>
                                                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>•</span>
                                                <span className={`badge ${student.enrollment_status === 'Active' ? 'badge-primary' : ''}`} style={student.enrollment_status !== 'Active' ? { backgroundColor: isDark ? '#27272a' : '#f4f4f5', color: '#a1a1aa' } : {}}>
                                                    {student.enrollment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                                            color: '#a1a1aa',
                                            transition: 'transform 0.3s',
                                            transform: expandedId === student.id ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === student.id && (
                                    <div className="animate-fade-in" style={{
                                        padding: '0 24px 24px 24px',
                                        borderTop: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                                        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.02)' : 'rgba(99, 102, 241, 0.02)'
                                    }}>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginTop: '24px' }}>
                                            {/* Personal */}
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Personal Info</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <InfoRow label="Date of Birth" value={student.date_of_birth} />
                                                    <InfoRow label="Gender" value={student.gender} />
                                                    <InfoRow label="Phone" value={student.phone} />
                                                    <InfoRow label="Email" value={student.email} />
                                                    <InfoRow label="Address" value={student.address} />
                                                </div>
                                            </div>

                                            {/* Academic */}
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Academic</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <InfoRow label="Program" value={student.academic_program} />
                                                    <InfoRow label="Semester" value={student.semester} />
                                                    <InfoRow label="Credits" value={student.credit_hours} />
                                                    <InfoRow label="GPA / CGPA" value={`${student.gpa || '-'} / ${student.cgpa || '-'}`} />
                                                </div>
                                            </div>

                                            {/* Performance */}
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Performance</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <InfoRow label="Attendance" value={`${student.attendance_percentage}%`} />
                                                    <InfoRow label="Classes" value={`${student.classes_attended}/${student.total_classes}`} />
                                                    <InfoRow label="Total Marks" value={student.total_marks} />
                                                    <InfoRow label="Grade" value={student.grade} />
                                                </div>
                                            </div>

                                            {/* Other */}
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Other</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <InfoRow label="Pending Dues" value={`₹${student.pending_dues}`} />
                                                    <InfoRow label="Scholarship" value={student.scholarship_amount ? `₹${student.scholarship_amount}` : '-'} />
                                                    <InfoRow label="Library Card" value={student.library_card_number} />
                                                </div>
                                                <div style={{ marginTop: '24px' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                                                        disabled={isDeleting === student.id}
                                                        className="btn"
                                                        style={{
                                                            width: '100%',
                                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#ef4444',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <span>🗑️</span> Delete Student Record
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
