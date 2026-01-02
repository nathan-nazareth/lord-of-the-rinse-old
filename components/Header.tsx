import React from 'react';
import { Leaf, Droplets, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6 tracking-tight">
        100% Organic Soaps
      </h1>
      
      <div className="max-w-2xl mx-auto bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-earth-200">
        <p className="text-lg md:text-xl font-medium text-earth-600 mb-6">Made from only:</p>
        <ul className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-earth-800">
          <li className="flex flex-col items-center gap-2">
            <div className="bg-earth-100 p-3 rounded-full">
              <Leaf className="w-6 h-6 text-green-700" />
            </div>
            <span className="font-semibold">Natural coconut soap base</span>
          </li>
          <li className="hidden md:block h-12 w-px bg-earth-300"></li>
          <li className="flex flex-col items-center gap-2">
            <div className="bg-earth-100 p-3 rounded-full">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-semibold">Custom ingredient (e.g. turmeric)</span>
          </li>
          <li className="hidden md:block h-12 w-px bg-earth-300"></li>
          <li className="flex flex-col items-center gap-2">
            <div className="bg-earth-100 p-3 rounded-full">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <span className="font-semibold">Nothing else!</span>
          </li>
        </ul>
      </div>
    </header>
  );
};