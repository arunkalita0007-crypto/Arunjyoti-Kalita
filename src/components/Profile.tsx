import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Clock, 
  Heart, 
  MapPin, 
  Languages,
  Award
} from 'lucide-react';
import { Entry } from '../types';

interface ProfileProps {
  entries: Entry[];
  onReset: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Profile({ entries, onReset, onExport, onImport }: ProfileProps) {
  const completed = entries.filter(e => e.status === 'Completed');
  
  // Top Genre
  const genreCounts = entries.reduce((acc, curr) => {
    acc[curr.genre] = (acc[curr.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Total Hours
  const totalHours = Math.round(entries.reduce((acc, curr) => {
    const time = curr.runtime * (curr.episodesWatched || 1);
    return acc + time;
  }, 0) / 60);

  // Top Actor
  const actorCounts = entries.reduce((acc, curr) => {
    if (curr.leadActor !== 'N/A') acc[curr.leadActor] = (acc[curr.leadActor] || 0) + 1;
    if (curr.leadActress !== 'N/A') acc[curr.leadActress] = (acc[curr.leadActress] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topActor = Object.entries(actorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // International taste
  const countries = new Set(entries.map(e => e.country)).size;
  const languages = new Set(entries.map(e => e.language)).size;

  const ratedEntries = entries.filter(e => e.myRating > 0);
  const avgRating = ratedEntries.length > 0 
    ? (ratedEntries.reduce((a, b) => a + b.myRating, 0) / ratedEntries.length).toFixed(1) 
    : '0.0';

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-zinc-900 rounded-full mx-auto flex items-center justify-center border border-white/5 shadow-2xl">
            <span className="text-4xl font-black text-gray-700">AK</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase font-display">Your Cinema Profile</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Your journey is just beginning</p>
        </div>

        <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-zinc-900/30 border border-white/5 rounded-[3rem] border-dashed">
          <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5">
            <Trophy className="w-8 h-8 text-gray-800" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">No masterpieces yet</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
              Your wrap-up will appear here once you've added content to your library.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20"
        >
          <span className="text-4xl font-black text-white">AK</span>
        </motion.div>
        <h2 className="text-4xl font-black text-white tracking-tight">Your Cinema Wrap-Up</h2>
        <p className="text-gray-400">A celebration of your journey through stories</p>
      </div>

      {/* Main Wrap-Up Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-white/10 rounded-[40px] p-12 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] -ml-32 -mb-32" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">The Genre You Loved</p>
              <h3 className="text-6xl font-black text-white">{topGenre}</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Your Screen Time</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-blue-400">{totalHours}</span>
                <span className="text-2xl font-bold text-gray-500">Hours</span>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Countries</span>
                </div>
                <p className="text-2xl font-black text-white">{countries}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <Languages className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Languages</span>
                </div>
                <p className="text-2xl font-black text-white">{languages}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="text-yellow-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Top Performer</p>
                  <p className="text-xl font-black text-white">{topActor}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <Award className="text-green-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Completed</p>
                  <p className="text-xl font-black text-white">{completed.length} Masterpieces</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Heart className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Rating Given</p>
                  <p className="text-xl font-black text-white">
                    {avgRating} / 10
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl text-center">
              <p className="text-sm font-bold text-white/80 mb-2 italic">"Cinema is a matter of what's in the frame and what's out."</p>
              <p className="text-xs font-black text-white uppercase tracking-widest">— Martin Scorsese</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share Section */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl shadow-white/10">
            Share My Wrap-Up
          </button>
          <button 
            onClick={onExport}
            className="px-8 py-4 rounded-2xl bg-zinc-800 text-white font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform border border-white/10"
          >
            Export Backup
          </button>
          <label className="px-8 py-4 rounded-2xl bg-zinc-800 text-white font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform border border-white/10 cursor-pointer">
            Import Backup
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
        </div>
        
        <button 
          onClick={onReset}
          className="text-xs font-bold text-red-500/60 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
