import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { detectAndClearLegacyCart, useCartStore } from './useCartStore';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: string) => UUID_REGEX.test(v);

describe('useCartStore', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    useCartStore.setState({ items: [], totalQuantity: 0 });
    useCartStore.persist.clearStorage();
  });

  it('has correct default state', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalQuantity).toBe(0);
  });

  it('adds an item and increments totalQuantity', () => {
    const { addItem } = useCartStore.getState();
    const result = addItem(
      'square',
      'lavender',
      12.99,
      'blue',
      '2',
      '75g',
      false,
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(result).toBe(true);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].shape).toBe('square');
    expect(state.items[0].scent).toBe('lavender');
    expect(state.items[0].quantity).toBe(2);
    // variantId is the catalog UUID we passed in
    expect(state.items[0].variantId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(isUuid(state.items[0].id)).toBe(true);
    expect(state.totalQuantity).toBe(2);
  });

  it('falls back to a generated UUID when no variantId is supplied', () => {
    const { addItem } = useCartStore.getState();
    addItem('square', 'lavender', 12.99, 'blue', '2', '75g', false);
    const state = useCartStore.getState();
    expect(isUuid(state.items[0].variantId)).toBe(true);
  });

  it('merges into an existing matching line instead of duplicating it', () => {
    const { addItem } = useCartStore.getState();
    addItem(
      'square',
      'lavender',
      12.99,
      'blue',
      '2',
      '75g',
      false,
      '550e8400-e29b-41d4-a716-446655440000',
    );
    addItem(
      'square',
      'lavender',
      12.99,
      'blue',
      '3',
      '75g',
      false,
      '550e8400-e29b-41d4-a716-446655440000',
    );

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalQuantity).toBe(5);
  });

  it('creates a new line when attributes differ', () => {
    const { addItem } = useCartStore.getState();
    addItem(
      'square',
      'lavender',
      12.99,
      'blue',
      '2',
      '75g',
      false,
      '550e8400-e29b-41d4-a716-446655440000',
    );
    // Different size — should NOT merge
    addItem(
      'square',
      'lavender',
      12.99,
      'blue',
      '2',
      '100g',
      false,
      '660e8400-e29b-41d4-a716-446655440000',
    );

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.totalQuantity).toBe(4);
  });

  it('rejects adding when cart has 20 items', () => {
    const store = useCartStore.getState();
    for (let i = 0; i < 20; i += 1) {
      store.addItem('square', 'lavender', 12.99, 'blue', '1', '75g', false);
    }
    expect(useCartStore.getState().items).toHaveLength(20);

    const result = useCartStore
      .getState()
      .addItem('square', 'lavender', 12.99, 'blue', '1', '75g', false);
    expect(result).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(20);
  });

  it('removes an item by ID and recalculates totalQuantity', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g', false);
    useCartStore.getState().addItem('circle', 'citrus', 9.99, 'red', '2', '50g', false);

    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().removeItem(itemId);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].scent).toBe('citrus');
    expect(state.totalQuantity).toBe(2);
  });

  it('updates item quantity and recalculates totalQuantity', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g', false);
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().updateQuantity(itemId, 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalQuantity).toBe(5);
  });

  it('removes item when quantity set below 1', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g', false);
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().updateQuantity(itemId, 0);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalQuantity).toBe(0);
  });

  it('clears all items from cart', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g', false);
    useCartStore.getState().addItem('circle', 'citrus', 9.99, 'red', '2', '50g', false);

    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalQuantity).toBe(0);
  });

  it('persists state to localStorage with a UUID variantId', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '2', '75g', false);

    const stored = mockStorage.getItem('organic-soap-cart');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.items).toHaveLength(1);
    expect(parsed.state.items[0].shape).toBe('square');
    expect(isUuid(parsed.state.items[0].variantId)).toBe(true);
  });

  it('stamps an updatedAt timestamp on every persist write', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '1', '75g', false);
    const stored = mockStorage.getItem('organic-soap-cart');
    const parsed = JSON.parse(stored as string);
    // The expiry check in getItem() relies on this stamp; without it the
    // 30-day cart retention is dead code.
    expect(typeof parsed.updatedAt).toBe('number');
    expect(parsed.updatedAt).toBeGreaterThan(0);
  });

  it('exposes a detectAndClearLegacyCart() helper that returns false for fresh carts', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '1', '75g', false);
    expect(detectAndClearLegacyCart()).toBe(false);
  });

  it('restores state from localStorage on re-hydrate', async () => {
    const persistedData = {
      state: {
        items: [
          {
            id: 'test-1',
            variantId: '550e8400-e29b-41d4-a716-446655440000',
            shape: 'circle',
            scent: 'citrus',
            price: 9.99,
            color: 'yellow',
            quantity: 3,
            size: '50g',
            hasLavenderPieces: false,
            addedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalQuantity: 3,
      },
      version: 2,
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(persistedData));

    useCartStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].shape).toBe('circle');
    expect(state.items[0].variantId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(state.totalQuantity).toBe(3);
  });

  it('replaces non-UUID variantId on re-hydrate with a generated UUID', async () => {
    const persistedData = {
      state: {
        items: [
          {
            id: 'test-1',
            variantId: 'variant-1',
            shape: 'circle',
            scent: 'citrus',
            price: 9.99,
            color: 'yellow',
            quantity: 3,
            size: '50g',
            hasLavenderPieces: false,
            addedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalQuantity: 3,
      },
      version: 2,
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(persistedData));

    useCartStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(isUuid(state.items[0].variantId)).toBe(true);
  });

  it('discards expired cart on hydration', async () => {
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const expiredData = {
      state: {
        items: [
          {
            id: 'old-1',
            variantId: '550e8400-e29b-41d4-a716-446655440000',
            shape: 'square',
            scent: 'lavender',
            price: 12.99,
            color: 'blue',
            quantity: 2,
            size: '75g',
            hasLavenderPieces: false,
            addedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalQuantity: 2,
        updatedAt: thirtyOneDaysAgo,
      },
      version: 2,
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(expiredData));

    useCartStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalQuantity).toBe(0);
  });

  it('migrates old flat-format localStorage data', async () => {
    const oldFormatData = {
      items: [
        {
          id: 'old-1',
          variantId: '550e8400-e29b-41d4-a716-446655440000',
          shape: 'heart',
          scent: 'rose',
          price: 14.99,
          color: 'pink',
          quantity: 4,
          size: '100g',
          hasLavenderPieces: false,
          addedAt: '2024-06-01T00:00:00.000Z',
        },
      ],
      updatedAt: Date.now(),
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(oldFormatData));

    useCartStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].shape).toBe('heart');
    expect(state.totalQuantity).toBe(4);
  });
});

describe('detectAndClearLegacyCart', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    useCartStore.setState({ items: [], totalQuantity: 0 });
    useCartStore.persist.clearStorage();
  });

  it('returns false when no cart in localStorage', () => {
    expect(detectAndClearLegacyCart()).toBe(false);
  });

  it('returns false when cart items have valid UUID variantId', () => {
    const data = {
      state: {
        items: [
          {
            id: 'test-1',
            variantId: '550e8400-e29b-41d4-a716-446655440000',
            shape: 'circle',
            scent: 'citrus',
            price: 9.99,
            color: 'yellow',
            quantity: 3,
            size: '50g',
            hasLavenderPieces: false,
          },
        ],
        totalQuantity: 3,
      },
      version: 2,
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(data));

    expect(detectAndClearLegacyCart()).toBe(false);
  });

  it('returns true and clears cart when items lack variantId', () => {
    const legacyData = {
      state: {
        items: [
          {
            id: 'old-1',
            shape: 'square',
            scent: 'lavender',
            price: 12.99,
            color: 'blue',
            quantity: 2,
            size: 75,
            hasLavenderPieces: false,
          },
        ],
        totalQuantity: 2,
      },
      version: 0,
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(legacyData));

    expect(detectAndClearLegacyCart()).toBe(true);
    const remaining = mockStorage.getItem('organic-soap-cart');
    const parsed = remaining ? JSON.parse(remaining) : null;
    expect(parsed?.state?.items ?? []).toHaveLength(0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('returns true when variantId is not a UUID (legacy slug format)', () => {
    const legacyData = {
      state: {
        items: [
          {
            id: 'old-1',
            variantId: 'square-lavender-blue-75g',
            shape: 'square',
            scent: 'lavender',
            price: 12.99,
            color: 'blue',
            quantity: 2,
            size: '75g',
            hasLavenderPieces: false,
          },
        ],
        totalQuantity: 2,
      },
      version: 0,
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(legacyData));

    expect(detectAndClearLegacyCart()).toBe(true);
  });
});
