import { EntertainmentType } from './types';

export const TYPE_COLORS: Record<EntertainmentType, string> = {
  'Movie': '#3b82f6', // Blue
  'Web Series': '#22c55e', // Green
  'Sitcom': '#eab308', // Yellow
  'Anime': '#a855f7', // Purple
  'Documentary': '#f97316', // Orange
  'Short Film': '#ec4899', // Pink
  'Mini-Series': '#ef4444', // Red
};

export const TYPE_OPTIONS: EntertainmentType[] = [
  'Movie', 'Sitcom', 'Web Series', 'Short Film', 'Documentary', 'Anime', 'Mini-Series'
];

export const STATUS_OPTIONS = ['Watching', 'Completed', 'Dropped', 'Want to Watch'] as const;
export const PLATFORM_OPTIONS = ['Netflix', 'Prime', 'Disney+', 'HBO', 'Theatre', 'YouTube', 'Other'] as const;
export const MOOD_OPTIONS = ['Evening', 'Daytime', 'Weekend', 'Anytime'] as const;
export const BASED_ON_OPTIONS = ['Original', 'Book', 'True Story', 'Comic', 'Game'] as const;

export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
  'Psychological', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Crime', 
  'Animation', 'Biography', 'History', 'Musical', 'War'
];

export const NEON_GLOWS: Record<EntertainmentType, string> = {
  'Movie': 'neon-glow-blue',
  'Web Series': 'neon-glow-purple',
  'Sitcom': 'neon-glow-green',
  'Anime': 'neon-glow-pink',
  'Documentary': 'neon-glow-yellow',
  'Mini-Series': 'neon-glow-red',
  'Short Film': 'neon-glow-pink',
};
