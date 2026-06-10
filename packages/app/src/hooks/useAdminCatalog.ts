import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores/useAdminStore';

const API_BASE = '/api/admin';

interface ApiErrorBody {
  error?: string;
  details?: unknown;
}

async function parseApiError(response: Response): Promise<string> {
  // Try to surface the server's structured error message but DO NOT throw
  // raw HTML / stack traces into Error.message. We also cap the body size
  // so a 50MB error page can't OOM the client.
  try {
    const text = await response.text();
    if (text.length > 0 && text.length < 4096) {
      try {
        const parsed = JSON.parse(text) as ApiErrorBody;
        if (parsed && typeof parsed.error === 'string' && parsed.error.length > 0) {
          return parsed.error;
        }
      } catch {
        // Not JSON — fall through to the generic message below.
      }
    }
  } catch {
    // ignore body read errors
  }
  return `HTTP ${response.status}`;
}

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
  } catch (err) {
    // network / DNS / CORS — never let this become an unhandled rejection
    // inside react-query.
    throw new Error(err instanceof Error ? `Network error: ${err.message}` : 'Network error');
  }
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
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
    queryKey: ['admin', 'products', authToken],
    queryFn: () => fetchWithAuth<AdminProduct[]>(`${API_BASE}/products`, {}, authToken),
    enabled: Boolean(authToken),
  });
}

export function useCreateProduct() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchWithAuth<AdminProduct>(
        `${API_BASE}/products`,
        { method: 'POST', body: JSON.stringify(data) },
        authToken,
      ),
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
      fetchWithAuth<{ success: boolean }>(
        `${API_BASE}/products/${id}`,
        { method: 'DELETE' },
        authToken,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useAdminOptions() {
  const authToken = useAdminStore((s) => s.authToken);
  return useQuery({
    queryKey: ['admin', 'options', authToken],
    queryFn: () => fetchWithAuth<AdminOptions>(`${API_BASE}/options`, {}, authToken),
    enabled: Boolean(authToken),
  });
}

export function useUpdateAdminOptions() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AdminOptions, 'id' | 'updatedAt'>) =>
      fetchWithAuth<AdminOptions>(
        `${API_BASE}/options`,
        { method: 'PUT', body: JSON.stringify(data) },
        authToken,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'options'] });
    },
  });
}

export function useAdminDiscounts() {
  const authToken = useAdminStore((s) => s.authToken);
  return useQuery({
    queryKey: ['admin', 'discounts', authToken],
    queryFn: () => fetchWithAuth<AdminDiscount[]>(`${API_BASE}/discounts`, {}, authToken),
    enabled: Boolean(authToken),
  });
}

export function useCreateDiscount() {
  const authToken = useAdminStore((s) => s.authToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { percentage: number; description: string }) =>
      fetchWithAuth<AdminDiscount>(
        `${API_BASE}/discounts`,
        { method: 'POST', body: JSON.stringify(data) },
        authToken,
      ),
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
      fetchWithAuth<AdminDiscount>(
        `${API_BASE}/discounts/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        authToken,
      ),
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
      fetchWithAuth<{ success: boolean }>(
        `${API_BASE}/discounts/${id}`,
        { method: 'DELETE' },
        authToken,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
    },
  });
}
