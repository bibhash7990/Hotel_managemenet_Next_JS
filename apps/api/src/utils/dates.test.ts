import { describe, expect, it } from 'vitest';
import { addDays, nightsBetween } from './dates.js';

describe('dates', () => {
  it('addDays', () => {
    const d = new Date(Date.UTC(2026, 0, 1));
    const r = addDays(d, 5);
    expect(r.getUTCDate()).toBe(6);
  });

  it('nightsBetween', () => {
    const a = new Date(Date.UTC(2026, 0, 1));
    const b = new Date(Date.UTC(2026, 0, 4));
    expect(nightsBetween(a, b)).toBe(3);
  });
});
