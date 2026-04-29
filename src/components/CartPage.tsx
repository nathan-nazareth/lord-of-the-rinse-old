import React from "react";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Check from "lucide-react/dist/esm/icons/check";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import { calculateDiscount } from "../utils/pricing";

const CartPage: React.FC<{
  cart: { items: any[]; totalQuantity: number };
  onBackToForm: () => void;
  onCheckout: () => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  justAdded?: boolean;
}> = ({ cart, onBackToForm, onCheckout, onRemoveItem, onClearCart, justAdded }) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { discountPercentage, discountAmount, total } = calculateDiscount(subtotal, cart.totalQuantity);

  if (justAdded) {
    return (
      <div className="min-h-screen bg-parchment-100">
        <div className="max-w-md mx-auto px-4 pt-6">
          <button
            onClick={onBackToForm}
            className="flex items-center gap-2 text-terra-500 hover:text-terra-600 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to form</span>
          </button>

          <div className="card-apothecary overflow-hidden">
            <div className="text-center py-16 px-6">
              <div className="w-28 h-28 bg-botanical-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
                <Check className="w-16 h-16 text-botanical-500" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-botanical-700 mb-3">Soap added!</h2>
              <p className="text-ink-500 text-lg mb-10">Your soap has been added to your order.</p>
              <div className="space-y-3">
                <button onClick={onCheckout} className="btn-apothecary btn-primary btn-full text-base py-4">
                  Proceed to Checkout
                </button>
                <button onClick={onBackToForm} className="btn-apothecary btn-secondary btn-full text-sm py-3">
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
          onClick={onBackToForm}
          className="flex items-center gap-2 text-terra-500 hover:text-terra-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to form</span>
        </button>

        <div className="card-apothecary overflow-hidden">
          <div className="bg-terra-400 p-6 text-white text-center">
            <h1 className="font-display text-2xl font-semibold">Your Cart</h1>
            <p className="text-white/75 mt-1 text-sm">
              {cart.totalQuantity} soap{cart.totalQuantity !== 1 ? "s" : ""} in your order
            </p>
          </div>

          <div className="p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-14">
                <ShoppingCart className="w-16 h-16 text-parchment-400 mx-auto mb-5" />
                <p className="text-xl text-ink-500 font-display mb-2">Nothing here yet</p>
                <p className="text-ink-300 text-sm mb-8">Start crafting your soaps above</p>
                <button onClick={onBackToForm} className="btn-apothecary btn-primary">
                  Start Ordering
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-lg text-ink-700">{item.shape} · {item.scent}</p>
                        <p className="text-ink-400 text-sm">
                          {item.color} · {item.size}g · Qty {item.quantity}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.hasLavenderPieces && <span className="badge-tag">Lavender</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-display font-semibold text-terra-500">Rs. {item.price * item.quantity}</span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2.5 bg-red-50 text-red-400 rounded-full hover:bg-red-100 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {discountPercentage > 0 && (
                  <div className="bg-botanical-100 rounded-2xl p-4 border border-botanical-300 mb-5">
                    <div className="flex items-center justify-center gap-2 text-botanical-700 font-semibold">
                      <Sparkles className="w-5 h-5" />
                      <span className="uppercase text-xs tracking-widest font-accent">Bulk Discount Applied</span>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-botanical-600 text-sm text-center mt-1">
                      {discountPercentage}% off on {cart.totalQuantity} soaps — you save Rs. {discountAmount}
                    </p>
                  </div>
                )}

                <div className="border-t border-parchment-300 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-ink-500 text-sm">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-botanical-600 font-medium text-sm">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />Discount ({discountPercentage}%)
                      </span>
                      <span>- Rs. {discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-display font-semibold text-ink-700 pt-3 border-t border-parchment-300">
                    <span>Total</span>
                    <span className="text-terra-500">Rs. {total}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button onClick={onCheckout} className="btn-apothecary btn-primary btn-full text-base py-4">
                    Checkout — Rs. {total}
                  </button>
                  <button onClick={onBackToForm} className="btn-apothecary btn-secondary btn-full text-sm py-3">
                    + Add Another Soap
                  </button>
                  <button
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
