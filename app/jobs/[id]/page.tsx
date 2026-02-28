'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Briefcase,
  Clock,
  Loader2,
} from 'lucide-react';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute/ProtectedRoute';
import { getJobById, getSavedJobs, saveJob, unsaveJob, Job, SavedJob } from '../../../src/api/jobs';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);

  // State
  const [job, setJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch job and saved jobs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobData, savedJobsData] = await Promise.all([
          getJobById(jobId),
          getSavedJobs(),
        ]);
        setJob(jobData);
        setSavedJobs(savedJobsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch job:', err);
        setError('Failed to load job details. The job may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  // Check if job is saved
  const getSavedJob = (): SavedJob | undefined => {
    if (!job) return undefined;
    return savedJobs.find((sj) => sj.job.id === job.id);
  };

  // Handle save/unsave
  const handleToggleSave = async () => {
    if (!job) return;

    const savedJob = getSavedJob();
    setIsSaving(true);

    try {
      if (savedJob) {
        await unsaveJob(savedJob.id);
        setSavedJobs(savedJobs.filter((sj) => sj.id !== savedJob.id));
      } else {
        const newSavedJob = await saveJob(job.id);
        setSavedJobs([...savedJobs, newSavedJob]);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Go back
  const handleGoBack = () => {
    router.back();
  };

  // Format salary
  const formatSalary = (): string | null => {
    if (!job || (!job.salary_min && !job.salary_max)) return null;
    const currency = job.salary_currency || 'USD';
    const min = job.salary_min ? `${job.salary_min.toLocaleString()}` : '';
    const max = job.salary_max ? `${job.salary_max.toLocaleString()}` : '';
    if (min && max) return `${currency} ${min} - ${max}`;
    return `${currency} ${min || max}`;
  };

  // Format location
  const formatLocation = (): string => {
    if (!job) return '';
    if (job.is_remote) return 'Remote';
    if (!job.location) return 'Not specified';
    const parts = [job.location.city, job.location.state, job.location.country].filter(Boolean);
    return parts.join(', ') || 'Not specified';
  };

  // Format posted date
  const formatPostedDate = (): string => {
    if (!job?.posted_at) return 'Recently posted';
    const date = new Date(job.posted_at);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format employment type
  const formatEmploymentType = (): string => {
    if (!job?.employment_type) return 'Not specified';
    return job.employment_type.replace('_', '-').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Format experience level
  const formatExperienceLevel = (): string => {
    if (!job?.experience_level) return 'Not specified';
    const levels: Record<string, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior Level',
      executive: 'Executive',
    };
    return levels[job.experience_level] || job.experience_level;
  };

  // Parse requirements (assuming they're stored as newline-separated text)
  const parseRequirements = (): string[] => {
    if (!job?.requirements) return [];
    return job.requirements.split('\n').filter((r) => r.trim());
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <Loader2 size={32} style={styles.spinner} />
            <p>Loading job details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <ProtectedRoute>
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <h1 style={styles.errorTitle}>Job Not Found</h1>
            <p style={styles.errorText}>{error || 'The job you are looking for does not exist.'}</p>
            <button onClick={handleGoBack} style={styles.backButton}>
              <ArrowLeft size={18} /> Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const savedJob = getSavedJob();
  const salary = formatSalary();
  const requirements = parseRequirements();

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        {/* Back Button */}
        <button onClick={handleGoBack} style={styles.backLink}>
          <ArrowLeft size={18} /> Back to listings
        </button>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.companyLogo}>
            {job.company.logo_url ? (
              <img src={job.company.logo_url} alt={job.company.name} style={styles.logoImg} />
            ) : (
              job.company.name.charAt(0)
            )}
          </div>

          <div style={styles.headerInfo}>
            <h1 style={styles.jobTitle}>{job.title}</h1>
            <p style={styles.companyName}>
              <Building size={16} /> {job.company.name}
            </p>

            <div style={styles.metaContainer}>
              <span style={styles.metaItem}>
                <MapPin size={16} /> {formatLocation()}
              </span>
              <span style={styles.metaItem}>
                <Calendar size={16} /> {formatPostedDate()}
              </span>
              {salary && (
                <span style={styles.metaItem}>
                  <DollarSign size={16} /> {salary}
                </span>
              )}
            </div>

            <div style={styles.tags}>
              <span style={styles.tag}>
                <Briefcase size={14} /> {formatEmploymentType()}
              </span>
              <span style={styles.tag}>
                <Clock size={14} /> {formatExperienceLevel()}
              </span>
              {job.is_remote && <span style={styles.tagHighlight}>Remote</span>}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            style={{
              ...styles.saveButton,
              ...(savedJob ? styles.saveButtonSaved : {}),
            }}
            aria-label={savedJob ? 'Remove from saved' : 'Save job'}
          >
            <Bookmark size={20} fill={savedJob ? 'currentColor' : 'none'} />
            {savedJob ? 'Saved' : 'Save'}
          </button>
        </header>

        {/* Description */}
        {job.description && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>About the Role</h2>
            <p style={styles.description}>{job.description}</p>
          </section>
        )}

        {/* Requirements */}
        {requirements.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Requirements</h2>
            <ul style={styles.list}>
              {requirements.map((req, index) => (
                <li key={index} style={styles.listItem}>
                  {req}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Company Info */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>About {job.company.name}</h2>
          <div style={styles.companyInfo}>
            <div style={styles.companyLogoLarge}>
              {job.company.logo_url ? (
                <img src={job.company.logo_url} alt={job.company.name} style={styles.logoImg} />
              ) : (
                job.company.name.charAt(0)
              )}
            </div>
            <div>
              <p style={styles.companyNameLarge}>{job.company.name}</p>
              {job.company.careers_url && (
                <a
                  href={job.company.careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.companyLink}
                >
                  Visit Careers Page <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Apply Button */}
        <div style={styles.applyContainer}>
          <a
            href={job.external_url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.applyButton}
          >
            Apply on {job.company.name}
            <ExternalLink size={18} />
          </a>
          <p style={styles.applyNote}>
            You will be redirected to {job.company.name}'s official careers page
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px',
    color: 'var(--text-secondary)',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '80px 24px',
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  errorText: {
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--accent-color)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginBottom: '24px',
    padding: '8px 0',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  header: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '32px',
  },
  companyLogo: {
    width: '72px',
    height: '72px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    flexShrink: 0,
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: '1.75rem',
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  companyName: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '1.1rem',
    color: 'var(--accent-color)',
    margin: '0 0 12px 0',
    fontWeight: 600,
  },
  metaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  tagHighlight: {
    padding: '6px 12px',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    minHeight: '44px',
    flexShrink: 0,
  },
  saveButtonSaved: {
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    borderColor: 'var(--accent-color)',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  description: {
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontSize: '1rem',
    whiteSpace: 'pre-wrap',
  },
  list: {
    listStyle: 'disc',
    paddingLeft: '24px',
    margin: 0,
  },
  listItem: {
    marginBottom: '8px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
  },
  companyLogoLarge: {
    width: '56px',
    height: '56px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    overflow: 'hidden',
  },
  companyNameLarge: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 4px 0',
  },
  companyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--accent-color)',
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  applyContainer: {
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  applyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 32px',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '1rem',
    minHeight: '44px',
  },
  applyNote: {
    marginTop: '12px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
};
