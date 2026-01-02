import React from 'react';
import { Header } from './components/Header';
import { SoapForm } from './components/SoapForm';

function App() {
  return (
    <div className="min-h-screen bg-stone-50 selection:bg-earth-200 selection:text-earth-900">
      <div className="bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Header />
          <main>
            <SoapForm />
          </main>
          
          <footer className="text-center text-earth-500 text-sm py-12 pb-32">
            <p>&copy; {new Date().getFullYear()} Organic Soaps. Handmade with love.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
