'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, Bookmark, MapPin, Calendar, DollarSign, ExternalLink } from 'lucide-react';

// 假数据
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: { name: 'Apple', logo_url: null },
    location: { city: 'London', country: 'UK' },
    is_remote: false,
    posted_at: '2026-02-25T10:00:00Z',
    salary_min: 120000,
    salary_max: 160000,
    salary_currency: '£',
    employment_type: 'full_time',
    external_url: 'https://apple.com/careers',
  },
  {
    id: 2,
    title: 'AI Research Scientist',
    company: { name: 'Google', logo_url: null },
    location: { city: 'Mountain View', country: 'USA' },
    is_remote: true,
    posted_at: '2026-02-24T10:00:00Z',
    salary_min: 180000,
    salary_max: 250000,
    salary_currency: '$',
    employment_type: 'full_time',
    external_url: 'https://careers.google.com',
  },
  {
    id: 3,
    title: 'Frontend Developer',
    company: { name: 'Meta', logo_url: null },
    location: { city: 'London', country: 'UK' },
    is_remote: false,
    posted_at: '2026-02-23T10:00:00Z',
    salary_min: 90000,
    salary_max: 130000,
    salary_currency: '£',
    employment_type: 'full_time',
    external_url: 'https://metacareers.com',
  },
  {
    id: 4,
    title: 'Backend Engineer',
    company: { name: 'Netflix', logo_url: null },
    location: { city: 'Amsterdam', country: 'Netherlands' },
    is_remote: false,
    posted_at: '2026-02-22T10:00:00Z',
    salary_min: 100000,
    salary_max: 150000,
    salary_currency: '€',
    employment_type: 'full_time',
    external_url: 'https://jobs.netflix.com',
  },
  {
    id: 5,
    title: 'ML Engineer',
    company: { name: 'Nvidia', logo_url: null },
    location: { city: 'San Francisco', country: 'USA' },
    is_remote: true,
    posted_at: '2026-02-21T10:00:00Z',
    salary_min: 150000,
    salary_max: 220000,
    salary_currency: '$',
    employment_type: 'full_time',
    external_url: 'https://nvidia.com/careers',
  },
];

const COMPANIES = ['Apple', 'Google', 'Meta', 'Netflix', 'Nvidia'];
const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export default function JobsPage() {
  const router = useRouter();
  
  const [jobs] = useState(MOCK_JOBS);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Check if job is saved
  const isJobSaved = (jobId: number): boolean => {
    return savedJobIds.includes(jobId);
  };

  // Toggle save job
  const handleToggleSave = (jobId: number) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter(id => id !== jobId));
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
    }
  };

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.company.name.toLowerCase().includes(query) ||
          (job.location?.city?.toLowerCase().includes(query) ?? false);
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
  const formatSalary = (job: typeof MOCK_JOBS[0]): string | null => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || '$';
    const min = job.salary_min ? `${job.salary_min.toLocaleString()}` : '';
    const max = job.salary_max ? `${job.salary_max.toLocaleString()}` : '';
    if (min && max) return `${currency}${min} - ${currency}${max}`;
    return `${currency}${min || max}`;
  };

  // Format location
  const formatLocation = (job: typeof MOCK_JOBS[0]): string => {
    if (job.is_remote) return 'Remote';
    if (!job.location) return 'Not specified';
    return `${job.location.city}, ${job.location.country}`;
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
    return `${Math.floor(diffDays / 7)} weeks ago`;
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
        {COMPANIES.map((company) => (
          <label key={company} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedCompanies.includes(company)}
              onChange={() => toggleFilter(company, selectedCompanies, setSelectedCompanies)}
              style={styles.checkbox}
            />
            <span>{company}</span>
          </label>
        ))}
      </div>

      <div style={styles.filterGroup}>
        <h3 style={styles.filterGroupTitle}>Job Type</h3>
        {EMPLOYMENT_TYPES.map((type) => (
          <label key={type.value} style={styles.checkboxLabel}>
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
    </>
  );

  // Job Card
  const JobCard = ({ job }: { job: typeof MOCK_JOBS[0] }) => {
    const saved = isJobSaved(job.id);
    const salary = formatSalary(job);

    return (
      <article style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.companyLogo}>
            {job.company.name.charAt(0)}
          </div>
          <div style={styles.cardInfo}>
            <h3 style={styles.cardTitle}>{job.title}</h3>
            <p style={styles.cardCompany}>{job.company.name}</p>
          </div>
          <button
            onClick={() => handleToggleSave(job.id)}
            style={{
              ...styles.saveButton,
              ...(saved ? styles.saveButtonSaved : {}),
            }}
          >
            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
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

  return (
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
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="date">Latest</option>
            <option value="salary">Salary</option>
            <option value="company">Company</option>
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
          Showing <strong>{filteredJobs.length}</strong> of {jobs.length} jobs
          {hasActiveFilters && ' (filtered)'}
        </p>

        {/* Job List */}
        <div style={styles.jobList}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
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
        {filteredJobs.length > 0 && (
          <div style={styles.pagination}>
            <button style={styles.pageButton}>←</button>
            <button style={{ ...styles.pageButton, ...styles.pageButtonActive }}>1</button>
            <button style={styles.pageButton}>2</button>
            <button style={styles.pageButton}>3</button>
            <button style={styles.pageButton}>→</button>
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
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
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
    gap: '8px',
    marginTop: '32px',
  },
  pageButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #333',
    borderRadius: '6px',
    backgroundColor: '#111',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
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
