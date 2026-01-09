import React from 'react';
import { Header } from './components/Header';
import { SoapForm } from './src/components/SoapForm';

function App() {
  return (
    <div className="min-h-screen jungle-background selection:bg-jungle-300 selection:text-parchment-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-jungle-500 focus:text-parchment-100 focus:rounded-full focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-jungle-300"
      >
        Skip to main content
      </a>
      
      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with flower decorations */}
          <header className="text-center mb-8 relative">
            <div className="absolute -top-4 left-1/4 text-4xl opacity-80">🌺</div>
            <div className="absolute -top-2 right-1/4 text-3xl opacity-80">🌸</div>
            <div className="absolute top-8 left-8 text-2xl opacity-60">🌿</div>
            <div className="absolute top-6 right-8 text-2xl opacity-60">🌱</div>
            
            <div className="parchment-paper inline-block px-8 py-6 max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-jungle-800 mb-2 botanical-heading">
                Botanical Soap Workshop
              </h1>
              <p className="text-bark-200 italic text-lg">
                Handcraft your own organic soaps with nature's finest ingredients
              </p>
            </div>
            
            <div className="absolute -bottom-2 left-1/3 text-3xl opacity-80">🌻</div>
            <div className="absolute -bottom-4 right-1/3 text-4xl opacity-80">🌼</div>
          </header>
          
          {/* Main form on parchment paper */}
          <main id="main-content" role="main" aria-label="Main content" className="page-enter relative">
            {/* Corner flower decorations */}
            <div className="absolute -top-3 -left-3 text-5xl z-20 opacity-90">🌺</div>
            <div className="absolute -top-2 -right-3 text-4xl z-20 opacity-90">🌸</div>
            <div className="absolute -bottom-3 -left-3 text-4xl z-20 opacity-90">🌼</div>
            <div className="absolute -bottom-2 -right-3 text-5xl z-20 opacity-90">🌻</div>
            
            {/* Top vine border */}
            <div className="vine-border mb-6"></div>
            
            <div className="parchment-paper aged p-6 md:p-10">
              <SoapForm />
            </div>
            
            {/* Bottom vine border */}
            <div className="vine-border mt-6"></div>
          </main>
          
          {/* Footer with botanical touch */}
          <footer className="mt-12 text-center relative">
            <div className="divider-leaf"></div>
            <p className="font-serif italic text-jungle-300 text-lg">
              "Made with love and nature's botanicals"
            </p>
            <div className="flex justify-center gap-4 mt-4 text-2xl">
              <span>🌿</span>
              <span>🌸</span>
              <span>🌺</span>
              <span>🌼</span>
              <span>🌿</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
