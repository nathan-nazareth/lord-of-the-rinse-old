import { useQuery } from '@tanstack/react-query';
import type { CatalogResponse } from '../types/catalog';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

const CATALOG_TIMEOUT_MS = 10_000;

async function fetchCatalog(): Promise<CatalogResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CATALOG_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/catalog`, { signal: controller.signal });
  } catch (err) {
    // network failure, DNS, CORS, timeout, etc. — never let this become
    // an unhandled promise rejection inside react-query.
    console.error('[useCatalog] catalog request failed', err);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Catalog request timed out');
    }
    throw new Error('Unable to reach the catalog service');
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: ${res.status}`);
  }
  try {
    return (await res.json()) as CatalogResponse;
  } catch (err) {
    console.error('[useCatalog] Invalid JSON in catalog response', err);
    throw new Error('Catalog response was not valid JSON');
  }
}

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: 1000 * 60 * 5,
  });
}

export { fetchCatalog };
