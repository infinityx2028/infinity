import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, ShieldCheck } from 'lucide-react';

const WhatsAppIcon = ({ size = 15, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52zm4.22-6.38c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.14.15-.27.17-.5.06-.23-.11-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.14-.23-.02-.35.1-.46.1-.09.23-.23.35-.35.11-.11.15-.19.23-.31.08-.11.04-.21-.02-.33-.06-.11-.51-1.23-.7-1.68-.19-.45-.38-.38-.52-.39-.14-.01-.3-.01-.45-.01-.15 0-.41.06-.62.29-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.39.11.15 1.63 2.49 3.95 3.49 1.55.67 2.15.54 2.94.46.88-.09 1.36-.67 1.55-1.32.19-.64.19-1.19.14-1.29-.05-.1-.19-.17-.42-.29z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#04111F] text-white pt-8 sm:pt-14 pb-6 sm:pb-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid: Responsive 2-column on mobile, 12-column on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 sm:pb-10 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-3.5">
            <Link to="/" className="inline-block group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white block">
                Infinity
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.28em] text-[#C5A46D] uppercase block mt-0.5">
                CUSTOMIZATIONS
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed max-w-sm">
              Personalized gifts made from the moments you never want to forget.
            </p>

            {/* Contact details */}
            <div className="pt-1 text-xs text-gray-400 space-y-1">
              <p>Phone: <a href="tel:+918985993948" className="text-white hover:underline">+91 89859 93948</a></p>
              <p>Email: <a href="mailto:infinitycustomizations@gmail.com" className="text-white hover:underline">infinitycustomizations@gmail.com</a></p>
            </div>

            {/* Small Consistent Circular Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://instagram.com/infinitycustomizations"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C5A46D] hover:text-[#04111F] text-gray-300 flex items-center justify-center transition-all duration-200"
              >
                <Instagram size={15} />
              </a>

              <a
                href="https://www.facebook.com/share/1FzoghaLcu/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C5A46D] hover:text-[#04111F] text-gray-300 flex items-center justify-center transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.072C22 6.477 17.523 2 11.928 2S2 6.477 2 12.072C2 17.09 5.657 21.128 10.438 21.924v-6.93H7.898v-2.922h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.77-1.63 1.56v1.874h2.773l-.443 2.922h-2.33v6.93C18.343 21.128 22 17.09 22 12.072z"/>
                </svg>
              </a>

              <a
                href="https://wa.me/918985993948"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp Support"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#25D366] hover:text-white text-gray-300 flex items-center justify-center transition-all duration-200"
              >
                <WhatsAppIcon size={15} />
              </a>

              <a
                href="mailto:infinitycustomizations@gmail.com"
                aria-label="Email Us"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C5A46D] hover:text-[#04111F] text-gray-300 flex items-center justify-center transition-all duration-200"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: SHOP (Real routes only) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#C5A46D] mb-3">
              SHOP
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-300 font-normal">
              <li><Link to="/shop/frames" className="hover:text-white transition-colors">Photo Frames</Link></li>
              <li><Link to="/shop/apparel" className="hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/shop/memories" className="hover:text-white transition-colors">Polaroids</Link></li>
              <li><Link to="/shop/magazines" className="hover:text-white transition-colors">Magazines</Link></li>
              <li><Link to="/shop/essentials" className="hover:text-white transition-colors">Phone Cases</Link></li>
              <li><Link to="/shop/hampers" className="hover:text-white transition-colors">Gift Hampers</Link></li>
            </ul>
          </div>

          {/* Column 3: HELP (Real routes only) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#C5A46D] mb-3">
              HELP
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-300 font-normal">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund-cancellation-policy" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Trust */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-gray-400">
          <div>
            <p>© 2026 Infinity Customizations. All Rights Reserved.</p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#C5A46D]" /> 100% Secure Checkout</span>
            <span>•</span>
            <span>Pan-India Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
