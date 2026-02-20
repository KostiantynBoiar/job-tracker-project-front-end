'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header style={styles.header}>
      {/* Logo - Acts as a back button to home */}
      <Link href="/" style={styles.logo}>
        <span style={{ color: 'var(--accent-color)' }}>FAANG</span>Tracker
      </Link>

      <nav style={styles.nav}>
        <Link href="/jobs" style={styles.navLink}>Jobs</Link>
        
        {/* Dynamic Auth Button */}
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
    padding: '20px 40px',
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    width: '100%',
    position: 'absolute', // Sits at the absolute top of the page
    top: 0,
    left: 0,
    zIndex: 10,
    boxSizing: 'border-box',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  navLink: {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  authButton: {
    padding: '8px 20px',
    backgroundColor: 'transparent',
    border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'all 0.2s',
  }
};