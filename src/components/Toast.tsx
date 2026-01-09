import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-earth-600';
  const icon = type === 'success' ? <Check className="w-5 h-5" /> : null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50
        ${bgColor} text-white px-6 py-3 rounded-full shadow-lg
        flex items-center gap-3 font-semibold
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const clearToast = () => {
    setToast(null);
  };

  return { toast, showToast, clearToast, Toast: Toast };
};
