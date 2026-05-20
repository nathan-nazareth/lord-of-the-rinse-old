import { describe, expect, it } from 'vitest';

function getRetryDelay(attempt: number): number {
  return 2 ** (attempt - 1) * 1000;
}

describe('getRetryDelay', () => {
  it('returns 1000ms for attempt 1', () => {
    expect(getRetryDelay(1)).toBe(1000);
  });

  it('returns 2000ms for attempt 2', () => {
    expect(getRetryDelay(2)).toBe(2000);
  });

  it('returns 4000ms for attempt 3', () => {
    expect(getRetryDelay(3)).toBe(4000);
  });

  it('returns 8000ms for attempt 4', () => {
    expect(getRetryDelay(4)).toBe(8000);
  });
});
