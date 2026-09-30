import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Palette, Sparkles, ArrowRight } from 'lucide-react';

const STAGES = [
  {
    step: '01',
    label: 'YOUR MEMORY',
    title: 'A Moment You Love',
    desc: 'Pick your favorite candid photo from your phone or camera — a wedding, trip, anniversary, or spontaneous smile.',
    image: '/images/POLAROIDS MEDIUM 8 PER EACH.jpg',
    tag: 'Raw Capture',
    icon: Camera
  },
  {
    step: '02',
    label: 'YOUR DESIGN',
    title: 'Crafted Around Your Story',
    desc: 'Choose your format — archival wooden frame, 12-page magazine, phone case, or custom apparel. We format and verify each detail before printing.',
    image: '/images/MAG design2.jpg',
    tag: 'Layout & Typography',
    icon: Palette
  },
  {
    step: '03',
    label: 'MADE PERSONAL',
    title: 'A Gift They Will Keep Forever',
    desc: 'Handcrafted in our studio, verified with you via WhatsApp, carefully gift-packaged and safely shipped to your doorstep.',
    image: '/images/4 x 6 black frame 199.jpg',
    tag: 'Finished Keepsake',
    icon: Sparkles
  }
];

const ProductStoryScroll = () => {
  const [activeStage, setActiveStage] = useState(0);
  const sectionRef = useRef(null);

  return (
    <section 
      ref={sectionRef} 
      className="py-20 lg:py-28 bg-[#FAF8F4] border-b border-[#071A2F]/6 overflow-hidden relative"
    >
      {/* Subtle Studio Lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-white/80 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C5A46D] mb-3 block">
            HOW A GIFT COMES TO LIFE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#071A2F] tracking-tight leading-tight mb-4">
            FROM A PHOTO <br />
            <span className="text-[#123C69]">TO SOMETHING PERSONAL.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#687386] font-light leading-relaxed">
            Every piece at Infinity Customizations starts with a memory and transforms into a physical keepsake you can hold.
          </p>
        </div>

        {/* 3-Stage Visual Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {STAGES.map((s, idx) => {
            const Icon = s.icon;
            const isHovered = activeStage === idx;
            return (
              <div
                key={s.step}
                onMouseEnter={() => setActiveStage(idx)}
                className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isHovered 
                    ? 'border-[#071A2F]/20 shadow-[0_20px_45px_rgba(7,26,47,0.08)] -translate-y-1.5' 
                    : 'border-[#071A2F]/8 shadow-[0_4px_16px_rgba(7,26,47,0.02)]'
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <span className="text-xs font-black tracking-widest text-[#C5A46D]">
                      STAGE {s.step}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#071A2F] bg-[#FAF8F4] px-3 py-1 rounded-full">
                      {s.label}
                    </span>
                  </div>

                  {/* Stage Visual Card with 3D Depth */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF8F4] mb-6 border border-[#071A2F]/5 group">
                    <img 
                      src={s.image} 
                      alt={s.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071A2F]/60 via-transparent to-transparent" />
                    
                    <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-[#071A2F] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {s.tag}
                    </span>
                  </div>

                  {/* Copy */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#071A2F] mb-3">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#687386] font-light leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#071A2F] font-bold">
                  <span className="flex items-center gap-1.5 text-[#123C69]">
                    <Icon size={14} className="text-[#C5A46D]" /> Step {idx + 1} of 3
                  </span>
                  <Link 
                    to="/shop" 
                    className="hover:text-[#123C69] flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform"
                  >
                    Start Creating <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-[#071A2F]/8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <h4 className="font-semibold text-lg text-[#071A2F]">
              Have a specific photo or idea in mind?
            </h4>
            <p className="text-xs text-[#687386] mt-1 font-light">
              Chat directly with our studio designers for free guidance and mockups.
            </p>
          </div>
          <a
            href="https://wa.me/918985993948"
            target="_blank"
            rel="noreferrer"
            className="bg-[#071A2F] hover:bg-[#0B2748] text-white px-6 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm"
          >
            Chat with Designer →
          </a>
        </div>

      </div>
    </section>
  );
};

export default ProductStoryScroll;
