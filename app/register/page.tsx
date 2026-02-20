'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../src/api/client';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // NEW: Track success state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/api/users/register/', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Instead of logging in, trigger the success UI
      setIsSuccess(true);
      
    } catch (err: any) {
      console.error('Register Error:', err.response || err);
      if (err.response?.data?.email) {
        setError('A user with this email already exists.');
      } else {
        setError('Registration failed. Ensure backend is running and data is valid.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS UI STATE
  if (isSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <CheckCircle size={64} style={{ color: 'var(--accent-color)', margin: '0 auto 20px' }} />
          <h1 style={styles.title}>Registration Successful!</h1>
          <p style={styles.subtitle}>Your account has been created successfully.</p>
          <Link href="/login" style={{...styles.submitButton, textDecoration: 'none'}}>
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Start tracking your target roles today</p>

        {error && (
          <div style={styles.errorBox} role="alert">
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          {/* Inputs stay exactly the same */}
          <div style={styles.inputGroup}>
            <User size={18} style={styles.icon} />
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} style={styles.input} required disabled={isSubmitting} />
          </div>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} style={styles.input} required disabled={isSubmitting} />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} style={styles.input} required disabled={isSubmitting} minLength={8} />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} style={styles.input} required disabled={isSubmitting} minLength={8} />
          </div>

          <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={20} className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link href="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '20px', backgroundColor: 'var(--bg-primary)' },
  card: { backgroundColor: 'var(--bg-secondary)', padding: '40px 30px', borderRadius: '12px', width: '100%', maxWidth: '420px', border: '1px solid var(--border-color)', textAlign: 'center' },
  title: { margin: '0 0 8px 0', fontSize: '1.75rem', color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255, 82, 82, 0.1)', color: 'var(--danger-color)', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid var(--danger-color)', fontSize: '0.9rem', textAlign: 'left' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '14px', color: 'var(--text-secondary)' },
  input: { width: '100%', padding: '14px 14px 14px 44px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box' },
  submitButton: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px', backgroundColor: 'var(--accent-color)', color: '#000', fontWeight: 'bold', fontSize: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', minHeight: '48px', width: '100%' },
  footerText: { marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' },
  link: { color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }
};