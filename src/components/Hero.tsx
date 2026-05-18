import type React from "react";
import Leaf from "lucide-react/dist/esm/icons/leaf";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";

const SCENTS = [
  {
    name: "Lavender",
    description: "Calming & relaxing",
    detail: "Perfect for winding down after a long day",
    color: "#FDE68A",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
  },
  {
    name: "Coconut",
    description: "Tropical & hydrating",
    detail: "Rich moisture for silky smooth skin",
    color: "#FFFFFF",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
  },
  {
    name: "Citronella",
    description: "Fresh & mosquito-repelling",
    detail: "Natural outdoor protection",
    color: "#D4E8C2",
    accentBg: "bg-lime-50",
    accentBorder: "border-lime-200",
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
          aria-hidden="true"
        >
          <circle cx="100" cy="80" r="25" fill="#C4785A" opacity="0.6"/>
          <circle cx="75" cy="60" r="18" fill="#7AA07F" opacity="0.5"/>
          <circle cx="125" cy="60" r="18" fill="#7AA07F" opacity="0.5"/>
          <circle cx="65" cy="85" r="18" fill="#7AA07F" opacity="0.5"/>
          <circle cx="135" cy="85" r="18" fill="#7AA07F" opacity="0.5"/>
          <circle cx="100" cy="80" r="12" fill="#FDE68A" opacity="0.7"/>
        </svg>
        <svg
          className="absolute -right-12 bottom-20 w-40 h-40 opacity-[0.05]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="20" fill="#C4785A" opacity="0.5"/>
          <circle cx="80" cy="85" r="14" fill="#7AA07F" opacity="0.4"/>
          <circle cx="120" cy="85" r="14" fill="#7AA07F" opacity="0.4"/>
          <circle cx="80" cy="115" r="14" fill="#7AA07F" opacity="0.4"/>
          <circle cx="120" cy="115" r="14" fill="#7AA07F" opacity="0.4"/>
          <circle cx="100" cy="100" r="9" fill="#FDE68A" opacity="0.6"/>
        </svg>
      </div>

      <div className="relative z-above">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 animate-enter delay-4">
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
            type="button"
            onClick={onShopClick}
            className="btn-apothecary btn-primary text-base px-10 py-4"
          >
            Shop Now
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
