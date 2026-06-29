// Chart Activity — a Processed Activity enriched with a palette color, the shape
// the clock chart renders. Arc geometry is derived from it on the fly (by the
// chart-geometry module), not stored on it. See CONTEXT.md.

import { ProcessedActivity } from './schedule';

export interface ChartActivity extends ProcessedActivity {
  color: string;
}

// Distinct, repeating palette assigned to activities in order.
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#F5B041', '#D7BDE2',
  '#FFD6E0', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB',
  '#B5B9FF', '#FFB7B2', '#F3FFE3', '#F9F871', '#A0CED9',
];

// Assign each schedule fact a palette color, cycling once activities exceed the
// palette length.
export const toChartActivities = (processed: ProcessedActivity[]): ChartActivity[] =>
  processed.map((activity, index) => ({
    ...activity,
    color: COLORS[index % COLORS.length],
  }));
