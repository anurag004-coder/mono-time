'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { Product, WatchStyle } from '@/types';
import { ShoppingBag } from 'lucide-react';

const CATEGORIES: WatchStyle[] = [
  'All',
  'Minimalist',
  'Chronograph',
  'Vintage',
  'Jewelry',
  'Diver',
  'Dress',
];

export const WatchCollectionGrid: React.FC = () => {
  const {
    products,
    genderFilter,
    setGenderFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setActiveProduct,
    setIsQuickViewOpen,
    addToCart,
  } = useStore();

  // Filter products by gender, category, and search query
  const filteredProducts = products.filter((product) => {
    const matchesGender =
      genderFilter === 'all' || product.gender === genderFilter;
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      product.title.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.shortSpecs.some((s) => s.toLowerCase().includes(query)) ||
      product.specs.dialColor.toLowerCase().includes(query);

    return matchesGender && matchesCategory && matchesSearch;
  });

  const handleProductSelect = (product: Product) => {
    setActiveProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <section
      id="catalog-grid"
      className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-hairline"
    >
      {/* Section Header: quiet, luxury-watch-house typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hairline">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">
            Curated Lineage
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-bone font-normal tracking-tight">
            Complete Horological References
          </h2>
        </div>

        {/* Category Filters: plain text switch with hairline rules, no pill containers */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1 px-2.5 transition-colors duration-180 ${
                  isSelected
                    ? 'text-bone underline decoration-champagne underline-offset-4 decoration-1 font-medium'
                    : 'text-muted hover:text-bone'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid: cards use --surface with 1px solid var(--hairline), 4px radius */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <p className="font-display text-lg text-bone font-normal">
            No timepieces match your criteria.
          </p>
          <p className="text-xs text-muted">
            Try adjusting your search terms or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setGenderFilter('all');
            }}
            className="btn-secondary mt-2"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="group bg-surface border border-hairline hover:border-hairline-strong rounded-[4px] overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Image Frame: --surface-2 with subtle padding */}
              <div className="relative w-full aspect-[4/5] bg-surface-2 p-6 flex items-center justify-center overflow-hidden">
                {/* Brand & Reference Label in top corners */}
                <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between text-[11px] font-mono text-faint uppercase tracking-wider pointer-events-none">
                  <span>{product.brand}</span>
                  {product.inStock === false ? (
                    <span className="text-error">Sold out</span>
                  ) : (
                    <span>{product.specs.caseDiameter}</span>
                  )}
                </div>

                {/* Product image with 400ms slow scale */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className={`object-contain p-2 product-image-zoom drop-shadow-md ${
                      product.inStock === false ? 'opacity-50 grayscale' : ''
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Card Details on solid --surface */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-faint uppercase tracking-wider">
                    <span>{product.category}</span>
                    <span>{product.gender === 'men' ? "Men’s" : "Women’s"}</span>
                  </div>

                  <h3 className="font-display text-lg text-bone font-normal leading-snug line-clamp-1 group-hover:text-champagne transition-colors duration-180">
                    {product.title}
                  </h3>

                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>
                </div>

                {/* Price block & Action on one clean line */}
                <div className="pt-3 border-t border-hairline flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-base text-bone font-normal">
                        ₹{product.priceINR.toLocaleString('en-IN')}
                      </span>
                      {product.originalPriceINR && (
                        <span className="font-mono text-[11px] text-muted line-through">
                          ₹{product.originalPriceINR.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-muted">
                      ≈ ${product.priceUSD} USD
                    </span>
                  </div>

                  {product.inStock !== false ? (
                    <button
                      onClick={(e) => handleAdd(product, e)}
                      className="p-2 border border-hairline-strong hover:border-champagne text-muted hover:text-bone rounded-[4px] transition-colors"
                      title="Add to shopping bag"
                      aria-label={`Add ${product.title} to bag`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="font-mono text-[10px] text-faint uppercase">
                      Waitlist
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
