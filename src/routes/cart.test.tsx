import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { cartRoute } from './cart';
import { indexRoute } from './index';
import { HomeProvider } from './-components/home-context';
import { useFormStore } from '../stores/useFormStore';
import { MockLocalStorage } from '../test-utils/mock-local-storage';
import { CART_KEY } from '../types/cart';

function createTestRouter(initialEntries: string[] = ['/cart']) {
  const routeTree = rootRoute.addChildren([indexRoute, cartRoute]);
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
      currentStep: 'shape',
      visited: true,
    });
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

    mockStorage.setItem(CART_KEY, JSON.stringify({
      items: [testItem],
      updatedAt: Date.now(),
    }));

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
      expect(screen.getByText('Your soap, your story')).not.toBeNull();
    });
  });
});
