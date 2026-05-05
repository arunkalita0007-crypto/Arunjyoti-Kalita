import { Entry } from '../types';

const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const parseCSV = (csvText: string): Entry[] => {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Skip header
  const dataLines = lines.slice(1);
  const entries: Entry[] = [];

  for (const line of dataLines) {
    const cols = parseCSVLine(line);
    if (cols.length < 5) continue; // Skip malformed lines

    // Map columns back to Entry fields
    const statusMap: any = {
      'Watched': 'Completed',
      'Watching': 'Watching',
      'Want to Watch': 'Want to Watch'
    };

    // Date parsing: DD-MM-YYYY to ISO
    const parseDate = (dateStr: string) => {
      if (!dateStr) return undefined;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
      }
      return undefined;
    };

    const entry: Entry = {
      id: Math.random().toString(36).substr(2, 9),
      status: statusMap[cols[0]] || 'Completed',
      title: cols[1],
      type: (cols[2] as any) || 'Movie',
      year: parseInt(cols[3]) || new Date().getFullYear(),
      director: cols[4] || '',
      genre: cols[5] || '',
      subGenre: cols[6] || undefined,
      leadActor: cols[7] || undefined,
      leadActress: cols[8] || undefined,
      supportingActor: cols[9] || undefined,
      country: cols[11] || '',
      language: cols[12] || '',
      runtime: parseInt(cols[13]) || 120,
      imdbRating: parseFloat(cols[14]) || 0,
      myRating: parseFloat(cols[15]) || undefined,
      watchedDate: parseDate(cols[16]),
      rewatchable: cols[17] === 'Yes',
      mood: cols[18] || undefined,
      oscarEmmyWins: parseInt(cols[19]) || undefined,
      basedOn: cols[20] || undefined,
      franchise: cols[21] || undefined,
      review: cols[24] || undefined,
      journalNotes: cols[25] || undefined,
      memorableQuote: cols[26] || undefined,
      journalMood: (cols[27] as any) || undefined,
      recommend: cols[28] === 'Yes',
      platform: cols[30] || undefined,
      tags: cols[31] ? cols[31].split(',').map(t => t.trim()) : [],
      addedAt: parseDate(cols[33]) || new Date().toISOString()
    };

    entries.push(entry);
  }
  return entries;
};
