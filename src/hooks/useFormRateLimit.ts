import { useState, useCallback } from 'react';

const STORAGE_KEY = 'soap:v1:formRateLimit';

interface UseFormRateLimitOptions {
  maxSubmissions: number;
  windowMs: number;
  cooldownMs: number;
}

interface RateLimitData {
  count: number;
  windowStart: number;
  lastSubmission: number;
}

function readStorage(): RateLimitData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { count: 0, windowStart: Date.now(), lastSubmission: 0 };
    const parsed = JSON.parse(stored);
    if (typeof parsed.count !== 'number' || typeof parsed.windowStart !== 'number') {
      return { count: 0, windowStart: Date.now(), lastSubmission: 0 };
    }
    return parsed;
  } catch {
    return { count: 0, windowStart: Date.now(), lastSubmission: 0 };
  }
}

function writeStorage(data: RateLimitData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Incognito, quota exceeded, or disabled
  }
}

export const useFormRateLimit = (options: UseFormRateLimitOptions) => {
  const { maxSubmissions, windowMs } = options;

  const [data, setData] = useState<RateLimitData>(readStorage);

  const refresh = useCallback(() => setData(readStorage()), []);

  const now = Date.now();
  const windowExpired = now - data.windowStart >= windowMs;

  const isAllowed = !windowExpired && data.count < maxSubmissions;
  const remainingSubmissions = windowExpired
    ? maxSubmissions
    : Math.max(0, maxSubmissions - data.count);

  let cooldownRemaining: number | null = null;
  if (data.count >= maxSubmissions && !windowExpired) {
    cooldownRemaining = Math.ceil((windowMs - (now - data.windowStart)) / 1000);
  }

  const recordSubmission = useCallback((): boolean => {
    if (!isAllowed) return false;

    const current = readStorage();
    const nowMs = Date.now();

    if (nowMs - current.windowStart >= windowMs) {
      writeStorage({ count: 1, windowStart: nowMs, lastSubmission: nowMs });
    } else {
      writeStorage({ ...current, count: current.count + 1, lastSubmission: nowMs });
    }

    refresh();
    return true;
  }, [isAllowed, windowMs, refresh]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail
    }
    refresh();
  }, [refresh]);

  return { isAllowed, remainingSubmissions, cooldownRemaining, recordSubmission, reset };
};
