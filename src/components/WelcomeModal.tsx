import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsVisible(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className={`
        relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden
        animate-in fade-in zoom-in-95 duration-300
        ${isVisible ? 'scale-100' : 'scale-95 opacity-0'}
      `}>
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="bg-gradient-to-br from-earth-100 to-white p-8 text-center">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-earth-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-earth-800 mb-2">
            Welcome!
          </h2>
          <p className="text-earth-600">
            Build your custom organic soaps with our easy 3-step process.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 font-bold">
              1
            </div>
            <span className="text-gray-700">Choose your favorite scent</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 font-bold">
              2
            </div>
            <span className="text-gray-700">Pick a beautiful color</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 font-bold">
              3
            </div>
            <span className="text-gray-700">Set your quantity</span>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClose}
              className="w-full bg-earth-600 text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-earth-700 transition-all hover:scale-[1.02]"
            >
              Let's Go!
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const hasSeenWelcome = (): boolean => {
  return localStorage.getItem('hasSeenWelcome') === 'true';
};

export const resetWelcome = () => {
  localStorage.removeItem('hasSeenWelcome');
};
