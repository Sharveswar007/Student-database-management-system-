'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { deleteStudent, updateStudent } from '@/lib/actions/students';
import { StudentFull } from '@/lib/types';

interface ViewClientProps {
    initialStudents: StudentFull[];
}

const EMPTY_FORM: Partial<StudentFull> = {
    full_name: '', date_of_birth: '', gender: '', address: '', phone: '', email: '',
    guardian_name: '', guardian_phone: '', guardian_email: '',
    enrollment_status: 'Active', academic_program: '', department: '', semester: '',
    credit_hours: 0, gpa: 0, cgpa: 0,
    classes_attended: 0, total_classes: 0,
    internal_marks: 0, quiz_marks: 0, semester_marks: 0, grade: '',
    total_fees: 0, fees_paid: 0, scholarship_amount: 0, scholarship_type: '',
};

export default function ViewClient({ initialStudents }: ViewClientProps) {
    const [students, setStudents] = useState<StudentFull[]>(initialStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isDark, setIsDark] = useState(true);

    // Edit modal state
    const [editStudent, setEditStudent] = useState<StudentFull | null>(null);
    const [editForm, setEditForm] = useState<Partial<StudentFull>>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            setIsDark(false);
            document.body.classList.add('light');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const next = !prev;
            document.body.classList.toggle('light', !next);
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        setIsDeleting(id);
        const result = await deleteStudent(id);
        if (result.success) setStudents(students.filter(s => s.id !== id));
        setIsDeleting(null);
    };

    const openEdit = (student: StudentFull) => {
        setEditStudent(student);
        setEditForm({ ...student });
        setEditError('');
        setEditSuccess(false);
        setActiveTab('personal');
    };

    const closeEdit = () => {
        setEditStudent(null);
        setEditError('');
        setEditSuccess(false);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editStudent) return;
        setIsSaving(true);
        setEditError('');

        const payload: Partial<StudentFull> = {
            ...editForm,
            credit_hours: Number(editForm.credit_hours) || 0,
            gpa: Number(editForm.gpa) || 0,
            cgpa: Number(editForm.cgpa) || 0,
            classes_attended: Number(editForm.classes_attended) || 0,
            total_classes: Number(editForm.total_classes) || 0,
            internal_marks: Number(editForm.internal_marks) || 0,
            quiz_marks: Number(editForm.quiz_marks) || 0,
            semester_marks: Number(editForm.semester_marks) || 0,
            total_fees: Number(editForm.total_fees) || 0,
            fees_paid: Number(editForm.fees_paid) || 0,
            scholarship_amount: Number(editForm.scholarship_amount) || 0,
        };

        const result = await updateStudent(editStudent.id, payload);
        setIsSaving(false);
        if (result.success && result.data) {
            setStudents(prev => prev.map(s => s.id === editStudent.id ? result.data! : s));
            setEditSuccess(true);
            setTimeout(() => closeEdit(), 1200);
        } else {
            setEditError(result.error || 'Failed to update student');
        }
    };

    // ── Subcomponents ────────────────────────────────────────────────────────

    const InfoRow = ({ label, value }: { label: string; value: any }) => {
        let display = value;
        if (value instanceof Date) display = value.toLocaleDateString();
        else if (value && typeof value === 'object') display = value.toString();
        return (
            <div style={{ padding: '8px 0', borderBottom: `1px solid ${isDark ? '#27272a' : '#f4f4f5'}` }}>
                <span style={{ fontSize: '13px', color: isDark ? '#a1a1aa' : '#71717a', display: 'block', marginBottom: '4px' }}>{label}</span>
                <span style={{ fontSize: '14px', color: isDark ? '#fafafa' : '#18181b', fontWeight: '500' }}>{display || '-'}</span>
            </div>
        );
    };

    const Field = ({ label, name, type = 'text', placeholder = '', options }: {
        label: string; name: keyof StudentFull; type?: string; placeholder?: string;
        options?: { value: string; label: string }[];
    }) => (
        <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: isDark ? '#a1a1aa' : '#71717a', marginBottom: '6px' }}>{label}</label>
            {options ? (
                <select
                    className="input" name={name as string}
                    value={(editForm[name] as string) ?? ''}
                    onChange={handleEditChange}
                    style={{ width: '100%' }}
                >
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ) : (
                <input
                    className="input" name={name as string} type={type}
                    value={(editForm[name] as string) ?? ''}
                    onChange={handleEditChange}
                    placeholder={placeholder}
                    step={type === 'number' ? '0.01' : undefined}
                    style={{ width: '100%' }}
                />
            )}
        </div>
    );

    const tabs = ['personal', 'academic', 'attendance', 'assessment', 'financial'];

    // ── Edit Modal ────────────────────────────────────────────────────────────
    const EditModal = () => {
        if (!editStudent) return null;
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }} onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
                <div style={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderRadius: '20px', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                    width: '100%', maxWidth: '760px', maxHeight: '90vh',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                    {/* Modal Header */}
                    <div style={{
                        padding: '20px 28px', borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                color: '#fff', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '20px', fontWeight: 'bold'
                            }}>
                                {editStudent.full_name.charAt(0)}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: isDark ? '#fafafa' : '#18181b' }}>
                                    Edit Student
                                </h2>
                                <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>{editStudent.student_id}</p>
                            </div>
                        </div>
                        <button onClick={closeEdit} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '20px', color: '#71717a', padding: '4px 8px', borderRadius: '8px'
                        }}>✕</button>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: 'flex', gap: '4px', padding: '12px 20px', flexShrink: 0,
                        borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                        overflowX: 'auto', scrollbarWidth: 'none'
                    }}>
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: '7px 16px', borderRadius: '9999px', border: 'none',
                                cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                                whiteSpace: 'nowrap',
                                backgroundColor: activeTab === tab ? '#6366f1' : (isDark ? '#27272a' : '#f4f4f5'),
                                color: activeTab === tab ? '#fff' : (isDark ? '#a1a1aa' : '#71717a'),
                                transition: 'all 0.15s'
                            }}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Form body */}
                    <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

                            {editError && (
                                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
                                    ⚠️ {editError}
                                </div>
                            )}

                            {editSuccess && (
                                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', marginBottom: '16px', fontSize: '14px' }}>
                                    ✓ Student updated successfully!
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                    <Field label="Full Name *" name="full_name" placeholder="Full name" />
                                    <Field label="Date of Birth" name="date_of_birth" type="date" />
                                    <Field label="Gender" name="gender" options={[{ value: '', label: 'Select' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
                                    <Field label="Phone" name="phone" placeholder="Phone number" />
                                    <Field label="Email" name="email" type="email" placeholder="Email" />
                                    <Field label="Guardian Name" name="guardian_name" placeholder="Guardian name" />
                                    <Field label="Guardian Phone" name="guardian_phone" placeholder="Guardian phone" />
                                    <Field label="Guardian Email" name="guardian_email" type="email" placeholder="Guardian email" />
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: isDark ? '#a1a1aa' : '#71717a', marginBottom: '6px' }}>Address</label>
                                        <textarea className="input" name="address" value={(editForm.address as string) ?? ''} onChange={handleEditChange} style={{ width: '100%', resize: 'none' }} rows={2} placeholder="Address" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'academic' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                    <Field label="Enrollment Status" name="enrollment_status" options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Graduated', label: 'Graduated' }, { value: 'Suspended', label: 'Suspended' }]} />
                                    <Field label="Program" name="academic_program" placeholder="B.Tech" />
                                    <Field label="Department" name="department" placeholder="CSE" />
                                    <Field label="Semester" name="semester" placeholder="4" />
                                    <Field label="Credit Hours" name="credit_hours" type="number" placeholder="24" />
                                    <Field label="GPA (0–10)" name="gpa" type="number" placeholder="8.5" />
                                    <Field label="CGPA (0–10)" name="cgpa" type="number" placeholder="8.3" />
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <Field label="Classes Attended" name="classes_attended" type="number" placeholder="72" />
                                    <Field label="Total Classes" name="total_classes" type="number" placeholder="80" />
                                    <div style={{ gridColumn: '1 / -1', padding: '16px', borderRadius: '12px', backgroundColor: isDark ? '#27272a' : '#f4f4f5', textAlign: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Attendance % (auto-calculated)</span>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1', marginTop: '4px' }}>
                                            {Number(editForm.total_classes) > 0
                                                ? Math.min(100, (Number(editForm.classes_attended) / Number(editForm.total_classes)) * 100).toFixed(1)
                                                : '0'}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assessment' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <Field label="Internal Marks" name="internal_marks" type="number" placeholder="0" />
                                    <Field label="Quiz Marks" name="quiz_marks" type="number" placeholder="0" />
                                    <Field label="Semester Marks" name="semester_marks" type="number" placeholder="0" />
                                    <Field label="Grade" name="grade" placeholder="A+" />
                                    <div style={{ gridColumn: '1 / -1', padding: '16px', borderRadius: '12px', backgroundColor: isDark ? '#27272a' : '#f4f4f5', textAlign: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Total Marks (auto-calculated)</span>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1', marginTop: '4px' }}>
                                            {(Number(editForm.internal_marks) || 0) + (Number(editForm.quiz_marks) || 0) + (Number(editForm.semester_marks) || 0)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'financial' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <Field label="Total Fees (₹)" name="total_fees" type="number" placeholder="80000" />
                                    <Field label="Fees Paid (₹)" name="fees_paid" type="number" placeholder="80000" />
                                    <Field label="Scholarship Amount (₹)" name="scholarship_amount" type="number" placeholder="0" />
                                    <Field label="Scholarship Type" name="scholarship_type" placeholder="Merit" />
                                    <div style={{ gridColumn: '1 / -1', padding: '16px', borderRadius: '12px', backgroundColor: isDark ? '#27272a' : '#f4f4f5', textAlign: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Pending Dues (auto-calculated)</span>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1', marginTop: '4px' }}>
                                            ₹{Math.max(0, (Number(editForm.total_fees) || 0) - (Number(editForm.fees_paid) || 0) - (Number(editForm.scholarship_amount) || 0)).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '16px 28px', borderTop: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                            display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0
                        }}>
                            <button type="button" onClick={closeEdit} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ opacity: isSaving ? 0.7 : 1, minWidth: '120px' }}>
                                {isSaving ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // ── Main Render ───────────────────────────────────────────────────────────
    return (
        <div className="animate-fade-in" style={{ minHeight: '100vh', paddingBottom: '48px' }}>
            <EditModal />

            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                backgroundColor: isDark ? 'rgba(9, 9, 11, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)', padding: '16px 24px'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/" className="btn-secondary" style={{ padding: '8px 16px', textDecoration: 'none' }}>← Back</Link>
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
                    display: 'flex', gap: '16px', marginBottom: '32px', padding: '16px',
                    borderRadius: '16px', backgroundColor: isDark ? '#18181b' : '#ffffff',
                    border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }}>🔍</span>
                        <input
                            className="input" type="text"
                            placeholder="Search by name, ID, or department..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '48px', borderWidth: 0, backgroundColor: 'transparent' }}
                        />
                    </div>
                    <div style={{ width: '1px', backgroundColor: isDark ? '#27272a' : '#e4e4e7' }} />
                    <Link href="/enter">
                        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Add Student</button>
                    </Link>
                </div>

                {/* Count */}
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
                            {students.length === 0 ? 'Your database is empty.' : 'Try adjusting your search terms.'}
                        </p>
                        {students.length === 0 && (
                            <Link href="/enter"><button className="btn btn-primary">Add First Student</button></Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredStudents.map((student, index) => (
                            <div key={student.id} className="card animate-slide-up" style={{ animationDelay: `${index * 50}ms`, overflow: 'hidden' }}>
                                {/* Header Row */}
                                <div
                                    onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
                                    style={{
                                        padding: '24px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        backgroundColor: expandedId === student.id ? (isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.05)') : 'transparent',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '16px',
                                            background: `linear-gradient(135deg, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981'][student.id % 4]} 0%, ${['#4f46e5', '#db2777', '#d97706', '#059669'][student.id % 4]} 100%)`,
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '24px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
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
                                                <span className={`badge ${student.enrollment_status === 'Active' ? 'badge-primary' : ''}`}
                                                    style={student.enrollment_status !== 'Active' ? { backgroundColor: isDark ? '#27272a' : '#f4f4f5', color: '#a1a1aa' } : {}}>
                                                    {student.enrollment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {/* Edit Button */}
                                        <button
                                            onClick={e => { e.stopPropagation(); openEdit(student); }}
                                            className="btn"
                                            title="Edit student"
                                            style={{
                                                padding: '8px 14px', fontSize: '13px',
                                                backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                                                color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)',
                                                borderRadius: '10px', cursor: 'pointer'
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <div style={{
                                            width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', borderRadius: '50%',
                                            backgroundColor: isDark ? '#27272a' : '#f4f4f5', color: '#a1a1aa',
                                            transition: 'transform 0.3s',
                                            transform: expandedId === student.id ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}>▼</div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === student.id && (
                                    <div className="animate-fade-in" style={{
                                        padding: '0 24px 24px 24px',
                                        borderTop: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                                        backgroundColor: isDark ? 'rgba(99,102,241,0.02)' : 'rgba(99,102,241,0.02)'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginTop: '24px' }}>
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Personal</h4>
                                                <InfoRow label="Date of Birth" value={student.date_of_birth} />
                                                <InfoRow label="Gender" value={student.gender} />
                                                <InfoRow label="Phone" value={student.phone} />
                                                <InfoRow label="Email" value={student.email} />
                                                <InfoRow label="Address" value={student.address} />
                                                <InfoRow label="Guardian" value={student.guardian_name} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Academic</h4>
                                                <InfoRow label="Program" value={student.academic_program} />
                                                <InfoRow label="Semester" value={student.semester} />
                                                <InfoRow label="Credits" value={student.credit_hours} />
                                                <InfoRow label="GPA / CGPA" value={`${student.gpa || '-'} / ${student.cgpa || '-'}`} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Performance</h4>
                                                <InfoRow label="Attendance" value={`${student.attendance_percentage}%`} />
                                                <InfoRow label="Classes" value={`${student.classes_attended}/${student.total_classes}`} />
                                                <InfoRow label="Total Marks" value={student.total_marks} />
                                                <InfoRow label="Grade" value={student.grade} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', marginBottom: '16px', letterSpacing: '0.05em' }}>Financial</h4>
                                                <InfoRow label="Total Fees" value={`₹${student.total_fees}`} />
                                                <InfoRow label="Fees Paid" value={`₹${student.fees_paid}`} />
                                                <InfoRow label="Pending Dues" value={`₹${student.pending_dues}`} />
                                                <InfoRow label="Status" value={student.payment_status} />
                                                <InfoRow label="Scholarship" value={student.scholarship_amount ? `₹${student.scholarship_amount}` : '-'} />
                                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); openEdit(student); }}
                                                        className="btn"
                                                        style={{ flex: 1, backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
                                                    >
                                                        ✏️ Edit Record
                                                    </button>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleDelete(student.id); }}
                                                        disabled={isDeleting === student.id}
                                                        className="btn"
                                                        style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                                                    >
                                                        🗑️ Delete
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
