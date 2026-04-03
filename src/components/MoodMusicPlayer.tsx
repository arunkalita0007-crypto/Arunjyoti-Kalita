import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown,
  Play,
  Pause,
  Film,
  Ghost,
  Heart,
  Zap,
  Rocket,
  Frown
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Mood {
  id: string;
  name: string;
  icon: React.ElementType;
  url: string;
  color: string;
  genres: string[];
}

const MOODS: Mood[] = [
  { 
    id: 'cinematic', 
    name: 'Cinematic', 
    icon: Film, 
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_942571cd6e.mp3',
    color: '#3b82f6',
    genres: ['All', 'Adventure', 'Music', 'Musical', 'Family']
  },
  { 
    id: 'thriller', 
    name: 'Thriller', 
    icon: Ghost, 
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1fca.mp3',
    color: '#ef4444',
    genres: ['Horror', 'Thriller', 'Mystery', 'Crime']
  },
  { 
    id: 'romance', 
    name: 'Romance', 
    icon: Heart, 
    url: 'https://cdn.pixabay.com/audio/2022/02/07/audio_0a3f9b4e76.mp3',
    color: '#ec4899',
    genres: ['Romance', 'Comedy']
  },
  { 
    id: 'action', 
    name: 'Action', 
    icon: Zap, 
    url: 'https://cdn.pixabay.com/audio/2022/03/19/audio_808ccc3cc4.mp3',
    color: '#eab308',
    genres: ['Action', 'War', 'Sport', 'Western']
  },
  { 
    id: 'scifi', 
    name: 'Sci-Fi', 
    icon: Rocket, 
    url: 'https://cdn.pixabay.com/audio/2021/11/01/audio_cb4f6b2914.mp3',
    color: '#a855f7',
    genres: ['Sci-Fi', 'Fantasy', 'Animation']
  },
  { 
    id: 'drama', 
    name: 'Drama', 
    icon: Frown, 
    url: 'https://cdn.pixabay.com/audio/2022/01/27/audio_4c8c9e638b.mp3',
    color: '#6366f1',
    genres: ['Drama', 'History', 'Documentary', 'Biography']
  }
];

interface MoodMusicPlayerProps {
  preferences: { mood: string; volume: number };
  onUpdatePreferences: (newPrefs: any) => void;
}

export function MoodMusicPlayer({ preferences, onUpdatePreferences }: MoodMusicPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood>(() => {
    return MOODS.find(m => m.id === preferences.mood) || MOODS[0];
  });
  const [volume, setVolume] = useState(preferences.volume);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state with props
  useEffect(() => {
    const mood = MOODS.find(m => m.id === preferences.mood) || MOODS[0];
    if (mood.id !== currentMood.id) {
      setCurrentMood(mood);
    }
    if (preferences.volume !== volume) {
      setVolume(preferences.volume);
    }
  }, [preferences]);

  const playAudio = async () => {
    if (audioRef.current && isPlaying && !isError) {
      try {
        await audioRef.current.play();
      } catch (e) {
        console.error("Audio play failed:", e);
        handleAudioError();
      }
    }
  };

  const handleAudioError = () => {
    console.warn(`Failed to load: ${currentMood.name}. Trying next mood...`);
    const currentIndex = MOODS.findIndex(m => m.id === currentMood.id);
    const nextIndex = (currentIndex + 1) % MOODS.length;
    
    // If we've tried all moods and still failing
    if (MOODS[nextIndex].id === localStorage.getItem('cinetrack_mood_failed_start')) {
      setIsError(true);
      setIsPlaying(false);
      return;
    }

    if (!localStorage.getItem('cinetrack_mood_failed_start')) {
      localStorage.setItem('cinetrack_mood_failed_start', currentMood.id);
    }

    setCurrentMood(MOODS[nextIndex]);
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.preload = "none";
      audioRef.current.onerror = handleAudioError;
    }
    
    audioRef.current.volume = isMuted ? 0 : volume;
    
    if (isPlaying) {
      playAudio();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = currentMood.url;
      setIsError(false);
      localStorage.removeItem('cinetrack_mood_failed_start');
      
      if (wasPlaying) {
        playAudio();
      }
    }
    onUpdatePreferences({ mood: currentMood.id });
  }, [currentMood]);

  useEffect(() => {
    onUpdatePreferences({ volume });
  }, [volume]);

  // Listen for genre changes from Dashboard
  useEffect(() => {
    const handleGenreChange = (e: any) => {
      const genre = e.detail;
      const matchingMood = MOODS.find(mood => mood.genres.includes(genre));
      if (matchingMood && matchingMood.id !== currentMood.id) {
        setCurrentMood(matchingMood);
      }
    };

    window.addEventListener('cinetrack_genre_change', handleGenreChange);
    return () => window.removeEventListener('cinetrack_genre_change', handleGenreChange);
  }, [currentMood]);

  const togglePlay = () => {
    if (isError) return;
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="fixed bottom-8 left-8 z-[100] flex flex-col items-start gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-72 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: isError ? '#ef444420' : `${currentMood.color}20`, color: isError ? '#ef4444' : currentMood.color }}
                >
                  <currentMood.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">
                    {isError ? 'Music Unavailable' : currentMood.name}
                  </h4>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                    {isError ? 'All sources failed' : 'Ambient Mood'}
                  </p>
                </div>
              </div>
              <button 
                onClick={togglePlay}
                disabled={isError}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isError ? "bg-zinc-800 text-gray-600 cursor-not-allowed" : "bg-white text-black hover:scale-110"
                )}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setCurrentMood(mood)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all group",
                    currentMood.id === mood.id 
                      ? "bg-white/10 border-white/20" 
                      : "bg-zinc-800/50 border-transparent hover:border-white/10"
                  )}
                >
                  <mood.icon 
                    className="w-4 h-4 transition-transform group-hover:scale-110" 
                    style={{ color: currentMood.id === mood.id ? mood.color : '#71717a' }}
                  />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-white">
                    {mood.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
              <button onClick={toggleMute} className="text-gray-500 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl relative group",
          isOpen ? "bg-white text-black rotate-90" : "bg-zinc-900 text-white border border-white/10 hover:border-white/30"
        )}
      >
        <div className="relative">
          <Music className={cn("w-6 h-6", isPlaying && "animate-bounce")} />
          {isPlaying && (
            <div className="absolute -top-1 -right-1 flex gap-0.5 items-end h-3">
              <motion.div 
                animate={{ height: [4, 12, 6, 10, 4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-0.5 bg-blue-500 rounded-full"
              />
              <motion.div 
                animate={{ height: [8, 4, 12, 6, 8] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-0.5 bg-blue-500 rounded-full"
              />
              <motion.div 
                animate={{ height: [6, 10, 4, 12, 6] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="w-0.5 bg-blue-500 rounded-full"
              />
            </div>
          )}
        </div>
        
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-black scale-0 group-hover:scale-100 transition-transform duration-300" />
      </button>
    </div>
  );
}
