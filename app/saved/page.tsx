'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  Trash2, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Loader2, 
  FileText,
  Clock,
  Bookmark,
  Edit3,
  Check
} from 'lucide-react';
import { getSavedJobs, unsaveJob, updateSavedJob, SavedJob, Job } from '../../src/api/jobs';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute/ProtectedRoute';

type StatusFilter = 'all' | 'fresh' | 'active' | 'expired';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
];

// Helper functions (outside component to prevent recreation)
const formatSalary = (job: Job): string | null => {
  if (!job.salary_min && !job.salary_max) return null;
  const currency = job.salary_currency || '$';
  const min = job.salary_min ? `${job.salary_min.toLocaleString()}` : '';
  const max = job.salary_max ? `${job.salary_max.toLocaleString()}` : '';
  if (min && max) return `${currency}${min} - ${currency}${max}`;
  return `${currency}${min || max}`;
};

const formatLocation = (job: Job): string => {
  if (job.is_remote) return 'Remote';
  if (!job.location) return 'Not specified';
  const parts = [job.location.city, job.location.country].filter(Boolean);
  return parts.join(', ') || 'Not specified';
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'fresh':
      return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' };
    case 'active':
      return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
    case 'expired':
      return { bg: 'rgba(128, 128, 128, 0.2)', color: 'var(--text-secondary)' }; // 🕵️ Adapted for light/dark mode
    default:
      return { bg: 'rgba(128, 128, 128, 0.2)', color: 'var(--text-secondary)' };
  }
};

// Separate Notes Editor component with its own state
interface NotesEditorProps {
  savedJobId: number;
  initialNotes: string | null;
  onSave: (savedJobId: number, notes: string) => Promise<void>;
}

function NotesEditor({ savedJobId, initialNotes, onSave }: NotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notesValue, setNotesValue] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(savedJobId, notesValue);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNotesValue(initialNotes || '');
    setIsEditing(false);
  };

  const startEditing = () => {
    setNotesValue(initialNotes || '');
    setIsEditing(true);
  };

  return (
    <div style={styles.notesSection}>
      <div style={styles.notesHeader}>
        <span style={styles.notesLabel}>
          <FileText size={14} /> Notes
        </span>
        {!isEditing && (
          <button onClick={startEditing} style={styles.editNotesButton}>
            <Edit3 size={14} /> {initialNotes ? 'Edit' : 'Add'}
          </button>
        )}
      </div>
      {isEditing ? (
        <div style={styles.notesEditContainer}>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add your notes here..."
            style={styles.notesTextarea}
            rows={3}
            autoFocus
          />
          <div style={styles.notesActions}>
            <button onClick={handleCancel} style={styles.notesCancelButton}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={styles.notesSaveButton}
            >
              {isSaving ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Check size={14} />
              )}
              Save
            </button>
          </div>
        </div>
      ) : (
        <p style={styles.notesText}>{initialNotes || 'No notes added'}</p>
      )}
    </div>
  );
}

// Saved Job Card component
interface SavedJobCardProps {
  savedJob: SavedJob;
  isRemoving: boolean;
  onRemove: (id: number) => void;
  onNotesUpdate: (id: number, notes: string) => Promise<void>;
}

function SavedJobCard({ savedJob, isRemoving, onRemove, onNotesUpdate }: SavedJobCardProps) {
  const router = useRouter();
  const { job } = savedJob;
  const salary = formatSalary(job);
  const statusColors = getStatusColor(savedJob.status);

  return (
    <article style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        {job.company.logo_url && (
          <div style={styles.companyLogo}>
            <img src={job.company.logo_url} alt={job.company.name} style={styles.logoImg} />
          </div>
        )}
        <div style={styles.cardInfo}>
          <h3 style={styles.cardTitle} title={job.title}>{job.title}</h3>
          <p style={styles.cardCompany}>{job.company.name}</p>
        </div>
        <button
          onClick={() => onRemove(savedJob.id)}
          disabled={isRemoving}
          style={styles.removeButton}
          aria-label="Remove from saved"
        >
          {isRemoving ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </div>

      {/* Status and Saved Date */}
      <div style={styles.statusRow}>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: statusColors.bg,
            color: statusColors.color,
          }}
        >
          {savedJob.status.charAt(0).toUpperCase() + savedJob.status.slice(1)}
        </span>
        <span style={styles.savedDate}>
          <Clock size={14} /> Saved {formatDate(savedJob.saved_at)}
        </span>
      </div>

      {/* Meta Info */}
      <div style={styles.cardMeta}>
        <span style={styles.metaItem}>
          <MapPin size={14} /> {formatLocation(job)}
        </span>
        {salary && (
          <span style={styles.metaItem}>
            <DollarSign size={14} /> {salary}
          </span>
        )}
      </div>

      {/* Notes Section */}
      <NotesEditor
        savedJobId={savedJob.id}
        initialNotes={savedJob.notes}
        onSave={onNotesUpdate}
      />

      {/* Actions */}
      <div style={styles.cardActions}>
        <button
          onClick={() => router.push(`/jobs/${job.id}`)}
          style={styles.detailsButton}
        >
          View Details
        </button>
        <a
          href={job.external_url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.applyButton}
        >
          Apply <ExternalLink size={16} />
        </a>
      </div>
    </article>
  );
}

export default function SavedJobsPage() {
  const router = useRouter();
  
  // Data state
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  
  // Loading/error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSavedJobs();
        setSavedJobs(data);
      } catch (err) {
        console.error('Failed to fetch saved jobs:', err);
        setError('Failed to load saved jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  // Remove saved job
  const handleRemove = useCallback(async (savedJobId: number) => {
    setRemovingJobId(savedJobId);
    try {
      await unsaveJob(savedJobId);
      setSavedJobs(prev => prev.filter((sj) => sj.id !== savedJobId));
    } catch (err) {
      console.error('Failed to remove saved job:', err);
    } finally {
      setRemovingJobId(null);
    }
  }, []);

  // Update notes
  const handleNotesUpdate = useCallback(async (savedJobId: number, notes: string) => {
    const updated = await updateSavedJob(savedJobId, { notes: notes || undefined });
    setSavedJobs(prev => prev.map((sj) => (sj.id === savedJobId ? updated : sj)));
  }, []);

  // Filter saved jobs
  const filteredJobs = useMemo(() => {
    return savedJobs.filter((savedJob) => {
      // Status filter
      if (statusFilter !== 'all' && savedJob.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const job = savedJob.job;
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.company.name.toLowerCase().includes(query) ||
          (job.location?.city?.toLowerCase().includes(query) ?? false) ||
          (job.location?.country?.toLowerCase().includes(query) ?? false) ||
          (savedJob.notes?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [savedJobs, searchQuery, statusFilter]);

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      all: savedJobs.length,
      fresh: savedJobs.filter((sj) => sj.status === 'fresh').length,
      active: savedJobs.filter((sj) => sj.status === 'active').length,
      expired: savedJobs.filter((sj) => sj.status === 'expired').length,
    };
  }, [savedJobs]);

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div style={styles.loadingContainer}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <p style={styles.loadingText}>Loading saved jobs...</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={styles.pageContainer}>
        {/* Header */}
        <header style={styles.pageHeader}>
          <div style={styles.headerContent}>
            <Bookmark size={32} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <div>
              <h1 style={styles.pageTitle}>Saved Jobs</h1>
              <p style={styles.pageSubtitle}>
                {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div style={styles.filtersContainer}>
          {/* Status Tabs */}
          <div style={styles.statusTabs}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  ...styles.statusTab,
                  ...(statusFilter === tab.value ? styles.statusTabActive : {}),
                }}
              >
                {tab.label}
                <span style={styles.tabCount}>{statusCounts[tab.value]}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search saved jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Job List */}
        <div style={styles.jobList}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((savedJob) => (
              <SavedJobCard
                key={savedJob.id}
                savedJob={savedJob}
                isRemoving={removingJobId === savedJob.id}
                onRemove={handleRemove}
                onNotesUpdate={handleNotesUpdate}
              />
            ))
          ) : savedJobs.length === 0 ? (
            <div style={styles.emptyState}>
              <Bookmark size={64} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
              <h2 style={styles.emptyTitle}>No saved jobs yet</h2>
              <p style={styles.emptyText}>
                Jobs you save will appear here. Start exploring and save jobs you're interested in!
              </p>
              <button
                onClick={() => router.push('/jobs')}
                style={styles.browseButton}
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div style={styles.noResults}>
              <p>No saved jobs match your search.</p>
              <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} style={styles.clearFiltersButton}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// 🕵️ SENIOR DEV FIX: All hardcoded colors removed. 
// Added box-sizing, min-width, and flex-wrap to prevent mobile screen clipping!
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    padding: 'clamp(16px, 5vw, 24px)', // Responsive padding for mobile
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    gap: '16px',
    width: '100%',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    padding: '24px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  errorTitle: {
    color: 'var(--text-primary)',
    fontSize: '1.5rem',
    marginBottom: '8px',
  },
  errorText: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    marginBottom: '24px',
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
  },
  filtersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
    width: '100%',
  },
  statusTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statusTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'var(--bg-secondary)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  statusTabActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff',
  },
  tabCount: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)', // Adapts naturally
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    color: 'inherit',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-secondary)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px',
    fontSize: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearSearchButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
  },
  jobList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: 'clamp(16px, 4vw, 20px)', // Adapts nicely to mobile screens
    width: '100%',
    boxSizing: 'border-box',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '12px',
    width: '100%',
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
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0, // This stops long job titles from breaking the flex container!
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis', // Ensures title doesn't spill over on mobile
  },
  cardCompany: {
    fontSize: '0.95rem',
    color: '#3b82f6',
    margin: '4px 0 0 0',
  },
  removeButton: {
    padding: '8px',
    background: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '12px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  savedDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  cardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  notesSection: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  notesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  notesLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  editNotesButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  notesText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.5,
    fontStyle: 'italic',
    wordBreak: 'break-word', // Keeps long strings inside the box
  },
  notesEditContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  notesTextarea: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  notesActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  notesCancelButton: {
    padding: '6px 12px',
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  notesSaveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap', // Stops buttons from breaking the layout on small phones
  },
  detailsButton: {
    flex: 1,
    minWidth: '120px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  applyButton: {
    flex: 1,
    minWidth: '120px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(40px, 10vw, 80px) 24px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    maxWidth: '400px',
  },
  browseButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
  noResults: {
    textAlign: 'center',
    padding: '48px 24px',
    color: 'var(--text-secondary)',
  },
  clearFiltersButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};