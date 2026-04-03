import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Film, User, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (userId: string) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [userId, setUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      onLogin(userId.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-blue-500 selection:text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 p-10 rounded-[3rem] shadow-2xl space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white text-black rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-4">
              <Film className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-display leading-none">
              CineTrack
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              Enter your User ID to access your cinematic journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="ENTER USER ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold uppercase tracking-widest text-[10px] focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              Start Tracking
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-gray-600 text-[8px] font-bold uppercase tracking-[0.2em]">
            No password required. Your data is saved to this ID.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
