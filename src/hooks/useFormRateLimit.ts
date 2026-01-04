interface UseFormRateLimitOptions {
  maxSubmissions: number;
  windowMs: number;
  cooldownMs: number;
}

interface UseFormRateLimitReturn {
  isAllowed: boolean;
  remainingSubmissions: number;
  cooldownRemaining: number | null;
  recordSubmission: () => boolean;
  reset: () => void;
}

export const useFormRateLimit = (options: UseFormRateLimitOptions): UseFormRateLimitReturn => {
  const { maxSubmissions, windowMs, cooldownMs } = options;

  const getStorageData = () => {
    const stored = localStorage.getItem('formRateLimit');
    if (!stored) {
      return { count: 0, windowStart: Date.now(), lastSubmission: 0 };
    }
    return JSON.parse(stored);
  };

  const setStorageData = (data: { count: number; windowStart: number; lastSubmission: number }) => {
    localStorage.setItem('formRateLimit', JSON.stringify(data));
  };

  const getCooldownRemaining = (): number | null => {
    const data = getStorageData();
    if (data.count < maxSubmissions) return null;
    const elapsed = Date.now() - data.windowStart;
    if (elapsed >= windowMs) return null;
    return Math.ceil((windowMs - elapsed) / 1000);
  };

  const isAllowed = (): boolean => {
    const data = getStorageData();
    const now = Date.now();

    if (now - data.windowStart >= windowMs) {
      return true;
    }

    if (data.count >= maxSubmissions) {
      return false;
    }

    return true;
  };

  const recordSubmission = (): boolean => {
    if (!isAllowed()) return false;

    const data = getStorageData();
    const now = Date.now();

    if (now - data.windowStart >= windowMs) {
      setStorageData({ count: 1, windowStart: now, lastSubmission: now });
    } else {
      setStorageData({ ...data, count: data.count + 1, lastSubmission: now });
    }

    return true;
  };

  const reset = () => {
    localStorage.removeItem('formRateLimit');
  };

  return {
    get isAllowed() { return isAllowed(); },
    get remainingSubmissions() {
      const data = getStorageData();
      return Date.now() - data.windowStart >= windowMs
        ? maxSubmissions
        : Math.max(0, maxSubmissions - data.count);
    },
    get cooldownRemaining() { return getCooldownRemaining(); },
    recordSubmission,
    reset
  };
};
