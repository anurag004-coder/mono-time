'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { ShoppingBag, Search, X } from 'lucide-react';
import { GenderCategory } from '@/types';

interface NavbarProps {
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const {
    products,
    genderFilter,
    setGenderFilter,
    searchQuery,
    setSearchQuery,
    selectProductById,
    cartCount,
  } = useStore();

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter matching suggestions for instant dropdown
  const matchingSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        if (!searchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  const handleSelectSuggestion = (productId: string) => {
    selectProductById(productId, true);
    setShowDropdown(false);
    setSearchQuery('');
    setIsSearchExpanded(false);
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-hairline">
      {/* 4. Announcement Bar: slim, --surface background, 1px bottom hairline, centered text in muted bone */}
      <div className="w-full bg-surface border-b border-hairline py-2 px-4 text-center">
        <p className="text-xs text-muted font-sans tracking-wide">
          Complimentary insured delivery worldwide · Code MONOTIME10
        </p>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        {/* Logo left: wordmark "MONO TIME" in Newsreader small caps with "Timepieces" in mono under it */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          {/* Signature Detail: Minimalist dial mark with 1px sweeping champagne hand */}
          <div className="relative w-7 h-7 rounded-full border border-hairline-strong flex items-center justify-center shrink-0">
            {/* Center pivot */}
            <span className="w-1 h-1 rounded-full bg-champagne" />
            {/* 1px champagne second-hand that sweeps once on load and on hover */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-[1px] h-3 bg-champagne origin-bottom -translate-y-1.5 signature-sweep signature-sweep-hover" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl tracking-tight text-bone capitalize [font-variant:small-caps] font-normal leading-tight group-hover:text-champagne transition-colors duration-200">
              Mono Time
            </span>
            <span className="font-mono text-[10px] text-muted uppercase tracking-[0.14em] leading-tight">
              Timepieces
            </span>
          </div>
        </Link>

        {/* Nav center: plain text links (All Watches, Men's, Women's) */}
        <nav className="hidden md:flex items-center gap-8">
          {(
            [
              { key: 'all', label: 'All Watches' },
              { key: 'men', label: "Men's" },
              { key: 'women', label: "Women's" },
            ] as const
          ).map((item) => {
            const isActive = genderFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setGenderFilter(item.key);
                  const el = document.getElementById('catalog-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-sm tracking-wide transition-colors duration-180 relative py-1 ${
                  isActive
                    ? 'text-bone underline decoration-champagne underline-offset-8 decoration-1'
                    : 'text-muted hover:text-bone'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Utilities right: Search, Cart */}
        <div className="flex items-center gap-5 shrink-0" ref={searchContainerRef}>
          {/* Search: expands into hairline underline style input */}
          <div className="relative flex items-center">
            {isSearchExpanded ? (
              <div className="flex items-center border-b border-hairline-strong focus-within:border-champagne transition-colors">
                <Search className="w-4 h-4 text-faint mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by dial, steel, brand"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="bg-transparent text-xs text-bone placeholder-muted py-1 w-44 sm:w-60 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowDropdown(false);
                    }}
                    className="text-faint hover:text-bone p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSearchExpanded(false)}
                    className="text-faint hover:text-bone p-1"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleSearchToggle}
                className="text-muted hover:text-bone transition-colors p-1"
                aria-label="Search timepieces"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Instant Search Dropdown */}
            {showDropdown && matchingSuggestions.length > 0 && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-surface border border-hairline shadow-2xl z-50 rounded-[4px] overflow-hidden">
                <div className="px-3 py-2 border-b border-hairline text-[10px] font-mono text-faint uppercase tracking-wider flex justify-between">
                  <span>Results</span>
                  <span>{matchingSuggestions.length} References</span>
                </div>
                <div className="divide-y divide-hairline max-h-64 overflow-y-auto">
                  {matchingSuggestions.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectSuggestion(prod.id)}
                      className="p-3 flex items-center gap-3 hover:bg-surface-2 cursor-pointer transition-colors"
                    >
                      <div className="relative w-9 h-9 bg-bg border border-hairline shrink-0 rounded-[2px] overflow-hidden">
                        <Image
                          src={prod.image}
                          alt={prod.title}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-bone truncate font-sans">
                          {prod.title}
                        </p>
                        <p className="text-[11px] font-mono text-muted">
                          ₹{prod.priceINR.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart: simple bag icon with a small count in mono, no filled circle */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 text-muted hover:text-bone transition-colors p-1"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-mono text-xs text-champagne tabular-nums">
              ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-hairline py-2 px-4 bg-surface text-xs">
        {(
          [
            { key: 'all', label: 'All Watches' },
            { key: 'men', label: "Men's" },
            { key: 'women', label: "Women's" },
          ] as const
        ).map((item) => {
          const isActive = genderFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setGenderFilter(item.key);
                const el = document.getElementById('catalog-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`transition-colors py-1 ${
                isActive
                  ? 'text-bone underline decoration-champagne underline-offset-4 decoration-1 font-medium'
                  : 'text-muted hover:text-bone'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
