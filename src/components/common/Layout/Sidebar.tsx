'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Settings, Bookmark, Sun, Moon, LogOut } from 'lucide-react';
import { AuthContext } from '../../../contexts/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  
  // Theme State Management
  const [isDark, setIsDark] = useState(true);

  // When the component mounts, check the current theme
  useEffect(() => {
    // Check if the html tag has the light theme class or data attribute
    const isLightMode = 
      document.documentElement.getAttribute('data-theme') === 'light' || 
      document.body.classList.contains('light-mode');
      
    setIsDark(!isLightMode);
  }, []);

  // Toggle Theme Function
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Update the DOM to reflect the change globally
    if (newIsDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      // Update local storage if your app checks it on load
      localStorage.setItem('theme', 'dark'); 
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    if (logout) await logout();
    router.push('/login');
  };

  // Active Link Highlighter
  const getLinkStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    margin: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#3b82f6' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  });

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.sidebarHeader}>
        <h1 style={styles.logoText}>FAANG<span style={{color: '#3b82f6'}}>Tracker</span></h1>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        <Link href="/jobs" style={getLinkStyle(pathname === '/jobs')}>
          <LayoutGrid size={20} /> Daily Feed
        </Link>
        <Link href="/preferences" style={getLinkStyle(pathname === '/preferences')}>
          <Settings size={20} /> My Watchlist
        </Link>
        <Link href="/saved" style={getLinkStyle(pathname === '/saved')}>
          <Bookmark size={20} /> Saved Jobs
        </Link>
      </nav>

      {/* Bottom Section (Theme Toggle & User Profile) */}
      <div style={styles.bottomSection}>
        
        {/* Theme Toggle Switch */}
        <div style={styles.themeToggleContainer} onClick={toggleTheme}>
          <div style={styles.themeToggleBg}>
            <div style={{
              ...styles.themeToggleSlider,
              transform: isDark ? 'translateX(0)' : 'translateX(100%)'
            }} />
            <div style={{...styles.themeIconWrapper, color: isDark ? '#fff' : 'var(--text-secondary)'}}>
              <Moon size={14} />
              <span style={styles.themeText}>Dark</span>
            </div>
            <div style={{...styles.themeIconWrapper, color: !isDark ? '#111' : 'var(--text-secondary)'}}>
              <Sun size={14} />
              <span style={styles.themeText}>Light</span>
            </div>
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div style={styles.userSection}>
          {/* Wrapped the entire avatar and email in a clean Link to /profile */}
          <Link href="/profile" style={styles.userInfoLink}>
            <div style={styles.avatar}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userEmail} title={user?.email || 'User'}>
              {user?.email?.split('@')[0] || 'User'}
            </div>
          </Link>
          
          <button onClick={handleSignOut} style={styles.signOutBtn} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Fully dynamic CSS variables for seamless transitions!
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: { 
    width: '100%', 
    height: '100%',
    display: 'flex', 
    flexDirection: 'column',
    backgroundColor: 'var(--bg-secondary)', 
  },
  sidebarHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    height: '80px', 
    padding: '0 24px',
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0
  },
  logoText: { 
    fontSize: '1.25rem', 
    fontWeight: 800, 
    color: 'var(--text-primary)', 
    margin: 0, 
    letterSpacing: '-0.5px' 
  },
  nav: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    paddingTop: '16px',
    overflowY: 'auto'
  },
  bottomSection: {
    padding: '16px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flexShrink: 0
  },
  // Theme Toggle Styles
  themeToggleContainer: {
    cursor: 'pointer',
    width: '100%',
  },
  themeToggleBg: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    padding: '4px',
    height: '40px',
  },
  themeToggleSlider: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    width: 'calc(50% - 4px)',
    height: 'calc(100% - 8px)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  themeIconWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    zIndex: 2,
    transition: 'color 0.3s ease',
  },
  themeText: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  // User Profile Styles
  userSection: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: '8px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  },
  userInfoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
    textDecoration: 'none', // Prevents underline on the email text
    cursor: 'pointer',
  },
  avatar: { 
    width: '32px', 
    height: '32px', 
    borderRadius: '50%', 
    backgroundColor: '#3b82f6', 
    color: '#fff', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: 'bold',
    flexShrink: 0
  },
  userEmail: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px'
  },
  signOutBtn: { 
    background: 'none', 
    border: 'none', 
    color: '#ef4444', 
    cursor: 'pointer', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  }
};