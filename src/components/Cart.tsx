import React, { useState } from 'react';
import { ShoppingCart, Trash2, Send, User, Phone, Mail as MailIcon, Loader2, Check } from 'lucide-react';
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
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
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
      <h3 className="text-lg font-serif font-bold text-earth-800 mb-4">Your Contact Details</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <User className="w-4 h-4" />
            Your Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            onFocus={() => setErrors(prev => ({ ...prev, name: undefined }))}
            placeholder="Your full name"
            className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all`}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <MailIcon className="w-4 h-4" />
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            onFocus={() => setErrors(prev => ({ ...prev, email: undefined }))}
            placeholder="you@example.com"
            className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all`}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Phone Field */}
        <div>
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Phone className="w-4 h-4" />
            Your Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            onFocus={() => setErrors(prev => ({ ...prev, phone: undefined }))}
            placeholder="(555) 123-4567"
            className={`w-full p-3 rounded-lg border ${errors.phone ? 'border-red-300' : 'border-gray-300'} focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all`}
            disabled={isSubmitting}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-full font-bold border-2 border-earth-200 text-earth-700 hover:bg-earth-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-full font-bold bg-earth-600 text-white hover:bg-earth-700 transition-colors flex items-center justify-center gap-2"
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
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ itemCount, onContinue }) => (
  <div className="p-8 text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Check className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-xl font-serif font-bold text-earth-800 mb-2">Order Sent Successfully!</h3>
    <p className="text-gray-600 mb-6">
      Thank you for your order! We'll be in touch with you shortly.
    </p>
    <p className="text-sm text-gray-500 mb-6">
      You ordered: {itemCount} soap{itemCount > 1 ? 's' : ''}
    </p>
    <button
      onClick={onContinue}
      className="w-full py-3 rounded-full font-bold bg-earth-600 text-white hover:bg-earth-700 transition-colors"
    >
      Order More Soaps
    </button>
  </div>
);

export const Cart: React.FC<CartProps> = ({ cart, isOpen, onClose, onRemoveItem, onClearCart }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderItemCount, setOrderItemCount] = useState(0);

  const handleCheckout = async (customer: Customer) => {
    setIsSubmitting(true);
    
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
        }
      );

      if (result.success) {
        setOrderItemCount(cart.totalQuantity);
        setShowConfirmation(true);
        onClearCart();
      } else {
        alert('Failed to send order. Please try again.');
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    setShowConfirmation(false);
    setShowCheckout(false);
    setOrderItemCount(0);
    onClose();
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
        <div className="flex items-center justify-between p-4 border-b border-earth-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-earth-600" />
            <h2 className="text-lg font-serif font-bold text-earth-800">
              {showConfirmation ? 'Thank You!' : 'Your Cart'}
            </h2>
            {!showConfirmation && cart.totalQuantity > 0 && (
              <span className="bg-earth-200 text-earth-800 text-xs px-2 py-0.5 rounded-full">
                {cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''}
              </span>
            )}
          </div>
            {!showConfirmation && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-earth-50 rounded-full transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
            />
          ) : showCheckout ? (
            <CheckoutForm
              onSubmit={handleCheckout}
              onCancel={() => setShowCheckout(false)}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              {/* Cart Items */}
              <div className="p-4 space-y-3">
                {cart.items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-earth-200 mx-auto mb-3" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first soap combination above!</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-earth-50 rounded-lg p-3 border border-earth-200 mb-4">
                      <p className="text-sm text-earth-700">
                        <span className="font-semibold">Multiple items:</span> You can add as many different soap combinations as you like, then submit one order for everything.
                      </p>
                    </div>
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-earth-100 shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-earth-800">{item.scent}</span>
                            {item.hasLavenderPieces && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                + Lavender Pieces
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.color} • {item.size}g/{item.size}ml • {item.quantity} soap{item.quantity > 1 ? 's' : ''} • Rs. {item.price} each
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-earth-800">Rs. {item.price * item.quantity}</div>
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
          <div className="p-4 border-t border-earth-100 bg-earth-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Total unique types:</span>
              <span className="font-bold text-earth-800">{cart.items.length}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Total soaps:</span>
              <span className="font-bold text-earth-800">{cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between mb-3 pt-3 border-t border-earth-200">
              <span className="text-lg font-bold text-earth-800">Total:</span>
              <span className="text-lg font-bold text-earth-800">
                Rs. {cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 bg-earth-600 text-white rounded-full font-bold hover:bg-earth-700 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Order ({cart.items.length} item{cart.items.length > 1 ? 's' : ''})
            </button>
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
      className="relative p-2 bg-earth-100 hover:bg-earth-200 rounded-full transition-colors"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-5 h-5 text-earth-700" />
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
};
