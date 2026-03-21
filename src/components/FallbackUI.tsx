import React from 'react';

interface FallbackProps {
  error: Error | null;
  onRetry: () => void;
}

export const FallbackUI: React.FC<FallbackProps> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-4">
    <div className="card-apothecary p-10 max-w-sm w-full text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-semibold text-ink-700 mb-2">Something went wrong</h2>
      <p className="text-ink-400 mb-5">We encountered an error loading the application.</p>
      {error && (
        <p className="text-xs text-ink-400 font-mono bg-parchment-100 p-3 rounded-xl mb-6 border border-parchment-300">
          {error.message}
        </p>
      )}
      <button onClick={onRetry} className="btn-apothecary btn-primary">
        Try Again
      </button>
    </div>
  </div>
);
