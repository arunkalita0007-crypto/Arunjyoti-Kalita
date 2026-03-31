import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { Stats } from './components/Stats';
import { Watchlist } from './components/Watchlist';
import { Profile } from './components/Profile';
import { Entry } from './types';
import { SAMPLE_DATA } from './sampleData';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('cinetrack_entries');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cinetrack_entries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = (entry: Entry) => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    } else {
      setEntries(prev => [entry, ...prev]);
    }
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will delete your entire library.')) {
      setEntries([]);
      setActiveTab('dashboard');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard entries={entries} onEdit={handleEditEntry} />;
      case 'add':
        return (
          <div className="pt-10">
            <EntryForm 
              onSave={handleSaveEntry} 
              onCancel={() => setActiveTab('dashboard')} 
            />
          </div>
        );
      case 'stats':
        return <Stats entries={entries} />;
      case 'watchlist':
        return <Watchlist entries={entries} onEdit={handleEditEntry} />;
      case 'profile':
        return <Profile entries={entries} onReset={handleResetData} />;
      default:
        return <Dashboard entries={entries} onEdit={handleEditEntry} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-blue-500 selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} entries={entries} />
      
      <main className="flex-1 px-12 pt-12 overflow-y-auto h-screen custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Modal for Editing */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
                  onSave={handleSaveEntry}
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
      </main>
    </div>
  );
}
