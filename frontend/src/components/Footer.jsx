import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, Plus, Minus, ShieldCheck } from 'lucide-react';

const WhatsAppIcon = ({ size = 15, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52zm4.22-6.38c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.14.15-.27.17-.5.06-.23-.11-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.14-.23-.02-.35.1-.46.1-.09.23-.23.35-.35.11-.11.15-.19.23-.31.08-.11.04-.21-.02-.33-.06-.11-.51-1.23-.7-1.68-.19-.45-.38-.38-.52-.39-.14-.01-.3-.01-.45-.01-.15 0-.41.06-.62.29-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.39.11.15 1.63 2.49 3.95 3.49 1.55.67 2.15.54 2.94.46.88-.09 1.36-.67 1.55-1.32.19-.64.19-1.19.14-1.29-.05-.1-.19-.17-.42-.29z"/>
  </svg>
);

const Footer = () => {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (key) => {
    setOpenAccordion(prev => (prev === key ? null : key));
  };

  const navSections = [
    {
      key: 'shop',
      title: 'SHOP',
      links: [
        { label: 'Photo Frames', to: '/shop/frames' },
        { label: 'T-Shirts', to: '/shop/apparel' },
        { label: 'Polaroids', to: '/shop/memories' },
        { label: 'Magazines', to: '/shop/magazines' },
        { label: 'Phone Cases', to: '/shop/essentials' },
        { label: 'Gift Hampers', to: '/shop/hampers' }
      ]
    },
    {
      key: 'help',
      title: 'HELP',
      links: [
        { label: 'Contact', to: '/contact' },
        { label: 'Shipping Policy', to: '/shipping-policy' },
        { label: 'Returns & Refunds', to: '/refund-cancellation-policy' },
        { label: 'Track Order', to: '/orders' }
      ]
    },
    {
      key: 'about',
      title: 'ABOUT',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Privacy Policy', to: '/privacy-policy' },
        { label: 'Terms & Conditions', to: '/terms-and-conditions' }
      ]
    }
  ];

  return (
    <footer className="bg-[#03101D] text-white pt-8 sm:pt-14 pb-6 sm:pb-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Brand & Compact Contact */}
        <div className="pb-6 sm:pb-10 border-b border-white/10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-2">
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
          </div>

          {/* Compact Contact Actions: Call, WhatsApp, Email */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="tel:+918985993948"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#C5A46D] hover:text-[#03101D] text-xs font-semibold text-white transition-colors"
            >
              <Phone size={13} />
              <span>Call</span>
            </a>
            <a
              href="https://wa.me/918985993948"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white text-xs font-semibold transition-colors"
            >
              <WhatsAppIcon size={13} />
              <span>WhatsApp</span>
            </a>
            <a
              href="mailto:infinitycustomizations@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#C5A46D] hover:text-[#03101D] text-xs font-semibold text-white transition-colors"
            >
              <Mail size={13} />
              <span>Email</span>
            </a>
            <a
              href="https://instagram.com/infinitycustomizations"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C5A46D] hover:text-[#03101D] text-gray-300 flex items-center justify-center transition-all duration-200"
            >
              <Instagram size={14} />
            </a>
          </div>
        </div>

        {/* MOBILE NAVIGATION ACCORDIONS (hidden on sm+) */}
        <div className="sm:hidden divide-y divide-white/10 border-b border-white/10">
          {navSections.map(sec => {
            const isOpen = openAccordion === sec.key;
            return (
              <div key={sec.key} className="py-2.5">
                <button
                  type="button"
                  onClick={() => toggleAccordion(sec.key)}
                  className="w-full flex items-center justify-between py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#C5A46D] text-left cursor-pointer"
                >
                  <span>{sec.title}</span>
                  {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                </button>
                {isOpen && (
                  <ul className="pt-2 pb-1 space-y-2 text-xs text-gray-300 pl-1">
                    {sec.links.map((link, idx) => (
                      <li key={idx}>
                        <Link to={link.to} className="hover:text-white transition-colors block py-0.5">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* DESKTOP NAVIGATION GRID (visible on sm+) */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-8 py-8 border-b border-white/10">
          {navSections.map(sec => (
            <div key={sec.key} className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#C5A46D]">
                {sec.title}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-300 font-normal">
                {sec.links.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Truthful Claims */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-gray-400">
          <p>© 2026 Infinity Customizations</p>

          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#C5A46D]" /> 100% Secure Checkout
            </span>
            <span>•</span>
            <span>Pan-India Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
