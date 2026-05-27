import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores/useAdminStore';
import type {
  AdminProduct,
  CatalogOption,
  Discount,
  UpdateProductRequest,
  CreateOptionRequest,
  UpdateOptionRequest,
  CreateDiscountRequest,
  UpdateDiscountRequest,
} from '@/types/admin';

const API_BASE = '/api/admin';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }
  return response.json();
}

export function useAdminProducts() {
  const setProducts = useAdminStore((s) => s.setProducts);
  const setError = useAdminStore((s) => s.setError);

  const query = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => fetchJSON<{ products: AdminProduct[] }>(`${API_BASE}/products`),
    onSuccess: (data) => setProducts(data.products),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to fetch products'),
  });

  return query;
}

export function useAdminProduct(id: string) {
  const setError = useAdminStore((s) => s.setError);

  return useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => fetchJSON<{ product: AdminProduct }>(`${API_BASE}/products/${id}`),
    enabled: !!id,
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to fetch product'),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const setError = useAdminStore((s) => s.setError);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      fetchJSON<{ product: AdminProduct }>(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to update product'),
  });
}

export function useAdminOptions(type?: string) {
  const setOptions = useAdminStore((s) => s.setOptions);
  const setError = useAdminStore((s) => s.setError);

  const query = useQuery({
    queryKey: ['admin', 'options', type],
    queryFn: () => {
      const url = type ? `${API_BASE}/options?type=${type}` : `${API_BASE}/options`;
      return fetchJSON<{ options: CatalogOption[] }>(url);
    },
    onSuccess: (data) => setOptions(data.options),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to fetch options'),
  });

  return query;
}

export function useCreateOption() {
  const queryClient = useQueryClient();
  const setError = useAdminStore((s) => s.setError);

  return useMutation({
    mutationFn: (data: CreateOptionRequest) =>
      fetchJSON<{ option: CatalogOption }>(`${API_BASE}/options`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'options'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create option'),
  });
}

export function useUpdateOption() {
  const queryClient = useQueryClient();
  const setError = useAdminStore((s) => s.setError);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOptionRequest }) =>
      fetchJSON<{ option: CatalogOption }>(`${API_BASE}/options/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'options'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to update option'),
  });
}

export function useDeleteOption() {
  const queryClient = useQueryClient();
  const setError = useAdminStore((s) => s.setError);

  return useMutation({
    mutationFn: (id: string) =>
      fetchJSON<void>(`${API_BASE}/options/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'options'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to delete option'),
  });
}

export function useAdminDiscounts() {
  const setDiscounts = useAdminStore((s) => s.setDiscounts);
  const setError = useAdminStore((s) => s.setError);

  const query = useQuery({
    queryKey: ['admin', 'discounts'],
    queryFn: () => fetchJSON<{ discounts: Discount[] }>(`${API_BASE}/discounts`),
    onSuccess: (data) => setDiscounts(data.discounts),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to fetch discounts'),
  });

  return query;
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  const setError = useAdminStore((s) => s.setError);

  return useMutation({
    mutationFn: (data: CreateDiscountRequest) =>
      fetchJSON<{ discount: Discount }>(`${API_BASE}/discounts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create discount'),
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  const setError = useAdminStore((s) => s.setError);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountRequest }) =>
      fetchJSON<{ discount: Discount }>(`${API_BASE}/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to update discount'),
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  const setError = useAdminStore((s) => s.setError);

  return useMutation({
    mutationFn: (id: string) =>
      fetchJSON<void>(`${API_BASE}/discounts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to delete discount'),
  });
}

export function useAuditLog(filters?: { entityType?: string; entityId?: string }) {
  const setAuditLog = useAdminStore((s) => s.setAuditLog);
  const setError = useAdminStore((s) => s.setError);

  let url = `${API_BASE}/audit?limit=50`;
  if (filters?.entityType) url += `&entityType=${filters.entityType}`;
  if (filters?.entityId) url += `&entityId=${filters.entityId}`;

  const query = useQuery({
    queryKey: ['admin', 'audit', filters],
    queryFn: () => fetchJSON<{ entries: AuditLogEntry[] }>(url),
    onSuccess: (data) => setAuditLog(data.entries),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to fetch audit log'),
  });

  return query;
}