import React from 'react';

interface ErrorInfo {
  componentStack?: string;
}

interface StructuredError {
  message: string;
  timestamp: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  componentStack?: string;
  type: 'runtime' | 'promise' | 'resource' | 'render';
}

export const logError = (error: Error, type: 'render' | 'runtime' = 'render', info?: ErrorInfo): void => {
  const structuredError: StructuredError = {
    message: error.message,
    timestamp: new Date().toISOString(),
    stack: error.stack,
    type,
  };

  if (info?.componentStack) {
    structuredError.componentStack = info.componentStack;
  }

  console.error('[Error]', JSON.stringify(structuredError, null, 2));
};

export const logResourceError = (event: Event): void => {
  const target = event.target as HTMLElement;
  const error: StructuredError = {
    message: `Failed to load resource: ${(target as HTMLScriptElement | HTMLLinkElement | HTMLImageElement).src || 'unknown'}`,
    timestamp: new Date().toISOString(),
    type: 'resource',
  };

  if (target instanceof HTMLScriptElement) {
    error.filename = target.src;
  } else if (target instanceof HTMLLinkElement) {
    error.filename = target.href;
  } else if (target instanceof HTMLImageElement) {
    error.filename = target.src;
  }

  console.error('[Resource Error]', JSON.stringify(error, null, 2));
};

export const logUnhandledRejection = (event: PromiseRejectionEvent): void => {
  const error: StructuredError = {
    message: event.reason?.message || 'Unhandled Promise Rejection',
    timestamp: new Date().toISOString(),
    stack: event.reason?.stack,
    type: 'promise',
  };

  console.error('[Unhandled Promise]', JSON.stringify(error, null, 2));
};

export const setupGlobalErrorHandlers = (): void => {
  window.addEventListener('error', (event) => {
    if (event.message) {
      const error: StructuredError = {
        message: event.message,
        timestamp: new Date().toISOString(),
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'runtime',
      };
      console.error('[Global Error]', JSON.stringify(error, null, 2));
    }
  });

  window.addEventListener('unhandledrejection', logUnhandledRejection);
};
