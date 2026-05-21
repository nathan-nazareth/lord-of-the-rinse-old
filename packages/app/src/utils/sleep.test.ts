import { describe, expect, it, vi } from 'vitest';

describe('sleep', () => {
  it('resolves after specified milliseconds', async () => {
    vi.useFakeTimers();
    const ms = 100;
    const promise = new Promise((resolve) => setTimeout(resolve, ms));
    vi.advanceTimersByTime(ms);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
