'use client';

import React, { useState, useId } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { PRODUCTS } from '@/lib/products';
import { ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ProductHero: React.FC = () => {
  const {
    activeProduct,
    setActiveProduct,
    setGenderFilter,
    addToCart,
    setIsCheckoutOpen,
  } = useStore();

  const [wristSize, setWristSize] = useState<number>(6.7);
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState<number>(0);
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);

  // Reference label derivation e.g. REF. TE-01
  const refCode = `REF. ${activeProduct.id
    .split('-')
    .map((s) => s[0].toUpperCase())
    .join('')}-01`;

  // Gallery thumbnails: primary image + complementary brand/lineage perspectives
  const galleryThumbnails = [
    activeProduct.image,
    ...PRODUCTS.filter(
      (p) => p.gender === activeProduct.gender && p.id !== activeProduct.id
    )
      .slice(0, 3)
      .map((p) => p.image),
  ];

  const minRec = activeProduct.fitRecommendation.recommendedWristMin;
  const maxRec = activeProduct.fitRecommendation.recommendedWristMax;

  // Numeric parse of specs for diagram
  const parsedDiameter = parseFloat(activeProduct.specs.caseDiameter) || 40;
  const parsedLugToLug =
    parseFloat(activeProduct.specs.lugToLug || '') ||
    Math.round(parsedDiameter * 1.15);

  // Wrist dimensions calculation
  // Flat wrist width approx = circumference / pi
  const wristMm = wristSize * 25.4;
  const flatWidthMm = wristMm / Math.PI;

  // Fit assessment verdict line
  let fitDotClass = 'text-oxide-text';
  let fitVerdictText = 'Good fit. Lugs sit within the wrist width.';

  if (wristSize < minRec) {
    if (wristSize < minRec - 0.6 || parsedLugToLug >= flatWidthMm) {
      fitDotClass = 'text-error';
      fitVerdictText = 'Likely to overhang. Consider a smaller case size.';
    } else {
      fitDotClass = 'text-champagne';
      fitVerdictText = 'Slightly large. May overhang on flatter wrists.';
    }
  } else if (wristSize > maxRec + 0.6) {
    fitDotClass = 'text-champagne';
    fitVerdictText = 'Understated drape. Lugs sit well within wrist width.';
  } else {
    fitDotClass = 'text-oxide-text';
    fitVerdictText = 'Good fit. Lugs sit within the wrist width.';
  }

  // Diagram scaling: 1mm -> 1.5px
  const scale = 1.5;
  const wristRx = Math.min(65, Math.max(34, (flatWidthMm * scale) / 2));
  const watchW = Math.min(54, parsedDiameter * scale * 0.75);
  const watchH = Math.min(78, parsedLugToLug * scale * 0.75);

  const handleAddToCart = () => {
    addToCart(activeProduct, `${wristSize.toFixed(1)}″ Wrist`);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2400);
  };

  const handleBuyNow = () => {
    addToCart(activeProduct, `${wristSize.toFixed(1)}″ Wrist`);
    setIsCheckoutOpen(true);
  };

  const handleSwitchGender = (gender: 'men' | 'women') => {
    const target =
      PRODUCTS.find((p) => p.gender === gender && p.isHero) ||
      PRODUCTS.find((p) => p.gender === gender) ||
      PRODUCTS[0];
    setActiveProduct(target);
    setGenderFilter(gender);
    setActiveThumbnailIndex(0);
  };

  // Spec definition fields (omitting missing values)
  const specFields = [
    {
      label: 'Case material',
      value: activeProduct.shortSpecs.find((s) => s.toLowerCase().includes('steel')) ||
        (activeProduct.specs.strapMaterial.includes('Steel') ? '316L stainless steel' : null) ||
        '316L surgical stainless steel',
    },
    { label: 'Case diameter', value: activeProduct.specs.caseDiameter },
    { label: 'Lug-to-lug', value: activeProduct.specs.lugToLug },
    { label: 'Thickness', value: activeProduct.specs.caseThickness },
    { label: 'Dial', value: activeProduct.specs.dialColor },
    { label: 'Movement', value: activeProduct.specs.movement },
    { label: 'Water resistance', value: activeProduct.specs.waterResistance },
    {
      label: 'Strap / bracelet',
      value: activeProduct.specs.strapMaterial || activeProduct.specs.clasp,
    },
    { label: 'Warranty', value: activeProduct.specs.warranty },
  ].filter((item) => Boolean(item.value));

  return (
    <section className="relative bg-bg py-8 lg:py-14 border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5. Collection Switch: two words separated by a thin vertical rule; active has champagne underline */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-hairline">
          {/* Eyebrow: plain FEATURED in mono, no icon */}
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
            Featured
          </span>

          <div className="flex items-center text-xs tracking-wide">
            <button
              onClick={() => handleSwitchGender('men')}
              className={`transition-colors py-0.5 px-2 ${
                activeProduct.gender === 'men'
                  ? 'text-bone underline decoration-champagne underline-offset-4 decoration-1 font-medium'
                  : 'text-muted hover:text-bone'
              }`}
            >
              Men’s Flagship
            </button>
            <span className="text-hairline-strong px-2">|</span>
            <button
              onClick={() => handleSwitchGender('women')}
              className={`transition-colors py-0.5 px-2 ${
                activeProduct.gender === 'women'
                  ? 'text-bone underline decoration-champagne underline-offset-4 decoration-1 font-medium'
                  : 'text-muted hover:text-bone'
              }`}
            >
              Women’s Flagship
            </button>
          </div>
        </div>

        {/* 6. Desktop 7/5 split layout (fixes overlap bug, details on solid --bg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left: Image column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image Frame: --surface, 1px hairline, 4px radius, generous padding */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square bg-surface border border-hairline rounded-[4px] p-8 sm:p-14 flex items-center justify-center overflow-hidden group">
              {/* Mono Reference Label: top-left corner */}
              <span className="absolute top-4 left-4 font-mono text-[11px] text-faint tracking-wider uppercase">
                {refCode}
              </span>

              {/* Product Photo with slow 400ms hover zoom (1 -> 1.03) */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={galleryThumbnails[activeThumbnailIndex] || activeProduct.image}
                  alt={activeProduct.title}
                  fill
                  priority
                  className="object-contain p-4 product-image-zoom drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            </div>

            {/* Row of 3-4 square thumbnails: hairline border; active has champagne border */}
            <div className="grid grid-cols-4 gap-3">
              {galleryThumbnails.map((thumbSrc, index) => {
                const isActive = activeThumbnailIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveThumbnailIndex(index)}
                    className={`relative aspect-square bg-surface rounded-[4px] overflow-hidden p-2 transition-all duration-180 ${
                      isActive
                        ? 'border border-champagne'
                        : 'border border-hairline hover:border-hairline-strong'
                    }`}
                    aria-label={`Product perspective ${index + 1}`}
                  >
                    <Image
                      src={thumbSrc}
                      alt={`${activeProduct.title} view ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Details column (5 cols) on solid --bg, NO imagery behind it */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-bg">
            {/* 1. Eyebrow: MEN'S · TITAN in 11px uppercase, 0.14em tracking, --champagne */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                {activeProduct.gender === 'men' ? "MEN’S" : "WOMEN’S"} · {activeProduct.brand.toUpperCase()}
              </span>

              {/* 2. Title in Newsreader 44-56px, --text, max 2 lines */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] text-bone leading-[1.12] font-normal tracking-tight line-clamp-2">
                {activeProduct.title}
              </h1>

              {/* 3. One-line description in --text-muted */}
              <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                {activeProduct.tagline}
              </p>
            </div>

            {/* 4. Price Block: Newsreader 40px, on same baseline MRP struck through and USD, one clean line */}
            <div className="py-2 border-y border-hairline flex flex-col gap-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-3xl sm:text-[40px] text-bone font-normal leading-none tracking-tight">
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

              {/* Stock: plain text with a small oxide dot, no pill */}
              <div className="flex items-center gap-2 text-xs">
                {activeProduct.inStock !== false ? (
                  <p className="text-oxide-text flex items-center gap-1.5 font-sans">
                    <span className="text-[10px] leading-none">●</span>
                    <span>In stock · ships in 24 h</span>
                  </p>
                ) : (
                  <p className="text-error flex items-center gap-1.5 font-sans">
                    <span className="text-[10px] leading-none">●</span>
                    <span>Sold out · waitlist only</span>
                  </p>
                )}
              </div>
            </div>

            {/* 5. Primary button "Add to bag" and secondary "Buy now" */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={activeProduct.inStock === false}
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to bag
              </button>
              <button
                onClick={handleBuyNow}
                disabled={activeProduct.inStock === false}
                className="btn-secondary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy now
              </button>
            </div>

            {/* 6. Spec List: Two-column definition list with hairline rules between rows */}
            <div className="border-t border-hairline pt-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint block mb-2">
                Specifications
              </span>
              <dl className="divide-y divide-hairline">
                {specFields.map((field, idx) => (
                  <div
                    key={idx}
                    className="py-2 flex items-center justify-between text-xs"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-faint">
                      {field.label}
                    </dt>
                    <dd className="font-sans text-xs text-bone text-right">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* 7. Wrist Fit (replaces "AI Wrist-Fit Calculator") */}
            <div className="border-t border-hairline pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-base text-bone font-normal">
                  Wrist fit
                </span>

                {/* in / cm toggle (text switch) */}
                <div className="flex items-center text-xs tracking-wider font-mono">
                  <button
                    onClick={() => setUnit('in')}
                    className={`py-0.5 px-1.5 transition-colors ${
                      unit === 'in'
                        ? 'text-bone underline decoration-champagne underline-offset-4 decoration-1 font-medium'
                        : 'text-muted hover:text-bone'
                    }`}
                  >
                    in
                  </button>
                  <span className="text-hairline-strong px-1">|</span>
                  <button
                    onClick={() => setUnit('cm')}
                    className={`py-0.5 px-1.5 transition-colors ${
                      unit === 'cm'
                        ? 'text-bone underline decoration-champagne underline-offset-4 decoration-1 font-medium'
                        : 'text-muted hover:text-bone'
                    }`}
                  >
                    cm
                  </button>
                </div>
              </div>

              {/* Slider with track --hairline-strong, filled --champagne, current value in mono */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-faint text-[11px]">
                    {unit === 'in' ? '5.0″ Petite' : '12.7 cm Petite'}
                  </span>
                  <span className="text-champagne font-medium">
                    {unit === 'in'
                      ? `${wristSize.toFixed(1)}″`
                      : `${(wristSize * 2.54).toFixed(1)} cm`}
                  </span>
                  <span className="text-faint text-[11px]">
                    {unit === 'in' ? '8.2″ Broad' : '20.8 cm Broad'}
                  </span>
                </div>

                <input
                  type="range"
                  min="5.0"
                  max="8.2"
                  step="0.1"
                  value={wristSize}
                  onChange={(e) => setWristSize(parseFloat(e.target.value))}
                  className="w-full h-1 bg-hairline-strong rounded-[2px] appearance-none cursor-pointer accent-champagne"
                  aria-label="Wrist circumference slider"
                />
              </div>

              {/* New Top-Down SVG Diagram: wrist ellipse + watch overlay + dimension line */}
              <div className="w-full bg-surface border border-hairline rounded-[4px] p-3 flex items-center justify-center">
                <svg
                  width="260"
                  height="100"
                  viewBox="0 0 260 100"
                  className="overflow-visible"
                >
                  {/* Wrist Outline Ellipse in --hairline-strong with explicit hex */}
                  <ellipse
                    cx="120"
                    cy="50"
                    rx={wristRx}
                    ry="28"
                    fill="#1E1B17"
                    stroke="#3A342B"
                    strokeWidth="1.5"
                  />

                  {/* Watch Case overlay */}
                  <rect
                    x={120 - watchW / 2}
                    y={50 - watchH / 2}
                    width={watchW}
                    height={watchH}
                    rx="4"
                    fill="#171512"
                    stroke="#D8C3A0"
                    strokeWidth="1.2"
                  />

                  {/* Watch dial circle */}
                  <circle
                    cx="120"
                    cy="50"
                    r={watchW * 0.4}
                    fill="#0F0E0C"
                    stroke="#3A342B"
                    strokeWidth="1"
                  />

                  {/* Subtle dial center pin */}
                  <circle cx="120" cy="50" r="1.5" fill="#D8C3A0" />

                  {/* Lug-to-lug dimension line on right */}
                  <g>
                    <line
                      x1={120 + watchW / 2 + 12}
                      y1={50 - watchH / 2}
                      x2={120 + watchW / 2 + 12}
                      y2={50 + watchH / 2}
                      stroke="#B09C7A"
                      strokeWidth="1"
                    />
                    {/* Top tick */}
                    <line
                      x1={120 + watchW / 2 + 8}
                      y1={50 - watchH / 2}
                      x2={120 + watchW / 2 + 16}
                      y2={50 - watchH / 2}
                      stroke="#B09C7A"
                      strokeWidth="1"
                    />
                    {/* Bottom tick */}
                    <line
                      x1={120 + watchW / 2 + 8}
                      y1={50 + watchH / 2}
                      x2={120 + watchW / 2 + 16}
                      y2={50 + watchH / 2}
                      stroke="#B09C7A"
                      strokeWidth="1"
                    />
                    {/* Label */}
                    <text
                      x={120 + watchW / 2 + 20}
                      y="53"
                      fill="#B09C7A"
                      fontSize="9"
                      fontFamily="DM Mono, monospace"
                      alignmentBaseline="middle"
                    >
                      {parsedLugToLug} mm lug-to-lug
                    </text>
                  </g>
                </svg>
              </div>

              {/* Verdict line under the diagram, plain text with small dot */}
              <p className={`text-xs flex items-center gap-2 ${fitDotClass} font-sans`}>
                <span className="text-[9px] leading-none">●</span>
                <span>{fitVerdictText}</span>
              </p>
            </div>

            {/* 8. Trust Row (Section 12): three items separated by hairlines */}
            <div className="border-t border-hairline pt-4 grid grid-cols-3 divide-x divide-hairline text-center text-[11px] text-muted font-sans">
              <span className="px-2">Certified authentic</span>
              <span className="px-2">2-year warranty</span>
              <span className="px-2">Easy returns</span>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar with price and Add to bag */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-hairline p-3 z-30 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-display text-lg text-bone leading-none">
              ₹{activeProduct.priceINR.toLocaleString('en-IN')}
            </span>
            <span className="font-mono text-[10px] text-muted">
              {activeProduct.inStock !== false ? 'In stock' : 'Sold out'}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={activeProduct.inStock === false}
            className="btn-primary py-2.5 px-6 text-xs flex-1 max-w-xs disabled:opacity-40"
          >
            Add to bag
          </button>
        </div>

        {/* Toast Feedback */}
        {isAddedToast && (
          <div className="fixed bottom-16 right-6 z-50 px-4 py-3 bg-surface border border-hairline-strong text-bone text-xs rounded-[4px] shadow-2xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-oxide-text" />
            <span>{activeProduct.title} added to your bag.</span>
          </div>
        )}
      </div>
    </section>
  );
};
