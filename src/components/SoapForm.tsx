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

export const SoapForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('landing');
  const [showScentInfo, setShowScentInfo] = useState<string | null>(null);
  const { cart, addItem, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const rateLimit = useFormRateLimit({ maxSubmissions: 10, windowMs: 60000, cooldownMs: 30000 });
  const scentTooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  };

  const handleSizeChange = (size: number) => {
    setFormData(prev => ({ ...prev, size }));
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
    setCurrentStep('quantity');
  };

  useEffect(() => {
    if (currentStep === 'quantity' && (!formData.scent || !formData.color)) {
      setCurrentStep(formData.scent ? 'color' : 'scent');
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
    formData.quantity.length > 0;

  const isButtonDisabled = !isFormValid || !rateLimit.isAllowed;
  const buttonText = rateLimit.cooldownRemaining !== null
    ? `Wait ${rateLimit.cooldownRemaining}s`
    : cart.totalQuantity > 0
      ? 'Add Another'
      : 'Add to Cart';
  const remainingCount = rateLimit.remainingSubmissions;

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
    if (!isFormValid || !rateLimit.isAllowed) return;

    const price = getTotalPrice();
    const success = rateLimit.recordSubmission() && addItem(
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
      <div className="w-full max-w-2xl mx-auto pb-32">
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

        <div className="bg-white rounded-2xl shadow-lg border border-bark-100 overflow-hidden">
          <div className="bg-gradient-to-br from-bark-200 to-bark-100 p-8 text-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-bark-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-bark-800 mb-2">
              Organic Soap Builder
            </h1>
            <p className="text-bark-600">
              Create your custom handmade soaps
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-bark-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                How It Works
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-bark-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-bark-700 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-bark-800">Choose Scent & Size</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Pick from 9 natural scents. Select your preferred size between 50-100g/ml. 
                      Lavender and honey cost slightly more.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-bark-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-bark-700 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-bark-800">Pick a Color</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Select from 7 beautiful colors. Some scents (Coffee, Turmeric) have natural 
                      colors — in those cases, white is recommended.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-bark-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-bark-700 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-bark-800">Set Quantity</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter how many soaps you want. You can add different combinations to your 
                      cart and submit one order for everything.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-bark-50 rounded-xl p-4 border border-bark-200">
              <div className="flex items-center gap-2 text-bark-700 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>100% natural coconut soap base</span>
              </div>
              <div className="flex items-center gap-2 text-bark-700 text-sm mt-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Handmade with love</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={handleContinueFromLanding}
              className="w-full py-4 rounded-xl font-bold text-lg bg-bark-600 text-white hover:bg-bark-700 transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              Start Building Soaps
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-32">
      
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep('landing')}
            className="flex items-center gap-1 text-sm text-bark-600 hover:text-bark-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                {index > 0 && <div className="w-6 h-px bg-parchment-400" />}
                <div className={`flex flex-col items-center min-w-[60px] ${
                  currentStep === step.key
                    ? 'text-jungle-400'
                    : index < steps.findIndex(s => s.key === currentStep)
                      ? 'text-jungle-500'
                      : 'text-parchment-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    index < steps.findIndex(s => s.key === currentStep)
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
                  <span className="text-xs mt-2 font-medium text-center leading-tight max-w-[70px] text-bark-500">
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
          
          <div className="w-16" />
        </div>

        <div className="flex items-center gap-2 bg-parchment-200 px-4 py-3 rounded-lg border border-parchment-300">
          <span className="text-sm text-bark-500">
            Step <strong className="text-jungle-500">{steps.findIndex(s => s.key === currentStep) + 1}</strong> of <strong>{steps.length}</strong> • Complete each step to add soaps
          </span>
        </div>
      </div>

      {currentStep === 'scent' && (
        <div className="card-catalog p-6 md:p-8">
          <h2 className="text-xl font-serif font-bold mb-6 text-jungle-600 flex items-center gap-4">
            <span className="bg-jungle-200 w-12 h-12 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-jungle-600" />
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
                        ? 'border-jungle-200 bg-jungle-50 shadow-md' 
                        : 'border-parchment-300 hover:border-jungle-300 hover:bg-parchment-100'}
                    `}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 text-jungle-500">✓</span>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-serif font-semibold text-lg ${isSelected ? 'text-jungle-600' : 'text-bark-500'}`}>
                        {option.scent}
                      </span>
                    </div>
                    <p className="text-sm text-bark-400 italic">{info.description}</p>
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
                    className={`
                      flex-1 py-4 rounded-2xl font-bold transition-all border-2
                      ${formData.size === option.weight
                        ? 'bg-jungle-500 text-white border-jungle-500 shadow-md'
                        : 'bg-white text-bark-600 border-parchment-300 hover:border-jungle-400 hover:bg-jungle-50'}
                    `}
                  >
                    {option.label} ({option.weight}g)
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.scent && (
            <div className="mt-6 pt-6 border-t border-parchment-200">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, hasLavenderPieces: !prev.hasLavenderPieces }))}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  formData.hasLavenderPieces
                    ? 'border-jungle-400 bg-jungle-50 shadow-sm'
                    : 'border-parchment-300 hover:border-jungle-300 hover:bg-parchment-100'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    formData.hasLavenderPieces ? 'border-jungle-300 bg-jungle-200' : 'border-parchment-400'
                  }`}>
                    {formData.hasLavenderPieces && <Check className="w-5 h-5 text-parchment-100" />}
                  </div>
                  <span className={`font-medium ${formData.hasLavenderPieces ? 'text-jungle-600' : 'text-bark-500'}`}>
                    Add Lavender Pieces 🌿
                  </span>
                </div>
                <span className={`font-bold ${formData.hasLavenderPieces ? 'text-jungle-600' : 'text-parchment-400'}`}>
                  +Rs. {LAVENDER_PIECES_PRICE}
                </span>
              </button>
            </div>
          )}

          {formData.scent && (
            <div className="mt-6 pt-6 border-t border-parchment-300">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, hasLavenderPieces: !prev.hasLavenderPieces }))}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                  formData.hasLavenderPieces
                    ? 'border-jungle-200 bg-jungle-50'
                    : 'border-parchment-300 hover:border-jungle-300 hover:bg-parchment-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                    formData.hasLavenderPieces ? 'border-jungle-300 bg-jungle-200' : 'border-parchment-400'
                  }`}>
                    {formData.hasLavenderPieces && <Check className="w-4 h-4 text-parchment-100" />}
                  </div>
                  <span className={`font-medium ${formData.hasLavenderPieces ? 'text-jungle-600' : 'text-bark-500'}`}>
                    Add Lavender Pieces
                  </span>
                </div>
                <span className={`font-bold ${formData.hasLavenderPieces ? 'text-jungle-600' : 'text-parchment-400'}`}>
                  +Rs. {LAVENDER_PIECES_PRICE}
                </span>
              </button>
            </div>
          )}

          {formData.scent && (
            <div className="mt-6 pt-6 border-t border-parchment-300">
              <div className="flex items-center justify-between bg-parchment-200 p-4 rounded-xl">
                <div>
                  <span className="text-bark-500">
                    {formData.size}g/{formData.size}ml {formData.scent}
                    {formData.hasLavenderPieces && <span className="text-jungle-600 ml-2">+ Lavender Pieces 🌿</span>}
                  </span>
                </div>
                <span className="text-xl font-serif font-bold text-jungle-600">
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
              w-full mt-6 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-md
              ${isScentStepValid
                ? 'bg-jungle-200 text-parchment-100 hover:bg-jungle-600 hover:shadow-lg'
                : 'bg-parchment-300 text-parchment-400 cursor-not-allowed'}
            `}
          >
            Continue to Color
            <ArrowRight className="w-5 h-5" />
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
        <div className="card-catalog p-6 md:p-8">
          <button
            type="button"
            onClick={() => setCurrentStep('scent')}
            className="flex items-center gap-2 text-bark-400 hover:text-jungle-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to scent & size
          </button>
          
          <h2 className="text-xl font-serif font-bold mb-2 text-jungle-600 flex items-center gap-4">
            <span className="bg-jungle-200 w-12 h-12 rounded-full flex items-center justify-center">
              <Palette className="w-6 h-6 text-jungle-600" />
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
        </div>
      )}

      {currentStep === 'quantity' && formData.scent && formData.color && (
        <div className="card-organic p-6 md:p-8">
          <button
            type="button"
            onClick={() => setCurrentStep('color')}
            className="flex items-center gap-2 text-bark-500 hover:text-jungle-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to color
          </button>
          
          <h2 className="text-xl font-serif font-bold mb-2 text-bark-800 flex items-center gap-4">
            <span className="bg-jungle-100 w-12 h-12 rounded-full flex items-center justify-center">
              <Layers className="w-6 h-6 text-jungle-600" />
            </span>
            How Many Soaps?
          </h2>
          
          <div className="bg-parchment-100 p-4 rounded-2xl mb-6">
            <div className="flex items-center justify-between">
              <span className="text-bark-600">{formData.scent} • {formData.size}g/{formData.size}ml • {formData.color}</span>
              <span className="font-serif font-bold text-bark-800">Rs. {currentPrice} each</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              inputMode="numeric"
              value={formData.quantity}
              onChange={handleQuantityChange}
              placeholder="0"
              className="flex-1 p-4 text-center text-3xl font-serif font-bold rounded-2xl border-2 border-parchment-300 focus:border-jungle-200 focus:ring-4 focus:ring-jungle-100 outline-none bg-parchment-50"
              autoFocus
            />
            <span className="text-lg font-medium text-bark-400">soaps</span>
          </div>
          
          <div className="flex gap-3 mb-6">
            {[1, 3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, quantity: String(num) }))}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                  formData.quantity === String(num)
                    ? 'bg-jungle-200 text-parchment-100 shadow-md'
                    : 'bg-parchment-200 text-bark-500 hover:bg-jungle-100 hover:text-jungle-500'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-jungle-100 to-jungle-200 border-2 border-jungle-300 rounded-2xl p-5 mb-6 animate-soft-pulse">
            <div className="flex items-center gap-3 text-jungle-600">
              <Tag className="w-5 h-5" />
              <span className="text-base font-bold">Bulk Discount on Your Order:</span>
            </div>
            <div className="mt-2 text-sm text-jungle-600 ml-7">
              <span className="inline-block bg-foliage-200 px-3 py-1 rounded-xl font-bold text-lg">10% OFF</span>
              <span className="mx-3">for 2-3 soaps</span>
              <span className="mx-2">•</span>
              <span className="inline-block bg-jungle-100 px-3 py-1 rounded-xl font-bold text-lg">15% OFF</span>
              <span className="mx-3">for 4+ soaps</span>
            </div>
            <div className="mt-2 text-sm text-jungle-500 ml-7 flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="font-semibold">Mix & match any scents — discount applies to your entire order!</span>
            </div>
          </div>
          
          {formData.quantity && parseInt(formData.quantity, 10) > 0 && (
            <div className="bg-parchment-200 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-bark-500">Total for {formData.quantity} soap{parseInt(formData.quantity, 10) > 1 ? 's' : ''}:</span>
              <span className="text-xl font-serif font-bold text-jungle-600">
                Rs. {currentPrice * parseInt(formData.quantity, 10)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-parchment-100/98 backdrop-blur-md border-t border-parchment-300 p-4 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto">
          {cart.items.length > 0 && (
            <div className="mb-3 p-3 bg-jungle-100 rounded-xl text-center">
              <span className="text-sm text-bark-500">
                {cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''} in cart • Tap cart to review 🌿
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {cart.totalQuantity > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-5 py-3 rounded-full font-semibold text-sm flex items-center gap-2 bg-parchment-300 text-bark-500 hover:bg-jungle-200 hover:text-jungle-500 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.totalQuantity})
              </button>
            )}
            
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className={`
                flex-1 py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md
                ${!isButtonDisabled
                  ? 'bg-jungle-200 text-parchment-100 hover:bg-jungle-600 hover:shadow-lg' 
                  : 'bg-parchment-300 text-parchment-400 cursor-not-allowed'}
              `}
            >
              <Plus className="w-5 h-5" />
              {buttonText}
            </button>
          </div>
          
          <div className="text-center mt-3">
            <span className="text-xs text-parchment-400">
              {rateLimit.cooldownRemaining !== null
                ? `Try again in ${rateLimit.cooldownRemaining}s`
                : `${remainingCount}/10 submissions`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
