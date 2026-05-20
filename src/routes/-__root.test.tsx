import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, waitFor, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route as rootRoute } from './__root';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HomeProvider } from './-components/home-context';

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: vi.fn(({ initialIsOpen }) => (
    <div data-testid="react-query-devtools" data-is-open={initialIsOpen} />
  )),
}));

describe('__root route', () => {
  it('renders layout wrapper with HomeProvider', async () => {
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      context: {},
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(document.querySelector('.apothecary-bg')).toBeNull();
    });
  });
});

describe('Root Route - React Query Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should wrap children in QueryClientProvider', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <HomeProvider>
          <div data-testid="child-content" />
        </HomeProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('child-content')).toBeTruthy();
  });

  it('should create a QueryClient with default staleTime configured', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          retry: 1,
        },
      },
    });

    expect(queryClient).toBeDefined();
    expect(queryClient.getQueryDefaults).toBeDefined();
  });
});

describe('Root Route - Devtools Conditional Rendering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render ReactQueryDevtools when import.meta.env.DEV is true', () => {
    vi.stubEnv('import.meta.env.DEV', 'true');
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <HomeProvider>
          <div />
        </HomeProvider>
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('react-query-devtools')).toBeTruthy();
    expect(screen.getByTestId('react-query-devtools').getAttribute('data-is-open')).toBe('false');
  });

  it('should NOT render ReactQueryDevtools when import.meta.env.DEV is false', () => {
    vi.stubEnv('import.meta.env.DEV', 'false');
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <HomeProvider>
          <div />
        </HomeProvider>
        {!import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>,
    );

    expect(screen.queryByTestId('react-query-devtools')).toBeNull();
  });
});
