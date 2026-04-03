import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, LayoutGrid, List as ListIcon, Trash2, CheckCircle, Clock, Star, Film, Tv, Play, Plus, Sparkles, ChevronRight, X } from 'lucide-react';
import { Entry, Status, EntertainmentType } from '../types';
import { STATUS_OPTIONS, TYPE_OPTIONS, GENRES } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { EntryCard } from './EntryCard';
import { MoodPicker } from './MoodPicker';
import { WatchTimeline } from './WatchTimeline';
import { SurpriseMe } from './SurpriseMe';
import { StarRating } from './StarRating';

interface DashboardProps {
  entries: Entry[];
  onUpdate: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onBulkUpdate: (ids: string[], status: Status) => void;
  onBulkDelete: (ids: string[]) => void;
  onAdd: (entry: Entry) => void;
  onEdit: (entry: Entry) => void;
  onSelect: (entry: Entry) => void;
  onSeed?: () => void;
  isSeeding?: boolean;
  initialFilter?: Status;
}

export function Dashboard({ 
  entries, 
  onUpdate, 
  onDelete, 
  onBulkUpdate, 
  onBulkDelete, 
  onAdd,
  onEdit,
  onSelect,
  onSeed,
  isSeeding,
  initialFilter 
}: DashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>(initialFilter || 'All');
  const [typeFilter, setTypeFilter] = useState<EntertainmentType | 'All'>('All');
  const [genreFilter, setGenreFilter] = useState<string | 'All'>('All');
  const [tagFilter, setTagFilter] = useState<string | 'All'>('All');
  const [sortBy, setSortBy] = useState<'addedAt' | 'myRating' | 'yearDesc' | 'yearAsc' | 'imdbRating' | 'actor' | 'actress'>('actor');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMoodGenres, setActiveMoodGenres] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync genre filter with MoodMusicPlayer
  React.useEffect(() => {
    if (genreFilter !== 'All') {
      window.dispatchEvent(new CustomEvent('cinetrack_genre_change', { detail: genreFilter }));
    } else if (activeMoodGenres.length > 0) {
      window.dispatchEvent(new CustomEvent('cinetrack_genre_change', { detail: activeMoodGenres[0] }));
    } else {
      window.dispatchEvent(new CustomEvent('cinetrack_genre_change', { detail: 'All' }));
    }
  }, [genreFilter, activeMoodGenres]);

  const { currentlyWatching, recentlyCompleted, wantToWatch } = useMemo(() => {
    const base = entries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) ||
                          entry.director.toLowerCase().includes(search.toLowerCase()) ||
                          entry.leadActor.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'All' ? true : entry.type === typeFilter;
      const matchesGenre = genreFilter === 'All' ? true : entry.genre === genreFilter;
      const matchesTag = tagFilter === 'All' ? true : entry.tags?.includes(tagFilter);
      const matchesMood = activeMoodGenres.length === 0 ? true : activeMoodGenres.includes(entry.genre);
      
      return matchesSearch && matchesType && matchesGenre && matchesTag && matchesMood;
    });

    const sortFn = (a: Entry, b: Entry) => {
      switch (sortBy) {
        case 'myRating': return b.myRating - a.myRating;
        case 'imdbRating': return b.imdbRating - a.imdbRating;
        case 'yearDesc': return b.year - a.year;
        case 'yearAsc': return a.year - b.year;
        case 'actor': return a.leadActor.localeCompare(b.leadActor) || a.leadActress.localeCompare(b.leadActress);
        case 'actress': return a.leadActress.localeCompare(b.leadActress) || a.leadActor.localeCompare(b.leadActor);
        case 'addedAt':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    };

    const watching = base.filter(e => e.status === 'Watching').sort(sortFn);
    
    // Recently Completed usually stays sorted by watchedDate unless a specific sort is picked
    const completed = base.filter(e => e.status === 'Completed');
    const sortedCompleted = (sortBy === 'addedAt') 
      ? [...completed].sort((a, b) => new Date(b.watchedDate || 0).getTime() - new Date(a.watchedDate || 0).getTime())
      : [...completed].sort(sortFn);

    const want = base.filter(e => e.status === 'Want to Watch');
    const sortedWant = (sortBy === 'addedAt')
      ? [...want].sort((a, b) => b.imdbRating - a.imdbRating) // Default for Want to Watch is IMDb
      : [...want].sort(sortFn);

    return {
      currentlyWatching: (statusFilter === 'All' || statusFilter === 'Watching') ? watching : [],
      recentlyCompleted: (statusFilter === 'All' || statusFilter === 'Completed') 
        ? (statusFilter === 'All' ? sortedCompleted.slice(0, 5) : sortedCompleted) 
        : [],
      wantToWatch: (statusFilter === 'All' || statusFilter === 'Want to Watch') ? sortedWant : []
    };
  }, [entries, search, statusFilter, typeFilter, genreFilter, activeMoodGenres, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleMoodSelect = (genres: string[]) => {
    setActiveMoodGenres(genres);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(e => e.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [entries]);

  const activities = useMemo(() => {
    return entries
      .filter(e => e.status === 'Completed')
      .sort((a, b) => new Date(b.watchedDate || 0).getTime() - new Date(a.watchedDate || 0).getTime())
      .slice(0, 5);
  }, [entries]);

  const avgRating = entries.filter(e => e.myRating > 0).length > 0
    ? (entries.reduce((acc, curr) => acc + curr.myRating, 0) / entries.filter(e => e.myRating > 0).length).toFixed(1)
    : '0.0';

  const renderSection = (title: string, icon: React.ReactNode, items: Entry[], colorClass: string) => {
    if (items.length === 0) return null;

    return (
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg", colorClass)}>
            {icon}
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
            {title} <span className="ml-2 text-sm text-gray-500">({items.length})</span>
          </h3>
        </div>

        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
            : "space-y-4"
        )}>
          <AnimatePresence mode="popLayout">
            {items.map((entry) => (
              <motion.div
                layout
                key={entry.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <EntryCard
                  entry={entry}
                  onEdit={onEdit}
                  onUpdate={onUpdate}
                  onSelect={onSelect}
                  isSelected={selectedIds.includes(entry.id)}
                  onToggleSelect={toggleSelect}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-24">
      {/* Hero Section */}
      <header className="relative py-24 flex flex-col items-center text-center space-y-8 overflow-hidden rounded-[4rem] bg-zinc-900/30 border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Premium Cinema Companion</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] font-display">
            Your Cinema,<br />Your Rules.
          </h1>
          <p className="text-xl font-bold text-gray-500 uppercase tracking-widest max-w-2xl mx-auto">
            Track, discover, and celebrate your cinematic journey with CineTrack.
          </p>
        </motion.div>

        <div className="relative z-10 flex flex-wrap justify-center gap-6 pt-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-4">
            <Film className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <p className="text-2xl font-black text-white leading-none">{entries.length}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Titles</p>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <p className="text-2xl font-black text-white leading-none">{entries.filter(e => e.status === 'Completed').length}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Watched</p>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-4">
            <Star className="w-6 h-6 text-yellow-500" />
            <div className="text-left">
              <p className="text-2xl font-black text-white leading-none">{avgRating}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg Rating</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mood Picker */}
      <MoodPicker 
        onMoodSelect={handleMoodSelect} 
        activeMood={activeMoodGenres.length > 0 ? 'Active' : null} 
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-12">
          <div className="space-y-8 sticky top-32">
            <div className="pb-8 border-b border-white/5">
              <SurpriseMe entries={entries} onSelect={onSelect} />
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Search</h4>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, actor, director..."
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Status</h4>
              <div className="flex flex-wrap gap-2">
                {['All', ...STATUS_OPTIONS].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      statusFilter === status ? "bg-white text-black" : "bg-zinc-900/50 text-gray-500 hover:text-white"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Type</h4>
              <div className="flex flex-wrap gap-2">
                {['All', ...TYPE_OPTIONS].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      typeFilter === type ? "bg-blue-500 text-white" : "bg-zinc-900/50 text-gray-500 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Genre</h4>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Genres</option>
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Tags</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTagFilter('All')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    tagFilter === 'All' ? "bg-neon-blue text-black" : "bg-zinc-900/50 text-gray-500 hover:text-white"
                  )}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      tagFilter === tag ? "bg-neon-blue text-black" : "bg-zinc-900/50 text-gray-500 hover:text-white"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="addedAt">Default (Priority)</option>
                <option value="imdbRating">IMDb Rating</option>
                <option value="myRating">My Rating</option>
                <option value="yearDesc">Year (Newest)</option>
                <option value="yearAsc">Year (Oldest)</option>
                <option value="actor">Lead Actor (A-Z)</option>
                <option value="actress">Lead Actress (A-Z)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Entries Sections */}
        <div className="lg:col-span-3 space-y-20">
          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-blue-500 p-4 rounded-3xl flex items-center justify-between shadow-2xl"
              >
                <span className="text-xs font-black text-white uppercase tracking-widest ml-4">
                  {selectedIds.length} items selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onBulkUpdate(selectedIds, 'Completed');
                      setSelectedIds([]);
                    }}
                    className="px-6 py-2 bg-white text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Mark Watched
                  </button>
                  <button
                    onClick={() => {
                      onBulkDelete(selectedIds);
                      setSelectedIds([]);
                    }}
                    className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Controls */}
          <div className="flex items-center justify-end mb-8">
            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'grid' ? "bg-white text-black" : "text-gray-500 hover:text-white"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-white text-black" : "text-gray-500 hover:text-white"
                )}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sections */}
          {renderSection(
            "🎬 Currently Watching", 
            <Play className="w-6 h-6 text-blue-500 fill-current" />, 
            currentlyWatching, 
            "bg-blue-500/10 border-blue-500/20"
          )}

          {renderSection(
            "✅ Recently Completed", 
            <CheckCircle className="w-6 h-6 text-green-500" />, 
            recentlyCompleted, 
            "bg-green-500/10 border-green-500/20"
          )}

          {renderSection(
            "📋 Want to Watch", 
            <Clock className="w-6 h-6 text-purple-500" />, 
            wantToWatch, 
            "bg-purple-500/10 border-purple-500/20"
          )}

          {currentlyWatching.length === 0 && recentlyCompleted.length === 0 && wantToWatch.length === 0 && (
            <div className="py-24 text-center space-y-6 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                <Film className="w-10 h-10 text-gray-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">No titles found</h4>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Try adjusting your filters or add something new!</p>
              </div>
              {onSeed && entries.length === 0 && (
                <button
                  onClick={onSeed}
                  disabled={isSeeding}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100"
                >
                  {isSeeding ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isSeeding ? 'Loading...' : 'Load Preloaded "Want to Watch" List'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

          {/* Timeline Section */}
          <WatchTimeline entries={entries} onSelect={onSelect} />

          {/* Activity Feed */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-neon-green/10 border border-neon-green/20 shadow-lg">
                <Sparkles className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">Recent Activity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onSelect(activity)}
                  className="group bg-zinc-900/30 border border-white/5 p-6 rounded-[2rem] cursor-pointer hover:bg-zinc-900/50 transition-all flex items-center gap-6"
                >
                  <div className="w-16 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img src={activity.posterUrl} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[8px] font-black text-neon-green uppercase tracking-widest">Just Watched</p>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{activity.title}</h4>
                    <div className="flex items-center gap-2">
                      <StarRating rating={activity.myRating} size={10} />
                      <span className="text-[10px] font-bold text-gray-500">{new Date(activity.watchedDate || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
    </div>
  );
}
