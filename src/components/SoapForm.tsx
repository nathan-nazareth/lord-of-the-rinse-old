import React, { useState, useEffect, useRef } from "react";
import {
  SoapScent,
  SoapColor,
  OrderFormState,
  SOAP_OPTIONS,
  DEFAULT_SIZE,
  LAVENDER_PIECES_PRICE,
  ROSE_PIECES_PRICE,
} from "../../types";
import { useSoapPricing } from "../hooks/useSoapPricing";
import { useFormPersistence } from "../hooks/useFormPersistence";
import { calculateDiscount } from "../utils/pricing";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Check from "lucide-react/dist/esm/icons/check";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Leaf from "lucide-react/dist/esm/icons/leaf";

const SIZE_OPTIONS = [
  { label: "S", weight: 50 },
  { label: "M", weight: 75 },
  { label: "L", weight: 100 },
];

const INITIAL_STATE: OrderFormState = {
  scent: null,
  color: null,
  quantity: "",
  size: DEFAULT_SIZE,
  hasLavenderPieces: false,
  hasRosePieces: false,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
};

const SCENT_INFO: Record<string, { description: string; tagline: string }> = {
  Lavender: { description: "Calming & relaxing", tagline: "For a restful ritual" },
  Coconut: { description: "Tropical & hydrating", tagline: "Silky smooth finish" },
  Lemongrass: { description: "Fresh & uplifting", tagline: "Morning invigoration" },
  Rose: { description: "Romantic & soothing", tagline: "Elegant floral warmth" },
};

const COLOR_CONFIG = [
  { label: "Ivory", value: SoapColor.WHITE, hex: "#FFFFFF" },
  { label: "Honey", value: SoapColor.YELLOW, hex: "#FDE68A" },
  { label: "Blush", value: SoapColor.PINK, hex: "#FCD5CE" },
];

type FormStep = "landing" | "scent" | "color" | "quantity";

const STEPS: FormStep[] = ["scent", "color", "quantity"];

const StepIndicator: React.FC<{ current: FormStep; onNavigate: (s: FormStep) => void }> = ({ current, onNavigate }) => {
  const currentIdx = STEPS.indexOf(current);

  return (
    <div className="step-indicator px-2 py-4">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <React.Fragment key={step}>
            {idx > 0 && (
              <div
                className={`step-branch ${isDone ? "step-branch--done" : ""}`}
              />
            )}
            <button
              type="button"
              onClick={() => onNavigate(step)}
              className="step-dot"
              aria-label={`${step} step`}
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={`step-circle ${isDone ? "step-circle--done" : isActive ? "step-circle--active" : "step-circle--pending"}`}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`step-label ${isDone ? "step-label--done" : isActive ? "step-label--active" : "step-label--pending"}`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const BotanicalLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 Q28 12 28 22 Q20 32 12 22 Q12 12 20 4" fill="#7AA07F" opacity="0.7"/>
    <ellipse cx="10" cy="18" rx="5" ry="8" fill="#C4785A" opacity="0.4" transform="rotate(-25 10 18)"/>
    <ellipse cx="30" cy="18" rx="5" ry="8" fill="#C4785A" opacity="0.4" transform="rotate(25 30 18)"/>
  </svg>
);

interface SoapFormProps {
  cart: { items: any[]; totalQuantity: number };
  onAddToCart: (
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
    hasRosePieces: boolean,
  ) => void;
  onGoToCart: () => void;
  onGoToCheckout: () => void;
}

export const SoapForm: React.FC<SoapFormProps> = ({ cart, onAddToCart, onGoToCart, onGoToCheckout }) => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>("landing");

  const { totalPrice } = useSoapPricing(
    formData.scent, formData.size, formData.hasLavenderPieces, formData.hasRosePieces,
  );

  const cartSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { total: cartTotal } = calculateDiscount(cartSubtotal, cart.totalQuantity);
  const { hasVisited: hasVisitedFn, restoreFormState, saveFormState } = useFormPersistence();

  const flavorSectionRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const lavenderSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);
  const quantitySectionRef = useRef<HTMLDivElement>(null);

  const hasVisited = hasVisitedFn();

  useEffect(() => {
    if (!hasVisited) return;
    const restored = restoreFormState();
    if (!restored) return;
    setFormData((prev) => ({
      ...prev,
      scent: restored.scent ?? prev.scent,
      color: restored.color ?? prev.color,
      quantity: restored.quantity ?? prev.quantity,
      size: restored.size ?? prev.size,
      hasLavenderPieces: restored.hasLavenderPieces ?? prev.hasLavenderPieces,
      hasRosePieces: restored.hasRosePieces ?? prev.hasRosePieces,
    }));
    if (restored.currentStep && restored.currentStep !== "landing") {
      setCurrentStep(restored.currentStep);
    }
  }, [hasVisited, restoreFormState]);

  useEffect(() => {
    saveFormState(
      formData.scent, formData.color, formData.quantity, formData.size,
      formData.hasLavenderPieces, formData.hasRosePieces, currentStep,
    );
  }, [formData, currentStep, saveFormState]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleScentChange = (scent: SoapScent) => {
    setFormData((prev) => ({
      ...prev,
      scent,
      hasLavenderPieces: false,
      hasRosePieces: false,
    }));
    setTimeout(() => scrollToSection(sizeSectionRef), 300);
  };

  const handleSizeChange = (size: number) => {
    setFormData((prev) => ({ ...prev, size }));
    setTimeout(() => scrollToSection(lavenderSectionRef), 300);
  };

  const handleContinueFromLanding = () => {
    setCurrentStep("scent");
    setTimeout(() => scrollToSection(flavorSectionRef), 100);
  };

  const handleColorChange = (color: SoapColor) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, quantity: value }));
  };

  const isScentStepValid = formData.scent && formData.size > 0;
  const isFormValid =
    formData.scent &&
    formData.color &&
    formData.size > 0 &&
    formData.quantity.length > 0 &&
    parseInt(formData.quantity, 10) > 0;

  const handleStepNavigate = (step: FormStep) => {
    const stepIdx = STEPS.indexOf(step);
    const currentIdx = STEPS.indexOf(currentStep);
    if (stepIdx <= currentIdx) {
      setCurrentStep(step);
      setTimeout(() => {
        if (step === "scent") scrollToSection(flavorSectionRef);
        if (step === "color") scrollToSection(colorSectionRef);
        if (step === "quantity") scrollToSection(quantitySectionRef);
      }, 100);
    }
  };

  const handleAddToCart = () => {
    if (!isFormValid) return;
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3500);
    onAddToCart(
      formData.scent!, totalPrice, formData.color!, formData.quantity,
      formData.size, formData.hasLavenderPieces, formData.hasRosePieces,
    );
    setFormData(INITIAL_STATE);
    setCurrentStep("scent");
  };

  return (
    <div>
      {/* Toast notification */}
      {showAddedToast && (
        <div className="toast-apothecary" role="status" aria-live="polite">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>Added to cart!</span>
        </div>
      )}

      {/* Landing page */}
      {currentStep === "landing" && !hasVisited ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6 animate-float">
            <BotanicalLeafIcon className="w-20 h-20" />
          </div>
          <p className="overline mb-5">Handcrafted with care</p>
          <h2 className="text-display mb-4">Your soap, your story</h2>
          <p className="text-ink-500 text-lg mb-10 max-w-sm mx-auto font-body leading-relaxed">
            Choose from four botanical scents, three sizes, and natural additives to create your perfect organic soap.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { num: "01", title: "Choose Scent", desc: "Four natural botanical fragrances" },
              { num: "02", title: "Pick Color", desc: "Three beautiful natural tones" },
              { num: "03", title: "Set Quantity", desc: "Bulk discounts available" },
            ].map((item) => (
              <div key={item.num} className="text-left p-5">
                 <p className="text-xs font-semibold text-terra-400 tracking-widest uppercase mb-2">{item.num}</p>
                 <h3 className="font-display text-lg font-semibold text-ink-700 mb-1">{item.title}</h3>
                 <p className="text-ink-400 text-sm">{item.desc}</p>
               </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 bg-botanical-100 border border-botanical-300 rounded-2xl px-6 py-4 mb-8">
            <Leaf className="w-5 h-5 text-botanical-600 flex-shrink-0" />
            <p className="text-botanical-700 font-medium text-sm">100% natural ingredients — coconut base, botanical add-ins</p>
          </div>

          <div>
            <button
              onClick={handleContinueFromLanding}
              className="btn-apothecary btn-primary btn-full max-w-sm"
            >
              Begin Creating
              <ArrowRight className="w-5 h-5" />
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
                onClick={onGoToCart}
                className="btn-apothecary btn-secondary flex-1 text-sm py-3"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart ({cart.totalQuantity})
              </button>
              <button
                onClick={onGoToCheckout}
                disabled={cart.totalQuantity === 0}
                className="btn-apothecary btn-primary flex-1 text-sm py-3"
              >
                Rs. {cartTotal} — Checkout
              </button>
            </div>
          )}

          {/* Step indicator */}
          {currentStep !== "landing" && (
            <StepIndicator current={currentStep} onNavigate={handleStepNavigate} />
          )}

          <div className="border-t border-parchment-300 mt-4 pt-6">

            {/* ── SCENT STEP ── */}
            <div ref={flavorSectionRef} className="space-y-5">
              <div>
                <p className="overline mb-1">Step 1 of 3</p>
                <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">Choose your scent</h2>
                <p className="text-ink-400 text-sm">Select the botanical fragrance for your soap</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SOAP_OPTIONS.map((option) => {
                  const info = SCENT_INFO[option.scent];
                  const isSelected = formData.scent === option.scent;
                  return (
                    <button
                      key={option.scent}
                      onClick={() => handleScentChange(option.scent)}
                      className={`selection-card ${isSelected ? "selection-card--selected" : ""}`}
                      aria-pressed={isSelected}
                    >
                      <p className="font-display text-lg font-semibold text-ink-700 mb-0.5">{option.scent}</p>
                      <p className="text-ink-400 text-xs mb-1">{info.description}</p>
                      <p className="text-terra-500 text-xs italic">{info.tagline}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-terra-400 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── SIZE + ADDONS STEP ── */}
            {formData.scent && (
              <div ref={sizeSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="overline mb-0.5">Step 2a</p>
                      <h2 className="font-display text-xl font-semibold text-ink-700">Select size</h2>
                    </div>
                    <span className="badge-tag">{formData.scent}</span>
                  </div>

                  <div className="flex gap-2">
                    {SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleSizeChange(opt.weight)}
                        className={`size-btn ${formData.size === opt.weight ? "size-btn--selected" : ""}`}
                        aria-pressed={formData.size === opt.weight}
                      >
                        {opt.label}
                        <span className="block text-xs opacity-70 mt-0.5">{opt.weight}g</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={lavenderSectionRef} className="space-y-3">
                  {(formData.scent === SoapScent.LAVENDER || formData.scent === SoapScent.COCONUT) && (
                    <button
                      onClick={() => setFormData((p) => ({ ...p, hasLavenderPieces: !p.hasLavenderPieces }))}
                      className={`addon-toggle ${formData.hasLavenderPieces ? "addon-toggle--active" : ""}`}
                      aria-pressed={formData.hasLavenderPieces}
                    >
                      <span className="flex items-center gap-3">
                        <BotanicalLeafIcon className="w-6 h-6 flex-shrink-0" />
                        <span>
                          <span className="font-medium text-ink-700 block">Dried Lavender Pieces</span>
                          <span className="text-ink-400 text-sm">+Rs. {LAVENDER_PIECES_PRICE} — calming botanicals</span>
                        </span>
                      </span>
                      {formData.hasLavenderPieces && <Check className="w-5 h-5 text-botanical-500 flex-shrink-0" />}
                    </button>
                  )}

                  {(formData.scent === SoapScent.ROSE || formData.scent === SoapScent.COCONUT) && (
                    <button
                      onClick={() => setFormData((p) => ({ ...p, hasRosePieces: !p.hasRosePieces }))}
                      className={`addon-toggle ${formData.hasRosePieces ? "addon-toggle--active" : ""}`}
                      aria-pressed={formData.hasRosePieces}
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                          <ellipse cx="12" cy="12" rx="4" ry="6" fill="#e8a0a0" opacity="0.7" transform="rotate(-15 12 12)"/>
                          <ellipse cx="7" cy="9" rx="3" ry="4.5" fill="#f8bbd0" opacity="0.6" transform="rotate(-30 7 9)"/>
                          <ellipse cx="17" cy="9" rx="3" ry="4.5" fill="#f8bbd0" opacity="0.6" transform="rotate(30 17 9)"/>
                        </svg>
                        <span>
                          <span className="font-medium text-ink-700 block">Rose Petals</span>
                          <span className="text-ink-400 text-sm">+Rs. {ROSE_PIECES_PRICE} — elegant florals</span>
                        </span>
                      </span>
                      {formData.hasRosePieces && <Check className="w-5 h-5 text-botanical-500 flex-shrink-0" />}
                    </button>
                  )}

                  {/* Price summary */}
                  <div className="flex items-center justify-between p-4 bg-parchment-100 rounded-2xl border border-parchment-300">
                    <span className="text-ink-600 font-medium">
                      {formData.size}g {formData.scent}
                      {formData.hasLavenderPieces && " + Lavender"}
                      {formData.hasRosePieces && " + Rose"}
                    </span>
                    <span className="font-display text-xl font-semibold text-terra-500">Rs. {totalPrice}</span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentStep("color");
                      setTimeout(() => scrollToSection(colorSectionRef), 100);
                    }}
                    disabled={!isScentStepValid}
                    className="btn-apothecary btn-primary btn-full mt-2"
                  >
                    Choose Color
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── COLOR STEP ── */}
            {currentStep === "color" && (
              <div ref={colorSectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 2b of 3</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">Choose a color</h2>
                  <p className="text-ink-400 text-sm">
                    {formData.scent} · {formData.size}g · Rs. {totalPrice}
                  </p>
                </div>

                <div className="flex flex-wrap gap-5 justify-center py-4">
                  {COLOR_CONFIG.map((opt) => {
                    const isSelected = formData.color === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleColorChange(opt.value)}
                        className="flex flex-col items-center gap-2"
                        aria-pressed={isSelected}
                        aria-label={`Select ${opt.label} color`}
                      >
                        <div
                          className={`color-swatch ${isSelected ? "color-swatch--selected" : ""}`}
                          style={{ backgroundColor: opt.hex }}
                        >
                          {isSelected && <Check className="w-5 h-5 text-white" style={{ margin: 'auto' }} />}
                        </div>
                        <span className="text-xs font-medium text-ink-500">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep("scent")}
                    className="btn-apothecary btn-secondary flex-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep("quantity");
                      setTimeout(() => scrollToSection(quantitySectionRef), 100);
                    }}
                    disabled={!formData.color}
                    className="btn-apothecary btn-primary flex-1"
                  >
                    Set Quantity
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── QUANTITY STEP ── */}
            {currentStep === "quantity" && formData.scent && formData.color && (
              <div ref={quantitySectionRef} className="mt-8 space-y-5">
                <div className="border-t border-parchment-300 pt-6">
                  <p className="overline mb-1">Step 3 of 3</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-700 mb-1">How many soaps?</h2>
                  <p className="text-ink-400 text-sm">
                    {formData.scent} · {formData.color} · {formData.size}g · Rs. {totalPrice} each
                  </p>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); if (isFormValid) handleAddToCart(); }}
                  className="flex items-center justify-center gap-5 py-2"
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    placeholder="0"
                    className="input-apothecary w-28 text-center text-3xl font-display font-semibold py-4"
                    autoFocus
                  />
                  <span className="text-2xl text-ink-400 font-display">soaps</span>
                </form>

                <div className="flex flex-wrap gap-2 justify-center">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFormData((p) => ({ ...p, quantity: String(num) }))}
                      className={`qty-quick-btn ${formData.quantity === String(num) ? "qty-quick-btn--selected" : ""}`}
                      aria-pressed={formData.quantity === String(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Order preview */}
                {formData.quantity && parseInt(formData.quantity, 10) > 0 && (() => {
                  const qty = parseInt(formData.quantity, 10);
                  const subtotal = totalPrice * qty;
                  const totalQty = qty + cart.totalQuantity;
                  const { discountPercentage, discountAmount, total } = calculateDiscount(subtotal, totalQty);

                  return (
                    <div className="bg-parchment-100 rounded-2xl p-5 border border-parchment-300 space-y-3">
                      <div className="flex justify-between text-ink-600">
                        <span className="text-sm">Subtotal ({qty} soaps × Rs. {totalPrice})</span>
                        <span className="font-medium">Rs. {subtotal}</span>
                      </div>
                      {discountPercentage > 0 ? (
                        <div className="bg-gradient-to-r from-botanical-100 to-botanical-200 rounded-xl p-4 border border-botanical-300">
                          <div className="flex items-center justify-center gap-2 text-botanical-700 font-semibold mb-1">
                            <Sparkles className="w-4 h-4" />
                            <span className="uppercase text-xs tracking-widest font-accent">Bulk Discount</span>
                            <Sparkles className="w-4 h-4" />
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
                          <span>Add {2 - qty > 0 ? `${2 - qty} more for 10% off` : `2 more for 15% off`}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep("color")}
                    className="btn-apothecary btn-secondary flex-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={!isFormValid}
                    className={`btn-apothecary btn-primary flex-1 ${!isFormValid ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
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
