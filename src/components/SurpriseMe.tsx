import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Star, Play, RotateCcw } from 'lucide-react';
import { Entry } from '../types';
import { cn } from '../lib/utils';

interface SurpriseMeProps {
  entries: Entry[];
  onSelect: (entry: Entry) => void;
}

export function SurpriseMe({ entries, onSelect }: SurpriseMeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const watchlist = entries.filter(e => e.status === 'Want to Watch');

  const handleSurprise = () => {
    if (watchlist.length === 0) return;
    
    setIsRevealing(true);
    setSelectedEntry(null);
    
    // Dramatic delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * watchlist.length);
      setSelectedEntry(watchlist[randomIndex]);
      setIsRevealing(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          handleSurprise();
        }}
        disabled={watchlist.length === 0}
        className="flex items-center gap-3 px-8 py-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-500 font-black uppercase tracking-widest text-xs hover:bg-purple-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        Surprise Me
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 max-h-[90vh] overflow-y-auto p-4"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-0 right-0 md:-top-10 md:-right-10 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all z-50"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-2 md:space-y-4 pt-12 md:pt-0">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter font-display leading-none">The Cinema Oracle Speaks...</h2>
                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Choosing your next masterpiece</p>
              </div>

              <div className="relative w-48 md:w-full md:max-w-sm aspect-[2/3] shrink-0 mx-auto rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group">
                <AnimatePresence mode="wait">
                  {isRevealing ? (
                    <motion.div
                      key="revealing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-zinc-900"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-32 h-32 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
                        />
                        <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-purple-500 animate-pulse" />
                      </div>
                      <p className="text-xs font-black text-purple-500 uppercase tracking-[0.3em] animate-pulse">Consulting the archives</p>
                    </motion.div>
                  ) : selectedEntry ? (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={selectedEntry.posterUrl} 
                        alt={selectedEntry.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-12 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-yellow-500">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="text-xl font-black">{selectedEntry.imdbRating}</span>
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">{selectedEntry.title}</h3>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedEntry.genre} • {selectedEntry.year}</p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {!isRevealing && selectedEntry && (
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm relative z-10 shrink-0 pb-8">
                  <button
                    onClick={() => {
                      onSelect(selectedEntry);
                      setIsOpen(false);
                    }}
                    className="flex-1 py-4 md:py-6 bg-white text-black rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </button>
                  <button
                    onClick={handleSurprise}
                    className="flex-1 py-4 md:py-6 bg-zinc-900 text-white border border-white/10 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
