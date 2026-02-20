export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  salary?: string;
  description: string;
  sourceUrl: string; // The link to Apple/Nvidia
  platform: 'Apple' | 'Nvidia' | 'Google' | 'Netflix' | 'Meta';
  isSaved: boolean;
}