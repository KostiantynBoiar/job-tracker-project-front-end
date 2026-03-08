import { apiClient } from './client';

export interface Company {
  id: number;
  name: string;
  logo_url: string | null;
  careers_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get('/api/companies/');
  return response.data.results || response.data;
};

export const getCompanyById = async (companyId: number): Promise<Company> => {
  const response = await apiClient.get(`/api/companies/${companyId}/`);
  return response.data;
};
