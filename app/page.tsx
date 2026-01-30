'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Gradient */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark
          ? 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #09090b 70%)'
          : 'radial-gradient(circle at 50% 0%, #e0e7ff 0%, #ffffff 70%)',
        zIndex: -1,
        transition: 'background 0.5s ease'
      }} />

      {/* Header */}
      <header className="animate-fade-in" style={{
        borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
        padding: '16px 24px',
        backdropFilter: 'blur(12px)',
        backgroundColor: isDark ? 'rgba(9, 9, 11, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              minWidth: '40px',
              height: '40px',
              padding: '0 8px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
            }}>
              DBMS
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.025em', color: isDark ? '#ffffff' : '#09090b', lineHeight: 1.2 }}>Student System</h1>
              <p style={{ fontSize: '12px', color: isDark ? '#a1a1aa' : '#71717a', margin: 0 }}>v2.0 • Pro Edition</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              fontSize: '18px',
              borderRadius: '10px'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px'
      }}>
        <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>

          <div className="animate-slide-up" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '800',
              marginBottom: '16px',
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: isDark ? '#ffffff' : '#09090b',
            }}>
              Student Database<br />Management System
            </h2>
            <p style={{
              fontSize: '20px',
              color: isDark ? '#a1a1aa' : '#52525b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              A comprehensive, secure, and modern solution for managing academic records with robust PostgreSQL storage.
            </p>
          </div>

          {/* Two Options */}
          <div className="animate-slide-up delay-100" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '64px'
          }}>
            {/* Enter Data */}
            <Link href="/enter" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: '40px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '24px'
                }}>
                  ➕
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Enter Data
                </h3>
                <p style={{ color: isDark ? '#a1a1aa' : '#71717a', margin: 0 }}>
                  Add new student records
                </p>
              </div>
            </Link>

            {/* View All */}
            <Link href="/view" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: '40px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '24px'
                }}>
                  👥
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  View Students
                </h3>
                <p style={{ color: isDark ? '#a1a1aa' : '#71717a', margin: 0 }}>
                  Browse and manage database
                </p>
              </div>
            </Link>
          </div>

          {/* Categories */}
          <div className="card animate-slide-up delay-200" style={{ padding: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#a1a1aa' : '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Comprehensive Data Coverage
              </p>
              <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>7 Categories</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {[
                { icon: '👤', label: 'Personal' },
                { icon: '🎓', label: 'Academic' },
                { icon: '📅', label: 'Attendance' },
                { icon: '📝', label: 'Assessment' },
                { icon: '💰', label: 'Financial' },
                { icon: '📄', label: 'Documents' },
                { icon: '📚', label: 'Library' },
                { icon: '⚽', label: 'Activities' }
              ].map(item => (
                <div key={item.label} style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="animate-fade-in delay-300" style={{
        borderTop: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
        padding: '32px',
        textAlign: 'center',
        backgroundColor: isDark ? '#09090b' : '#ffffff'
      }}>
        <p style={{ color: isDark ? '#52525b' : '#a1a1aa', fontSize: '14px', margin: 0 }}>
          Built with <strong style={{ color: isDark ? '#a1a1aa' : '#71717a' }}>Next.js</strong> and <strong style={{ color: isDark ? '#a1a1aa' : '#71717a' }}>PostgreSQL</strong>
        </p>
      </footer>
    </div>
  );
}
