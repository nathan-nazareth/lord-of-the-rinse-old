import type React from 'react';
import { useState, useEffect } from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="spinner mx-auto mb-5" />
      <p className="text-ink-500 font-medium">{message}</p>
    </div>
  </div>
);

export const LoadingState: React.FC<{ children: React.ReactNode; timeout?: number }> = ({
  children,
  timeout = 3000,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const checkLoaded = () => {
      if (document.readyState === 'complete') setIsLoading(false);
      else window.addEventListener('load', () => setIsLoading(false), { once: true });
    };
    checkLoaded();
    const timeoutId = setTimeout(() => {
      setTimedOut(true);
      setIsLoading(false);
    }, timeout);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timeout]);

  if (isLoading && !timedOut) return <LoadingSpinner message="Preparing your soap experience..." />;
  return <>{children}</>;
};

export default LoadingState;
