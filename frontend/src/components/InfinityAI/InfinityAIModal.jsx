import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight, CornerDownLeft, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useInfinityAI } from '../../contexts/useInfinityAI';
import { getGiftRecommendations } from '../../services/giftAssistantService';
import { API_BASE_URL } from '../../services/api';

const SUGGESTION_CHIPS = [
  { label: 'Birthday', query: 'Birthday gift under ₹1000' },
  { label: 'Anniversary', query: 'Anniversary gift for couple' },
  { label: 'Best Friend', query: 'Gift for my best friend who loves photos' },
  { label: 'Couple', query: 'Something romantic for couple under ₹1200' },
  { label: 'Parents', query: 'Anniversary gift for my parents under ₹1500' },
  { label: 'Under ₹500', query: 'Meaningful personalized gift under ₹500' },
  { label: 'Under ₹1000', query: 'Customized gift under ₹1000' }
];

export default function InfinityAIModal() {
  const { isOpen, closeInfinityAI, initialQuery, clearInitialQuery } = useInfinityAI();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [catalogCache, setCatalogCache] = useState([]);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Load active catalog cache on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setCatalogCache(data.filter(product => product.isActive !== false));
          }
        }
      } catch {
        if (isMounted) setCatalogCache([]);
      }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  const searchInitialQuery = useEffectEvent((text) => { handleSearch(text); clearInitialQuery(); });

  // When modal opens, handle initial query if passed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialQuery && initialQuery.trim()) {
        setQuery(initialQuery);
        searchInitialQuery(initialQuery);
      } else {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResult(null);
      setError(null);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (textToSearch, refinement = null) => {
    const searchText = (textToSearch || query).trim();
    if (!searchText && !refinement) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getGiftRecommendations({
        query: searchText,
        refinement,
        currentIntent: result?.intent || null,
        cachedProducts: catalogCache
      });

      if (response && response.success) {
        setResult(response);
        setTimeout(() => {
          resultsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        setError(response?.message || 'Infinity AI is unavailable right now.');
      }
    } catch {
      setError('Infinity AI is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleChipClick = (chipQuery) => {
    setQuery(chipQuery);
    handleSearch(chipQuery);
  };

  const handleRefinementClick = (refinementText) => {
    let key = '';
    const clean = refinementText.toLowerCase();
    if (clean.includes('under ₹500') || clean.includes('500')) key = 'under-500';
    else if (clean.includes('premium')) key = 'premium';
    else if (clean.includes('photo')) key = 'photo-gifts';
    else if (clean.includes('couple')) key = 'couples';
    else if (clean.includes('personal')) key = 'more-personal';

    handleSearch(query, key || refinementText);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex flex-col justify-end sm:justify-center items-center bg-[#071A2F]/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Infinity AI Gift Finder"
    >
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={closeInfinityAI} />

      {/* Main Modal Card: Bottom sheet on mobile (< sm), Centered card on Desktop (sm+) */}
      <div 
        className="relative z-10 w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[85vh] bg-[#FAF8F4] sm:rounded-3xl rounded-t-3xl shadow-[0_20px_60px_rgba(7,26,47,0.22)] border border-[#071A2F]/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 sm:px-8 pt-5 pb-3 border-b border-[#071A2F]/8 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#071A2F] text-[#C5A46D] flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-tight text-[#071A2F]">
                  Infinity AI
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#FAF8F4] text-[#C5A46D] border border-[#C5A46D]/30">
                  Concierge
                </span>
              </div>
              <p className="text-[11px] text-[#687386] font-normal mt-0.5">
                Your personal gift finder
              </p>
            </div>
          </div>

          <button
            onClick={closeInfinityAI}
            aria-label="Close Infinity AI"
            className="w-8 h-8 rounded-full bg-[#FAF8F4] hover:bg-gray-200 text-[#071A2F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5">
          
          {/* Natural Language Search Input Form */}
          <form onSubmit={handleFormSubmit} className="space-y-2.5">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Birthday gift for my sister under ₹800..."
                className="w-full h-14 pl-4 pr-12 rounded-2xl bg-white border-2 border-[#071A2F]/12 text-[#071A2F] placeholder:text-[#687386]/60 text-sm font-medium focus:outline-none focus:border-[#071A2F] focus:ring-4 focus:ring-[#071A2F]/8 transition-all shadow-xs"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                aria-label="Find gifts"
                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-[#071A2F] hover:bg-[#0B2748] disabled:bg-gray-200 disabled:text-gray-400 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#687386] whitespace-nowrap mr-1 hidden sm:inline">
                Try:
              </span>
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip.query)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 hover:border-[#071A2F] text-[11px] font-bold tracking-tight transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </form>

          {/* SKELETON LOADING STATE */}
          {loading && (
            <div className="py-6 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-[#071A2F]">
                <RefreshCw size={14} className="animate-spin text-[#C5A46D]" />
                <span>Finding the right gifts for you...</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-3 border border-[#071A2F]/8 animate-pulse space-y-3">
                    <div className="w-full aspect-square bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-8 bg-gray-100 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div className="bg-white rounded-2xl p-6 border border-red-100 text-center space-y-3 shadow-xs">
              <p className="text-xs sm:text-sm font-bold text-[#071A2F]">
                {error}
              </p>
              <p className="text-xs text-[#687386]">
                You can browse our top categories and best sellers directly:
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <Link
                  to="/shop"
                  onClick={closeInfinityAI}
                  className="px-5 py-2 rounded-full bg-[#071A2F] text-white text-xs font-bold shadow-xs hover:bg-[#0B2748] transition-colors"
                >
                  BROWSE ALL GIFTS
                </Link>
                <Link
                  to="/shop/frames"
                  onClick={closeInfinityAI}
                  className="px-5 py-2 rounded-full bg-[#FAF8F4] text-[#071A2F] border border-[#071A2F]/15 text-xs font-bold hover:bg-white transition-colors"
                >
                  BEST SELLERS
                </Link>
              </div>
            </div>
          )}

          {/* RESULTS CONTAINER */}
          {result && !loading && (
            <div ref={resultsContainerRef} className="space-y-4 animate-in fade-in duration-300">
              
              {/* AI Reply Message & Summary */}
              <div className="flex items-start justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#071A2F]/8 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A46D] block mb-0.5">
                    Infinity AI Recommendation
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#071A2F] leading-snug">
                    {result.reply}
                  </p>
                </div>
                <div className="text-[11px] font-mono font-bold text-[#687386] whitespace-nowrap pt-0.5">
                  {result.products?.length || 0} items
                </div>
              </div>

              {/* Clarification prompt if input was too vague */}
              {result.needsClarification && result.clarificationQuestion && (
                <div className="bg-[#FAF8F4] p-3.5 rounded-2xl border border-[#C5A46D]/40 space-y-2">
                  <p className="text-xs font-bold text-[#071A2F]">
                    {result.clarificationQuestion}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.quickOptions?.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleChipClick(opt)}
                        className="px-3 py-1 bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/15 rounded-full text-xs font-bold transition-all shadow-2xs"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCT CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {result.products?.map((product, idx) => {
                  const pid = product._id || product.id;
                  const img = product.images?.[0] || product.image || '/images/4 x 6 black frame 199.jpg';
                  const isTopMatch = product.isTopPick || idx === 0;

                  return (
                    <div
                      key={pid || idx}
                      style={{
                        animation: `heroFadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 60}ms both`
                      }}
                      className={`relative bg-white rounded-2xl border overflow-hidden p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group ${
                        isTopMatch 
                          ? 'border-[#071A2F] ring-1 ring-[#071A2F]/10' 
                          : 'border-[#071A2F]/8'
                      }`}
                    >
                      {/* Top Pick Badge */}
                      {isTopMatch && (
                        <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded-full bg-[#071A2F] text-[#C5A46D] font-mono text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Sparkles size={10} />
                          <span>BEST MATCH</span>
                        </div>
                      )}

                      {/* Product Image */}
                      <Link 
                        to={`/product/${pid}`} 
                        onClick={closeInfinityAI}
                        className="block relative aspect-square rounded-xl overflow-hidden bg-[#FAF8F4] mb-2.5"
                      >
                        <img
                          loading="lazy"
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Info & Price */}
                      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-extrabold text-xs sm:text-sm text-[#071A2F] line-clamp-1 leading-snug">
                              {product.name}
                            </h3>
                            <span className="font-extrabold text-xs sm:text-sm text-[#071A2F] whitespace-nowrap">
                              ₹{product.price}
                            </span>
                          </div>

                          {/* Short AI Explanation */}
                          <p className="text-[11px] text-[#687386] font-normal line-clamp-2 leading-tight mt-1">
                            {product.recommendationReason}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center gap-2">
                          <Link
                            to={`/product/${pid}`}
                            onClick={closeInfinityAI}
                            className="flex-1 bg-[#071A2F] hover:bg-[#0B2748] text-white py-2 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wider text-center transition-all shadow-2xs active:scale-95"
                          >
                            CUSTOMIZE →
                          </Link>
                          <Link
                            to={`/product/${pid}`}
                            onClick={closeInfinityAI}
                            className="p-2 rounded-xl bg-[#FAF8F4] hover:bg-gray-100 text-[#071A2F] border border-[#071A2F]/10 text-[11px] font-bold transition-all text-center"
                            title="View details"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QUICK REFINEMENT CHIPS */}
              {result.refinementChips?.length > 0 && (
                <div className="pt-2 border-t border-[#071A2F]/8">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#687386] block mb-2">
                    Refine this search:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.refinementChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleRefinementClick(chip)}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 hover:border-[#071A2F] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* INITIAL EMPTY STATE (Before search) */}
          {!result && !loading && !error && (
            <div className="py-8 text-center space-y-4 bg-white rounded-2xl p-6 border border-[#071A2F]/8 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#071A2F] text-[#C5A46D] flex items-center justify-center mx-auto shadow-xs">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#071A2F] tracking-tight">
                  TELL US WHO YOU'RE SHOPPING FOR
                </h2>
                <p className="text-xs text-[#687386] font-normal max-w-md mx-auto mt-1 leading-relaxed">
                  Mention the person, occasion (birthday, anniversary, farewell) or your budget. Infinity AI will search our handcrafted collections.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto text-left pt-2">
                {[
                  "My girlfriend's birthday is next week and my budget is ₹1000",
                  "Gift for my best friend who loves photos",
                  "Anniversary gift for my parents under ₹1500",
                  "Something romantic under ₹500"
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(sample)}
                    className="p-2.5 rounded-xl bg-[#FAF8F4] hover:bg-white hover:border-[#071A2F] border border-[#071A2F]/8 text-xs text-[#071A2F] font-medium transition-all text-left shadow-2xs group cursor-pointer"
                  >
                    <span className="text-[#C5A46D] font-mono mr-1.5">→</span>
                    <span>"{sample}"</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Safety & Privacy Footnote */}
        <div className="px-5 sm:px-8 py-2.5 bg-white border-t border-[#071A2F]/8 flex items-center justify-between text-[11px] text-[#687386] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#C5A46D]" />
            <span>Real catalog prices • Verified before crafting</span>
          </div>
          <span className="hidden sm:inline">Pan-India Delivery</span>
        </div>

      </div>
    </div>
  );
}
