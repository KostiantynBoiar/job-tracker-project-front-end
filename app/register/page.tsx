'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, Loader2, CheckCircle, Github } from 'lucide-react';
import Link from 'next/link';
// Importing our custom API client and OAuth helpers to maintain separation of concerns
import { apiClient } from '../../src/api/client';
import { getGoogleAuthUrl, getGitHubAuthUrl } from '../../src/api/oauth';

export default function RegisterPage() {
  // State management for form inputs (Controlled Component pattern)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // State for handling UI feedback (errors, loading spinners, and success screens)
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Generic handler to update form state dynamically based on the input's 'name' attribute
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles traditional Email/Password registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission to handle it via AJAX
    setError('');

    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send a POST request to our Django REST backend
      await apiClient.post('/api/users/register/', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        password_confirm: formData.confirmPassword,
      });
      // If successful, switch the UI to the success screen
      setIsSuccess(true);
    } catch (err: unknown) {
      // Error handling: parse the response from the Django backend to show meaningful messages
      const error = err as { response?: { data?: { detail?: string; email?: string[] } } };
      if (error.response?.data?.email) {
        setError(error.response.data.email[0]); // e.g., "Email already exists"
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false); // Stop the loading spinner regardless of success or failure
    }
  };

  // Initiates the Google OAuth 2.0 flow
  const handleGoogleRegister = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      // Fetch the Google authorization URL from our backend and redirect the user
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch {
      setError('Failed to initiate Google registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Initiates the GitHub OAuth flow
  const handleGitHubRegister = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      // Fetch the GitHub authorization URL from our backend and redirect the user
      const authUrl = await getGitHubAuthUrl();
      window.location.href = authUrl;
    } catch {
      setError('Failed to initiate GitHub registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Conditional Rendering: Show success screen if registration passed
  if (isSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <CheckCircle size={64} style={{ color: 'var(--accent-color)', margin: '0 auto 20px' }} />
          <h1 style={styles.title}>Registration Successful!</h1>
          <p style={styles.subtitle}>Your account has been created successfully.</p>
          <Link href="/login" style={{ ...styles.submitButton, textDecoration: 'none' }}>
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  // Default Rendering: Show the registration form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Start tracking your target roles today</p>

        {/* Display error messages dynamically if they exist */}
        {error && (
          <div style={styles.errorBox} role="alert">
            <AlertCircle size={18} style={{ minWidth: '18px' }} />
            <span style={{ wordBreak: 'break-word' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={18} style={styles.icon} />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={isSubmitting}
            />
          </div>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={isSubmitting}
            />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={isSubmitting}
              minLength={8}
            />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={isSubmitting}
              minLength={8}
            />
          </div>

          <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={20} className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or register with</span>
        </div>

        {/* Social Authentication Providers */}
        <div style={styles.socialGroup}>
          <button
            type="button"
            onClick={handleGoogleRegister}
            style={styles.socialButton}
            disabled={isSubmitting}
          >
            {/* Embedded SVG for Google logo to reduce external network requests */}
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={handleGitHubRegister}
            style={styles.socialButton}
            disabled={isSubmitting}
          >
            <Github size={20} color="var(--text-primary)" />
            GitHub
          </button>
        </div>

        <p style={styles.footerText}>
          Already have an account? <Link href="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

// Styling uses CSS Variables (e.g., var(--bg-primary)) to fully support the Light/Dark mode theme engine
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    padding: '20px',
    backgroundColor: 'var(--bg-primary)',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '40px 30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '1.75rem',
    color: 'var(--text-primary)',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '30px',
    fontSize: '0.95rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    color: 'var(--danger-color)',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid var(--danger-color)',
    fontSize: '0.9rem',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-secondary)',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  submitButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '14px',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    minHeight: '48px',
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  dividerText: {
    margin: '0 10px',
  },
  socialGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  footerText: {
    marginTop: '24px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  link: {
    color: 'var(--accent-color)',
    textDecoration: 'none',
    fontWeight: 500,
  },
};