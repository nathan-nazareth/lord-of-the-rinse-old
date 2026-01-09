import React from 'react';

interface FallbackProps {
  error: Error | null;
  onRetry: () => void;
}

export const FallbackUI: React.FC<FallbackProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-bark-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-bark-200">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif font-bold text-bark-800 mb-2">Something went wrong</h2>
          <p className="text-bark-600 mb-4">We encountered an error loading the application.</p>
          {error && (
            <p className="text-sm text-gray-500 mb-4 font-mono bg-gray-50 p-2 rounded">
              {error.message}
            </p>
          )}
          <button
            onClick={onRetry}
            className="bg-bark-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-bark-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
