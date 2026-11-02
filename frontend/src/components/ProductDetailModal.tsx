'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { X, CheckCircle2 } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    activeProduct,
    isQuickViewOpen,
    setIsQuickViewOpen,
    addToCart,
    setIsCheckoutOpen,
  } = useStore();

  const [wristSize, setWristSize] = useState<number>(6.7);
  const [added, setAdded] = useState<boolean>(false);

  if (!isQuickViewOpen || !activeProduct) return null;

  const handleAdd = () => {
    addToCart(activeProduct, `${wristSize.toFixed(1)}″ Wrist`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(activeProduct, `${wristSize.toFixed(1)}″ Wrist`);
    setIsQuickViewOpen(false);
    setIsCheckoutOpen(true);
  };

  const specFields = [
    { label: 'Case diameter', value: activeProduct.specs.caseDiameter },
    { label: 'Lug-to-lug', value: activeProduct.specs.lugToLug },
    { label: 'Thickness', value: activeProduct.specs.caseThickness },
    { label: 'Dial', value: activeProduct.specs.dialColor },
    { label: 'Movement', value: activeProduct.specs.movement },
    { label: 'Water resistance', value: activeProduct.specs.waterResistance },
    { label: 'Strap / Bracelet', value: activeProduct.specs.strapMaterial },
    { label: 'Warranty', value: activeProduct.specs.warranty },
  ].filter((f) => Boolean(f.value));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-surface border border-hairline rounded-[4px] shadow-2xl p-6 sm:p-10">
        {/* Close Button */}
        <button
          onClick={() => setIsQuickViewOpen(false)}
          className="absolute top-4 right-4 p-1 text-muted hover:text-bone transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Image */}
          <div className="relative aspect-[4/5] bg-surface-2 rounded-[4px] overflow-hidden border border-hairline flex items-center justify-center p-6">
            <Image
              src={activeProduct.image}
              alt={activeProduct.title}
              fill
              className="object-contain p-4 product-image-zoom drop-shadow-md"
              sizes="500px"
            />
            <span className="absolute top-3 left-3 font-mono text-[10px] text-faint uppercase tracking-wider">
              {activeProduct.brand}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                {activeProduct.gender === 'men' ? "MEN’S" : "WOMEN’S"} · {activeProduct.brand.toUpperCase()}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-bone font-normal leading-snug">
                {activeProduct.title}
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* Price Block */}
            <div className="py-2 border-y border-hairline flex items-baseline gap-3">
              <span className="font-display text-2xl sm:text-3xl text-bone font-normal">
                ₹{activeProduct.priceINR.toLocaleString('en-IN')}
              </span>
              {activeProduct.originalPriceINR && (
                <span className="font-mono text-xs text-muted line-through">
                  MRP ₹{activeProduct.originalPriceINR.toLocaleString('en-IN')}
                </span>
              )}
              <span className="font-mono text-xs text-muted">
                ≈ ${activeProduct.priceUSD} USD
              </span>
            </div>

            {/* Stock status */}
            <div className="text-xs">
              {activeProduct.inStock !== false ? (
                <span className="text-oxide-text flex items-center gap-1.5 font-sans">
                  <span className="text-[10px] leading-none">●</span>
                  <span>In stock · ships in 24 h</span>
                </span>
              ) : (
                <span className="text-error flex items-center gap-1.5 font-sans">
                  <span className="text-[10px] leading-none">●</span>
                  <span>Sold out · waitlist only</span>
                </span>
              )}
            </div>

            {/* Specs Definition List */}
            <div className="border-t border-hairline pt-3">
              <dl className="divide-y divide-hairline">
                {specFields.map((spec, i) => (
                  <div key={i} className="py-1.5 flex justify-between text-xs">
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-faint">
                      {spec.label}
                    </dt>
                    <dd className="font-sans text-bone text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAdd}
                disabled={activeProduct.inStock === false}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                Add to bag
              </button>
              <button
                onClick={handleBuyNow}
                disabled={activeProduct.inStock === false}
                className="btn-secondary flex-1 disabled:opacity-40"
              >
                Buy now
              </button>
            </div>

            {added && (
              <p className="text-xs text-oxide-text flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Added to your shopping bag.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
