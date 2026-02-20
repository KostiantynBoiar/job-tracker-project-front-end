'use client';

import React, { useState, useContext } from 'react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AuthContext } from '../../src/contexts/AuthContext';
import { apiClient } from '../../src/api/client';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/users/login/', {
        email: email,
        password: password,
      });

      // Extract the token and user data from the Django REST response
      const token = response.data.token || response.data.access; 
      const userData = response.data.user || { id: 'unknown', email: email };
      
      if (token) {
        login(token, userData);
      } else {
        setError('Login succeeded but no token was returned from the server.');
      }
      
    } catch (err: any) {
      console.error('Login Error:', err.response || err);
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Server error. Ensure the Django backend is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your FAANG Tracker account</p>

        {error && (
          <div style={styles.errorBox} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={20} className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link href="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', padding: '20px', backgroundColor: 'var(--bg-primary)',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)', padding: '40px 30px',
    borderRadius: '12px', width: '100%', maxWidth: '420px',
    border: '1px solid var(--border-color)', textAlign: 'center',
  },
  title: { margin: '0 0 8px 0', fontSize: '1.75rem', color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255, 82, 82, 0.1)',
    color: 'var(--danger-color)', padding: '12px', borderRadius: '6px',
    marginBottom: '20px', border: '1px solid var(--danger-color)', fontSize: '0.9rem', textAlign: 'left',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '14px', color: 'var(--text-secondary)' },
  input: {
    width: '100%', padding: '14px 14px 14px 44px', backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '1rem', boxSizing: 'border-box',
  },
  submitButton: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px',
    backgroundColor: 'var(--accent-color)', color: '#000', fontWeight: 'bold', fontSize: '1rem',
    border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', minHeight: '48px',
  },
  footerText: { marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' },
  link: { color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }
};