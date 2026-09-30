import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, X, RefreshCw, CheckCircle2, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { extractIntent, getIntentTokens, getGiftRecommendations } from '../../services/giftAssistantService.js';
import { API_BASE_URL } from '../../services/api.js';
import { products as fallbackProducts } from '../../data.js';

const QUICK_SUGGESTIONS = [
  { label: 'Birthday', query: 'Birthday gift under ₹1000' },
  { label: 'Anniversary', query: 'Anniversary gift for couple' },
  { label: 'Best Friend', query: 'Gift for best friend who loves photos' },
  { label: 'Partner', query: 'Romantic gift for my partner under ₹1200' },
  { label: 'Parents', query: 'Anniversary gift for parents under ₹1500' },
  { label: 'Under ₹500', query: 'Personalized gift under ₹500' },
  { label: 'Under ₹1000', query: 'Customized gift under ₹1000' },
  { label: 'Surprise Me ✨', query: 'surprise-me' }
];

export default function InfinityAISection() {
  const [inputVal, setInputVal] = useState('');
  const [intentTokens, setIntentTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [catalogCache, setCatalogCache] = useState([]);
  const [clarification, setClarification] = useState(null);
  const resultsRef = useRef(null);

  // Load catalog cache once for instant deterministic recommendations
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setCatalogCache(data);
          }
        }
      } catch (e) {
        if (isMounted) setCatalogCache(fallbackProducts);
      }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  // Real-time Magic Intent Token detection as user types
  useEffect(() => {
    if (!inputVal.trim()) {
      setIntentTokens([]);
      return;
    }
    const intent = extractIntent(inputVal);
    const tokens = getIntentTokens(intent);
    setIntentTokens(tokens);
  }, [inputVal]);

  const runRecommendation = async (text, refinement = null) => {
    const clean = (text || inputVal).trim();
    if (!clean && !refinement) return;

    setLoading(true);
    setClarification(null);

    try {
      const response = await getGiftRecommendations({
        query: clean === 'surprise-me' ? 'Best personalized gift' : clean,
        refinement: clean === 'surprise-me' ? 'surprise-me' : refinement,
        currentIntent: result?.intent || null,
        cachedProducts: catalogCache
      });

      if (response && response.success) {
        setResult(response);
        if (response.needsClarification && response.clarificationQuestion) {
          setClarification({
            question: response.clarificationQuestion,
            options: response.quickOptions || ["Under ₹500", "₹500–₹1000", "₹1000–₹2000", "No fixed budget"]
          });
        }
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }
    } catch (err) {
      console.warn('Infinity AI error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (inputVal.trim()) {
      runRecommendation(inputVal);
    }
  };

  const handleSuggestionClick = (item) => {
    if (item.query === 'surprise-me') {
      setInputVal('Surprise gift from top collections');
      runRecommendation('surprise-me', 'surprise-me');
    } else {
      setInputVal(item.query);
      runRecommendation(item.query);
    }
  };

  const handleRemoveToken = (tokenToRemove) => {
    let updatedText = inputVal;
    if (tokenToRemove.type === 'budget') {
      updatedText = updatedText.replace(/(?:under|below|less than|within)?\s*(?:₹|rs\.?|inr)?\s*\d{2,5}/gi, '').trim();
    } else {
      const reg = new RegExp(tokenToRemove.label, 'gi');
      updatedText = updatedText.replace(reg, '').trim();
    }
    setInputVal(updatedText);
    if (updatedText) {
      runRecommendation(updatedText);
    } else {
      setResult(null);
    }
  };

  const handleRefine = (refineType) => {
    let key = '';
    const clean = refineType.toLowerCase();
    if (clean.includes('emotional') || clean.includes('personal')) key = 'more-emotional';
    else if (clean.includes('premium')) key = 'more-premium';
    else if (clean.includes('budget') || clean.includes('500')) key = 'lower-budget';
    else if (clean.includes('photo')) key = 'photo-focused';
    else if (clean.includes('different') || clean.includes('show more')) key = 'surprise-me';

    runRecommendation(inputVal, key || refineType);
  };

  const handleClarificationSelect = (opt) => {
    const newQuery = `${inputVal} ${opt}`.trim();
    setInputVal(newQuery);
    runRecommendation(newQuery);
  };

  const handleReset = () => {
    setInputVal('');
    setResult(null);
    setClarification(null);
    setIntentTokens([]);
  };

  return (
    <section 
      id="infinity-ai-concierge" 
      className="py-8 sm:py-12 bg-white border-b border-[#071A2F]/6 relative select-none scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Concierge Editorial Frame */}
        <div className="relative rounded-3xl bg-[#FAF8F4] border border-[#071A2F]/8 p-5 sm:p-8 overflow-hidden shadow-[0_4px_24px_rgba(7,26,47,0.03)]">
          
          {/* Subtle champagne radial aura */}
          <div 
            aria-hidden="true" 
            className="absolute -top-16 -right-16 w-56 h-56 bg-[#C5A46D]/10 rounded-full blur-3xl pointer-events-none" 
          />

          {/* Eyebrow & Brand */}
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#C5A46D] border border-[#C5A46D]/20 shadow-2xs">
              <Sparkles size={12} className="text-[#C5A46D]" />
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#071A2F]">
                INFINITY AI • PERSONAL CONCIERGE
              </span>
            </div>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-[#687386] hover:text-[#071A2F] transition-colors cursor-pointer"
              >
                Reset Search
              </button>
            )}
          </div>

          {/* Headline (Part 7: WHO ARE WE GIFTING TODAY?) */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071A2F] tracking-tight mb-1 leading-tight">
            WHO ARE WE <br className="sm:hidden" />
            <span className="text-[#123C69]">GIFTING TODAY?</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#687386] font-normal max-w-md leading-relaxed mb-4">
            Describe the person, occasion or your budget. Infinity AI will search our real collection.
          </p>

          {/* Primary Command Field */}
          <form onSubmit={handleSubmit} className="mb-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-1.5 rounded-2xl border border-[#071A2F]/12 shadow-xs focus-within:border-[#071A2F]/60 transition-all">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Birthday gift for my best friend under ₹800..."
                className="flex-1 h-12 px-3.5 rounded-xl text-xs sm:text-sm text-[#071A2F] placeholder:text-[#687386]/60 font-medium focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || loading}
                className="h-12 px-5 rounded-xl bg-[#071A2F] hover:bg-[#0B2748] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 flex-shrink-0 disabled:cursor-not-allowed"
              >
                <span>FIND THEIR GIFT</span>
                <ArrowRight size={13} className="text-[#C5A46D]" />
              </button>
            </div>
          </form>

          {/* AI Magic Interaction: Detected Intent Tokens (Part 7) */}
          {intentTokens.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3.5 pt-1 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687386]">
                Identified:
              </span>
              {intentTokens.map((tok, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#071A2F] border border-[#071A2F]/15 shadow-2xs text-[11px] font-bold animate-in zoom-in-95 duration-150"
                >
                  <span>{tok.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveToken(tok)}
                    aria-label={`Remove ${tok.label}`}
                    className="hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Compact Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#687386] mr-1 hidden sm:inline">
              Quick:
            </span>
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 text-[11px] font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* SKELETON LOADING STATE */}
          {loading && (
            <div className="mt-6 pt-5 border-t border-[#071A2F]/8 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-[#071A2F]">
                <RefreshCw size={13} className="animate-spin text-[#C5A46D]" />
                <span>Finding the right gifts for you...</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-3 border border-[#071A2F]/8 animate-pulse space-y-2.5">
                    <div className="w-full aspect-square bg-gray-100 rounded-xl" />
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLARIFICATION FOLLOW-UP (Part 7: Ask only ONE question at a time) */}
          {clarification && !loading && (
            <div className="mt-5 p-4 rounded-2xl bg-white border border-[#C5A46D]/30 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A46D]" />
                <p className="text-xs sm:text-sm font-bold text-[#071A2F]">
                  {clarification.question}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {clarification.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleClarificationSelect(opt)}
                    className="px-3 py-1.5 rounded-full bg-[#FAF8F4] hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RECOMMENDATION RESULTS CONTAINER (Part 7) */}
          {result && !loading && result.products?.length > 0 && (
            <div ref={resultsRef} className="mt-6 pt-5 border-t border-[#071A2F]/8 space-y-4 animate-in fade-in duration-300">
              
              {/* Dynamic Contextual Reply */}
              <div className="flex items-start justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#071A2F]/8 shadow-xs">
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#C5A46D] block mb-0.5">
                    Concierge Selected
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#071A2F] leading-snug">
                    {result.reply}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#687386] whitespace-nowrap pt-0.5">
                  {result.products.length} matches
                </span>
              </div>

              {/* 1. BEST MATCH HERO CARD */}
              {result.products[0] && (() => {
                const best = result.products[0];
                const bestId = best._id || best.id;
                const bestImg = best.images?.[0] || best.image || '/images/4 x 6 black frame 199.jpg';
                return (
                  <div className="relative rounded-2xl bg-white border border-[#071A2F]/15 p-4 sm:p-5 shadow-sm overflow-hidden group">
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-[#071A2F] text-[#C5A46D] font-mono text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>BEST MATCH</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Product Image */}
                      <Link 
                        to={`/product/${bestId}`}
                        className="relative w-full sm:w-44 aspect-square rounded-xl overflow-hidden bg-[#FAF8F4] flex-shrink-0"
                      >
                        <img
                          loading="lazy"
                          src={bestImg}
                          alt={best.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Info & Action */}
                      <div className="flex-1 w-full space-y-2">
                        <div>
                          <span className="text-[9.5px] uppercase font-bold text-[#C5A46D] tracking-wider block">
                            {best.categoryId || 'Personalized Gift'}
                          </span>
                          <h3 className="font-extrabold text-base sm:text-lg text-[#071A2F] leading-snug">
                            {best.name}
                          </h3>
                          <span className="text-base font-black text-[#071A2F] block mt-0.5">
                            ₹{best.price}
                          </span>
                        </div>

                        {/* Short AI Reason */}
                        <p className="text-xs text-[#687386] font-normal leading-relaxed">
                          {best.recommendationReason}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <Link
                            to={`/product/${bestId}`}
                            className="btn-physical-3d inline-flex items-center justify-center gap-1.5 bg-[#071A2F] hover:bg-[#0B2748] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs active:scale-95 transition-all"
                          >
                            <span>CUSTOMIZE THIS</span>
                            <ArrowRight size={13} className="text-[#C5A46D]" />
                          </Link>
                          <Link
                            to={`/product/${bestId}`}
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FAF8F4] hover:bg-gray-100 text-[#071A2F] border border-[#071A2F]/10 font-bold text-xs tracking-wider transition-colors"
                          >
                            VIEW DETAILS
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. COMPACT ALTERNATIVES (2-3 items) */}
              {result.products.length > 1 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#687386] block">
                    Curated Alternatives:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {result.products.slice(1, 4).map((item, idx) => {
                      const pid = item._id || item.id;
                      const img = item.images?.[0] || item.image || '/images/4 x 6 black frame 199.jpg';
                      return (
                        <div 
                          key={pid || idx} 
                          className="bg-white rounded-xl p-2.5 border border-[#071A2F]/8 flex sm:flex-col items-center sm:items-start gap-2.5 shadow-2xs hover:shadow-xs transition-all group"
                        >
                          <Link to={`/product/${pid}`} className="w-16 h-16 sm:w-full sm:aspect-square rounded-lg overflow-hidden bg-[#FAF8F4] flex-shrink-0">
                            <img src={img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </Link>
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="font-bold text-xs text-[#071A2F] truncate">
                              {item.name}
                            </h4>
                            <span className="font-black text-xs text-[#071A2F] block">
                              ₹{item.price}
                            </span>
                            <p className="text-[10.5px] text-[#687386] line-clamp-1 leading-none">
                              {item.recommendationReason}
                            </p>
                            <Link 
                              to={`/product/${pid}`} 
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#071A2F] hover:text-[#C5A46D] pt-1"
                            >
                              <span>Customize</span>
                              <ChevronRight size={11} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. QUICK REFINE BAR (Part 7) */}
              <div className="pt-2 border-t border-[#071A2F]/8">
                <div className="flex items-center gap-1.5 mb-2">
                  <SlidersHorizontal size={12} className="text-[#C5A46D]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#687386]">
                    Refine Recommendation:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'More Emotional',
                    'More Premium',
                    'Lower Budget',
                    'Photo Focused',
                    'Show Different Gifts'
                  ].map((refine, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRefine(refine)}
                      className="px-3 py-1 rounded-full bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 hover:border-[#071A2F] text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      {refine}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
