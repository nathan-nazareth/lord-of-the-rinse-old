import { create } from 'zustand';

interface AdminState {
  isAuthenticated: boolean;
  authToken: string | null;
  tokenExpiresAt: number | null;

  setAuth: (token: string, expiresIn?: number) => void;
  clearAuth: () => void;
  isTokenExpired: () => boolean;
}

export const useAdminStore = create<AdminState>((set, get) => ({
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
}));
