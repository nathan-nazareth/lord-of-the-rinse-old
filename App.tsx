import React from 'react';
import { Header } from './components/Header';
import { SoapForm } from './src/components/SoapForm';

function App() {
  return (
    <div className="min-h-screen bg-stone-50 selection:bg-earth-200 selection:text-earth-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-earth-600 focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-earth-400"
      >
        Skip to main content
      </a>
      <div className="bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Header />
          <main id="main-content" role="main" aria-label="Main content">
            <SoapForm />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
