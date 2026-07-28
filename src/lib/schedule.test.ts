import { describe, it, expect } from 'vitest';
import { processActivities } from './schedule';

// The Schedule core's interface is its test surface: raw rows in, schedule
// facts out. See CONTEXT.md for the invariants these tests pin down.
describe('processActivities', () => {
  it('processes a daytime activity into the inner zone', () => {
    const [a] = processActivities([{ activity: 'Work', start: '09:00', end: '11:00' }]);
    expect(a).toMatchObject({
      name: 'Work',
      startMinutes: 540,
      endMinutes: 660,
      duration: 120,
      zone: 'inner',
    });
  });

  it('resolves overnight wraparound past midnight', () => {
    const [a] = processActivities([{ activity: 'Sleep', start: '23:30', end: '06:00' }]);
    expect(a).toMatchObject({
      startMinutes: 1410,
      endMinutes: 1800, // 06:00 + 24h
      duration: 390,
      zone: 'outer',
    });
  });

  it('assigns zones at the 6AM/6PM boundaries from the start time', () => {
    const zoneOf = (start: string) =>
      processActivities([{ activity: 'x', start, end: '23:00' }])[0]?.zone;

    expect(zoneOf('06:00')).toBe('inner'); // 6AM is daytime
    expect(zoneOf('05:59')).toBe('outer'); // just before is night
    expect(zoneOf('17:59')).toBe('inner'); // just before 6PM is day
    expect(zoneOf('18:00')).toBe('outer'); // 6PM is night
  });

  it('parses HH.MM the same as HH:MM', () => {
    const [dot] = processActivities([{ activity: 'x', start: '09.30', end: '10.00' }]);
    expect(dot).toMatchObject({ startMinutes: 570, endMinutes: 600 });
  });

  it('drops a row whose start and end are equal', () => {
    expect(processActivities([{ activity: 'x', start: '09:00', end: '09:00' }])).toEqual([]);
  });

  it('drops rows with unparseable or out-of-range times', () => {
    const result = processActivities([
      { activity: 'good', start: '08:00', end: '09:00' },
      { activity: 'garbage', start: 'banana', end: '09:00' },
      { activity: 'out-of-range', start: '25:00', end: '09:00' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('good');
  });
});
