import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { API_BASE_URL } from '../services/api';
import { products as fallbackProducts } from '../data';

const FILTER_TABS = [
  { id: 'all', label: 'All Curations' },
  { id: 'frames', label: 'Photo Frames' },
  { id: 'magazines', label: 'Magazines' },
  { id: 'memories', label: 'Polaroids' },
  { id: 'essentials', label: 'Phone Cases' },
];

const FeaturedProducts = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAllProducts(Array.isArray(data) && data.length > 0 ? data : fallbackProducts);
          }
        } else {
          if (isMounted) setAllProducts(fallbackProducts);
        }
      } catch (e) {
        if (isMounted) setAllProducts(fallbackProducts);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  const filteredList = activeFilter === 'all'
    ? allProducts.filter(Boolean).slice(0, 8)
    : allProducts.filter(p => p && p.categoryId === activeFilter).slice(0, 8);

  const displayList = filteredList.length > 0 ? filteredList : allProducts.filter(Boolean).slice(0, 8);

  return (
    <section id="made-for-you" className="py-7 sm:py-16 md:py-24 bg-[#F7F8FA] border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header with Title and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-10 gap-3 sm:gap-6">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#687386] mb-0.5 sm:mb-2 block">
              Curated Selection
            </span>
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-[#071A2F] tracking-tight">
              FEATURED COLLECTIONS
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#071A2F] text-white shadow-xs'
                    : 'bg-white text-[#071A2F]/70 hover:text-[#071A2F] hover:bg-[#FAF8F4] border border-[#071A2F]/8'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid: 2-col on mobile (gap 10px), 4-col on desktop */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-2.5 border border-[#071A2F]/6 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-xl mb-2" />
                <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {displayList.filter(Boolean).slice(0, 4).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Link */}
        <div className="mt-6 sm:mt-12 text-center">
          <Link
            to="/shop/frames"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF8F4] text-[#071A2F] border border-[#071A2F]/10 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs"
          >
            <span>BROWSE COMPLETE CATALOG</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
