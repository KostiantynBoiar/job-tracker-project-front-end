import React from 'react';
import { Job } from '@/types/job'; 
import { Bookmark, ExternalLink, MapPin, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        <button 
          style={styles.saveButton} 
          aria-label={job.isSaved ? "Remove from saved jobs" : "Save this job"}
        >
          <Bookmark size={20} fill={job.isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div style={styles.metaContainer}>
        <span style={styles.metaItem}>
          <MapPin size={14} style={{ marginRight: 4 }} /> {job.location}
        </span>
        <span style={styles.metaItem}>
          <Calendar size={14} style={{ marginRight: 4 }} /> {job.postedDate}
        </span>
        {job.salary && (
          <span style={styles.metaItem}>
            <DollarSign size={14} style={{ marginRight: 4 }} /> {job.salary}
          </span>
        )}
      </div>

      <div style={styles.actions}>
        <Link href={`/jobs/${job.id}`} style={styles.detailsButton}>
            View Details
        </Link>
        
        <a 
          href={job.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.applyButton}
          aria-label={`Apply for ${job.title} at ${job.company} (Opens in new tab)`}
        >
          Apply Now <ExternalLink size={16} style={{ marginLeft: 6 }} />
        </a>
      </div>
    </article>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'transform 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  title: {
    fontSize: '1.25rem',
    margin: '0 0 4px 0',
    color: 'var(--text-primary)',
  },
  company: {
    fontSize: '1rem',
    color: 'var(--accent-color)', // Cyan for visibility
    margin: 0,
    fontWeight: 600,
  },
  saveButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
  },
  metaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  detailsButton: {
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    backgroundColor: 'transparent',
    border: '1px solid var(--text-secondary)',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 500,
  },
  applyButton: {
    flex: 1,
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--accent-color)',
    color: '#000', // Black on Cyan is High Contrast
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
  }
};

export default JobCard;