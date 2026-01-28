import React, { useState, useEffect, useRef } from 'react';
import { SoapScent, SoapColor, OrderFormState, SOAP_OPTIONS, DEFAULT_SIZE, LAVENDER_PIECES_PRICE } from '../../types';
import { useCart } from '../hooks/useCart';
import { Customer } from '../types/webhook';
import { submitCartToWebhook } from '../services/webhook';
import { useFormRateLimit } from '../hooks/useFormRateLimit';
import { ShoppingCart, Check, Sparkles, Palette, Layers, ArrowRight, ArrowLeft, Leaf, Droplets, Plus, Scale, Info, Tag, X } from 'lucide-react';

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
  'Aloe Vera': { description: 'Soothing & gentle', tip: 'Perfect for sensitive skin' },
  'Coconut': { description: 'Tropical & hydrating', tip: 'Leaves skin silky smooth' },
  'Coffee': { description: 'Energizing & exfoliating', tip: 'Great morning shower scent' },
  'Clove': { description: 'Warm & spicy', tip: 'Unique aromatic experience' },
  'Cinnamon': { description: 'Cozy & warming', tip: 'Like a sweet treat' },
  'Lemongrass': { description: 'Fresh & uplifting', tip: 'Invigorating citrus scent' },
  'Turmeric': { description: 'Anti-inflammatory', tip: 'Traditional beauty secret' },
  'Honey': { description: 'Sweet & nourishing', tip: 'Naturally antibacterial' }
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

type FormStep = 'landing' | 'scent' | 'color' | 'quantity' | 'complete';
type PageType = 'form' | 'checkout' | 'confirmation';

const FORM_STATE_KEY = 'soap_form_state';

interface SavedFormState {
  scent: SoapScent | null;
  color: SoapColor | null;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  currentStep: FormStep;
}

const CheckoutPage: React.FC<{
  cart: { items: any[]; totalQuantity: number };
  onBack: () => void;
  onSubmit: (customer: Customer) => Promise<void>;
  isSubmitting: boolean;
}> = ({ cart, onBack, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
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

    if (formData.name.trim().length < 2) newErrors.name = 'Please enter your name (at least 2 characters)';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({ name: formData.name, email: formData.email, phone: formData.phone });
  };

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-natural-500 hover:text-sage-600 mb-6 transition-colors text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to form
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
          <div className="bg-[#5D4E37] p-6 text-white">
            <h1 className="text-2xl font-serif font-bold">Checkout</h1>
            <p className="text-white/80 mt-1">{cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''} in your order</p>
          </div>

          <div className="p-6">
            <div className="bg-cream-50 rounded-xl p-4 mb-6 space-y-2">
              {cart.items.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between text-sm">
                  <span className="text-natural-600">{item.scent} • {item.color} • {item.size}g × {item.quantity}</span>
                  <span className="font-medium text-natural-800">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-cream-200 pt-2 mt-2 flex justify-between">
                <span className="text-natural-600">Subtotal</span>
                <span className="font-medium">Rs. {subtotal}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-sage-600">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}
              <div className="border-t border-cream-200 pt-2 flex justify-between text-lg font-bold text-sage-700">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-natural-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  onFocus={() => setErrors(prev => ({ ...prev, name: undefined }))}
                  placeholder="Your full name"
                  className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:border-bark-500 focus:ring-2 focus:ring-earth-200 outline-none`}
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm text-natural-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => setErrors(prev => ({ ...prev, email: undefined }))}
                  placeholder="you@example.com"
                  className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:border-bark-500 focus:ring-2 focus:ring-earth-200 outline-none`}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-natural-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  onFocus={() => setErrors(prev => ({ ...prev, phone: undefined }))}
                  placeholder="(555) 123-4567"
                  className={`w-full p-3 rounded-lg border ${errors.phone ? 'border-red-300' : 'border-gray-300'} focus:border-bark-500 focus:ring-2 focus:ring-earth-200 outline-none`}
                  required
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-md transition-colors bg-[#5D4E37] hover:bg-[#4A3F2D] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Submit Order - Rs. {total}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationPage: React.FC<{
  itemCount: number;
  onContinue: () => void;
}> = ({ itemCount, onContinue }) => (
  <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-lg border border-cream-200 p-8 max-w-md w-full text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-bark-800 mb-4">Thank You!</h1>
      <p className="text-lg text-gray-600 mb-2">Your order has been submitted successfully.</p>
      <p className="text-gray-500 mb-8">{itemCount} soap{itemCount > 1 ? 's' : ''} ordered</p>
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-md transition-colors bg-[#5D4E37] hover:bg-[#4A3F2D]"
      >
        <Plus className="w-5 h-5" />
        Order Another Soap
      </button>
    </div>
  </div>
);

export const SoapForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('landing');
  const [showScentInfo, setShowScentInfo] = useState<string | null>(null);
  const showCartButtonsRef = useRef(false);
  const { cart, addItem, removeItem, clearCart } = useCart();
  const scentTooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<PageType>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationItemCount, setConfirmationItemCount] = useState(0);
  const [expandedBottomBar, setExpandedBottomBar] = useState(false);
  const bottomBarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localStorage.removeItem(FORM_STATE_KEY);
    try { localStorage.removeItem('soap_cart_state'); } catch (e) {}
  }, []);

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
  }, [formData, currentStep]);

  useEffect(() => {
    if (cart.totalQuantity > 0 && page === 'form' && !expandedBottomBar) {
      setExpandedBottomBar(true);
    }
  }, [cart.totalQuantity, page]);

  const handleClearCartAndReset = () => {
    clearCart();
    setFormData(INITIAL_STATE);
    setCurrentStep('landing');
    localStorage.removeItem(FORM_STATE_KEY);
    setExpandedBottomBar(false);
  };

  const handleScentChange = (scent: SoapScent) => {
    setFormData(prev => ({
      ...prev,
      scent,
      color: (scent === SoapScent.COFFEE || scent === SoapScent.TURMERIC) ? SoapColor.WHITE : prev.color
    }));
    setShowScentInfo(scent);
  };

  const handleSizeChange = (size: number) => {
    setFormData(prev => ({ ...prev, size }));
  };

  const handleMouseEnterScent = (scent: string) => {
    if (scentTooltipTimerRef.current) clearTimeout(scentTooltipTimerRef.current);
    scentTooltipTimerRef.current = setTimeout(() => setShowScentInfo(scent), 150);
  };

  const handleMouseLeaveScent = () => {
    if (scentTooltipTimerRef.current) clearTimeout(scentTooltipTimerRef.current);
    scentTooltipTimerRef.current = setTimeout(() => setShowScentInfo(null), 100);
  };

  const handleContinueFromLanding = () => setCurrentStep('scent');
  const handleContinueFromScent = () => formData.scent && formData.size > 0 && setCurrentStep('color');
  const handleColorChange = (color: SoapColor) => setFormData(prev => ({ ...prev, color }));
  const handleContinueFromColor = () => formData.color && setCurrentStep('quantity');

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
      showCartButtonsRef.current = true;
      setExpandedBottomBar(true);

      setFormData(prev => ({
        ...prev,
        scent: null,
        color: null,
        quantity: '',
        size: DEFAULT_SIZE,
        hasLavenderPieces: false
      }));
      setCurrentStep('scent');
    }
  };

  const handleCheckout = async (customer: Customer) => {
    setIsSubmitting(true);
    try {
      const result = await submitCartToWebhook(customer, cart.items);
      if (result.success) {
        setConfirmationItemCount(cart.totalQuantity);
        clearCart();
        setExpandedBottomBar(false);
        setPage('confirmation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAfterConfirmation = () => {
    setFormData(INITIAL_STATE);
    setCurrentStep('landing');
    setPage('form');
    setExpandedBottomBar(false);
  };

  if (page === 'checkout') {
    return (
      <CheckoutPage
        cart={cart}
        onBack={() => setPage('form')}
        onSubmit={handleCheckout}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (page === 'confirmation') {
    return <ConfirmationPage itemCount={confirmationItemCount} onContinue={handleContinueAfterConfirmation} />;
  }

  const currentPrice = formData.scent ? getTotalPrice() : 0;

  return (
    <div className="min-h-screen pb-32 px-4">
      <div className="max-w-4xl mx-auto pt-8">
        {showAddedToast && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Added to cart!
          </div>
        )}

        {cart.totalQuantity > 0 && (
          <button
            onClick={handleClearCartAndReset}
            className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear & Reset
          </button>
        )}

        {currentStep === 'landing' ? (
          <div className="parchment-paper rounded-2xl shadow-lg border border-cream-200 overflow-hidden animate-in fade-in zoom-in duration-500 relative">
            <div className="p-8 md:p-12 text-center border-b border-blush-100 pt-16">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-natural-800 mb-6 botanical-heading">
                Handcrafted Botanical Soaps
              </h1>
              <p className="text-xl text-natural-600 italic max-w-2xl mx-auto leading-relaxed">
                Create your own organic bar of soap using traditional recipes and natural ingredients
              </p>
            </div>

            <div className="p-10 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-natural-800 mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6 text-sage-600" />
                  How It Works
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-natural-700 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-natural-800">Choose Scent & Size</h3>
                      <p className="text-base text-natural-600 mt-1">Pick from 9 natural scents. Select your preferred size between 50-100g/ml.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-natural-700 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-natural-800">Pick a Color</h3>
                      <p className="text-base text-natural-600 mt-1">Select from 7 beautiful colors.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-natural-700 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-natural-800">Set Quantity</h3>
                      <p className="text-base text-natural-600 mt-1">Enter how many soaps you want. Mix and match to get bulk discounts!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-sage-50 rounded-xl p-5 border border-sage-100">
                <div className="flex items-center gap-3 text-sage-700 text-base">
                  <Leaf className="w-5 h-5" />
                  <span>100% natural coconut soap base</span>
                </div>
                <div className="flex items-center gap-3 text-sage-700 text-base mt-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Handmade with love in small batches</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-cream-100/50 border-t border-blush-200">
              <button
                type="button"
                onClick={handleContinueFromLanding}
                className="btn-soft w-full text-xl py-5 flex items-center justify-center gap-3 shadow-lg"
              >
                Start Building Soaps
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('landing')}
                className="flex items-center gap-1 text-lg text-natural-500 hover:text-sage-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex items-center gap-2">
                {['scent', 'color', 'quantity'].map((step, index, arr) => (
                  <React.Fragment key={step}>
                    {index > 0 && <div className="w-6 h-px bg-parchment-400" />}
                    <div className={`flex flex-col items-center min-w-[60px] ${currentStep === step ? 'text-jungle-400' : index < arr.indexOf(currentStep) ? 'text-jungle-500' : 'text-parchment-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${index < arr.indexOf(currentStep) ? 'bg-jungle-200 text-parchment-100' : currentStep === step ? 'bg-parchment-200 border-2 border-jungle-300' : 'bg-parchment-300'}`}>
                        {index < arr.indexOf(currentStep) ? <Check className="w-5 h-5" /> : <span className={`text-sm font-bold ${currentStep === step ? 'text-jungle-500' : ''}`}>{index + 1}</span>}
                      </div>
                      <span className="text-xs mt-2 font-medium text-center leading-tight max-w-[70px] text-natural-600">
                        {step === 'scent' ? 'Scent & Size' : step.charAt(0).toUpperCase() + step.slice(1)}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="w-16" />
            </div>

            {currentStep === 'scent' && (
              <div className="card-catalog p-8 md:p-10 pb-40">
                <h2 className="text-2xl font-serif font-bold mb-8 text-sage-700 flex items-center gap-4">
                  <span className="bg-sage-100 w-14 h-14 rounded-full flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-sage-600" />
                  </span>
                  Choose Your Scent & Size
                </h2>

                <div className="mb-6">
                  <p className="text-bark-500 mb-4 font-medium flex items-center gap-2">
                    <span className="text-lg">Pick a scent:</span>
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {SOAP_OPTIONS.map((option) => {
                      const info = SCENT_INFO[option.scent];
                      const isSelected = formData.scent === option.scent;
                      return (
                        <button
                          key={option.scent}
                          type="button"
                          onClick={() => handleScentChange(option.scent)}
                          onMouseEnter={() => handleMouseEnterScent(option.scent)}
                          onMouseLeave={handleMouseLeaveScent}
                          className={`p-4 rounded-xl border-2 text-left relative transition-all ${isSelected ? 'border-sage-400 bg-sage-100 shadow-md' : 'border-cream-200 bg-white hover:border-sage-300'}`}
                        >
                          {isSelected && <span className="absolute top-2 right-2 text-sage-600 text-lg">✓</span>}
                          <span className={`font-serif font-semibold text-lg block ${isSelected ? 'text-sage-700' : 'text-natural-700'}`}>{option.scent}</span>
                          <p className={`text-sm italic ${isSelected ? 'text-sage-600' : 'text-natural-500'}`}>{info.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.scent && (
                  <div className="border-t border-parchment-200 pt-6 mt-6">
                    <p className="text-bark-600 mb-3 font-medium">Pick a size:</p>
                    <div className="flex gap-3">
                      {SIZE_OPTIONS.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => handleSizeChange(option.weight)}
                          className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${formData.size === option.weight ? 'bg-sage-600 text-white border-sage-600' : 'bg-white text-natural-600 border-cream-300'}`}
                        >
                          {option.label} ({option.weight}g)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.scent && (
                  <div className="mt-6 pt-6 border-t border-cream-200">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hasLavenderPieces: !prev.hasLavenderPieces }))}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${formData.hasLavenderPieces ? 'border-sage-300 bg-sage-50' : 'border-cream-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${formData.hasLavenderPieces ? 'border-sage-300 bg-sage-200' : 'border-cream-200'}`}>
                          {formData.hasLavenderPieces && <Check className="w-5 h-5 text-white" />}
                        </div>
                        <span className="font-medium">Add Lavender Pieces 🌿</span>
                      </div>
                      <span className="font-bold text-natural-400">+Rs. {LAVENDER_PIECES_PRICE}</span>
                    </button>
                  </div>
                )}

                {formData.scent && (
                  <div className="mt-6 pt-6 border-t border-cream-200">
                    <div className="flex items-center justify-between bg-cream-100 p-4 rounded-xl">
                      <span className="text-natural-600">
                        {formData.size}g {formData.scent}
                        {formData.hasLavenderPieces && <span className="text-sage-600 ml-2">+ Lavender</span>}
                      </span>
                      <span className="text-xl font-serif font-bold text-sage-700">Rs. {getTotalPrice()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleContinueFromScent}
                  disabled={!isScentStepValid}
                  className={`w-full mt-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-md ${isScentStepValid ? 'btn-soft' : 'bg-natural-200 text-natural-400 cursor-not-allowed'}`}
                >
                  Continue to Color
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            )}

            {currentStep === 'color' && formData.scent && (
              <div className="card-catalog p-8 md:p-10 pb-40">
                <button type="button" onClick={() => setCurrentStep('scent')} className="flex items-center gap-2 text-natural-500 hover:text-sage-600 mb-8">
                  <ArrowLeft className="w-5 h-5" />
                  Back to scent & size
                </button>

                <h2 className="text-2xl font-serif font-bold mb-3 text-sage-700 flex items-center gap-4">
                  <span className="bg-sage-100 w-14 h-14 rounded-full flex items-center justify-center">
                    <Palette className="w-7 h-7 text-sage-600" />
                  </span>
                  Choose Your Color
                </h2>
                <p className="text-bark-400 mb-6">{formData.scent} • {formData.size}g • Rs. {currentPrice}</p>

                <div className="flex flex-wrap gap-4 justify-center">
                  {COLOR_OPTIONS.map((option) => {
                    const isSelected = formData.color === option.label;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleColorChange(option.label)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 ${isSelected ? 'ring-2 ring-sage-400 bg-jungle-50 shadow-md' : ''}`}
                      >
                        <div className={`w-18 h-18 rounded-full shadow-md border-3 ${option.class} ${isSelected ? 'border-jungle-400 scale-105' : 'border-transparent'}`} style={{ backgroundColor: option.hex }}>
                          {isSelected && <span className="absolute inset-0 flex items-center justify-center"><Check className="w-8 h-8 text-white drop-shadow-md" /></span>}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-bark-800' : 'text-bark-600'}`}>{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleContinueFromColor}
                  disabled={!formData.color}
                  className={`w-full mt-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-md ${formData.color ? 'btn-soft' : 'bg-natural-200 text-natural-400 cursor-not-allowed'}`}
                >
                  Continue to Quantity
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            )}

            {currentStep === 'quantity' && formData.scent && formData.color && (
              <div id="quantity-section" className="card-organic p-8 md:p-10">
                <button type="button" onClick={() => setCurrentStep('color')} className="flex items-center gap-2 text-natural-500 hover:text-sage-600 mb-8">
                  <ArrowLeft className="w-5 h-5" />
                  Back to color
                </button>

                <h2 className="text-2xl font-serif font-bold mb-3 text-sage-700 flex items-center gap-4">
                  <span className="bg-sage-100 w-14 h-14 rounded-full flex items-center justify-center">
                    <Layers className="w-7 h-7 text-sage-600" />
                  </span>
                  How Many Soaps?
                </h2>

                <div className="bg-cream-100 p-4 rounded-2xl mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-natural-600">{formData.scent} • {formData.size}g • {formData.color}</span>
                    <span className="font-serif font-bold text-natural-800">Rs. {currentPrice} each</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    placeholder="0"
                    className="flex-1 p-4 text-center text-3xl font-serif font-bold rounded-2xl border-2 focus:ring-4 focus:ring-sage-100 outline-none bg-cream-50 border-cream-300"
                    autoFocus
                  />
                  <span className="text-lg font-medium text-natural-500">soaps</span>
                </div>

                <div className="flex gap-3 mb-6">
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, quantity: String(num) }))}
                      className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${formData.quantity === String(num) ? 'bg-sage-600 text-white shadow-md' : 'bg-cream-200 text-natural-600'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {formData.quantity && parseInt(formData.quantity, 10) > 0 && (() => {
                  const qty = parseInt(formData.quantity, 10);
                  const subtotal = currentPrice * qty;
                  const totalQty = qty + cart.totalQuantity;
                  const discountPercent = totalQty >= 4 ? 15 : totalQty >= 2 ? 10 : 0;
                  const discountAmount = Math.round(subtotal * (discountPercent / 100));
                  const total = subtotal - discountAmount;

                  return (
                    <div className="bg-cream-200 p-5 rounded-2xl space-y-2 border border-cream-300">
                      <div className="flex items-center justify-between text-sm text-natural-500">
                        <span>Subtotal for {qty} soap{qty > 1 ? 's' : ''}:</span>
                        <span>Rs. {subtotal}</span>
                      </div>
                      {discountPercent > 0 && (
                        <div className="flex items-center justify-between text-sm text-sage-600 font-medium">
                          <span>Bulk Discount ({discountPercent}%):</span>
                          <span>- Rs. {discountAmount}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-cream-300">
                        <span className="font-bold text-natural-800">Total:</span>
                        <span className="text-2xl font-serif font-bold text-sage-700">Rs. {total}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {currentStep === 'quantity' && (
          <div className={`fixed bottom-0 left-0 right-0 bg-cream-50/95 backdrop-blur-md border-t border-cream-200 p-4 z-40 shadow-lg transition-all duration-500 ease-out ${expandedBottomBar ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="max-w-4xl mx-auto">
              {expandedBottomBar && cart.items.length > 0 && (
                <div className="mb-3 p-3 bg-sage-50 rounded-xl text-center border border-sage-100 animate-in fade-in slide-in-from-top-2">
                  <span className="text-sm text-natural-600 font-medium">{cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''} in cart</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                {expandedBottomBar && cart.items.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        showCartButtonsRef.current = false;
                        setFormData(prev => ({
                          ...prev,
                          scent: null,
                          color: null,
                          quantity: '',
                          size: DEFAULT_SIZE,
                          hasLavenderPieces: false
                        }));
                        setCurrentStep('scent');
                      }}
                      className="flex-1 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md btn-soft animate-in fade-in slide-in-from-bottom-4"
                    >
                      <Plus className="w-6 h-6" />
                      Order Another Soap
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage('checkout')}
                      className="flex-1 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md bg-[#5D4E37] text-white hover:bg-[#4A3F2D] animate-in fade-in slide-in-from-bottom-4"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      Proceed to Checkout - Rs. {cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </button>
                  </>
                ) : cart.items.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setPage('checkout')}
                      className="px-6 py-4 rounded-full font-semibold text-base flex items-center gap-3 bg-cream-300 text-natural-700 hover:bg-sage-200 transition-all border border-blush-200 shadow-sm"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      Cart ({cart.totalQuantity})
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isButtonDisabled}
                      className={`flex-1 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${!isButtonDisabled ? 'btn-soft' : 'bg-natural-200 text-natural-400 cursor-not-allowed'}`}
                    >
                      <Plus className="w-6 h-6" />
                      Add to Cart
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isButtonDisabled}
                    className={`flex-1 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${!isButtonDisabled ? 'btn-soft' : 'bg-natural-200 text-natural-400 cursor-not-allowed'}`}
                  >
                    <Plus className="w-6 h-6" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
