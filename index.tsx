import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingState } from './src/components/LoadingState';
import { setupGlobalErrorHandlers } from './src/utils/errorLogging';

setupGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <LoadingState timeout={3000}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LoadingState>
  </ErrorBoundary>
);
