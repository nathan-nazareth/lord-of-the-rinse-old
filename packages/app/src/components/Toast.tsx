import Check from 'lucide-react/dist/esm/icons/check';
import type React from 'react';
import { useEffect, useState } from 'react';

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
  onClose,
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

  const bgColor =
    type === 'success' ? 'bg-botanical-500' : type === 'error' ? 'bg-red-500' : 'bg-ink-600';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-apothecary ${bgColor} ${isExiting ? 'opacity-0' : ''} transition-all duration-300`}
    >
      {type === 'success' && (
        <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4" />
        </div>
      )}
      <span>{message}</span>
    </div>
  );
};
