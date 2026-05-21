import { IconDroplets, IconLeaf, IconSparkles } from '@tabler/icons-react';
import type React from 'react';

export const Header: React.FC = () => (
  <header className="text-center py-8 px-4">
    <div className="max-w-xl mx-auto">
      <p className="overline mb-4">Handcrafted with care</p>
      <div className="flex items-center justify-center gap-4 mb-3">
        <img
          src="/logo.png"
          alt="Lord of the Rinse"
          className="w-12 h-12 object-contain flex-shrink-0"
        />
        <h2 className="text-display">Lord of the Rinse</h2>
      </div>

      <div className="inline-flex items-center justify-center gap-3 bg-parchment-50 border border-parchment-300 rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-botanical-100 rounded-full flex items-center justify-center">
            <IconLeaf className="w-4 h-4 text-botanical-600" />
          </div>
          <span className="text-sm font-medium text-ink-600">Coconut base</span>
        </div>
        <div className="w-px h-6 bg-parchment-300 hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-parchment-100 rounded-full flex items-center justify-center">
            <IconSparkles className="w-4 h-4 text-terra-400" />
          </div>
          <span className="text-sm font-medium text-ink-600">Natural ingredients</span>
        </div>
        <div className="w-px h-6 bg-parchment-300 hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-parchment-100 rounded-full flex items-center justify-center">
            <IconDroplets className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-ink-600">Pure & gentle</span>
        </div>
      </div>
    </div>
  </header>
);
