import { create } from 'zustand';

interface AdminState {
  isAuthenticated: boolean;
  authToken: string | null;

  setAuth: (token: string) => void;
  clearAuth: () => void;
}

// NOTE: products/options/discounts used to live in this store but no
// component actually read them — the admin screens pull fresh data via
// react-query. Keeping dead state invites drift between the two sources
// of truth, so the legacy fields were removed.
export const useAdminStore = create<AdminState>((set) => ({
  isAuthenticated: false,
  authToken: null,

  setAuth: (token) => set({ isAuthenticated: true, authToken: token }),
  clearAuth: () => set({ isAuthenticated: false, authToken: null }),
}));
