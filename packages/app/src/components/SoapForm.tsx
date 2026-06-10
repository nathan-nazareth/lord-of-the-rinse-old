import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCircle,
  IconHeart,
  IconLeaf,
  IconShoppingCart,
  IconSparkles,
  IconSquare,
} from '@tabler/icons-react';
import React, { useMemo, useRef, useState } from 'react';
import {
  LAVENDER_PIECES_PRICE,
  SHAPE_OPTIONS,
  SOAP_OPTIONS,
  SoapColor,
  SoapScent,
  SoapShape,
} from '../../types';
import { useSoapPricing, useVariantPrice } from '../hooks/useSoapPricing';
import { useFormStore } from '../stores/useFormStore';
import type { FormStep } from '../stores/useFormStore';
import type { CartItem } from '../types/cart';
import { useCatalog } from '../hooks/useCatalog';
import { calculateDiscount } from '../utils/pricing';

type SizeLabel = 'S' | 'M' | 'L';

const getSizeOptions = (shape: SoapShape): Array<{ label: SizeLabel; grams: number }> => {
  const limits = SIZE_LIMITS[shape];
  const min = limits.min;
  const max = limits.max;
  const mid = Math.round((min + max) / 2);
  return [
    { label: 'S', grams: min },
    { label: 'M', grams: mid },
    { label: 'L', grams: max },
  ];
};

const SCENT_INFO: Record<string, { description: string; tagline: string }> = {
  Lavender: { description: 'Calming & relaxing', tagline: 'For a restful ritual' },
  Coconut: { description: 'Tropical & hydrating', tagline: 'Silky smooth finish' },
  Citronella: { description: 'Fresh & mosquito-repelling', tagline: 'Outdoor protection' },
  Lemongrass: { description: 'Invigorating & cleansing', tagline: 'Natural energy boost' },
};

const COLOR_CONFIG = [
  { label: 'Ivory', value: SoapColor.WHITE, hex: '#FFFFFF' },
  { label: 'Honey', value: SoapColor.YELLOW, hex: '#FDE68A' },
  { label: 'Blush', value: SoapColor.PINK, hex: '#FCD5CE' },
  { label: 'Sage', value: SoapColor.GREEN, hex: '#A7C4A0' },
  { label: 'Sky', value: SoapColor.BLUE, hex: '#A8D8EA' },
  { label: 'Lilac', value: SoapColor.PURPLE, hex: '#D4A5E0' },
];

const STEPS: FormStep[] = ['shape', 'scent', 'color', 'quantity'];

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

const SIZE_LIMITS: Record<string, { min: number; max: number }> = {
  [SoapShape.SQUARE]: { min: 50, max: 100 },
  [SoapShape.OVAL_DIP]: { min: 35, max: 50 },
  [SoapShape.HEART]: { min: 50, max: 75 },
  [SoapShape.OVAL_FLAT]: { min: 50, max: 85 },
  [SoapShape.CIRCLE]: { min: 50, max: 100 },
};

const ShapeIcon: React.FC<{ shape: SoapShape; className?: string }> = ({ shape, className }) => {
  switch (shape) {
    case SoapShape.SQUARE:
      return <IconSquare className={className} />;
    case SoapShape.CIRCLE:
      return <IconCircle className={className} />;
    case SoapShape.HEART:
      return <IconHeart className={className} />;
    case SoapShape.OVAL_FLAT:
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
    case SoapShape.OVAL_DIP:
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
    default:
      return null;
  }
};

interface SoapFormProps {
  cart: { items: CartItem[]; totalQuantity: number };
  onAddToCart: (
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: string,
    hasLavenderPieces: boolean,
    variantId?: string,
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

  const shape = useFormStore((s) => s.shape);
  const scent = useFormStore((s) => s.scent);
  const color = useFormStore((s) => s.color);
  const quantity = useFormStore((s) => s.quantity);
  const size = useFormStore((s) => s.size);
  const hasLavenderPieces = useFormStore((s) => s.hasLavenderPieces);
  const currentStep = useFormStore((s) => s.currentStep);
  const visited = useFormStore((s) => s.visited);
  const setField = useFormStore((s) => s.setField);
  const setCurrentStep = useFormStore((s) => s.setCurrentStep);
  const setVisited = useFormStore((s) => s.setVisited);
  const clear = useFormStore((s) => s.clear);

  const { totalPrice } = useSoapPricing(scent, size ?? 0, hasLavenderPieces);
  const { data: catalog } = useCatalog();

  // Resolve the real catalog variant UUID for the currently selected
  // attributes so the server's checkout handler can match it against the DB.
  const selectedAttributes = useMemo<Record<string, string | null>>(
    () => ({
      shape: shape ?? null,
      scent: scent ?? null,
      color: color ?? null,
      size: size != null ? String(size) : null,
    }),
    [shape, scent, color, size],
  );
  const { matchedVariant } = useVariantPrice(selectedAttributes, catalog?.variants ?? []);
  const matchedVariantId = matchedVariant?.id ?? null;

  const cartSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { total: cartTotal } = calculateDiscount(cartSubtotal, cart.totalQuantity);

  const shapeSectionRef = useRef<HTMLDivElement>(null);
  const flavorSectionRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const lavenderSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);
  const quantitySectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleShapeChange = (shape: SoapShape) => {
    const options = getSizeOptions(shape);
    setField('shape', shape);
    setField('size', options[0].grams);
    setTimeout(() => scrollToSection(flavorSectionRef), 300);
  };

  const handleScentChange = (scent: SoapScent) => {
    setField('scent', scent);
    setField('hasLavenderPieces', false);
    setTimeout(() => scrollToSection(sizeSectionRef), 300);
  };

  const handleSizeChange = (newSize: number) => {
    setField('size', newSize);
    setTimeout(() => scrollToSection(lavenderSectionRef), 300);
  };

  const handleContinueFromLanding = () => {
    setVisited();
    setCurrentStep('shape');
    setTimeout(() => scrollToSection(shapeSectionRef), 100);
  };

  const handleColorChange = (color: SoapColor) => {
    setField('color', color);
    setTimeout(() => scrollToSection(quantitySectionRef), 100);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setField('quantity', value);
  };

  const isScentStepValid = scent && size !== null;
  const isFormValid =
    shape && scent && color && size !== null && quantity.length > 0 && parseInt(quantity, 10) > 0;

  const handleStepNavigate = (step: FormStep) => {
    const stepIdx = STEPS.indexOf(step);
    const currentIdx = STEPS.indexOf(currentStep);
    if (stepIdx <= currentIdx) {
      setCurrentStep(step);
      setTimeout(() => {
        if (step === 'shape') scrollToSection(shapeSectionRef);
        if (step === 'scent') scrollToSection(flavorSectionRef);
        if (step === 'color') scrollToSection(colorSectionRef);
        if (step === 'quantity') scrollToSection(quantitySectionRef);
      }, 100);
    }
  };

  const handleAddToCart = () => {
    if (!isFormValid) return;
    setShowAddedToast(true);
    const toastTimeout = window.setTimeout(() => setShowAddedToast(false), 3500);
    // biome-ignore lint/style/noNonNullAssertion: validated by isFormValid before submit
    const shapeVal = shape!;
    // biome-ignore lint/style/noNonNullAssertion: validated by isFormValid before submit
    const scentVal = scent!;
    // biome-ignore lint/style/noNonNullAssertion: validated by isFormValid before submit
    const colorVal = color!;
    onAddToCart(
      shapeVal,
      scentVal,
      totalPrice,
      colorVal,
      quantity,
      String(size),
      hasLavenderPieces,
      matchedVariantId ?? undefined,
    );
    clear();
    setCurrentStep('shape');
    // The toast setTimeout above is short-lived; we don't need to track it for
    // unmount cleanup. Keep this placeholder comment to document intent.
    void toastTimeout;
  };

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
            Choose your shape, scent, size, and natural additives to create your perfect organic
            soap.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              { num: '01', title: 'Pick Shape', desc: 'Choose from five unique soap forms' },
              { num: '02', title: 'Select Scent', desc: 'Four natural botanical fragrances' },
              { num: '03', title: 'Choose Color', desc: 'Five beautiful natural tones' },
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
                Rs. {cartTotal} — Checkout
              </button>
            </div>
          )}

          {/* Step indicator */}
          {currentStep !== 'landing' && (
            <StepIndicator current={currentStep} onNavigate={handleStepNavigate} />
          )}

          <div className="border-t border-parchment-300 mt-4 pt-6">
            {/* ── SHAPE STEP ── */}
            <div ref={shapeSectionRef} className="space-y-5">
              <div>
                <p className="overline mb-1">Step 1 of 4</p>
                <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                  Select your shape
                </h2>
                <p className="text-ink-400 text-sm">Choose the form of your handcrafted soap</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SHAPE_OPTIONS.map((option) => {
                  const isSelected = shape === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleShapeChange(option.value as SoapShape)}
                      className={`selection-card ${isSelected ? 'selection-card--selected' : ''}`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex flex-col items-center justify-center p-2">
                        <ShapeIcon
                          shape={option.value as SoapShape}
                          className="w-8 h-8 mb-2 text-ink-500"
                        />
                        <p className="font-display text-lg font-semibold text-ink-700 text-center">
                          {option.label}
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
                    setTimeout(() => scrollToSection(flavorSectionRef), 100);
                  }}
                  className="btn-apothecary btn-primary btn-full mt-2"
                >
                  Choose Scent
                  <IconArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ── SCENT STEP ── */}
            {shape && (
              <div ref={flavorSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 2 of 4</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                    Choose your scent
                  </h2>
                  <p className="text-ink-400 text-sm">
                    Select the botanical fragrance for your {shape} soap
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {SOAP_OPTIONS.map((option) => {
                    const info = SCENT_INFO[option.scent];
                    const isSelected = scent === option.scent;
                    return (
                      <button
                        type="button"
                        key={option.scent}
                        onClick={() => handleScentChange(option.scent)}
                        className={`selection-card ${isSelected ? 'selection-card--selected' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <p className="font-display text-lg font-semibold text-ink-700 mb-0.5">
                          {option.scent}
                        </p>
                        <p className="text-ink-400 text-xs mb-1">{info.description}</p>
                        <p className="text-terra-500 text-xs italic">{info.tagline}</p>
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

            {/* ── SIZE + ADDONS STEP ── */}
            {scent && (
              <div ref={sizeSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="overline mb-0.5">Step 2a</p>
                      <h2 className="font-display text-xl font-semibold text-ink-700">
                        Select size
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <span className="badge-tag">{shape}</span>
                      <span className="badge-tag">{scent}</span>
                    </div>
                  </div>

                  {shape && (
                    <div>
                      <p className="text-ink-400 text-sm mb-3">
                        Choose a size ({SIZE_LIMITS[shape].min}–{SIZE_LIMITS[shape].max}g for{' '}
                        {shape})
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {getSizeOptions(shape as SoapShape).map((option) => {
                          const isSelected = size === option.grams;
                          return (
                            <button
                              type="button"
                              key={option.label}
                              onClick={() => handleSizeChange(option.grams)}
                              className={`selection-card flex flex-col items-center justify-center py-5 ${
                                isSelected ? 'selection-card--selected' : ''
                              }`}
                              aria-pressed={isSelected}
                              aria-label={`Size ${option.label} (${option.grams} grams)`}
                            >
                              <span className="font-display text-2xl font-semibold text-ink-700">
                                {option.label}
                              </span>
                              <span className="text-ink-400 text-sm mt-1">{option.grams}g</span>
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
                </div>

                <div ref={lavenderSectionRef} className="space-y-3">
                  {(scent === SoapScent.LAVENDER || scent === SoapScent.COCONUT) && (
                    <button
                      type="button"
                      onClick={() => setField('hasLavenderPieces', !hasLavenderPieces)}
                      className={`addon-toggle ${hasLavenderPieces ? 'addon-toggle--active' : ''}`}
                      aria-pressed={hasLavenderPieces}
                    >
                      <span className="flex items-center gap-3">
                        <IconLeaf className="w-6 h-6 flex-shrink-0" />
                        <span>
                          <span className="font-medium text-ink-700 block">
                            Dried Lavender Pieces
                          </span>
                          <span className="text-ink-400 text-sm">
                            +Rs. {LAVENDER_PIECES_PRICE} — calming botanicals
                          </span>
                        </span>
                      </span>
                      {hasLavenderPieces && (
                        <IconCheck className="w-5 h-5 text-botanical-500 flex-shrink-0" />
                      )}
                    </button>
                  )}

                  {/* Price summary */}
                  <div className="flex items-center justify-between p-4 bg-parchment-100 rounded-2xl border border-parchment-300">
                    <span className="text-ink-600 font-medium">
                      {size ?? 0}g {scent}
                      {hasLavenderPieces && ' + Lavender'}
                    </span>
                    <span className="font-display text-xl font-semibold text-terra-500">
                      Rs. {totalPrice}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('color');
                      setTimeout(() => scrollToSection(colorSectionRef), 100);
                    }}
                    disabled={!isScentStepValid}
                    className="btn-apothecary btn-primary btn-full mt-2"
                  >
                    Choose Color
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── COLOR STEP ── */}
            {currentStep === 'color' && shape && scent && (
              <div ref={colorSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 3 of 4</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                    Choose a color
                  </h2>
                  <p className="text-ink-400 text-sm">
                    {shape} · {scent} · {size ?? 0}g · Rs. {totalPrice}
                  </p>
                </div>

                <div className="flex flex-wrap gap-5 justify-center py-4">
                  {COLOR_CONFIG.map((opt) => {
                    const isSelected = color === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => handleColorChange(opt.value)}
                        className="flex flex-col items-center gap-2"
                        aria-pressed={isSelected}
                        aria-label={`Select ${opt.label} color`}
                      >
                        <div
                          className={`color-swatch ${isSelected ? 'color-swatch--selected' : ''}`}
                          style={{ backgroundColor: opt.hex }}
                        >
                          {isSelected && (
                            <IconCheck className="w-5 h-5 text-white" style={{ margin: 'auto' }} />
                          )}
                        </div>
                        <span className="text-xs font-medium text-ink-500">{opt.label}</span>
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
                      setCurrentStep('quantity');
                      setTimeout(() => scrollToSection(quantitySectionRef), 100);
                    }}
                    disabled={!color}
                    className="btn-apothecary btn-primary flex-1"
                  >
                    Set Quantity
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── QUANTITY STEP ── */}
            {currentStep === 'quantity' && shape && scent && color && (
              <div ref={quantitySectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 4 of 4</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">
                    How many soaps?
                  </h2>
                  <p className="text-ink-400 text-sm">
                    {shape} · {scent} · {color} · {size ?? 0}g · Rs. {totalPrice} each
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
                    const subtotal = totalPrice * qty;
                    const totalQty = qty + cart.totalQuantity;
                    const { discountPercentage, discountAmount, total } = calculateDiscount(
                      subtotal,
                      totalQty,
                    );

                    return (
                      <div className="bg-parchment-100 rounded-2xl p-5 border border-parchment-300 space-y-3">
                        <div className="flex justify-between text-ink-600">
                          <span className="text-sm">
                            Subtotal ({qty} soaps × Rs. {totalPrice})
                          </span>
                          <span className="font-medium">Rs. {subtotal}</span>
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
                              {discountPercentage}% off — you save Rs. {discountAmount}
                            </p>
                            <div className="flex justify-between text-lg font-display font-semibold text-ink-700 pt-3 mt-2 border-t border-botanical-300">
                              <span>Total</span>
                              <span>Rs. {total}</span>
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
                    onClick={() => setCurrentStep('color')}
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
