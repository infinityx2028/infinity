import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useCatalog } from '../contexts/useCatalog';

const FEATURED_TABS = [
  { id: 'all', label: 'All Gifts' },
  { id: 'frames', label: 'Photo Frames' },
  { id: 'magazines', label: 'Magazines' },
  { id: 'memories', label: 'Polaroids' },
  { id: 'apparel', label: 'T-Shirts' },
  { id: 'essentials', label: 'Phone Cases' },
  { id: 'hampers', label: 'Hampers' },
  { id: 'flowers', label: 'Flowers' },
  { id: 'vintage', label: 'Vintage' },
];

const FeaturedProducts = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { products: allProducts, loading } = useCatalog();
  const [isChangingTab, setIsChangingTab] = useState(false);


  const handleTabChange = (tabId) => {
    if (tabId === activeFilter) return;
    setIsChangingTab(true);
    setActiveFilter(tabId);
    setTimeout(() => {
      setIsChangingTab(false);
    }, 100);
  };

  // Filter products by selected category
  const filteredProducts = activeFilter === 'all'
    ? allProducts.filter(Boolean)
    : allProducts.filter(p => p && p.categoryId === activeFilter);

  // Take up to 4 on mobile (2x2 grid), 8 on desktop
  const displayList = filteredProducts.slice(0, 8);

  const activeTabMeta = FEATURED_TABS.find(t => t.id === activeFilter) || FEATURED_TABS[0];

  return (
    <section id="made-for-you" className="py-7 sm:py-16 md:py-24 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Row: SHOP BY CATEGORY + Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 sm:mb-8 gap-1.5 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#071A2F] tracking-tight">
              MADE AROUND YOU
            </h2>
            <p className="text-xs sm:text-sm text-[#687386] font-normal mt-0.5">
              Find your perfect personalized gift.
            </p>
          </div>
          <Link
            to={activeFilter === 'all' ? '/shop' : `/shop/${activeFilter}`}
            className="text-xs sm:text-sm font-bold text-[#071A2F] hover:text-[#C5A46D] transition-colors self-start sm:self-end pb-0.5"
          >
            <span>Explore {activeTabMeta.label}</span>
            <span className="ml-1 text-[#C5A46D]">→</span>
          </Link>
        </div>

        {/* Compact Horizontal Category Selector */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {FEATURED_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#071A2F] text-white shadow-xs'
                      : 'bg-[#FAF8F4] text-[#071A2F] hover:bg-white border border-[#071A2F]/10 hover:border-[#071A2F]/20'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid: 2-col on mobile (gap 10px), 4-col on desktop */}
        {loading || isChangingTab ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#FAF8F4] rounded-2xl p-2.5 border border-[#071A2F]/6 animate-pulse">
                <div className="aspect-square bg-gray-200/50 rounded-xl mb-2" />
                <div className="h-3.5 bg-gray-200/60 rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-gray-200/60 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : displayList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {displayList.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center bg-[#FAF8F4] rounded-2xl border border-[#071A2F]/8 p-6 my-2 max-w-md mx-auto">
            <p className="text-xs sm:text-sm font-bold text-[#071A2F] mb-3">
              No products available in this collection yet.
            </p>
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className="btn-physical-3d inline-flex items-center gap-1.5 bg-[#071A2F] text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer"
            >
              VIEW ALL PRODUCTS
            </button>
          </div>
        )}

        {/* Bottom Link: Dynamically routes to the selected category or full shop */}
        <div className="mt-6 sm:mt-10 text-center">
          <Link
            to={activeFilter === 'all' ? '/shop' : `/shop/${activeFilter}`}
            className="btn-physical-3d inline-flex items-center gap-2 bg-[#FAF8F4] hover:bg-white text-[#071A2F] border border-[#071A2F]/12 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs"
          >
            <span>
              {activeFilter === 'all' 
                ? 'EXPLORE COMPLETE CATALOG' 
                : `EXPLORE ALL ${activeTabMeta.label.toUpperCase()}`
              }
            </span>
            <ArrowRight size={13} className="text-[#C5A46D]" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
