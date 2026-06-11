export interface CatalogAttribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  displayOrder: number;
}

export interface CatalogVariantAttribute {
  attributeId: string;
  value: string;
}

export interface CatalogVariant {
  id: string;
  name: string;
  slug: string;
  unitPrice: string;
  enabled: boolean;
  attributes: CatalogVariantAttribute[];
}

export interface DiscountTier {
  minItems: number;
  percent: number;
}

export interface CatalogSettings {
  // The API returns Record<string, unknown> for settings; we keep the
  // type loose to mirror the wire format and let consumers narrow
  // per-key as needed. Marking the well-known keys optional is more
  // honest than claiming they're always present and well-typed.
  shop_open?: boolean;
  currency?: string;
  discount_tiers?: DiscountTier[];
  [key: string]: unknown;
}

export interface CatalogResponse {
  attributes: Record<string, CatalogAttribute[]>;
  variants: CatalogVariant[];
  settings: CatalogSettings;
}
