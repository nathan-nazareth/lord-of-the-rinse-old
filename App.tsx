import React from 'react';
import { Header } from './components/Header';
import { SoapForm } from './src/components/SoapForm';

function App() {
  return (
    <div className="min-h-screen bg-cream-100 selection:bg-sage-200 selection:text-sage-800 natural-texture">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-sage-500 focus:text-white focus:rounded-full focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-sage-300"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-gradient-to-b from-cream-50 via-cream-100 to-sage-50/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Header />
          <main id="main-content" role="main" aria-label="Main content" className="page-enter">
            <SoapForm />
          </main>
          <footer className="mt-12 text-center text-stone-500 text-sm">
            <p className="font-serif italic">Handmade with natural ingredients</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
