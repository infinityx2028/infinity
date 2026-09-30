import React from 'react';

/**
 * InfinityLoader — Horizontal Figure-8 (∞) Signature Brand Loading Indicator
 * 
 * Uses mathematical cubic bezier curves with pathLength="100" for resolution-independent,
 * hardware-accelerated 60fps continuous looping around the horizontal infinity loop.
 */
const InfinityLoader = ({ 
  size = 'md', 
  className = '', 
  label = null,
  dark = false,
  color = '#071A2F',
  accentColor = '#C5A46D'
}) => {
  // Dimensions for horizontal figure-8 (ratio 2:1)
  const sizeMap = {
    xs: { w: 28, h: 14, stroke: 3 },
    sm: { w: 42, h: 21, stroke: 3.5 },
    md: { w: 60, h: 30, stroke: 4 },
    lg: { w: 90, h: 45, stroke: 4.5 },
    xl: { w: 120, h: 60, stroke: 5 }
  };

  const current = sizeMap[size] || sizeMap.md;
  const strokeColor = dark ? '#FFFFFF' : color;
  const glowColor = accentColor;

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg 
        viewBox="0 0 100 50" 
        width={current.w} 
        height={current.h}
        className="overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Gradient that moves smoothly across the stroke */}
          <linearGradient id="infinityLoopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} />
            <stop offset="50%" stopColor={glowColor} />
            <stop offset="100%" stopColor={strokeColor} />
          </linearGradient>

          <filter id="infinityGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Static Faint Track of the Horizontal 8 */}
        <path
          d="M 50,25 C 36,10 14,10 14,25 C 14,40 36,40 50,25 C 64,10 86,10 86,25 C 86,40 64,40 50,25 Z"
          fill="none"
          stroke={dark ? 'rgba(255,255,255,0.15)' : 'rgba(7,26,47,0.12)'}
          strokeWidth={current.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. Active Continuous Horizontal 8 Animated Trace */}
        <path
          d="M 50,25 C 36,10 14,10 14,25 C 14,40 36,40 50,25 C 64,10 86,10 86,25 C 86,40 64,40 50,25 Z"
          fill="none"
          stroke="url(#infinityLoopGradient)"
          strokeWidth={current.stroke + 0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
          strokeDasharray="34 66"
          className="animate-infinity-trace"
          style={{
            filter: 'drop-shadow(0 0 2px rgba(197,164,109,0.35))'
          }}
        />
      </svg>

      {label && (
        <span className={`text-[10px] sm:text-xs font-semibold tracking-wider mt-2 uppercase ${
          dark ? 'text-white/80' : 'text-[#687386]'
        }`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default InfinityLoader;
