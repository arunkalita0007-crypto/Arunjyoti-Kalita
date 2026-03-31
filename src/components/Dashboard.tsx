import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  ChevronRight,
  X
} from 'lucide-react';
import { Entry } from '../types';
import { EntryCard } from './EntryCard';
import { TYPE_COLORS, TYPE_OPTIONS, GENRES, STATUS_OPTIONS } from '../constants';
import { cn } from '../lib/utils';

interface DashboardProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
}

export function Dashboard({ entries, onEdit }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.leadActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.leadActress.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'All' || entry.type === selectedType;
      const matchesGenre = selectedGenre === 'All' || entry.genre === selectedGenre;
      const matchesStatus = selectedStatus === 'All' || entry.status === selectedStatus;

      return matchesSearch && matchesType && matchesGenre && matchesStatus;
    });
  }, [entries, searchQuery, selectedType, selectedGenre, selectedStatus]);

  const ratedEntries = entries.filter(e => e.myRating > 0);
  const avgRating = ratedEntries.length > 0 
    ? (ratedEntries.reduce((acc, curr) => acc + curr.myRating, 0) / ratedEntries.length).toFixed(1) 
    : '0.0';

  const continueWatching = entries.filter(e => e.status === 'Watching');
  const recentEntries = [...filteredEntries].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 10);

  const isFiltered = searchQuery !== '' || selectedType !== 'All' || selectedGenre !== 'All' || selectedStatus !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedGenre('All');
    setSelectedStatus('All');
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      {!isFiltered && (
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
      )}

      {/* Search and Filter Bar */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/20 shadow-[0_0_15px_rgba(188,19,254,0.1)]">
              <TrendingUp className="w-5 h-5 text-neon-purple" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                {isFiltered ? 'Search Results' : 'Recent Additions'}
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {isFiltered ? `Found ${filteredEntries.length} items` : 'Your latest cinematic discoveries'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all w-full md:w-72 uppercase tracking-widest placeholder:text-gray-600"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-3 rounded-2xl bg-zinc-900/50 border transition-all",
                isFilterOpen || isFiltered ? "border-neon-blue text-neon-blue bg-neon-blue/10" : "border-white/5 text-gray-500 hover:text-white hover:border-white/20"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Content Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...TYPE_OPTIONS].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          selectedType === type 
                            ? "bg-neon-blue/20 border-neon-blue text-neon-blue" 
                            : "bg-black/40 border-white/5 text-gray-500 hover:border-white/20"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-3 text-xs font-bold text-white focus:outline-none focus:border-neon-blue/50 transition-all uppercase tracking-widest"
                  >
                    <option value="All">All Genres</option>
                    {GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Watch Status</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...STATUS_OPTIONS].map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          selectedStatus === status 
                            ? "bg-neon-purple/20 border-neon-purple text-neon-purple" 
                            : "bg-black/40 border-white/5 text-gray-500 hover:border-white/20"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {isFiltered && (
                  <div className="md:col-span-3 pt-4 border-t border-white/5 flex justify-end">
                    <button 
                      onClick={resetFilters}
                      className="text-[10px] font-black text-neon-red uppercase tracking-[0.3em] hover:opacity-80 transition-opacity"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Grid */}
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-zinc-900/30 border border-white/5 rounded-[3rem] border-dashed">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5">
              <Search className="w-8 h-8 text-gray-800" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">No matches found</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button 
                onClick={resetFilters}
                className="mt-4 px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {recentEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
            ))}
          </div>
        )}
      </section>

      {/* Continue Watching (Only on main dashboard) */}
      {!isFiltered && continueWatching.length > 0 && (
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
    </div>
  );
}
