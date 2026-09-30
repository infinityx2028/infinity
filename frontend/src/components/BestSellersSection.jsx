import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import InfinityLoader from './InfinityLoader';
import { API_BASE_URL } from '../services/api';
import { products as fallbackProducts } from '../data';

const BestSellersSection = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBestSellers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products?isBestSeller=true`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (Array.isArray(data) && data.length > 0) {
              setBestSellers(data.slice(0, 4));
            } else {
              const localBest = fallbackProducts.filter(p => p && p.isBestSeller).slice(0, 4);
              setBestSellers(localBest.length > 0 ? localBest : fallbackProducts.filter(Boolean).slice(0, 4));
            }
          }
        } else {
          if (isMounted) {
            setBestSellers(fallbackProducts.filter(p => p && p.isBestSeller).slice(0, 4));
          }
        }
      } catch (err) {
        if (isMounted) {
          setBestSellers(fallbackProducts.filter(p => p && p.isBestSeller).slice(0, 4));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBestSellers();
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="best-sellers" className="py-7 sm:py-16 md:py-24 bg-[#FAF8F4] border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-12">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#687386] mb-0.5 sm:mb-1 block">
              Customer Favorites
            </span>
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-[#071A2F] tracking-tight">
              BEST SELLERS
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-[#071A2F] hover:text-[#C5A46D] transition-colors pb-0.5"
          >
            <span>View All</span>
            <span className="ml-1 text-[#C5A46D]">→</span>
          </Link>
        </div>

        {/* Product Cards Grid: 2 columns on mobile (gap 10px), 4 columns on PC */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#FAF8F4] rounded-2xl p-2.5 border border-[#071A2F]/6 flex flex-col justify-between">
                <div className="aspect-square bg-white rounded-xl mb-2 flex items-center justify-center">
                  <InfinityLoader size="sm" />
                </div>
                <div className="h-3.5 bg-gray-200/60 rounded w-3/4 mb-1.5 animate-pulse" />
                <div className="h-3 bg-gray-200/60 rounded w-1/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {bestSellers.filter(Boolean).slice(0, 4).map((item) => (
              <ProductCard key={item._id || item.id} product={item} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default BestSellersSection;
