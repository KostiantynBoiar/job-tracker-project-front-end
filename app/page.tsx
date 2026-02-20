import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <main style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Track FAANG Vacancies <br />
          <span style={{ color: 'var(--accent-color)' }}>Without the Noise</span>
        </h1>
        <p style={styles.subtitle}>
          Automated scraping. Personalised feeds. Accessibility first.
          Stop refreshing 20 different carrier pages every day.
        </p>
        
        <div style={styles.ctaContainer}>
          <Link href="/login" style={styles.primaryBtn}>
            Get Started <ArrowRight size={20} style={{ marginLeft: 8 }} />
          </Link>
          <a href="#features" style={styles.secondaryBtn}>
            Learn More
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={styles.features}>
        <div style={styles.featureCard}>
          <Zap size={32} style={{ color: 'var(--accent-color)', marginBottom: 16 }} />
          <h3>Real-time Updates</h3>
          <p>Background workers scrape Apple, Nvidia, and Google every 24 hours.</p>
        </div>
        <div style={styles.featureCard}>
          <ShieldCheck size={32} style={{ color: 'var(--accent-color)', marginBottom: 16 }} />
          <h3>Privacy Focused</h3>
          <p>We only store what matters. No tracking, just job hunting.</p>
        </div>
        <div style={styles.featureCard}>
          <Globe size={32} style={{ color: 'var(--accent-color)', marginBottom: 16 }} />
          <h3>Centralised Feed</h3>
          <p>All your target companies in one high-contrast, accessible dashboard.</p>
        </div>
      </section>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  hero: {
    textAlign: 'center',
    maxWidth: '800px',
    marginBottom: '80px',
    marginTop: '60px',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: '24px',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-secondary)',
    marginBottom: '40px',
    lineHeight: 1.6,
  },
  ctaContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '1.1rem',
    minHeight: '44px', // Accessibility target size
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--text-secondary)',
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '1.1rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    maxWidth: '1000px',
    width: '100%',
    marginBottom: '60px',
  },
  featureCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '30px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  }
};