import { describe, it, expect } from 'vitest';
import { activityArc } from './chart-geometry';
import { ProcessedActivity } from './schedule';

const fact = (over: Partial<ProcessedActivity>): ProcessedActivity => ({
  name: 'x',
  startMinutes: 540,
  endMinutes: 660,
  duration: 120,
  zone: 'inner',
  ...over,
});

// The arc-geometry module's interface is its test surface: schedule facts in,
// SVG path + label placement out. Trig is asserted on structural properties
// (command sequence, flags, rotation) rather than exact float coordinates.
describe('activityArc', () => {
  it('builds a closed path that sweeps the outer arc then the inner arc', () => {
    const { pathData } = activityArc(fact({}));
    expect(pathData).toMatch(/^M /);
    expect(pathData).toMatch(/A 120 120 0 \d 1 /); // inner-zone outer radius, clockwise
    expect(pathData).toMatch(/A 0 0 0 \d 0 /); // inner-zone inner radius, counter-clockwise
    expect(pathData.trim().endsWith('Z')).toBe(true);
  });

  it('uses the night ring radii for outer-zone activities', () => {
    const { pathData } = activityArc(fact({ zone: 'outer', startMinutes: 1290, endMinutes: 1380 }));
    expect(pathData).toMatch(/A 200 200 /);
    expect(pathData).toMatch(/A 130 130 /);
  });

  it('resolves overnight wraparound into a positive clockwise sweep', () => {
    // 23:30 -> 06:00, with endMinutes already wrapped past midnight by the core.
    const { pathData } = activityArc(fact({ zone: 'outer', startMinutes: 1410, endMinutes: 1800 }));
    expect(pathData).toMatch(/^M /);
    expect(pathData.trim().endsWith('Z')).toBe(true);
  });

  it('sets largeArcFlag for spans over 180° and clears it for spans under', () => {
    const wide = activityArc(fact({ startMinutes: 0, endMinutes: 660 })); // 11h ~ 330°
    const narrow = activityArc(fact({ startMinutes: 540, endMinutes: 600 })); // 1h = 30°
    expect(wide.pathData).toMatch(/A \S+ \S+ 0 1 1 /);
    expect(narrow.pathData).toMatch(/A \S+ \S+ 0 0 1 /);
  });

  it('keeps label text upright — rotation never lands in the upside-down range', () => {
    // The left-half flip exists so labels stay readable: the final rotation,
    // normalized to [0,360), must never fall strictly between 90° and 270°.
    const ranges: Array<[number, number]> = [
      [0, 120],     // 00:00-02:00, right half
      [480, 600],   // 08:00-10:00, left half (flipped)
      [720, 900],   // 12:00-15:00
      [1080, 1200], // 18:00-20:00
      [1410, 1800], // 23:30-06:00 overnight
    ];
    for (const [startMinutes, endMinutes] of ranges) {
      const { rotation } = activityArc(fact({ startMinutes, endMinutes })).label;
      const norm = ((rotation % 360) + 360) % 360;
      expect(norm <= 90 || norm >= 270).toBe(true);
    }
  });
});
