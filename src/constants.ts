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
export const PLATFORM_OPTIONS = [
  'Netflix', 
  'Prime', 
  'Disney+', 
  'Hotstar', 
  'Apple TV+', 
  'ZEE5', 
  'JioCinema', 
  'YouTube', 
  'HBO', 
  'Theatre', 
  'Other'
] as const;
export const MOOD_OPTIONS = ['Evening', 'Daytime', 'Weekend', 'Anytime'] as const;
export const BASED_ON_OPTIONS = ['Original', 'Book', 'True Story', 'Comic', 'Game'] as const;

export const NANO_GENRES = [
  'Existential road trip',
  'Unreliable narrator',
  'Found footage horror',
  'Slow burn thriller',
  'Feel good tearjerker',
  'Neo-noir detective',
  'Coming-of-age indie',
  'Satirical black comedy',
  'Dystopian cyberpunk',
  'Surrealist dreamscape',
  'Period piece drama',
  'High-stakes heist',
  'Space opera epic',
  'Gothic romance',
  'Mockumentary style'
];

export const POPULAR_TAGS = [
  'mindbending',
  'mustwatch',
  'overrated',
  'masterpiece',
  'rewatched',
  'underrated',
  'cinematography',
  'soundtrack',
  'acting',
  'plot-twist',
  'mindbending',
  'mustwatch',
  'comfort-movie',
  'rainy-day',
  'family-watch',
  'visual-masterpiece',
  'slow-burn',
  'feel-good',
  'dark-and-gritty',
  'whimsical',
  'nostalgic'
];

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

export const BADGE_DEFINITIONS = [
  { id: 'first-watch', title: 'First Watch', description: 'Watched your first movie', icon: '🎬', requirement: 1, color: 'blue' },
  { id: 'on-fire', title: 'On Fire', description: 'Watched 5 things in a row', icon: '🔥', requirement: 5, color: 'orange' },
  { id: 'world-cinema', title: 'World Cinema', description: 'Watched content from 3 different countries', icon: '🌍', requirement: 3, color: 'green' },
  { id: 'genre-hopper', title: 'Genre Hopper', description: 'Watched 5 different genres', icon: '🎭', requirement: 5, color: 'purple' },
  { id: 'critic-mode', title: 'Critic Mode', description: 'Rated 10 entries', icon: '⭐', requirement: 10, color: 'yellow' },
  { id: 'binge-master', title: 'Binge Master', description: 'Completed a full series', icon: '🍿', requirement: 1, color: 'pink' },
  { id: 'cinephile', title: 'Cinephile', description: 'Watched 30 movies', icon: '👑', requirement: 30, color: 'blue' },
];

export const MOOD_MAPPINGS = [
  { label: 'Laugh', emoji: '😂', genres: ['Comedy', 'Animation'] },
  { label: 'Scared', emoji: '😱', genres: ['Horror', 'Thriller'] },
  { label: 'Cry', emoji: '😢', genres: ['Drama', 'Romance'] },
  { label: 'Mind-blown', emoji: '🤯', genres: ['Sci-Fi', 'Mystery', 'Psychological'] },
  { label: 'Feel Good', emoji: '🥰', genres: ['Romance', 'Musical', 'Adventure'] },
  { label: 'Adrenaline', emoji: '⚡', genres: ['Action', 'Adventure', 'War'] },
];
