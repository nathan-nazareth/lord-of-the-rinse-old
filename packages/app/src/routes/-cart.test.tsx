import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from '../stores/useCartStore';
import { useFormStore } from '../stores/useFormStore';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { CART_KEY } from '../types/cart';
import { Route as rootRoute } from './__root';
import { HomeProvider } from './-components/home-context';
import { Route as cartRouteImport } from './cart';
import { Route as indexRoute } from './index';

// Mock useCatalog for SoapForm via index route
vi.mock('../hooks/useCatalog', () => ({
  useCatalog: vi.fn(),
}));

import { useCatalog } from '../hooks/useCatalog';

const MOCK_CATALOG = {
  attributes: {
    shape: [{ id: 'shape-1', name: 'Square', slug: 'square', type: 'shape', displayOrder: 0 }],
    scent: [{ id: 'scent-1', name: 'Lavender', slug: 'lavender', type: 'scent', displayOrder: 0 }],
    color: [{ id: 'color-1', name: 'White', slug: '#FFFFFF', type: 'color', displayOrder: 0 }],
    size: [{ id: 'size-1', name: '50g', slug: '50g', type: 'size', displayOrder: 0 }],
  },
  variants: [
    {
      id: 'variant-1',
      name: 'Square Lavender White 50g',
      slug: 'square-lavender-white-50g',
      unitPrice: '110',
      enabled: true,
      attributes: [
        { attributeId: 'shape-1', value: 'Square' },
        { attributeId: 'scent-1', value: 'Lavender' },
        { attributeId: 'color-1', value: 'White' },
        { attributeId: 'size-1', value: '50g' },
      ],
    },
  ],
  settings: { shop_open: 'true', currency: 'INR', discount_tiers: '[]' },
};

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
      size: null,
      quantity: '',
      currentStep: 'landing',
      visited: false,
    });
    useCartStore.persist.clearStorage();
    useCartStore.setState({ items: [], totalQuantity: 0 });
    vi.mocked(useCatalog).mockReturnValue({
      data: MOCK_CATALOG,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useCatalog>);
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
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      shape: 'Rectangle',
      scent: 'Lavender',
      price: 150,
      color: 'Purple',
      quantity: 2,
      size: '100g',
      hasLavenderPieces: false,
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
      // After "Back to form", showLanding is set to false, so SoapForm renders directly
      expect(screen.getByText('Begin Creating')).not.toBeNull();
    });
  });
});
