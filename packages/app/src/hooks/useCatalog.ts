import { useQuery } from '@tanstack/react-query';
import type { CatalogResponse } from '../types/catalog';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

async function fetchCatalog(): Promise<CatalogResponse> {
  const res = await fetch(`${API_BASE}/api/catalog`);
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: ${res.status}`);
  }
  return res.json();
}

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: 1000 * 60 * 5,
  });
}

export { fetchCatalog };
