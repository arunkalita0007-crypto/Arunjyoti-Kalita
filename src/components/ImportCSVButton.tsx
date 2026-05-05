import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { parseCSV } from '../lib/csvImport';
import { Entry } from '../types';
import { cn } from '../lib/utils';

interface ImportCSVButtonProps {
  onImport: (entries: Entry[]) => void;
  className?: string;
}

export function ImportCSVButton({ onImport, className }: ImportCSVButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const entries = parseCSV(text);
      if (entries.length > 0) {
        onImport(entries);
      } else {
        alert('No valid movies found in this CSV.');
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert('Failed to read CSV file.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className={cn(
          "px-6 py-3 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10",
        )}
      >
        {isImporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        Import CSV
      </button>
    </div>
  );
}
