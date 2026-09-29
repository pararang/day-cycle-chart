// Chart Activity — a Processed Activity enriched with a palette color, the shape
// the clock chart renders. Arc geometry is derived from it on the fly (by the
// chart-geometry module), not stored on it. See CONTEXT.md.

import { ProcessedActivity } from './schedule';

export interface ChartActivity extends ProcessedActivity {
  color: string;
}

// Time-semantic palette assigned to activities in upload order. This is a
// data-visualization content palette (chart slice colors), not a design
// token - it is deliberately independent of the shadcn theme tokens in
// src/index.css and stays fixed regardless of theme.
//
// The 25 hues are ordered as an ambient day gradient so the legend reads as
// time progression even though assignment is by index, not by clock time:
//   0-7   dawn / morning  - warm oranges, amber, soft gold
//   8-12  midday          - bright warm yellows, light warm tones, cream
//   13-15 dusk transition - desaturated neutral into soft lavender
//   16-19 dusk            - cool blues
//   20-24 night           - twilight purples into deep navy
// Colors are interpolated in HSL for perceptual uniformity; adjacent entries
// shift gradually so nothing clashes. The warm->cool bridge runs through a
// desaturated neutral + lavender rather than green to stay on the warm-to-cool
// axis. Activities cycle through this array once they exceed its length.
const COLORS = [
  '#ec713c', '#ec7d41', '#ec8846', '#ec944b', '#ec9e51',
  '#eaa955', '#e8b359', '#e7bc5d', '#e5c461', '#e4ca6c',
  '#e4cf77', '#e3d382', '#e0d49f', '#dfd8b9', '#c9c5ba',
  '#a3a6c2', '#8792c0', '#6782c1', '#5063bc', '#4045b2',
  '#3e36a1', '#3b2e8f', '#37267d', '#321f6a', '#2c1958',
];

// Assign each schedule fact a palette color, cycling once activities exceed the
// palette length.
export const toChartActivities = (processed: ProcessedActivity[]): ChartActivity[] =>
  processed.map((activity, index) => ({
    ...activity,
    color: COLORS[index % COLORS.length],
  }));
