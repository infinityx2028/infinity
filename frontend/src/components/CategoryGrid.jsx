import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const REAL_CATEGORIES = [
  {
    id: 'frames',
    name: 'Photo Frames',
    subtitle: 'Classic wooden & milestone prints',
    count: 'From ₹149',
    image: '/images/4 x 6 black frame 199.jpg',
    desktopSpan: 'lg:col-span-8 lg:row-span-2 lg:aspect-auto',
    isHeroFeature: true,
  },
  {
    id: 'apparel',
    name: 'Custom T-Shirts',
    subtitle: 'Hand-printed cotton & collared tees',
    count: 'From ₹199',
    image: '/images/CUSTOMIZED T-SHIRTS 499.jpg',
    desktopSpan: 'lg:col-span-4 lg:aspect-auto',
  },
  {
    id: 'memories',
    name: 'Polaroids & Books',
    subtitle: 'Keepsake prints made to cherish',
    count: 'From ₹5 / photo',
    image: '/images/POLAROIDS MEDIUM 8 PER EACH.jpg',
    desktopSpan: 'lg:col-span-4 lg:aspect-auto',
  },
  {
    id: 'magazines',
    name: 'Personalized Magazines',
    subtitle: 'Your story designed & printed',
    count: '12-Page Edition',
    image: '/images/MAG design2.jpg',
    desktopSpan: 'lg:col-span-4',
  },
  {
    id: 'essentials',
    name: 'Phone Cases',
    subtitle: 'Protective custom prints for all models',
    count: 'From ₹299',
    image: '/images/CUSTOMIZED PHONE CASE P2.jpg',
    desktopSpan: 'lg:col-span-4',
  },
  {
    id: 'hampers',
    name: 'Luxury Hampers',
    subtitle: 'Curated celebration combo boxes',
    count: 'From ₹599',
    image: '/images/HAMPER(1).jpg',
    desktopSpan: 'lg:col-span-4',
  },
  {
    id: 'flowers',
    name: 'Flowers & Bouquets',
    subtitle: 'Everlasting blooms with message cards',
    count: 'From ₹199',
    image: '/images/real flower boq 249.jpg',
    desktopSpan: 'lg:col-span-6 lg:aspect-[16/9]',
  },
  {
    id: 'vintage',
    name: 'Vintage Collection',
    subtitle: 'Retro wax letters & nostalgic frames',
    count: 'From ₹119',
    image: '/images/vintage frame.jpg',
    desktopSpan: 'lg:col-span-6 lg:aspect-[16/9]',
  },
];

const CategoryGrid = () => {
  return (
    <section id="collections-section" className="pt-6 pb-8 sm:py-16 md:py-24 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* MOBILE VIEW: Compact SHOP BY CATEGORY Horizontal Carousel (< lg) */}
        <div className="lg:hidden">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#687386] block mb-0.5">
                Curated Collections
              </span>
              <h2 className="text-xl font-extrabold text-[#071A2F] tracking-tight">
                SHOP BY CATEGORY
              </h2>
            </div>
            <Link 
              to="/shop"
              className="text-xs font-bold text-[#071A2F] hover:text-[#C5A46D] transition-colors pb-0.5"
            >
              All →
            </Link>
          </div>

          {/* Compact Horizontal Carousel: ~110px wide x 135px tall, ~3 cards visible at 390px */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 pt-1 flex gap-2.5">
            {REAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.id}`}
                className="group relative flex-shrink-0 w-[110px] h-[136px] rounded-2xl overflow-hidden bg-[#FAF8F4] border border-[#071A2F]/8 shadow-[0_3px_12px_rgba(7,26,47,0.05)] active:scale-[0.97] transition-all flex flex-col justify-end p-2.5 select-none"
              >
                <div className="absolute inset-0 w-full h-full">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071A2F]/90 via-[#071A2F]/30 to-transparent" />
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] font-bold text-[#C5A46D] block leading-none mb-1">
                    {cat.count}
                  </span>
                  <h3 className="text-[12px] font-extrabold text-white leading-tight line-clamp-2">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW: Full Editorial Grid (lg+) */}
        <div className="hidden lg:block">
          {/* Editorial Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#687386] mb-2 block">
                Browse by Category
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#071A2F] tracking-tight">
                WHAT ARE YOU LOOKING FOR?
              </h2>
            </div>
            <p className="text-xs sm:text-base text-[#687386] max-w-md font-normal leading-relaxed">
              Find the perfect personalized gift. Handcrafted pieces created around the moments you never want to forget.
            </p>
          </div>

          {/* Quick Category Chips */}
          <div className="w-full overflow-hidden mb-8 sm:mb-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide">
              {[
                { label: 'All Gifts', path: '/shop' },
                { label: 'Photo Frames', path: '/shop/frames' },
                { label: 'Polaroids', path: '/shop/memories' },
                { label: 'Custom Apparel', path: '/shop/apparel' },
                { label: 'Magazines', path: '/shop/magazines' },
                { label: 'Phone Cases', path: '/shop/essentials' },
                { label: 'Hampers', path: '/shop/hampers' },
                { label: 'Flowers', path: '/shop/flowers' },
                { label: 'Vintage', path: '/shop/vintage' }
              ].map((chip, idx) => (
                <Link
                  key={idx}
                  to={chip.path}
                  className="flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap bg-[#FAF8F4] hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 hover:border-[#071A2F] transition-all duration-200 shadow-2xs hover:shadow-xs min-h-[38px]"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Category Grid: Consistent 2-column aspect-[4/5] on mobile with 3D tactile depth */}
          <div style={{ perspective: '800px' }} className="grid grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-6">
            {REAL_CATEGORIES.map((col) => (
              <Link
                key={col.id}
                to={`/shop/${col.id}`}
                style={{ transformStyle: 'preserve-3d' }}
                className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF8F4] border border-[#071A2F]/8 shadow-[0_4px_16px_rgba(7,26,47,0.04)] hover:shadow-[0_16px_36px_rgba(7,26,47,0.08)] active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between aspect-[4/5] ${col.desktopSpan}`}
              >
                {/* Image layer with depth zoom and forward motion on tap */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] group-active:scale-[1.04] transition-transform duration-500 ease-out"
                  />
                  
                  {/* Controlled Dark Gradient Overlay at bottom for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071A2F]/95 via-[#071A2F]/35 to-transparent" />
                </div>

                {/* Corner Badge & Clean Circular Arrow */}
                <div className="relative z-10 p-3 sm:p-5 flex items-center justify-between">
                  <span className="text-[9px] sm:text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[#071A2F] shadow-xs">
                    {col.count}
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md text-[#071A2F] flex items-center justify-center group-hover:bg-[#071A2F] group-hover:text-white transition-all duration-300 shadow-xs flex-shrink-0">
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1 group-active:-translate-y-1 transition-transform" />
                  </div>
                </div>

                {/* Bottom Content Typography (All text safely within card boundaries) */}
                <div className="relative z-10 p-3 sm:p-5 text-white">
                  <h3 className={`font-bold tracking-tight text-white mb-0.5 leading-snug line-clamp-2 ${
                    col.isHeroFeature ? 'text-sm sm:text-xl lg:text-2xl' : 'text-xs sm:text-lg'
                  }`}>
                    {col.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/80 font-light line-clamp-2 leading-tight">
                    {col.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Collections Button */}
          <div className="mt-10 sm:mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#FAF8F4] hover:bg-white text-[#071A2F] border border-[#071A2F]/15 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs hover:shadow-md min-h-[44px]"
            >
              <span>VIEW ALL COLLECTIONS</span>
              <span className="text-[#C5A46D]">→</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;
