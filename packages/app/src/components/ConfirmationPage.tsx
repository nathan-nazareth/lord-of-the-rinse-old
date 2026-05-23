import { IconCheck, IconSparkles } from '@tabler/icons-react';
import type React from 'react';

const ConfirmationPage: React.FC<{
  itemCount: number;
  orderReference?: string;
  onContinue: () => void;
}> = ({ itemCount, orderReference, onContinue }) => (
  <div className="min-h-screen bg-parchment-100 flex items-center justify-center px-4">
    <div className="card-apothecary p-10 max-w-sm w-full text-center">
      <div className="w-24 h-24 bg-botanical-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="relative">
          <IconCheck className="w-12 h-12 text-botanical-600" />
          <div className="absolute -top-1 -right-1">
            <IconSparkles className="w-5 h-5 text-terra-400 animate-pulse-soft" />
          </div>
        </div>
      </div>

      <p className="overline mb-3">Order confirmed</p>
      <h1 className="font-display text-3xl font-semibold text-ink-700 mb-3">Thank you!</h1>
      <p className="text-ink-500 text-lg mb-2">Your order has been submitted.</p>
      {orderReference && (
        <p className="text-ink-600 font-display font-semibold text-sm mb-2 bg-parchment-200 rounded-lg px-3 py-2 inline-block">
          Ref: {orderReference}
        </p>
      )}
      <p className="text-ink-400 mb-10">
        {itemCount} soap{itemCount !== 1 ? 's' : ''} — we&apos;ll begin crafting them soon.
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="btn-apothecary btn-primary btn-full text-base py-4"
      >
        Craft More Soaps
      </button>

      <p className="text-ink-300 text-xs mt-6 italic font-display">
        &ldquo;Made with love and nature&rsquo;s botanicals&rdquo;
      </p>
    </div>
  </div>
);

export default ConfirmationPage;
