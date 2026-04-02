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

interface DashboardProps {
  entries: Entry[];
  onUpdate: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onBulkUpdate: (ids: string[], status: Status) => void;
  onBulkDelete: (ids: string[]) => void;
  onAdd: (entry: Entry) => void;
  onEdit: (entry: Entry) => void;
  onSelect: (entry: Entry) => void;
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
  initialFilter 
}: DashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>(initialFilter || 'All');
  const [typeFilter, setTypeFilter] = useState<EntertainmentType | 'All'>('All');
  const [genreFilter, setGenreFilter] = useState<string | 'All'>('All');
  const [sortBy, setSortBy] = useState<'addedAt' | 'myRating' | 'year'>('addedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMoodGenres, setActiveMoodGenres] = useState<string[]>([]);

  const { currentlyWatching, recentlyCompleted, wantToWatch } = useMemo(() => {
    const base = entries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) ||
                          entry.director.toLowerCase().includes(search.toLowerCase()) ||
                          entry.leadActor.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'All' ? true : entry.type === typeFilter;
      const matchesGenre = genreFilter === 'All' ? true : entry.genre === genreFilter;
      const matchesMood = activeMoodGenres.length === 0 ? true : activeMoodGenres.includes(entry.genre);
      
      return matchesSearch && matchesType && matchesGenre && matchesMood;
    });

    const watching = base.filter(e => e.status === 'Watching');
    const completed = base.filter(e => e.status === 'Completed')
      .sort((a, b) => new Date(b.watchedDate || 0).getTime() - new Date(a.watchedDate || 0).getTime());
    const want = base.filter(e => e.status === 'Want to Watch')
      .sort((a, b) => b.imdbRating - a.imdbRating);

    // Apply status filter if not 'All'
    return {
      currentlyWatching: (statusFilter === 'All' || statusFilter === 'Watching') ? watching : [],
      recentlyCompleted: (statusFilter === 'All' || statusFilter === 'Completed') 
        ? (statusFilter === 'All' ? completed.slice(0, 5) : completed) 
        : [],
      wantToWatch: (statusFilter === 'All' || statusFilter === 'Want to Watch') ? want : []
    };
  }, [entries, search, statusFilter, typeFilter, genreFilter, activeMoodGenres]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleMoodSelect = (genres: string[]) => {
    setActiveMoodGenres(genres);
  };

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
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
              >
                <option value="addedAt">Recently Added</option>
                <option value="myRating">Highest Rated</option>
                <option value="year">Release Year</option>
              </select>
            </div>

            <div className="pt-8 border-t border-white/5">
              <SurpriseMe entries={entries} onSelect={onSelect} />
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
            </div>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <WatchTimeline entries={entries} onSelect={onSelect} />
    </div>
  );
}
