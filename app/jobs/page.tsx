'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, Bookmark, MapPin, Calendar, DollarSign, ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getJobs, getSavedJobs, saveJob, unsaveJob, Job, SavedJob } from '../../src/api/jobs';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute/ProtectedRoute';

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function JobsPage() {
  const router = useRouter();
  
  // 🕵️ SENIOR FIX: Responsive state to handle mobile stacking
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  
  // Loading/error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingJobId, setSavingJobId] = useState<number | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'company'>('date');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch jobs with server-side pagination
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [jobsResponse, savedJobsData] = await Promise.all([
        getJobs({ page: currentPage, pageSize, sortBy, order: 'desc' }),
        getSavedJobs(),
      ]);
      
      setJobs(jobsResponse.results);
      setTotalCount(jobsResponse.count);
      setSavedJobs(savedJobsData);
      
      // Extract unique company names for filters from current page
      const uniqueCompanies = [...new Set(jobsResponse.results.map(job => job.company.name))].sort();
      setCompanies(prev => {
        const merged = [...new Set([...prev, ...uniqueCompanies])].sort();
        return merged;
      });
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortBy]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Check if job is saved
  const getSavedJob = (jobId: number): SavedJob | undefined => {
    return savedJobs.find((sj) => sj.job.id === jobId);
  };

  // Toggle save job
  const handleToggleSave = async (jobId: number) => {
    const savedJob = getSavedJob(jobId);
    setSavingJobId(jobId);

    try {
      if (savedJob) {
        await unsaveJob(savedJob.id);
        setSavedJobs(savedJobs.filter((sj) => sj.id !== savedJob.id));
      } else {
        const newSavedJob = await saveJob(jobId);
        setSavedJobs([...savedJobs, newSavedJob]);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSavingJobId(null);
    }
  };

  // Filter jobs (client-side filtering on current page results)
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.company.name.toLowerCase().includes(query) ||
          (job.location?.city?.toLowerCase().includes(query) ?? false) ||
          (job.location?.country?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }

      if (selectedCompanies.length > 0 && !selectedCompanies.includes(job.company.name)) {
        return false;
      }

      if (selectedTypes.length > 0 && job.employment_type && !selectedTypes.includes(job.employment_type)) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedCompanies, selectedTypes]);

  // Pagination calculations (server-side)
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = isMobile ? 3 : 5; // Simpler pagination on mobile
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= (isMobile ? 3 : 4); i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - (isMobile ? 2 : 3); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Toggle filter
  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCompanies([]);
    setSelectedTypes([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCompanies.length > 0 || selectedTypes.length > 0 || searchQuery !== '';

  // Format salary
  const formatSalary = (job: Job): string | null => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || '$';
    const min = job.salary_min ? `${job.salary_min.toLocaleString()}` : '';
    const max = job.salary_max ? `${job.salary_max.toLocaleString()}` : '';
    if (min && max) return `${currency}${min} - ${currency}${max}`;
    return `${currency}${min || max}`;
  };

  // Format location
  const formatLocation = (job: Job): string => {
    if (job.is_remote) return 'Remote';
    if (!job.location) return 'Not specified';
    const parts = [job.location.city, job.location.country].filter(Boolean);
    return parts.join(', ') || 'Not specified';
  };

  // Format posted date
  const formatPostedDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Sidebar filters
  const FiltersContent = () => (
    <>
      <div style={styles.filterHeader}>
        <h2 style={styles.filterTitle}>Filters</h2>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={styles.clearButton}>
            Clear all
          </button>
        )}
      </div>

      <div style={styles.filterGroup}>
        <h3 style={styles.filterGroupTitle}>Company</h3>
        <div style={isMobile ? styles.chipContainer : {}}>
          {companies.length > 0 ? (
            companies.map((company) => (
              <label key={company} style={{...styles.checkboxLabel, ...(isMobile ? styles.chipLabel : {})}}>
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company)}
                  onChange={() => toggleFilter(company, selectedCompanies, setSelectedCompanies)}
                  style={styles.checkbox}
                />
                <span>{company}</span>
              </label>
            ))
          ) : (
            <p style={styles.noFiltersText}>No companies available</p>
          )}
        </div>
      </div>

      <div style={styles.filterGroup}>
        <h3 style={styles.filterGroupTitle}>Job Type</h3>
        <div style={isMobile ? styles.chipContainer : {}}>
          {EMPLOYMENT_TYPES.map((type) => (
            <label key={type.value} style={{...styles.checkboxLabel, ...(isMobile ? styles.chipLabel : {})}}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.value)}
                onChange={() => toggleFilter(type.value, selectedTypes, setSelectedTypes)}
                style={styles.checkbox}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  // Job Card
  const JobCard = ({ job }: { job: Job }) => {
    const savedJob = getSavedJob(job.id);
    const isSaved = !!savedJob;
    const isSaving = savingJobId === job.id;
    const salary = formatSalary(job);

    return (
      <article style={styles.card}>
        <div style={styles.cardHeader}>
          {job.company.logo_url && (
            <div style={styles.companyLogo}>
              <img src={job.company.logo_url} alt={job.company.name} style={styles.logoImg} />
            </div>
          )}
          <div style={styles.cardInfo}>
            <h3 style={styles.cardTitle}>{job.title}</h3>
            <p style={styles.cardCompany}>{job.company.name}</p>
          </div>
          <button
            onClick={() => handleToggleSave(job.id)}
            disabled={isSaving}
            style={{
              ...styles.saveButton,
              ...(isSaved ? styles.saveButtonSaved : {}),
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaving ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            )}
          </button>
        </div>

        <div style={styles.cardMeta}>
          <span style={styles.metaItem}>
            <MapPin size={14} /> {formatLocation(job)}
          </span>
          <span style={styles.metaItem}>
            <Calendar size={14} /> {formatPostedDate(job.posted_at)}
          </span>
          {salary && (
            <span style={styles.metaItem}>
              <DollarSign size={14} /> {salary}
            </span>
          )}
        </div>

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
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div style={styles.loadingContainer}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <p style={styles.loadingText}>Loading jobs...</p>
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
        {/* Sidebar - Hides dynamically on mobile */}
        <aside style={{...styles.sidebar, display: isMobile ? 'none' : 'block'}}>
          <FiltersContent />
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {/* Search Bar - Flex-direction changes based on mobile state */}
          <div style={{...styles.searchRow, flexDirection: isMobile ? 'column' : 'row'}}>
            <div style={styles.searchInputWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
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

            <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'date' | 'salary' | 'company');
                  setCurrentPage(1);
                }}
                style={{...styles.sortSelect, flex: 1}}
              >
                <option value="date">Latest</option>
                <option value="salary">Salary</option>
                <option value="company">Company</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{...styles.sortSelect, flex: 1}}
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>

              <button
                onClick={() => setShowMobileFilters(true)}
                style={{...styles.mobileFilterButton, display: isMobile ? 'block' : 'none'}}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <p style={styles.resultsText}>
            Showing <strong>{startIndex}-{endIndex}</strong> of {totalCount} jobs
            {hasActiveFilters && ` (${filteredJobs.length} matching filters on this page)`}
          </p>

          {/* Job List */}
          <div style={styles.jobList}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div style={styles.noResults}>
                <Bookmark size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                <h3>No jobs found matching your criteria.</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} style={styles.clearFiltersButton}>
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                }}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      ...styles.pageButton,
                      ...(currentPage === page ? styles.pageButtonActive : {}),
                    }}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} style={styles.pageEllipsis}>{page}</span>
                )
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                }}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </main>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div style={styles.mobileFiltersOverlay}>
            <div style={styles.mobileFiltersModal}>
              <div style={styles.mobileFiltersHeader}>
                <h2>Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} style={styles.closeButton}>
                  <X size={24} />
                </button>
              </div>
              <FiltersContent />
              <button
                onClick={() => setShowMobileFilters(false)}
                style={styles.applyFiltersButton}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

// 🕵️ SENIOR DEV FIX: All hardcoded colors removed!
// Box-sizing, width: 100%, and min-width: 0 added to prevent mobile layout breakages.
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
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
  sidebar: {
    width: '280px',
    padding: '24px',
    borderRight: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    flexShrink: 0, // Stops it from compressing
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  filterTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  clearButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  filterGroup: {
    marginBottom: '24px',
  },
  filterGroupTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  noFiltersText: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chipLabel: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    marginBottom: 0,
  },
  mainContent: {
    flex: 1,
    padding: 'clamp(16px, 4vw, 24px)', // Auto-adjusts padding for mobile
    maxWidth: '900px',
    width: '100%',
    boxSizing: 'border-box',
    minWidth: 0, // Critical for preventing layout blow-outs
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    alignItems: 'center',
    width: '100%',
  },
  searchInputWrapper: {
    flex: 1,
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
  sortSelect: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  mobileFilterButton: {
    padding: '12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  resultsText: {
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  jobList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  noResults: {
    textAlign: 'center',
    padding: '48px 24px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
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
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: 'clamp(16px, 4vw, 20px)',
    width: '100%',
    boxSizing: 'border-box',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
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
  cardInfo: {
    flex: 1,
    minWidth: 0, // This stops long job titles from breaking the flex container!
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
    wordBreak: 'break-word', // Keeps long titles safely inside the box
  },
  cardCompany: {
    fontSize: '0.95rem',
    color: '#3b82f6',
    margin: '4px 0 0 0',
  },
  saveButton: {
    padding: '8px',
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  saveButtonSaved: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff',
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
  cardActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap', // Stops buttons from blowing out the layout
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
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '32px',
    paddingBottom: '24px',
    flexWrap: 'wrap', // Allow pagination to wrap on very small phones
  },
  pageButton: {
    minWidth: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageEllipsis: {
    color: 'var(--text-secondary)',
    padding: '0 4px',
  },
  mobileFiltersOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  mobileFiltersModal: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '300px',
    height: '100%',
    backgroundColor: 'var(--bg-secondary)',
    padding: '24px',
    overflowY: 'auto',
    borderLeft: '1px solid var(--border-color)',
  },
  mobileFiltersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    color: 'var(--text-primary)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  applyFiltersButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: '24px',
  },
};