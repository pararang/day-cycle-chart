import { describe, it, expect } from 'vitest';
import { toChartActivities } from './chart-activity';
import { ProcessedActivity } from './schedule';

const fact = (name: string): ProcessedActivity => ({
  name,
  startMinutes: 0,
  endMinutes: 60,
  duration: 60,
  zone: 'inner',
});

describe('toChartActivities', () => {
  it('assigns a color to each activity while preserving order and facts', () => {
    const [a, b] = toChartActivities([fact('A'), fact('B')]);
    expect(a.name).toBe('A');
    expect(a.duration).toBe(60);
    expect(typeof a.color).toBe('string');
    expect(a.color).not.toBe(b.color);
  });

  it('cycles the palette once activities exceed its length', () => {
    const many = Array.from({ length: 26 }, (_, i) => fact(`a${i}`));
    const result = toChartActivities(many);
    expect(result).toHaveLength(26);
    expect(result[25].color).toBe(result[0].color); // 26th wraps to the first
  });
});
