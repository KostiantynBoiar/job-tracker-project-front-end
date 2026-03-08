import React from 'react';
import { Job } from '../../../api/jobs';
import { Bookmark, ExternalLink, MapPin, Calendar, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  isSaving?: boolean;
  onToggleSave?: (jobId: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isSaved = false, isSaving = false, onToggleSave }) => {

  const formatSalary = (): string | null => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || '$';
    const min = job.salary_min ? `${job.salary_min.toLocaleString()}` : '';
    const max = job.salary_max ? `${job.salary_max.toLocaleString()}` : '';
    if (min && max) return `${currency}${min} - ${currency}${max}`;
    return `${currency}${min || max}`;
  };


  const formatLocation = (): string => {
    if (job.is_remote) return 'Remote';
    if (!job.location) return 'Not specified';
    const parts = [job.location.city, job.location.country].filter(Boolean);
    return parts.join(', ') || 'Not specified';
  };


  const formatPostedDate = (): string => {
    if (!job.posted_at) return 'Recently';
    const date = new Date(job.posted_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const salary = formatSalary();

  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <div style={styles.companyLogo}>
          {job.company.logo_url ? (
            <img src={job.company.logo_url} alt={job.company.name} style={styles.logoImg} />
          ) : (
            job.company.name.charAt(0)
          )}
        </div>
        <div style={styles.headerInfo}>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company.name}</p>
        </div>
        {onToggleSave && (
          <button 
            style={{
              ...styles.saveButton,
              ...(isSaved ? styles.saveButtonSaved : {}),
            }}
            onClick={() => onToggleSave(job.id)}
            disabled={isSaving}
            aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
          >
            {isSaving ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
            )}
          </button>
        )}
      </div>

      <div style={styles.metaContainer}>
        <span style={styles.metaItem}>
          <MapPin size={14} style={{ marginRight: 4 }} /> {formatLocation()}
        </span>
        <span style={styles.metaItem}>
          <Calendar size={14} style={{ marginRight: 4 }} /> {formatPostedDate()}
        </span>
        {salary && (
          <span style={styles.metaItem}>
            <DollarSign size={14} style={{ marginRight: 4 }} /> {salary}
          </span>
        )}
      </div>

      <div style={styles.actions}>
        <Link href={`/jobs/${job.id}`} style={styles.detailsButton}>
            View Details
        </Link>
        
        <a 
          href={job.external_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.applyButton}
          aria-label={`Apply for ${job.title} at ${job.company.name} (Opens in new tab)`}
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
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '12px',
  },
  companyLogo: {
    width: '48px',
    height: '48px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: '1.25rem',
    margin: '0 0 4px 0',
    color: 'var(--text-primary)',
  },
  company: {
    fontSize: '1rem',
    color: 'var(--accent-color)',
    margin: 0,
    fontWeight: 600,
  },
  saveButton: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonSaved: {
    backgroundColor: 'var(--accent-color)',
    borderColor: 'var(--accent-color)',
    color: '#000',
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
    color: '#000',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
  }
};

export default JobCard;
