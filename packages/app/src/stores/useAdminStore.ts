import { create } from 'zustand';
import type {
  AdminProduct,
  CatalogOption,
  Discount,
  AuditLogEntry,
} from '@/types/admin';

interface AdminState {
  isAuthenticated: boolean;
  authToken: string | null;
  products: AdminProduct[];
  options: CatalogOption[];
  discounts: Discount[];
  auditLog: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;

  setAuth: (token: string) => void;
  clearAuth: () => void;
  setProducts: (products: AdminProduct[]) => void;
  setOptions: (options: CatalogOption[]) => void;
  setDiscounts: (discounts: Discount[]) => void;
  setAuditLog: (entries: AuditLogEntry[]) => void;
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
  auditLog: [],
  isLoading: false,
  error: null,

  setAuth: (token) => set({ isAuthenticated: true, authToken: token }),
  clearAuth: () => set({ isAuthenticated: false, authToken: null }),
  setProducts: (products) => set({ products }),
  setOptions: (options) => set({ options }),
  setDiscounts: (discounts) => set({ discounts }),
  setAuditLog: (auditLog) => set({ auditLog }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));