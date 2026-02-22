'use client';

import React, { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer'; // <-- IMPORT THE NEW FOOTER
import { AuthContext } from '../../../contexts/AuthContext';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  const isExplicitPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  const shouldShowHeader = isExplicitPublicPage || !isAuthenticated;

  if (isLoading) {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {shouldShowHeader ? <Header /> : <Sidebar />}
      
      <main style={{ 
        flex: 1, 
        marginLeft: shouldShowHeader ? '0' : '250px', 
        paddingTop: shouldShowHeader ? '80px' : '0', 
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