'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../ThemeToggle'; 

export default function Header() {
  const pathname = usePathname();

  return (
    <header style={styles.header}>
      <Link href="/" style={styles.logo}>
        <span style={{ color: 'var(--accent-color)' }}>FAANG</span>Tracker
      </Link>

      <nav style={styles.nav}>
        <ThemeToggle />

        <Link href="/jobs" style={styles.navLink}>Jobs</Link>
        
        
        {pathname === '/login' ? (
          <Link href="/register" style={styles.authButton}>Register</Link>
        ) : (
          <Link href="/login" style={styles.authButton}>Login</Link>
        )}
      </nav>
    </header>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // 16px padding on mobile, smoothly scales up to 40px on desktop!
    padding: '16px clamp(16px, 5vw, 40px)', 
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    boxSizing: 'border-box',
  },
  logo: {
    // Shrinks logo slightly on very small phones
    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    whiteSpace: 'nowrap', // Prevents logo from breaking into two lines
  },
  nav: {
    display: 'flex',
    // Gap between links shrinks on mobile
    gap: 'clamp(10px, 3vw, 20px)', 
    alignItems: 'center',
  },
  navLink: {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  authButton: {
    // Button padding shrinks on mobile so it fits perfectly
    padding: '8px clamp(12px, 3vw, 20px)', 
    backgroundColor: 'transparent',
    border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap', // Prevents button text from wrapping weirdly
  }
};