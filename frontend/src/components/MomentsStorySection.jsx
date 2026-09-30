import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const MomentsStorySection = () => {
  return (
    <section id="made-around-your-story" className="py-20 md:py-28 bg-[#FAF8F4] border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Large Real Product Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-[32px] overflow-hidden bg-white shadow-[0_20px_50px_rgba(7,26,47,0.08)] border border-[#071A2F]/8">
              <img
                loading="lazy"
                decoding="async"
                src="/images/anniversary MAG.jpg"
                alt="Personalized Anniversary Story"
                className="w-full h-full object-cover"
              />
              {/* Subtle caption badge */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40">
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
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] mb-3 block">
              MADE AROUND YOUR STORY
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#071A2F] leading-[1.08] mb-6">
              Gifts that become part of their story.
            </h2>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#687386] font-normal leading-relaxed mb-8">
              From everyday moments to once-in-a-lifetime memories, every Infinity piece is designed to make something personal feel unforgettable.
            </p>

            {/* Subtle Pillars of Craftsmanship */}
            <div className="space-y-3.5 mb-10">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#071A2F]/5 flex items-center justify-center text-[#071A2F] mt-0.5 flex-shrink-0">
                  <Check size={12} className="text-[#071A2F]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#071A2F]">Archival Pigment Printing</h4>
                  <p className="text-xs text-[#6B7280] font-light mt-0.5">
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
                  <p className="text-xs text-[#6B7280] font-light mt-0.5">
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
                  <p className="text-xs text-[#6B7280] font-light mt-0.5">
                    Review and approve your layout proof before final production begins.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div>
              <Link
                to="/shop/frames"
                className="group inline-flex items-center gap-3 bg-[#071A2F] hover:bg-[#0B2748] text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>EXPLORE PERSONALIZED GIFTS</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MomentsStorySection;
