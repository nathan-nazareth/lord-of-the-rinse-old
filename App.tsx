import React from 'react';
import { Header } from './components/Header';
import { SoapForm } from './src/components/SoapForm';

function App() {
  return (
    <div className="min-h-screen floral-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-sage-500 focus:text-white focus:rounded-full focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-sage-300"
      >
        Skip to main content
      </a>

      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Soft floral header */}
          <header className="text-center mb-10 relative">
            {/* Subtle decorative petals */}
            <div className="absolute -top-2 left-1/4 w-8 h-8 opacity-40">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <ellipse cx="16" cy="16" rx="8" ry="12" fill="#f8d4d4" transform="rotate(-30 16 16)" />
              </svg>
            </div>
            <div className="absolute top-4 right-1/4 w-6 h-6 opacity-30">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <ellipse cx="12" cy="12" rx="6" ry="10" fill="#c5dbc9" transform="rotate(20 12 12)" />
              </svg>
            </div>
            <div className="absolute top-10 left-12 w-5 h-5 opacity-25">
              <svg viewBox="0 0 20 20" className="w-full h-full">
                <path d="M10 2 Q14 6 14 12 Q10 18 6 12 Q6 6 10 2" fill="#a8c5ad" />
              </svg>
            </div>
            <div className="absolute top-8 right-12 w-5 h-5 opacity-25">
              <svg viewBox="0 0 20 20" className="w-full h-full">
                <path d="M10 2 Q14 6 14 12 Q10 18 6 12 Q6 6 10 2" fill="#d4c6e3" />
              </svg>
            </div>

            <div className="glass-card inline-block px-10 py-8 max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-natural-700 mb-3 heading-floral">
                Handmade Soap Workshop
              </h1>
              <p className="text-natural-500 text-lg font-light">
                Handcraft your own organic soaps with nature's finest ingredients
              </p>
            </div>

            {/* Bottom decorative elements */}
            <div className="absolute -bottom-4 left-1/3 w-7 h-7 opacity-35">
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <ellipse cx="14" cy="14" rx="7" ry="11" fill="#fce8e8" transform="rotate(-15 14 14)" />
              </svg>
            </div>
            <div className="absolute -bottom-2 right-1/3 w-6 h-6 opacity-30">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <ellipse cx="12" cy="12" rx="6" ry="10" fill="#dceae0" transform="rotate(25 12 12)" />
              </svg>
            </div>
          </header>

          {/* Main form */}
          <main id="main-content" role="main" aria-label="Main content" className="page-enter relative petal-corner">
            <div className="glass-card aged p-6 md:p-10">
              <SoapForm />
            </div>
          </main>

          {/* Elegant footer */}
          <footer className="mt-14 text-center relative">
            <div className="botanical-divider">
              <svg viewBox="0 0 40 20" className="w-10 h-5 opacity-50">
                <path d="M20 2 Q25 8 25 14 Q20 18 15 14 Q15 8 20 2" fill="#c5dbc9" />
                <ellipse cx="10" cy="10" rx="4" ry="6" fill="#f8d4d4" opacity="0.6" transform="rotate(-20 10 10)" />
                <ellipse cx="30" cy="10" rx="4" ry="6" fill="#f8d4d4" opacity="0.6" transform="rotate(20 30 10)" />
              </svg>
            </div>
            <p className="font-serif italic text-natural-500 text-lg">
              "Made with love and nature's botanicals"
            </p>
            <div className="flex justify-center gap-6 mt-5">
              <svg viewBox="0 0 24 24" className="w-6 h-6 opacity-40">
                <path d="M12 2 Q16 6 16 14 Q12 20 8 14 Q8 6 12 2" fill="#a8c5ad" />
              </svg>
              <svg viewBox="0 0 24 24" className="w-6 h-6 opacity-35">
                <ellipse cx="12" cy="12" rx="6" ry="9" fill="#f8d4d4" transform="rotate(-10 12 12)" />
              </svg>
              <svg viewBox="0 0 24 24" className="w-6 h-6 opacity-40">
                <ellipse cx="12" cy="12" rx="6" ry="9" fill="#fce8e8" transform="rotate(10 12 12)" />
              </svg>
              <svg viewBox="0 0 24 24" className="w-6 h-6 opacity-35">
                <ellipse cx="12" cy="12" rx="5" ry="8" fill="#dceae0" />
              </svg>
              <svg viewBox="0 0 24 24" className="w-6 h-6 opacity-40">
                <path d="M12 2 Q16 6 16 14 Q12 20 8 14 Q8 6 12 2" fill="#c5dbc9" />
              </svg>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
