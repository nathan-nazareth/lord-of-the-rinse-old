import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from '../../stores/useCartStore';
import { MockLocalStorage } from '../../test-utils/mock-local-storage';
import { HomeProvider, useHomeContext } from './home-context';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(HomeProvider, null, children);

describe('HomeProvider cart store wiring', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    useCartStore.persist.clearStorage();
    useCartStore.setState({ items: [], totalQuantity: 0 });
    vi.clearAllMocks();
  });

  it('exposes empty cart on mount', () => {
    const { result } = renderHook(() => useHomeContext(), { wrapper });

    expect(result.current.cart.items).toEqual([]);
    expect(result.current.cart.totalQuantity).toBe(0);
  });

  it('adds item to store via handleAddToCart', () => {
    const { result } = renderHook(() => useHomeContext(), { wrapper });

    act(() => {
      result.current.handleAddToCart(
        'square',
        'lavender',
        12.99,
        'blue',
        '2',
        '75g',
        false,
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].shape).toBe('square');
    expect(result.current.cart.items[0].variantId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.current.cart.totalQuantity).toBe(2);
  });

  it('removes item from store via removeItem', () => {
    const { result } = renderHook(() => useHomeContext(), { wrapper });

    act(() => {
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '1', '75g', false);
    });
    const itemId = result.current.cart.items[0].id;

    act(() => {
      result.current.removeItem(itemId);
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.totalQuantity).toBe(0);
  });

  it('updates item quantity via updateQuantity', () => {
    const { result } = renderHook(() => useHomeContext(), { wrapper });

    act(() => {
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '1', '75g', false);
    });
    const itemId = result.current.cart.items[0].id;

    act(() => {
      result.current.updateQuantity(itemId, 5);
    });

    expect(result.current.cart.items[0].quantity).toBe(5);
    expect(result.current.cart.totalQuantity).toBe(5);
  });

  it('clears cart via clearCart', () => {
    const { result } = renderHook(() => useHomeContext(), { wrapper });

    act(() => {
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '1', '75g', false);
      result.current.handleAddToCart('circle', 'citrus', 9.99, 'red', '2', '50g', false);
    });
    expect(result.current.cart.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.totalQuantity).toBe(0);
  });

  it('clears cart and form state on successful checkout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ reference: 'LOR-20260523-0001', status: 'new' }),
      }),
    );

    const { result } = renderHook(() => useHomeContext(), { wrapper });

    act(() => {
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '2', '75g', false);
    });
    expect(result.current.cart.items).toHaveLength(1);

    await act(async () => {
      await result.current.handleCheckout({ name: 'Test', email: 'test@test.com', phone: '123' });
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.justOrdered).toBe(true);
    expect(result.current.confirmationItemCount).toBe(2);
    expect(result.current.lastOrderReference).toBe('LOR-20260523-0001');
  });

  it('detects legacy cart and sets legacyCartCleared flag', () => {
    // Put legacy data in localStorage
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

    const { result } = renderHook(() => useHomeContext(), { wrapper });

    expect(result.current.legacyCartCleared).toBe(true);
    expect(result.current.cart.items).toHaveLength(0);
  });
});
