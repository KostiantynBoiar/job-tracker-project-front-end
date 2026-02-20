'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '../../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state has finished loading and the user is NOT authenticated, kick them to login
    if (!isLoading && !isAuthenticated) {
      // Pass the route they tried to visit so we could theoretically redirect them back later
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // While checking local storage for the token, show a full-screen spinner
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-color)' }} />
      </div>
    );
  }

  // If authenticated, render the page content
  return isAuthenticated ? <>{children}</> : null;
}