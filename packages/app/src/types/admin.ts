// These types mirror the SQLite-backed admin API in @lotr/db/admin and the
// `admin-sqlite.ts` schema. The previously-typed `AdminProduct` shape (with
// basePrice/minWeight/maxWeight) described the unused Postgres schema
// `admin-catalog.ts` and was rot — the real wire format from
// `/api/admin/products` is the SQLite row below.

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

export interface AdminCatalogState {
  products: AdminProduct[];
  options: AdminOptions[];
  discounts: AdminDiscount[];
  isLoading: boolean;
  error: string | null;
}
