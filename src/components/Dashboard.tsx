import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  ChevronRight
} from 'lucide-react';
import { Entry } from '../types';
import { EntryCard } from './EntryCard';
import { TYPE_COLORS } from '../constants';

interface DashboardProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
}

export function Dashboard({ entries, onEdit }: DashboardProps) {
  const ratedEntries = entries.filter(e => e.myRating > 0);
  const avgRating = ratedEntries.length > 0 
    ? (ratedEntries.reduce((acc, curr) => acc + curr.myRating, 0) / ratedEntries.length).toFixed(1) 
    : '0.0';

  const continueWatching = entries.filter(e => e.status === 'Watching');
  const recentEntries = [...entries].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 10);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-[3rem] overflow-hidden group">
        <img 
          src="https://picsum.photos/seed/cinema/1920/1080?blur=1" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60"
          alt="Hero"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-black uppercase tracking-[0.3em] border border-neon-blue/30 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                Personal Cinema Universe
              </span>
              <h2 className="text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase font-display">
                Track Your <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink animate-gradient">
                  Masterpieces
                </span>
              </h2>
            </div>
            
            <div className="flex gap-12 items-center">
              <div className="flex flex-col">
                <span className="text-5xl font-black text-white tabular-nums">{entries.length}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Total Library</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-5xl font-black text-white tabular-nums">{entries.filter(e => e.status === 'Completed').length}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Completed</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-5xl font-black text-white tabular-nums">{avgRating}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Avg Rating</span>
              </div>
            </div>

            <div className="pt-4">
              <button className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Explore Collection
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Empty State or Content */}
      {entries.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 flex items-center justify-center border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <TrendingUp className="w-10 h-10 text-gray-700" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight font-display">Your journey starts here</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Add your first movie or show to begin your collection</p>
          </div>
          <div className="pt-4">
            <p className="text-[10px] font-black text-neon-blue uppercase tracking-[0.3em] animate-pulse">Waiting for your first masterpiece...</p>
          </div>
        </section>
      ) : (
        <>
          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                    <Clock className="w-5 h-5 text-neon-green" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Continue Watching</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pick up where you left off</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-gray-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-[0.2em]">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {continueWatching.slice(0, 4).map(entry => (
                  <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
                ))}
              </div>
            </section>
          )}

          {/* Recent Activity */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/20 shadow-[0_0_15px_rgba(188,19,254,0.1)]">
                  <TrendingUp className="w-5 h-5 text-neon-purple" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Recent Additions</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your latest cinematic discoveries</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search your library..."
                    className="bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all w-72 uppercase tracking-widest placeholder:text-gray-600"
                  />
                </div>
                <button className="p-3 rounded-2xl bg-zinc-900/50 border border-white/5 text-gray-500 hover:text-white hover:border-white/20 transition-all">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {recentEntries.map(entry => (
                <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
