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
  timeout = 3000,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setIsLoading(false);
      return;
    }
    const onLoad = () => setIsLoading(false);
    window.addEventListener('load', onLoad, { once: true });
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
