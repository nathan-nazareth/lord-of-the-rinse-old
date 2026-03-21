import React from 'react';
import { Header } from './components/Header';
import { SoapForm } from './src/components/SoapForm';

function App() {
  return (
    <div className="apothecary-bg">
      <div className="relative z-base min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-10 animate-enter delay-1">
            <div className="inline-block px-10 py-8">
              <p className="overline mb-4">Est. 2024 — Handcrafted with care</p>
              <h1 className="text-display mb-3">Botanical Soap Workshop</h1>
              <p className="text-display-italic text-ink-600">
                Handcraft your own organic soaps with nature&apos;s finest ingredients
              </p>
            </div>
            <div className="botanical-divider">
              <svg className="botanical-divider-icon" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2 Q25 8 25 14 Q20 18 15 14 Q15 8 20 2" fill="#7AA07F" opacity="0.7"/>
                <ellipse cx="10" cy="10" rx="4" ry="6" fill="#C4785A" opacity="0.5" transform="rotate(-20 10 10)"/>
                <ellipse cx="30" cy="10" rx="4" ry="6" fill="#C4785A" opacity="0.5" transform="rotate(20 30 10)"/>
              </svg>
            </div>
          </header>

          <main id="main-content" role="main" aria-label="Main content" className="page-enter relative animate-enter delay-2">
            <div className="card-apothecary p-6 md:p-10">
              <SoapForm />
            </div>
          </main>

          <footer className="mt-14 text-center animate-enter delay-3">
            <div className="botanical-divider">
              <svg className="botanical-divider-icon" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2 Q25 8 25 14 Q20 18 15 14 Q15 8 20 2" fill="#7AA07F" opacity="0.5"/>
                <ellipse cx="10" cy="10" rx="4" ry="6" fill="#C4785A" opacity="0.4" transform="rotate(-20 10 10)"/>
                <ellipse cx="30" cy="10" rx="4" ry="6" fill="#C4785A" opacity="0.4" transform="rotate(20 30 10)"/>
              </svg>
            </div>
            <p className="font-display italic text-ink-500 text-lg mb-4">
              &ldquo;Made with love and nature&apos;s botanicals&rdquo;
            </p>
            <p className="overline">Crafted by hand, delivered with care</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
