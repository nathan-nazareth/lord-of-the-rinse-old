import { useQuery } from '@tanstack/react-query';
import type { CatalogResponse } from '../types/catalog';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

async function fetchCatalog(): Promise<CatalogResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/catalog`);
  } catch (err) {
    // network failure, DNS, CORS, etc. — never let this become an unhandled
    // promise rejection inside react-query.
    console.error('[useCatalog] catalog request failed', err);
    throw new Error('Unable to reach the catalog service');
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
