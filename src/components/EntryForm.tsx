import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Save, 
  Trash2, 
  Image as ImageIcon,
  Star,
  Info
} from 'lucide-react';
import { Entry, EntertainmentType, Status, Platform, Mood, BasedOn } from '../types';
import { 
  TYPE_OPTIONS, 
  STATUS_OPTIONS, 
  PLATFORM_OPTIONS, 
  MOOD_OPTIONS, 
  BASED_ON_OPTIONS,
  GENRES
} from '../constants';
import { cn } from '../lib/utils';

interface EntryFormProps {
  entry?: Entry | null;
  onSave: (entry: Entry) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

export function EntryForm({ entry, onSave, onDelete, onCancel }: EntryFormProps) {
  const [formData, setFormData] = useState<Partial<Entry>>({
    title: '',
    type: 'Movie',
    year: new Date().getFullYear(),
    director: '',
    genre: 'Action',
    subGenre: '',
    leadActor: '',
    leadActress: '',
    supportingActor: '',
    platform: 'Netflix',
    country: '',
    language: '',
    runtime: 0,
    episodesWatched: 0,
    imdbRating: 0,
    myRating: 0,
    status: 'Want to Watch',
    rewatchable: false,
    mood: 'Anytime',
    basedOn: 'Original',
    review: '',
    posterUrl: '',
    ...entry
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'number') {
      val = value === '' ? '' : parseFloat(value);
      if (isNaN(val as number) && value !== '') val = 0;
    }
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCompleted = formData.status === 'Completed';
    const wasCompleted = entry?.status === 'Completed';
    
    onSave({
      ...formData,
      id: entry?.id || Math.random().toString(36).substr(2, 9),
      addedAt: entry?.addedAt || new Date().toISOString(),
      watchedDate: isCompleted && !wasCompleted 
        ? new Date().toISOString() 
        : (isCompleted ? entry?.watchedDate : undefined)
    } as Entry);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto bg-black/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
    >
      <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-neon-blue/10 to-neon-purple/10">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter font-display">
            {entry ? 'Edit Masterpiece' : 'Add New Masterpiece'}
          </h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">
            Curate your personal cinematic universe
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="p-3 rounded-2xl hover:bg-white/10 text-gray-400 transition-all hover:rotate-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Title</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Interstellar"
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold tracking-wide"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Type</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all appearance-none font-bold"
                >
                  {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Year</label>
                <input 
                  type="number"
                  name="year"
                  value={formData.year ?? ''}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Poster URL</label>
            <div className="aspect-[2/3] bg-zinc-900/50 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-neon-blue/30">
              {formData.posterUrl ? (
                <>
                  <img src={formData.posterUrl} className="w-full h-full object-cover" alt="Poster" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, posterUrl: '' }))}
                      className="p-3 bg-neon-red/20 text-neon-red rounded-2xl border border-neon-red/30 hover:bg-neon-red hover:text-white transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-zinc-800 mb-3" />
                  <input 
                    type="text"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleChange}
                    placeholder="Paste URL"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-[10px] font-black text-gray-600 text-center px-6 uppercase tracking-widest">Click to add poster</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Director / Creator</label>
            <input 
              name="director"
              value={formData.director}
              onChange={handleChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Genre</label>
            <select 
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            >
              {GENRES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Platform</label>
            <select 
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            >
              {PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {/* Cast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Lead Actor</label>
            <input 
              name="leadActor"
              value={formData.leadActor}
              onChange={handleChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Lead Actress</label>
            <input 
              name="leadActress"
              value={formData.leadActress}
              onChange={handleChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Supporting Actor</label>
            <input 
              name="supportingActor"
              value={formData.supportingActor}
              onChange={handleChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
          </div>
        </div>

        {/* Ratings & Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 bg-zinc-900/30 p-10 rounded-[2rem] border border-white/5">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              IMDb Rating <Info className="w-3 h-3" />
            </label>
            <input 
              type="number"
              step="0.1"
              name="imdbRating"
              value={formData.imdbRating ?? ''}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              My Rating <Star className="w-3 h-3 text-neon-yellow fill-neon-yellow" />
            </label>
            <input 
              type="number"
              step="0.5"
              max="10"
              name="myRating"
              value={formData.myRating ?? ''}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</label>
            <div className="flex gap-3">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: opt }))}
                  className={cn(
                    "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    formData.status === opt 
                      ? "bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_20px_rgba(0,242,255,0.2)]" 
                      : "bg-black/40 border-white/5 text-gray-600 hover:border-white/20"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Series Specific */}
        {(formData.type === 'Web Series' || formData.type === 'Sitcom' || formData.type === 'Anime') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Seasons</label>
              <input 
                type="number"
                name="totalSeasons"
                value={formData.totalSeasons ?? ''}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Episodes</label>
              <input 
                type="number"
                name="totalEpisodes"
                value={formData.totalEpisodes ?? ''}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Episodes Watched</label>
              <input 
                type="number"
                name="episodesWatched"
                value={formData.episodesWatched ?? ''}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
              />
            </div>
          </div>
        )}

        {/* Review */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">My One-Line Review</label>
          <textarea 
            name="review"
            value={formData.review}
            onChange={handleChange}
            rows={3}
            placeholder="What did you think about it?"
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all resize-none font-bold"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-10 border-t border-white/5 flex items-center justify-between">
          {entry && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-neon-red/10 text-neon-red hover:bg-neon-red hover:text-white transition-all font-black uppercase tracking-widest text-[10px] border border-neon-red/20"
            >
              <Trash2 className="w-4 h-4" /> Delete Masterpiece
            </button>
          ) : <div />}
          
          <div className="flex gap-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 rounded-2xl bg-white/5 text-gray-500 hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-black hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Save className="w-4 h-4" /> {entry ? 'Update Collection' : 'Add to Collection'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
