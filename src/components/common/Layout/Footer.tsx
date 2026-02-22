'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brandSection}>
          <Link href="/" style={styles.logo}>
            <span style={{ color: 'var(--accent-color)' }}>FAANG</span>Tracker
          </Link>
          <p style={styles.description}>
            Automating your job search. We scrape, filter, and deliver the best software engineering roles directly to your dashboard.
          </p>
        </div>
        
        {/* Quick Links */}
        <div style={styles.linksSection}>
          <div style={styles.linkColumn}>
            <h4 style={styles.columnTitle}>Product</h4>
            <Link href="/register" style={styles.link}>Browse Jobs</Link>
            <Link href="/register" style={styles.link}>Pricing / Free Tier</Link>
            <Link href="/login" style={styles.link}>Sign In</Link>
          </div>
          <div style={styles.linkColumn}>
            <h4 style={styles.columnTitle}>Legal</h4>
            <Link href="/" style={styles.link}>Privacy Policy</Link>
            <Link href="/" style={styles.link}>Terms of Service</Link>
            <Link href="/" style={styles.link}>Cookie Policy</Link>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar (Copyright & Socials) */}
      <div style={styles.bottomBar}>
        <p style={styles.copyright}>© {new Date().getFullYear()} FAANG Tracker. All rights reserved.</p>
        <div style={styles.socials}>
          <a href="#" style={styles.socialIcon} aria-label="GitHub"><Github size={20} /></a>
          <a href="#" style={styles.socialIcon} aria-label="Twitter"><Twitter size={20} /></a>
          <a href="#" style={styles.socialIcon} aria-label="LinkedIn"><Linkedin size={20} /></a>
        </div>
      </div>
    </footer>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    padding: '60px 20px 20px',
    marginTop: 'auto', 
    width: '100%',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '40px',
    marginBottom: '60px',
  },
  brandSection: {
    flex: '1 1 300px',
    maxWidth: '400px',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '16px',
  },
  description: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    fontSize: '0.95rem',
    margin: 0,
  },
  linksSection: {
    display: 'flex',
    gap: '60px',
    flexWrap: 'wrap',
  },
  linkColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  columnTitle: {
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 8px 0',
  },
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
  },
  bottomBar: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  copyright: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    margin: 0,
  },
  socials: {
    display: 'flex',
    gap: '16px',
  },
  socialIcon: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
};