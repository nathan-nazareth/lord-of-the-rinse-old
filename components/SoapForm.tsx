import React, { useState, FormEvent } from 'react';
import { SoapScent, SoapColor, OrderFormState, OrderItem, ContactInfo } from '../types';
import { Check, Mail, Loader, CheckCircle, XCircle, Plus, Trash2, Code, User, Phone, AtSign } from 'lucide-react';

const INITIAL_FORM_STATE: OrderFormState = {
  scent: null,
  customScent: '',
  color: null,
  quantity: ''
};

const INITIAL_CONTACT_STATE: ContactInfo = {
  name: '',
  email: '',
  phone: ''
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
  // Current item being built
  const [currentForm, setCurrentForm] = useState<OrderFormState>(INITIAL_FORM_STATE);
  
  // List of added orders
  const [orders, setOrders] = useState<OrderItem[]>([]);
  
  // Contact info (structured)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(INITIAL_CONTACT_STATE);
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showJson, setShowJson] = useState(false);

  const handleScentChange = (scent: SoapScent) => {
    setCurrentForm(prev => ({ ...prev, scent }));
  };

  const handleColorChange = (color: SoapColor) => {
    setCurrentForm(prev => ({ ...prev, color }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCurrentForm(prev => ({ ...prev, quantity: value }));
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const isCurrentFormValid = 
    currentForm.scent && 
    (currentForm.scent !== SoapScent.CUSTOM || currentForm.customScent.trim().length > 0) &&
    currentForm.color &&
    currentForm.quantity.length > 0;

  const isContactValid = 
    contactInfo.name.trim().length > 0 &&
    contactInfo.email.trim().length > 0 &&
    contactInfo.phone.trim().length > 0;

  const handleAddToOrder = () => {
    if (!isCurrentFormValid || !currentForm.scent || !currentForm.color) return;

    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      scent: currentForm.scent,
      customScent: currentForm.customScent,
      color: currentForm.color,
      quantity: currentForm.quantity
    };

    setOrders(prev => [...prev, newItem]);
    setCurrentForm(INITIAL_FORM_STATE); // Reset builder
    window.scrollTo({ top: document.getElementById('cart-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const removeOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Construct the full data object for view and submission
  const getFullData = () => ({
    customer: contactInfo,
    items: orders
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (orders.length === 0 || !isContactValid) return;

    setStatus('submitting');

    // Prepare message for email body
    const orderSummary = orders.map((o, i) => {
      const scentDesc = o.scent === SoapScent.CUSTOM ? `Custom: ${o.customScent}` : o.scent;
      return `Item #${i + 1}: ${o.quantity}x ${scentDesc} (${o.color})`;
    }).join('\n');

    const fullPayload = getFullData();
    const fullJson = JSON.stringify(fullPayload, null, 2);

    // Use FormData
    const data = new FormData();
    data.append('_subject', `New Soap Order from ${contactInfo.name}`);
    data.append('_template', 'table');
    data.append('_captcha', 'false');
    
    // Explicit contact fields for FormSubmit auto-responses
    data.append('name', contactInfo.name);
    data.append('email', contactInfo.email);
    data.append('phone', contactInfo.phone);
    
    data.append('order_summary', orderSummary);
    data.append('raw_json_data', fullJson);

    const targetEmail = "n8.nazareth@gmail.com";
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { 
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        setOrders([]);
        setContactInfo(INITIAL_CONTACT_STATE);
      } else {
        console.error("Server error:", await response.text());
        setStatus('error');
      }
    } catch (error) {
      console.error("Submission failed", error);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-72">
      
      {/* BUILDER SECTION */}
      <div className="space-y-12">
        <h2 className="text-3xl font-serif font-bold text-center text-earth-800">Build Your Soap</h2>

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
                  ${currentForm.scent === option 
                    ? 'border-earth-500 bg-earth-50 text-earth-800 font-semibold shadow-inner' 
                    : 'border-gray-100 hover:border-earth-300 text-gray-600 hover:bg-gray-50'}
                `}
              >
                {option}
                {currentForm.scent === option && <Check className="w-5 h-5 text-earth-600" />}
              </button>
            ))}
          </div>

          {currentForm.scent === SoapScent.CUSTOM && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <label htmlFor="custom-scent" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your custom scent ingredients:
              </label>
              <input
                type="text"
                id="custom-scent"
                value={currentForm.customScent}
                onChange={(e) => setCurrentForm(prev => ({ ...prev, customScent: e.target.value }))}
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
                  ${currentForm.color === option.label ? 'ring-2 ring-earth-400 bg-gray-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className={`
                  w-16 h-16 rounded-full shadow-sm border-2 transition-transform duration-300 group-hover:scale-105
                  ${option.class}
                  ${currentForm.color === option.label ? 'border-earth-400 scale-105' : 'border-transparent'}
                `}>
                  {currentForm.color === option.label && (
                     <span className="absolute inset-0 flex items-center justify-center">
                       <Check className="w-8 h-8 text-black/20" />
                     </span>
                  )}
                </div>
                <span className={`text-sm font-medium ${currentForm.color === option.label ? 'text-earth-800' : 'text-gray-500'}`}>
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
                value={currentForm.quantity}
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

        {/* Add Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAddToOrder}
            disabled={!isCurrentFormValid}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all transform shadow-md
              ${isCurrentFormValid 
                ? 'bg-earth-800 text-white hover:bg-earth-700 hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            <Plus className="w-5 h-5" />
            Add to Order List
          </button>
        </div>
      </div>

      <div className="border-t border-earth-200 my-12"></div>

      {/* CART & REVIEW SECTION */}
      <div id="cart-section" className="space-y-8">

        {/* Contact Info (Only valid if orders exist) */}
        {orders.length > 0 && (
          <section className="bg-earth-50 rounded-2xl p-8 border border-earth-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-serif font-bold mb-6 text-earth-800">
              Contact Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-earth-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => handleContactChange('name', e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 p-4 rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-earth-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={contactInfo.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 p-4 rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-earth-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 p-4 rounded-xl border border-gray-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200 outline-none transition-all bg-white"
                  />
                </div>
              </div>

            </div>
          </section>
        )}

        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-earth-800">Your Order List</h2>
            <button 
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-2 text-sm text-earth-600 hover:text-earth-800 underline decoration-dotted"
            >
                <Code className="w-4 h-4" />
                {showJson ? 'Hide JSON' : 'Show JSON'}
            </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-earth-200 rounded-xl text-earth-500">
            No soaps added yet. Build your first soap above!
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((item, index) => (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-earth-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <span className="bg-earth-100 text-earth-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-earth-800">
                      {item.scent === SoapScent.CUSTOM ? `Custom: ${item.customScent}` : item.scent}
                    </h3>
                    <div className="flex gap-3 text-sm text-gray-600 mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md">Color: {item.color}</span>
                      <span className="bg-earth-50 px-2 py-0.5 rounded-md text-earth-700 font-semibold">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeOrder(item.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors self-end md:self-auto"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* JSON Viewer */}
        {showJson && (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-xs font-mono shadow-inner border border-gray-700">
                <div className="mb-2 text-gray-400 uppercase tracking-wider text-[10px]">Full Order Payload</div>
                <pre>{JSON.stringify(getFullData(), null, 2)}</pre>
            </div>
        )}
      </div>

      {/* Submit Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-earth-200 p-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-2">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 hidden md:block">
              {status === 'success' 
                ? "Your order has been sent successfully!" 
                : `You have ${orders.length} item${orders.length !== 1 ? 's' : ''} in your cart.`}
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={orders.length === 0 || !isContactValid || status === 'submitting' || status === 'success'}
              className={`
                w-full md:w-auto px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all transform
                ${orders.length > 0 && isContactValid && status !== 'success'
                  ? 'bg-earth-600 text-white hover:bg-earth-700 hover:scale-105 shadow-lg hover:shadow-xl' 
                  : ''}
                ${(orders.length === 0 || !isContactValid) && status !== 'success'
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : ''}
                ${status === 'success'
                  ? 'bg-green-600 text-white cursor-default'
                  : ''}
                ${status === 'error'
                  ? 'bg-red-600 text-white'
                  : ''}
              `}
            >
              {status === 'idle' && (
                <>
                  Send Order ({orders.length})
                  <Mail className="w-5 h-5" />
                </>
              )}
              {status === 'submitting' && (
                <>
                  Sending...
                  <Loader className="w-5 h-5 animate-spin" />
                </>
              )}
              {status === 'success' && (
                <>
                  Order Sent!
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
              {status === 'error' && (
                <>
                  Failed - Try Again
                  <XCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};