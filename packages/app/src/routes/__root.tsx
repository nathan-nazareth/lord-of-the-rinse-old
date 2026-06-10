import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CommandBar } from '../components/CommandBar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingState } from '../components/LoadingState';
import { HomeProvider } from './-components/home-context';
import { queryClient } from '../lib/query-client';
import { setupGlobalErrorHandlers } from '../utils/errorLogging';

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
