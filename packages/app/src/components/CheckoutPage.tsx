import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import type React from 'react';
import { useState } from 'react';
import type { CartItem } from '../types/cart';
import type { Customer } from '../types/webhook';
import { calculateDiscount } from '../utils/pricing';
import { validateEmail, validateName, validatePhone } from '../utils/validators';

const CheckoutPage: React.FC<{
  cart: { items: CartItem[]; totalQuantity: number };
  onBack: () => void;
  onSubmit: (customer: Customer) => Promise<void>;
  isSubmitting: boolean;
}> = ({ cart, onBack, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { discountPercentage, discountAmount, total } = calculateDiscount(
    subtotal,
    cart.totalQuantity,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!validateName(formData.name)) newErrors.name = 'Please enter your name';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    await onSubmit({ name: formData.name, email: formData.email, phone: formData.phone });
  };

  return (
    <div className="min-h-screen bg-parchment-100">
      <div className="max-w-md mx-auto px-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-terra-500 hover:text-terra-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to cart</span>
        </button>

        <div className="card-apothecary overflow-hidden">
          <div className="bg-terra-400 p-6 text-white text-center">
            <h1 className="font-display text-2xl font-semibold">Checkout</h1>
            <p className="text-white/75 mt-1 text-sm">
              {cart.totalQuantity} soap{cart.totalQuantity > 1 ? 's' : ''} in your order
            </p>
          </div>

          <div className="p-6">
            <div className="bg-parchment-100 rounded-2xl p-4 mb-6 space-y-2">
              {cart.items.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-ink-700">{item.scent}</p>
                    <p className="text-ink-400 text-xs">
                      {item.color} · {item.size}g × {item.quantity}
                    </p>
                  </div>
                  <span className="font-display font-semibold text-ink-700">
                    Rs. {item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t border-parchment-300 pt-2 flex justify-between text-sm text-ink-500">
                <span>Subtotal</span>
                <span className="font-medium">Rs. {subtotal}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-botanical-600 font-medium text-sm">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Discount ({discountPercentage}%)
                  </span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-display font-semibold text-ink-700 border-t border-parchment-300 pt-2">
                <span>Total</span>
                <span className="text-terra-500">Rs. {total}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="checkout-name" className="block text-ink-700 font-medium mb-1.5">
                  Your Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  onFocus={() => setErrors((p) => ({ ...p, name: undefined }))}
                  placeholder="Enter your full name"
                  className={`input-apothecary ${errors.name ? 'border-red-400' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="checkout-email" className="block text-ink-700 font-medium mb-1.5">
                  Email Address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  onFocus={() => setErrors((p) => ({ ...p, email: undefined }))}
                  placeholder="Enter your email"
                  className={`input-apothecary ${errors.email ? 'border-red-400' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="checkout-phone" className="block text-ink-700 font-medium mb-1.5">
                  Phone Number
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  onFocus={() => setErrors((p) => ({ ...p, phone: undefined }))}
                  placeholder="Enter your phone number"
                  className={`input-apothecary ${errors.phone ? 'border-red-400' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-apothecary btn-primary btn-full text-base py-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Submit Order — Rs. {total}</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
