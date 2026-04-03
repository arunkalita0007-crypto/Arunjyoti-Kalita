import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Entry, Goal, CustomList } from './types';
import { Trophy, Film, Calendar, Sparkles, User, LogOut, LayoutDashboard, Bookmark, Plus, Book, Target, Globe, TrendingUp, List } from 'lucide-react';
import { cn } from './lib/utils';
import { QuickLog } from './components/QuickLog';
import { CinematicWrapped } from './components/CinematicWrapped';
import { TrophyShelf } from './components/TrophyShelf';
import { ChallengeTracker } from './components/ChallengeTracker';
import { motion, AnimatePresence } from 'motion/react';
import { DetailView } from './components/DetailView';
import { EntryForm } from './components/EntryForm';
import { MoodMusicPlayer } from './components/MoodMusicPlayer';
import { JournalModal } from './components/JournalModal';
import { MyJournal } from './components/MyJournal';
import { DailyPick } from './components/DailyPick';
import { WatchGoals } from './components/WatchGoals';
import { WorldCinemaMap } from './components/WorldCinemaMap';
import { TasteEvolution } from './components/TasteEvolution';
import { DirectorProfile } from './components/DirectorProfile';
import { WeeklyChallenge } from './components/WeeklyChallenge';
import { CustomLists } from './components/CustomLists';
import { AuthScreen } from './components/AuthScreen';
import { SAMPLE_DATA } from './sampleData';

type Tab = 'dashboard' | 'watchlist' | 'journal' | 'goals' | 'map' | 'evolution' | 'arena' | 'challenge' | 'profile' | 'lists';

export default function App() {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('cinetrack_userid'));
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [entries, setEntries] = useState<Entry[]>(SAMPLE_DATA);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [showWrapped, setShowWrapped] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [journalEntry, setJournalEntry] = useState<Entry | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null);
  const [pendingListId, setPendingListId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    if (!userId) {
      setEntries(SAMPLE_DATA);
      setGoals([]);
      setCustomLists([]);
      return;
    }

    const fetchData = async () => {
      setAuthLoading(true);
      try {
        const response = await fetch(`/api/data/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries || SAMPLE_DATA);
          setGoals(data.goals || []);
          setCustomLists(data.lists || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Save data to backend
  const saveData = async (newEntries: Entry[], newGoals: Goal[], newLists: CustomList[]) => {
    if (!userId) return;
    try {
      await fetch(`/api/data/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: newEntries, goals: newGoals, lists: newLists })
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleLogin = (id: string) => {
    localStorage.setItem('cinetrack_userid', id);
    setUserId(id);
  };

  const handleLogout = () => {
    // Final save attempt before logout
    saveData(entries, goals, customLists);
    localStorage.removeItem('cinetrack_userid');
    setUserId(null);
    setEntries(SAMPLE_DATA);
    setGoals([]);
    setCustomLists([]);
    setActiveTab('dashboard');
  };

  // Handle global director click
  useEffect(() => {
    const handleDirectorClick = (e: any) => {
      setSelectedDirector(e.detail);
    };
    window.addEventListener('cinetrack_director_click', handleDirectorClick);
    return () => window.removeEventListener('cinetrack_director_click', handleDirectorClick);
  }, []);

  const handleAddEntry = async (newEntry: Entry) => {
    if (!userId) return;
    const entryWithId = { ...newEntry, id: Math.random().toString(36).substr(2, 9) };
    const newEntries = [entryWithId, ...entries];
    setEntries(newEntries);
    saveData(newEntries, goals, customLists);
    
    if (pendingListId) {
      handleToggleEntryInList(pendingListId, entryWithId.id);
      setPendingListId(null);
    }
  };

  const handleUpdateEntry = async (updatedEntry: Entry) => {
    if (!userId) return;
    const newEntries = entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    setEntries(newEntries);
    saveData(newEntries, goals, customLists);
    
    setIsFormOpen(false);
    setEditingEntry(null);

    const oldEntry = entries.find(e => e.id === updatedEntry.id);
    if (oldEntry?.status !== 'Completed' && updatedEntry.status === 'Completed') {
      setJournalEntry(updatedEntry);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!userId) return;
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    saveData(newEntries, goals, customLists);
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleAddGoal = async (goal: Goal) => {
    if (!userId) return;
    let newGoals;
    if (goal.id && goals.some(g => g.id === goal.id)) {
      newGoals = goals.map(g => g.id === goal.id ? goal : g);
    } else {
      newGoals = [...goals, { ...goal, id: Math.random().toString(36).substr(2, 9) }];
    }
    setGoals(newGoals);
    saveData(entries, newGoals, customLists);
  };

  const handleDeleteGoal = async (id: string) => {
    if (!userId) return;
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    saveData(entries, newGoals, customLists);
  };

  const handleBulkUpdate = async (ids: string[], status: Entry['status']) => {
    if (!userId) return;
    const newEntries = entries.map(e => {
      if (ids.includes(e.id)) {
        return {
          ...e,
          status,
          watchedDate: status === 'Completed' ? new Date().toISOString() : e.watchedDate
        };
      }
      return e;
    });
    setEntries(newEntries);
    saveData(newEntries, goals, customLists);

    const newlyCompleted = entries.find(e => ids.includes(e.id) && status === 'Completed');
    if (newlyCompleted) {
      setJournalEntry({ ...newlyCompleted, status, watchedDate: new Date().toISOString() });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!userId) return;
    const newEntries = entries.filter(e => !ids.includes(e.id));
    setEntries(newEntries);
    saveData(newEntries, goals, customLists);
  };

  const handleAddList = async (list: CustomList) => {
    if (!userId) return;
    const newList = { ...list, id: Math.random().toString(36).substr(2, 9) };
    const newLists = [...customLists, newList];
    setCustomLists(newLists);
    saveData(entries, goals, newLists);
  };

  const handleDeleteList = async (id: string) => {
    if (!userId) return;
    const newLists = customLists.filter(l => l.id !== id);
    setCustomLists(newLists);
    saveData(entries, goals, newLists);
  };

  const handleUpdateList = async (updatedList: CustomList) => {
    if (!userId) return;
    const newLists = customLists.map(l => l.id === updatedList.id ? updatedList : l);
    setCustomLists(newLists);
    saveData(entries, goals, newLists);
  };

  const handleToggleEntryInList = async (listId: string, entryId: string) => {
    if (!userId) return;
    const list = customLists.find(l => l.id === listId);
    if (!list) return;

    const isInList = list.entryIds.includes(entryId);
    const newEntryIds = isInList 
      ? list.entryIds.filter(id => id !== entryId)
      : [...list.entryIds, entryId];

    const newLists = customLists.map(l => l.id === listId ? { ...l, entryIds: newEntryIds } : l);
    setCustomLists(newLists);
    saveData(entries, goals, newLists);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setPendingListId(null);
    setIsFormOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const handleSeedData = async () => {
    if (!userId || isSeeding) return;
    setIsSeeding(true);
    try {
      const seededEntries = SAMPLE_DATA.map(entry => ({
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        addedAt: new Date().toISOString()
      }));
      const newEntries = [...seededEntries, ...entries];
      setEntries(newEntries);
      saveData(newEntries, goals, customLists);
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12">
            <DailyPick 
              entries={entries} 
              onStartWatching={(entry) => handleUpdateEntry({ ...entry, status: 'Watching' })}
              onSelect={setSelectedEntry}
            />
            <Dashboard 
              entries={entries} 
              onUpdate={handleUpdateEntry} 
              onDelete={handleDeleteEntry}
              onBulkUpdate={handleBulkUpdate}
              onBulkDelete={handleBulkDelete}
              onAdd={handleAddEntry}
              onEdit={handleEditEntry}
              onSelect={setSelectedEntry}
              onSeed={handleSeedData}
              isSeeding={isSeeding}
            />
          </div>
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
            onSeed={handleSeedData}
            isSeeding={isSeeding}
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
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter font-display leading-none">{userId}</h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">Logged in as {userId}</p>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowWrapped(true)}
                      className="px-6 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Wrapped
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-6 py-3 bg-zinc-800 text-white border border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-700 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                    {entries.length === 0 && (
                      <button 
                        onClick={handleSeedData}
                        disabled={isSeeding}
                        className="px-6 py-3 bg-purple-500/20 text-purple-500 border border-purple-500/30 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {isSeeding ? (
                          <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                        ) : (
                          <Film className="w-4 h-4" />
                        )}
                        {isSeeding ? 'Loading...' : 'Load Sample Data'}
                      </button>
                    )}
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
      case 'journal':
        return <MyJournal entries={entries} onSelect={setSelectedEntry} />;
      case 'goals':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <WatchGoals 
              entries={entries} 
              goals={goals} 
              onAddGoal={handleAddGoal} 
              onDeleteGoal={handleDeleteGoal} 
            />
          </div>
        );
      case 'map':
        return <WorldCinemaMap entries={entries} onSelect={setSelectedEntry} />;
      case 'evolution':
        return <TasteEvolution entries={entries} />;
      case 'lists':
        return (
          <CustomLists 
            entries={entries} 
            lists={customLists}
            onAddList={handleAddList}
            onDeleteList={handleDeleteList}
            onUpdateList={handleUpdateList}
            onSelectEntry={setSelectedEntry}
            onUpdateEntry={handleUpdateEntry}
            onEditEntry={handleEditEntry}
            onToggleEntryInList={handleToggleEntryInList}
            onAddNew={(listId) => {
              setPendingListId(listId);
              setIsFormOpen(true);
            }}
          />
        );
      case 'arena':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <WeeklyChallenge entries={entries} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500 selection:text-white flex">
      {/* Sidebar Navigation */}
      <aside className="fixed top-0 left-0 bottom-0 w-20 lg:w-64 bg-black/80 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col">
        <div className="p-6 flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 bg-white text-black rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">CT</div>
          <span className="hidden lg:block text-xl font-black text-white uppercase tracking-tighter font-display group-hover:text-blue-500 transition-colors">CineTrack</span>
        </div>

        <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Feed' },
            { id: 'watchlist', icon: Bookmark, label: 'Watchlist' },
            { id: 'lists', icon: List, label: 'Lists' },
            { id: 'journal', icon: Book, label: 'Journal' },
            { id: 'goals', icon: Target, label: 'Goals' },
            { id: 'map', icon: Globe, label: 'Map' },
            { id: 'evolution', icon: TrendingUp, label: 'Evolution' },
            { id: 'arena', icon: Trophy, label: 'Arena' },
            { id: 'challenge', icon: Calendar, label: '30 Day' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                activeTab === tab.id 
                  ? "bg-white text-black shadow-xl scale-105" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 space-y-4">
          <button
            onClick={() => {
              setEditingEntry(null);
              setPendingListId(null);
              setIsFormOpen(true);
            }}
            className="w-full h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <Plus className="w-6 h-6" />
            <span className="hidden lg:block font-black uppercase tracking-widest text-[10px]">Add New</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 text-gray-500 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/5"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-20 lg:ml-64">
        <main className="pb-32">
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
      </div>

      <QuickLog onSave={handleAddEntry} />
      <MoodMusicPlayer />

      <AnimatePresence>
        {journalEntry && (
          <JournalModal 
            entry={journalEntry} 
            onSave={(updated) => {
              handleUpdateEntry(updated);
              setJournalEntry(null);
            }}
            onClose={() => setJournalEntry(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDirector && (
          <DirectorProfile 
            directorName={selectedDirector} 
            entries={entries} 
            onClose={() => setSelectedDirector(null)}
            onAddEntry={handleAddEntry}
            onSelectDirector={setSelectedDirector}
          />
        )}
      </AnimatePresence>

      {showWrapped && (
        <CinematicWrapped entries={entries} onClose={() => setShowWrapped(false)} />
      )}

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailView 
            entry={selectedEntry} 
            lists={customLists}
            onClose={() => setSelectedEntry(null)}
            onEdit={() => {
              handleEditEntry(selectedEntry);
              setSelectedEntry(null);
            }}
            onToggleList={handleToggleEntryInList}
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
