'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createStudent } from '@/lib/actions/students';

export default function EnterDataPage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('personal');

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

    const [form, setForm] = useState({
        student_id: '', full_name: '', date_of_birth: '', gender: '',
        address: '', phone: '', email: '',
        guardian_name: '', guardian_phone: '', guardian_email: '',
        enrollment_status: 'Active', academic_program: '', department: '',
        semester: '', credit_hours: '', gpa: '', cgpa: '',
        classes_attended: '', total_classes: '',
        internal_marks: '', quiz_marks: '', semester_marks: '', total_marks: '', grade: '',
        total_fees: '', fees_paid: '', scholarship_amount: '', scholarship_type: '',
        admission_date: '', admission_form_submitted: false,
        id_proof_submitted: false, certificates_submitted: false,
        library_card_number: '', books_issued: '',
        disciplinary_remarks: '', club_memberships: '', extracurricular_activities: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.student_id || !form.full_name) {
            setError('Student ID and Full Name are required');
            return;
        }
        setIsLoading(true);
        setError('');

        const result = await createStudent({
            ...form,
            credit_hours: Number(form.credit_hours) || 0,
            gpa: Number(form.gpa) || 0,
            cgpa: Number(form.cgpa) || 0,
            classes_attended: Number(form.classes_attended) || 0,
            total_classes: Number(form.total_classes) || 0,
            internal_marks: Number(form.internal_marks) || 0,
            quiz_marks: Number(form.quiz_marks) || 0,
            semester_marks: Number(form.semester_marks) || 0,
            total_marks: Number(form.total_marks) || 0,
            total_fees: Number(form.total_fees) || 0,
            fees_paid: Number(form.fees_paid) || 0,
            scholarship_amount: Number(form.scholarship_amount) || 0,
            books_issued: Number(form.books_issued) || 0,
        });

        setIsLoading(false);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => router.push('/view'), 1500);
        } else {
            setError(result.error || 'Failed to save');
        }
    };

    if (success) {
        return (
            <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ padding: '48px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        margin: '0 auto 24px'
                    }}>✓</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Student Added!</h2>
                    <p style={{ color: '#71717a' }}>Redirecting to list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ minHeight: '100vh' }}>
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
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Enter Student Data</span>
                    </div>
                    <button onClick={toggleTheme} className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, fontSize: '18px' }}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            {/* Form */}
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
                {error && (
                    <div className="animate-slide-up" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#ef4444', marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Navigation Tabs (Optional visual aid) */}
                    <div className="animate-slide-up" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                        {['Personal', 'Academic', 'Attendance', 'Assessment', 'Financial', 'Documents', 'Admin'].map((section, idx) => (
                            <div key={idx} style={{
                                padding: '8px 16px',
                                borderRadius: '9999px',
                                backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                                color: isDark ? '#a1a1aa' : '#71717a',
                                fontSize: '12px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                            }}>
                                {idx + 1}. {section}
                            </div>
                        ))}
                    </div>

                    {/* Personal */}
                    <section className="card animate-slide-up" style={{ padding: '24px' }}>
                        <h3 className="section-title">
                            <span>👤</span> Personal & Demographic Data
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">Student ID *</label>
                                <input className="input" name="student_id" value={form.student_id} onChange={handleChange} placeholder="STU2024001" required />
                            </div>
                            <div>
                                <label className="label">Full Name *</label>
                                <input className="input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" required />
                            </div>
                            <div>
                                <label className="label">Date of Birth</label>
                                <input className="input" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">Gender</label>
                                <select className="input" name="gender" value={form.gender} onChange={handleChange}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Phone</label>
                                <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">Address</label>
                                <textarea className="input" name="address" value={form.address} onChange={handleChange} style={{ resize: 'none' }} rows={2} placeholder="Full residential address" />
                            </div>
                            <div>
                                <label className="label">Guardian Name</label>
                                <input className="input" name="guardian_name" value={form.guardian_name} onChange={handleChange} placeholder="Guardian name" />
                            </div>
                            <div>
                                <label className="label">Guardian Phone</label>
                                <input className="input" name="guardian_phone" value={form.guardian_phone} onChange={handleChange} placeholder="Guardian phone" />
                            </div>
                            <div>
                                <label className="label">Guardian Email</label>
                                <input className="input" name="guardian_email" type="email" value={form.guardian_email} onChange={handleChange} placeholder="Guardian email" />
                            </div>
                        </div>
                    </section>

                    {/* Academic */}
                    <section className="card animate-slide-up delay-100" style={{ padding: '24px' }}>
                        <h3 className="section-title">
                            <span>🎓</span> Academic Records
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">Enrollment Status</label>
                                <select className="input" name="enrollment_status" value={form.enrollment_status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Graduated">Graduated</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Program</label>
                                <input className="input" name="academic_program" value={form.academic_program} onChange={handleChange} placeholder="B.Tech" />
                            </div>
                            <div>
                                <label className="label">Department</label>
                                <input className="input" name="department" value={form.department} onChange={handleChange} placeholder="Computer Science" />
                            </div>
                            <div>
                                <label className="label">Semester</label>
                                <input className="input" name="semester" value={form.semester} onChange={handleChange} placeholder="4th" />
                            </div>
                            <div>
                                <label className="label">Credit Hours</label>
                                <input className="input" name="credit_hours" type="number" value={form.credit_hours} onChange={handleChange} placeholder="0" />
                            </div>
                            <div>
                                <label className="label">GPA</label>
                                <input className="input" name="gpa" type="number" step="0.01" value={form.gpa} onChange={handleChange} placeholder="0.00" />
                            </div>
                            <div>
                                <label className="label">CGPA</label>
                                <input className="input" name="cgpa" type="number" step="0.01" value={form.cgpa} onChange={handleChange} placeholder="0.00" />
                            </div>
                        </div>
                    </section>

                    {/* Combined Section: Attendance & Assessment */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        {/* Attendance */}
                        <section className="card animate-slide-up delay-200" style={{ padding: '24px' }}>
                            <h3 className="section-title">
                                <span>📅</span> Attendance
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="label">Classes Attended</label>
                                    <input className="input" name="classes_attended" type="number" value={form.classes_attended} onChange={handleChange} placeholder="0" />
                                </div>
                                <div>
                                    <label className="label">Total Classes</label>
                                    <input className="input" name="total_classes" type="number" value={form.total_classes} onChange={handleChange} placeholder="0" />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Attendance Percentage</label>
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                                        color: isDark ? '#fafafa' : '#18181b',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}>
                                        {form.total_classes ? ((Number(form.classes_attended) / Number(form.total_classes)) * 100).toFixed(1) : '0'}%
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Assessment */}
                        <section className="card animate-slide-up delay-200" style={{ padding: '24px' }}>
                            <h3 className="section-title">
                                <span>📝</span> Assessment
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="label">Internal</label>
                                    <input className="input" name="internal_marks" type="number" value={form.internal_marks} onChange={handleChange} placeholder="0" />
                                </div>
                                <div>
                                    <label className="label">Quiz</label>
                                    <input className="input" name="quiz_marks" type="number" value={form.quiz_marks} onChange={handleChange} placeholder="0" />
                                </div>
                                <div>
                                    <label className="label">Semester</label>
                                    <input className="input" name="semester_marks" type="number" value={form.semester_marks} onChange={handleChange} placeholder="0" />
                                </div>
                                <div>
                                    <label className="label">Total</label>
                                    <input className="input" name="total_marks" type="number" value={form.total_marks} onChange={handleChange} placeholder="0" />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Grade</label>
                                    <input className="input" name="grade" value={form.grade} onChange={handleChange} placeholder="e.g. A+" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Financial */}
                    <section className="card animate-slide-up delay-300" style={{ padding: '24px' }}>
                        <h3 className="section-title">
                            <span>💰</span> Financial Records
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">Total Fees</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#71717a' }}>₹</span>
                                    <input className="input" name="total_fees" type="number" value={form.total_fees} onChange={handleChange} style={{ paddingLeft: '32px' }} placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Fees Paid</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#71717a' }}>₹</span>
                                    <input className="input" name="fees_paid" type="number" value={form.fees_paid} onChange={handleChange} style={{ paddingLeft: '32px' }} placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Scholarship Amount</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#71717a' }}>₹</span>
                                    <input className="input" name="scholarship_amount" type="number" value={form.scholarship_amount} onChange={handleChange} style={{ paddingLeft: '32px' }} placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Scholarship Type</label>
                                <input className="input" name="scholarship_type" value={form.scholarship_type} onChange={handleChange} placeholder="Type" />
                            </div>
                        </div>
                    </section>

                    {/* Documents & Admin */}
                    <section className="card animate-slide-up delay-300" style={{ padding: '24px' }}>
                        <h3 className="section-title">
                            <span>🗂️</span> Documents & Administrative
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                            <div>
                                <label className="label">Admission Date</label>
                                <input className="input" name="admission_date" type="date" value={form.admission_date} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label className="label">Submitted Documents</label>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                        <input type="checkbox" name="admission_form_submitted" checked={form.admission_form_submitted} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                                        Admission Form
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                        <input type="checkbox" name="id_proof_submitted" checked={form.id_proof_submitted} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                                        ID Proof
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                        <input type="checkbox" name="certificates_submitted" checked={form.certificates_submitted} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                                        Certificates
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="label">Library Card</label>
                                <input className="input" name="library_card_number" value={form.library_card_number} onChange={handleChange} placeholder="Card #" />
                            </div>
                            <div>
                                <label className="label">Activities</label>
                                <input className="input" name="extracurricular_activities" value={form.extracurricular_activities} onChange={handleChange} placeholder="Activities" />
                            </div>
                        </div>
                    </section>

                    {/* Buttons */}
                    <div style={{
                        position: 'sticky',
                        bottom: '24px',
                        backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '16px',
                        boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Link href="/">
                            <button type="button" className="btn btn-secondary">
                                Cancel
                            </button>
                        </Link>
                        <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ opacity: isLoading ? 0.7 : 1 }}>
                            {isLoading ? 'Saving...' : '💾 Save Student Record'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
