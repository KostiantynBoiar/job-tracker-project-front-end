'use client'; // Required in Next.js for components that use client-side hooks like useEffect and useState

import React, { useEffect, useState, useContext, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
// Importing global authentication state to avoid prop-drilling
import { AuthContext } from '../../../src/contexts/AuthContext';
import { apiClient } from '../../../src/api/client';

// We separate the actual logic into an inner component so we can wrap it in a Suspense boundary later
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithTokens } = useContext(AuthContext);
  
  // State to manage the UI feedback during the async OAuth handoff process
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Extract the JWT access and refresh tokens returned by the Django backend via URL parameters
      const accessToken = searchParams.get('access');
      const refreshToken = searchParams.get('refresh');
      const error = searchParams.get('error');

      // Handle explicit errors returned from the OAuth provider or our Django backend
      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        setTimeout(() => router.push('/login'), 3000); // Graceful fallback to login page
        return;
      }

      // Security check: Ensure we actually received the required tokens
      if (!accessToken || !refreshToken) {
        setStatus('error');
        setErrorMessage('Missing authentication tokens');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        // Temporarily store tokens so the apiClient can attach them as Bearer headers in the next request
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Fetch the authenticated user's profile data to populate the UI (avatar, name, etc.)
        const response = await apiClient.get('/api/users/me/');
        const userData = response.data;

        // Update the global AuthContext. This synchronizes the entire application state.
        loginWithTokens(accessToken, refreshToken, {
          id: userData.id,
          email: userData.email,
          name: userData.first_name || userData.username || userData.email,
        });

        // Show success animation briefly before routing to the protected Daily Feed
        setStatus('success');
        setTimeout(() => router.push('/jobs'), 1500);
      } catch {
        // Fallback error handling if the /users/me/ endpoint fails (e.g., token was invalid)
        setStatus('error');
        setErrorMessage('Failed to fetch user profile');
        
        // Clean up invalid tokens to prevent a corrupted auth state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, loginWithTokens]);

  // Conditional rendering to provide clear visual feedback based on the OAuth flow status
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
            {/* Using role="alert" implicitly via the error context for WCAG accessibility */}
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

// Default export wrapper
export default function OAuthCallbackPage() {
  return (
    // Next.js requires components utilizing the `useSearchParams` hook to be wrapped in a React <Suspense> boundary.
    // This ensures the application doesn't de-optimize from static rendering during the build process.
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

// Styling utilizes CSS Variables (e.g., var(--bg-primary)) to seamlessly sync with the global theme engine
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