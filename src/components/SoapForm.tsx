import React, { useState, useEffect, useRef } from 'react';
import { SoapScent, SoapColor, OrderFormState, SOAP_OPTIONS, DEFAULT_SIZE, MAX_SIZE } from '../../types';
import { useCart } from '../hooks/useCart';
import { useFormRateLimit } from '../hooks/useFormRateLimit';
import { Cart, CartBadge } from './Cart';
import { ShoppingCart, Check, Sparkles, Palette, Layers, ArrowRight, ArrowLeft, Leaf, Droplets, Plus, Scale, Info } from 'lucide-react';

const SIZE_OPTIONS = [50, 75, 100];

const INITIAL_STATE: OrderFormState = {
  scent: null,
  color: null,
  quantity: '',
  size: DEFAULT_SIZE,
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
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const scentTooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps: { key: FormStep; label: string; icon: React.ReactNode }[] = [
    { key: 'scent', label: 'Scent & Size', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'color', label: 'Color', icon: <Palette className="w-4 h-4" /> },
    { key: 'quantity', label: 'Quantity', icon: <Layers className="w-4 h-4" /> },
  ];

  const completedSteps = [
    formData.scent ? 'scent' : null,
    formData.color ? 'color' : null,
    formData.quantity ? 'quantity' : null
  ].filter(Boolean) as FormStep[];

  const getStepProgress = () => {
    return (completedSteps.length / steps.length) * 100;
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
    if (scentTooltipTimerRef.current) {
      clearTimeout(scentTooltipTimerRef.current);
    }
    scentTooltipTimerRef.current = setTimeout(() => {
      setShowScentInfo(scent);
    }, 150);
  };

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
    const rawPrice = basePrice * ratio;
    return Math.round(rawPrice);
  };

  const handleAddToCart = () => {
    if (!isFormValid || !rateLimit.isAllowed) return;

    const price = getPriceForScent(formData.scent!, formData.size);
    const success = rateLimit.recordSubmission() && addItem(
      formData.scent!,
      price,
      formData.color!,
      formData.quantity,
      formData.size
    );

    if (success) {
      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 2000);

      setFormData(prev => ({
        ...prev,
        scent: null,
        color: null,
        quantity: '',
        size: DEFAULT_SIZE
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
    if (currentStep === 'scent' && sizeInputRef.current) {
      sizeInputRef.current.focus();
    }
  }, [currentStep, formData.scent]);

  const currentPrice = formData.scent ? getPriceForScent(formData.scent, formData.size) : 0;

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

        {cart.totalQuantity > 0 && (
          <div className="fixed bottom-28 right-4 z-40">
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

      {cart.totalQuantity > 0 && (
        <div className="fixed bottom-28 right-4 z-40">
          <CartBadge count={cart.totalQuantity} onClick={() => setIsCartOpen(true)} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep('landing')}
          className="flex items-center gap-1 text-sm text-earth-600 hover:text-earth-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex items-center gap-1">
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              {index > 0 && <div className="w-4 h-px bg-earth-200" />}
              <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                completedSteps.includes(step.key)
                  ? 'bg-earth-200 text-earth-800'
                  : currentStep === step.key
                    ? 'bg-earth-500 text-white'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {completedSteps.includes(step.key) ? (
                  <Check className="w-3 h-3" />
                ) : (
                  step.icon
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="h-1 bg-earth-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-earth-500 transition-all duration-300"
          style={{ width: `${getStepProgress()}%` }}
        />
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
              <p className="text-sm text-gray-600 mb-3">Pick a size (g/ml):</p>
              
              <input
                ref={sizeInputRef}
                type="number"
                min="50"
                max={MAX_SIZE}
                value={formData.size || ''}
                onChange={(e) => {
                  let value = parseInt(e.target.value) || 0;
                  if (value > MAX_SIZE) value = MAX_SIZE;
                  if (value < 50) value = 50;
                  handleSizeChange(value);
                }}
                className="w-full mb-3 p-3 text-center text-xl font-bold rounded-lg border-2 border-earth-300 focus:border-earth-500 outline-none bg-earth-50"
              />
              
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`
                      flex-1 py-3 rounded-lg font-bold transition-all border-2
                      ${formData.size === size
                        ? 'bg-earth-600 text-white border-earth-600'
                        : 'bg-white text-earth-700 border-earth-200 hover:border-earth-400'}
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.scent && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between bg-earth-50 p-3 rounded-lg">
                <span className="text-sm text-earth-700">
                  {formData.size}g/{formData.size}ml {formData.scent}
                </span>
                <span className="text-lg font-bold text-earth-800">
                  Rs. {currentPrice}
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
              <Droplets className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                {formData.scent === SoapScent.COFFEE 
                  ? 'Coffee creates a natural brown color.'
                  : 'Turmeric gives a natural golden color.'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {COLOR_OPTIONS.map((option) => {
              const isSelected = formData.color === option.label;
              const isDisabled = formData.scent === SoapScent.COFFEE || formData.scent === SoapScent.TURMERIC;
              const isRecommended = isDisabled && option.label === SoapColor.WHITE;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => !isDisabled && handleColorChange(option.label)}
                  disabled={isDisabled}
                  className={`
                    relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}
                    ${isSelected ? 'ring-2 ring-earth-400 bg-gray-50' : ''}
                  `}
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
                  {isRecommended && (
                    <span className="absolute -top-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Recommended
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
