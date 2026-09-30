import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import BackButton from '../components/BackButton';
import ProductCard from '../components/ProductCard';
import InfinityLoader from '../components/InfinityLoader';
import { products as localProducts } from '../data';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { useInfinityAI } from '../contexts/InfinityAIContext';

const useQuery = () => new URLSearchParams(useLocation().search);

export default function SearchResults() {
  const query = useQuery();
  const q = query.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openInfinityAI } = useInfinityAI();

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      if (!q.trim()) { 
        if (isMounted) { setResults([]); setLoading(false); }
        return; 
      }
      try {
        const res = await fetch(`${API_BASE_URL}/products?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const all = await res.json();
          const filtered = Array.isArray(all) 
            ? all.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase()))
            : [];
          if (isMounted) setResults(filtered.length > 0 ? filtered : localProducts.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase())));
        } else {
          if (isMounted) setResults(localProducts.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase())));
        }
      } catch (err) {
        if (isMounted) setResults(localProducts.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase())));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => { isMounted = false; };
  }, [q]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6"><BackButton /></div>
        
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 pb-4 border-b border-[#071A2F]/10 gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071A2F] tracking-tight">
            Search Results for <span className="text-[#123C69]">"{q}"</span>
          </h1>
          <span className="text-xs text-[#687386]">
            {loading ? 'Searching...' : `${results.length} ${results.length === 1 ? 'gift found' : 'gifts found'}`}
          </span>
        </div>

        {/* Ask Infinity AI Discovery Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#071A2F] to-[#123C69] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-[#C5A46D]/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#C5A46D]/20 text-[#C5A46D] flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Looking for the perfect personalized match?
              </p>
              <p className="text-[11px] text-white/70">
                Tell Infinity AI your occasion, recipient, and budget for instant curated recommendations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openInfinityAI(q)}
            className="px-4 py-2.5 rounded-full bg-[#C5A46D] hover:bg-[#D4B37C] text-[#071A2F] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
          >
            <span>Ask Infinity AI</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 flex flex-col justify-between">
                <div className="aspect-[4/5] bg-[#FAF8F4] rounded-2xl mb-4 flex items-center justify-center">
                  <InfinityLoader size="sm" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {results.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#071A2F]/8 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#071A2F]/5 flex items-center justify-center text-[#071A2F] mx-auto mb-4">
                  <Search size={24} className="text-[#687386]" />
                </div>
                <h2 className="font-bold text-xl sm:text-2xl text-[#071A2F] mb-2 tracking-tight">
                  WE COULDN'T FIND THAT GIFT.
                </h2>
                <p className="text-xs sm:text-sm text-[#687386] mb-6 font-light">
                  Try another search, explore collections below, or let Infinity AI recommend something based on your budget.
                </p>

                {/* AI Assistant Button inside Empty State */}
                <button
                  type="button"
                  onClick={() => openInfinityAI(q)}
                  className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#071A2F] hover:bg-[#0B2748] text-[#C5A46D] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Ask Infinity AI for Ideas</span>
                </button>

                {/* Suggested Category Links */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {[
                    { label: 'Photo Frames', path: '/shop/frames' },
                    { label: 'Polaroids', path: '/shop/memories' },
                    { label: 'Custom Apparel', path: '/shop/apparel' },
                    { label: 'Magazines', path: '/shop/magazines' },
                    { label: 'Phone Cases', path: '/shop/essentials' },
                  ].map((cat, idx) => (
                    <Link
                      key={idx}
                      to={cat.path}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF8F4] hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>

                <Link to="/shop" className="inline-block bg-[#071A2F] hover:bg-[#0B2748] text-white px-7 py-3 rounded-full text-xs font-bold tracking-wide shadow-md transition-all">
                  Explore All Collections →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map(p => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
