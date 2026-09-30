import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const MomentsStorySection = () => {
  return (
    <section id="made-around-your-story" className="py-6 sm:py-20 md:py-28 bg-[#F5F6F8] border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* MOBILE VIEW: Editorial Story Banner (~320px height) */}
        <div className="lg:hidden">
          <div className="relative rounded-2xl overflow-hidden bg-[#071A2F] text-white p-5 flex flex-col justify-between h-[320px] shadow-[0_12px_36px_rgba(7,26,47,0.12)] border border-[#071A2F]/10">
            {/* Background champagne ambient glow */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-[#C5A46D]/15 rounded-full blur-3xl pointer-events-none" />
            
            {/* Visual Depth: Layered keepsakes peeking on the right */}
            <div className="absolute -right-6 top-6 w-44 h-56 pointer-events-none select-none">
              {/* Drifting polaroid layer */}
              <div className="absolute top-2 right-12 w-28 aspect-[3/4] rounded-xl bg-white p-1.5 shadow-md transform rotate-6 border border-white/20">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/images/hero-pol-optimized.webp"
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              {/* Emerging keepsake frame */}
              <div className="absolute top-10 right-2 w-32 aspect-[4/5] rounded-xl bg-white/10 backdrop-blur-md p-1 shadow-2xl transform -rotate-3 border border-white/30">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/images/anniversary MAG.jpg"
                  alt="Personalized Keepsake"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Content on the left */}
            <div className="relative z-10 max-w-[62%] flex flex-col justify-between h-full">
              <div>
                <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#C5A46D] block mb-1.5">
                  BRAND STORY
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-[1.15] mb-2">
                  FROM CAMERA ROLL <br />
                  <span className="text-[#C5A46D]">TO SOMETHING REAL.</span>
                </h3>
                <p className="text-[11.5px] text-gray-300 font-light leading-snug">
                  Turn ordinary phone photos into tangible keepsakes they will hold onto forever.
                </p>
              </div>

              <div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 bg-white text-[#071A2F] text-xs font-bold px-4 py-2.5 rounded-full shadow-md active:scale-95 hover:bg-[#FAF8F4] transition-all"
                >
                  <span>EXPLORE GIFTS</span>
                  <span className="text-[#C5A46D]">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW: Full Editorial Story (lg+) */}
        <div className="hidden lg:grid grid-cols-12 gap-16 items-center">
          
          {/* Left: Large Real Product Photography with 3D Layered Depth */}
          <div style={{ perspective: '1000px' }} className="col-span-6 relative">
            {/* Drifting decorative polaroid accent behind */}
            <div 
              aria-hidden="true"
              className="absolute -top-6 -left-4 sm:-top-8 sm:-left-6 w-32 sm:w-40 aspect-[4/5] rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(7,26,47,0.1)] border border-[#071A2F]/10 transform -rotate-6 hidden sm:block z-0 pointer-events-none"
            >
              <img 
                src="/images/hero-pol-optimized.webp" 
                alt="" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Main Editorial Story Object */}
            <div 
              style={{ transformStyle: 'preserve-3d' }}
              className="relative z-10 aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-white shadow-[0_24px_60px_rgba(7,26,47,0.12)] border border-[#071A2F]/8 transform hover:scale-[1.01] transition-transform duration-500"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/images/anniversary MAG.jpg"
                alt="Personalized Anniversary Story"
                className="w-full h-full object-cover"
              />
              {/* Subtle caption badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A46D] block mb-0.5">
                  Handcrafted Edition
                </span>
                <p className="text-xs sm:text-sm font-serif italic text-[#071A2F]">
                  "Every page turned is a reminder of how far we've come together."
                </p>
              </div>
            </div>
          </div>

          {/* Right: Editorial Storytelling Typography */}
          <div className="col-span-6 flex flex-col justify-center">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C5A46D] mb-3 block">
              MADE AROUND YOUR STORY
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#071A2F] leading-[1.08] mb-5">
              MAKE THEIR MOMENT <br />
              <span className="text-[#123C69]">UNFORGETTABLE.</span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-[#687386] font-normal leading-relaxed mb-7">
              From everyday moments to once-in-a-lifetime memories, every Infinity piece is designed to make something personal feel tangible and timeless.
            </p>

            {/* Subtle Pillars of Craftsmanship */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#071A2F]/5 flex items-center justify-center text-[#071A2F] mt-0.5 flex-shrink-0">
                  <Check size={12} className="text-[#071A2F]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#071A2F]">Archival Pigment Printing</h4>
                  <p className="text-xs text-[#687386] font-light mt-0.5">
                    Fade-resistant pigment inks calibrated for vivid color fidelity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#071A2F]/5 flex items-center justify-center text-[#071A2F] mt-0.5 flex-shrink-0">
                  <Check size={12} className="text-[#071A2F]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#071A2F]">Solid Wooden Borders</h4>
                  <p className="text-xs text-[#687386] font-light mt-0.5">
                    Shatter-resistant acrylic and durable wood backing crafted for longevity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#071A2F]/5 flex items-center justify-center text-[#071A2F] mt-0.5 flex-shrink-0">
                  <Check size={12} className="text-[#071A2F]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#071A2F]">WhatsApp Proof Confirmation</h4>
                  <p className="text-xs text-[#687386] font-light mt-0.5">
                    Review and approve your layout proof before final production begins.
                  </p>
                </div>
              </div>
            </div>

            {/* Physical CTA */}
            <div>
              <Link
                to="/shop"
                className="btn-physical-3d group inline-flex items-center gap-3 bg-[#071A2F] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider min-h-[46px]"
              >
                <span>EXPLORE PERSONALIZED GIFTS</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MomentsStorySection;
