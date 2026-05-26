import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { detectAndClearLegacyCart, useCartStore } from './useCartStore';

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
    const result = addItem('square', 'lavender', 12.99, 'blue', '2', '75g');

    expect(result).toBe(true);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].shape).toBe('square');
    expect(state.items[0].scent).toBe('lavender');
    expect(state.items[0].quantity).toBe(2);
    expect(state.items[0].variantId).toBe('square-lavender-blue-75g');
    expect(state.items[0].id).toBeDefined();
    expect(state.totalQuantity).toBe(2);
  });

  it('rejects adding when cart has 20 items', () => {
    const store = useCartStore.getState();
    for (let i = 0; i < 20; i++) {
      store.addItem('square', 'lavender', 12.99, 'blue', '1', '75g');
    }
    expect(useCartStore.getState().items).toHaveLength(20);

    const result = useCartStore
      .getState()
      .addItem('square', 'lavender', 12.99, 'blue', '1', '75g');
    expect(result).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(20);
  });

  it('removes an item by ID and recalculates totalQuantity', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g');
    useCartStore.getState().addItem('circle', 'citrus', 9.99, 'red', '2', '50g');

    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().removeItem(itemId);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].scent).toBe('citrus');
    expect(state.totalQuantity).toBe(2);
  });

  it('updates item quantity and recalculates totalQuantity', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g');
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().updateQuantity(itemId, 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalQuantity).toBe(5);
  });

  it('removes item when quantity set below 1', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g');
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().updateQuantity(itemId, 0);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalQuantity).toBe(0);
  });

  it('clears all items from cart', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '3', '75g');
    useCartStore.getState().addItem('circle', 'citrus', 9.99, 'red', '2', '50g');

    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalQuantity).toBe(0);
  });

  it('persists state to localStorage', () => {
    useCartStore.getState().addItem('square', 'lavender', 12.99, 'blue', '2', '75g');

    const stored = mockStorage.getItem('organic-soap-cart');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.items).toHaveLength(1);
    expect(parsed.state.items[0].shape).toBe('square');
    expect(parsed.state.items[0].variantId).toBe('square-lavender-blue-75g');
  });

  it('restores state from localStorage on re-hydrate', async () => {
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
            addedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalQuantity: 3,
      },
      version: 0,
    };
    mockStorage.setItem('organic-soap-cart', JSON.stringify(persistedData));

    useCartStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].shape).toBe('circle');
    expect(state.items[0].variantId).toBe('variant-1');
    expect(state.totalQuantity).toBe(3);
  });

  it('discards expired cart on hydration', async () => {
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const expiredData = {
      state: {
        items: [
          {
            id: 'old-1',
            variantId: 'variant-1',
            shape: 'square',
            scent: 'lavender',
            price: 12.99,
            color: 'blue',
            quantity: 2,
            size: '75g',
            addedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalQuantity: 2,
        updatedAt: thirtyOneDaysAgo,
      },
      version: 0,
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
          variantId: 'variant-1',
          shape: 'heart',
          scent: 'rose',
          price: 14.99,
          color: 'pink',
          quantity: 4,
          size: '100g',
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

  it('returns false when cart items have variantId', () => {
    const data = {
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
          },
        ],
        totalQuantity: 3,
      },
      version: 0,
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
    // After clearing legacy cart, the store is reset (zustand persist writes empty state back)
    const remaining = mockStorage.getItem('organic-soap-cart');
    const parsed = remaining ? JSON.parse(remaining) : null;
    expect(parsed?.state?.items ?? []).toHaveLength(0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
