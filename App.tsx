import { useRef, useCallback, useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { SoapForm } from './src/components/SoapForm';
import { useCart } from './src/hooks/useCart';
import { submitCartToWebhook } from './src/services/webhook';
import { useFormPersistence } from './src/hooks/useFormPersistence';
import type { Customer } from './src/types/webhook';

const CartPage = lazy(() => import('./src/components/CartPage'));
const CheckoutPage = lazy(() => import('./src/components/CheckoutPage'));
const ConfirmationPage = lazy(() => import('./src/components/ConfirmationPage'));

function App() {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const { cart, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const { clearFormState } = useFormPersistence();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationItemCount, setConfirmationItemCount] = useState(0);
  const [justOrdered, setJustOrdered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const handleShopClick = useCallback(() => {
    setShowLanding(false);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const handleAddToCart = useCallback((
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
  ) => {
    const success = addItem(shape, scent, price, color, quantity, size, hasLavenderPieces);
    if (success) {
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
        setJustOrdered(true);
        clearCart();
        clearFormState();
        navigate('/confirmation');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error("Order submission failed");
      }
    } catch (err) {
      console.error("Order submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, clearCart, clearFormState, navigate]);

  const handleDismissOrdered = useCallback(() => {
    setJustOrdered(false);
  }, []);

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
              backgroundImage: "url('https://i.postimg.cc/ydxpFVKV/Gemini-Generated-Image-umgfgkumgfgkumgf.png')",
              backgroundPosition: 'center top',
              animation: 'fadeIn 0.5s ease-out'
            }}
          />
          <div className="absolute inset-0 hidden md:block bg-cover bg-center bg-no-repeat transition-opacity duration-300"
            style={{ 
              backgroundImage: "url('https://i.postimg.cc/vZ8HvbFP/Gemini-Generated-Image-iz8f8oiz8f8oiz8f.png')",
              animation: 'fadeIn 0.5s ease-out'
            }}
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 md:pb-0 md:justify-center">
            <button
              type="button"
              onClick={handleShopClick}
              className="btn-apothecary btn-primary text-base px-10 py-4 animate-enter delay-5"
            >
              Shop Now
            </button>
            <p className="text-white/90 text-sm mt-4 font-accent tracking-wider border border-white/30 bg-black/20 rounded px-4 py-2">
              Bulk discounts available — order 3+ and save up to 15%
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-base min-h-screen py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={
                <>
                  {/* Form section */}
                  <main id="main-content" ref={formSectionRef} aria-label="Build your soap" className="page-enter relative animate-enter delay-2">
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
                    <p className="font-display italic text-ink-500 text-lg mb-4">
                      &ldquo;Made with love and nature&apos;s botanicals&rdquo;
                    </p>
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
                    onUpdateQuantity={updateQuantity}
                    justOrdered={justOrdered}
                    orderedItemCount={confirmationItemCount}
                    onDismissOrdered={handleDismissOrdered}
                  />
                </Suspense>
              } />

              <Route path="/checkout" element={
                cart.totalQuantity === 0 ? (
                  <Navigate to="/cart" replace />
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
      )}
    </div>
  );
}

export default App;
