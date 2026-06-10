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
  shop_open: boolean;
  currency: string;
  discount_tiers: DiscountTier[];
}

export interface CatalogResponse {
  attributes: Record<string, CatalogAttribute[]>;
  variants: CatalogVariant[];
  settings: CatalogSettings;
}
