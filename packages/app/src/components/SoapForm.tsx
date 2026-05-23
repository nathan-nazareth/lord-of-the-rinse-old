import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCircle,
  IconHeart,
  IconLeaf,
  IconLock,
  IconShoppingCart,
  IconSparkles,
  IconSquare,
  IconAlertCircle,
} from '@tabler/icons-react';
import React, { useMemo, useRef, useState } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useVariantPrice } from '../hooks/useSoapPricing';
import { useFormStore } from '../stores/useFormStore';
import type { CartItem } from '../types/cart';
import type { CatalogAttribute } from '../types/catalog';

type FormStep = 'landing' | 'shape' | 'scent' | 'color' | 'size' | 'quantity';

const STEPS: FormStep[] = ['shape', 'scent', 'color', 'size', 'quantity'];

const StepIndicator: React.FC<{ current: FormStep; onNavigate: (s: FormStep) => void }> = ({
  current,
  onNavigate,
}) => {
  const currentIdx = STEPS.indexOf(current);

  return (
    <div className="step-indicator px-2 py-4">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <React.Fragment key={step}>
            {idx > 0 && <div className={`step-branch ${isDone ? 'step-branch--done' : ''}`} />}
            <button
              type="button"
              onClick={() => onNavigate(step)}
              className="step-dot"
              aria-label={`${step} step`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`step-circle ${isDone ? 'step-circle--done' : isActive ? 'step-circle--active' : 'step-circle--pending'}`}
              >
                {isDone ? <IconCheck className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`step-label ${isDone ? 'step-label--done' : isActive ? 'step-label--active' : 'step-label--pending'}`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ShapeIcon: React.FC<{ shapeName: string; className?: string }> = ({
  shapeName,
  className,
}) => {
  const lower = shapeName.toLowerCase();
  if (lower.includes('square')) return <IconSquare className={className} />;
  if (lower.includes('circle') || lower.includes('round'))
    return <IconCircle className={className} />;
  if (lower.includes('heart')) return <IconHeart className={className} />;
  if (lower.includes('oval') && lower.includes('dip'))
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="12" rx="10" ry="6" />
        <path d="M8 12c2-1 6-1 8 0" opacity="0.5" />
      </svg>
    );
  if (lower.includes('oval'))
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="12" rx="10" ry="6" />
      </svg>
    );
  return <IconSquare className={className} />;
};

interface SoapFormProps {
  cart: { items: CartItem[]; totalQuantity: number };
  onAddToCart: (
    variantId: string,
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: string,
  ) => void;
  onGoToCart: () => void;
  onGoToCheckout: () => void;
}

export const SoapForm: React.FC<SoapFormProps> = ({
  cart,
  onAddToCart,
  onGoToCart,
  onGoToCheckout,
}) => {
  const [showAddedToast, setShowAddedToast] = useState(false);
  const { data: catalog, isLoading, error } = useCatalog();

  const shape = useFormStore((s) => s.shape);
  const scent = useFormStore((s) => s.scent);
  const color = useFormStore((s) => s.color);
  const size = useFormStore((s) => s.size);
  const quantity = useFormStore((s) => s.quantity);
  const currentStep = useFormStore((s) => s.currentStep);
  const visited = useFormStore((s) => s.visited);
  const setField = useFormStore((s) => s.setField);
  const setCurrentStep = useFormStore((s) => s.setCurrentStep);
  const setVisited = useFormStore((s) => s.setVisited);
  const clear = useFormStore((s) => s.clear);

  // Catalog data
  const shapeOptions = useMemo(
    () => (catalog?.attributes?.shape ?? []).sort((a, b) => a.displayOrder - b.displayOrder),
    [catalog],
  );
  const scentOptions = useMemo(
    () => (catalog?.attributes?.scent ?? []).sort((a, b) => a.displayOrder - b.displayOrder),
    [catalog],
  );
  const colorOptions = useMemo(
    () => (catalog?.attributes?.color ?? []).sort((a, b) => a.displayOrder - b.displayOrder),
    [catalog],
  );
  const sizeOptions = useMemo(
    () => (catalog?.attributes?.size ?? []).sort((a, b) => a.displayOrder - b.displayOrder),
    [catalog],
  );
  const variants = useMemo(() => catalog?.variants ?? [], [catalog]);
  const enabledVariants = useMemo(() => variants.filter((v) => v.enabled), [variants]);

  const selectedAttributes = useMemo(
    () => ({ shape, scent, color, size }),
    [shape, scent, color, size],
  );

  const { unitPrice, matchedVariant } = useVariantPrice(selectedAttributes, enabledVariants);

  // Cart totals
  const cartSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = catalog?.settings?.currency ?? 'USD';

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const shapeSectionRef = useRef<HTMLDivElement>(null);
  const scentSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const quantitySectionRef = useRef<HTMLDivElement>(null);

  const handleShapeChange = (name: string) => {
    setField('shape', name);
    setTimeout(() => scrollToSection(scentSectionRef), 300);
  };

  const handleScentChange = (name: string) => {
    setField('scent', name);
    setTimeout(() => scrollToSection(colorSectionRef), 300);
  };

  const handleColorChange = (name: string) => {
    setField('color', name);
    setTimeout(() => scrollToSection(sizeSectionRef), 300);
  };

  const handleSizeChange = (name: string) => {
    setField('size', name);
    setTimeout(() => scrollToSection(quantitySectionRef), 300);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setField('quantity', value);
  };

  const handleContinueFromLanding = () => {
    setVisited();
    setCurrentStep('shape');
    setTimeout(() => scrollToSection(shapeSectionRef), 100);
  };

  const handleStepNavigate = (step: FormStep) => {
    const stepIdx = STEPS.indexOf(step);
    const currentIdx = STEPS.indexOf(currentStep);
    if (stepIdx <= currentIdx) {
      setCurrentStep(step);
      setTimeout(() => {
        if (step === 'shape') scrollToSection(shapeSectionRef);
        if (step === 'scent') scrollToSection(scentSectionRef);
        if (step === 'color') scrollToSection(colorSectionRef);
        if (step === 'size') scrollToSection(sizeSectionRef);
        if (step === 'quantity') scrollToSection(quantitySectionRef);
      }, 100);
    }
  };

  const isFormValid =
    shape &&
    scent &&
    color &&
    size &&
    matchedVariant &&
    quantity.length > 0 &&
    parseInt(quantity, 10) > 0;

  const handleAddToCart = () => {
    if (!isFormValid || !matchedVariant) return;
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3500);
    onAddToCart(
      matchedVariant.id,
      shape as string,
      scent as string,
      unitPrice,
      color as string,
      quantity,
      size as string,
    );
    clear();
    setCurrentStep('shape');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center mb-6 animate-float">
          <IconLeaf className="w-10 h-10 text-botanical-400 animate-pulse" />
        </div>
        <p className="text-ink-500 font-display text-lg">Loading our collection...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <IconAlertCircle className="w-10 h-10 text-terra-400 mx-auto mb-4" />
        <p className="text-ink-500 font-display text-lg">Unable to load catalog</p>
        <p className="text-ink-400 text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  // Shop closed state
  const shopOpen = catalog?.settings?.shop_open !== 'false';
  if (!shopOpen || enabledVariants.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center mb-6">
          <IconLock className="w-16 h-16 text-ink-300" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink-700 mb-2">
          Our shop is currently closed
        </h2>
        <p className="text-ink-400 text-lg max-w-md mx-auto">
          We&apos;re preparing our next batch of handcrafted soaps. Please check back soon!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Toast notification */}
      {showAddedToast && (
        <div className="toast-apothecary" role="status" aria-live="polite">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <IconCheck className="w-4 h-4" />
          </div>
          <span>Added to cart!</span>
        </div>
      )}

      {/* Landing page */}
      {currentStep === 'landing' && !visited ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6 animate-float">
            <img src="/logo.png" alt="Lord of the Rinse" className="w-20 h-20 object-contain" />
          </div>
          <p className="overline mb-5">Handcrafted with care</p>
          <h2 className="text-display mb-4">Lord of the Rinse</h2>
          <p className="text-ink-500 text-lg mb-10 max-w-sm mx-auto font-body leading-relaxed">
            Choose your shape, scent, color, and size to create your perfect organic soap.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              { num: '01', title: 'Pick Shape', desc: 'Choose from unique soap forms' },
              { num: '02', title: 'Select Scent', desc: 'Natural botanical fragrances' },
              { num: '03', title: 'Choose Color', desc: 'Beautiful natural tones' },
              { num: '04', title: 'Set Quantity', desc: 'Bulk discounts available' },
            ].map((item) => (
              <div key={item.num} className="text-left p-5">
                <p className="text-xs font-semibold text-terra-400 tracking-widest uppercase mb-2">
                  {item.num}
                </p>
                <h3 className="font-display text-lg font-semibold text-ink-700 mb-1">
                  {item.title}
                </h3>
                <p className="text-ink-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 bg-botanical-100 border border-botanical-300 rounded-2xl px-6 py-4 mb-8">
            <IconLeaf className="w-5 h-5 text-botanical-600 flex-shrink-0" />
            <p className="text-botanical-700 font-medium text-sm">
              100% natural ingredients — coconut base, botanical add-ins
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleContinueFromLanding}
              className="btn-apothecary btn-primary btn-full max-w-sm"
            >
              Begin Creating
              <IconArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Form flow */
        <div>
          {/* Mobile cart nav */}
          {cart.totalQuantity > 0 && (
            <div className="flex items-center gap-3 p-4 bg-parchment-100 rounded-2xl border border-parchment-300 mb-6">
              <button
                type="button"
                onClick={onGoToCart}
                className="btn-apothecary btn-secondary flex-1 text-sm py-3"
              >
                <IconShoppingCart className="w-4 h-4" />
                Cart ({cart.totalQuantity})
              </button>
              <button
                type="button"
                onClick={onGoToCheckout}
                disabled={cart.totalQuantity === 0}
                className="btn-apothecary btn-primary flex-1 text-sm py-3"
              >
                {currency} {cartSubtotal} — Checkout
              </button>
            </div>
          )}

          {/* Step indicator */}
          {currentStep !== 'landing' && (
            <StepIndicator current={currentStep} onNavigate={handleStepNavigate} />
          )}

          <div className="border-t border-parchment-300 mt-4 pt-6">
            {/* -- SHAPE STEP -- */}
            <div ref={shapeSectionRef} className="space-y-5">
              <div>
                <p className="overline mb-1">Step 1 of 5</p>
                <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                  Select your shape
                </h2>
                <p className="text-ink-400 text-sm">Choose the form of your handcrafted soap</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {shapeOptions.map((option: CatalogAttribute) => {
                  const isSelected = shape === option.name;
                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => handleShapeChange(option.name)}
                      className={`selection-card ${isSelected ? 'selection-card--selected' : ''}`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex flex-col items-center justify-center p-2">
                        <ShapeIcon shapeName={option.name} className="w-8 h-8 mb-2 text-ink-500" />
                        <p className="font-display text-lg font-semibold text-ink-700 text-center">
                          {option.name}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-terra-400 rounded-full flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {shape && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('scent');
                    setTimeout(() => scrollToSection(scentSectionRef), 100);
                  }}
                  className="btn-apothecary btn-primary btn-full mt-2"
                >
                  Choose Scent
                  <IconArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* -- SCENT STEP -- */}
            {shape && (
              <div ref={scentSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 2 of 5</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                    Choose your scent
                  </h2>
                  <p className="text-ink-400 text-sm">
                    Select the botanical fragrance for your {shape} soap
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {scentOptions.map((option: CatalogAttribute) => {
                    const isSelected = scent === option.name;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => handleScentChange(option.name)}
                        className={`selection-card ${isSelected ? 'selection-card--selected' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <p className="font-display text-lg font-semibold text-ink-700 mb-0.5">
                          {option.name}
                        </p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-terra-400 rounded-full flex items-center justify-center">
                            <IconCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -- COLOR STEP -- */}
            {shape && scent && (
              <div ref={colorSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 3 of 5</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                    Choose a color
                  </h2>
                  <p className="text-ink-400 text-sm">
                    {shape} · {scent}
                  </p>
                </div>

                <div className="flex flex-wrap gap-5 justify-center py-4">
                  {colorOptions.map((option: CatalogAttribute) => {
                    const isSelected = color === option.name;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => handleColorChange(option.name)}
                        className="flex flex-col items-center gap-2"
                        aria-pressed={isSelected}
                        aria-label={`Select ${option.name} color`}
                      >
                        <div
                          className={`color-swatch ${isSelected ? 'color-swatch--selected' : ''}`}
                          style={{ backgroundColor: option.slug || '#ccc' }}
                        >
                          {isSelected && (
                            <IconCheck className="w-5 h-5 text-white" style={{ margin: 'auto' }} />
                          )}
                        </div>
                        <span className="text-xs font-medium text-ink-500">{option.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('scent')}
                    className="btn-apothecary btn-secondary flex-1"
                  >
                    <IconArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('size');
                      setTimeout(() => scrollToSection(sizeSectionRef), 100);
                    }}
                    disabled={!color}
                    className="btn-apothecary btn-primary flex-1"
                  >
                    Choose Size
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -- SIZE STEP -- */}
            {shape && scent && color && currentStep === 'size' && (
              <div ref={sizeSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 4 of 5</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                    Choose a size
                  </h2>
                  <p className="text-ink-400 text-sm">
                    {shape} · {scent} · {color}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {sizeOptions.map((option: CatalogAttribute) => {
                    const isSelected = size === option.name;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => handleSizeChange(option.name)}
                        className={`selection-card ${isSelected ? 'selection-card--selected' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <p className="font-display text-lg font-semibold text-ink-700 text-center">
                          {option.name}
                        </p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-terra-400 rounded-full flex items-center justify-center">
                            <IconCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Variant availability check */}
                {shape && scent && color && size && !matchedVariant && (
                  <div className="flex items-center gap-2 p-4 bg-parchment-100 rounded-2xl border border-terra-300">
                    <IconAlertCircle className="w-5 h-5 text-terra-400 flex-shrink-0" />
                    <span className="text-terra-600 text-sm">
                      This combination is not available. Try a different option.
                    </span>
                  </div>
                )}

                {/* Price summary */}
                {matchedVariant && (
                  <div className="flex items-center justify-between p-4 bg-parchment-100 rounded-2xl border border-parchment-300">
                    <span className="text-ink-600 font-medium">
                      {shape} · {scent} · {color} · {size}
                    </span>
                    <span className="font-display text-xl font-semibold text-terra-500">
                      {currency} {unitPrice}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('color')}
                    className="btn-apothecary btn-secondary flex-1"
                  >
                    <IconArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('quantity');
                      setTimeout(() => scrollToSection(quantitySectionRef), 100);
                    }}
                    disabled={!matchedVariant}
                    className="btn-apothecary btn-primary flex-1"
                  >
                    Set Quantity
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -- QUANTITY STEP -- */}
            {shape && scent && color && size && matchedVariant && currentStep === 'quantity' && (
              <div ref={quantitySectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 5 of 5</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                    How many soaps?
                  </h2>
                  <p className="text-ink-400 text-sm">
                    {shape} · {scent} · {color} · {size} · {currency} {unitPrice} each
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isFormValid) handleAddToCart();
                  }}
                  className="flex items-center justify-center gap-5 py-2"
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quantity}
                    onChange={handleQuantityChange}
                    placeholder="0"
                    className="input-apothecary w-28 text-center text-3xl font-display font-semibold py-4"
                  />
                  <span className="text-2xl text-ink-400 font-display">soaps</span>
                </form>

                <div className="flex flex-wrap gap-2 justify-center">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setField('quantity', String(num))}
                      className={`qty-quick-btn ${quantity === String(num) ? 'qty-quick-btn--selected' : ''}`}
                      aria-pressed={quantity === String(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Order preview */}
                {quantity &&
                  parseInt(quantity, 10) > 0 &&
                  (() => {
                    const qty = parseInt(quantity, 10);
                    const subtotal = unitPrice * qty;
                    const totalQty = qty + cart.totalQuantity;
                    // Simple inline discount calc for preview
                    const discountPercentage = totalQty >= 4 ? 15 : totalQty >= 2 ? 10 : 0;
                    const discountAmount = Math.round(subtotal * (discountPercentage / 100));
                    const total = subtotal - discountAmount;

                    return (
                      <div className="bg-parchment-100 rounded-2xl p-5 border border-parchment-300 space-y-3">
                        <div className="flex justify-between text-ink-600">
                          <span className="text-sm">
                            Subtotal ({qty} soaps x {currency} {unitPrice})
                          </span>
                          <span className="font-medium">
                            {currency} {subtotal}
                          </span>
                        </div>
                        {discountPercentage > 0 ? (
                          <div className="bg-gradient-to-r from-botanical-100 to-botanical-200 rounded-xl p-4 border border-botanical-300">
                            <div className="flex items-center justify-center gap-2 text-botanical-700 font-semibold mb-1">
                              <IconSparkles className="w-4 h-4" />
                              <span className="uppercase text-xs tracking-widest font-accent">
                                Bulk Discount
                              </span>
                              <IconSparkles className="w-4 h-4" />
                            </div>
                            <p className="text-botanical-600 text-sm text-center">
                              {discountPercentage}% off — you save {currency} {discountAmount}
                            </p>
                            <div className="flex justify-between text-lg font-display font-semibold text-ink-700 pt-3 mt-2 border-t border-botanical-300">
                              <span>Total</span>
                              <span>
                                {currency} {total}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between text-orange-600 text-sm">
                            <span>
                              Add{' '}
                              {2 - qty > 0 ? `${2 - qty} more for 10% off` : `2 more for 15% off`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('size')}
                    className="btn-apothecary btn-secondary flex-1"
                  >
                    <IconArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!isFormValid}
                    className={`btn-apothecary btn-primary flex-1 ${!isFormValid ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <IconShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
