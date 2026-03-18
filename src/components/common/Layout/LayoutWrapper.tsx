'use client';

import React, { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // <-- Import icons for the mobile menu
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { AuthContext } from '../../../contexts/AuthContext';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Detect window resizing for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false); // Close mobile menu if expanded to desktop
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on mobile when navigating between pages
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [pathname, isMobile]);

  const isExplicitPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  const shouldShowHeader = isExplicitPublicPage || !isAuthenticated;

  if (isLoading) {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* 1. PUBLIC HEADER (Landing, Login, Register) */}
      {shouldShowHeader && <Header />}

      {/* 2. MOBILE LOGGED-IN HEADER (Hamburger Menu) */}
      {!shouldShowHeader && isMobile && (
        <header style={{
          display: 'flex', alignItems: 'center', height: '64px', padding: '0 20px', 
          backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40
        }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', marginRight: '16px', display: 'flex' }}>
            <Menu size={24} />
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            FAANG<span style={{color: '#3b82f6'}}>Tracker</span>
          </h1>
        </header>
      )}

      {/* 3. SIDEBAR WRAPPER (Handles Desktop & Mobile Slider) */}
      {!shouldShowHeader && (
        <>
          {/* Mobile Dark Overlay */}
          {isMobile && isSidebarOpen && (
            <div 
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 45 }} 
              onClick={() => setIsSidebarOpen(false)} 
            />
          )}
          
          <div style={{
            position: 'fixed',
            top: 0, bottom: 0, left: 0,
            width: '250px',
            zIndex: 50,
            transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            overflowY: 'auto'
          }}>
            {/* Mobile Close Button inside the Sidebar */}
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', zIndex: 60 }}
              >
                <X size={24} />
              </button>
            )}
            
            <Sidebar />
          </div>
        </>
      )}
      
      {/* 4. MAIN CONTENT AREA */}
      <main style={{ 
        flex: 1, 
        // Margin is 0 if header shows OR if on mobile!
        marginLeft: shouldShowHeader ? '0' : (isMobile ? '0' : '250px'), 
        paddingTop: shouldShowHeader ? '80px' : (isMobile ? '64px' : '0'), 
        width: '100%',
        transition: 'margin-left 0.3s ease',
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ flex: '1 0 auto' }}>
          {children}
        </div>

        {shouldShowHeader && <Footer />}
      </main>

    </div>
  );
}