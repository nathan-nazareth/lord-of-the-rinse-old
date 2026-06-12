import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminState {
  isAuthenticated: boolean;
  authToken: string | null;
  tokenExpiresAt: number | null;

  setAuth: (token: string, expiresIn?: number) => void;
  clearAuth: () => void;
  isTokenExpired: () => boolean;
}

const STORAGE_KEY = 'soap:v1:adminAuth';

// sessionStorage (not localStorage) so the token is dropped when the
// tab closes — limiting XSS blast radius. The previous in-memory-only
// design had a worse UX (page refresh kicked admins out) and also
// caused a race where the route guard's `isTokenExpired()` call could
// see `isAuthenticated=false` after a refresh even though the server
// still considered the token valid.
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      authToken: null,
      tokenExpiresAt: null,

      setAuth: (token, expiresIn) => {
        const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
        set({ isAuthenticated: true, authToken: token, tokenExpiresAt: expiresAt });
      },
      clearAuth: () => set({ isAuthenticated: false, authToken: null, tokenExpiresAt: null }),
      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return false;
        return Date.now() >= tokenExpiresAt;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        // Guard for environments without `sessionStorage` (SSR, tests).
        // The fallback is a noop storage so the store still works
        // (just without persistence).
        typeof window !== 'undefined' && window.sessionStorage
          ? window.sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      // Persist only the auth fields, not the methods.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
      // If the persisted token has already expired by the time the
      // store rehydrates, drop it so the route guard sees a clean
      // unauthenticated state and redirects to /admin.
      onRehydrateStorage: () => (state) => {
        if (state?.tokenExpiresAt && Date.now() >= state.tokenExpiresAt) {
          state.isAuthenticated = false;
          state.authToken = null;
          state.tokenExpiresAt = null;
        }
      },
    },
  ),
);
