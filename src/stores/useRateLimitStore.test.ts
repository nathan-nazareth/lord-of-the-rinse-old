import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { MockLocalStorage } from '@/src/test-utils/mock-local-storage';
import { useRateLimitStore } from '@/src/stores/useRateLimitStore';

describe('useRateLimitStore', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    useRateLimitStore.persist.setOptions({
      storage: createJSONStorage(() => mockStorage),
    });
    useRateLimitStore.persist.clearStorage();
    useRateLimitStore.setState({ count: 0, windowStart: 0, lastSubmission: 0 });
  });

  describe('initial state', () => {
    it('starts with count 0, windowStart 0, lastSubmission 0', () => {
      const store = useRateLimitStore.getState();
      expect(store.count).toBe(0);
      expect(store.windowStart).toBe(0);
      expect(store.lastSubmission).toBe(0);
    });
  });

  describe('recordSubmission', () => {
    it('increments count and sets timestamps', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      useRateLimitStore.getState().recordSubmission(300000);

      const store = useRateLimitStore.getState();
      expect(store.count).toBe(1);
      expect(store.lastSubmission).toBe(Date.now());

      vi.useRealTimers();
    });

    it('starts a new window when windowStart is 0', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      useRateLimitStore.getState().recordSubmission(300000);

      const store = useRateLimitStore.getState();
      expect(store.windowStart).toBe(Date.now());

      vi.useRealTimers();
    });
  });

  describe('isAllowed', () => {
    it('returns true when count is under maxSubmissions', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      useRateLimitStore.getState().recordSubmission(300000);

      const store = useRateLimitStore.getState();
      expect(store.isAllowed(10, 300000)).toBe(true);

      vi.useRealTimers();
    });

    it('returns false when count reaches maxSubmissions', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      const store = useRateLimitStore;
      for (let i = 0; i < 10; i++) {
        store.getState().recordSubmission(300000);
      }

      expect(store.getState().isAllowed(10, 300000)).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('remainingSubmissions', () => {
    it('returns maxSubmissions minus count when within window', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      useRateLimitStore.getState().recordSubmission(300000);
      useRateLimitStore.getState().recordSubmission(300000);

      const store = useRateLimitStore.getState();
      expect(store.remainingSubmissions(10, 300000)).toBe(8);

      vi.useRealTimers();
    });
  });

  describe('window expiry', () => {
    it('allows submissions after window expires', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      const store = useRateLimitStore;
      for (let i = 0; i < 10; i++) {
        store.getState().recordSubmission(300000);
      }

      expect(store.getState().isAllowed(10, 300000)).toBe(false);

      vi.advanceTimersByTime(300001);

      expect(store.getState().isAllowed(10, 300000)).toBe(true);
      expect(store.getState().remainingSubmissions(10, 300000)).toBe(10);

      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('clears all state back to initial values', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      useRateLimitStore.getState().recordSubmission(300000);
      useRateLimitStore.getState().recordSubmission(300000);

      useRateLimitStore.getState().reset();

      const store = useRateLimitStore.getState();
      expect(store.count).toBe(0);
      expect(store.windowStart).toBe(0);
      expect(store.lastSubmission).toBe(0);

      vi.useRealTimers();
    });
  });
});
