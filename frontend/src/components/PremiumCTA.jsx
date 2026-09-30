import React from 'react';
import { Link } from 'react-router-dom';

const PremiumCTA = () => {
  return (
    <section className="py-8 sm:py-16 md:py-20 bg-[#FAF8F4] border-t border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Deep Navy Luxury Card with Champagne Radial Glow */}
        <div className="relative rounded-2xl sm:rounded-[32px] bg-[#071A2F] p-6 sm:p-12 lg:p-16 text-white text-center overflow-hidden shadow-[0_12px_40px_rgba(7,26,47,0.12)] border border-[#071A2F]/10">
          
          {/* Subtle Champagne Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-[#C5A46D]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#C5A46D] mb-2 sm:mb-3 block">
              INFINITY CUSTOMIZATIONS
            </span>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-2.5 sm:mb-3.5">
              READY TO TURN A MOMENT <br />
              <span className="text-[#C5A46D]">INTO A KEEPSAKE?</span>
            </h2>

            <p className="text-xs sm:text-base text-gray-300 font-light leading-relaxed mb-6 sm:mb-8 max-w-md">
              Personalized gifts crafted by hand and delivered to their door.
            </p>

            {/* Single Prominent Primary CTA */}
            <div className="w-full sm:w-auto">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF8F4] text-[#071A2F] px-8 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg active:scale-95 transition-all duration-200"
              >
                <span>START GIFTING</span>
                <span className="text-[#C5A46D] font-bold">→</span>
              </Link>
            </div>

            <p className="text-[10.5px] sm:text-[11.5px] text-gray-400 mt-5 font-light">
              Archival quality • WhatsApp preview confirmation • Pan-India Delivery
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PremiumCTA;
