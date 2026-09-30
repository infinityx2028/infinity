import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';

const STUDIO_CREATIONS = [
  {
    image: '/images/MAG design2.jpg',
    tag: 'Personalized Magazine',
  },
  {
    image: '/images/POLAROIDS MEDIUM 8 PER EACH.jpg',
    tag: 'Keepsake Polaroids',
  },
  {
    image: '/images/vintage letter 119.JPG',
    tag: 'Wax-Sealed Letter',
  },
  {
    image: '/images/HAMPER(1).jpg',
    tag: 'Gift Hamper',
  },
  {
    image: '/images/CUSTOMIZED PHONE CASE P2.jpg',
    tag: 'Custom Phone Case',
  },
  {
    image: '/images/artboqwith,pol,flow,cktpr,choc 999.jpg',
    tag: 'Artisanal Bouquet',
  }
];

const CommunityGallery = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] mb-2.5 block">
              @infinitycustomizations
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#071A2F] tracking-tight">
              MADE PERSONAL. <br />
              <span className="text-[#123C69]">SHARED WITH LOVE.</span>
            </h2>
          </div>

          <a
            href="https://instagram.com/infinitycustomizations"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#071A2F] hover:bg-[#0B2748] text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-xs w-fit"
          >
            <Instagram size={14} />
            <span>Follow on Instagram</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* 6-Item Grid of Authentic Studio Pieces */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {STUDIO_CREATIONS.map((item, idx) => (
            <a
              key={idx}
              href="https://instagram.com/infinitycustomizations"
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-2xl overflow-hidden aspect-square bg-[#FAF8F4] border border-[#071A2F]/8 shadow-xs block"
            >
              <img
                loading="lazy"
                decoding="async"
                src={item.image}
                alt={item.tag}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              
              {/* Subtle Overlay on Hover */}
              <div className="absolute inset-0 bg-[#071A2F]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">
                  {item.tag}
                </span>
                <span className="text-[9px] text-[#C5A46D] flex items-center gap-1 mt-0.5">
                  View on Instagram <ArrowUpRight size={10} />
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CommunityGallery;
