'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { X, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotalINR,
    cartCount,
    setIsCheckoutOpen,
    appliedDiscount,
    claimOfferCode,
  } = useStore();

  const [promoInput, setPromoInput] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'MONOTIME10' || clean === 'HOROLOGY10') {
      claimOfferCode('MONOTIME10');
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Invalid privilege code. Enter MONOTIME10');
    }
  };

  const handleProceedCheckout = () => {
    onClose();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen sm:max-w-md bg-surface border-l border-hairline shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-hairline flex items-center justify-between bg-surface">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">
                Acquisitions
              </span>
              <h2 className="font-display text-xl text-bone font-normal leading-tight">
                Shopping bag
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-muted hover:text-bone transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
                <ShoppingBag className="w-8 h-8 text-faint stroke-1" />
                <p className="font-display text-base text-bone font-normal">
                  Your shopping bag is empty.
                </p>
                <p className="text-xs text-muted max-w-xs">
                  Explore our curated men’s and women’s timepieces to begin your collection.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedWristSize}`}
                  className="p-4 rounded-[4px] bg-surface-2 border border-hairline flex gap-4"
                >
                  <div className="relative w-16 h-20 bg-surface rounded-[2px] overflow-hidden shrink-0 border border-hairline">
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs text-bone font-sans font-medium line-clamp-1">
                          {item.product.title}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-faint hover:text-error transition-colors p-1"
                          aria-label={`Remove ${item.product.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-mono text-[10px] text-faint mt-0.5">
                        {item.selectedWristSize}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-hairline">
                      <div className="flex items-center border border-hairline rounded-[2px] text-xs font-mono">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-muted hover:text-bone hover:bg-surface transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2 text-bone">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-muted hover:text-bone hover:bg-surface transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-xs text-bone font-medium">
                        ₹{(item.product.priceINR * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-hairline bg-surface space-y-4">
              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Voucher code (e.g. MONOTIME10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-surface-2 border border-hairline px-3 py-1.5 text-xs text-bone placeholder-muted focus:outline-none focus:border-champagne rounded-[2px] font-mono uppercase"
                />
                <button type="submit" className="btn-secondary py-1.5 px-3 text-[11px]">
                  Apply
                </button>
              </form>
              {promoError && <p className="text-error text-[10px]">{promoError}</p>}
              {appliedDiscount && (
                <p className="font-mono text-[11px] text-oxide-text">
                  Privilege {appliedDiscount.code} applied (-{appliedDiscount.percent}%)
                </p>
              )}

              {/* Totals */}
              <div className="space-y-1.5 text-xs border-t border-hairline pt-3">
                <div className="flex justify-between items-center text-muted">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-mono text-bone tabular-nums">
                    ₹{cart.reduce((a, b) => a + b.product.priceINR * b.quantity, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted">
                  <span>Insured doorstep delivery</span>
                  <span className="font-mono text-bone tabular-nums uppercase">Complimentary</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-hairline">
                  <span className="font-sans text-sm text-bone font-medium">Total</span>
                  <span className="font-mono text-lg text-bone font-medium tabular-nums">
                    ₹{cartTotalINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedCheckout}
                className="btn-primary w-full py-3"
              >
                Proceed to checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
