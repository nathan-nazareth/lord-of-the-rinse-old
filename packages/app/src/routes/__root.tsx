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
  const register = useCommandStore((s) => s.register);
  const isAdmin = useAdminStore((s) => s.isAuthenticated);

  useEffect(() => {
    const unregisters: Array<() => void> = [];
    unregisters.push(
      register({
        id: 'go-home',
        label: 'Go to Home',
        surface: 'storefront',
        action: () => navigate({ to: '/' }),
      }),
    );
    unregisters.push(
      register({
        id: 'go-cart',
        label: 'Open Cart',
        surface: 'storefront',
        action: () => navigate({ to: '/cart' }),
      }),
    );
    unregisters.push(
      register({
        id: 'go-checkout',
        label: 'Checkout',
        surface: 'storefront',
        action: () => navigate({ to: '/checkout' }),
      }),
    );
    if (isAdmin) {
      unregisters.push(
        register({
          id: 'admin-products',
          label: 'Admin: Products',
          surface: 'admin',
          action: () => navigate({ to: '/admin/products' }),
        }),
      );
      unregisters.push(
        register({
          id: 'admin-options',
          label: 'Admin: Options',
          surface: 'admin',
          action: () => navigate({ to: '/admin/options' }),
        }),
      );
      unregisters.push(
        register({
          id: 'admin-discounts',
          label: 'Admin: Discounts',
          surface: 'admin',
          action: () => navigate({ to: '/admin/discounts' }),
        }),
      );
    }
    return () => {
      for (const u of unregisters) u();
    };
  }, [register, navigate, isAdmin]);

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
