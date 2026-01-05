import React, { useState, useEffect } from 'react';
import { SoapScent, SoapColor, OrderFormState, SOAP_OPTIONS, DEFAULT_SIZE, MAX_SIZE } from '../../types';
import { useCart } from '../hooks/useCart';
import { useFormRateLimit } from '../hooks/useFormRateLimit';
import { Cart, CartBadge } from './Cart';
import { ShoppingCart, Check, Sparkles, Palette, Layers, ArrowRight, ArrowLeft, Leaf, Droplets, Plus, Scale } from 'lucide-react';

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

type FormStep = 'scent' | 'color' | 'size' | 'quantity' | 'complete';

export const SoapForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('scent');
  const [showScentInfo, setShowScentInfo] = useState<string | null>(null);
  const { cart, addItem, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const rateLimit = useFormRateLimit({ maxSubmissions: 10, windowMs: 60000, cooldownMs: 30000 });

  const steps: { key: FormStep; label: string; icon: React.ReactNode }[] = [
    { key: 'scent', label: 'Choose Scent', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'color', label: 'Pick Color', icon: <Palette className="w-4 h-4" /> },
    { key: 'size', label: 'Set Size', icon: <Scale className="w-4 h-4" /> },
    { key: 'quantity', label: 'Set Quantity', icon: <Layers className="w-4 h-4" /> },
  ];

  const completedSteps = [
    formData.scent ? 'scent' : null,
    formData.color ? 'color' : null,
    formData.size ? 'size' : null,
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
    setCurrentStep('color');
  };

  const handleColorChange = (color: SoapColor) => {
    setFormData(prev => ({ ...prev, color }));
    setCurrentStep('size');
  };

  useEffect(() => {
    if (currentStep === 'size' && (!formData.scent || !formData.color)) {
      setCurrentStep(formData.scent ? 'color' : 'scent');
    }
    if (currentStep === 'color' && !formData.scent) {
      setCurrentStep('scent');
    }
    if (currentStep === 'quantity' && (!formData.scent || !formData.color || !formData.size)) {
      setCurrentStep(formData.scent && formData.color ? 'size' : formData.scent ? 'color' : 'scent');
    }
  }, [currentStep, formData.scent, formData.color, formData.size]);

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setFormData(prev => ({ ...prev, size: 0 }));
      return;
    }
    const numValue = parseInt(value, 10);
    if (numValue > MAX_SIZE) {
      value = String(MAX_SIZE);
    }
    setFormData(prev => ({ ...prev, size: parseInt(value, 10) || 0 }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, quantity: value }));
  };

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
      setCurrentStep('scent');
    }
  };

  useEffect(() => {
    if (showScentInfo) {
      const timer = setTimeout(() => setShowScentInfo(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showScentInfo]);

  const currentPrice = formData.scent ? getPriceForScent(formData.scent, formData.size) : 0;
  const basePrice = formData.scent ? getBasePriceForScent(formData.scent) : 0;

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

      {cart.items.length === 0 && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-earth-50 to-white rounded-xl p-4 border border-earth-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-earth-100 p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-earth-600" />
              </div>
              <div>
                <h3 className="font-semibold text-earth-800 mb-1 text-sm">Build Your Custom Soaps</h3>
                <p className="text-earth-600 text-xs">Create different combinations — add all to cart, then submit one order.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-earth-200 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-earth-200 border-2 border-white flex items-center justify-center">
                <span className="text-earth-700 text-xs font-bold">1</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-earth-100 border-2 border-white flex items-center justify-center">
                <span className="text-earth-600 text-xs font-bold">2</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-earth-100 border-2 border-white flex items-center justify-center">
                <span className="text-earth-600 text-xs font-bold">3</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold">4</span>
              </div>
            </div>
            <div className="text-xs text-earth-700">
              <strong>Mix & Match:</strong> Different scents, colors, sizes, quantities
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-earth-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {steps.map((step, index) => (
                <React.Fragment key={step.key}>
                  {index > 0 && (
                    <div className="w-6 h-px bg-earth-200" />
                  )}
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all ${
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
                    <span className="hidden xs:inline">{step.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-xs text-earth-500">
            {completedSteps.length}/{steps.length}
          </div>
        </div>

        <div className="h-1 bg-earth-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-earth-500 transition-all duration-500 ease-out"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      </div>

      {currentStep === 'scent' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={() => {}}
            className="w-full bg-white rounded-xl p-5 shadow-sm border border-earth-100 hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-serif font-bold mb-3 text-earth-800 flex items-center gap-3">
              <span className="bg-earth-100 w-8 h-8 rounded-full flex items-center justify-center text-earth-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div>Choose Your Scent</div>
                <p className="text-xs font-normal text-earth-500">9 options • Up to 100g/100ml</p>
              </div>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SOAP_OPTIONS.map((option) => {
                const info = SCENT_INFO[option.scent];
                const isSelected = formData.scent === option.scent;
                const isRecommended = [SoapScent.LAVENDER, SoapScent.ALOE_VERA, SoapScent.COCONUT, SoapScent.HONEY].includes(option.scent);
                
                return (
                  <button
                    key={option.scent}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleScentChange(option.scent); }}
                    onMouseEnter={() => setShowScentInfo(option.scent)}
                    onMouseLeave={() => setShowScentInfo(null)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all duration-200 relative group
                      ${isSelected 
                        ? 'border-earth-500 bg-earth-50 shadow-inner' 
                        : 'border-gray-100 hover:border-earth-300 hover:bg-gray-50'}
                    `}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2 left-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isSelected ? 'text-earth-800' : 'text-gray-700'}`}>
                        {option.scent}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-earth-600" />}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-earth-500">{info.description}</p>
                      <span className="text-sm font-bold text-earth-700">Rs. {option.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>

              {showScentInfo && (
                <div className="mt-3 p-2 bg-earth-50 rounded-lg border border-earth-200 flex items-center gap-2 animate-in fade-in">
                  <Leaf className="w-4 h-4 text-earth-600 flex-shrink-0" />
                  <span className="text-xs text-earth-700">
                    <strong>Tip:</strong> {SCENT_INFO[showScentInfo]?.tip}
                  </span>
                </div>
              )}
          </button>
        </div>
      )}

      {currentStep === 'color' && formData.scent && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
            <button
              type="button"
              onClick={() => setCurrentStep('scent')}
              className="flex items-center gap-2 text-earth-600 hover:text-earth-800 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to scents</span>
            </button>
            
            <h2 className="text-lg font-serif font-bold mb-2 text-earth-800 flex items-center gap-3">
              <span className="bg-earth-100 w-8 h-8 rounded-full flex items-center justify-center text-earth-700">
                <Palette className="w-4 h-4" />
              </span>
              <div>
                <div>Choose a Color for {formData.scent}</div>
                <p className="text-xs font-normal text-earth-500">9 color options</p>
              </div>
            </h2>
            
            {(formData.scent === SoapScent.COFFEE || formData.scent === SoapScent.TURMERIC) && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
                <Droplets className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">Color comes from the scent</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {formData.scent === SoapScent.COFFEE 
                      ? 'Coffee creates a rich brown color.'
                      : 'Turmeric gives a beautiful golden-orange hue.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
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
                      group relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                      ${isSelected ? 'ring-2 ring-earth-400 bg-gray-50' : ''}
                    `}
                  >
                    <div 
                      className={`
                        w-16 h-16 rounded-full shadow-sm border-2 transition-all duration-300
                        ${option.class}
                        ${isSelected ? 'border-earth-400 scale-105 ring-2 ring-earth-200' : 'border-transparent'}
                        ${isRecommended ? 'ring-2 ring-amber-300' : ''}
                      `}
                      style={{ backgroundColor: option.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-black/30" />
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-earth-800' : 'text-gray-500'}`}>
                      {option.label}
                    </span>
                    {isRecommended && (
                      <span className="absolute -top-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'size' && formData.scent && formData.color && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
            <button
              type="button"
              onClick={() => setCurrentStep('color')}
              className="flex items-center gap-2 text-earth-600 hover:text-earth-800 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to colors</span>
            </button>
            
            <h2 className="text-lg font-serif font-bold mb-3 text-earth-800 flex items-center gap-3">
              <span className="bg-earth-100 w-8 h-8 rounded-full flex items-center justify-center text-earth-700">
                <Scale className="w-4 h-4" />
              </span>
              <div>
                <div>What Size for {formData.scent}?</div>
                <p className="text-xs font-normal text-earth-500">g and ml are the same value</p>
              </div>
            </h2>
            
            <div className="mt-4">
              <div className="flex items-center gap-3 max-w-xs ml-0 md:ml-10">
                <div className="relative w-full">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.size || ''}
                    onChange={handleSizeChange}
                    placeholder="0"
                    max={MAX_SIZE}
                    className="w-full p-4 pr-24 text-2xl font-bold text-center rounded-xl border-2 border-gray-200 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-600 font-medium pointer-events-none">
                    g/ml
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 justify-center md:justify-start md:ml-10">
                {[25, 50, 75, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, size: num }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.size === num
                        ? 'bg-earth-600 text-white'
                        : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {formData.size > 0 && (
                <div className="mt-4 p-3 bg-earth-50 rounded-lg border border-earth-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-earth-700">
                      Price for {formData.size}g/{formData.size}ml:
                    </span>
                    <span className="text-lg font-bold text-earth-800">
                      Rs. {currentPrice}
                    </span>
                  </div>
                  <p className="text-xs text-earth-500 mt-1">
                    Base: Rs. {basePrice} for 100g/100ml • Ratio: {(formData.size / 100).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'quantity' && formData.scent && formData.color && formData.size > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
            <button
              type="button"
              onClick={() => setCurrentStep('size')}
              className="flex items-center gap-2 text-earth-600 hover:text-earth-800 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to size</span>
            </button>
            
            <h2 className="text-lg font-serif font-bold mb-3 text-earth-800 flex items-center gap-3">
              <span className="bg-earth-100 w-8 h-8 rounded-full flex items-center justify-center text-earth-700">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <div>How Many {formData.scent} Soaps?</div>
                <p className="text-xs font-normal text-earth-500">{formData.size}g/{formData.size}ml each • Rs. {currentPrice} each</p>
              </div>
            </h2>
            
            <div className="mt-4">
              <div className="flex items-center gap-3 max-w-xs ml-0 md:ml-10">
                <div className="relative w-full">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    placeholder="0"
                    className="w-full p-4 pr-20 text-2xl font-bold text-center rounded-xl border-2 border-gray-200 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-600 font-medium pointer-events-none">
                    soaps
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 justify-center md:justify-start md:ml-10">
                {[1, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, quantity: String(num) }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                <div className="mt-4 p-3 bg-earth-50 rounded-lg border border-earth-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-earth-700">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-earth-800">
                      Rs. {currentPrice * parseInt(formData.quantity, 10)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-earth-200 p-3 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.15)]">
        <div className="max-w-3xl mx-auto">
          {cart.items.length > 0 && (
            <div className="mb-2 p-2 bg-earth-50 rounded-lg border border-earth-200">
              <div className="flex items-center gap-2 text-earth-700 text-xs font-medium">
                <Check className="w-3 h-3 text-green-600" />
                Multiple items in cart
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="hidden sm:block text-xs text-earth-600">
              {isFormValid ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  Ready to add!
                </span>
              ) : (
                cart.totalQuantity > 0 
                  ? 'Add more or checkout'
                  : 'Complete all steps'
              )}
            </div>
            
            {cart.totalQuantity > 0 ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all bg-earth-100 text-earth-700 hover:bg-earth-200"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cart.totalQuantity})
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isButtonDisabled}
                  className={`
                    flex-1 sm:flex-none px-4 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all min-w-[120px]
                    ${!isButtonDisabled
                      ? 'bg-earth-600 text-white hover:bg-earth-700 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  <Plus className="w-4 h-4" />
                  {buttonText}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isButtonDisabled}
                className={`
                  w-full sm:w-auto px-8 py-3 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all
                  ${!isButtonDisabled
                    ? 'bg-earth-600 text-white hover:bg-earth-700 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'}
                `}
              >
                <Plus className="w-4 h-4" />
                {buttonText}
              </button>
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="mt-2 pt-2 border-t border-earth-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {cart.items.slice(0, 3).map((item) => (
                  <span 
                    key={item.id} 
                    className="flex-shrink-0 text-xs bg-earth-50 px-2 py-1 rounded-full border border-earth-200 text-earth-700"
                  >
                    {item.quantity}x {item.scent} {item.size !== 100 && `(${item.size}g)`}
                  </span>
                ))}
                {cart.items.length > 3 && (
                  <span className="flex-shrink-0 text-xs text-earth-500 py-1">
                    +{cart.items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="text-[10px] text-earth-400 text-center mt-2">
            {rateLimit.cooldownRemaining !== null
              ? `Rate limit: try again in ${rateLimit.cooldownRemaining}s`
              : `${remainingCount}/10 submissions`}
          </div>
        </div>
      </div>
    </div>
  );
};
