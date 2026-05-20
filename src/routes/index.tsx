import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SoapForm } from '../components/SoapForm';
import { useHomeContext } from './-components/home-context';

function IndexContent() {
  const { cart, formSectionRef, showLanding, handleShopClick, handleAddToCart } = useHomeContext();
  const navigate = useNavigate();

  return (
    <div className="apothecary-bg">
      {showLanding ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-enter"
          style={{ animationDuration: '0.5s' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-300 md:hidden"
            style={{
              backgroundImage:
                "url('https://i.postimg.cc/ydxpFVKV/Gemini-Generated-Image-umgfgkumgfgkumgf.png')",
              backgroundPosition: 'center -20%',
              animation: 'fadeIn 0.5s ease-out',
            }}
          />
          <div
            className="absolute inset-0 hidden md:block bg-cover bg-center bg-no-repeat transition-opacity duration-300"
            style={{
              backgroundImage:
                "url('https://i.postimg.cc/vZ8HvbFP/Gemini-Generated-Image-iz8f8oiz8f8oiz8f.png')",
              backgroundPosition: 'center 10%',
              animation: 'fadeIn 0.5s ease-out',
            }}
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col items-center justify-start h-full pt-64 md:pt-0 md:justify-center md:mt-56">
            <button
              type="button"
              onClick={handleShopClick}
              className="btn-apothecary btn-primary text-base px-10 py-4 animate-enter delay-5"
            >
              Shop Now
            </button>
            <p className="text-white/90 text-sm mt-4 font-accent tracking-wider border border-white/30 bg-black/40 rounded px-4 py-2">
              Bulk discounts available — order 2+ and save up to 15%
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-base min-h-screen py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <main
              id="main-content"
              ref={formSectionRef}
              aria-label="Build your soap"
              className="page-enter relative animate-enter delay-2"
            >
              <div className="card-apothecary p-6 md:p-10">
                <SoapForm
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onGoToCart={() => navigate({ to: '/cart' })}
                  onGoToCheckout={() => navigate({ to: '/checkout' })}
                />
              </div>
            </main>

            <footer className="mt-14 text-center animate-enter delay-3">
              <p className="font-display italic text-ink-500 text-lg mb-4">
                &ldquo;Made with love and nature&apos;s botanicals&rdquo;
              </p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    document.title = 'Lord of the Rinse';
  },
  component: IndexContent,
});
