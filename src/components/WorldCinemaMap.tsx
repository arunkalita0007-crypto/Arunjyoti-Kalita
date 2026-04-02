import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, X, Film, Star, TrendingUp, Map as MapIcon, ChevronRight, Sparkles } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Entry } from '../types';
import { cn } from '../lib/utils';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldCinemaMapProps {
  entries: Entry[];
  onSelect: (entry: Entry) => void;
}

export function WorldCinemaMap({ entries, onSelect }: WorldCinemaMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");

  const countryStats = useMemo(() => {
    const stats: Record<string, Entry[]> = {};
    entries.filter(e => e.status === 'Completed').forEach(entry => {
      const country = entry.country;
      if (!stats[country]) stats[country] = [];
      stats[country].push(entry);
    });
    return stats;
  }, [entries]);

  const totalCountries = Object.keys(countryStats).length;
  const mostWatchedCountry = Object.entries(countryStats)
    .sort((a, b) => (b[1] as Entry[]).length - (a[1] as Entry[]).length)[0]?.[0] || 'N/A';
  
  const worldCinemaPercent = Math.round((totalCountries / 195) * 100);

  const getCountryColor = (count: number) => {
    if (count === 0) return "#18181b";
    if (count < 3) return "#3b82f640";
    if (count < 10) return "#3b82f680";
    return "#3b82f6";
  };

  const countryEntries = selectedCountry ? countryStats[selectedCountry] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter font-display">World Cinema Explorer</h1>
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] ml-16">
          Mapping your cinematic journey across the globe
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Map Section */}
        <div className="lg:col-span-3 bg-zinc-900/30 border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group min-h-[600px]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 w-full h-full">
            <ComposableMap projectionConfig={{ scale: 200 }}>
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties.name;
                      const count = countryStats[countryName]?.length || 0;
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => setTooltipContent(`${countryName}: ${count} watched`)}
                          onMouseLeave={() => setTooltipContent("")}
                          onClick={() => setSelectedCountry(countryName)}
                          style={{
                            default: {
                              fill: getCountryColor(count),
                              outline: "none",
                              stroke: "#ffffff10",
                              strokeWidth: 0.5,
                              transition: "all 0.3s"
                            },
                            hover: {
                              fill: "#3b82f6",
                              outline: "none",
                              cursor: "pointer"
                            },
                            pressed: {
                              fill: "#2563eb",
                              outline: "none"
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            
            {tooltipContent && (
              <div className="absolute bottom-8 left-8 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                {tooltipContent}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Stats & Country Details */}
        <aside className="space-y-8">
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Global Stats</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                  <p className="text-3xl font-black text-white">{totalCountries}</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Countries Explored</p>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                  <p className="text-xl font-black text-white truncate">{mostWatchedCountry}</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Most Watched</p>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-white">{worldCinemaPercent}%</p>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">World Cinema Coverage</p>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${worldCinemaPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Suggestions</h3>
              </div>
              <div className="space-y-3">
                {['South Korea', 'France', 'Japan', 'Brazil'].filter(c => !countryStats[c]).map(country => (
                  <div key={country} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 group hover:bg-black/40 transition-all cursor-pointer">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white">{country}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Country Detail Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCountry(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-zinc-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <MapIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight font-display">{selectedCountry}</h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{countryEntries.length} titles watched</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCountry(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                {countryEntries.length > 0 ? (
                  countryEntries.map(entry => (
                    <div 
                      key={entry.id} 
                      onClick={() => {
                        onSelect(entry);
                        setSelectedCountry(null);
                      }}
                      className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5 group hover:bg-black/60 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-16 rounded-lg overflow-hidden border border-white/10">
                          <img src={entry.posterUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white uppercase tracking-tight">{entry.title}</h4>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{entry.year} • {entry.genre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-black text-yellow-500">{entry.myRating}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <Film className="w-12 h-12 text-gray-700 mx-auto" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No titles watched from this country yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
