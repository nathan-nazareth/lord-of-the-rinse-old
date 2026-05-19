import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Route as cartRouteImport } from './cart';
import { Route as indexRoute } from './index';
import { HomeProvider } from './-components/home-context';
import { useFormStore } from '../stores/useFormStore';
import { useCartStore } from '../stores/useCartStore';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { CART_KEY } from '../types/cart';

function createTestRouter(initialEntries: string[] = ['/cart']) {
  const IndexRoute = indexRoute.update({
    id: '/',
    path: '/',
    getParentRoute: () => rootRoute,
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router .update() generic is too complex to type in test helpers
  } as any);
  const cartRoute = cartRouteImport.update({
    id: '/cart',
    path: '/cart',
    getParentRoute: () => rootRoute,
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router .update() generic is too complex to type in test helpers
  } as any);
  const routeTree = rootRoute.addChildren([IndexRoute, cartRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
    context: {},
  });
}

describe('cart route', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    useFormStore.persist.clearStorage();
    useFormStore.setState({
      shape: null,
      scent: null,
      color: null,
      quantity: '',
      size: 75,
      hasLavenderPieces: false,
      currentStep: 'landing',
      visited: false,
    });
    useCartStore.persist.clearStorage();
    useCartStore.setState({ items: [], totalQuantity: 0 });
  });

  it('has meta title for the cart page', () => {
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router route types are complex generics
    const route = cartRouteImport as any;
    expect(typeof route.options.beforeLoad).toBe('function');
    route.options.beforeLoad();
    expect(document.title).toBe('Cart');
  });

  it('has a beforeLoad hook', () => {
    expect(typeof cartRouteImport.options.beforeLoad).toBe('function');
  });

  it('renders empty cart with "Nothing here yet" message', async () => {
    const router = createTestRouter(['/cart']);

    render(
      <HomeProvider>
        <RouterProvider router={router} />
      </HomeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Nothing here yet')).not.toBeNull();
    });
  });

  it('renders cart with items showing item details', async () => {
    const testItem = {
      id: 'test-item-1',
      shape: 'Rectangle',
      scent: 'Lavender',
      price: 150,
      color: 'Purple',
      quantity: 2,
      size: 100,
      hasLavenderPieces: true,
      addedAt: new Date().toISOString(),
    };

    mockStorage.setItem(
      CART_KEY,
      JSON.stringify({
        items: [testItem],
        updatedAt: Date.now(),
      }),
    );

    useCartStore.persist.rehydrate();
    await new Promise((r) => setTimeout(r, 10));

    const router = createTestRouter(['/cart']);

    render(
      <HomeProvider>
        <RouterProvider router={router} />
      </HomeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Your Cart')).not.toBeNull();
      expect(screen.getByText(/Rectangle · Lavender/)).not.toBeNull();
      expect(screen.getByText('Purple · 100g')).not.toBeNull();
    });
  });

  it('navigates to home when clicking "Back to form"', async () => {
    const router = createTestRouter(['/cart']);

    render(
      <HomeProvider>
        <RouterProvider router={router} />
      </HomeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Nothing here yet')).not.toBeNull();
    });

    fireEvent.click(screen.getByText('Back to form'));

    await waitFor(() => {
      expect(screen.getByText('Lord of the Rinse')).not.toBeNull();
    });
  });
});
