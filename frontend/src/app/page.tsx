'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ProductHero } from '@/components/ProductHero';
import { WatchCollectionGrid } from '@/components/WatchCollectionGrid';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { MultimodalChatWidget } from '@/components/MultimodalChatWidget';
import { ExitIntentObserver } from '@/components/ExitIntentObserver';
import { CartDrawer } from '@/components/CartDrawer';
import { MockStripeCheckout } from '@/components/MockStripeCheckout';
import { useStore } from '@/lib/store';

export default function StorefrontPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { setGenderFilter, setSelectedCategory, setIsChatOpen, sendMessage } = useStore();

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenderClick = (gender: 'all' | 'men' | 'women') => {
    setGenderFilter(gender);
    document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHelpQuery = (query: string) => {
    setIsChatOpen(true);
    sendMessage(query);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col text-bone selection:bg-champagne selection:text-on-champagne">
      {/* 4. Header & Announcement Bar */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Main Content */}
      <main className="flex-1">
        {/* 6. Hero / Product Detail Layout */}
        <ProductHero />

        {/* Catalog Grid */}
        <WatchCollectionGrid />
      </main>

      {/* 12. Footer: hairline top border, four short link columns, small mono copyright */}
      <footer className="border-t border-hairline bg-surface py-14 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Shop */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                Shop
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleGenderClick('all')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    All Watches
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGenderClick('men')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Men’s Collection
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGenderClick('women')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Women’s Collection
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Minimalist')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Minimalist Lineage
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Chronograph')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Chronographs
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Help */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                Help
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleHelpQuery('How do I request complimentary bracelet sizing and strap adjustment?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Complimentary Sizing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('Can you help me check the status and tracking for my watch order?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Order Tracking
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('What is covered under the Mono Time 2-Year International Warranty?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    2-Year Warranty
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('What is the return policy if the watch does not fit my wrist?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    14-Day Returns
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('What are the recommended cleaning and demagnetization care steps?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Horology Care Guide
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                Company
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleHelpQuery('Tell me about the Mono Time Atelier and horological philosophy.')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    The Atelier
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('Tell me about Mono Time certified watchmaker network.')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Master Watchmakers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('How does Mono Time inspect and verify every reference?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Inspection Standards
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Client Concierge Desk
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
                Legal
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleHelpQuery('How does Mono Time verify authenticity and origin?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Authenticity Guarantee
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('Explain Mono Time privacy and security standards.')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Privacy &amp; Security
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleHelpQuery('What are the terms of insured doorstep delivery worldwide?')}
                    className="hover:text-bone transition-colors text-left"
                  >
                    Terms of Delivery
                  </button>
                </li>
                <li>
                  <span className="text-faint font-mono text-[11px]">
                    Vault: Mumbai Horizon
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: small mono copyright */}
          <div className="pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-faint font-mono text-[11px]">
            <span>© 2026 Mono Time Timepieces. All rights reserved.</span>
            <Link
              href="/admin"
              className="hover:text-champagne transition-colors"
              title="Atelier Administration Portal"
            >
              Haute Horology Atelier
            </Link>
          </div>
        </div>
      </footer>

      {/* Overlays and Modals */}
      <ProductDetailModal />
      <MultimodalChatWidget />
      <ExitIntentObserver />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <MockStripeCheckout />
    </div>
  );
}
