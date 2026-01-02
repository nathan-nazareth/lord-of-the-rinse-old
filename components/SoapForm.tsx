import React, { useState } from 'react';
import { SoapScent, SoapColor, OrderFormState } from '../types';
import { Check, Mail, AlertCircle, Copy } from 'lucide-react';

const INITIAL_STATE: OrderFormState = {
  scent: null,
  customScent: '',
  color: null,
  quantity: '',
  contactInfo: ''
};

const SCENT_OPTIONS = [
  SoapScent.LAVENDER,
  SoapScent.COFFEE,
  SoapScent.CLOVE,
  SoapScent.CINNAMON,
  SoapScent.LEMONGRASS,
  SoapScent.CUSTOM
];

const COLOR_OPTIONS = [
  { label: SoapColor.WHITE, class: 'bg-slate-50 border-slate-200' },
  { label: SoapColor.RED, class: 'bg-red-100 border-red-200' },
  { label: SoapColor.ORANGE, class: 'bg-orange-100 border-orange-200' },
  { label: SoapColor.YELLOW, class: 'bg-yellow-100 border-yellow-200' },
  { label: SoapColor.GREEN, class: 'bg-green-100 border-green-200' },
  { label: SoapColor.BLUE, class: 'bg-blue-100 border-blue-200' },
  { label: SoapColor.PURPLE, class: 'bg-purple-100 border-purple-200' },
];

export const SoapForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormState>(INITIAL_STATE);
  const [showFallback, setShowFallback] = useState(false);

  const handleScentChange = (scent: SoapScent) => {
    setFormData(prev => ({ ...prev, scent }));
  };

  const handleColorChange = (color: SoapColor) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, quantity: value }));
  };

  const isFormValid = 
    formData.scent && 
    (formData.scent !== SoapScent.CUSTOM || formData.customScent.trim().length > 0) &&
    formData.color &&
    formData.quantity.length > 0 &&
    formData.contactInfo.trim().length > 0;

  // Generate Email Data
  const { scent, customScent, color, quantity, contactInfo } = formData;
  const finalScent = scent === SoapScent.CUSTOM ? `Custom (${customScent})` : scent;
  
  const emailTo = 'n8.nazareth+soapselling@gmail.com';
  const emailSubject = 'New Organic Soap Order';
  const emailBody = `Hello N8 Nazareth,\n\nI would like to place an order for your organic soaps.\n\n` +
    `ORDER DETAILS:\n` +
    `----------------\n` +
    `Scent: ${finalScent}\n` +
    `Color: ${color}\n` +
    `Quantity: ${quantity}\n` +
    `Contact Info: ${contactInfo}\n\n` +
    `Thank you!`;

  const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const handleDraftClick = () => {
    // Show fallback instructions immediately when they click, 
    // just in case the mailto link doesn't work for them.
    setShowFallback(true);
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailBody)
            .then(() => alert('Order details copied to clipboard!'))
            .catch(() => alert('Please select the text below and copy it manually.'));
    } else {
        alert('Please select the text below and copy it manually.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-72">
      
      {/* Question 1: Scent */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-earth-100 transition-all hover:shadow-md">
        <h2 className="text-2xl font-serif font-bold mb-6 text-earth-800 flex items-center gap-3">
          <span className="bg-earth-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">1</span>
          Choose your scent
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SCENT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleScentChange(option)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center
                ${formData.scent === option 
                  ? 'border-earth-500 bg-earth-50 text-earth-800 font-semibold shadow-inner' 
                  : 'border-gray-100 hover:border-earth-300 text-gray-600 hover:bg-gray-50'}
              `}
            >
              {option}
              {formData.scent === option && <Check className="w-5 h-5 text-earth-600" />}
            </button>
          ))}
        </div>

        {formData.scent === SoapScent.CUSTOM && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <label htmlFor="custom-scent" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your custom scent ingredients:
            </label>
            <input
              type="text"
              id="custom-scent"
              value={formData.customScent}
              onChange={(e) => setFormData(prev => ({ ...prev, customScent: e.target.value }))}
              placeholder="e.g., Turmeric & Honey"
              className="w-full p-4 rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all"
              autoFocus
            />
          </div>
        )}
      </section>

      {/* Question 2: Color */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-earth-100 transition-all hover:shadow-md">
        <h2 className="text-2xl font-serif font-bold mb-2 text-earth-800 flex items-center gap-3">
          <span className="bg-earth-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">2</span>
          Pick a subtle hue
        </h2>
        <p className="text-gray-500 mb-6 ml-11 text-sm italic">All colors are natural and subtle.</p>

        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleColorChange(option.label)}
              className={`
                group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                ${formData.color === option.label ? 'ring-2 ring-earth-400 bg-gray-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className={`
                w-16 h-16 rounded-full shadow-sm border-2 transition-transform duration-300 group-hover:scale-105
                ${option.class}
                ${formData.color === option.label ? 'border-earth-400 scale-105' : 'border-transparent'}
              `}>
                {formData.color === option.label && (
                   <span className="absolute inset-0 flex items-center justify-center">
                     <Check className="w-8 h-8 text-black/20" />
                   </span>
                )}
              </div>
              <span className={`text-sm font-medium ${formData.color === option.label ? 'text-earth-800' : 'text-gray-500'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Question 3: Quantity */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-earth-100 transition-all hover:shadow-md">
        <h2 className="text-2xl font-serif font-bold mb-6 text-earth-800 flex items-center gap-3">
          <span className="bg-earth-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">3</span>
          Quantity
        </h2>
        
        <div className="flex items-center gap-4 max-w-xs ml-11">
          <div className="relative w-full">
            <input
              type="text"
              inputMode="numeric"
              value={formData.quantity}
              onChange={handleQuantityChange}
              placeholder="0"
              className="w-full p-4 pr-20 text-2xl font-bold text-center rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
              soaps
            </span>
          </div>
        </div>
      </section>

      {/* Question 4: Contact */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-earth-100 transition-all hover:shadow-md">
        <h2 className="text-2xl font-serif font-bold mb-6 text-earth-800 flex items-center gap-3">
          <span className="bg-earth-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">4</span>
          Contact Details
        </h2>
        
        <div className="ml-11">
          <label htmlFor="contact" className="block text-gray-600 mb-2">
            Please enter your phone number or email address so we can contact you about the date.
          </label>
          <input
            type="text"
            id="contact"
            value={formData.contactInfo}
            onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
            placeholder="+1 (555) 000-0000 or email@example.com"
            className="w-full p-4 rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all"
          />
        </div>
      </section>

      {/* Submit Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-earth-200 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 hidden md:block">
              Clicking below will open your email app with the order ready to send.
            </div>
            {/* 
                USING A NATIVE ANCHOR TAG FOR MAXIMUM RELIABILITY 
                This avoids popup blockers that often catch window.open() or programmatic clicks.
            */}
            <a
              href={isFormValid ? mailtoLink : undefined}
              onClick={(e) => {
                  if (!isFormValid) {
                      e.preventDefault();
                  } else {
                      handleDraftClick();
                  }
              }}
              aria-disabled={!isFormValid}
              className={`
                w-full md:w-auto px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all transform no-underline
                ${isFormValid 
                  ? 'bg-earth-600 text-white hover:bg-earth-700 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'}
              `}
            >
              Draft Order in Email
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {showFallback && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4">
               <div className="flex gap-3">
                 <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                 <div className="flex-1">
                   <h4 className="font-bold text-orange-900 text-sm mb-1">Email app didn't open?</h4>
                   <p className="text-sm text-orange-800 mb-2">
                     Sometimes browsers block email links. You can send it manually:
                   </p>
                   <ol className="list-decimal list-inside text-sm text-orange-800 space-y-1 mb-3">
                     <li>Send email to: <strong className="select-all">{emailTo}</strong></li>
                     <li>Copy the order details below and paste into the message body.</li>
                   </ol>
                   <div className="relative">
                     <textarea 
                        readOnly 
                        value={emailBody} 
                        className="w-full h-24 text-xs font-mono bg-white border border-orange-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                        onClick={(e) => e.currentTarget.select()}
                     />
                     <button
                        type="button"
                        onClick={copyToClipboard}
                        className="absolute right-2 top-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                     >
                       <Copy className="w-3 h-3" /> Copy
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};