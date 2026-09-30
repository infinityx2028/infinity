import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIntro } from '../contexts/IntroContext';

const HERO_PRODUCTS = [
  {
    id: 'ham1',
    name: 'Celebration Gift Hamper',
    category: 'Curated Gift Set',
    subtitle: 'Handcrafted Keepsake Box',
    price: 'From ₹599',
    offer: 'Gift Ready',
    image: '/images/hero-hamper-optimized.webp',
    link: '/product/ham1',
    badge: 'Luxury Box'
  },
  {
    id: 'f1',
    name: 'Classic Tabletop Frame',
    category: 'Handcrafted Frame',
    subtitle: 'Archival Luster Print',
    price: 'From ₹199',
    offer: 'Free Proofing',
    image: '/images/hero-frame-optimized.webp',
    link: '/product/f1',
    badge: 'Best Seller'
  },
  {
    id: 'm3',
    name: 'Personalized Magazine',
    category: 'Custom Story Book',
    subtitle: '12-Page Keepsake Edition',
    price: 'From ₹499',
    offer: 'Design Review',
    image: '/images/hero-mag-optimized.webp',
    link: '/product/m3',
    badge: '12-Page Edition'
  },
  {
    id: 'case1',
    name: 'Custom Phone Case',
    category: 'Daily Essential',
    subtitle: 'All Phone Models Supported',
    price: 'From ₹299',
    offer: 'Impact Proof',
    image: '/images/hero-case-optimized.webp',
    link: '/product/case1',
    badge: 'Custom Print'
  },
  {
    id: 'pol2',
    name: 'Keepsake Polaroids',
    category: 'Archival Prints',
    subtitle: 'Tangible Memories to Hold',
    price: 'From ₹5 / photo',
    offer: 'Min 8 prints',
    image: '/images/hero-pol-optimized.webp',
    link: '/product/pol2',
    badge: 'Fan Favorite'
  }
];

const Hero3D = ({ isIntroActive: propIsIntroActive, introPhase: propIntroPhase }) => {
  const introContext = useIntro();
  const isIntroActive = propIsIntroActive !== undefined ? propIsIntroActive : Boolean(introContext?.isIntroActive);
  const introPhase = propIntroPhase !== undefined ? propIntroPhase : (introContext?.introPhase || 'completed');
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredSideIndex, setHoveredSideIndex] = useState(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const containerRef = useRef(null);
  const hoverIntentTimerRef = useRef(null);
  const autoRotateTimerRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const isDocumentHiddenRef = useRef(false);
  const rafIdRef = useRef(null);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const listener = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Listen to tab visibility to pause auto-rotation when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Auto-scroll every 1.5 seconds — only starts AFTER intro is completed
  useEffect(() => {
    if (isReducedMotion || isIntroActive || introPhase === 'initial') {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
      return;
    }

    if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);

    autoRotateTimerRef.current = setInterval(() => {
      if (!isDocumentHiddenRef.current) {
        setActiveIndex(prev => (prev + 1) % HERO_PRODUCTS.length);
      }
    }, 1500);

    return () => {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    };
  }, [isReducedMotion, isIntroActive, introPhase]);

  const resetAutoScroll = () => {
    if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    if (!isReducedMotion && !isIntroActive) {
      autoRotateTimerRef.current = setInterval(() => {
        if (!isDocumentHiddenRef.current) {
          setActiveIndex(prev => (prev + 1) % HERO_PRODUCTS.length);
        }
      }, 1500);
    }
  };

  // 60fps Hardware-Accelerated Mouse Parallax (ZERO React re-renders)
  const handleMouseMove = (e) => {
    if (isReducedMotion || window.innerWidth < 1024 || !containerRef.current) return;
    if (rafIdRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2;

      // Restrained micro-movement: X: ±4px, Y: ±3px, Rotations: ±1.5deg
      const px = (x * 4).toFixed(1);
      const py = (y * 3).toFixed(1);
      const rx = (-y * 1.2).toFixed(1);
      const ry = (x * 1.5).toFixed(1);

      containerRef.current.style.setProperty('--hero-px', `${px}px`);
      containerRef.current.style.setProperty('--hero-py', `${py}px`);
      containerRef.current.style.setProperty('--hero-rx', `${rx}deg`);
      containerRef.current.style.setProperty('--hero-ry', `${ry}deg`);
    });
  };

  const handleContainerMouseLeave = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.style.setProperty('--hero-px', '0px');
      containerRef.current.style.setProperty('--hero-py', '0px');
      containerRef.current.style.setProperty('--hero-rx', '0deg');
      containerRef.current.style.setProperty('--hero-ry', '0deg');
    }
    if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current);
    setHoveredSideIndex(null);
  };

  // Hover Intent: 140ms delay before rotating to front to prevent accidental cursor flickers
  const handleCardMouseEnter = (index) => {
    if (index === activeIndex) return;
    setHoveredSideIndex(index);

    if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current);

    hoverIntentTimerRef.current = setTimeout(() => {
      setActiveIndex(index);
      setHoveredSideIndex(null);
      resetAutoScroll();
    }, 140);
  };

  const handleCardMouseLeave = () => {
    setHoveredSideIndex(null);
    if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current);
  };

  // Click on active card goes to product; click on side card immediately brings it forward
  const handleCardClick = (e, index) => {
    if (index !== activeIndex) {
      e.preventDefault();
      if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current);
      setActiveIndex(index);
      setHoveredSideIndex(null);
      resetAutoScroll();
    }
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        setActiveIndex(prev => (prev + 1) % HERO_PRODUCTS.length);
      } else {
        setActiveIndex(prev => (prev - 1 + HERO_PRODUCTS.length) % HERO_PRODUCTS.length);
      }
      resetAutoScroll();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Compute 3D Transform, Z-Index, and Depth Style for each card in the rotating stack
  const getCardStyle = (index) => {
    const total = HERO_PRODUCTS.length;
    const diff = (index - activeIndex + total) % total;
    const isHoveredSide = hoveredSideIndex === index;

    if (isReducedMotion) {
      return {
        zIndex: diff === 0 ? 40 : 10,
        opacity: diff === 0 ? 1 : 0,
        transform: diff === 0 ? 'scale(1)' : 'scale(0.92)',
        pointerEvents: diff === 0 ? 'auto' : 'none',
        transition: 'opacity 0.4s ease, transform 0.4s ease'
      };
    }

    // During initial intro phase: hide secondary products to avoid 5 simultaneous decodes/animations
    const isIntroInitial = isIntroActive && introPhase === 'initial';

    if (diff === 0) {
      // ===== FRONT (ACTIVE) CARD =====
      return {
        zIndex: 40,
        opacity: 1,
        transform: 'translate3d(var(--hero-px, 0px), var(--hero-py, 0px), 85px) rotateY(var(--hero-ry, 0deg)) rotateX(var(--hero-rx, 0deg)) scale(1)',
        boxShadow: '0 30px 70px rgba(7, 26, 47, 0.22), 0 10px 25px rgba(7, 26, 47, 0.1)',
        pointerEvents: 'auto',
        transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
      };
    } else if (diff === 1) {
      // ===== RIGHT / BACK CARD =====
      const liftY = isHoveredSide ? -4 : 0;
      const liftScale = isHoveredSide ? 1.015 : 1;
      return {
        zIndex: 25,
        opacity: isIntroInitial ? 0 : 0.86,
        transform: isIntroInitial 
          ? 'scale(0.85) translate3d(80px, 20px, -100px)' 
          : `translate3d(calc(125px + var(--hero-px, 0px) * 0.4), calc(12px + ${liftY}px + var(--hero-py, 0px) * 0.4), -75px) rotateY(-8.5deg) scale(${0.91 * liftScale})`,
        boxShadow: '0 18px 40px rgba(7, 26, 47, 0.12)',
        pointerEvents: isIntroInitial ? 'none' : 'auto',
        transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
      };
    } else if (diff === 2) {
      // ===== FAR BACK / TOP CENTER CARD =====
      const liftY = isHoveredSide ? -4 : 0;
      return {
        zIndex: 10,
        opacity: isIntroInitial ? 0 : 0.68,
        transform: isIntroInitial 
          ? 'scale(0.8) translate3d(0, -10px, -180px)' 
          : `translate3d(calc(var(--hero-px, 0px) * 0.2), calc(-30px + ${liftY}px + var(--hero-py, 0px) * 0.2), -150px) rotateY(0deg) scale(0.83)`,
        boxShadow: '0 10px 25px rgba(7, 26, 47, 0.08)',
        pointerEvents: isIntroInitial ? 'none' : 'auto',
        transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
      };
    } else {
      // ===== LEFT / BACK CARD (diff === 3 or 4) =====
      const liftY = isHoveredSide ? -4 : 0;
      const liftScale = isHoveredSide ? 1.015 : 1;
      return {
        zIndex: 25,
        opacity: isIntroInitial ? 0 : 0.86,
        transform: isIntroInitial 
          ? 'scale(0.85) translate3d(-80px, 20px, -100px)' 
          : `translate3d(calc(-125px + var(--hero-px, 0px) * 0.4), calc(12px + ${liftY}px + var(--hero-py, 0px) * 0.4), -75px) rotateY(8.5deg) scale(${0.91 * liftScale})`,
        boxShadow: '0 18px 40px rgba(7, 26, 47, 0.12)',
        pointerEvents: isIntroInitial ? 'none' : 'auto',
        transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
      };
    }
  };

  // Sequential Reveal Styling during Intro
  const isIntroInitial = isIntroActive && introPhase === 'initial';

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleContainerMouseLeave}
      className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center bg-[#FAF8F4] overflow-hidden py-14 lg:py-20 border-b border-[#071A2F]/6 select-none"
    >
      {/* Warm Ambient Studio Lighting */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/3 w-[520px] h-[520px] bg-white/70 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-10 right-1/4 w-[440px] h-[440px] bg-[#C5A46D]/8 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ================= LEFT COLUMN: CLARITY FIRST TYPOGRAPHY & CTAS ================= */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center text-left">
            
            {/* Eyebrow */}
            <div 
              style={{
                transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isIntroActive ? '150ms' : '0ms'
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#071A2F]/10 shadow-[0_2px_8px_rgba(7,26,47,0.04)] mb-6 w-fit ${
                isIntroInitial ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]"></span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#071A2F]">
                PERSONALIZED • MADE FOR YOU
              </span>
            </div>

            {/* Main Headline */}
            <h1 
              style={{
                transition: 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1), transform 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isIntroActive ? '200ms' : '0ms'
              }}
              className={`text-4xl sm:text-5xl lg:text-[62px] xl:text-[72px] font-extrabold tracking-tight text-[#071A2F] leading-[1.04] mb-6 ${
                isIntroInitial ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
              }`}
            >
              YOUR MEMORIES. <br />
              <span className="text-[#123C69]">MADE PERSONAL.</span>
            </h1>

            {/* Supporting Text */}
            <p 
              style={{
                transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isIntroActive ? '280ms' : '0ms'
              }}
              className={`text-base sm:text-lg text-[#687386] font-normal leading-relaxed max-w-lg mb-8 ${
                isIntroInitial ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              Turn your favorite photos and moments into personalized frames, apparel, polaroids, magazines and meaningful gifts.
            </p>

            {/* CTAs */}
            <div 
              style={{
                transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isIntroActive ? '350ms' : '0ms'
              }}
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10 ${
                isIntroInitial ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
              }`}
            >
              <Link
                to="/shop/frames"
                className="group inline-flex items-center justify-center gap-3 bg-[#071A2F] hover:bg-[#0B2748] text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-xl hover:shadow-[#071A2F]/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>SHOP PERSONALIZED GIFTS</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#collections-section"
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white text-[#071A2F] border border-[#071A2F]/20 hover:border-[#071A2F] px-7 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-200"
              >
                <span>EXPLORE COLLECTIONS</span>
                <span className="text-[#C5A46D]">→</span>
              </a>
            </div>

            {/* Truthful Trust Signals */}
            <div 
              style={{
                transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isIntroActive ? '420ms' : '0ms'
              }}
              className={`pt-6 border-t border-[#071A2F]/10 grid grid-cols-3 gap-4 ${
                isIntroInitial ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[#071A2F] font-bold text-xs sm:text-sm">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Easy Personalization</span>
                </div>
                <span className="text-[11px] text-[#6B7280] mt-0.5">Send via WhatsApp</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[#071A2F] font-bold text-xs sm:text-sm">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Made With Care</span>
                </div>
                <span className="text-[11px] text-[#6B7280] mt-0.5">Verified before print</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[#071A2F] font-bold text-xs sm:text-sm">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Secure Checkout</span>
                </div>
                <span className="text-[11px] text-[#6B7280] mt-0.5">Fast delivery in India</span>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE 3D PRODUCT CAROUSEL STACK ================= */}
          <div 
            className="lg:col-span-6 xl:col-span-7 relative flex flex-col items-center justify-center min-h-[520px] sm:min-h-[580px] lg:min-h-[630px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            
            {/* 3D Floating Stage with Studio Depth (Perspective: 1400px) */}
            <div 
              style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
              className="relative w-full max-w-[540px] h-[470px] sm:h-[510px] lg:h-[530px] flex items-center justify-center"
            >
              {HERO_PRODUCTS.map((product, index) => {
                const isActive = index === activeIndex;
                const style = getCardStyle(index);

                return (
                  <div
                    key={product.id}
                    style={style}
                    onMouseEnter={() => handleCardMouseEnter(index)}
                    onMouseLeave={handleCardMouseLeave}
                    onClick={(e) => handleCardClick(e, index)}
                    className={`absolute w-[280px] sm:w-[320px] lg:w-[340px] bg-white rounded-3xl p-3.5 sm:p-4 border-2 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-white ring-1 ring-[#071A2F]/10' 
                        : 'border-white/80 hover:border-[#071A2F]/20'
                    }`}
                  >
                    {/* Product Image Container with Reserved Dimensions */}
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF8F4] border border-[#071A2F]/10 group">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        width="340"
                        height="425"
                        loading={isActive ? "eager" : "lazy"}
                        fetchPriority={isActive ? "high" : "low"}
                        decoding={isActive ? "sync" : "async"}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                      />

                      {/* Scrim Overlay when inactive for depth layering */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-[#071A2F]/15 backdrop-blur-[0.5px] transition-opacity" />
                      )}

                      {/* Corner Badge */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#071A2F]">
                          {product.badge}
                        </span>
                      </div>

                      {/* Bottom Info Ribbon */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#071A2F]/90 via-[#071A2F]/40 to-transparent p-4 text-white">
                        <p className="text-[10px] sm:text-[11px] font-medium text-white/80">{product.subtitle}</p>
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* Subtitle & Action Area Below Image */}
                    {isActive ? (
                      <div className="mt-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2 px-1">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A46D] block mb-0.5">
                              {product.category}
                            </span>
                            <h3 className="font-bold text-base text-[#071A2F] leading-tight truncate">
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-[#687386] font-normal truncate mt-0.5">
                              {product.subtitle}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-black text-base text-[#071A2F] block leading-none">
                              {product.price}
                            </span>
                            {product.offer && (
                              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                                {product.offer}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Prominent High-Contrast Navy CTA & Secondary Link */}
                        <div className="pt-1 flex flex-col gap-1.5">
                          <Link 
                            to={product.link}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-3 px-4 rounded-xl bg-[#071A2F] hover:bg-[#0B2748] active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                          >
                            <span>CUSTOMIZE & BUY</span>
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                          
                          <Link
                            to={product.link}
                            onClick={(e) => e.stopPropagation()}
                            className="text-center text-[11px] font-semibold text-[#687386] hover:text-[#071A2F] transition-colors py-0.5 cursor-pointer"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 px-1 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-black text-sm text-[#071A2F]">{product.price}</span>
                          <span className="block text-[10px] text-[#687386]">{product.category}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#123C69] hover:underline flex items-center gap-1">
                          <span>Click to view</span>
                          <span>→</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls & Discoverability: Chevrons + 01 / 05 Indicator + Dots */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8 z-30">
              <button
                type="button"
                onClick={() => {
                  setActiveIndex(prev => (prev - 1 + HERO_PRODUCTS.length) % HERO_PRODUCTS.length);
                  resetAutoScroll();
                }}
                className="w-10 h-10 rounded-full bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white shadow-xs border border-[#071A2F]/10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Previous product"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* 01 / 05 Step Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-[#071A2F]/10 shadow-xs text-xs font-mono font-bold text-[#071A2F]">
                <span>0{activeIndex + 1}</span>
                <span className="text-[#687386]/60">/</span>
                <span className="text-[#687386]">0{HERO_PRODUCTS.length}</span>
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {HERO_PRODUCTS.map((prod, idx) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setActiveIndex(idx);
                      resetAutoScroll();
                    }}
                    aria-label={`View ${prod.name}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex 
                        ? 'w-7 bg-[#071A2F]' 
                        : 'w-2.5 bg-[#071A2F]/20 hover:bg-[#071A2F]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveIndex(prev => (prev + 1) % HERO_PRODUCTS.length);
                  resetAutoScroll();
                }}
                className="w-10 h-10 rounded-full bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white shadow-xs border border-[#071A2F]/10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Next product"
              >
                <ChevronRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero3D;
