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

// ============ API Functions ============

/**
 * Get all jobs with optional sorting
 */
export const getJobs = async (
  sortBy: 'preference' | 'date' | 'salary' | 'company' = 'date',
  order: 'asc' | 'desc' = 'desc'
): Promise<Job[]> => {
  const response = await apiClient.get('/api/jobs/', {
    params: { sort_by: sortBy, order },
  });
  return response.data;
};

/**
 * Get a single job by ID
 */
export const getJobById = async (jobId: number): Promise<Job> => {
  const response = await apiClient.get(`/api/jobs/${jobId}/`);
  return response.data;
};

/**
 * Get all saved jobs for the current user
 */
export const getSavedJobs = async (): Promise<SavedJob[]> => {
  const response = await apiClient.get('/api/jobs/saved/');
  return response.data;
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
