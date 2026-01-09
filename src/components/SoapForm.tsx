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

        <div className="bg-white rounded-2xl shadow-lg border border-earth-100 overflow-hidden">
          <div className="bg-gradient-to-br from-earth-200 to-earth-100 p-8 text-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-earth-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-earth-800 mb-2">
              Organic Soap Builder
            </h1>
            <p className="text-earth-600">
              Create your custom handmade soaps
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-earth-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                How It Works
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-earth-700 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-earth-800">Choose Scent & Size</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Pick from 9 natural scents. Select your preferred size between 50-100g/ml. 
                      Lavender and honey cost slightly more.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-earth-700 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-earth-800">Pick a Color</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Select from 7 beautiful colors. Some scents (Coffee, Turmeric) have natural 
                      colors — in those cases, white is recommended.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-earth-700 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-earth-800">Set Quantity</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter how many soaps you want. You can add different combinations to your 
                      cart and submit one order for everything.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
              <div className="flex items-center gap-2 text-earth-700 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>100% natural coconut soap base</span>
              </div>
              <div className="flex items-center gap-2 text-earth-700 text-sm mt-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Handmade with love</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={handleContinueFromLanding}
              className="w-full py-4 rounded-xl font-bold text-lg bg-earth-600 text-white hover:bg-earth-700 transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
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
            className="flex items-center gap-1 text-sm text-earth-600 hover:text-earth-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                {index > 0 && <div className="w-6 h-px bg-earth-200" />}
                <div className={`flex flex-col items-center min-w-[60px] ${
                  currentStep === step.key
                    ? 'text-earth-600'
                    : index < steps.findIndex(s => s.key === currentStep)
                      ? 'text-earth-400'
                      : 'text-gray-300'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    index < steps.findIndex(s => s.key === currentStep)
                      ? 'bg-earth-500 text-white'
                      : currentStep === step.key
                        ? 'bg-earth-100 border-2 border-earth-500'
                        : 'bg-gray-100'
                  }`}>
                    <span className={`text-xs font-medium ${currentStep === step.key ? 'text-earth-700' : ''}`}>
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-[10px] mt-1 font-medium text-center leading-tight max-w-[70px]">
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
          
          <div className="w-16" />
        </div>

        <div className="flex items-center gap-2 bg-earth-50 px-3 py-2 rounded-lg">
          <span className="text-xs text-earth-700">
            Step <strong>{steps.findIndex(s => s.key === currentStep) + 1}</strong> of <strong>{steps.length}</strong> • Complete each step to add soaps
          </span>
        </div>
      </div>

      {currentStep === 'scent' && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
          <h2 className="text-lg font-serif font-bold mb-4 text-earth-800 flex items-center gap-3">
            <span className="bg-earth-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-earth-600" />
            </span>
            Choose Scent & Size
          </h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">Pick a scent:</p>
            <div className="grid grid-cols-3 gap-2">
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
                      p-3 rounded-lg border-2 text-left transition-all
                      ${isSelected 
                        ? 'border-earth-500 bg-earth-50' 
                        : 'border-gray-200 hover:border-earth-300'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isSelected ? 'text-earth-800' : 'text-gray-700'}`}>
                        {option.scent}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-earth-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {formData.scent && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-sm text-gray-600 mb-3">Pick a size:</p>
              
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleSizeChange(option.weight)}
                    className={`
                      flex-1 py-3 rounded-lg font-bold transition-all border-2
                      ${formData.size === option.weight
                        ? 'bg-earth-600 text-white border-earth-600'
                        : 'bg-white text-earth-700 border-earth-200 hover:border-earth-400'}
                    `}
                  >
                    {option.label} ({option.weight}g)
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.scent && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, hasLavenderPieces: !prev.hasLavenderPieces }))}
                className={`w-full p-3 rounded-lg border-2 flex items-center justify-between transition-all ${
                  formData.hasLavenderPieces
                    ? 'border-earth-400 bg-earth-50'
                    : 'border-gray-200 hover:border-earth-300'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    formData.hasLavenderPieces ? 'border-earth-500 bg-earth-500' : 'border-gray-300'
                  }`}>
                    {formData.hasLavenderPieces && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`font-medium ${formData.hasLavenderPieces ? 'text-earth-800' : 'text-gray-700'}`}>
                    Add Lavender Pieces
                  </span>
                </div>
                <span className={`font-bold ${formData.hasLavenderPieces ? 'text-earth-700' : 'text-gray-500'}`}>
                  +Rs. {LAVENDER_PIECES_PRICE}
                </span>
              </button>
            </div>
          )}

          {formData.scent && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between bg-earth-50 p-3 rounded-lg">
                <span className="text-sm text-earth-700">
                  {formData.size}g/{formData.size}ml {formData.scent}
                  {formData.hasLavenderPieces && <span className="text-earth-600 ml-1">+ Lavender Pieces</span>}
                </span>
                <span className="text-lg font-bold text-earth-800">
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
              w-full mt-4 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all
              ${isScentStepValid
                ? 'bg-earth-600 text-white hover:bg-earth-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            Continue to Color
            <ArrowRight className="w-4 h-4" />
          </button>

          {showScentInfo && (
            <div className="mt-3 p-2 bg-earth-50 rounded-lg flex items-center gap-2">
              <Leaf className="w-4 h-4 text-earth-600" />
              <span className="text-xs text-earth-700">
                <strong>Tip:</strong> {SCENT_INFO[showScentInfo]?.tip}
              </span>
            </div>
          )}
        </div>
      )}

      {currentStep === 'color' && formData.scent && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
          <button
            type="button"
            onClick={() => setCurrentStep('scent')}
            className="flex items-center gap-2 text-earth-600 hover:text-earth-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to scent & size
          </button>
          
          <h2 className="text-lg font-serif font-bold mb-2 text-earth-800 flex items-center gap-3">
            <span className="bg-earth-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Palette className="w-5 h-5 text-earth-600" />
            </span>
            Choose Color
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            For {formData.scent} • {formData.size}g/{formData.size}ml • Rs. {currentPrice}
          </p>
          
          {(formData.scent === SoapScent.COFFEE || formData.scent === SoapScent.TURMERIC) && (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
              <Droplets className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  {formData.scent === SoapScent.COFFEE 
                    ? 'Coffee creates a natural brown color.' 
                    : 'Turmeric gives a natural golden color.'}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  White is recommended, but you can choose any color you like.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
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
                    relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                    hover:scale-105 cursor-pointer
                    ${isSelected ? 'ring-2 ring-earth-400 bg-earth-50' : ''}
                    ${isRecommended && !isSelected ? 'ring-2 ring-amber-300 bg-amber-50' : ''}
                  `}
                  aria-pressed={isSelected}
                >
                  <div 
                    className={`
                      w-16 h-16 rounded-full shadow-sm border-3 transition-all
                      ${option.class}
                      ${isSelected ? 'border-earth-400 scale-105' : 'border-transparent'}
                      ${isRecommended ? 'ring-2 ring-amber-400' : ''}
                    `}
                    style={{ backgroundColor: option.hex }}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-6 h-6 text-black/30" />
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-earth-800' : 'text-gray-600'}`}>
                    {option.label}
                  </span>
                  {isRecommended && !isSelected && (
                    <span className="absolute -top-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                      Recommended
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute -bottom-2 text-[10px] bg-earth-200 text-earth-700 px-2 py-0.5 rounded-full">
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
        <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
          <button
            type="button"
            onClick={() => setCurrentStep('color')}
            className="flex items-center gap-2 text-earth-600 hover:text-earth-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to color
          </button>
          
          <h2 className="text-lg font-serif font-bold mb-2 text-earth-800 flex items-center gap-3">
            <span className="bg-earth-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Layers className="w-5 h-5 text-earth-600" />
            </span>
            How Many?
          </h2>
          
          <div className="bg-earth-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formData.scent} • {formData.size}g/{formData.size}ml • {formData.color}</span>
              <span className="font-bold text-earth-800">Rs. {currentPrice} each</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              inputMode="numeric"
              value={formData.quantity}
              onChange={handleQuantityChange}
              placeholder="0"
              className="flex-1 p-4 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-earth-500 outline-none"
              autoFocus
            />
            <span className="text-lg font-medium text-earth-700">soaps</span>
          </div>
          
          <div className="flex gap-2 mb-4">
            {[1, 3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, quantity: String(num) }))}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  formData.quantity === String(num)
                    ? 'bg-earth-600 text-white'
                    : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-4 mb-4 animate-pulse">
            <div className="flex items-center gap-2 text-green-800">
              <Tag className="w-5 h-5" />
              <span className="text-base font-bold">Bulk Discount on Total Order:</span>
            </div>
            <div className="mt-2 text-sm text-green-800 ml-7">
              <span className="inline-block bg-green-200 px-2 py-1 rounded-lg font-bold text-lg">10% OFF</span>
              <span className="mx-2">for 2-3 soaps</span>
              <span className="mx-1">•</span>
              <span className="inline-block bg-green-300 px-2 py-1 rounded-lg font-bold text-lg">15% OFF</span>
              <span className="mx-2">for 4+ soaps</span>
            </div>
            <div className="mt-2 text-sm text-green-700 ml-7 flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="font-semibold">Mix & match any scents — discount applies to your entire order!</span>
            </div>
          </div>
          
          {formData.quantity && parseInt(formData.quantity, 10) > 0 && (
            <div className="bg-earth-100 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm text-earth-700">Total for {formData.quantity} soap{parseInt(formData.quantity, 10) > 1 ? 's' : ''}:</span>
              <span className="text-xl font-bold text-earth-800">
                Rs. {currentPrice * parseInt(formData.quantity, 10)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-earth-200 p-4 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.15)]">
        <div className="max-w-3xl mx-auto">
          {cart.items.length > 0 && (
            <div className="mb-2 p-2 bg-earth-50 rounded-lg text-center">
              <span className="text-xs text-earth-700">
                {cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''} in cart • Tap cart to review
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {cart.totalQuantity > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-3 rounded-full font-bold text-sm flex items-center gap-2 bg-earth-100 text-earth-700 hover:bg-earth-200"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart ({cart.totalQuantity})
              </button>
            )}
            
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className={`
                flex-1 py-3 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all
                ${!isButtonDisabled
                  ? 'bg-earth-600 text-white hover:bg-earth-700 shadow-lg' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              <Plus className="w-5 h-5" />
              {buttonText}
            </button>
          </div>
          
          <div className="text-center mt-2">
            <span className="text-[10px] text-earth-400">
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
