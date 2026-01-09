import React from 'react';
import { Leaf, Droplets, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-serif font-bold text-bark-800 mb-4 tracking-tight">
        100% Organic Soaps
      </h1>
      
      <div className="max-w-xl mx-auto bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-bark-200">
        <p className="text-sm md:text-base font-medium text-bark-600 mb-4">Made from only:</p>
        <ul className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-bark-800">
          <li className="flex items-center gap-2">
            <div className="bg-bark-100 p-2 rounded-full">
              <Leaf className="w-4 h-4 text-green-700" />
            </div>
            <span className="text-sm font-semibold">Coconut base</span>
          </li>
          <li className="hidden sm:block h-8 w-px bg-bark-300"></li>
          <li className="flex items-center gap-2">
            <div className="bg-bark-100 p-2 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-semibold">Natural ingredients</span>
          </li>
          <li className="hidden sm:block h-8 w-px bg-bark-300"></li>
          <li className="flex items-center gap-2">
            <div className="bg-bark-100 p-2 rounded-full">
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-semibold">Pure</span>
          </li>
        </ul>
      </div>
    </header>
  );
};