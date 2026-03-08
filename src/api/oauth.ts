import { apiClient } from './client';

interface OAuthUrlResponse {
  authorization_url: string;
}

export async function getGoogleAuthUrl(): Promise<string> {
  const response = await apiClient.get<OAuthUrlResponse>('/api/users/oauth/google/login/');
  return response.data.authorization_url;
}

export async function getGitHubAuthUrl(): Promise<string> {
  const response = await apiClient.get<OAuthUrlResponse>('/api/users/oauth/github/login/');
  return response.data.authorization_url;
}
