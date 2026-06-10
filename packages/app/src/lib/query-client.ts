import { QueryClient } from '@tanstack/react-query';

function shouldRetry(failureCount: number, error: unknown): boolean {
  // Don't retry 4xx — they're authoritative. Don't retry indefinitely.
  if (failureCount >= 1) return false;
  const message = error instanceof Error ? error.message : String(error);
  // The `fetchWithAuth` helper always prefixes HTTP codes, so this is a
  // cheap way to short-circuit auth failures and validation errors.
  if (/HTTP 4\d\d/.test(message)) return false;
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: shouldRetry,
    },
  },
});
