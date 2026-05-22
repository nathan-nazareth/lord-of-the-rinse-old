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
