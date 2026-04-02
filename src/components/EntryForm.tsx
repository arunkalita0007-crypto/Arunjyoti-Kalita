import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  Trash2, 
  Image as ImageIcon,
  Star,
  Info,
  Plus,
  Tag,
  History,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Entry, EntertainmentType, Status, Platform, Mood, BasedOn, WatchSession } from '../types';
import { 
  TYPE_OPTIONS, 
  STATUS_OPTIONS, 
  PLATFORM_OPTIONS, 
  MOOD_OPTIONS, 
  BASED_ON_OPTIONS,
  GENRES,
  NANO_GENRES,
  POPULAR_TAGS,
  POPULAR_COUNTRIES
} from '../constants';
import { cn } from '../lib/utils';
import { StarRating } from './StarRating';

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
    nanoGenres: [],
    tags: [],
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
    watchHistory: [],
    ...entry
  });

  const [newTag, setNewTag] = useState('');

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

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (cleanTag && !formData.tags?.includes(cleanTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), cleanTag]
      }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }));
  };

  const toggleNanoGenre = (genre: string) => {
    setFormData(prev => {
      const current = prev.nanoGenres || [];
      if (current.includes(genre)) {
        return { ...prev, nanoGenres: current.filter(g => g !== genre) };
      }
      return { ...prev, nanoGenres: [...current, genre] };
    });
  };

  const handleAddWatchSession = () => {
    const newSession: WatchSession = {
      date: new Date().toISOString(),
      rating: formData.myRating || 0,
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      watchHistory: [...(prev.watchHistory || []), newSession]
    }));
  };

  const handleRemoveWatchSession = (index: number) => {
    setFormData(prev => ({
      ...prev,
      watchHistory: prev.watchHistory?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCompleted = formData.status === 'Completed';
    const wasCompleted = entry?.status === 'Completed';
    
    const finalEntry = {
      ...formData,
      id: entry?.id || Math.random().toString(36).substr(2, 9),
      addedAt: entry?.addedAt || new Date().toISOString(),
      watchedDate: isCompleted && !wasCompleted 
        ? new Date().toISOString() 
        : (isCompleted ? entry?.watchedDate : undefined)
    } as Entry;

    // If marking as completed for the first time, add to history
    if (isCompleted && !wasCompleted && (!finalEntry.watchHistory || finalEntry.watchHistory.length === 0)) {
      finalEntry.watchHistory = [{
        date: new Date().toISOString(),
        rating: finalEntry.myRating,
        notes: finalEntry.review
      }];
    }

    onSave(finalEntry);
  };

  const openJustWatch = () => {
    const query = encodeURIComponent(formData.title || '');
    window.open(`https://www.justwatch.com/in/search?q=${query}`, '_blank');
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
              <div className="relative">
                <input 
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Inception"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold tracking-wide"
                />
                <button
                  type="button"
                  onClick={openJustWatch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                >
                  <MapPin className="w-3 h-3 text-neon-blue" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Find Where to Watch</span>
                </button>
              </div>
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
                <div className="flex flex-col items-center justify-center p-6 space-y-4 w-full h-full">
                  <ImageIcon className="w-10 h-10 text-zinc-800" />
                  <div className="w-full px-6 space-y-2">
                    <input 
                      type="text"
                      name="posterUrl"
                      value={formData.posterUrl || ''}
                      onChange={handleChange}
                      placeholder="Paste Image URL"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white focus:outline-none focus:border-neon-blue/50 transition-all text-center"
                    />
                    <p className="text-[8px] font-black text-gray-600 text-center uppercase tracking-widest">Enter a direct image link</p>
                  </div>
                </div>
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
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Country</label>
            <input 
              list="popular-countries"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g. South Korea"
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
            <datalist id="popular-countries">
              {POPULAR_COUNTRIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Language</label>
            <input 
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="e.g. Korean"
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Platform (India)</label>
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

        {/* Nano Genres */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Nano Genres <Star className="w-3 h-3 text-neon-purple" />
          </label>
          <div className="flex flex-wrap gap-2">
            {NANO_GENRES.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleNanoGenre(genre)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  formData.nanoGenres?.includes(genre)
                    ? "bg-neon-purple/20 border-neon-purple text-neon-purple"
                    : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Tags & Keywords <Tag className="w-3 h-3 text-neon-blue" />
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.tags?.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1.5 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                #{tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <input 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newTag))}
              placeholder="Add custom tag... (e.g. mindbending)"
              className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue/50 transition-all font-bold"
            />
            <button
              type="button"
              onClick={() => handleAddTag(newTag)}
              className="px-6 bg-neon-blue/20 text-neon-blue rounded-2xl border border-neon-blue/30 hover:bg-neon-blue hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.filter(t => !formData.tags?.includes(t)).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="px-3 py-1 text-[8px] font-black text-gray-500 uppercase tracking-widest hover:text-neon-blue transition-colors"
              >
                #{tag}
              </button>
            ))}
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
            <div className="h-[58px] flex items-center px-4 bg-black/40 border border-white/5 rounded-2xl">
              <StarRating 
                rating={formData.myRating || 0} 
                interactive 
                onChange={(r) => setFormData(prev => ({ ...prev, myRating: r }))} 
              />
            </div>
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

        {/* Rewatch Tracking */}
        {formData.status === 'Completed' && (
          <div className="space-y-6 bg-zinc-900/30 p-10 rounded-[2rem] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-neon-green" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Watch History</h3>
              </div>
              <button
                type="button"
                onClick={handleAddWatchSession}
                className="px-6 py-3 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neon-green hover:text-white transition-all"
              >
                Log Rewatch
              </button>
            </div>

            <div className="space-y-4">
              {formData.watchHistory?.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <StarRating rating={session.rating} size={14} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveWatchSession(index)}
                    className="p-2 text-gray-600 hover:text-neon-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.watchHistory || formData.watchHistory.length === 0) && (
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center py-4 italic">
                  No rewatches logged yet
                </p>
              )}
            </div>
          </div>
        )}

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
