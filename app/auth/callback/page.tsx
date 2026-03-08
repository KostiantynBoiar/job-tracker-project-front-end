'use client';

import React, { useEffect, useState, useContext, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../../src/contexts/AuthContext';
import { apiClient } from '../../../src/api/client';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithTokens } = useContext(AuthContext);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access');
      const refreshToken = searchParams.get('refresh');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!accessToken || !refreshToken) {
        setStatus('error');
        setErrorMessage('Missing authentication tokens');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const response = await apiClient.get('/api/users/me/');
        const userData = response.data;

        loginWithTokens(accessToken, refreshToken, {
          id: userData.id,
          email: userData.email,
          name: userData.first_name || userData.username || userData.email,
        });

        setStatus('success');
        setTimeout(() => router.push('/jobs'), 1500);
      } catch {
        setStatus('error');
        setErrorMessage('Failed to fetch user profile');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, loginWithTokens]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <Loader2 size={48} style={styles.spinnerIcon} className="spinner" />
            <h2 style={styles.title}>Completing sign in...</h2>
            <p style={styles.subtitle}>Please wait while we verify your credentials</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} style={styles.successIcon} />
            <h2 style={styles.title}>Sign in successful!</h2>
            <p style={styles.subtitle}>Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={48} style={styles.errorIcon} />
            <h2 style={styles.title}>Authentication failed</h2>
            <p style={styles.subtitle}>{errorMessage}</p>
            <p style={styles.redirectText}>Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={styles.container}>
        <div style={styles.card}>
          <Loader2 size={48} style={styles.spinnerIcon} className="spinner" />
          <h2 style={styles.title}>Loading...</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    padding: '20px',
    backgroundColor: 'var(--bg-primary)',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '60px 40px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  title: {
    margin: '20px 0 8px 0',
    fontSize: '1.5rem',
    color: 'var(--text-primary)',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    margin: 0,
  },
  redirectText: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    marginTop: '16px',
  },
  spinnerIcon: {
    color: 'var(--accent-color)',
    animation: 'spin 1s linear infinite',
  },
  successIcon: {
    color: 'var(--accent-color)',
  },
  errorIcon: {
    color: 'var(--danger-color)',
  },
};
