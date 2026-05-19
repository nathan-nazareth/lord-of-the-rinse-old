import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { indexRoute } from './index';
import { HomeProvider } from './-components/home-context';
import { useFormStore } from '../stores/useFormStore';
import { MockLocalStorage } from '../test-utils/mock-local-storage';

function createTestRouter(initialEntries: string[] = ['/']) {
  const routeTree = rootRoute.addChildren([indexRoute]);
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
      quantity: '',
      size: 75,
      hasLavenderPieces: false,
      currentStep: 'landing',
      visited: false,
    });
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
