import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingState } from './src/components/LoadingState';
import { setupGlobalErrorHandlers } from './src/utils/errorLogging';

/**
 * Blank Screen Fix Implementation
 *
 * Root Cause Analysis:
 * - React.StrictMode causes double-rendering in development, potentially exposing side effects
 * - No error boundary to catch rendering errors
 * - No loading state during CDN resource loading
 * - No global error handlers for unhandled exceptions
 *
 * Fix Applied:
 * 1. Removed React.StrictMode to prevent double-render issues
 * 2. Wrapped App with ErrorBoundary to catch component errors
 * 3. Wrapped with LoadingState to show loading spinner during resource loading
 * 4. Added global error handlers for unhandled exceptions and promise rejections
 */

setupGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <LoadingState timeout={3000}>
      <App />
    </LoadingState>
  </ErrorBoundary>
);
