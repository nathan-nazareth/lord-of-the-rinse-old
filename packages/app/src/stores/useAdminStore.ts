import { create } from 'zustand';
import type { AdminDiscount, AdminOptions, AdminProduct } from '@/types/admin';

interface AdminState {
  isAuthenticated: boolean;
  authToken: string | null;
  products: AdminProduct[];
  options: AdminOptions[];
  discounts: AdminDiscount[];
  isLoading: boolean;
  error: string | null;

  setAuth: (token: string) => void;
  clearAuth: () => void;
  setProducts: (products: AdminProduct[]) => void;
  setOptions: (options: AdminOptions[]) => void;
  setDiscounts: (discounts: AdminDiscount[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAuthenticated: false,
  authToken: null,
  products: [],
  options: [],
  discounts: [],
  isLoading: false,
  error: null,

  setAuth: (token) => set({ isAuthenticated: true, authToken: token }),
  clearAuth: () => set({ isAuthenticated: false, authToken: null }),
  setProducts: (products) => set({ products }),
  setOptions: (options) => set({ options }),
  setDiscounts: (discounts) => set({ discounts }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
