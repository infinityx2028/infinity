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
    cardClass: 'lg:col-span-8 lg:row-span-2 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto',
    isHeroFeature: true,
  },
  {
    id: 'apparel',
    name: 'Custom T-Shirts',
    subtitle: 'Hand-printed cotton & collared tees',
    count: 'From ₹199',
    image: '/images/CUSTOMIZED T-SHIRTS 499.jpg',
    cardClass: 'lg:col-span-4 aspect-[4/5] sm:aspect-[1/1] lg:aspect-auto',
  },
  {
    id: 'memories',
    name: 'Polaroids & Books',
    subtitle: 'Keepsake prints made to cherish',
    count: 'From ₹5 / photo',
    image: '/images/POLAROIDS MEDIUM 8 PER EACH.jpg',
    cardClass: 'lg:col-span-4 aspect-[4/5] sm:aspect-[1/1] lg:aspect-auto',
  },
  {
    id: 'magazines',
    name: 'Personalized Magazines',
    subtitle: 'Your story designed & printed',
    count: '12-Page Edition',
    image: '/images/MAG design2.jpg',
    cardClass: 'lg:col-span-4 aspect-[4/5]',
  },
  {
    id: 'essentials',
    name: 'Phone Cases',
    subtitle: 'Protective custom prints for all models',
    count: 'From ₹299',
    image: '/images/CUSTOMIZED PHONE CASE P2.jpg',
    cardClass: 'lg:col-span-4 aspect-[4/5]',
  },
  {
    id: 'hampers',
    name: 'Luxury Hampers',
    subtitle: 'Curated celebration combo boxes',
    count: 'From ₹599',
    image: '/images/HAMPER(1).jpg',
    cardClass: 'lg:col-span-4 aspect-[4/5]',
  },
  {
    id: 'flowers',
    name: 'Flowers & Bouquets',
    subtitle: 'Everlasting blooms with message cards',
    count: 'From ₹199',
    image: '/images/real flower boq 249.jpg',
    cardClass: 'lg:col-span-6 aspect-[16/10] lg:aspect-[16/9]',
  },
  {
    id: 'vintage',
    name: 'Vintage Collection',
    subtitle: 'Retro wax letters & nostalgic frames',
    count: 'From ₹119',
    image: '/images/vintage frame.jpg',
    cardClass: 'lg:col-span-6 aspect-[16/10] lg:aspect-[16/9]',
  },
];

const CategoryGrid = () => {
  return (
    <section id="collections-section" className="py-16 md:py-24 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#687386] mb-2 block">
              Browse by Category
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#071A2F] tracking-tight">
              WHAT ARE YOU LOOKING FOR?
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#687386] max-w-md font-normal leading-relaxed">
            Find the perfect personalized gift. Handcrafted pieces created around the moments you never want to forget.
          </p>
        </div>

        {/* Quick Category Chips for Instant Discovery */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-10 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { label: 'All Gifts', path: '/shop/frames' },
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
              className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap bg-[#FAF8F4] hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 hover:border-[#071A2F] transition-all duration-200 shadow-2xs hover:shadow-xs"
            >
              {chip.label}
            </Link>
          ))}
        </div>

        {/* Editorial Grid: 2-column on mobile, responsive editorial on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
          {REAL_CATEGORIES.map((col) => (
            <Link
              key={col.id}
              to={`/shop/${col.id}`}
              className={`group relative rounded-3xl overflow-hidden bg-[#FAF8F4] border border-[#071A2F]/8 shadow-[0_2px_12px_rgba(7,26,47,0.03)] hover:shadow-[0_16px_36px_rgba(7,26,47,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end ${col.cardClass}`}
            >
              {/* Image with restrained hover zoom (1.03) */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  loading="lazy"
                  decoding="async"
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                
                {/* Subtle scrim overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A2F]/90 via-[#071A2F]/30 to-transparent" />
              </div>

              {/* Corner Badge & Clean Circular Arrow */}
              <div className="relative z-10 p-3 sm:p-5 mb-auto flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[#071A2F] shadow-xs">
                  {col.count}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md text-[#071A2F] flex items-center justify-center group-hover:bg-[#071A2F] group-hover:text-white transition-all duration-300 shadow-xs">
                  <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Bottom Content Typography */}
              <div className="relative z-10 p-3.5 sm:p-6 text-white">
                <h3 className={`font-bold tracking-tight text-white mb-0.5 sm:mb-1 ${
                  col.isHeroFeature ? 'text-lg sm:text-2xl lg:text-3xl' : 'text-base sm:text-xl'
                }`}>
                  {col.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80 font-light line-clamp-1">
                  {col.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Collections Button */}
        <div className="mt-12 text-center">
          <Link
            to="/shop/frames"
            className="inline-flex items-center gap-2 bg-[#FAF8F4] hover:bg-white text-[#071A2F] border border-[#071A2F]/15 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs hover:shadow-md"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <span className="text-[#C5A46D]">→</span>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;
