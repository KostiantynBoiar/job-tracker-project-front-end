import { apiClient } from './client';

// ============ Types ============

export interface Company {
  id: number;
  name: string;
  logo_url: string | null;
  careers_url: string | null;
  is_active: boolean;
}

export interface Location {
  id: number;
  city: string | null;
  state: string | null;
  country: string;
  is_remote: boolean;
}

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Job {
  id: number;
  company: Company;
  location: Location | null;
  category: JobCategory | null;
  external_id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | null;
  experience_level: 'entry' | 'mid' | 'senior' | 'executive' | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  external_url: string;
  is_remote: boolean;
  is_active: boolean;
  posted_at: string | null;
  scraped_at: string;
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: number;
  job: Job;
  status: 'active' | 'expired' | 'fresh';
  notes: string | null;
  saved_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GetJobsParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'preference' | 'date' | 'salary' | 'company';
  order?: 'asc' | 'desc';
  search?: string;
  company?: string[];
  employmentType?: string[];
}

export interface CompanyOption {
  id: number;
  name: string;
  logo_url: string | null;
  jobs_count: number;
}

// ============ API Functions ============

/**
 * Get jobs with pagination and optional sorting
 */
export const getJobs = async (params: GetJobsParams = {}): Promise<PaginatedResponse<Job>> => {
  const { 
    page = 1, 
    pageSize = 20, 
    sortBy = 'date', 
    order = 'desc',
    search,
    company,
    employmentType,
  } = params;
  
  const queryParams: Record<string, string | number> = { 
    page,
    page_size: pageSize,
    sort_by: sortBy, 
    order 
  };

  if (search) queryParams.search = search;
  if (company && company.length > 0) queryParams.company_in = company.join(',');
  if (employmentType && employmentType.length > 0) queryParams.employment_type_in = employmentType.join(',');
  
  const response = await apiClient.get('/api/jobs/', { params: queryParams });
  return response.data;
};

/**
 * Get a single job by ID
 */
export const getJobById = async (jobId: number): Promise<Job> => {
  const response = await apiClient.get(`/api/jobs/${jobId}/`);
  return response.data;
};

export const getJobCompanies = async (): Promise<CompanyOption[]> => {
  const response = await apiClient.get('/api/jobs/companies/');
  return response.data;
};

/**
 * Get all saved jobs for the current user
 */
export const getSavedJobs = async (): Promise<SavedJob[]> => {
  const response = await apiClient.get('/api/jobs/saved/');
  return response.data.results || response.data;
};

/**
 * Save a job
 */
export const saveJob = async (
  jobId: number,
  notes?: string
): Promise<SavedJob> => {
  const response = await apiClient.post('/api/jobs/saved/create/', {
    job_id: jobId,
    status: 'active',
    notes: notes || null,
  });
  return response.data;
};

/**
 * Remove a saved job
 */
export const unsaveJob = async (savedJobId: number): Promise<void> => {
  await apiClient.delete(`/api/jobs/saved/${savedJobId}/delete/`);
};

/**
 * Update saved job status or notes
 */
export const updateSavedJob = async (
  savedJobId: number,
  data: { status?: string; notes?: string }
): Promise<SavedJob> => {
  const response = await apiClient.patch(`/api/jobs/saved/${savedJobId}/update/`, data);
  return response.data;
};
