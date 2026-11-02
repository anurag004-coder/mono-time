'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { X } from 'lucide-react';

export const ExitIntentObserver: React.FC = () => {
  const {
    isExitIntentOpen,
    setIsExitIntentOpen,
    activeProduct,
    currentPitch,
    triggerExitIntent,
    claimOfferCode,
    setIsCheckoutOpen,
    addToCart,
  } = useStore();

  useEffect(() => {
    // 1. Mouse leaving towards browser top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 25) {
        triggerExitIntent(activeProduct, 'exit_intent');
      }
    };

    // 2. Idle dwell trigger after 50 seconds
    const idleTimer = setTimeout(() => {
      if (activeProduct && activeProduct.priceINR >= 12000) {
        triggerExitIntent(activeProduct, 'idle_dwell');
      }
    }, 50000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(idleTimer);
    };
  }, [activeProduct, triggerExitIntent]);

  if (!isExitIntentOpen || !currentPitch || !activeProduct) return null;

  const handleClaim = () => {
    claimOfferCode(currentPitch.code);
    addToCart(activeProduct);
    setIsExitIntentOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface border border-hairline-strong rounded-[4px] p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
        {/* Dismiss Button */}
        <button
          onClick={() => setIsExitIntentOpen(false)}
          className="absolute top-4 right-4 p-1 text-muted hover:text-bone transition-colors"
          aria-label="Dismiss offer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">
            Privilege Invitation
          </span>
          <h3 className="font-display text-2xl text-bone font-normal leading-tight">
            Before you conclude your visit
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Reserve the <strong className="text-bone">{activeProduct.title}</strong> with an exclusive 10% acquisition courtesy and complimentary insured delivery.
          </p>
        </div>

        {/* Product Preview */}
        <div className="p-3 bg-surface-2 border border-hairline rounded-[4px] flex items-center gap-3">
          <div className="relative w-12 h-14 bg-surface rounded-[2px] overflow-hidden shrink-0 border border-hairline">
            <Image
              src={activeProduct.image}
              alt={activeProduct.title}
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-bone font-sans truncate">{activeProduct.title}</p>
            <p className="font-mono text-xs text-champagne font-medium">
              VOUCHER · {currentPitch.code}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClaim}
          className="btn-primary w-full py-3"
        >
          Apply courtesy & acquire
        </button>
      </div>
    </div>
  );
};
