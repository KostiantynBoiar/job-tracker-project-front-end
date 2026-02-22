'use client';

import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '64px', height: '32px' }} />; 
  }

  const isDark = theme === 'dark';

  return (
    <button 
      onClick={toggleTheme} 
      style={{
        ...styles.toggleContainer,
        backgroundColor: isDark ? '#27272a' : '#e4e4e7' // Darker bg in dark mode
      }}
      aria-label="Toggle Dark Mode"
    >
      <div style={{
        ...styles.slider,
        transform: isDark ? 'translateX(32px)' : 'translateX(0)',
        backgroundColor: isDark ? '#000' : '#fff',
      }}>
        {isDark ? (
          <Moon size={14} color="#fff" />
        ) : (
          <Sun size={14} color="#000" />
        )}
      </div>
    </button>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  toggleContainer: {
    position: 'relative',
    width: '64px',
    height: '32px',
    borderRadius: '30px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    transition: 'background-color 0.3s ease',
  },
  slider: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), background-color 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  }
};