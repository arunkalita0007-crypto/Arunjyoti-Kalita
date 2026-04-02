import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, X, Star, Clock, Calendar, ChevronRight, RefreshCw } from 'lucide-react';
import { Entry } from '../types';
import { cn } from '../lib/utils';

interface DailyPickProps {
  entries: Entry[];
  onStartWatching: (entry: Entry) => void;
  onSelect: (entry: Entry) => void;
}

export function DailyPick({ entries, onStartWatching, onSelect }: DailyPickProps) {
  const [pick, setPick] = useState<Entry | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const wantToWatch = useMemo(() => entries.filter(e => e.status === 'Want to Watch'), [entries]);

  useEffect(() => {
    const savedPickId = localStorage.getItem('cinetrack_daily_pick_id');
    const savedPickDate = localStorage.getItem('cinetrack_daily_pick_date');
    const today = new Date().toDateString();

    if (savedPickId && savedPickDate === today) {
      const found = wantToWatch.find(e => e.id === savedPickId);
      if (found) {
        setPick(found);
        return;
      }
    }

    // Generate new pick
    if (wantToWatch.length > 0) {
      generateNewPick();
    }
  }, [wantToWatch]);

  const generateNewPick = () => {
    if (wantToWatch.length === 0) return;

    const dayOfWeek = new Date().getDay(); // 0-6 (Sun-Sat)
    
    // Logic: 
    // Sun: World Cinema (non-English)
    // Mon: Light Comedy / Sitcom
    // Tue: Drama / History
    // Wed: Sci-Fi / Fantasy
    // Thu: Thriller / Horror
    // Fri: Epic Drama / Action
    // Sat: Highest Rated

    let filtered = [...wantToWatch];
    
    switch(dayOfWeek) {
      case 0: filtered = wantToWatch.filter(e => e.language.toLowerCase() !== 'english'); break;
      case 1: filtered = wantToWatch.filter(e => e.genre.includes('Comedy') || e.type === 'Sitcom'); break;
      case 2: filtered = wantToWatch.filter(e => e.genre.includes('Drama') || e.genre.includes('History')); break;
      case 3: filtered = wantToWatch.filter(e => e.genre.includes('Sci-Fi') || e.genre.includes('Fantasy')); break;
      case 4: filtered = wantToWatch.filter(e => e.genre.includes('Thriller') || e.genre.includes('Horror')); break;
      case 5: filtered = wantToWatch.filter(e => e.genre.includes('Action') || e.genre.includes('Drama')); break;
      case 6: filtered = wantToWatch.sort((a, b) => b.imdbRating - a.imdbRating).slice(0, 5); break;
    }

    if (filtered.length === 0) filtered = wantToWatch;

    const randomPick = filtered[Math.floor(Math.random() * filtered.length)];
    setPick(randomPick);
    localStorage.setItem('cinetrack_daily_pick_id', randomPick.id);
    localStorage.setItem('cinetrack_daily_pick_date', new Date().toDateString());
  };

  if (!pick || isDismissed) return null;

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const reason = dayOfWeekReason(new Date().getDay());

  function dayOfWeekReason(day: number) {
    switch(day) {
      case 0: return "A perfect Sunday for exploring world cinema.";
      case 1: return "Kickstart your week with something light and fun.";
      case 2: return "Dive deep into a compelling drama tonight.";
      case 3: return "Mid-week escape to another world.";
      case 4: return "Get your heart racing with this thriller.";
      case 5: return "Friday night calls for an epic cinematic journey.";
      case 6: return "Saturday night special: The best of the best.";
      default: return "A hand-picked cinematic gem just for you.";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group overflow-hidden rounded-[3rem] bg-zinc-900/50 border border-white/5 p-8 md:p-12 shadow-2xl"
    >
      {/* Background Poster Blur */}
      <div className="absolute inset-0 opacity-10 blur-[100px] -z-10">
        <img src={pick.posterUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        {/* Poster */}
        <div className="w-full md:w-64 shrink-0 relative group/poster">
          <div className="aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-transform duration-500 group-hover/poster:scale-[1.02]">
            <img 
              src={pick.posterUrl} 
              alt={pick.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl rotate-12 group-hover/poster:rotate-0 transition-all duration-500">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Today's Pick for {dayName}</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.85] font-display">
              {pick.title}
            </h2>
            <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">
              {reason}
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-xl font-black text-white">{pick.imdbRating}</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">IMDb</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-black text-white">{pick.runtime}m</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Runtime</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
            <button
              onClick={() => onStartWatching(pick)}
              className="px-8 h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Tonight
            </button>
            <button
              onClick={generateNewPick}
              className="px-8 h-14 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-zinc-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Not Today
            </button>
            <button
              onClick={() => onSelect(pick)}
              className="px-8 h-14 bg-transparent border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white/5 transition-all"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
