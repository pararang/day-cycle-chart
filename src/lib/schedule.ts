// Schedule core — pure transform from raw schedule rows to chart-ready facts.
// No React, no SVG. See CONTEXT.md for the domain vocabulary.

export interface Activity {
  activity: string;
  start: string;
  end: string;
}

export interface ProcessedActivity {
  name: string;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  zone: 'inner' | 'outer';
}

// "HH:MM" / "HH.MM", with optional minutes (a bare "9" means 9:00).
const TIME_PATTERN = /^(\d{1,2})(?:[:.](\d{1,2}))?$/;

// Parse a 24-hour time to minutes since midnight, or null if it isn't valid.
const parseTime = (timeStr: string): number | null => {
  if (typeof timeStr !== 'string') return null;

  const match = timeStr.trim().match(TIME_PATTERN);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

// Day ring runs 6AM–6PM; everything else is the night ring.
const getZone = (timeMinutes: number): 'inner' | 'outer' => {
  const hour = Math.floor(timeMinutes / 60);
  return hour >= 6 && hour < 18 ? 'inner' : 'outer';
};

// Turn raw schedule rows into chart-ready schedule facts. Rows with an
// unparseable time, or with equal start and end, are dropped — callers detect
// this via the difference between input and output length.
export const processActivities = (rawActivities: Activity[]): ProcessedActivity[] => {
  const processed: ProcessedActivity[] = [];

  for (const activity of rawActivities) {
    const startMinutes = parseTime(activity.start);
    let endMinutes = parseTime(activity.end);

    if (startMinutes === null || endMinutes === null) continue;
    if (endMinutes === startMinutes) continue;

    // Overnight activity: resolve wraparound past midnight.
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    processed.push({
      name: activity.activity,
      startMinutes,
      endMinutes,
      duration: endMinutes - startMinutes,
      zone: getZone(startMinutes),
    });
  }

  return processed;
};
