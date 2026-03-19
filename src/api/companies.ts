// Importing our pre-configured Axios client. 
// This ensures all requests automatically include the base URL and JWT authorization headers.
import { apiClient } from './client';

// TypeScript Interface: We define the exact shape of the data we expect from the Django backend.
// This mirrors the PostgreSQL 'Company' model, providing strict type safety across our frontend.
// It prevents runtime errors (like trying to access a field that doesn't exist) during development.
export interface Company {
  id: number;
  name: string;
  logo_url: string | null;
  careers_url: string | null;
  is_active: boolean; // Useful for filtering out companies we are no longer scraping
  created_at: string;
  updated_at: string;
}

// Service Function: Fetches the list of all available FAANG companies.
// Separation of Concerns: React components call this function instead of writing raw Axios requests,
// keeping the UI layer clean and focused purely on presentation.
export const getCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get('/api/companies/');
  
  // Django REST Framework (DRF) pagination handling:
  // If the backend paginates the response, the actual array is nested inside 'results'.
  // We use the OR (||) operator as a fallback in case pagination is disabled.
  return response.data.results || response.data;
};

// Service Function: Fetches details for a specific company using its primary key (ID).
// The Promise<Company> return type guarantees that whoever calls this function
// will receive exactly one Company object formatted to our interface.
export const getCompanyById = async (companyId: number): Promise<Company> => {
  // Template literals allow us to dynamically inject the companyId into the URL endpoint
  const response = await apiClient.get(`/api/companies/${companyId}/`);
  return response.data;
};