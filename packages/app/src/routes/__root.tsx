import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CommandBar } from '../components/CommandBar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingState } from '../components/LoadingState';
import { HomeProvider } from './-components/home-context';
import { queryClient } from '../lib/query-client';

export const Route = createRootRouteWithContext<object>()({
  component: () => (
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
  ),
});
