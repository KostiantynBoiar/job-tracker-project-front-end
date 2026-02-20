'use client';

import React, { useState } from 'react';
import JobCard from '../../src/components/jobs/JobCard/JobCard';
import { Job } from '../../src/types/job';
import { Filter } from 'lucide-react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute/ProtectedRoute';

// MOCK DATA: This simulates what your Celery Scraper will return later
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Apple',
    location: 'London, UK',
    postedDate: '2 hours ago',
    sourceUrl: 'https://apple.com/careers',
    platform: 'Apple',
    description: 'Working on iOS infrastructure and core services...',
    isSaved: false,
  },
  {
    id: '2',
    title: 'AI Research Scientist',
    company: 'Nvidia',
    location: 'Remote',
    postedDate: '5 hours ago',
    salary: '$150k - $220k',
    sourceUrl: 'https://nvidia.com',
    platform: 'Nvidia',
    description: 'Deep learning optimization for next-generation hardware...',
    isSaved: true,
  },
  {
    id: '3',
    title: 'Frontend Developer (React)',
    company: 'Netflix',
    location: 'Amsterdam, NL',
    postedDate: '1 day ago',
    sourceUrl: 'https://jobs.netflix.com',
    platform: 'Netflix',
    description: 'Building the next generation video player architecture...',
    isSaved: false,
  },
];

export default function JobsPage() {
  const [jobs] = useState<Job[]>(MOCK_JOBS);

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Daily Recap</h1>
          <button style={styles.filterButton}>
            <Filter size={18} style={{ marginRight: 8 }} /> Filters
          </button>
        </div>

        {/* The Job Feed */}
        <div style={styles.feed}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        
        {/* End of Feed Message */}
        <p style={styles.footerMsg}>You're all caught up!</p>
      </div>
    </ProtectedRoute>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '2rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    cursor: 'pointer',
    minHeight: '44px', // WCAG accessibility touch target size
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  footerMsg: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    marginTop: '40px',
  }
};