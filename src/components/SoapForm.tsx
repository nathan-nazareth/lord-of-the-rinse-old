import React, { useState, useEffect, useRef } from 'react';
import { SoapScent, SoapColor, OrderFormState, SOAP_OPTIONS, DEFAULT_SIZE, MAX_SIZE, LAVENDER_PIECES_PRICE } from '../../types';
import { useCart } from '../hooks/useCart';
import { useFormRateLimit } from '../hooks/useFormRateLimit';
import { Cart, CartBadge } from './Cart';
import { ShoppingCart, Check, Sparkles, Palette, Layers, ArrowRight, ArrowLeft, Leaf, Droplets, Plus, Scale, Info, Tag } from 'lucide-react';

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

const FORM_STATE_KEY = 'soap_form_state';

interface SavedFormState {
  scent: SoapScent | null;
  color: SoapColor | null;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  currentStep: FormStep;
}

export const SoapForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('landing');
  const [showScentInfo, setShowScentInfo] = useState<string | null>(null);
  const { cart, addItem, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const scentTooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Load saved form state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsed: SavedFormState = JSON.parse(savedState);
        if (parsed.currentStep && parsed.currentStep !== 'landing') {
          setFormData(prev => ({
            ...prev,
            scent: parsed.scent,
            color: parsed.color,
            quantity: parsed.quantity,
            size: parsed.size,
            hasLavenderPieces: parsed.hasLavenderPieces
          }));
          setCurrentStep(parsed.currentStep);
        }
      } catch (e) {
        console.warn('Failed to load saved form state');
      }
    }
  }, []);

  // Save form state on change
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

  const handleClearCartAndReset = () => {
    clearCart();
    setFormData(INITIAL_STATE);
    setCurrentStep('landing');
    localStorage.removeItem(FORM_STATE_KEY);
    setIsCartOpen(false);
  };

  const steps: { key: FormStep; label: string }[] = [
    { key: 'scent', label: 'Scent & Size' },
    { key: 'color', label: 'Color' },
    { key: 'quantity', label: 'Quantity' },
  ];

  const completedStepCount = Math.max(0, steps.findIndex(s => s.key === currentStep));

  const handleScentChange = (scent: SoapScent) => {
    setFormData(prev => ({
      ...prev,
      scent,
      color: (scent === SoapScent.COFFEE || scent === SoapScent.TURMERIC) ? SoapColor.WHITE : prev.color
    }));
    setShowScentInfo(scent);
    
    // Scroll to size section
    setTimeout(() => {
      const sizeSection = document.getElementById('size-section');
      if (sizeSection) {
        sizeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleSizeChange = (size: number) => {
    setFormData(prev => ({ ...prev, size }));
    
    // Scroll to lavender pieces section
    setTimeout(() => {
      const lavenderSection = document.getElementById('lavender-section');
      if (lavenderSection) {
        lavenderSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleMouseEnterScent = (scent: string) => {
    if (scentTooltipTimerRef.current) {
      clearTimeout(scentTooltipTimerRef.current);
    }
    scentTooltipTimerRef.current = setTimeout(() => {
      setShowScentInfo(scent);
    }, 150);
  };

  useEffect(() => {
    if (cart.items.length > 0) {
      setCurrentStep('scent');
    }
  }, [cart.items.length]);

  const handleMouseLeaveScent = () => {
    if (scentTooltipTimerRef.current) {
      clearTimeout(scentTooltipTimerRef.current);
    }
    scentTooltipTimerRef.current = setTimeout(() => {
      setShowScentInfo(null);
    }, 100);
  };

  const handleContinueFromLanding = () => {
    setCurrentStep('scent');
  };

  const handleContinueFromScent = () => {
    if (formData.scent && formData.size > 0) {
      setCurrentStep('color');
    }
  };

  const handleColorChange = (color: SoapColor) => {
    setFormData(prev => ({ ...prev, color }));
    
    // Scroll to lavender section
    setTimeout(() => {
      const lavenderSection = document.getElementById('lavender-section');
      if (lavenderSection) {
        lavenderSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleContinueFromColor = () => {
    if (formData.color) {
      setCurrentStep('quantity');
      
      // Scroll to center quantity section
      setTimeout(() => {
        const quantitySection = document.getElementById('quantity-section');
        if (quantitySection) {
          quantitySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (currentStep === 'quantity' && (!formData.scent || !formData.color)) {
      setCurrentStep(formData.scent ? 'color' : 'scent');
    }

    // Auto-scroll to top when step changes (but not on initial load)
    if (currentStep !== 'landing' && formData.scent) {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep, formData.scent, formData.color]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, quantity: value }));
  };

  const isScentStepValid = formData.scent && formData.size > 0;
  const isFormValid =
    formData.scent &&
    formData.color &&
    formData.size > 0 &&
    formData.quantity.length > 0 &&
    parseInt(formData.quantity, 10) > 0;

  const isButtonDisabled = !isFormValid;
  const buttonText = 'Add to Cart';

  const getBasePriceForScent = (scent: SoapScent): number => {
    const option = SOAP_OPTIONS.find(o => o.scent === scent);
    return option?.price || 0;
  };

  const getPriceForScent = (scent: SoapScent, size: number): number => {
    const basePrice = getBasePriceForScent(scent);
    const ratio = size / 100;
    const basePriceWithSize = Math.round(basePrice * ratio);
    return basePriceWithSize;
  };

  const getTotalPrice = (): number => {
    if (!formData.scent) return 0;
    const scentPrice = getPriceForScent(formData.scent, formData.size);
    return formData.hasLavenderPieces ? scentPrice + LAVENDER_PIECES_PRICE : scentPrice;
  };

  const handleAddToCart = () => {
    if (!isFormValid) return;

    const price = getTotalPrice();
    const success = addItem(
      formData.scent!,
      price,
      formData.color!,
      formData.quantity,
      formData.size,
      formData.hasLavenderPieces
    );

    if (success) {
      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 2000);

      setFormData(prev => ({
        ...prev,
        scent: null,
        color: null,
        quantity: '',
        size: DEFAULT_SIZE,
        hasLavenderPieces: false
      }));
      setCurrentStep('landing');
      setIsCartOpen(true);
    }
  };

  useEffect(() => {
    if (showScentInfo) {
      const timer = setTimeout(() => setShowScentInfo(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showScentInfo]);

  useEffect(() => {
    return () => {
      if (scentTooltipTimerRef.current) {
        clearTimeout(scentTooltipTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep === 'scent' && !formData.scent) {
      const firstScentBtn = document.querySelector('.grid.grid-cols-3 button');
      (firstScentBtn as HTMLElement)?.focus();
    }
  }, [currentStep, formData.scent]);

  const currentPrice = formData.scent ? getTotalPrice() : 0;

  if (currentStep === 'landing') {
    return (
      <div className="min-h-screen pb-32 px-4">
        <div className="max-w-4xl mx-auto pt-8">
          {showAddedToast && (
            <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Added to cart!
            </div>
          )}

          <Cart
            cart={cart}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
          />

          {cart.totalQuantity > 0 && !isCartOpen && (
            <div className="fixed bottom-28 right-4 z-50 flex flex-col gap-2">
              <CartBadge count={cart.totalQuantity} onClick={() => setIsCartOpen(true)} />
            </div>
          )}

          <div className="parchment-paper rounded-2xl shadow-lg border border-cream-200 overflow-hidden animate-in fade-in zoom-in duration-500 relative">
            {/* Clear Cart Button */}
            {cart.totalQuantity > 0 && (
              <button
                onClick={handleClearCartAndReset}
                className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear & Reset
              </button>
            )}

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
                      <p className="text-base text-natural-600 mt-1">
                        Pick from 9 natural scents. Select your preferred size between 50-100g/ml.
                        Lavender and honey cost slightly more.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-natural-700 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-natural-800">Pick a Color</h3>
                      <p className="text-base text-natural-600 mt-1">
                        Select from 7 beautiful colors. Some scents (Coffee, Turmeric) have natural
                        colors — in those cases, white is recommended.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-natural-700 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-natural-800">Set Quantity</h3>
                      <p className="text-base text-natural-600 mt-1">
                        Enter how many soaps you want. You can add different combinations to your
                        cart and submit one order for everything.
                      </p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 px-4" ref={formTopRef}>
      <div className="max-w-4xl mx-auto">

        {showAddedToast && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Added to cart!
          </div>
        )}

        <Cart
          cart={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
        />

        {cart.totalQuantity > 0 && !isCartOpen && (
          <div className="fixed bottom-28 right-4 z-50">
            <CartBadge count={cart.totalQuantity} onClick={() => setIsCartOpen(true)} />
          </div>
        )}

        {/* Navigation / Progress */}
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
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                {index > 0 && <div className="w-6 h-px bg-parchment-400" />}
                <div className={`flex flex-col items-center min-w-[60px] ${currentStep === step.key
                  ? 'text-jungle-400'
                  : index < steps.findIndex(s => s.key === currentStep)
                    ? 'text-jungle-500'
                    : 'text-parchment-400'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${index < steps.findIndex(s => s.key === currentStep)
                    ? 'bg-jungle-200 text-parchment-100'
                    : currentStep === step.key
                      ? 'bg-parchment-200 border-2 border-jungle-300'
                      : 'bg-parchment-300'
                    }`}>
                    {index < steps.findIndex(s => s.key === currentStep) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className={`text-sm font-bold ${currentStep === step.key ? 'text-jungle-500' : ''}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-2 font-medium text-center leading-tight max-w-[70px] text-natural-600">
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="w-16" />
        </div>

        <div className="flex items-center gap-2 bg-blush-50 px-4 py-3 rounded-lg border border-blush-100 mb-8">
          <span className="text-sm text-natural-600">
            Step <strong className="text-sage-600">{steps.findIndex(s => s.key === currentStep) + 1}</strong> of <strong>{steps.length}</strong> • Complete each step to add soaps
          </span>
        </div>

        {currentStep === 'scent' && (
          <div className="card-catalog p-8 md:p-10 pb-32">
            <h2 className="text-2xl font-serif font-bold mb-8 text-sage-700 flex items-center gap-4">
              <span className="bg-sage-100 w-14 h-14 rounded-full flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-sage-600" />
              </span>
              Choose Your Scent & Size
            </h2>

            <div className="mb-6">
              <p className="text-bark-500 mb-4 font-medium flex items-center gap-2">
                <span className="text-lg">🌸</span> Pick a scent:
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
                      className={`
                      p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden
                      ${isSelected
                          ? 'border-sage-400 bg-sage-100 shadow-md ring-2 ring-sage-200'
                          : 'border-cream-200 bg-white hover:border-sage-300 hover:bg-cream-50'}
                    `}
                      aria-label={`${option.scent} - ${info.description}${isSelected ? ', selected' : ''}`}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-sage-600 text-lg">✓</span>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-serif font-semibold text-lg ${isSelected ? 'text-sage-700' : 'text-natural-700'}`}>
                          {option.scent}
                        </span>
                      </div>
                      <p className={`text-sm italic ${isSelected ? 'text-sage-600' : 'text-natural-500'}`}>{info.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.scent && (
              <div id="size-section" className="border-t border-parchment-200 pt-6 mt-6">
                <p className="text-bark-600 mb-3 font-medium">Pick a size:</p>

                <div className="flex gap-3">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleSizeChange(option.weight)}
                      className={`
                      flex-1 py-4 rounded-2xl font-bold transition-all border-2
                      ${formData.size === option.weight
                          ? 'bg-sage-600 text-white border-sage-600 shadow-md'
                          : 'bg-white text-natural-600 border-cream-300 hover:border-sage-400 hover:bg-sage-50'}
                    `}
                      aria-label={`${option.label} size (${option.weight} grams)${formData.size === option.weight ? ', selected' : ''}`}
                      aria-pressed={formData.size === option.weight}
                    >
                      {option.label} ({option.weight}g)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.scent && (
              <div id="lavender-section" className="mt-6 pt-6 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, hasLavenderPieces: !prev.hasLavenderPieces }));
                    // Scroll to quantity section
                    setTimeout(() => {
                      const quantitySection = document.getElementById('quantity-section');
                      if (quantitySection) {
                        quantitySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 150);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${formData.hasLavenderPieces
                    ? 'border-sage-300 bg-sage-50 shadow-sm'
                    : 'border-cream-300 hover:border-sage-200 hover:bg-cream-50'}
                `}
                  aria-label={`${formData.hasLavenderPieces ? 'Remove' : 'Add'} lavender pieces for an additional Rs. ${LAVENDER_PIECES_PRICE}`}
                  aria-pressed={formData.hasLavenderPieces}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${formData.hasLavenderPieces ? 'border-sage-300 bg-sage-200' : 'border-cream-200'
                      }`}>
                      {formData.hasLavenderPieces && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <span className={`font-medium ${formData.hasLavenderPieces ? 'text-sage-700' : 'text-natural-600'}`}>
                      Add Lavender Pieces 🌿
                    </span>
                  </div>
                  <span className={`font-bold ${formData.hasLavenderPieces ? 'text-sage-700' : 'text-natural-400'}`}>
                    +Rs. {LAVENDER_PIECES_PRICE}
                  </span>
                </button>
              </div>
            )}

            {formData.scent && (
              <div className="mt-6 pt-6 border-t border-cream-200">
                <div className="flex items-center justify-between bg-cream-100 p-4 rounded-xl border border-cream-200">
                  <div>
                    <span className="text-natural-600">
                      {formData.size}g/{formData.size}ml {formData.scent}
                      {formData.hasLavenderPieces && <span className="text-sage-600 ml-2">+ Lavender Pieces 🌿</span>}
                    </span>
                  </div>
                  <span className="text-xl font-serif font-bold text-sage-700">
                    Rs. {getTotalPrice()}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleContinueFromScent}
              disabled={!isScentStepValid}
              className={`
              w-full mt-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-md
              ${isScentStepValid
                  ? 'btn-soft hover:shadow-lg'
                  : 'bg-natural-200 text-natural-400 cursor-not-allowed'}
            `}
            >
              Continue to Color
              <ArrowRight className="w-6 h-6" />
            </button>

            {showScentInfo && (
              <div className="mt-4 p-3 bg-parchment-200 rounded-xl flex items-center gap-3">
                <Leaf className="w-5 h-5 text-jungle-600" />
                <span className="text-sm text-bark-500">
                  <strong className="text-jungle-500">Tip:</strong> {SCENT_INFO[showScentInfo]?.tip}
                </span>
              </div>
            )}
          </div>
        )}

        {currentStep === 'color' && formData.scent && (
          <div className="card-catalog p-8 md:p-10 pb-32">
            <button
              type="button"
              onClick={() => setCurrentStep('scent')}
              className="flex items-center gap-2 text-natural-500 hover:text-sage-600 mb-8 transition-colors text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to scent & size
            </button>

            <h2 className="text-2xl font-serif font-bold mb-3 text-sage-700 flex items-center gap-4">
              <span className="bg-sage-100 w-14 h-14 rounded-full flex items-center justify-center">
                <Palette className="w-7 h-7 text-sage-600" />
              </span>
              Choose Your Color
            </h2>
            <p className="text-bark-400 mb-6">
              For <span className="font-medium text-jungle-500">{formData.scent}</span> • {formData.size}g/{formData.size}ml • Rs. {currentPrice}
            </p>

            {(formData.scent === SoapScent.COFFEE || formData.scent === SoapScent.TURMERIC) && (
              <div className="mb-6 p-4 bg-bark-50 rounded-2xl border border-bark-200 flex items-start gap-3">
                <Droplets className="w-6 h-6 text-bark-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-bark-800 font-medium">
                    {formData.scent === SoapScent.COFFEE
                      ? 'Coffee creates a natural brown color.'
                      : 'Turmeric gives a natural golden color.'}
                  </p>
                  <p className="text-bark-600 text-sm mt-1">
                    White is recommended, but you can choose any color you like.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              {COLOR_OPTIONS.map((option) => {
                const isSelected = formData.color === option.label;
                const isNaturalColorScent = formData.scent === SoapScent.COFFEE || formData.scent === SoapScent.TURMERIC;
                const isRecommended = isNaturalColorScent && option.label === SoapColor.WHITE;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleColorChange(option.label)}
                    className={`
                    relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all
                    hover:scale-105 cursor-pointer
                    ${isSelected ? 'ring-2 ring-sage-400 bg-jungle-50 shadow-md' : ''}
                    ${isRecommended && !isSelected ? 'ring-2 ring-terracotta-300 bg-bark-50' : ''}
                  `}
                    aria-label={`Select ${option.label} color${isRecommended ? ', recommended for this scent' : ''}${isSelected ? ', currently selected' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <div
                      className={`
                      w-18 h-18 rounded-full shadow-md border-3 transition-all
                      ${option.class}
                      ${isSelected ? 'border-jungle-400 scale-105' : 'border-transparent'}
                      ${isRecommended ? 'ring-2 ring-terracotta-400' : ''}
                    `}
                      style={{ backgroundColor: option.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-8 h-8 text-white drop-shadow-md" />
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-bark-800' : 'text-bark-600'}`}>
                      {option.label}
                    </span>
                    {isRecommended && !isSelected && (
                      <span className="absolute -top-1 text-xs bg-bark-100 text-bark-700 px-3 py-1 rounded-full font-medium border border-bark-200">
                        Recommended
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute -bottom-1 text-xs bg-jungle-200 text-jungle-700 px-3 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleContinueFromColor}
              disabled={!formData.color}
              className={`
              w-full mt-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-md
              ${formData.color
                  ? 'btn-soft hover:shadow-lg'
                  : 'bg-natural-200 text-natural-400 cursor-not-allowed'}
            `}
            >
              Continue to Quantity
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {currentStep === 'quantity' && formData.scent && formData.color && (
          <div id="quantity-section" className="card-organic p-8 md:p-10">
            <button
              type="button"
              onClick={() => setCurrentStep('color')}
              className="flex items-center gap-2 text-natural-500 hover:text-sage-600 mb-8 transition-colors text-lg"
            >
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
                <span className="text-natural-600">{formData.scent} • {formData.size}g/{formData.size}ml • {formData.color}</span>
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
                className={`flex-1 p-4 text-center text-3xl font-serif font-bold rounded-2xl border-2 focus:ring-4 focus:ring-sage-100 outline-none bg-cream-50 ${
                  formData.quantity && parseInt(formData.quantity, 10) === 0
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-cream-300 focus:border-sage-400'
                }`}
                autoFocus
              />
              <span className="text-lg font-medium text-natural-500">soaps</span>
            </div>
            {formData.quantity && parseInt(formData.quantity, 10) === 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Please enter a quantity greater than 0</span>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              {[1, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quantity: String(num) }))}
                  className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${formData.quantity === String(num)
                    ? 'bg-sage-600 text-white shadow-md'
                    : 'bg-cream-200 text-natural-600 hover:bg-sage-100 hover:text-sage-700'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-sage-50 to-cream-100 border-2 border-sage-200 rounded-2xl p-5 mb-6 animate-soft-pulse">
              <div className="flex items-center gap-3 text-sage-700">
                <Tag className="w-5 h-5" />
                <span className="text-base font-bold">Bulk Discount on Your Order:</span>
              </div>
              <div className="mt-2 text-sm text-sage-600 ml-7">
                <span className="inline-block bg-sage-200 px-3 py-1 rounded-xl font-bold text-lg">10% OFF</span>
                <span className="mx-3">for 2-3 soaps</span>
                <span className="mx-2">•</span>
                <span className="inline-block bg-sage-100 px-3 py-1 rounded-xl font-bold text-lg">15% OFF</span>
                <span className="mx-3">for 4+ soaps</span>
              </div>
              <div className="mt-2 text-sm text-sage-600 ml-7 flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="font-semibold">Mix & match any scents — discount applies to your entire order!</span>
              </div>
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
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Bulk Discount ({discountPercent}%):
                      </span>
                      <span>- Rs. {discountAmount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-cream-300">
                    <span className="font-bold text-natural-800">Total:</span>
                    <span className="text-2xl font-serif font-bold text-sage-700">
                      Rs. {total}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {currentStep === 'quantity' && (
          <div className="fixed bottom-0 left-0 right-0 bg-cream-50/95 backdrop-blur-md border-t border-cream-200 p-4 z-40 shadow-lg">
            <div className="max-w-4xl mx-auto">
              {cart.items.length > 0 && (
                <div className="mb-3 p-3 bg-sage-50 rounded-xl text-center border border-sage-100">
                  <span className="text-sm text-natural-600">
                    {cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''} in cart • Tap cart to review 🌿
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                {cart.totalQuantity > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="px-6 py-4 rounded-full font-semibold text-base flex items-center gap-3 bg-cream-300 text-natural-700 hover:bg-sage-200 hover:text-sage-700 transition-all border border-blush-200 shadow-sm"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Cart ({cart.totalQuantity})
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isButtonDisabled}
                  className={`
                flex-1 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md
                ${!isButtonDisabled
                      ? 'btn-soft hover:shadow-lg'
                      : 'bg-natural-200 text-natural-400 cursor-not-allowed'}
              `}
                >
                  <Plus className="w-6 h-6" />
                  {buttonText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
