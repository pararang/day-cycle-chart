import { describe, it, expect } from 'vitest';
import { rowsToActivities } from './parse';

// rowsToActivities is the shared seam both the CSV and Excel adapters funnel
// into, so testing it proves header resolution behaves identically for either
// format. See CONTEXT.md for the column rules.
describe('rowsToActivities', () => {
  it('resolves lowercase columns', () => {
    const result = rowsToActivities([{ activity: 'Work', start: '09:00', end: '11:00' }]);
    expect(result).toEqual([{ activity: 'Work', start: '09:00', end: '11:00' }]);
  });

  it('resolves columns regardless of case or surrounding whitespace', () => {
    // The bug this module fixes: the old Excel path only matched `start`/`Start`,
    // so `START` and ` Start ` silently produced undefined.
    const result = rowsToActivities([
      { ACTIVITY: 'Work', START: '09:00', END: '11:00' },
      { ' Activity ': 'Sleep', ' Start ': '23:00', ' End ': '06:00' },
    ]);
    expect(result).toEqual([
      { activity: 'Work', start: '09:00', end: '11:00' },
      { activity: 'Sleep', start: '23:00', end: '06:00' },
    ]);
  });

  it('accepts `label` as an alias for `activity`', () => {
    const result = rowsToActivities([{ Label: 'Lunch', start: '12:00', end: '13:00' }]);
    expect(result[0].activity).toBe('Lunch');
  });

  it('throws a descriptive error when a required column is absent', () => {
    expect(() => rowsToActivities([{ activity: 'x', start: '09:00' }])).toThrow(
      /Required columns not found/,
    );
  });

  it('drops rows with a blank required cell', () => {
    const result = rowsToActivities([
      { activity: 'Work', start: '09:00', end: '11:00' },
      { activity: '', start: '11:00', end: '12:00' },
      { activity: 'Gap', start: '', end: '13:00' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].activity).toBe('Work');
  });

  it('returns an empty list for no rows without throwing', () => {
    expect(rowsToActivities([])).toEqual([]);
  });
});
