import React, { useState, useEffect, useRef } from 'react';
import { SoapScent, SoapColor, OrderFormState, SOAP_OPTIONS, DEFAULT_SIZE, LAVENDER_PIECES_PRICE } from '../../types';
import { useCart } from '../hooks/useCart';
import { Customer } from '../types/webhook';
import { submitCartToWebhook } from '../services/webhook';
import { ShoppingCart, Check, Sparkles, ArrowRight, ArrowLeft, Leaf, Trash2 } from 'lucide-react';

const SIZE_OPTIONS = [
  { label: 'S', weight: 50 },
  { label: 'M', weight: 75 },
  { label: 'L', weight: 100 },
];

const INITIAL_STATE: OrderFormState = {
  scent: null,
  color: null,
  quantity: '',
  size: DEFAULT_SIZE,
  hasLavenderPieces: false,
  customerName: '',
  customerEmail: '',
  customerPhone: ''
};

const SCENT_INFO: Record<string, { description: string; tip: string }> = {
  'Lavender': { description: 'Calming & relaxing', tip: 'Great for bedtime' },
  'Coconut': { description: 'Tropical & hydrating', tip: 'Leaves skin silky smooth' },
  'Lemongrass': { description: 'Fresh & uplifting', tip: 'Invigorating citrus scent' }
};

const COLOR_OPTIONS = [
  { label: SoapColor.WHITE, class: 'bg-slate-50 border-slate-200', hex: '#f8fafc' },
  { label: SoapColor.RED, class: 'bg-red-100 border-red-200', hex: '#fee2e2' },
  { label: SoapColor.ORANGE, class: 'bg-orange-100 border-orange-200', hex: '#ffedd5' },
  { label: SoapColor.YELLOW, class: 'bg-yellow-100 border-yellow-200', hex: '#fef9c3' },
  { label: SoapColor.GREEN, class: 'bg-green-100 border-green-200', hex: '#dcfce7' },
  { label: SoapColor.BLUE, class: 'bg-blue-100 border-blue-200', hex: '#dbeafe' },
  { label: SoapColor.PURPLE, class: 'bg-purple-100 border-purple-200', hex: '#f3e8ff' },
];

type FormStep = 'landing' | 'scent' | 'color' | 'quantity';
type PageType = 'landing' | 'form' | 'cart' | 'checkout' | 'confirmation';

interface SavedFormState {
  scent: string | null;
  color: string | null;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  currentStep: FormStep;
}

const FORM_STATE_KEY = 'soap_form_state';

const CheckoutPage: React.FC<{
  cart: { items: any[]; totalQuantity: number };
  onBack: () => void;
  onSubmit: (customer: Customer) => Promise<void>;
  isSubmitting: boolean;
}> = ({ cart, onBack, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/.test(phone);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountPercentage = cart.totalQuantity >= 4 ? 15 : cart.totalQuantity >= 2 ? 10 : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const total = subtotal - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (formData.name.trim().length < 2) newErrors.name = 'Please enter your name';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    await onSubmit({ name: formData.name, email: formData.email, phone: formData.phone });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-6 px-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-[#5D4E37] mb-6 text-lg font-medium">
          <ArrowLeft className="w-6 h-6" />Back to Order Form
        </button>
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-[#5D4E37] p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-white/80 mt-1">{cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''} in your order</p>
          </div>
          <div className="p-6">
            <div className="bg-[#FAF8F5] rounded-2xl p-4 mb-6 space-y-3">
              {cart.items.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center">
                  <div><p className="font-medium text-[#3D3425]">{item.scent}</p><p className="text-sm text-gray-500">{item.color} • {item.size}g × {item.quantity}</p></div>
                  <p className="font-bold text-[#5D4E37]">Rs. {item.price * item.quantity}</p>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">Rs. {subtotal}</span></div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Discount ({discountPercentage}%)</span><span>- Rs. {discountAmount}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-[#5D4E37]">
                <span>Total</span><span>Rs. {total}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[#3D3425] font-medium mb-2">Your Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} onFocus={() => setErrors(prev => ({ ...prev, name: undefined }))} placeholder="Enter your full name" className={`w-full p-4 rounded-xl border-2 text-lg ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:border-[#5D4E37] outline-none`} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[#3D3425] font-medium mb-2">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} onFocus={() => setErrors(prev => ({ ...prev, email: undefined }))} placeholder="Enter your email" className={`w-full p-4 rounded-xl border-2 text-lg ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:border-[#5D4E37] outline-none`} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-[#3D3425] font-medium mb-2">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} onFocus={() => setErrors(prev => ({ ...prev, phone: undefined }))} placeholder="Enter your phone number" className={`w-full p-4 rounded-xl border-2 text-lg ${errors.phone ? 'border-red-300' : 'border-gray-200'} focus:border-[#5D4E37] outline-none`} />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-xl font-bold text-xl text-white bg-[#5D4E37] hover:bg-[#4A3F2D] transition-colors disabled:opacity-50">
                {isSubmitting ? 'Processing...' : `Submit Order - Rs. ${total}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage: React.FC<{
  cart: { items: any[]; totalQuantity: number };
  onBackToForm: () => void;
  onCheckout: () => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}> = ({ cart, onBackToForm, onCheckout, onRemoveItem, onClearCart }) => {
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountPercentage = cart.totalQuantity >= 4 ? 15 : cart.totalQuantity >= 2 ? 10 : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-6 px-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBackToForm} className="flex items-center gap-2 text-[#5D4E37] mb-6 text-lg font-medium">
          <ArrowLeft className="w-6 h-6" />Back to Order Form
        </button>
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-[#5D4E37] p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <p className="text-white/80 mt-1">{cart.totalQuantity} soap{cart.totalQuantity !== 1 ? 's' : ''} in your order</p>
          </div>
          <div className="p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
                <button onClick={onBackToForm} className="px-8 py-4 rounded-xl font-bold text-xl text-white bg-[#5D4E37]">Start Ordering</button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-2xl">
                      <div className="flex-1">
                        <p className="font-bold text-[#3D3425] text-lg">{item.scent}</p>
                        <p className="text-gray-500">{item.color} • {item.size}g • Qty: {item.quantity}</p>
                        {item.hasLavenderPieces && <span className="text-sm text-green-600">+ Lavender Pieces</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-[#5D4E37] text-lg">Rs. {item.price * item.quantity}</p>
                        <button onClick={() => onRemoveItem(item.id)} className="p-3 bg-red-100 text-red-600 rounded-full"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {discountPercentage > 0 && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 mb-4 border-2 border-green-300 animate-pulse">
                    <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-lg">
                      <Sparkles className="w-6 h-6" />Bulk Discount Applied!<Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-green-600 text-center text-sm mt-2">{discountPercentage}% OFF on {cart.totalQuantity} soaps</p>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-gray-600 mb-2"><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600 mb-2 font-medium">
                      <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Discount ({discountPercentage}%)</span><span>- Rs. {discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-[#5D4E37]"><span>Total</span><span>Rs. {total}</span></div>
                </div>
                <div className="space-y-3">
                  <button onClick={onCheckout} className="w-full py-5 rounded-xl font-bold text-xl text-white bg-[#5D4E37]">Proceed to Checkout - Rs. {total}</button>
                  <button onClick={onClearCart} className="w-full py-4 rounded-xl font-bold text-lg border-2 border-red-300 text-red-600 hover:bg-red-50">Clear Cart</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationPage: React.FC<{ itemCount: number; onContinue: () => void }> = ({ itemCount, onContinue }) => (
  <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-[#3D3425] mb-4">Thank You!</h1>
      <p className="text-xl text-gray-600 mb-2">Your order has been submitted.</p>
      <p className="text-gray-500 mb-8">{itemCount} soap{itemCount !== 1 ? 's' : ''} ordered</p>
      <button onClick={onContinue} className="w-full py-5 rounded-xl font-bold text-xl text-white bg-[#5D4E37]">Order More Soaps</button>
    </div>
  </div>
);

export const SoapForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('landing');
  const { cart, addItem, removeItem, clearCart } = useCart();
  const [page, setPage] = useState<PageType>('landing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationItemCount, setConfirmationItemCount] = useState(0);
  const [hasVisited, setHasVisited] = useState(false);

  const flavorSectionRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const lavenderSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);
  const quantitySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const visited = localStorage.getItem('soap_visited');
    if (!visited) {
      setHasVisited(false);
    } else {
      setHasVisited(true);
    }
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem(FORM_STATE_KEY);
    if (savedState && hasVisited) {
      try {
        const parsed: SavedFormState = JSON.parse(savedState);
        setFormData(prev => ({
          ...prev,
          scent: parsed.scent as SoapScent,
          color: parsed.color as SoapColor,
          quantity: parsed.quantity,
          size: parsed.size,
          hasLavenderPieces: parsed.hasLavenderPieces
        }));
        if (parsed.currentStep && parsed.currentStep !== 'landing') {
          setCurrentStep(parsed.currentStep);
          setPage('form');
        }
      } catch (e) {}
    }
  }, [hasVisited]);

  useEffect(() => {
    const stateToSave: SavedFormState = {
      scent: formData.scent,
      color: formData.color,
      quantity: formData.quantity,
      size: formData.size,
      hasLavenderPieces: formData.hasLavenderPieces,
      currentStep
    };
    localStorage.setItem(FORM_STATE_KEY, JSON.stringify(stateToSave));
    localStorage.setItem('soap_visited', 'true');
  }, [formData, currentStep]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleScentChange = (scent: SoapScent) => {
    setFormData(prev => ({
      ...prev,
      scent
    }));
    setTimeout(() => scrollToSection(sizeSectionRef), 300);
  };

  const handleSizeChange = (size: number) => {
    setFormData(prev => ({ ...prev, size }));
    setTimeout(() => scrollToSection(lavenderSectionRef), 300);
  };

  const handleContinueFromLanding = () => {
    setCurrentStep('scent');
    setPage('form');
    setTimeout(() => scrollToSection(flavorSectionRef), 300);
  };

  const handleContinueFromScent = () => {
    if (formData.scent && formData.size > 0) {
      setCurrentStep('color');
      setTimeout(() => scrollToSection(colorSectionRef), 300);
    }
  };

  const handleColorChange = (color: SoapColor) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleContinueFromColor = () => {
    if (formData.color) {
      setCurrentStep('quantity');
      setTimeout(() => scrollToSection(quantitySectionRef), 300);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, quantity: value }));
  };

  const isScentStepValid = formData.scent && formData.size > 0;
  const isFormValid = formData.scent && formData.color && formData.size > 0 && formData.quantity.length > 0 && parseInt(formData.quantity, 10) > 0;
  const isButtonDisabled = !isFormValid;

  const getPriceForScent = (scent: SoapScent, size: number): number => {
    const option = SOAP_OPTIONS.find(o => o.scent === scent);
    const basePrice = option?.price || 0;
    const ratio = size / 100;
    return Math.round(basePrice * ratio);
  };

  const getTotalPrice = (): number => {
    if (!formData.scent) return 0;
    const scentPrice = getPriceForScent(formData.scent, formData.size);
    return formData.hasLavenderPieces ? scentPrice + LAVENDER_PIECES_PRICE : scentPrice;
  };

  const handleAddToCart = () => {
    if (!isFormValid) return;
    const price = getTotalPrice();
    const success = addItem(formData.scent!, price, formData.color!, formData.quantity, formData.size, formData.hasLavenderPieces);

    if (success) {
      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 2000);
      setFormData(INITIAL_STATE);
      setCurrentStep('scent');
      setPage('cart');
      setTimeout(() => scrollToSection(flavorSectionRef), 300);
    }
  };

  const handleCheckout = async (customer: Customer) => {
    setIsSubmitting(true);
    try {
      const result = await submitCartToWebhook(customer, cart.items);
      if (result.success) {
        setConfirmationItemCount(cart.totalQuantity);
        clearCart();
        localStorage.removeItem(FORM_STATE_KEY);
        setFormData(INITIAL_STATE);
        setCurrentStep('scent');
        setPage('confirmation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAfterConfirmation = () => {
    setCurrentStep('scent');
    setPage('form');
    setTimeout(() => scrollToSection(flavorSectionRef), 300);
  };

  const handleGoToForm = () => {
    setPage('form');
    setTimeout(() => scrollToSection(flavorSectionRef), 300);
  };

  const currentPrice = formData.scent ? getTotalPrice() : 0;

  if (page === 'cart') {
    return <CartPage cart={cart} onBackToForm={handleGoToForm} onCheckout={() => setPage('checkout')} onRemoveItem={removeItem} onClearCart={clearCart} />;
  }

  if (page === 'checkout') {
    return <CheckoutPage cart={cart} onBack={handleGoToForm} onSubmit={handleCheckout} isSubmitting={isSubmitting} />;
  }

  if (page === 'confirmation') {
    return <ConfirmationPage itemCount={confirmationItemCount} onContinue={handleContinueAfterConfirmation} />;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountPercentage = cart.totalQuantity >= 4 ? 15 : cart.totalQuantity >= 2 ? 10 : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const cartTotal = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {showAddedToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
          <Check className="w-5 h-5" />Added to cart!
        </div>
      )}

      <div className="max-w-lg mx-auto pt-4 px-4 pb-36">
        {currentStep === 'landing' && (!hasVisited || cart.totalQuantity === 0) ? (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-[#5D4E37] p-8 text-white text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Homemade Plant-Based Soaps</h1>
              <p className="text-white/80 text-lg">Create your own organic soap with natural ingredients</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-[#FAF8F5] rounded-2xl p-5">
                <h2 className="text-xl font-bold text-[#3D3425] mb-4 flex items-center gap-2">
                  <span className="bg-[#5D4E37] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>Choose Scent & Size
                </h2>
                <p className="text-gray-600 ml-10">Pick from 3 natural scents in 3 sizes (50g, 75g, 100g)</p>
              </div>
              <div className="bg-[#FAF8F5] rounded-2xl p-5">
                <h2 className="text-xl font-bold text-[#3D3425] mb-4 flex items-center gap-2">
                  <span className="bg-[#5D4E37] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>Pick a Color
                </h2>
                <p className="text-gray-600 ml-10">Choose from 7 beautiful colors for your soap</p>
              </div>
              <div className="bg-[#FAF8F5] rounded-2xl p-5">
                <h2 className="text-xl font-bold text-[#3D3425] mb-4 flex items-center gap-2">
                  <span className="bg-[#5D4E37] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>Set Quantity
                </h2>
                <p className="text-gray-600 ml-10">Order multiple soaps and get bulk discounts!</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <Leaf className="w-6 h-6" />100% Natural Ingredients
                </div>
              </div>
              <button onClick={handleContinueFromLanding} className="w-full py-5 rounded-xl font-bold text-xl text-white bg-[#5D4E37] hover:bg-[#4A3F2D] transition-colors flex items-center justify-center gap-2">
                Start Creating Soaps<ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-4">
              <div className="bg-[#5D4E37] p-5 text-white">
                <h1 className="text-2xl font-bold">Homemade Plant-Based Soaps</h1>
              </div>
              <div className="p-4 bg-[#FAF8F5] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <button onClick={() => setPage('cart')} className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl font-medium text-[#5D4E37] border-2 border-[#5D4E37]">
                    <ShoppingCart className="w-5 h-5" />View Cart ({cart.totalQuantity})
                  </button>
                  <button onClick={() => setPage('checkout')} disabled={cart.totalQuantity === 0} className="flex-1 ml-3 py-3 rounded-xl font-bold text-white bg-[#5D4E37] hover:bg-[#4A3F2D] transition-colors disabled:opacity-50">
                    Checkout - Rs. {cartTotal}
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  {['scent', 'color', 'quantity'].map((step, index, arr) => (
                    <React.Fragment key={step}>
                      {index > 0 && <div className="flex-1 h-2 bg-gray-200 mx-2 rounded" />}
                      <div className={`flex flex-col items-center ${currentStep === step ? 'text-[#5D4E37]' : index < arr.indexOf(currentStep) ? 'text-green-500' : 'text-gray-300'}`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all ${index < arr.indexOf(currentStep) ? 'bg-green-500 text-white' : currentStep === step ? 'bg-[#5D4E37] text-white' : 'bg-gray-200'}`}>
                          {index < arr.indexOf(currentStep) ? <Check className="w-7 h-7" /> : index + 1}
                        </div>
                        <span className="text-xs mt-2 font-medium text-center">{step === 'scent' ? 'Scent' : step.charAt(0).toUpperCase() + step.slice(1)}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div ref={flavorSectionRef} className="space-y-6">
                  <p className="text-lg font-medium text-[#3D3425]">Pick a scent:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {SOAP_OPTIONS.map((option) => {
                      const info = SCENT_INFO[option.scent];
                      const isSelected = formData.scent === option.scent;
                      return (
                        <button key={option.scent} onClick={() => handleScentChange(option.scent)} className={`p-4 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-[#5D4E37] bg-[#FAF8F5]' : 'border-gray-200 bg-white'}`}>
                          <span className="font-bold text-[#3D3425] block">{option.scent}</span>
                          <span className="text-sm text-gray-500">{info.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.scent && (
                  <div ref={sizeSectionRef} className="space-y-6 mt-8">
                    <p className="text-lg font-medium text-[#3D3425]">Pick a size:</p>
                    <div className="flex gap-3">
                      {SIZE_OPTIONS.map((option) => (
                        <button key={option.label} onClick={() => handleSizeChange(option.weight)} className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${formData.size === option.weight ? 'bg-[#5D4E37] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {option.label} ({option.weight}g)
                        </button>
                      ))}
                    </div>
                    <div ref={lavenderSectionRef} className="space-y-4">
                      <button onClick={() => setFormData(prev => ({ ...prev, hasLavenderPieces: !prev.hasLavenderPieces }))} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${formData.hasLavenderPieces ? 'border-[#5D4E37] bg-[#FAF8F5]' : 'border-gray-200'}`}>
                        <span className="font-medium text-[#3D3425]">Add Lavender Pieces (+Rs. {LAVENDER_PIECES_PRICE})</span>
                        {formData.hasLavenderPieces && <Check className="w-6 h-6 text-[#5D4E37]" />}
                      </button>
                      <div className="bg-[#FAF8F5] p-4 rounded-xl flex justify-between items-center">
                        <span className="text-[#3D3425]">{formData.size}g {formData.scent}</span>
                        <span className="text-xl font-bold text-[#5D4E37]">Rs. {getTotalPrice()}</span>
                      </div>
                      <button onClick={handleContinueFromScent} disabled={!isScentStepValid} className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-colors ${isScentStepValid ? 'bg-[#5D4E37] hover:bg-[#4A3F2D]' : 'bg-gray-300 cursor-not-allowed'}`}>
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 'color' && (
                  <div ref={colorSectionRef} className="space-y-6 mt-8">
                    <div className="text-center">
                      <p className="text-lg font-medium text-[#3D3425]">Choose Color</p>
                      <p className="text-gray-500">{formData.scent} • {formData.size}g • Rs. {currentPrice}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center py-4">
                      {COLOR_OPTIONS.map((option) => {
                        const isSelected = formData.color === option.label;
                        return (
                          <button key={option.label} onClick={() => handleColorChange(option.label)} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${isSelected ? 'bg-[#FAF8F5] ring-2 ring-[#5D4E37]' : ''}`}>
                            <div className={`w-16 h-16 rounded-full shadow-md border-4 ${option.class} ${isSelected ? 'border-[#5D4E37]' : 'border-transparent'}`} style={{ backgroundColor: option.hex }}>
                              {isSelected && <span className="flex items-center justify-center h-full"><Check className="w-8 h-8 text-white" /></span>}
                            </div>
                            <span className="text-sm font-medium text-[#3D3425]">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setCurrentStep('scent')} className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-600">Back</button>
                      <button onClick={handleContinueFromColor} disabled={!formData.color} className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors ${formData.color ? 'bg-[#5D4E37]' : 'bg-gray-300 cursor-not-allowed'}`}>
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 'quantity' && formData.scent && formData.color && (
                  <div ref={quantitySectionRef} className="space-y-6 mt-8">
                    <div className="text-center">
                      <p className="text-lg font-medium text-[#3D3425]">How Many Soaps?</p>
                      <p className="text-gray-500">{formData.scent} • {formData.size}g • {formData.color} • Rs. {currentPrice} each</p>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <input type="text" inputMode="numeric" value={formData.quantity} onChange={handleQuantityChange} placeholder="0" className="w-28 p-4 text-center text-4xl font-bold rounded-2xl border-2 border-gray-200 bg-[#FAF8F5]" autoFocus />
                      <span className="text-2xl font-medium text-gray-500">soaps</span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 5, 10].map((num) => (
                        <button key={num} onClick={() => setFormData(prev => ({ ...prev, quantity: String(num) }))} className={`px-5 py-3 rounded-xl font-medium transition-all ${formData.quantity === String(num) ? 'bg-[#5D4E37] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {num}
                        </button>
                      ))}
                    </div>
                    {formData.quantity && parseInt(formData.quantity, 10) > 0 && (() => {
                      const qty = parseInt(formData.quantity, 10);
                      const subtotal = currentPrice * qty;
                      const totalQty = qty + cart.totalQuantity;
                      const discountPercent = totalQty >= 4 ? 15 : totalQty >= 2 ? 10 : 0;
                      const discountAmt = Math.round(subtotal * (discountPercent / 100));
                      const total = subtotal - discountAmt;
                      return (
                        <div className="bg-[#FAF8F5] p-4 rounded-xl space-y-3">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({qty} soaps):</span><span>Rs. {subtotal}</span>
                          </div>
                          {discountPercent > 0 ? (
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 border-2 border-green-300">
                              <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
                                <Sparkles className="w-5 h-5" />BULK DISCOUNT APPLIED!<Sparkles className="w-5 h-5" />
                              </div>
                              <p className="text-green-600 text-center text-sm mt-1">{discountPercent}% OFF = Rs. {discountAmt} savings</p>
                              <div className="flex justify-between text-xl font-bold text-[#5D4E37] pt-2 border-t border-green-200 mt-2">
                                <span>Total:</span><span>Rs. {total}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between text-orange-600 font-medium text-sm">
                              <span>Add {2 - qty} more for 10% OFF or {4 - qty} more for 15% OFF!</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex gap-3">
                      <button onClick={() => setCurrentStep('color')} className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-600">Back</button>
                      <button onClick={handleAddToCart} disabled={isButtonDisabled} className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors ${!isButtonDisabled ? 'bg-[#5D4E37]' : 'bg-gray-300 cursor-not-allowed'}`}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
