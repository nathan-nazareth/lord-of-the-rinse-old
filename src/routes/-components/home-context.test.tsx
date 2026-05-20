import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitCartToWebhook } from '../../services/webhook';
import { useCartStore } from '../../stores/useCartStore';
import { MockLocalStorage } from '../../test-utils/mock-local-storage';
import { HomeProvider, useHomeContext } from './home-context';

vi.mock('../../services/webhook', () => ({
  submitCartToWebhook: vi.fn(),
}));

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
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '2', 75, false);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].shape).toBe('square');
    expect(result.current.cart.totalQuantity).toBe(2);
  });

  it('removes item from store via removeItem', () => {
    const { result } = renderHook(() => useHomeContext(), { wrapper });

    act(() => {
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '1', 75, false);
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
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '1', 75, false);
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
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '1', 75, false);
      result.current.handleAddToCart('circle', 'citrus', 9.99, 'red', '2', 50, false);
    });
    expect(result.current.cart.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.totalQuantity).toBe(0);
  });

  it('clears cart and form state on successful checkout', async () => {
    vi.mocked(submitCartToWebhook).mockResolvedValue({ success: true, orderId: 'test-order-1' });

    const { result } = renderHook(() => useHomeContext(), { wrapper });

    act(() => {
      result.current.handleAddToCart('square', 'lavender', 12.99, 'blue', '2', 75, false);
    });
    expect(result.current.cart.items).toHaveLength(1);

    await act(async () => {
      await result.current.handleCheckout({ name: 'Test', email: 'test@test.com', phone: '123' });
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.justOrdered).toBe(true);
    expect(result.current.confirmationItemCount).toBe(2);
  });
});
