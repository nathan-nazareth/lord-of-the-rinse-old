import {
  IconArrowLeft,
  IconCheck,
  IconShoppingCart,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react';
import type React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import type { CartItem } from '../types/cart';
import { calculateDiscount } from '../utils/pricing';

const CartPage: React.FC<{
  cart: { items: CartItem[]; totalQuantity: number };
  onBackToForm: () => void;
  onCheckout: () => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  justAdded?: boolean;
  justOrdered?: boolean;
  orderedItemCount?: number;
  onDismissOrdered?: () => void;
}> = ({
  cart,
  onBackToForm,
  onCheckout,
  onRemoveItem,
  onClearCart,
  onUpdateQuantity,
  justAdded,
  justOrdered,
  orderedItemCount,
  onDismissOrdered,
}) => {
  const { data: catalog } = useCatalog();
  const currency = catalog?.settings?.currency ?? 'Rs. ';
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const safesubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const { discountPercentage, discountAmount, total } = calculateDiscount(
    safesubtotal,
    cart.totalQuantity,
  );

  if (justOrdered && cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-parchment-100">
        <div className="max-w-md mx-auto px-4 pt-6">
          <button
            type="button"
            onClick={() => {
              onDismissOrdered?.();
              onBackToForm();
            }}
            className="flex items-center gap-2 text-terra-500 hover:text-terra-600 font-medium mb-6 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to form</span>
          </button>

          <div className="card-apothecary overflow-hidden">
            <div className="text-center py-16 px-6">
              <div className="w-28 h-28 bg-botanical-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
                <div className="relative">
                  <IconCheck className="w-16 h-16 text-botanical-500" />
                  <div className="absolute -top-1 -right-1">
                    <IconSparkles className="w-5 h-5 text-terra-400 animate-pulse-soft" />
                  </div>
                </div>
              </div>
              <h2 className="font-display text-3xl font-semibold text-botanical-700 mb-3">
                Order placed!
              </h2>
              <p className="text-ink-500 text-lg mb-2">Thank you for your order.</p>
              <p className="text-ink-400 mb-10">
                {orderedItemCount} soap{orderedItemCount !== 1 ? 's' : ''} confirmed — we&apos;ll
                begin crafting them soon.
              </p>
              <button
                type="button"
                onClick={() => {
                  onDismissOrdered?.();
                  onBackToForm();
                }}
                className="btn-apothecary btn-primary btn-full text-base py-4"
              >
                Craft More Soaps
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (justAdded) {
    return (
      <div className="min-h-screen bg-parchment-100">
        <div className="max-w-md mx-auto px-4 pt-6">
          <button
            type="button"
            onClick={onBackToForm}
            className="flex items-center gap-2 text-terra-500 hover:text-terra-600 font-medium mb-6 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to form</span>
          </button>

          <div className="card-apothecary overflow-hidden">
            <div className="text-center py-16 px-6">
              <div className="w-28 h-28 bg-botanical-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
                <IconCheck className="w-16 h-16 text-botanical-500" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-botanical-700 mb-3">
                Soap added!
              </h2>
              <p className="text-ink-500 text-lg mb-10">Your soap has been added to your order.</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onCheckout}
                  className="btn-apothecary btn-primary btn-full text-base py-4"
                >
                  Proceed to Checkout
                </button>
                <button
                  type="button"
                  onClick={onBackToForm}
                  className="btn-apothecary btn-secondary btn-full text-sm py-3"
                >
                  + Add Another Soap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100">
      <div className="max-w-md mx-auto px-4 pt-6">
        <button
          type="button"
          onClick={onBackToForm}
          className="flex items-center gap-2 text-terra-500 hover:text-terra-600 font-medium mb-6 transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to form</span>
        </button>

        <div className="card-apothecary overflow-hidden">
          <div className="bg-terra-400 p-6 text-white text-center">
            <h1 className="font-display text-2xl font-semibold">Your Cart</h1>
            <p className="text-white/75 mt-1 text-sm">
              {cart.totalQuantity} soap{cart.totalQuantity !== 1 ? 's' : ''} in your order
            </p>
          </div>

          <div className="p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-14">
                <IconShoppingCart className="w-16 h-16 text-parchment-400 mx-auto mb-5" />
                <p className="text-xl text-ink-500 font-display mb-2">Nothing here yet</p>
                <p className="text-ink-300 text-sm mb-8">Start crafting your soaps above</p>
                <button type="button" onClick={onBackToForm} className="btn-apothecary btn-primary">
                  Start Ordering
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-lg text-ink-700">
                          {item.shape} · {item.scent}
                        </p>
                        <p className="text-ink-400 text-sm">
                          {item.color} · {item.size}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-display font-semibold text-terra-500">
                          {currency} {(item.price * item.quantity).toFixed(2)}
                        </span>
                        {onUpdateQuantity ? (
                          <div className="flex items-center gap-1 bg-parchment-100 rounded-full px-1 py-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                item.quantity > 1
                                  ? onUpdateQuantity(item.id, item.quantity - 1)
                                  : onRemoveItem(item.id)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-parchment-50 text-ink-600 font-semibold text-lg"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold text-ink-700">
                              {Number.isFinite(item.quantity) ? item.quantity : 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-parchment-50 text-ink-600 font-semibold text-lg"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2.5 bg-red-50 text-red-400 rounded-full hover:bg-red-100 transition-colors"
                            aria-label="Remove item"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {discountPercentage > 0 && (
                  <div className="bg-botanical-100 rounded-2xl p-4 border border-botanical-300 mb-5">
                    <div className="flex items-center justify-center gap-2 text-botanical-700 font-semibold">
                      <IconSparkles className="w-5 h-5" />
                      <span className="uppercase text-xs tracking-widest font-accent">
                        Bulk Discount Applied
                      </span>
                      <IconSparkles className="w-5 h-5" />
                    </div>
                    <p className="text-botanical-600 text-sm text-center mt-1">
                      {discountPercentage}% off on {cart.totalQuantity} soaps — you save {currency}{' '}
                      {(discountAmount || 0).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="border-t border-parchment-300 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-ink-500 text-sm">
                    <span>Subtotal</span>
                    <span>
                      {currency} {safesubtotal.toFixed(2)}
                    </span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-botanical-600 font-medium text-sm">
                      <span className="flex items-center gap-1">
                        <IconSparkles className="w-3.5 h-3.5" />
                        Discount ({discountPercentage}%)
                      </span>
                        <span>
                          - {currency} {(discountAmount || 0).toFixed(2)}
                        </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-display font-semibold text-ink-700 pt-3 border-t border-parchment-300">
                    <span>Total</span>
                    <span className="text-terra-500">
                      {currency} {(total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={onCheckout}
                    className="btn-apothecary btn-primary btn-full text-base py-4"
                  >
                    Checkout — {currency} {(total || 0).toFixed(2)}
                  </button>
                  <button
                    type="button"
                    onClick={onBackToForm}
                    className="btn-apothecary btn-secondary btn-full text-sm py-3"
                  >
                    + Add Another Soap
                  </button>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="btn-apothecary btn-ghost btn-full text-sm py-3 text-red-400 hover:text-red-500 hover:bg-red-50"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
