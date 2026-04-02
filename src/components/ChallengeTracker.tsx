import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { Entry } from '../types';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';

interface ChallengeTrackerProps {
  entries: Entry[];
}

export function ChallengeTracker({ entries }: ChallengeTrackerProps) {
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(startOfDay(new Date()), 29 - i));
  
  const completedDates = entries
    .filter(e => e.status === 'Completed' && e.watchedDate)
    .map(e => startOfDay(new Date(e.watchedDate!)).getTime());

  const streak = entries
    .filter(e => e.status === 'Completed' && e.watchedDate)
    .sort((a, b) => new Date(b.watchedDate!).getTime() - new Date(a.watchedDate!).getTime())
    .reduce((acc, curr, idx, arr) => {
      if (idx === 0) return 1;
      const prevDate = startOfDay(new Date(arr[idx - 1].watchedDate!));
      const currDate = startOfDay(new Date(curr.watchedDate!));
      const diff = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) return acc + 1;
      return acc;
    }, 0);

  const progress = (completedDates.length / 30) * 100;

  return (
    <section className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-12 space-y-12 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-1000" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">30 Day Challenge</span>
          </div>
          <h3 className="text-5xl font-black text-white uppercase tracking-tight font-display leading-[0.9]">Can you watch 30 movies in 30 days?</h3>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Push your cinematic limits and unlock the ultimate Cinephile badge.</p>
          
          <div className="flex items-center gap-8 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-orange-500">
                <Flame className="w-5 h-5 fill-current" />
                <span className="text-3xl font-black">{streak}</span>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Streak</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-3xl font-black">{completedDates.length}</span>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Watched</p>
            </div>
          </div>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-zinc-800 fill-none"
              strokeWidth="12"
            />
            <motion.circle
              initial={{ strokeDasharray: "0 1000" }}
              animate={{ strokeDasharray: `${(progress / 100) * 690} 1000` }}
              transition={{ duration: 2, ease: "easeOut" }}
              cx="128"
              cy="128"
              r="110"
              className="stroke-blue-500 fill-none"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white">{Math.round(progress)}%</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progress</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3 relative z-10">
        {last30Days.map((day, idx) => {
          const isCompleted = completedDates.includes(day.getTime());
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-500 border",
                isCompleted 
                  ? "bg-blue-500 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white" 
                  : "bg-black/40 border-white/5 text-gray-700 hover:border-white/20"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">{format(day, 'MMM')}</span>
              <span className="text-lg font-black leading-none">{format(day, 'dd')}</span>
              {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3 opacity-20" />}
            </motion.div>
          );
        })}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-bold text-blue-100 italic leading-relaxed">
          "{streak > 0 ? `You're on a ${streak} day streak! Keep the cinematic momentum going.` : 'Start your challenge today! Every great journey begins with a single watch.'}"
        </p>
      </div>
    </section>
  );
}
