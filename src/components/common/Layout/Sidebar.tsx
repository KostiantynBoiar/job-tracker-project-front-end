'use client'; // Required for interactivity

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Bookmark, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  const navItems = [
    { name: 'Daily Feed', path: '/jobs', icon: LayoutDashboard },
    { name: 'My Watchlist', path: '/preferences', icon: Settings },
    { name: 'Saved Jobs', path: '/saved', icon: Bookmark },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Logo */}
      <div style={styles.logo}>
        <span style={{ color: 'var(--accent-color)' }}>FAANG</span>Tracker
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                ...styles.link,
                ...(isActive ? styles.activeLink : {}),
              }}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button at bottom */}
      <div style={styles.footer}>
        <Link href="/login" style={styles.logoutBtn}>
          <LogOut size={20} />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '250px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    backgroundColor: 'var(--bg-secondary)', // Darker grey
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    zIndex: 100,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '40px',
    color: 'white',
    paddingLeft: '10px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'var(--text-secondary)', // Grey by default
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  activeLink: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)', // Subtle Cyan tint
    color: 'var(--accent-color)', // Cyan text
    fontWeight: 'bold',
    borderLeft: '3px solid var(--accent-color)', // Indicator line
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: '#FF5252', // Red for danger/logout
    textDecoration: 'none',
    fontWeight: 500,
  }
};