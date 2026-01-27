import React, { useState } from 'react';
import { ShoppingCart, Trash2, Send, User, Phone, Mail as MailIcon, Loader2, Check, Tag } from 'lucide-react';
import { CartItem as CartItemType } from '../types/cart';
import { Customer } from '../types/webhook';
import { submitCartToWebhook } from '../services/webhook';

interface CartProps {
  cart: {
    items: CartItemType[];
    totalQuantity: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

interface CheckoutFormProps {
  onSubmit: (customer: Customer) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, onCancel, isSubmitting, errorMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newErrors: { name?: string; email?: string; phone?: string } = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your name (at least 2 characters)';
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (like yourname@email.com)';
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const customer: Customer = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };

    onSubmit(customer);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-serif font-bold text-bark-800 mb-4">Your Contact Details</h3>

      {errorMessage && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <User className="w-4 h-4" />
            Your Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            onFocus={() => setErrors(prev => ({ ...prev, name: undefined }))}
            placeholder="Your full name"
            className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:border-bark-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all`}
            disabled={isSubmitting}
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
            autoComplete="name"
            required
          />
          {errors.name && (
            <p id="name-error" className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <MailIcon className="w-4 h-4" />
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            onFocus={() => setErrors(prev => ({ ...prev, email: undefined }))}
            placeholder="you@example.com"
            className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:border-bark-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all`}
            disabled={isSubmitting}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            autoComplete="email"
            required
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Phone className="w-4 h-4" />
            Your Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            onFocus={() => setErrors(prev => ({ ...prev, phone: undefined }))}
            placeholder="(555) 123-4567"
            className={`w-full p-3 rounded-lg border ${errors.phone ? 'border-red-300' : 'border-gray-300'} focus:border-bark-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all`}
            disabled={isSubmitting}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={!!errors.phone}
            autoComplete="tel"
            required
          />
          {errors.phone && (
            <p id="phone-error" className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 mt-4 border-t border-cream-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-full font-bold border-2 border-bark-200 text-bark-700 hover:bg-bark-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-md transition-colors bg-[#5D4E37] hover:bg-[#4A3F2D]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

interface OrderConfirmationProps {
  itemCount: number;
  onContinue: () => void;
  onCheckout: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ itemCount, onContinue, onCheckout }) => (
  <div className="p-6 text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Check className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-xl font-serif font-bold text-bark-800 mb-2">Added to Cart!</h3>
    <p className="text-gray-600 mb-4">
      Your soap has been added to your cart.
    </p>
    <p className="text-sm text-gray-500 mb-6">
      {itemCount} soap{itemCount > 1 ? 's' : ''} in your cart
    </p>
    
    <div className="space-y-3">
      <button
        onClick={onCheckout}
        className="w-full py-4 px-6 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-md transition-colors bg-[#5D4E37] hover:bg-[#4A3F2D]"
      >
        <ShoppingCart className="w-5 h-5" />
        Proceed to Checkout
      </button>
      <button
        onClick={onContinue}
        className="w-full py-3 px-6 rounded-full font-bold border-2 border-bark-200 text-bark-700 hover:bg-bark-50 transition-colors"
      >
        + Order Another Soap
      </button>
    </div>
  </div>
);

export const Cart: React.FC<CartProps> = ({ cart, isOpen, onClose, onRemoveItem, onClearCart }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [orderItemCount, setOrderItemCount] = useState(0);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus management when cart opens
  React.useEffect(() => {
    if (isOpen && !showConfirmation && !showCheckout && !showAddedToCart) {
      // Move focus to close button when cart opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showConfirmation, showCheckout, showAddedToCart]);

  // Trap focus within sidebar when open
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountPercentage = cart.totalQuantity >= 4 ? 15 : cart.totalQuantity >= 2 ? 10 : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const total = subtotal - discountAmount;

  const handleClearCart = () => {
    if (showClearCartConfirm) {
      onClearCart();
      setShowClearCartConfirm(false);
    } else {
      setShowClearCartConfirm(true);
    }
  };

  const handleCheckout = async (customer: Customer) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitCartToWebhook(
        customer,
        cart.items,
        undefined,
        (log) => {
          console.log('[Webhook] Order submitted:', {
            orderId: log.orderId,
            status: log.status,
            timestamp: log.timestamp,
            attempt: log.attempt,
          });

          if (log.status === 429) {
            setErrorMessage('Service busy. Please wait and try again.');
          }
        }
      );

      if (result.success) {
        setOrderItemCount(cart.totalQuantity);
        setShowConfirmation(true);
        onClearCart();
      } else {
        setErrorMessage('Failed to send order. Please try again.');
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    setShowConfirmation(false);
    setShowCheckout(false);
    setShowAddedToCart(false);
    setOrderItemCount(0);
    onClose();
  };

  const handleAddedToCartContinue = () => {
    setShowAddedToCart(false);
    onClose();
  };

  const handleAddedToCartCheckout = () => {
    setShowAddedToCart(false);
    setShowCheckout(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-200 bg-[#5D4E37] text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <h2 className="text-lg font-serif font-bold text-white">
              {showConfirmation ? 'Thank You!' : showAddedToCart ? 'Added to Cart!' : 'Your Cart'}
            </h2>
            {!showConfirmation && !showAddedToCart && cart.totalQuantity > 0 && (
              <span className="bg-white text-[#5D4E37] text-xs px-2 py-0.5 rounded-full font-bold">
                {cart.totalQuantity}
              </span>
            )}
          </div>
          {!showConfirmation && !showAddedToCart && (
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="px-3 py-1.5 hover:bg-white/20 rounded-full transition-colors text-sm text-white font-medium flex items-center gap-1 border border-white/30 hover:border-white"
              aria-label="Close cart"
            >
              Close
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {showConfirmation ? (
            <OrderConfirmation
              itemCount={orderItemCount}
              onContinue={handleContinue}
              onCheckout={handleAddedToCartCheckout}
            />
          ) : showAddedToCart ? (
            <OrderConfirmation
              itemCount={cart.totalQuantity}
              onContinue={handleAddedToCartContinue}
              onCheckout={handleAddedToCartCheckout}
            />
          ) : showCheckout ? (
            <CheckoutForm
              onSubmit={handleCheckout}
              onCancel={() => { setShowCheckout(false); setErrorMessage(null); }}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
            />
          ) : (
            <>
              {/* Cart Items */}
              <div className="p-4 space-y-3">
                {cart.items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-bark-200 mx-auto mb-3" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first soap combination above!</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-bark-50 rounded-lg p-3 border border-bark-200 mb-4">
                      <p className="text-sm text-bark-700">
                        <span className="font-semibold">Multiple items:</span> You can add as many different soap combinations as you like, then submit one order for everything.
                      </p>
                    </div>
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-cream-200 shadow-sm backdrop-blur-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-natural-800">{item.scent}</span>
                            {item.hasLavenderPieces && (
                              <span className="text-[10px] bg-lavender-100 text-lavender-600 px-2 py-0.5 rounded-full border border-lavender-200">
                                + Lavender Pieces
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-natural-500">
                            {item.color} • {item.size}g/{item.size}ml • {item.quantity} soap{item.quantity > 1 ? 's' : ''} • Rs. {item.price} each
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-bark-800">Rs. {item.price * item.quantity}</div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!showConfirmation && !showCheckout && cart.items.length > 0 && (
          <div className="p-4 border-t border-cream-200 bg-cream-50/80 backdrop-blur-sm">
            {discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-sage-50 to-cream-100 border-2 border-sage-200 rounded-xl p-4 mb-4 animate-soft-pulse" role="alert" aria-live="polite">
                <div className="flex items-center gap-2 text-sage-700">
                  <Check className="w-5 h-5" />
                  <span className="font-bold text-lg">Bulk Discount Applied!</span>
                </div>
                <p className="text-sage-600 mt-1 ml-7">
                  <span className="font-bold">{discountPercentage}% OFF</span> on your total order ({cart.totalQuantity} soaps)
                </p>
                <p className="text-sage-500 text-sm mt-1 ml-7">
                  💰 Mix & match — discount applies to all items!
                </p>
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className="text-natural-500">Total unique types:</span>
              <span className="font-bold text-natural-700">{cart.items.length}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-natural-500">Total soaps:</span>
              <span className="font-bold text-natural-700">{cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''}</span>
            </div>
            {discountPercentage > 0 && (
              <div className="flex items-center justify-between mb-2 text-sage-600 bg-sage-50/50 p-2 rounded-lg border border-sage-100">
                <span className="font-semibold">Discount ({discountPercentage}%):</span>
                <span className="font-bold">- Rs. {discountAmount}</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-3 pt-3 border-t border-cream-200">
              <span className="text-xl font-bold text-natural-800">Total:</span>
              <div className="text-right">
                {discountPercentage > 0 && (
                  <span className="text-natural-400 line-through mr-2">Rs. {subtotal}</span>
                )}
                <span className="text-xl font-bold text-sage-700">Rs. {total}</span>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={(e) => { e.preventDefault(); setShowCheckout(true); }}
                className="w-full py-4 px-6 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-md transition-colors bg-[#5D4E37] hover:bg-[#4A3F2D]"
              >
                <ShoppingCart className="w-5 h-5" />
                Proceed to Checkout - Rs. {total}
              </button>
              <button
                onClick={handleClearCart}
                className={`w-full py-3 border-2 rounded-full font-bold transition-all ${showClearCartConfirm
                    ? 'border-red-300 text-red-600 bg-red-50'
                    : 'border-cream-300 text-natural-600 hover:bg-cream-100 hover:border-cream-400'
                  }`}
              >
                {showClearCartConfirm ? 'Clear All?' : 'Clear Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Cart Badge Component (for showing item count)
export const CartBadge: React.FC<{ count: number; onClick: () => void }> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-3 bg-[#5D4E37] hover:bg-[#4A3F2D] rounded-full transition-colors shadow-lg"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-6 h-6 text-white" />
      <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow">
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
};
