import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Star, 
  Calendar, 
  Clock, 
  User, 
  Clapperboard, 
  Tv, 
  Award, 
  Heart,
  Share2,
  Edit3,
} from 'lucide-react';
import { Entry } from '../types';
import { TYPE_COLORS, NEON_GLOWS } from '../constants';
import { cn } from '../lib/utils';

interface DetailViewProps {
  entry: Entry;
  onClose: () => void;
  onEdit: () => void;
  onUpdateReview?: (id: string, review: string) => void;
}

export function DetailView({ entry, onClose, onEdit, onUpdateReview }: DetailViewProps) {
  const neonColor = TYPE_COLORS[entry.type as keyof typeof TYPE_COLORS] || 'var(--color-neon-blue)';
  const neonGlow = NEON_GLOWS[entry.type as keyof typeof NEON_GLOWS] || 'neon-glow-blue';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative w-full max-w-6xl bg-zinc-900/50 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]"
      >
        {/* Background Blur Poster */}
        <div 
          className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none"
          style={{ backgroundImage: `url(${entry.posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />

        {/* Poster Section */}
        <div className="w-full md:w-[400px] shrink-0 relative group">
          <img 
            src={entry.posterUrl} 
            alt={entry.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
              <span className="text-xl font-black text-white">{entry.myRating || entry.imdbRating}</span>
            </div>
            <button 
              onClick={onEdit}
              className="p-4 bg-white text-black rounded-2xl hover:scale-110 transition-transform shadow-xl"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto relative custom-scrollbar">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-white/10 text-gray-400 transition-all hover:rotate-90 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                  `border-${entry.type.toLowerCase().replace(' ', '-')}`
                )} style={{ color: neonColor, borderColor: `${neonColor}40` }}>
                  {entry.type}
                </span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {entry.year}
                </span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {entry.runtime} MIN
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase font-display leading-none">
                {entry.title}
              </h2>
              <p className="text-lg font-bold text-gray-400 italic">Directed by {entry.director}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Genre</p>
                <p className="text-sm font-bold text-white">{entry.genre}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Platform</p>
                <p className="text-sm font-bold text-white">{entry.platform}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</p>
                <p className="text-sm font-bold text-neon-blue">{entry.status}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Cast</p>
              <div className="flex flex-wrap gap-3">
                {[entry.leadActor, entry.leadActress, entry.supportingActor].filter(a => a !== 'N/A').map((actor, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold text-white">{actor}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Review</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 relative">
                <p className="text-gray-300 leading-relaxed italic">"{entry.review || 'No review written yet...'}"</p>
              </div>
            </div>

            {entry.awardsWon && (
              <div className="flex items-center gap-4 bg-neon-yellow/10 border border-neon-yellow/20 p-6 rounded-3xl">
                <Award className="w-8 h-8 text-neon-yellow" />
                <div>
                  <p className="text-[10px] font-black text-neon-yellow uppercase tracking-[0.2em]">Awards & Recognition</p>
                  <p className="text-sm font-bold text-white">{entry.awardsWon}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
