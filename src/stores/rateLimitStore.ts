import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "soap:v1:formRateLimit";
const MAX_SUBMISSIONS = 10;
const WINDOW_MS = 300000;

interface RateLimitStore {
  count: number;
  windowStart: number;
  lastSubmission: number;
  isAllowed: boolean;
  remainingSubmissions: number;
  cooldownRemaining: number | null;
  recordSubmission: () => boolean;
  reset: () => void;
}

function computeDerived(data: { count: number; windowStart: number }) {
  const now = Date.now();
  const windowExpired = now - data.windowStart >= WINDOW_MS;
  return {
    isAllowed: windowExpired ? true : data.count < MAX_SUBMISSIONS,
    remainingSubmissions: windowExpired
      ? MAX_SUBMISSIONS
      : Math.max(0, MAX_SUBMISSIONS - data.count),
    cooldownRemaining:
      !windowExpired && data.count >= MAX_SUBMISSIONS
        ? Math.ceil((WINDOW_MS - (now - data.windowStart)) / 1000)
        : null,
  };
}

export const useRateLimitStore = create<RateLimitStore>()(
  persist(
    (set, get) => ({
      count: 0,
      windowStart: Date.now(),
      lastSubmission: 0,
      isAllowed: true,
      remainingSubmissions: MAX_SUBMISSIONS,
      cooldownRemaining: null,

      recordSubmission: () => {
        const state = get();
        if (!state.isAllowed) return false;

        const nowMs = Date.now();
        const windowExpired = nowMs - state.windowStart >= WINDOW_MS;

        let newCount: number;
        let newWindowStart: number;

        if (windowExpired) {
          newCount = 1;
          newWindowStart = nowMs;
        } else {
          newCount = state.count + 1;
          newWindowStart = state.windowStart;
        }

        const derived = computeDerived({ count: newCount, windowStart: newWindowStart });

        set({
          count: newCount,
          windowStart: newWindowStart,
          lastSubmission: nowMs,
          ...derived,
        });

        return true;
      },

      reset: () => {
        set({
          count: 0,
          windowStart: Date.now(),
          lastSubmission: 0,
          isAllowed: true,
          remainingSubmissions: MAX_SUBMISSIONS,
          cooldownRemaining: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      merge: (persisted, current) => {
        const data = persisted as Partial<RateLimitStore> | undefined;
        if (!data || typeof data.count !== "number") return current;
        const derived = computeDerived({
          count: data.count,
          windowStart: data.windowStart ?? Date.now(),
        });
        return {
          ...current,
          count: data.count,
          windowStart: data.windowStart ?? Date.now(),
          lastSubmission: data.lastSubmission ?? 0,
          ...derived,
        };
      },
    },
  ),
);
