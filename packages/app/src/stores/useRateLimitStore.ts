import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RateLimitState {
  count: number;
  // -1 means "no submissions yet"; Date.now() is a positive wall-clock value
  // (zero is theoretically possible on broken system clocks, so the previous
  // `windowStart === 0` sentinel was ambiguous).
  windowStart: number;
  lastSubmission: number;
  isAllowed: (maxSubmissions: number, windowMs: number) => boolean;
  remainingSubmissions: (maxSubmissions: number, windowMs: number) => number;
}

interface RateLimitActions {
  recordSubmission: (windowMs: number) => void;
  reset: () => void;
}

const STORAGE_KEY = 'soap:v1:formRateLimit';

function sanitizePersisted(raw: unknown): Partial<RateLimitState> | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const out: Partial<RateLimitState> = {};
  // Reject negative or non-finite counts — a negative count would make
  // `isAllowed` always return true, silently bypassing the client-side
  // rate limit. The server has its own rate limit, but we shouldn't
  // hand attackers a free bypass on this side either.
  if (typeof obj.count === 'number' && Number.isFinite(obj.count) && obj.count >= 0) {
    out.count = Math.floor(obj.count);
  }
  if (
    typeof obj.windowStart === 'number' &&
    Number.isFinite(obj.windowStart) &&
    obj.windowStart >= 0 &&
    obj.windowStart <= Date.now() + 60_000
  ) {
    out.windowStart = obj.windowStart;
  }
  if (typeof obj.lastSubmission === 'number' && Number.isFinite(obj.lastSubmission)) {
    out.lastSubmission = obj.lastSubmission;
  }
  return out;
}

export const useRateLimitStore = create<RateLimitState & RateLimitActions>()(
  persist(
    (set, get) => ({
      count: 0,
      windowStart: -1,
      lastSubmission: 0,
      isAllowed: (maxSubmissions, windowMs) => {
        const state = get();
        // Defensive: if the in-memory count somehow went negative
        // (e.g. a race in a future refactor), treat the window as
        // exhausted rather than letting `negative < max` return true.
        if (state.count < 0) return false;
        const now = Date.now();
        const windowExpired = state.windowStart < 0 || now - state.windowStart >= windowMs;
        if (windowExpired) return true;
        return state.count < maxSubmissions;
      },
      remainingSubmissions: (maxSubmissions, windowMs) => {
        const state = get();
        if (state.count < 0) return 0;
        const now = Date.now();
        const windowExpired = state.windowStart < 0 || now - state.windowStart >= windowMs;
        if (windowExpired) return maxSubmissions;
        return Math.max(0, maxSubmissions - state.count);
      },
      recordSubmission: (windowMs) => {
        const now = Date.now();
        set((state) => {
          // Clamp count at 0 to prevent an underflow (shouldn't happen
          // with the current call sites, but the math is safer this way).
          const windowExpired = state.windowStart < 0 || now - state.windowStart >= windowMs;
          if (windowExpired) {
            return { count: 1, windowStart: now, lastSubmission: now };
          }
          const nextCount = Math.max(state.count, 0) + 1;
          return { count: nextCount, lastSubmission: now };
        });
      },
      reset: () => {
        set({ count: 0, windowStart: -1, lastSubmission: 0 });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: {
        getItem: (name) => {
          try {
            const raw = localStorage.getItem(name);
            if (!raw) return null;
            const parsed: unknown = JSON.parse(raw);
            if (typeof parsed !== 'object' || parsed === null) return null;
            const state = (parsed as { state?: unknown }).state ?? parsed;
            const sanitized = sanitizePersisted(state);
            // If the persisted blob is missing every recognised field,
            // bail so zustand falls back to the initial state.
            if (!sanitized || Object.keys(sanitized).length === 0) return null;
            return {
              state: { ...sanitized },
              version: 0,
            } as { state: unknown; version?: number };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Quota / privacy-mode — swallow.
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Ignore.
          }
        },
      },
    },
  ),
);
