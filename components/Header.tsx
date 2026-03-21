import React from 'react';
import Leaf from 'lucide-react/dist/esm/icons/leaf';
import Droplets from 'lucide-react/dist/esm/icons/droplets';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

export const Header: React.FC = () => (
  <header className="text-center py-8 px-4">
    <div className="max-w-xl mx-auto">
      <p className="overline mb-4">Handcrafted with care</p>
      <h2 className="text-display mb-3">100% Organic Soaps</h2>

      <div className="inline-flex items-center justify-center gap-3 bg-parchment-50 border border-parchment-300 rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-botanical-100 rounded-full flex items-center justify-center">
            <Leaf className="w-4 h-4 text-botanical-600" />
          </div>
          <span className="text-sm font-medium text-ink-600">Coconut base</span>
        </div>
        <div className="w-px h-6 bg-parchment-300 hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-parchment-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-terra-400" />
          </div>
          <span className="text-sm font-medium text-ink-600">Natural ingredients</span>
        </div>
        <div className="w-px h-6 bg-parchment-300 hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-parchment-100 rounded-full flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-ink-600">Pure & gentle</span>
        </div>
      </div>
    </div>
  </header>
);
