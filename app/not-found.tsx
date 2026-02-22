'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../src/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <AlertTriangle size={64} style={styles.icon} />
        <h1 style={styles.title}>404 - Page Not Found</h1>
        
        {/* DYNAMIC TEXT BASED ON AUTH STATUS */}
        <p style={styles.subtitle}>
          {isAuthenticated 
            ? "The page or vacancy you are looking for has been filled or moved."
            : "The page you are looking for doesn't exist."}
        </p>

        {/* DYNAMIC BUTTON DESTINATION BASED ON AUTH STATUS */}
        <Link 
          href={isAuthenticated ? "/jobs" : "/"} 
          style={styles.button}
        >
          {isAuthenticated ? "Return to Dashboard" : "Return to Home Page"}
        </Link>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // 80px accounts for the absolute header if logged out
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
  icon: {
    color: 'var(--accent-color)',
    margin: '0 auto 20px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '1.75rem',
    color: 'var(--text-primary)',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '30px',
    fontSize: '1rem',
    lineHeight: '1.5',
  },
  button: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '14px 24px',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }
};