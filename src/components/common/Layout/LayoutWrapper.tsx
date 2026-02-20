'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Render Sidebar OR Header based on the page */}
      {isPublicPage ? <Header /> : <Sidebar />}
      
      <main style={{ 
        flex: 1, 
        // If sidebar is visible, push content right. If Header is visible, add top padding.
        marginLeft: isPublicPage ? '0' : '250px', 
        paddingTop: isPublicPage ? '80px' : '0', // 80px clears the absolute Header
        width: '100%',
        transition: 'margin-left 0.3s ease'
      }}>
        {children}
      </main>
    </div>
  );
}