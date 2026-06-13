import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '../types/cart';
import { Cart } from './Cart';

// Mock useCatalog — the sidebar reads currency + discount_tiers from the
// catalog so it must stay in sync with CartPage and CheckoutPage.
vi.mock('../hooks/useCatalog', () => ({
  useCatalog: vi.fn(),
}));

// Stub the webhook submission. The totals tests below never reach the
// network, but Cart mounts an AbortController on unmount that could fire
// during cleanup.
vi.mock('../services/webhook', () => ({
  submitCartToWebhook: vi.fn().mockResolvedValue({ success: true, orderId: 'mock' }),
}));

import { useCatalog } from '../hooks/useCatalog';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'item-1',
    variantId: '550e8400-e29b-41d4-a716-446655440000',
    shape: 'square',
    scent: 'lavender',
    color: 'white',
    size: '100g',
    quantity: 1,
    price: 200,
    hasLavenderPieces: false,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

const baseCart = {
  items: [makeItem({ id: 'a' }), makeItem({ id: 'b' }), makeItem({ id: 'c' })] as CartItem[],
  totalQuantity: 3,
};

describe('Cart sidebar totals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the admin-configured currency (INR → ₹)', () => {
    vi.mocked(useCatalog).mockReturnValue({
      data: { settings: { currency: 'INR' } } as unknown as ReturnType<typeof useCatalog>['data'],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useCatalog>);

    render(
      <Cart
        cart={baseCart}
        isOpen
        onClose={() => {}}
        onRemoveItem={() => {}}
        onClearCart={() => {}}
      />,
    );

    const cta = screen.getByRole('button', { name: /checkout/i });
    expect(cta.textContent).toContain('₹');
  });

  it('uses admin-configured discount tiers, not the hardcoded defaults', () => {
    // Admin tiers: 3+ items → 20%. With 3 items the hardcoded default
    // would be 10% (default 10% tier kicks in at 2 items), so the
    // computed total differs by 10% of the subtotal.
    vi.mocked(useCatalog).mockReturnValue({
      data: {
        settings: {
          currency: 'INR',
          discount_tiers: [{ minItems: 3, percent: 20 }],
        },
      } as unknown as ReturnType<typeof useCatalog>['data'],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useCatalog>);

    render(
      <Cart
        cart={baseCart}
        isOpen
        onClose={() => {}}
        onRemoveItem={() => {}}
        onClearCart={() => {}}
      />,
    );

    // Subtotal 3 * 200 = 600. 20% off = 120 discount, 480 total.
    // The hardcoded default would have been 10% off = 60 discount, 540 total.
    expect(screen.getByText(/20% off/i)).toBeTruthy();
    expect(screen.getByText(/- ₹\s*120/)).toBeTruthy();
    const cta = screen.getByRole('button', { name: /checkout/i });
    expect(cta.textContent).toMatch(/₹\s*480/);
  });

  it('falls back to default tiers when the catalog returns none', () => {
    vi.mocked(useCatalog).mockReturnValue({
      data: { settings: {} } as unknown as ReturnType<typeof useCatalog>['data'],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useCatalog>);

    // 4 items triggers the hardcoded 15% default tier.
    const cart4 = {
      items: [
        makeItem({ id: 'a' }),
        makeItem({ id: 'b' }),
        makeItem({ id: 'c' }),
        makeItem({ id: 'd' }),
      ] as CartItem[],
      totalQuantity: 4,
    };

    render(
      <Cart
        cart={cart4}
        isOpen
        onClose={() => {}}
        onRemoveItem={() => {}}
        onClearCart={() => {}}
      />,
    );

    expect(screen.getByText(/15% off/i)).toBeTruthy();
  });
});
