import { createRootRouteWithContext } from '@tanstack/react-router';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingState } from '../components/LoadingState';
import App from '../../App';

export const rootRoute = createRootRouteWithContext<object>()({
  component: () => (
    <ErrorBoundary>
      <LoadingState timeout={3000}>
        <div className="apothecary-bg">
          <div className="relative z-base min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </div>
          </div>
        </div>
      </LoadingState>
    </ErrorBoundary>
  ),
});
