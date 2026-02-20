import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#121212',
      color: 'white'
    }}>
      <h1 style={{ color: '#FF5252' }}>404 - Page Not Found</h1>
      <p>The vacancy you are looking for has been filled or moved.</p>
      <Link href="/jobs" style={{ 
        marginTop: '20px', 
        color: '#00E5FF', 
        textDecoration: 'underline' 
      }}>
        Return to Dashboard
      </Link>
    </div>
  );
}