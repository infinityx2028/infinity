import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const WhatsAppIcon = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52zm4.22-6.38c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.14.15-.27.17-.5.06-.23-.11-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.14-.23-.02-.35.1-.46.1-.09.23-.23.35-.35.11-.11.15-.19.23-.31.08-.11.04-.21-.02-.33-.06-.11-.51-1.23-.7-1.68-.19-.45-.38-.38-.52-.39-.14-.01-.3-.01-.45-.01-.15 0-.41.06-.62.29-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.39.11.15 1.63 2.49 3.95 3.49 1.55.67 2.15.54 2.94.46.88-.09 1.36-.67 1.55-1.32.19-.64.19-1.19.14-1.29-.05-.1-.19-.17-.42-.29z"/>
  </svg>
);

const PremiumCTA = () => {
  return (
    <section className="py-20 md:py-28 bg-[#FAF8F4] border-t border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="relative rounded-[36px] bg-[#071A2F] p-8 sm:p-14 lg:p-20 text-white overflow-hidden shadow-2xl">
          
          {/* Subtle Warm Highlight in Corner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A46D]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
            
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A46D] mb-4 block">
              GIFTING REDEFINED
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-5">
              Some gifts are opened. <br />
              <span className="text-[#C5A46D]">The best ones are remembered.</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed mb-8 max-w-lg">
              Start personalizing a keepsake today. Need help with design or photo selection? Our studio team assists you directly on WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/shop/frames"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-100 text-[#071A2F] px-8 py-4 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>FIND THEIR GIFT</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href="https://wa.me/918985993948"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-transparent hover:bg-white/10 text-white border border-white/20 px-7 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-200"
              >
                <WhatsAppIcon size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <p className="text-[11px] text-gray-400 mt-6 font-light">
              Archival quality • WhatsApp preview confirmation • Handcrafted in India
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PremiumCTA;
