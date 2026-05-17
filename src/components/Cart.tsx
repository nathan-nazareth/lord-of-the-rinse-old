import React, { useState } from "react";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Send from "lucide-react/dist/esm/icons/send";
import User from "lucide-react/dist/esm/icons/user";
import Phone from "lucide-react/dist/esm/icons/phone";
import MailIcon from "lucide-react/dist/esm/icons/mail";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Check from "lucide-react/dist/esm/icons/check";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import { useCartStore } from "../stores/cartStore";
import { useRateLimitStore } from "../stores/rateLimitStore";
import type { Customer } from "../types/webhook";
import { submitCartToWebhook } from "../services/webhook";
import { calculateDiscount } from "../utils/pricing";
import { validateEmail, validatePhone, validateName } from "../utils/validators";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutForm: React.FC<{
  onSubmit: (customer: Customer) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}> = ({ onSubmit, onCancel, isSubmitting, errorMessage }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!validateName(formData.name))
      newErrors.name = "Please enter your name (at least 2 characters)";
    if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!validatePhone(formData.phone)) newErrors.phone = "Please enter a valid phone number";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ name: formData.name, email: formData.email, phone: formData.phone });
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <p className="overline mb-1">Checkout</p>
        <h3 className="font-display text-xl font-semibold text-ink-700">Your details</h3>
      </div>
      {errorMessage && (
        <div
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2"
          role="alert"
        >
          <span className="text-red-500 mt-0.5">!</span>
          <span>{errorMessage}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="sidebar-name"
            className="flex items-center gap-2 text-sm text-ink-500 mb-1.5 font-medium"
          >
            <User className="w-4 h-4" />
            Full Name
          </label>
          <input
            id="sidebar-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            onFocus={() => setErrors((p) => ({ ...p, name: undefined }))}
            placeholder="Your full name"
            className={`input-apothecary ${errors.name ? "border-red-400" : ""}`}
            disabled={isSubmitting}
            autoComplete="name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label
            htmlFor="sidebar-email"
            className="flex items-center gap-2 text-sm text-ink-500 mb-1.5 font-medium"
          >
            <MailIcon className="w-4 h-4" />
            Email Address
          </label>
          <input
            id="sidebar-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            onFocus={() => setErrors((p) => ({ ...p, email: undefined }))}
            placeholder="you@example.com"
            className={`input-apothecary ${errors.email ? "border-red-400" : ""}`}
            disabled={isSubmitting}
            autoComplete="email"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label
            htmlFor="sidebar-phone"
            className="flex items-center gap-2 text-sm text-ink-500 mb-1.5 font-medium"
          >
            <Phone className="w-4 h-4" />
            Phone Number
          </label>
          <input
            id="sidebar-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            onFocus={() => setErrors((p) => ({ ...p, phone: undefined }))}
            placeholder="(555) 123-4567"
            className={`input-apothecary ${errors.phone ? "border-red-400" : ""}`}
            disabled={isSubmitting}
            autoComplete="tel"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn-apothecary btn-secondary flex-1 text-sm py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-apothecary btn-primary flex-1 text-sm py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const OrderConfirmation: React.FC<{ itemCount: number; onContinue: () => void }> = ({
  itemCount,
  onContinue,
}) => (
  <div className="p-8 text-center space-y-5">
    <div className="w-16 h-16 bg-botanical-100 rounded-full flex items-center justify-center mx-auto">
      <Check className="w-8 h-8 text-botanical-600" />
    </div>
    <div>
      <h3 className="font-display text-2xl font-semibold text-ink-700 mb-2">Order placed!</h3>
      <p className="text-ink-400 text-sm mb-1">Thank you for your order</p>
      <p className="text-ink-600 font-medium">
        {itemCount} soap{itemCount > 1 ? "s" : ""} confirmed
      </p>
    </div>
    <button type="button" onClick={onContinue} className="btn-apothecary btn-primary btn-full">
      Continue Shopping
    </button>
  </div>
);

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const items = useCartStore((s) => s.items);
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const rateLimit = useRateLimitStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [orderItemCount, setOrderItemCount] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (rateLimit.cooldownRemaining !== null && !showRateLimitModal) setShowRateLimitModal(true);
  }, [rateLimit.cooldownRemaining, showRateLimitModal]);

  React.useEffect(() => {
    if (isOpen && !showConfirmation && !showCheckout && !showAddedToCart) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isOpen, showConfirmation, showCheckout, showAddedToCart]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { discountPercentage, discountAmount, total } = calculateDiscount(subtotal, totalQuantity);

  const handleClearCart = () => {
    if (showClearConfirm) {
      clearCart();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  const handleCheckout = async (customer: Customer) => {
    if (!rateLimit.isAllowed) {
      setShowRateLimitModal(true);
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await submitCartToWebhook(customer, items);
      if (result.success) {
        rateLimit.recordSubmission();
        const itemsOrdered = totalQuantity;
        setOrderItemCount(itemsOrdered);
        setShowConfirmation(true);
        clearCart();
      } else {
        setErrorMessage("Failed to send order. Please try again.");
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-ink-800/20 z-40"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close cart"
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-parchment-50 shadow-lift z-50 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-parchment-300 bg-terra-400">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <h2 className="text-lg font-display font-semibold text-white">
              {showConfirmation
                ? "Thank you!"
                : showAddedToCart
                  ? "Added to cart"
                  : showCheckout
                    ? "Checkout"
                    : "Your Cart"}
            </h2>
            {!showConfirmation && !showAddedToCart && !showCheckout && totalQuantity > 0 && (
              <span className="bg-white text-terra-500 text-xs px-2 py-0.5 rounded-full font-semibold">
                {totalQuantity}
              </span>
            )}
          </div>
          {!showConfirmation && !showAddedToCart && !showCheckout && (
            <button
              type="button"
              ref={closeButtonRef}
              onClick={onClose}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-sm text-white font-medium transition-colors"
              aria-label="Close cart"
            >
              Close
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {showConfirmation ? (
            <OrderConfirmation itemCount={orderItemCount} onContinue={onClose} />
          ) : showAddedToCart ? (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-botanical-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-botanical-600" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink-700 mb-2">
                  Added to cart!
                </h3>
                <p className="text-ink-400 text-sm">Your soap has been added.</p>
                <p className="text-ink-600 font-medium mt-1">
                  {totalQuantity} soap{totalQuantity > 1 ? "s" : ""} in cart
                </p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddedToCart(false);
                    setShowCheckout(true);
                  }}
                  className="btn-apothecary btn-primary btn-full"
                >
                  Proceed to Checkout
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-apothecary btn-secondary btn-full"
                >
                  + Order Another
                </button>
              </div>
            </div>
          ) : showCheckout ? (
            <CheckoutForm
              onSubmit={handleCheckout}
              onCancel={() => {
                setShowCheckout(false);
                setErrorMessage(null);
              }}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
            />
          ) : (
            <div className="p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-12 h-12 text-parchment-400 mx-auto mb-4" />
                  <p className="text-ink-400 font-medium mb-1">Your cart is empty</p>
                  <p className="text-ink-300 text-sm">Start creating your soaps above</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-700 truncate">{item.scent}</p>
                      <p className="text-ink-400 text-sm truncate">
                        {item.color} · {item.size}g
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.hasLavenderPieces && <span className="badge-tag">Lavender</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-display font-semibold text-ink-700">
                        Rs. {item.price * item.quantity}
                      </span>
                      {updateQuantity ? (
                        <div className="flex items-center gap-1 bg-parchment-100 rounded-full px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(item.id, item.quantity - 1)
                                : removeItem(item.id)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-parchment-50 text-ink-600 font-semibold text-lg"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-semibold text-ink-700">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(item.id, item.quantity - 1)
                                : removeItem(item.id)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-parchment-50 text-ink-600 font-semibold text-lg"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-semibold text-ink-700">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-parchment-50 text-ink-600 font-semibold text-lg"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {!showConfirmation && !showCheckout && items.length > 0 && (
          <div className="p-4 border-t border-parchment-300 bg-parchment-50 space-y-4">
            {discountPercentage > 0 && (
              <div className="bg-botanical-100 rounded-xl p-3 border border-botanical-300">
                <div className="flex items-center gap-2 text-botanical-700 font-semibold text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="uppercase text-xs tracking-widest font-accent">
                    Bulk Discount
                  </span>
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-botanical-600 text-sm">
                  <span className="font-semibold">{discountPercentage}% off</span> on{" "}
                  {totalQuantity} soaps
                </p>
                <p className="text-botanical-500 text-xs">Mix & match any combination</p>
              </div>
            )}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>
                  {items.length} unique type{items.length > 1 ? "s" : ""}
                </span>
                <span className="font-medium">
                  {totalQuantity} soap{totalQuantity > 1 ? "s" : ""}
                </span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-botanical-600 font-medium">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-display font-semibold text-ink-700 pt-2 border-t border-parchment-300">
                <span>Total</span>
                <span className="text-terra-500">Rs. {total}</span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowCheckout(true)}
                className="btn-apothecary btn-primary btn-full"
              >
                <ShoppingCart className="w-4 h-4" />
                Checkout — Rs. {total}
              </button>
              <button
                type="button"
                onClick={handleClearCart}
                className={`btn-apothecary btn-full text-sm py-3 ${showClearConfirm ? "border-red-400 text-red-500 bg-red-50 hover:bg-red-100" : "btn-secondary"}`}
              >
                {showClearConfirm ? "Confirm clear all?" : "Clear Cart"}
              </button>
            </div>
          </div>
        )}

        {showRateLimitModal && (
          <div className="fixed inset-0 bg-ink-800/40 z-50 flex items-center justify-center p-4">
            <div className="bg-parchment-50 rounded-2xl p-8 max-w-xs w-full text-center shadow-lift">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl font-bold">!</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-700 mb-2">
                Rate limit reached
              </h3>
              <p className="text-ink-400 text-sm mb-6">
                Maximum 10 orders per 5 minutes. Please wait before placing another order.
              </p>
              <button
                type="button"
                onClick={() => setShowRateLimitModal(false)}
                className="btn-apothecary btn-primary btn-full"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
