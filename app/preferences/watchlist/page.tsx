'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WatchlistRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/preferences');
  }, [router]);

  return (
    <div style={styles.container}>
      <p style={styles.text}>Redirecting to preferences...</p>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#888',
    fontSize: '1rem',
  },
};
