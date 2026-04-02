export type EntertainmentType = 
  | 'Movie' 
  | 'Sitcom' 
  | 'Web Series' 
  | 'Short Film' 
  | 'Documentary' 
  | 'Anime' 
  | 'Mini-Series';

export type Status = 'Watching' | 'Completed' | 'Dropped' | 'Want to Watch';

export type Platform = 
  | 'Netflix' 
  | 'Prime' 
  | 'Disney+' 
  | 'HBO' 
  | 'Theatre' 
  | 'YouTube' 
  | 'Other';

export type Mood = 'Evening' | 'Daytime' | 'Weekend' | 'Anytime';

export type BasedOn = 'Original' | 'Book' | 'True Story' | 'Comic' | 'Game';

export interface Entry {
  id: string;
  title: string;
  type: EntertainmentType;
  year: number;
  director: string;
  genre: string;
  subGenre?: string;
  leadActor: string;
  leadActress: string;
  supportingActor: string;
  platform: Platform;
  country: string;
  language: string;
  runtime: number; // minutes
  totalSeasons?: number;
  totalEpisodes?: number;
  episodesWatched: number;
  imdbRating: number;
  myRating: number;
  status: Status;
  startDate?: string;
  watchedDate?: string;
  rewatchable: boolean;
  mood: Mood;
  awardsWon?: string;
  oscarEmmyWins?: number;
  basedOn: BasedOn;
  franchise?: string;
  review: string;
  favEpisode?: string;
  favCharacter?: string;
  posterUrl: string;
  addedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  color: string;
}
