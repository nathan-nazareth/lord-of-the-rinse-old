import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormStore } from '../stores/useFormStore';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { Route as rootRoute } from './__root';
import { HomeProvider } from './-components/home-context';
import { Route as indexRoute } from './index';

// Mock useCatalog
vi.mock('../hooks/useCatalog', () => ({
  useCatalog: vi.fn(),
}));

import { useCatalog } from '../hooks/useCatalog';

const MOCK_CATALOG = {
  attributes: {
    shape: [
      { id: 'shape-1', name: 'Square', slug: 'square', type: 'shape', displayOrder: 0 },
      { id: 'shape-2', name: 'Circle', slug: 'circle', type: 'shape', displayOrder: 1 },
    ],
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
  settings: { shop_open: 'true', currency: 'INR', discount_tiers: '[{"minItems":2,"percent":10}]' },
};

function createTestRouter(initialEntries: string[] = ['/']) {
  const IndexRoute = indexRoute.update({
    id: '/',
    path: '/',
    getParentRoute: () => rootRoute,
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router .update() generic is too complex to type in test helpers
  } as any);
  const routeTree = rootRoute._addFileChildren({ IndexRoute })._addFileTypes();
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
    context: {},
  });
}

describe('index route', () => {
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
    vi.mocked(useCatalog).mockReturnValue({
      data: MOCK_CATALOG,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useCatalog>);
  });

  it('has meta title for the home page', () => {
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router route types are complex generics
    const route = indexRoute as any;
    expect(typeof route.options.beforeLoad).toBe('function');
    route.options.beforeLoad();
    expect(document.title).toBe('Lord of the Rinse');
  });

  it('has a beforeLoad hook', () => {
    expect(typeof indexRoute.options.beforeLoad).toBe('function');
  });

  it('renders landing page with Shop Now button on first visit', async () => {
    const router = createTestRouter();

    render(
      <HomeProvider>
        <RouterProvider router={router} />
      </HomeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /shop now/i })).not.toBeNull();
    });
  });

  it('renders SoapForm after landing is dismissed', async () => {
    mockStorage.setItem('soap_visited', 'true');
    const router = createTestRouter();

    render(
      <HomeProvider>
        <RouterProvider router={router} />
      </HomeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /shop now/i })).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /shop now/i }));

    await waitFor(() => {
      expect(screen.getByText('Select your shape')).not.toBeNull();
    });
  });

  it('renders footer text on home page', async () => {
    const router = createTestRouter();

    render(
      <HomeProvider>
        <RouterProvider router={router} />
      </HomeProvider>,
    );

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /shop now/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Made with love and nature/i)).not.toBeNull();
    });
  });
});
