export type OrderStatus = 'new' | 'processing' | 'fulfilled' | 'cancelled';

export type MovementType = 'adjustment' | 'allocation' | 'cancellation_restock' | 'production';

export type AttributeType = 'shape' | 'scent' | 'color' | 'size' | 'addon';

export type CommandSurface = 'storefront' | 'admin';

export interface CartItem {
  variantId: string;
  quantity: number;
  displayName: string;
  unitPrice: string;
}

export interface CatalogAttribute {
  id: string;
  type: AttributeType;
  name: string;
  slug: string;
  displayOrder: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VariantAttributeRef {
  attributeId: string;
  value: string;
}

export interface SoapVariant {
  id: string;
  name: string;
  slug: string;
  unitPrice: string;
  enabled: boolean;
  archived: boolean;
  attributes: VariantAttributeRef[];
  createdAt: string;
  updatedAt: string;
}
