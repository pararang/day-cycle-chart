// File parsing — turn an uploaded CSV/Excel file into raw schedule rows.
// CSV and Excel are two adapters that both funnel into one column resolver, so
// header matching behaves identically regardless of format. See CONTEXT.md.

import { Activity } from './schedule';

// Column header aliases, all matched case-insensitively after trimming.
const ACTIVITY_KEYS = ['activity', 'label'];
const START_KEY = 'start';
const END_KEY = 'end';

type RawRow = Record<string, unknown>;

// Lowercase + trim every key of a row so header matching is case-insensitive.
const normalizeKeys = (row: RawRow): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key.trim().toLowerCase()] = value == null ? '' : String(value).trim();
  }
  return out;
};

// Resolve raw rows (from either format) into Activities. Validates that the
// required columns are present once, up front, and throws the same descriptive
// error for either format. Rows with a blank required cell are dropped.
export const rowsToActivities = (rows: RawRow[]): Activity[] => {
  if (rows.length === 0) return [];

  const normalized = rows.map(normalizeKeys);
  const available = new Set(Object.keys(normalized[0]));

  const activityKey = ACTIVITY_KEYS.find((k) => available.has(k));
  if (!available.has(START_KEY) || !available.has(END_KEY) || !activityKey) {
    throw new Error('Required columns not found. Expected: start, end, activity/label');
  }

  return normalized
    .map((row) => ({
      activity: row[activityKey],
      start: row[START_KEY],
      end: row[END_KEY],
    }))
    .filter((item) => item.activity && item.start && item.end);
};

// Parse CSV text into raw rows (header line maps each value to its column).
const csvToRows = (text: string): RawRow[] => {
  const lines = text.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: RawRow = {};
    headers.forEach((header, i) => {
      row[header] = values[i];
    });
    return row;
  });
};

const readFile = (file: File, mode: 'text' | 'binary'): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    if (mode === 'text') reader.readAsText(file);
    else reader.readAsBinaryString(file);
  });

// Read an uploaded file and parse it into raw schedule rows. CSV is split
// directly; everything else is read as a workbook. Both paths share the same
// column resolver.
export const parseActivityFile = async (file: File): Promise<Activity[]> => {
  if (file.name.endsWith('.csv')) {
    const text = await readFile(file, 'text');
    return rowsToActivities(csvToRows(text));
  }

  // Loaded on demand: xlsx is large and only needed for non-CSV uploads, so
  // keep it out of the initial bundle.
  const XLSX = await import('xlsx');
  const data = await readFile(file, 'binary');
  const workbook = XLSX.read(data, { type: 'binary' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet) as RawRow[];
  return rowsToActivities(rows);
};
