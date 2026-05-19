import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingState } from '../components/LoadingState';
import { HomeProvider } from './-components/home-context';

export const Route = createRootRouteWithContext<object>()({
  component: () => (
    <ErrorBoundary>
      <LoadingState timeout={3000}>
        <HomeProvider>
          <Outlet />
        </HomeProvider>
      </LoadingState>
    </ErrorBoundary>
  ),
});
