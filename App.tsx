import React, { useRef, useCallback } from 'react';
import { Header } from './components/Header';
import Hero from './src/components/Hero';
import { SoapForm } from './src/components/SoapForm';

function App() {
  const formSectionRef = useRef<HTMLDivElement>(null);

  const handleShopClick = useCallback(() => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="apothecary-bg">
      <div className="relative z-base min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero section — product showcase + CTA */}
          <div className="mb-12 py-6">
            <Hero onShopClick={handleShopClick} />
          </div>

          {/* Botanical divider */}
          <div className="botanical-divider">
            <svg viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2 Q25 8 25 14 Q20 18 15 14 Q15 8 20 2" fill="#7AA07F" opacity="0.7"/>
              <ellipse cx="10" cy="10" rx="4" ry="6" fill="#C4785A" opacity="0.5" transform="rotate(-20 10 10)"/>
              <ellipse cx="30" cy="10" rx="4" ry="6" fill="#C4785A" opacity="0.5" transform="rotate(20 30 10)"/>
            </svg>
          </div>

          {/* Form section — scent selection */}
          <main id="main-content" ref={formSectionRef} role="main" aria-label="Build your soap" className="page-enter relative animate-enter delay-2">
            <div className="card-apothecary p-6 md:p-10">
              <SoapForm />
            </div>
          </main>

          <footer className="mt-14 text-center animate-enter delay-3">
            <div className="botanical-divider">
              <svg viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
