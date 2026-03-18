'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, Bookmark, MapPin, Calendar, DollarSign, ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getJobs, getSavedJobs, saveJob, unsaveJob, getJobCompanies, Job, SavedJob, CompanyOption } from '../../src/api/jobs';
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
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingJobId, setSavingJobId] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'company'>('date');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await getJobCompanies();
        setCompanies(data);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      }
    };
    loadCompanies();
  }, []);

  const fetchJobs = useCallback(async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);
      
      const [jobsResponse, savedJobsData] = await Promise.all([
        getJobs({ 
          page: currentPage, 
          pageSize, 
          sortBy, 
          order: 'desc',
          search: searchQuery || undefined,
          company: selectedCompanies.length > 0 ? selectedCompanies : undefined,
          employmentType: selectedTypes.length > 0 ? selectedTypes : undefined,
        }),
        getSavedJobs(),
      ]);
      
      setJobs(jobsResponse.results);
      setTotalCount(jobsResponse.count);
      setSavedJobs(savedJobsData);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  }, [currentPage, pageSize, sortBy, searchQuery, selectedCompanies, selectedTypes]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchJobs(true);
      return;
    }
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchJobs(false);
    }, 300);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [fetchJobs]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleFilterChange = <T,>(
    value: T,
    selected: T[],
    setSelected: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
    setCurrentPage(1);
  };

  const getSavedJob = (jobId: number): SavedJob | undefined => {
    return savedJobs.find((sj) => sj.job.id === jobId);
  };

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

  const clearFilters = () => {
    setSelectedCompanies([]);
    setSelectedTypes([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCompanies.length > 0 || selectedTypes.length > 0 || searchQuery !== '';

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
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
        {companies.length > 0 ? (
          companies.map((company) => (
            <label key={company.id} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company.name)}
                onChange={() => handleFilterChange(company.name, selectedCompanies, setSelectedCompanies)}
                style={styles.checkbox}
              />
              <span>{company.name}</span>
            </label>
          ))
        ) : (
          <p style={styles.noFiltersText}>No companies available</p>
        )}
      </div>

      <div style={styles.filterGroup}>
        <h3 style={styles.filterGroupTitle}>Job Type</h3>
        {EMPLOYMENT_TYPES.map((type) => (
          <label key={type.value} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type.value)}
              onChange={() => handleFilterChange(type.value, selectedTypes, setSelectedTypes)}
              style={styles.checkbox}
            />
            <span>{type.label}</span>
          </label>
        ))}
      </div>
    </>
  );

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
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
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
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <FiltersContent />
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {/* Search Bar */}
          <div style={styles.searchRow}>
            <div style={styles.searchInputWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} style={styles.clearSearchButton}>
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'date' | 'salary' | 'company');
                setCurrentPage(1);
              }}
              style={styles.sortSelect}
            >
              <option value="date">Latest</option>
              <option value="salary">Salary</option>
              <option value="company">Company</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={styles.sortSelect}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>

            <button
              onClick={() => setShowMobileFilters(true)}
              style={styles.mobileFilterButton}
            >
              <Filter size={18} />
            </button>
          </div>

          {/* Results Count */}
          <p style={styles.resultsText}>
            {isFiltering ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Filtering...
              </span>
            ) : (
              <>Showing <strong>{startIndex}-{endIndex}</strong> of <strong>{totalCount}</strong> jobs</>
            )}
          </p>

          {/* Job List */}
          <div style={{ ...styles.jobList, opacity: isFiltering ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            {jobs.length > 0 ? (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div style={styles.noResults}>
                <p>No jobs found matching your criteria.</p>
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

        {/* Mobile Filters */}
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

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    gap: '16px',
  },
  loadingText: {
    color: '#888',
    fontSize: '1rem',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    padding: '24px',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#fff',
    fontSize: '1.5rem',
    marginBottom: '8px',
  },
  errorText: {
    color: '#888',
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
    borderRight: '1px solid #333',
    backgroundColor: '#111',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #333',
  },
  filterTitle: {
    fontSize: '1.25rem',
    color: '#fff',
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
    color: '#fff',
    marginBottom: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#aaa',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  noFiltersText: {
    color: '#666',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },
  mainContent: {
    flex: 1,
    padding: '24px',
    maxWidth: '900px',
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#666',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px',
    fontSize: '1rem',
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: '#111',
    color: '#fff',
    outline: 'none',
  },
  clearSearchButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '4px',
  },
  sortSelect: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#111',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  mobileFilterButton: {
    display: 'none',
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: '#111',
    color: '#fff',
    cursor: 'pointer',
  },
  resultsText: {
    color: '#888',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  jobList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  noResults: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#888',
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
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
  },
  companyLogo: {
    width: '48px',
    height: '48px',
    backgroundColor: '#222',
    border: '1px solid #333',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
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
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  cardCompany: {
    fontSize: '0.95rem',
    color: '#3b82f6',
    margin: '4px 0 0 0',
  },
  saveButton: {
    padding: '8px',
    background: 'none',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#888',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  detailsButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  applyButton: {
    flex: 1,
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
  },
  pageButton: {
    minWidth: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#333',
    borderRadius: '8px',
    backgroundColor: '#111',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageEllipsis: {
    color: '#666',
    padding: '0 4px',
  },
  mobileFiltersOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  mobileFiltersModal: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '300px',
    height: '100%',
    backgroundColor: '#111',
    padding: '24px',
    overflowY: 'auto',
  },
  mobileFiltersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    color: '#fff',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
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
