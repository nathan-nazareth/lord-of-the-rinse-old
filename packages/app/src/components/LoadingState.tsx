import type React from 'react';
import { useEffect, useState } from 'react';

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
  timeout = 8000,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If the page is already fully loaded (cached reloads, route changes after
    // initial mount), skip the spinner entirely.
    if (document.readyState === 'complete') {
      setIsLoading(false);
      return;
    }
    const onLoad = () => setIsLoading(false);
    window.addEventListener('load', onLoad, { once: true });
    // Cap the spinner at `timeout` so a hung network can't trap the user on
    // the loading screen forever, but make the default large enough that
    // slow first-paint doesn't cause a flash of empty content.
    const timeoutId = setTimeout(() => setIsLoading(false), timeout);
    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(timeoutId);
    };
  }, [timeout]);

  if (isLoading) return <LoadingSpinner message="Preparing your soap experience..." />;
  return <>{children}</>;
};

export default LoadingState;
