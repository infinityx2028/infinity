import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  User, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  ArrowRight,
  Package,
  Heart,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useIntro } from '../contexts/IntroContext';
import { products } from '../data';
import { getImageSrc } from '../utils/imageUtils';

const WhatsAppIcon = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52zm4.22-6.38c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.14.15-.27.17-.5.06-.23-.11-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.14-.23-.02-.35.1-.46.1-.09.23-.23.35-.35.11-.11.15-.19.23-.31.08-.11.04-.21-.02-.33-.06-.11-.51-1.23-.7-1.68-.19-.45-.38-.38-.52-.39-.14-.01-.3-.01-.45-.01-.15 0-.41.06-.62.29-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.39.11.15 1.63 2.49 3.95 3.49 1.55.67 2.15.54 2.94.46.88-.09 1.36-.67 1.55-1.32.19-.64.19-1.19.14-1.29-.05-.1-.19-.17-.42-.29z"/>
  </svg>
);

const POPULAR_SEARCH_CHIPS = [
  'Photo Frames',
  'Custom T-Shirts',
  'Polaroids',
  'Magazines',
  'Phone Cases'
];

const Navbar = ({ cartCount = 0 }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openCartDrawer } = useCart();
  const navigate = useNavigate();
  const { isIntroActive, introPhase } = useIntro();
  const isIntroInitial = Boolean(isIntroActive && introPhase === 'initial');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_recent_searches');
      return saved ? JSON.parse(saved) : ['Classic Frame', 'Anniversary Magazine', 'Polaroids'];
    } catch (e) {
      return ['Classic Frame', 'Anniversary Magazine', 'Polaroids'];
    }
  });

  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_wishlist');
      return saved ? JSON.parse(saved).length : 0;
    } catch (e) {
      return 0;
    }
  });

  const collectionsRef = useRef(null);
  const profileRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update wishlist count when storage changes
  useEffect(() => {
    const updateWishlist = () => {
      try {
        const saved = localStorage.getItem('infinity_wishlist');
        setWishlistCount(saved ? JSON.parse(saved).length : 0);
      } catch (e) {}
    };
    window.addEventListener('storage', updateWishlist);
    return () => window.removeEventListener('storage', updateWishlist);
  }, []);

  // Filter real product search results
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchTerm.toLowerCase().trim();
    const matches = products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.categoryId && p.categoryId.toLowerCase().includes(q))
    ).slice(0, 5);
    setSearchResults(matches);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) {
        setCollectionsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionsOpen(false);
    setProfileOpen(false);
    setShowSearchModal(false);
    setSearchFocused(false);
  }, [location.pathname]);

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 4);
    setRecentSearches(updated);
    try {
      localStorage.setItem('infinity_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearchModal(false);
      setSearchFocused(false);
    }
  };

  const handleChipClick = (term) => {
    setSearchTerm(term);
    saveRecentSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShowSearchModal(false);
    setSearchFocused(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          transition: 'height 250ms ease, background-color 250ms ease, box-shadow 250ms ease, opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: isIntroActive ? '200ms' : '0ms'
        }}
        className={`sticky top-0 z-50 border-b border-[#071A2F]/8 ${
          isScrolled 
            ? 'h-[58px] sm:h-[66px] bg-[#FAF8F4]/95 backdrop-blur-xl shadow-[0_2px_12px_rgba(7,26,47,0.05)]' 
            : 'h-[60px] sm:h-[70px] bg-white/95 backdrop-blur-md shadow-none'
        } ${
          isIntroInitial ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
        } flex items-center`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between gap-3 sm:gap-6">
          
          {/* ================= LEFT: MENU & LOGO ================= */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden w-11 h-11 text-[#071A2F] hover:bg-[#FAF8F4] rounded-xl transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="flex items-center py-1 group">
              <div className="h-9 sm:h-12 w-auto flex items-center">
                <img 
                  src="/images/logo.png" 
                  alt="Infinity Customizations" 
                  className="h-8 sm:h-10 w-auto max-w-[135px] sm:max-w-none object-contain object-left group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>
          </div>

          {/* ================= CENTER: MAIN NAVIGATION LINKS ================= */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold tracking-tight text-[#071A2F]/85">
            {/* SHOP ALL (Prominent & Unmissable) */}
            <Link 
              to="/shop" 
              className="bg-[#071A2F] hover:bg-[#0B2748] text-white px-4 py-2 rounded-full transition-all duration-200 font-bold text-xs tracking-wider uppercase shadow-xs hover:shadow"
            >
              SHOP ALL
            </Link>

            {/* SCANNABLE MEGA MENU: COLLECTIONS */}
            <div className="relative" ref={collectionsRef}>
              <button
                type="button"
                onClick={() => setCollectionsOpen(prev => !prev)}
                onMouseEnter={() => setCollectionsOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#071A2F] font-bold text-xs tracking-wider uppercase transition-colors py-1 cursor-pointer"
              >
                <span>COLLECTIONS</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${collectionsOpen ? 'rotate-180 text-[#071A2F]' : 'text-[#6B7280]'}`} />
              </button>

              {collectionsOpen && (
                <div 
                  onMouseLeave={() => setCollectionsOpen(false)}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[720px] z-50 animate-hero-assemble"
                >
                  <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(7,26,47,0.14)] border border-[#071A2F]/8 p-6">
                    <div className="grid grid-cols-12 gap-6 items-start">
                      
                      {/* Column 1: SHOP */}
                      <div className="col-span-3 space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#071A2F] pb-1 border-b border-gray-100">
                          SHOP
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#687386]">
                          <li>
                            <Link to="/shop" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              All Products
                            </Link>
                          </li>
                          <li>
                            <a href="/#best-sellers" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Best Sellers
                            </a>
                          </li>
                          <li>
                            <a href="/#made-for-you" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Curated Gifts
                            </a>
                          </li>
                        </ul>
                      </div>

                      {/* Column 2: PERSONALIZED */}
                      <div className="col-span-3 space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#071A2F] pb-1 border-b border-gray-100">
                          PERSONALIZED
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#687386]">
                          <li>
                            <Link to="/shop/frames" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Photo Frames
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop/memories" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Polaroids & Books
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop/magazines" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Custom Magazines
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop/essentials" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Phone Cases
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 3: APPAREL & OTHER GIFTS */}
                      <div className="col-span-3 space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#071A2F] pb-1 border-b border-gray-100">
                          APPAREL & GIFTS
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#687386]">
                          <li>
                            <Link to="/shop/apparel" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Custom T-Shirts
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop/hampers" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Luxury Hampers
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop/flowers" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Flowers & Bouquets
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop/vintage" onClick={() => setCollectionsOpen(false)} className="hover:text-[#071A2F] font-medium block py-0.5">
                              Vintage Keepsakes
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 4: FEATURED PRODUCT PREVIEW CARD */}
                      <div className="col-span-3">
                        <Link 
                          to="/product/f1" 
                          onClick={() => setCollectionsOpen(false)}
                          className="block p-3 rounded-2xl bg-[#FAF8F4] border border-[#071A2F]/8 hover:border-[#071A2F]/20 transition-all group"
                        >
                          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white mb-2.5">
                            <img 
                              src="/images/4 x 6 black frame 199.jpg" 
                              alt="Featured Frame" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A46D] block">
                            Best Seller
                          </span>
                          <p className="text-xs font-semibold text-[#071A2F] truncate">
                            Classic Tabletop Frame
                          </p>
                          <span className="text-xs font-black text-[#071A2F] block mt-0.5">
                            From ₹199
                          </span>
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>

            <a 
              href="/#best-sellers" 
              className="hover:text-[#071A2F] transition-colors py-1 font-semibold text-xs tracking-wide uppercase"
            >
              Best Sellers
            </a>

            <a 
              href="/#made-for-you" 
              className="hover:text-[#071A2F] transition-colors py-1 font-semibold text-xs tracking-wide uppercase"
            >
              Gifts
            </a>

            <Link 
              to="/about" 
              className="hover:text-[#071A2F] transition-colors py-1 font-semibold text-xs tracking-wide uppercase"
            >
              About
            </Link>
          </nav>

          {/* ================= RIGHT: SEARCH + ACCOUNT + BAG ================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Desktop Prominent Predictive Search Bar */}
            <div className="hidden md:block relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="flex items-center bg-[#FAF8F4] hover:bg-white focus-within:bg-white border border-[#071A2F]/10 focus-within:border-[#071A2F]/50 rounded-full px-4 py-2 transition-all w-60 lg:w-72 focus-within:w-80 shadow-xs">
                  <Search size={15} className="text-[#6B7280] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search frames, polaroids, T-shirts..."
                    value={searchTerm}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs ml-2 w-full text-[#071A2F] placeholder:text-[#6B7280]/70 font-normal"
                  />
                  {searchTerm && (
                    <button 
                      type="button" 
                      onClick={() => setSearchTerm('')} 
                      className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </form>

              {/* Predictive Search Dropdown: Matches OR Recent & Popular Chips */}
              {searchFocused && (
                <div className="absolute right-0 top-full mt-2 w-88 bg-white rounded-2xl shadow-[0_16px_40px_rgba(7,26,47,0.12)] border border-[#071A2F]/8 p-4 z-50 animate-hero-assemble">
                  {searchTerm.trim().length > 0 ? (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] px-1 mb-2">
                        Matching Personalized Gifts
                      </div>

                      {searchResults.length > 0 ? (
                        <div className="space-y-1">
                          {searchResults.map((p) => {
                            const imgSrc = getImageSrc(p.images?.[0] || p.image);
                            return (
                              <Link
                                key={p.id || p._id}
                                to={`/product/${p._id || p.id}`}
                                onClick={() => {
                                  saveRecentSearch(p.name);
                                  setSearchFocused(false);
                                }}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F4] transition-colors"
                              >
                                <img 
                                  src={imgSrc} 
                                  alt={p.name} 
                                  className="w-11 h-11 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#071A2F] truncate">{p.name}</p>
                                  <p className="text-[10px] text-[#6B7280] capitalize">{p.categoryId || 'Gift'}</p>
                                </div>
                                <span className="text-xs font-black text-[#071A2F]">
                                  ₹{p.price}
                                </span>
                              </Link>
                            );
                          })}
                          <div className="pt-2.5 border-t border-gray-100 mt-2">
                            <button
                              type="button"
                              onClick={handleSearchSubmit}
                              className="w-full text-center text-[11px] font-bold text-[#071A2F] hover:text-[#123C69] py-1 cursor-pointer"
                            >
                              View all results for "{searchTerm}" →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center space-y-1">
                          <p className="text-xs font-bold text-[#071A2F]">We couldn't find that gift.</p>
                          <p className="text-[11px] text-[#6B7280]">Try another keyword or browse our collections.</p>
                          <Link 
                            to="/shop"
                            onClick={() => setSearchFocused(false)}
                            className="inline-block mt-2 bg-[#071A2F] text-white text-[11px] font-bold px-4 py-1.5 rounded-full"
                          >
                            Browse Collections
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default Dropdown state when focused & empty: Recent Searches & Popular Category Chips */
                    <div className="space-y-3.5">
                      {recentSearches.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                            Recent Searches
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {recentSearches.map((s, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleChipClick(s)}
                                className="text-xs bg-[#FAF8F4] hover:bg-[#071A2F] hover:text-white px-3 py-1 rounded-full text-[#071A2F] transition-colors cursor-pointer"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                          Popular Categories
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SEARCH_CHIPS.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleChipClick(chip)}
                              className="text-xs font-medium border border-[#071A2F]/10 hover:border-[#071A2F] bg-white hover:bg-[#FAF8F4] px-3 py-1 rounded-full text-[#071A2F] transition-colors cursor-pointer"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile 1-Tap Search Toggle (44x44 min touch target) */}
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="md:hidden w-11 h-11 text-[#071A2F] hover:bg-[#FAF8F4] rounded-full transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Search gifts"
            >
              <Search size={20} />
            </button>

            {/* Optional Wishlist Icon (shown if items exist) */}
            {wishlistCount > 0 && (
              <Link
                to="/profile"
                title="Wishlisted items"
                className="hidden sm:flex w-11 h-11 text-[#071A2F]/80 hover:text-red-500 rounded-full transition-colors items-center justify-center relative cursor-pointer"
              >
                <Heart size={18} className="text-red-500 fill-red-500" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center">
                  {wishlistCount}
                </span>
              </Link>
            )}

            {/* User Account (Desktop only - accessible via mobile menu drawer on mobile) */}
            <div className="hidden sm:block relative" ref={profileRef}>
              {isAuthenticated ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(prev => !prev)}
                    className="w-11 h-11 text-[#071A2F] hover:bg-[#FAF8F4] rounded-full transition-colors flex items-center justify-center relative cursor-pointer"
                    aria-label="User Account"
                  >
                    <User size={19} />
                    {Number(user?.loyaltyPoints || 0) > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C5A46D]"></span>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full pt-2 w-52 z-50 animate-hero-assemble">
                      <div className="bg-white rounded-2xl shadow-[0_16px_35px_rgba(7,26,47,0.1)] border border-[#071A2F]/8 py-2 overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-[10px] text-[#6B7280]">Signed in as</p>
                          <p className="text-xs font-bold text-[#071A2F] truncate">{user?.name || user?.phoneNumber}</p>
                        </div>
                        <Link 
                          to="/profile" 
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#071A2F] hover:bg-[#FAF8F4]"
                        >
                          <User size={14} className="text-[#6B7280]" /> My Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#071A2F] hover:bg-[#FAF8F4]"
                        >
                          <Package size={14} className="text-[#6B7280]" /> My Orders
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left cursor-pointer"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  title="Sign In"
                  className="w-11 h-11 text-[#071A2F]/80 hover:text-[#071A2F] hover:bg-[#FAF8F4] rounded-full transition-colors flex items-center justify-center cursor-pointer"
                >
                  <User size={19} />
                </Link>
              )}
            </div>

            {/* Shopping Bag Button with Non-Distorting Badge */}
            <button
              type="button"
              onClick={openCartDrawer}
              title="Shopping Bag"
              className="relative flex items-center justify-center min-w-[44px] h-11 px-2.5 sm:px-4 bg-[#071A2F] hover:bg-[#0B2748] text-white rounded-full transition-all duration-200 shadow-xs hover:shadow active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={17} />
              <span className="hidden sm:inline ml-1.5 text-xs font-bold uppercase tracking-wider">BAG</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:static sm:ml-2 w-5 h-5 rounded-full bg-[#C5A46D] text-[#071A2F] font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-xs flex-shrink-0">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* ================= MOBILE FULL-SCREEN LUXURY DRAWER MENU ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#071A2F] text-white">
          
          {/* Subtle Ambient Background Artwork */}
          <div 
            aria-hidden="true" 
            className="absolute inset-0 overflow-hidden pointer-events-none select-none"
          >
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#123C69]/30 blur-3xl" />
            <div className="absolute top-1/2 -right-20 w-72 h-72 rounded-full bg-[#C5A46D]/15 blur-3xl" />
            <img 
              src="/images/hero-frame-optimized.webp" 
              alt=""
              className="absolute -right-16 -bottom-16 w-80 h-80 object-cover opacity-10 rounded-full blur-[1px]"
            />
          </div>

          {/* Drawer Header */}
          <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center"
            >
              <img 
                src="/images/logo.png" 
                alt="Infinity Customizations" 
                className="h-9 w-auto brightness-0 invert object-contain" 
              />
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Navigation Links with Staggered Fade Up */}
          <div className="relative z-10 px-6 py-8 flex-1 flex flex-col justify-center space-y-4 overflow-y-auto">
            {[
              { label: 'HOME', to: '/' },
              { label: 'SHOP', to: '/shop' },
              { label: 'COLLECTIONS', href: '/#collections-section' },
              { label: 'BEST SELLERS', href: '/#best-sellers' },
              { label: 'GIFTS', href: '/#made-for-you' },
              { label: 'ABOUT', to: '/about' }
            ].map((link, idx) => {
              const animStyle = {
                animation: `heroFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 60 + 80}ms both`
              };

              return link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  style={animStyle}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between py-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white hover:text-[#C5A46D] transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowRight size={20} className="text-white/40 group-hover:text-[#C5A46D] group-hover:translate-x-1 transition-all" />
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  style={animStyle}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between py-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white hover:text-[#C5A46D] transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowRight size={20} className="text-white/40 group-hover:text-[#C5A46D] group-hover:translate-x-1 transition-all" />
                </a>
              );
            })}
          </div>

          {/* Drawer Footer Account & WhatsApp Info */}
          <div className="relative z-10 p-6 border-t border-white/10 bg-[#03101D]/70 backdrop-blur-md">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-xs text-white/70">
                  Signed in as <span className="font-bold text-white">{user?.name || user?.phoneNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/orders" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-3 px-4 bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 text-xs font-bold text-white min-h-[44px] flex items-center justify-center transition-colors"
                  >
                    My Orders
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-physical-3d block text-center py-3.5 px-6 bg-[#C5A46D] text-[#071A2F] rounded-full text-xs font-black tracking-wider uppercase min-h-[44px] flex items-center justify-center shadow-lg"
              >
                LOGIN / REGISTER
              </Link>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
              <span>Studio Support: +91 89859 93948</span>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white"
              >
                Help & Contact →
              </Link>
            </div>
          </div>

        </div>
      )}

      {/* ================= 1-TAP MOBILE SEARCH MODAL ================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-[#03101D]/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 shadow-2xl animate-hero-assemble">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#071A2F] text-base">Search Personalized Gifts</h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search frames, polaroids, T-shirts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#071A2F]/15 focus:border-[#071A2F] rounded-full outline-none text-sm text-[#071A2F]"
                />
                <Search size={16} className="absolute left-3.5 text-gray-400" />
              </div>
            </form>

            {/* If query entered: matching product items */}
            {searchTerm.trim().length > 0 ? (
              <div className="mt-4 max-h-60 overflow-y-auto space-y-1">
                {searchResults.length > 0 ? (
                  searchResults.map((p) => {
                    const imgSrc = getImageSrc(p.images?.[0] || p.image);
                    return (
                      <Link
                        key={p.id || p._id}
                        to={`/product/${p._id || p.id}`}
                        onClick={() => {
                          saveRecentSearch(p.name);
                          setShowSearchModal(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F4]"
                      >
                        <img 
                          src={imgSrc} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#071A2F] truncate">{p.name}</p>
                          <p className="text-[10px] text-[#6B7280] capitalize">{p.categoryId}</p>
                        </div>
                        <span className="text-xs font-black text-[#071A2F]">
                          ₹{p.price}
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#6B7280] text-center py-4">No matching gifts found.</p>
                )}
              </div>
            ) : (
              /* If empty: popular chips */
              <div className="mt-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Popular Searches</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCH_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className="text-xs bg-[#FAF8F4] hover:bg-[#071A2F] hover:text-white px-3 py-1.5 rounded-full text-[#071A2F] transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="flex-1 bg-[#071A2F] text-white py-3 rounded-full text-xs font-bold min-h-[44px] cursor-pointer"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="px-5 py-3 border border-gray-200 text-gray-600 rounded-full text-xs font-semibold min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
