import { createRootRouteWithContext, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CommandBar } from '../components/CommandBar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingState } from '../components/LoadingState';
import { HomeProvider } from './-components/home-context';
import { queryClient } from '../lib/query-client';
import { setupGlobalErrorHandlers } from '../utils/errorLogging';
import { useCommandStore } from '../stores/useCommandStore';
import { useAdminStore } from '../stores/useAdminStore';

function GlobalCommands() {
  const navigate = useNavigate();
  const registerMany = useCommandStore((s) => s.registerMany);
  const isAdmin = useAdminStore((s) => s.isAuthenticated);

  useEffect(() => {
    const storefrontCommands = [
      {
        id: 'go-home',
        label: 'Go to Home',
        surface: 'storefront' as const,
        action: () => navigate({ to: '/' }),
      },
      {
        id: 'go-cart',
        label: 'Open Cart',
        surface: 'storefront' as const,
        action: () => navigate({ to: '/cart' }),
      },
      {
        id: 'go-checkout',
        label: 'Checkout',
        surface: 'storefront' as const,
        action: () => navigate({ to: '/checkout' }),
      },
    ];
    const adminCommands = isAdmin
      ? [
          {
            id: 'admin-products',
            label: 'Admin: Products',
            surface: 'admin' as const,
            action: () => navigate({ to: '/admin/products' }),
          },
          {
            id: 'admin-options',
            label: 'Admin: Options',
            surface: 'admin' as const,
            action: () => navigate({ to: '/admin/options' }),
          },
          {
            id: 'admin-discounts',
            label: 'Admin: Discounts',
            surface: 'admin' as const,
            action: () => navigate({ to: '/admin/discounts' }),
          },
        ]
      : [];
    return registerMany([...storefrontCommands, ...adminCommands]);
  }, [registerMany, navigate, isAdmin]);

  return null;
}

export const Route = createRootRouteWithContext<object>()({
  component: () => {
    // Install the global `error` and `unhandledrejection` listeners exactly
    // once at the root. They are no-ops when no error fires, so the cost is
    // negligible.
    useEffect(() => {
      setupGlobalErrorHandlers();
    }, []);

    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <CommandBar />
          <GlobalCommands />
          <LoadingState timeout={3000}>
            <HomeProvider>
              <Outlet />
            </HomeProvider>
          </LoadingState>
        </ErrorBoundary>
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    );
  },
});
