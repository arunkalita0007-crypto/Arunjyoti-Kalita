import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Star, 
  ExternalLink,
  MoreVertical,
  Info
} from 'lucide-react';
import { Entry } from '../types';
import { cn } from '../lib/utils';

export interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
}

const NEON_COLORS = {
  'Movie': 'var(--color-neon-blue)',
  'Web Series': 'var(--color-neon-purple)',
  'Sitcom': 'var(--color-neon-green)',
  'Anime': 'var(--color-neon-pink)',
  'Documentary': 'var(--color-neon-yellow)',
  'Mini-Series': 'var(--color-neon-red)',
};

const NEON_GLOWS = {
  'Movie': 'neon-glow-blue',
  'Web Series': 'neon-glow-purple',
  'Sitcom': 'neon-glow-green',
  'Anime': 'neon-glow-pink',
  'Documentary': 'neon-glow-yellow',
  'Mini-Series': 'neon-glow-red',
};

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onEdit }) => {
  const neonColor = NEON_COLORS[entry.type as keyof typeof NEON_COLORS] || 'var(--color-neon-blue)';
  const neonGlow = NEON_GLOWS[entry.type as keyof typeof NEON_GLOWS] || 'neon-glow-blue';

  const isSeries = ['Web Series', 'Sitcom', 'Anime', 'Mini-Series'].includes(entry.type);
  const progress = isSeries && entry.totalEpisodes && entry.totalEpisodes > 0
    ? Math.round((entry.episodesWatched / entry.totalEpisodes) * 100) 
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className={cn(
        "group relative bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-500",
        "hover:border-white/20",
        neonGlow
      )}
    >
      {/* Poster Image Container */}
      <div className="aspect-[2/3] relative overflow-hidden">
        <img 
          src={entry.posterUrl || `https://picsum.photos/seed/${entry.id}/400/600`}
          alt={entry.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 poster-gradient" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
        
        {/* Type Badge (Neon) */}
        <div 
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-xl"
          style={{ 
            backgroundColor: `${neonColor}20`, 
            border: `1px solid ${neonColor}`,
            boxShadow: `0 0 10px ${neonColor}40`
          }}
        >
          {entry.type}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-black text-white">{entry.myRating || '—'}</span>
        </div>

        {/* Info Overlay on Hover */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(entry)}
                className="flex-1 bg-white text-black h-12 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-black" />
                Edit Entry
              </button>
              <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10">
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-black text-white leading-tight line-clamp-1 group-hover:text-neon-blue transition-colors duration-300 font-display uppercase tracking-tight">
              {entry.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>{entry.year}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>{entry.genre}</span>
          </div>
        </div>

        {/* Progress Bar for Series */}
        {isSeries && entry.totalEpisodes && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-2">
                <Play className="w-3 h-3 fill-current" />
                Progress
              </span>
              <span style={{ color: neonColor }}>{entry.episodesWatched}/{entry.totalEpisodes} EP</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: neonColor,
                  boxShadow: `0 0 10px ${neonColor}80`
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            entry.status === 'Completed' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
            entry.status === 'Watching' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
            entry.status === 'Dropped' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
          )}>
            {entry.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> :
             entry.status === 'Watching' ? <Play className="w-3 h-3 fill-current" /> :
             <Clock className="w-3 h-3" />}
            {entry.status}
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
            <ExternalLink className="w-3 h-3" />
            <span>IMDb {entry.imdbRating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
