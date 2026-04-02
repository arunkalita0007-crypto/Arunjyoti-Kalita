import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Entry } from './types';
import { Trophy, Film, Calendar, Sparkles, User, LogOut, LayoutDashboard, Bookmark, Plus } from 'lucide-react';
import { cn } from './lib/utils';
import { QuickLog } from './components/QuickLog';
import { CinematicWrapped } from './components/CinematicWrapped';
import { TrophyShelf } from './components/TrophyShelf';
import { ChallengeTracker } from './components/ChallengeTracker';
import { motion, AnimatePresence } from 'motion/react';
import { DetailView } from './components/DetailView';
import { EntryForm } from './components/EntryForm';
import { STARTER_MOVIES } from './data/starterMovies';

type Tab = 'dashboard' | 'watchlist' | 'profile' | 'challenge';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('cinetrack_entries');
    return saved ? JSON.parse(saved) : STARTER_MOVIES;
  });
  const [showWrapped, setShowWrapped] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cinetrack_entries', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (newEntry: Entry) => {
    setEntries(prev => [newEntry, ...prev]);
  };

  const handleUpdateEntry = (updatedEntry: Entry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleBulkUpdate = (ids: string[], status: Entry['status']) => {
    setEntries(prev => prev.map(e => ids.includes(e.id) ? { ...e, status, watchedDate: status === 'Completed' ? new Date().toISOString() : e.watchedDate } : e));
  };

  const handleBulkDelete = (ids: string[]) => {
    setEntries(prev => prev.filter(e => !ids.includes(e.id)));
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            entries={entries} 
            onUpdate={handleUpdateEntry} 
            onDelete={handleDeleteEntry}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            onAdd={handleAddEntry}
            onEdit={handleEditEntry}
            onSelect={setSelectedEntry}
          />
        );
      case 'watchlist':
        return (
          <Dashboard 
            entries={entries} 
            onUpdate={handleUpdateEntry} 
            onDelete={handleDeleteEntry}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            onAdd={handleAddEntry}
            onEdit={handleEditEntry}
            onSelect={setSelectedEntry}
            initialFilter="Want to Watch"
          />
        );
      case 'profile':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12 space-y-24">
            <header className="flex flex-col md:flex-row items-center justify-between gap-8 bg-zinc-900/30 border border-white/5 p-12 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-1000" />
              
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-purple-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[2.2rem] bg-zinc-900 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter font-display leading-none">Cinephile Arunk</h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">Member since April 2026</p>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowWrapped(true)}
                      className="px-6 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Wrapped
                    </button>
                    <button className="px-6 py-3 bg-zinc-800 text-white border border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-700 transition-all">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-12 relative z-10">
                <div className="text-center space-y-1">
                  <span className="text-4xl font-black text-white">{entries.filter(e => e.status === 'Completed').length}</span>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Watched</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center space-y-1">
                  <span className="text-4xl font-black text-white">{entries.filter(e => e.status === 'Want to Watch').length}</span>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Watchlist</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center space-y-1">
                  <span className="text-4xl font-black text-white">{entries.filter(e => e.myRating >= 8).length}</span>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Favorites</p>
                </div>
              </div>
            </header>

            <TrophyShelf entries={entries} />
          </div>
        );
      case 'challenge':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <ChallengeTracker entries={entries} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">CT</div>
            <span className="text-xl font-black text-white uppercase tracking-tighter font-display group-hover:text-blue-500 transition-colors">CineTrack</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Feed' },
              { id: 'watchlist', icon: Bookmark, label: 'Watchlist' },
              { id: 'challenge', icon: Trophy, label: 'Challenge' },
              { id: 'profile', icon: User, label: 'Profile' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                  activeTab === tab.id 
                    ? "bg-white text-black shadow-xl scale-105" 
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:block">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <QuickLog onSave={handleAddEntry} />

      {showWrapped && (
        <CinematicWrapped entries={entries} onClose={() => setShowWrapped(false)} />
      )}

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailView 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)}
            onEdit={() => {
              handleEditEntry(selectedEntry);
              setSelectedEntry(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsFormOpen(false);
                setEditingEntry(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-4xl">
              <EntryForm 
                entry={editingEntry}
                onSave={editingEntry ? handleUpdateEntry : handleAddEntry}
                onDelete={handleDeleteEntry}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingEntry(null);
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
