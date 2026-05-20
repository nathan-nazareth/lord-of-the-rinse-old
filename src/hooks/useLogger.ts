import { useCallback } from 'react';

export function useLogger() {
  const log = useCallback((message: string) => {
    console.log('[useLogger]', message);
  }, []);

  return { log };
}
