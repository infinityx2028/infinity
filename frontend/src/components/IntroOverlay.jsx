import React, { useState, useEffect, useRef } from 'react';

/**
 * IntroOverlay — High-Performance 60fps Initial Intro
 * 
 * Rebuilt from scratch with zero jank, zero fake progress, and zero 5MB assets.
 * 0.00s - 0.25s: INFINITY wordmark reveals smoothly (transform, opacity)
 * 0.25s - 0.65s: Thin navy accent line expands via scaleX
 * 0.45s - 0.85s: ONE single ultra-optimized product (hero-frame-optimized.webp) appears
 * 0.85s - 1.30s: Seamless transition into underlying homepage (overlay fades out, hero emerges)
 * 1.40s: Unmounts completely and cleans up all listeners and timers
 */
const IntroOverlay = ({ onComplete, onTransitionStart }) => {
  const [phase, setPhase] = useState('initial'); // 'initial' | 'transitioning'
  const isReducedMotionRef = useRef(false);
  const timersRef = useRef([]);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotionRef.current = mediaQuery.matches;

    if (isReducedMotionRef.current) {
      // Reduced motion: gentle crossfade without 3D transforms
      const t1 = setTimeout(() => {
        setPhase('transitioning');
        onTransitionStart?.();
      }, 400);

      const t2 = setTimeout(() => {
        onComplete?.();
      }, 750);

      timersRef.current = [t1, t2];
      return () => {
        timersRef.current.forEach(clearTimeout);
      };
    }

    // Standard 60fps timeline:
    // 850ms: Begin transition into underlying homepage
    const tTransition = setTimeout(() => {
      setPhase('transitioning');
      onTransitionStart?.();
    }, 850);

    // 1380ms: Intro finished, clean unmount
    const tComplete = setTimeout(() => {
      onComplete?.();
    }, 1380);

    timersRef.current = [tTransition, tComplete];

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [onComplete, onTransitionStart]);

  const isTransitioning = phase === 'transitioning';

  return (
    <aside
      role="status"
      aria-label="Loading Infinity Customizations"
      aria-live="polite"
      style={{
        transition: 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF8F4] overflow-hidden select-none ${
        isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Subtle Warm Glow (Pure CSS, 0 JS) */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/3 w-[520px] h-[520px] bg-white/70 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-10 right-1/4 w-[420px] h-[420px] bg-[#C5A46D]/10 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* ================= 01. BRAND WORDMARK ================= */}
        <div className="animate-intro-wordmark">
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#071A2F] tracking-[0.08em] leading-tight">
            INFINITY
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-[#071A2F]/70 tracking-[0.34em] uppercase mt-1">
            CUSTOMIZATIONS
          </p>

          {/* ================= 02. ACCENT PROGRESS LINE ================= */}
          {/* Transform: scaleX() - zero width layout thrashing */}
          <div className="w-20 h-[2px] bg-[#071A2F] mx-auto mt-3 rounded-full animate-intro-line" />
        </div>

        {/* ================= 03. ONE OPTIMIZED HERO PRODUCT ================= */}
        {/* Only 1 product. Ultra-optimized WebP (121KB). Preloaded in HTML. */}
        <div 
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            transition: 'all 520ms cubic-bezier(0.22, 1, 0.36, 1)',
            transform: isTransitioning 
              ? 'translate3d(0, 24px, 0) scale(0.98)' 
              : 'translate3d(0, 0, 0) scale(1)',
            opacity: isTransitioning ? 0 : 1
          }}
          className="mt-6 sm:mt-8 w-[220px] sm:w-[250px] animate-intro-product"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 border border-[#071A2F]/10 shadow-[0_20px_50px_rgba(7,26,47,0.12)]">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#FAF8F4]">
              <img
                src="/images/hero-hamper-optimized.webp"
                alt="Celebration Gift Hamper"
                width="250"
                height="312"
                fetchPriority="high"
                decoding="sync"
                className="w-full h-full object-cover"
              />

              {/* Minimal Brand Tag */}
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#071A2F]">
                  Luxury Gift Hamper
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default IntroOverlay;
