'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Briefcase, DollarSign, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for the landing page teaser
const FEATURED_JOBS = [
  {
    id: 'f1',
    title: 'Senior React Developer',
    company: 'Meta',
    location: 'London, UK (Hybrid)',
    salary: '£120k - £160k',
    tags: ['React', 'Next.js', 'GraphQL'],
    posted: '2 hours ago',
  },
  {
    id: 'f2',
    title: 'Machine Learning Engineer',
    company: 'Apple',
    location: 'Remote',
    salary: '$180k - $250k',
    tags: ['Python', 'PyTorch', 'AI'],
    posted: '5 hours ago',
  },
  {
    id: 'f3',
    title: 'Backend Systems Engineer',
    company: 'Amazon',
    location: 'Dublin, Ireland',
    salary: '€110k - €150k',
    tags: ['Go', 'AWS', 'Microservices'],
    posted: '1 day ago',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // On a public landing page, searching usually prompts the user to sign up/login to see full results!
    router.push(`/register?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div style={styles.container}>
      {/* 1. HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Land your dream role at <span style={{ color: 'var(--accent-color)' }}>FAANG</span>
          </h1>
          <p style={styles.heroSubtitle}>
            We automatically scrape, filter, and track the best software engineering roles from top tech companies so you don't have to.
          </p>

          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchInputWrapper}>
              <Search size={20} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search by role, company, or skill (e.g., 'React Meta')" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button type="submit" style={styles.searchButton}>
              Find Jobs
            </button>
          </form>
          <div style={styles.trendingTags}>
            <span style={styles.trendingLabel}>Trending:</span>
            {['Software Engineer', 'Remote', 'Google', 'Python'].map(tag => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED JOBS SECTION */}
      <section style={styles.featuredSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured Opportunities</h2>
          <Link href="/login" style={styles.viewAllLink}>
            View all jobs <ArrowRight size={16} />
          </Link>
        </div>

        <div style={styles.jobsGrid}>
          {FEATURED_JOBS.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <span style={styles.companyBadge}>{job.company}</span>
              </div>
              
              <div style={styles.jobDetails}>
                <span style={styles.detailItem}><MapPin size={16} style={styles.detailIcon}/> {job.location}</span>
                <span style={styles.detailItem}><DollarSign size={16} style={styles.detailIcon}/> {job.salary}</span>
                <span style={styles.detailItem}><Briefcase size={16} style={styles.detailIcon}/> {job.posted}</span>
              </div>

              <div style={styles.techTags}>
                {job.tags.map(tag => (
                  <span key={tag} style={styles.techTag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CALL TO ACTION SECTION */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Stop hunting. Start applying.</h2>
        <p style={styles.ctaSubtitle}>Join today and get daily alerts for roles that match your exact preferences.</p>
        <div style={styles.ctaButtons}>
          <Link href="/register" style={styles.primaryButton}>Create Free Account</Link>
          <Link href="/login" style={styles.secondaryButton}>Sign In</Link>
        </div>
      </section>
    </div>
  );
}

// Responsive CSS-in-JS using Flexbox and Percentages
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  
  // HERO STYLES
  heroSection: {
    padding: '80px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
  },
  heroContent: {
    maxWidth: '800px',
    width: '100%',
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)', // Automatically shrinks on mobile!
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: '0 0 20px 0',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    marginBottom: '40px',
    lineHeight: 1.6,
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    flexWrap: 'wrap', // Allows the button to drop below the input on super small screens
  },
  searchInputWrapper: {
    flex: '1 1 300px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-secondary)',
  },
  searchInput: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  searchButton: {
    padding: '16px 32px',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: '0 1 auto',
    whiteSpace: 'nowrap',
  },
  trendingTags: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  trendingLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  tag: {
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    border: '1px solid var(--border-color)',
  },

  // FEATURED JOBS STYLES
  featuredSection: {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--accent-color)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  jobsGrid: {
    display: 'flex',
    flexWrap: 'wrap', // Crucial for responsive grid
    gap: '20px',
    justifyContent: 'center',
  },
  jobCard: {
    flex: '1 1 340px', // Shrinks and grows, but tries to be 340px wide
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'transform 0.2s',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  jobTitle: {
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
    margin: 0,
    fontWeight: 600,
  },
  companyBadge: {
    padding: '4px 10px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  jobDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  detailIcon: {
    color: 'var(--text-secondary)',
  },
  techTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: 'auto', // Pushes tags to the bottom of the card
  },
  techTag: {
    padding: '4px 8px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue tint
    color: 'var(--accent-color)',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },

  // CTA STYLES
  ctaSection: {
    padding: '80px 20px',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: '2rem',
    color: 'var(--text-primary)',
    margin: '0 0 16px 0',
  },
  ctaSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    marginBottom: '32px',
    maxWidth: '600px',
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '14px 28px',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    textDecoration: 'none',
    fontWeight: 'bold',
    borderRadius: '8px',
  },
  secondaryButton: {
    padding: '14px 28px',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    textDecoration: 'none',
    fontWeight: 'bold',
    borderRadius: '8px',
  },
};