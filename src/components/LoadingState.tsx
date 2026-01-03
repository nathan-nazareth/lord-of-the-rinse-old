import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 border-4 border-earth-200 border-t-earth-600 rounded-full animate-spin mb-4"></div>
        <p className="text-earth-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export const LoadingState: React.FC<{ children: React.ReactNode; timeout?: number }> = ({ 
  children, 
  timeout = 3000 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const checkLoaded = () => {
      if (document.readyState === 'complete') {
        setIsLoading(false);
      } else {
        window.addEventListener('load', () => setIsLoading(false), { once: true });
      }
    };

    checkLoaded();

    const timeoutId = setTimeout(() => {
      setTimedOut(true);
      setIsLoading(false);
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('load', checkLoaded);
    };
  }, [timeout]);

  if (isLoading && !timedOut) {
    return <LoadingSpinner message="Preparing your soap experience..." />;
  }

  return <>{children}</>;
};
