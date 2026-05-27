import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores/useAdminStore';

const API_BASE = '/api/admin';

async function fetchWithAuth<T>(url: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }
  return response.json();
}

export interface AdminProduct {
  id: number;
  name: string;
  color: string;
  scent: string;
  shape: string;
  weight: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOptions {
  id: number;
  minPrice: number;
  maxPrice: number;
  minSize: number;
  maxSize: number;
  updatedAt: string;
}

export interface AdminDiscount {
  id: number;
  percentage: number;
  description: string;
  active: number;
  createdAt: string;
  updatedAt: string;
}

export function useAdminProducts() {
  const authToken = useAdminStore((s) => s.authToken);
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => fetchWithAuth<AdminProduct[]>(`${API_BASE}/products`, {}, authToken),
  });
}

export function useCreateProduct() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchWithAuth<AdminProduct>(`${API_BASE}/products`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProduct() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth<{ success: boolean }>(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      }, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useAdminOptions() {
  const authToken = useAdminStore((s) => s.authToken);
  return useQuery({
    queryKey: ['admin', 'options'],
    queryFn: () => fetchWithAuth<AdminOptions>(`${API_BASE}/options`, {}, authToken),
  });
}

export function useUpdateAdminOptions() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AdminOptions, 'id' | 'updatedAt'>) =>
      fetchWithAuth<AdminOptions>(`${API_BASE}/options`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'options'] });
    },
  });
}

export function useAdminDiscounts() {
  const authToken = useAdminStore((s) => s.authToken);
  return useQuery({
    queryKey: ['admin', 'discounts'],
    queryFn: () => fetchWithAuth<AdminDiscount[]>(`${API_BASE}/discounts`, {}, authToken),
  });
}

export function useCreateDiscount() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { percentage: number; description: string }) =>
      fetchWithAuth<AdminDiscount>(`${API_BASE}/discounts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
    },
  });
}

export function useUpdateDiscount() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminDiscount> }) =>
      fetchWithAuth<AdminDiscount>(`${API_BASE}/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
    },
  });
}

export function useDeleteDiscount() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth<{ success: boolean }>(`${API_BASE}/discounts/${id}`, {
        method: 'DELETE',
      }, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
    },
  });
}