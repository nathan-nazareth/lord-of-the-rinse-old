import { createBrowserHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { routeTree } from './src/routeTree.gen';
import './index.css';
import { setupGlobalErrorHandlers } from './src/utils/errorLogging';
import { ErrorBoundary } from './src/components/ErrorBoundary';

setupGlobalErrorHandlers();

const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  context: {},
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>,
);
