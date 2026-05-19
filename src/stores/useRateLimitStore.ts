import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RateLimitState {
  count: number;
  windowStart: number;
  lastSubmission: number;
  isAllowed: (maxSubmissions: number, windowMs: number) => boolean;
  remainingSubmissions: (maxSubmissions: number, windowMs: number) => number;
}

interface RateLimitActions {
  recordSubmission: (windowMs: number) => void;
  reset: () => void;
}

export const useRateLimitStore = create<RateLimitState & RateLimitActions>()(
  persist(
    (set, get) => ({
      count: 0,
      windowStart: 0,
      lastSubmission: 0,
      isAllowed: (maxSubmissions, windowMs) => {
        const state = get();
        const now = Date.now();
        const windowExpired = state.windowStart === 0 || now - state.windowStart >= windowMs;
        if (windowExpired) return true;
        return state.count < maxSubmissions;
      },
      remainingSubmissions: (maxSubmissions, windowMs) => {
        const state = get();
        const now = Date.now();
        const windowExpired = state.windowStart === 0 || now - state.windowStart >= windowMs;
        if (windowExpired) return maxSubmissions;
        return Math.max(0, maxSubmissions - state.count);
      },
      recordSubmission: (windowMs) => {
        const now = Date.now();
        set((state) => {
          const windowExpired = state.windowStart === 0 || now - state.windowStart >= windowMs;
          if (windowExpired) {
            return { count: 1, windowStart: now, lastSubmission: now };
          }
          return { count: state.count + 1, lastSubmission: now };
        });
      },
      reset: () => {
        set({ count: 0, windowStart: 0, lastSubmission: 0 });
      },
    }),
    { name: 'soap:v1:formRateLimit' },
  ),
);
