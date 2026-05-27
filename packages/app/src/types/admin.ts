export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  minWeight: number;
  maxWeight: number;
  enabled: boolean;
  options: ProductOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductOption {
  optionId: string;
  extraPrice: number;
}

export interface CatalogOption {
  id: string;
  type: 'scent' | 'color' | 'shape';
  name: string;
  slug: string;
  description: string | null;
  hexValue: string | null;
  displayOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxUses: number | null;
  usesCount: number;
  startsAt: string;
  expiresAt: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  entityType: 'product' | 'option' | 'discount';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  adminId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  createdAt: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  minWeight?: number;
  maxWeight?: number;
  enabled?: boolean;
}

export interface CreateOptionRequest {
  type: 'scent' | 'color' | 'shape';
  name: string;
  description?: string;
  hexValue?: string;
  displayOrder?: number;
}

export interface UpdateOptionRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
  enabled?: boolean;
}

export interface CreateDiscountRequest {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  startsAt: string;
  expiresAt: string;
}

export interface UpdateDiscountRequest {
  code?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  minOrderValue?: number;
  maxUses?: number;
  startsAt?: string;
  expiresAt?: string;
  enabled?: boolean;
}

export interface AddProductOptionRequest {
  optionId: string;
  extraPrice?: number;
}

export interface AdminCatalogState {
  products: AdminProduct[];
  options: CatalogOption[];
  discounts: Discount[];
  auditLog: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;
}