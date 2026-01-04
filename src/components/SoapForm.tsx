import React, { useState } from 'react';
import { SoapScent, SoapColor, OrderFormState } from '../../types';
import { useCart } from '../hooks/useCart';
import { Cart, CartBadge } from './Cart';
import { ShoppingCart, Check, AlertCircle, Copy, Plus, X } from 'lucide-react';

const INITIAL_STATE: OrderFormState = {
  scent: null,
  customScent: '',
  color: null,
  quantity: '',
  customerName: '',
  customerEmail: '',
  customerPhone: ''
};

const SCENT_OPTIONS = [
  SoapScent.LAVENDER,
  SoapScent.ALOE_VERA,
  SoapScent.COCONUT,
  SoapScent.COFFEE,
  SoapScent.CLOVE,
  SoapScent.CINNAMON,
  SoapScent.LEMONGRASS,
  SoapScent.TURMERIC,
  SoapScent.HONEY,
  SoapScent.CUSTOM
];

const COLOR_OPTIONS = [
  { label: SoapColor.WHITE, class: 'bg-slate-50 border-slate-200' },
  { label: SoapColor.RED, class: 'bg-red-100 border-red-200' },
  { label: SoapColor.ORANGE, class: 'bg-orange-100 border-orange-200' },
  { label: SoapColor.YELLOW, class: 'bg-yellow-100 border-yellow-200' },
  { label: SoapColor.GREEN, class: 'bg-green-100 border-green-200' },
  { label: SoapColor.BLUE, class: 'bg-blue-100 border-blue-200' },
  { label: SoapColor.PURPLE, class: 'bg-purple-100 border-purple-200' },
];

export const SoapForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const { cart, addItem, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();

  const handleScentChange = (scent: SoapScent) => {
    setFormData(prev => ({ 
      ...prev, 
      scent,
      color: (scent === SoapScent.COFFEE || scent === SoapScent.TURMERIC) ? SoapColor.WHITE : prev.color
    }));
  };

  const handleColorChange = (color: SoapColor) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, quantity: value }));
  };

  const isFormValid = 
    formData.scent && 
    (formData.scent !== SoapScent.CUSTOM || formData.customScent.trim().length > 0) &&
    formData.color &&
    formData.quantity.length > 0;

  const handleAddToCart = () => {
    if (!isFormValid) return;

    const success = addItem(
      formData.scent!,
      formData.customScent,
      formData.color!,
      formData.quantity
    );

    if (success) {
      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 2000);

      setFormData(prev => ({
        ...prev,
        scent: null,
        customScent: '',
        color: null,
        quantity: ''
      }));
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-72">
      
      {showAddedToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Added to your cart!
        </div>
      )}

      <Cart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />

      {cart.totalQuantity > 0 && (
        <div className="fixed bottom-24 right-4 z-40">
          <CartBadge count={cart.totalQuantity} onClick={() => setIsCartOpen(true)} />
        </div>
      )}

      <section className="bg-white rounded-2xl p-8 shadow-sm border border-earth-100 transition-all hover:shadow-md">
        <h2 className="text-2xl font-serif font-bold mb-6 text-earth-800 flex items-center gap-3">
          <span className="bg-earth-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">1</span>
          Choose your soap scent
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SCENT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleScentChange(option)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between
                ${formData.scent === option 
                  ? 'border-earth-500 bg-earth-50 text-earth-800 font-semibold shadow-inner' 
                  : 'border-gray-100 hover:border-earth-300 text-gray-600 hover:bg-gray-50'}
              `}
            >
              <span>{option}</span>
              {(option === SoapScent.LAVENDER || option === SoapScent.ALOE_VERA || option === SoapScent.COCONUT || option === SoapScent.HONEY) && (
                <span className="text-xs text-earth-600 font-medium">recommended</span>
              )}
              {formData.scent === option && <Check className="w-5 h-5 text-earth-600" />}
            </button>
          ))}
        </div>

        {formData.scent === SoapScent.CUSTOM && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <label htmlFor="custom-scent" className="block text-sm font-medium text-gray-700 mb-2">
              What scent would you like? (Tell us the ingredients)
            </label>
            <input
              type="text"
              id="custom-scent"
              value={formData.customScent}
              onChange={(e) => setFormData(prev => ({ ...prev, customScent: e.target.value }))}
              placeholder="For example: Lavender & Honey, or Vanilla Bean"
              className="w-full p-4 rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all"
              autoFocus
            />
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl p-8 shadow-sm border border-earth-100 transition-all hover:shadow-md">
        <h2 className="text-2xl font-serif font-bold mb-2 text-earth-800 flex items-center gap-3">
          <span className="bg-earth-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">2</span>
          Pick a color for your soap
        </h2>
        <p className="text-gray-500 mb-6 ml-11 text-sm italic">All colors are from natural ingredients.</p>
        
        {(formData.scent === SoapScent.COFFEE || formData.scent === SoapScent.TURMERIC) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 ml-11 text-sm text-amber-800">
            This scent has its own natural color — we recommend White.
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleColorChange(option.label)}
              className={`
                group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                ${formData.color === option.label ? 'ring-2 ring-earth-400 bg-gray-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className={`
                w-16 h-16 rounded-full shadow-sm border-2 transition-transform duration-300 group-hover:scale-105
                ${option.class}
                ${formData.color === option.label ? 'border-earth-400 scale-105' : 'border-transparent'}
              `}>
                {formData.color === option.label && (
                   <span className="absolute inset-0 flex items-center justify-center">
                     <Check className="w-8 h-8 text-black/20" />
                   </span>
                 )}
              </div>
              <span className={`text-sm font-medium ${formData.color === option.label ? 'text-earth-800' : 'text-gray-500'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-8 shadow-sm border border-earth-100 transition-all hover:shadow-md">
        <h2 className="text-2xl font-serif font-bold mb-2 text-earth-800 flex items-center gap-3">
          <span className="bg-earth-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">3</span>
          How many soaps would you like?
        </h2>
        
        <div className="flex items-center gap-4 max-w-xs ml-11">
          <div className="relative w-full">
            <input
              type="text"
              inputMode="numeric"
              value={formData.quantity}
              onChange={handleQuantityChange}
              placeholder="0"
              className="w-full p-4 pr-20 text-2xl font-bold text-center rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
              soaps
            </span>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-earth-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 hidden md:block">
              {cart.totalQuantity > 0 
                ? `You have ${cart.totalQuantity} soap${cart.totalQuantity > 1 ? 's' : ''} in your cart`
                : 'Add soaps to your cart to order'}
            </div>
            
            {cart.totalQuantity > 0 ? (
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="flex-1 md:flex-none px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all bg-earth-100 text-earth-700 hover:bg-earth-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  View Cart ({cart.totalQuantity})
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isFormValid}
                  className={`
                    flex-1 md:flex-none px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all
                    ${isFormValid 
                      ? 'bg-earth-600 text-white hover:bg-earth-700 shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  <Plus className="w-5 h-5" />
                  Add More Soaps
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isFormValid}
                className={`
                  w-full md:w-auto px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all
                  ${isFormValid 
                    ? 'bg-earth-600 text-white hover:bg-earth-700 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'}
                `}
              >
                <Plus className="w-5 h-5" />
                Add to Cart
              </button>
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="bg-earth-50 rounded-xl p-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-earth-700">In your cart:</span>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="text-xs text-earth-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cart.items.slice(0, 5).map((item) => (
                  <span key={item.id} className="text-xs bg-white px-2 py-1 rounded border border-earth-200 text-gray-600">
                    {item.quantity}x {item.scent} ({item.color})
                  </span>
                ))}
                {cart.items.length > 5 && (
                  <span className="text-xs text-gray-500 py-1">
                    +{cart.items.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
