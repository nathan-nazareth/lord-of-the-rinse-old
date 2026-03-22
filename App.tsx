import React, { useRef, useCallback, useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import Hero from './src/components/Hero';
import { SoapForm } from './src/components/SoapForm';
import { useCart } from './src/hooks/useCart';
import { submitCartToWebhook } from './src/services/webhook';
import { useFormPersistence } from './src/hooks/useFormPersistence';
import { Customer } from './src/types/webhook';

const CartPage = lazy(() => import('./src/components/CartPage'));
const CheckoutPage = lazy(() => import('./src/components/CheckoutPage'));
const ConfirmationPage = lazy(() => import('./src/components/ConfirmationPage'));

function App() {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const { cart, addItem, removeItem, clearCart } = useCart();
  const { clearFormState } = useFormPersistence();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationItemCount, setConfirmationItemCount] = useState(0);
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  const handleShopClick = useCallback(() => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleAddToCart = useCallback((
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
    hasRosePieces: boolean,
  ) => {
    const success = addItem(scent, price, color, quantity, size, hasLavenderPieces, hasRosePieces);
    if (success) {
      setJustAddedToCart(true);
      navigate('/cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [addItem, navigate]);

  const handleCheckout = useCallback(async (customer: Customer) => {
    setIsSubmitting(true);
    try {
      const result = await submitCartToWebhook(customer, cart.items);
      if (result.success) {
        setConfirmationItemCount(cart.totalQuantity);
        clearCart();
        clearFormState();
        navigate('/confirmation');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, clearCart, clearFormState, navigate]);

  return (
    <div className="apothecary-bg">
      <div className="relative z-base min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={
              <>
                {/* Hero section */}
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

                {/* Form section */}
                <main id="main-content" ref={formSectionRef} role="main" aria-label="Build your soap" className="page-enter relative animate-enter delay-2">
                  <div className="card-apothecary p-6 md:p-10">
                    <SoapForm
                      cart={cart}
                      onAddToCart={handleAddToCart}
                      onGoToCart={() => navigate('/cart')}
                      onGoToCheckout={() => navigate('/checkout')}
                    />
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
              </>
            } />

            <Route path="/cart" element={
              <Suspense fallback={<div className="min-h-screen bg-parchment-100" />}>
                <CartPage
                  cart={cart}
                  onBackToForm={() => { navigate('/'); setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
                  onCheckout={() => navigate('/checkout')}
                  onRemoveItem={removeItem}
                  onClearCart={clearCart}
                  justAdded={justAddedToCart}
                />
              </Suspense>
            } />

            <Route path="/checkout" element={
              cart.totalQuantity === 0 ? (
                <>{navigate('/cart', { replace: true })}</>
              ) : (
                <Suspense fallback={<div className="min-h-screen bg-parchment-100" />}>
                  <CheckoutPage
                    cart={cart}
                    onBack={() => navigate('/cart')}
                    onSubmit={handleCheckout}
                    isSubmitting={isSubmitting}
                  />
                </Suspense>
              )
            } />

            <Route path="/confirmation" element={
              <Suspense fallback={<div className="min-h-screen bg-parchment-100" />}>
                <ConfirmationPage
                  itemCount={confirmationItemCount}
                  onContinue={() => { navigate('/'); setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
                />
              </Suspense>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
