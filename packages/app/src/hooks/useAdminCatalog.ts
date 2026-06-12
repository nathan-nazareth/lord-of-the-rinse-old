import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores/useAdminStore';
import type { AdminDiscount, AdminOptions, AdminProduct } from '@/types/admin';

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
      } catch (err) {
        // Non-JSON error body. console.warn (not console.debug) so the
        // failure is visible in devtools by default — the dev was
        // expecting a structured {error:string} and didn't get one.
        if (import.meta.env.DEV) {
          console.warn(`[useAdminCatalog] non-JSON error body for HTTP ${response.status}:`, err);
        }
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[useAdminCatalog] could not read error body for HTTP ${response.status}:`, err);
    }
  }
  return `HTTP ${response.status}`;
}

// Side-effecting: on a 401 from any admin endpoint, drop the local
// auth state so the route guard redirects to /admin on the next
// render. Without this, an expired token leaves the user on a
// perpetually-failing admin page.
function handleUnauthorized(response: Response): void {
  if (response.status !== 401) return;
  const state = useAdminStore.getState();
  if (state.isAuthenticated || state.authToken) {
    state.clearAuth();
  }
}

const ADMIN_TIMEOUT_MS = 15_000;

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Cap the request duration so a hung server can't trap the admin
  // UI in a perpetual loading state.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_TIMEOUT_MS);
  // If the caller already supplied a signal, cascade it into our
  // internal controller so cancellation propagates.
  const externalSignal = options.signal;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }
  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw new Error('Request was cancelled');
      }
      throw new Error(`Request timed out after ${ADMIN_TIMEOUT_MS}ms`);
    }
    // network / DNS / CORS — never let this become an unhandled rejection
    // inside react-query.
    throw new Error(err instanceof Error ? `Network error: ${err.message}` : 'Network error');
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error(await parseApiError(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// Re-export the shared admin types so consumers have a single source of
// truth for the wire format. Defining them here invited silent drift if
// either side changed.
export type { AdminProduct, AdminOptions, AdminDiscount } from '@/types/admin';

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
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Pick<AdminDiscount, 'percentage' | 'description' | 'active'>>;
    }) =>
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
