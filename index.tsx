import { createBrowserHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { routeTree } from './src/routeTree.gen';
import './index.css';
import { setupGlobalErrorHandlers } from './src/utils/errorLogging';

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
root.render(<RouterProvider router={router} />);
