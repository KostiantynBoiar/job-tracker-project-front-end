import { apiClient } from './client';
import { Company } from './companies';

export interface Keyword {
  id: number;
  keyword: string;
}

export interface Preferences {
  preferred_companies?: Company[]; 
  keywords?: Keyword[];            
  notification_frequency?: string;
}

export const getPreferences = async (): Promise<Preferences> => {
  const response = await apiClient.get('/api/preferences/');
  return response.data.results ? response.data.results[0] : response.data;
};

// Update Email Alerts
export const updateAlerts = async (frequency: string) => {
  const response = await apiClient.patch('/api/preferences/', { notification_frequency: frequency });
  return response.data;
};

export const addPreferredCompany = async (companyId: number) => {
  const response = await apiClient.post('/api/preferences/companies/add/', { company_id: companyId });
  return response.data;
};

export const removePreferredCompany = async (companyId: number) => {
  await apiClient.delete(`/api/preferences/companies/${companyId}/`);
};

export const addKeyword = async (keyword: string) => {
  const response = await apiClient.post('/api/preferences/keywords/add/', { keyword });
  return response.data;
};

export const removeKeyword = async (keywordId: number) => {
  await apiClient.delete(`/api/preferences/keywords/${keywordId}/`);
};