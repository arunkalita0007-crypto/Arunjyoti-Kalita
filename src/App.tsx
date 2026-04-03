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
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';

type Tab = 'dashboard' | 'watchlist' | 'journal' | 'goals' | 'map' | 'evolution' | 'arena' | 'challenge' | 'profile' | 'lists';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [showWrapped, setShowWrapped] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [journalEntry, setJournalEntry] = useState<Entry | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null);
  const [pendingListId, setPendingListId] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listeners
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setGoals([]);
      setCustomLists([]);
      return;
    }

    const qEntries = query(collection(db, 'entries'), where('userId', '==', user.uid));
    const unsubEntries = onSnapshot(qEntries, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Entry));
      setEntries(data.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()));
    });

    const qGoals = query(collection(db, 'goals'), where('userId', '==', user.uid));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Goal));
      setGoals(data);
    });

    const qLists = query(collection(db, 'lists'), where('userId', '==', user.uid));
    const unsubLists = onSnapshot(qLists, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CustomList));
      setCustomLists(data);
    });

    return () => {
      unsubEntries();
      unsubGoals();
      unsubLists();
    };
  }, [user]);

  // Handle global director click
  useEffect(() => {
    const handleDirectorClick = (e: any) => {
      setSelectedDirector(e.detail);
    };
    window.addEventListener('cinetrack_director_click', handleDirectorClick);
    return () => window.removeEventListener('cinetrack_director_click', handleDirectorClick);
  }, []);

  const handleAddEntry = async (newEntry: Entry) => {
    if (!user) return;
    try {
      const { id, ...entryData } = newEntry;
      const docRef = await addDoc(collection(db, 'entries'), {
        ...entryData,
        userId: user.uid
      });
      
      if (pendingListId) {
        handleToggleEntryInList(pendingListId, docRef.id);
        setPendingListId(null);
      }
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  const handleUpdateEntry = async (updatedEntry: Entry) => {
    if (!user) return;
    try {
      const { id, ...entryData } = updatedEntry;
      const docRef = doc(db, 'entries', id);
      await updateDoc(docRef, { ...entryData });
      
      setIsFormOpen(false);
      setEditingEntry(null);

      const oldEntry = entries.find(e => e.id === id);
      if (oldEntry?.status !== 'Completed' && updatedEntry.status === 'Completed') {
        setJournalEntry(updatedEntry);
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'entries', id));
      setIsFormOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleAddGoal = async (goal: Goal) => {
    if (!user) return;
    try {
      const { id, ...goalData } = goal;
      if (id && goals.some(g => g.id === id)) {
        await updateDoc(doc(db, 'goals', id), { ...goalData });
      } else {
        await addDoc(collection(db, 'goals'), {
          ...goalData,
          userId: user.uid
        });
      }
    } catch (error) {
      console.error("Error adding/updating goal:", error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleBulkUpdate = async (ids: string[], status: Entry['status']) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const docRef = doc(db, 'entries', id);
        batch.update(docRef, { 
          status, 
          watchedDate: status === 'Completed' ? new Date().toISOString() : entries.find(e => e.id === id)?.watchedDate 
        });
      });
      await batch.commit();

      const newlyCompleted = entries.find(e => ids.includes(e.id) && status === 'Completed');
      if (newlyCompleted) {
        setJournalEntry({ ...newlyCompleted, status, watchedDate: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Error bulk updating:", error);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, 'entries', id));
      });
      await batch.commit();
    } catch (error) {
      console.error("Error bulk deleting:", error);
    }
  };

  const handleAddList = async (list: CustomList) => {
    if (!user) return;
    try {
      const { id, ...listData } = list;
      await addDoc(collection(db, 'lists'), {
        ...listData,
        userId: user.uid
      });
    } catch (error) {
      console.error("Error adding list:", error);
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'lists', id));
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleUpdateList = async (updatedList: CustomList) => {
    if (!user) return;
    try {
      const { id, ...listData } = updatedList;
      await updateDoc(doc(db, 'lists', id), { ...listData });
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const handleToggleEntryInList = async (listId: string, entryId: string) => {
    if (!user) return;
    try {
      const list = customLists.find(l => l.id === listId);
      if (!list) return;

      const isInList = list.entryIds.includes(entryId);
      const newEntryIds = isInList 
        ? list.entryIds.filter(id => id !== entryId)
        : [...list.entryIds, entryId];

      await updateDoc(doc(db, 'lists', listId), { entryIds: newEntryIds });
    } catch (error) {
      console.error("Error toggling entry in list:", error);
    }
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

  if (!user) {
    return <AuthScreen />;
  }

  const handleMigrateData = async () => {
    const localEntries = localStorage.getItem('cinetrack_entries');
    const localGoals = localStorage.getItem('cinetrack_goals');
    const localLists = localStorage.getItem('cinetrack_lists');

    if (localEntries) {
      const entries = JSON.parse(localEntries) as Entry[];
      const batch = writeBatch(db);
      entries.forEach(entry => {
        const { id, ...data } = entry;
        const docRef = doc(collection(db, 'entries'));
        batch.set(docRef, { ...data, userId: user.uid });
      });
      await batch.commit();
      localStorage.removeItem('cinetrack_entries');
    }

    if (localGoals) {
      const goals = JSON.parse(localGoals) as Goal[];
      const batch = writeBatch(db);
      goals.forEach(goal => {
        const { id, ...data } = goal;
        const docRef = doc(collection(db, 'goals'));
        batch.set(docRef, { ...data, userId: user.uid });
      });
      await batch.commit();
      localStorage.removeItem('cinetrack_goals');
    }

    if (localLists) {
      const lists = JSON.parse(localLists) as CustomList[];
      const batch = writeBatch(db);
      lists.forEach(list => {
        const { id, ...data } = list;
        const docRef = doc(collection(db, 'lists'));
        batch.set(docRef, { ...data, userId: user.uid });
      });
      await batch.commit();
      localStorage.removeItem('cinetrack_lists');
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
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter font-display leading-none">{user.displayName || 'Cinephile'}</h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">Member since {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowWrapped(true)}
                      className="px-6 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Wrapped
                    </button>
                    <button 
                      onClick={() => signOut(auth)}
                      className="px-6 py-3 bg-zinc-800 text-white border border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-700 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                    {(localStorage.getItem('cinetrack_entries') || localStorage.getItem('cinetrack_goals') || localStorage.getItem('cinetrack_lists')) && (
                      <button 
                        onClick={handleMigrateData}
                        className="px-6 py-3 bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        Migrate Local Data
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
              onClick={() => {
                setEditingEntry(null);
                setPendingListId(null);
                setIsFormOpen(true);
              }}
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
