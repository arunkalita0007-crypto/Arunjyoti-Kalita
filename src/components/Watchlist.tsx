import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Sparkles } from 'lucide-react';
import { Entry } from '../types';
import { EntryCard } from './EntryCard';

interface WatchlistProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
}

export function Watchlist({ entries, onEdit }: WatchlistProps) {
  const watchlist = entries.filter(e => e.status === 'Want to Watch');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-white tracking-tight">Watchlist</h2>
          <p className="text-gray-400">Things you're excited to watch next</p>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            {watchlist.length} Items Pending
          </span>
        </div>
      </div>

      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {watchlist.map(entry => (
            <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <div className="h-[500px] flex flex-col items-center justify-center bg-zinc-900/30 border border-dashed border-white/5 rounded-[3rem] space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5">
            <Bookmark className="w-8 h-8 text-gray-800" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">Your watchlist is empty</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Save things you're excited to watch later</p>
          </div>
        </div>
      )}
    </div>
  );
}
