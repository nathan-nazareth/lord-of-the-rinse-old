import React from "react";
import Leaf from "lucide-react/dist/esm/icons/leaf";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";

const SCENTS = [
  {
    name: "Lavender",
    description: "Calming & relaxing",
    detail: "Perfect for winding down after a long day",
    color: "#C3B1E1",
    accentBg: "bg-purple-50",
    accentBorder: "border-purple-200",
  },
  {
    name: "Coconut",
    description: "Tropical & hydrating",
    detail: "Rich moisture for silky smooth skin",
    color: "#F5E6CA",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
  },
  {
    name: "Lemongrass",
    description: "Fresh & uplifting",
    detail: "An energizing start to your morning",
    color: "#D4E8C2",
    accentBg: "bg-lime-50",
    accentBorder: "border-lime-200",
  },
  {
    name: "Rose",
    description: "Romantic & soothing",
    detail: "Elegant floral warmth for your skin",
    color: "#F8D7DA",
    accentBg: "bg-rose-50",
    accentBorder: "border-rose-200",
  },
];

const Hero: React.FC<{ onShopClick: () => void }> = ({ onShopClick }) => {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative botanical background */}
      <div className="absolute inset-0 pointer-events-none z-base">
        <svg
          className="absolute -left-16 top-10 w-48 h-48 opacity-[0.06] animate-float"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M100 10 Q140 50 140 100 Q100 160 60 100 Q60 50 100 10"
            fill="#5A7A5F"
          />
          <ellipse
            cx="55"
            cy="85"
            rx="18"
            ry="28"
            fill="#C4785A"
            opacity="0.5"
            transform="rotate(-25 55 85)"
          />
          <ellipse
            cx="145"
            cy="85"
            rx="18"
            ry="28"
            fill="#C4785A"
            opacity="0.5"
            transform="rotate(25 145 85)"
          />
        </svg>
        <svg
          className="absolute -right-12 bottom-20 w-40 h-40 opacity-[0.05]"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M100 20 Q130 60 130 100 Q100 150 70 100 Q70 60 100 20"
            fill="#5A7A5F"
          />
          <ellipse
            cx="65"
            cy="90"
            rx="14"
            ry="22"
            fill="#C4785A"
            opacity="0.4"
            transform="rotate(-30 65 90)"
          />
          <ellipse
            cx="135"
            cy="90"
            rx="14"
            ry="22"
            fill="#C4785A"
            opacity="0.4"
            transform="rotate(30 135 90)"
          />
        </svg>
      </div>

      <div className="relative z-above">
        {/* Overline */}
        <div className="text-center mb-6 animate-enter delay-1">
          <p className="overline">Handcrafted Organic Soaps</p>
        </div>

        {/* Headline */}
        <div className="text-center mb-6 animate-enter delay-2">
          <h1 className="text-display mb-3">
            Nature's finest, <br className="hidden sm:block" />
            <span className="italic text-botanical-600">crafted for your skin</span>
          </h1>
          <p className="text-ink-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed font-body">
            Four botanical scents, three sizes, and natural add-ins —
            build your perfect bar starting at <span className="font-semibold text-ink-700">Rs. 100</span>.
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-enter delay-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-accent uppercase tracking-wider text-botanical-600 bg-botanical-100 border border-botanical-300 rounded-full px-3.5 py-1.5">
            <Leaf className="w-3.5 h-3.5" />
            100% Natural
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-accent uppercase tracking-wider text-terra-500 bg-terra-100 border border-terra-200 rounded-full px-3.5 py-1.5">
            <Droplets className="w-3.5 h-3.5" />
            Handcrafted
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-accent uppercase tracking-wider text-ink-500 bg-parchment-200 border border-parchment-400 rounded-full px-3.5 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Coconut Base
          </span>
        </div>

        {/* Scent preview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 animate-enter delay-4">
          {SCENTS.map((scent) => (
            <div
              key={scent.name}
              className="relative rounded-2xl border border-parchment-300 bg-parchment-50 p-4 text-center transition-all duration-200 hover:border-terra-300 hover:shadow-lift hover:-translate-y-0.5"
            >
              {/* Color dot */}
              <div
                className="w-8 h-8 rounded-full mx-auto mb-3 shadow-sm border border-white/60"
                style={{ backgroundColor: scent.color }}
              />
              <h3 className="font-display text-lg font-semibold text-ink-700 mb-0.5">
                {scent.name}
              </h3>
              <p className="text-ink-500 text-xs font-medium mb-1">
                {scent.description}
              </p>
              <p className="text-ink-400 text-[0.7rem] leading-snug">
                {scent.detail}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-enter delay-5">
          <button
            onClick={onShopClick}
            className="btn-apothecary btn-primary text-base px-10 py-4"
          >
            Shop Now
            <ArrowDown className="w-4 h-4 ml-1" />
          </button>
          <p className="text-ink-400 text-xs mt-3 font-accent">
            Bulk discounts available — order 3+ and save up to 15%
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
