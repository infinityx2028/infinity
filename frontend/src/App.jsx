import React, { useState, useEffect, useCallback, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { products } from './data';
import { ShoppingCart, ShoppingBag, Menu, X, Search, User, Heart, ChevronRight, Phone, Mail, Instagram, Truck, ShieldCheck, Gift, Star, ArrowRight, MessageCircle, Filter, CheckCircle, AlertCircle, Info, ChevronDown, Trash2, ArrowLeft, LogOut, Share2, Copy, Check, Clock } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { CartProvider } from './contexts/CartContext';
import { useCart } from './contexts/useCart';
import { API_BASE_URL } from './services/api';
import { getImageSrc, isDataUrl } from './utils/imageUtils';
import { getWhatsAppUrl, buildProductPersonalizationWhatsAppMessage } from './utils/whatsapp';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SearchResults from './pages/SearchResults';

// Code-split heavy routes for optimal initial page-load performance
const AccountCenter = React.lazy(() => import('./pages/AccountCenter'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const UserOrders = React.lazy(() => import('./pages/UserOrders'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = React.lazy(() => import('./pages/AdminOrders'));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts'));
const AdminCategories = React.lazy(() => import('./pages/AdminCategories'));
const AdminPhoneModels = React.lazy(() => import('./pages/AdminPhoneModels'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));

import BackButton from './components/BackButton';
import ProductVariantSelector from './components/ProductVariantSelector';
import PolaroidPricingSelector from './components/PolaroidPricingSelector';
import InstagramReelButtons from './components/InstagramReelButtons';

import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import { IntroContext } from './contexts/IntroContext';
import InfinityLoader from './components/InfinityLoader';
import { CANONICAL_CATEGORIES, resolveCategorySlug, getCategoryMeta } from './utils/categoryUtils';
import { InfinityAIProvider } from './contexts/InfinityAIContext';
import InfinityAIModal from './components/InfinityAI/InfinityAIModal';
import { QuickViewProvider } from './contexts/QuickViewContext';
import QuickViewModal from './components/QuickViewModal';
import { getProductFullDescription } from './data/productDescriptions';
import MemoryInteractions from './components/MemoryInteractions';
import './memory-motion.css';
import './memory-film.css';
import './memory-refinements.css';
import './cinematic-commerce.css';
import './cinematic-alignment.css';
import './memory-world.css';
import './frame-engine.css';
import { responsiveImage } from './utils/responsiveImages';

// --- 1. GLOBAL CONTEXT & UTILITIES ---
const LoaderContext = createContext();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
};

const LEGAL_PAGES = {
  privacy: {
    title: 'Privacy Policy',
    content: 'At Infinity Customizations, your privacy is important to us. We collect personal information such as name, phone number, email address, and delivery address solely for order processing, communication, and delivery purposes. All payments made on our website are securely processed through trusted third-party payment gateways. We do not store or have access to your card, UPI, or banking details. Customer information is never sold, rented, or shared with third parties except when required to complete an order or comply with legal requirements. By using our website, you consent to this privacy policy.'
  },
  terms: {
    title: 'Terms & Conditions',
    content: 'By accessing this website and placing an order with Infinity Customizations, you agree to the following terms:\n- All products are customized based on customer inputs.\n- Orders cannot be modified or cancelled once confirmed.\n- Slight variations in color or appearance may occur due to screen or material differences.\n- Delivery timelines are estimated and may vary due to courier or external factors.\n- We reserve the right to cancel or refuse orders that violate legal or ethical standards.\n\nThese terms may be updated at any time without prior notice.'
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    content: 'As all products sold by Infinity Customizations are custom-made and personalized, we do not offer cancellations or refunds once an order is placed. Refunds or replacements will be provided only if:\n- The product is damaged during delivery, or\n- There is a manufacturing defect, or\n- An incorrect product is delivered\n\nCustomers must report the issue within 48 hours of receiving the product, along with clear photos or videos. If approved, refunds will be processed within 5-7 business days to the original payment method.'
  },
  shipping: {
    title: 'Shipping Policy',
    content: 'Orders are processed within 2-3 business days after confirmation. Shipping time depends on the customer\'s location and courier service. Infinity Customizations is not responsible for delays caused by courier partners or unforeseen circumstances.'
  },
  about: {
    title: 'About Us',
    content: 'Built from a simple idea: make memories feel physical again.\n\nInfinity Customizations was founded by Jashwanth Reddy on April 20, 2025 while studying B.Tech. The studio brings personalized gifts, printing and creative products together around the photos, stories and moments that matter to you.\n\nEvery product is personalized according to the design, text or specifications provided by the customer and prepared after an order is confirmed. After ordering, send your photos and personalization details to our team on WhatsApp.'
  },
  contact: {
    title: 'Contact Us',
    content: 'Business Name: Infinity Customizations\nEmail: infinitycustomizations@gmail.com\nPhone: +91 89859 93948\n\nFor order-related queries, customization details, or support, feel free to contact us.'
  }
};

const LegalPage = ({ legalKey }) => {
  const data = LEGAL_PAGES[legalKey] || { title: 'Information', content: '' };
  return (
    <div className="min-h-screen bg-[#FAF8F4] py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#071A2F]/8 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071A2F] mb-6 tracking-tight">
          {data.title}
        </h1>
        <div className="text-sm sm:text-base text-[#687386] leading-relaxed whitespace-pre-line font-light">
          {data.content}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-[#6B7280]">
          <span>Infinity Customizations</span>
          <Link to="/" className="font-bold text-[#071A2F] hover:text-[#123C69]">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- 2. THE INFINITY LOADER (Horizontal Figure-8 Brand Animation) ---
const GlobalLoader = () => (
  <div className="fixed inset-0 z-[100] bg-[#FAF8F4]/90 backdrop-blur-md flex flex-col items-center justify-center select-none">
    <InfinityLoader size="lg" label="Infinity Customizations" />
  </div>
);

// SmartLink: Navigation that triggers the Infinity Loader
const SmartLink = ({ to, children, className, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
    if (location.pathname === to) return;
    navigate(to);
  };
  return <a href={to} onClick={handleClick} className={`cursor-pointer ${className}`}>{children}</a>;
};

// --- 3. UI COMPONENTS ---

const WhatsAppIcon = ({ size = 22, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52zm4.22-6.38c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.14.15-.27.17-.5.06-.23-.11-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.14-.23-.02-.35.1-.46.1-.09.23-.23.35-.35.11-.11.15-.19.23-.31.08-.11.04-.21-.02-.33-.06-.11-.51-1.23-.7-1.68-.19-.45-.38-.38-.52-.39-.14-.01-.3-.01-.45-.01-.15 0-.41.06-.62.29-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.39.11.15 1.63 2.49 3.95 3.49 1.55.67 2.15.54 2.94.46.88-.09 1.36-.67 1.55-1.32.19-.64.19-1.19.14-1.29-.05-.1-.19-.17-.42-.29z"/></svg>
);

const CategoryPage = () => {
  const { id } = useParams();
  const shopLocation = useLocation();
  const bestOnly = new URLSearchParams(shopLocation.search).get("best") === "1";
  const resolvedCategory = resolveCategorySlug(id);
  const isInvalidCategory = Boolean(id && resolvedCategory === null);
  const currentCategory = isInvalidCategory ? null : (resolvedCategory || 'all');

  const meta = getCategoryMeta(currentCategory);
  const details = meta ? { title: meta.title, desc: meta.desc } : (
    isInvalidCategory ? {
      title: "Collection Not Found",
      desc: "The category you are looking for does not exist or has been moved."
    } : { 
      title: "All Personalized Gifts", 
      desc: "Discover handcrafted pieces made around your favorite memories." 
    }
  );
  
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all'); // all, under-300, 300-600, above-600

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      if (isInvalidCategory) {
        if (isMounted) {
          setAllProducts([]);
          setLoading(false);
        }
        return;
      }

      try {
        setCatalogError(false);
        const res = await fetch(`${API_BASE_URL}/products`);
        if (!res.ok) throw new Error('Catalog unavailable');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Invalid catalog');
        if (isMounted) setAllProducts(data.filter(product => product && product.isActive !== false));
      } catch {
        if (isMounted) { setAllProducts([]); setCatalogError(true); }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, [currentCategory, isInvalidCategory]);

  // Filter products by price
  const filteredProducts = allProducts.filter(p => {
    if (currentCategory !== "all" && p.categoryId !== currentCategory) return false;
    if (bestOnly && p.isBestSeller !== true) return false;
    const price = Number(p.price || 0);
    if (priceFilter === 'under-300') return price < 300;
    if (priceFilter === '300-600') return price >= 300 && price <= 600;
    if (priceFilter === 'above-600') return price > 600;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.price || 0);
    const priceB = Number(b.price || 0);
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'newest') return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
  });

  const activeFilterCount = (priceFilter !== 'all' ? 1 : 0);

  return (
    <div className="shop-page min-h-screen bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Simple Breadcrumbs: Home / Shop / Collection */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-[#687386]">
          <Link to="/" className="hover:text-[#071A2F] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#071A2F] transition-colors font-medium">Shop</Link>
          <span>/</span>
          <span className="font-bold text-[#071A2F] capitalize">
            {details.title}
          </span>
        </nav>

        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-5 mb-5 border-b border-[#071A2F]/10 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#687386] mb-0.5 block">
              Infinity Store
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071A2F] tracking-tight">
              {bestOnly ? "Best sellers" : details.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#687386] max-w-md font-light">
            {details.desc}
          </p>
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="shop-controls space-y-3.5 mb-8">
          {/* Quick Category Chips */}
          <div className="shop-category-strip flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CANONICAL_CATEGORIES.filter(tab => tab.id === "all" || allProducts.some(product => product.categoryId === tab.id)).map((tab) => {
              const isActive = (tab.id === 'all' && currentCategory === 'all') || (tab.id === currentCategory);
              return (
                <Link
                  key={tab.id}
                  to={tab.id === 'all' ? '/shop' : `/shop/${tab.slug}`}
                  className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all shadow-2xs ${
                    isActive
                      ? 'bg-[#071A2F] text-white shadow-xs'
                      : 'bg-white text-[#071A2F] hover:bg-[#FAF8F4] border border-[#071A2F]/10'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {/* Secondary Controls: Price Pills + Sorting Dropdown */}
          <div className="shop-filter-bar flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#071A2F]/8 shadow-xs">
            {/* Price Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[#687386] font-medium mr-1 hidden sm:inline">Price:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'under-300', label: '< ₹300' },
                { id: '300-600', label: '₹300 - ₹600' },
                { id: 'above-600', label: '> ₹600' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setPriceFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    priceFilter === pill.id
                      ? 'bg-[#071A2F] text-white'
                      : 'bg-[#F7F8FA] text-[#071A2F] hover:bg-gray-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setPriceFilter('all')}
                  className="text-[11px] font-bold text-red-600 hover:underline ml-2"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <span className="text-[#687386] font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F7F8FA] border border-gray-200 text-[#071A2F] font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#071A2F] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / Loading / Empty States */}
        {catalogError ? <p role="status" className="py-12 text-center text-sm text-[#687386]">The catalog is temporarily unavailable. Please reload to try again.</p> : loading ? (
          <div className="shop-product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-2.5 border border-[#071A2F]/6 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-xl mb-2" />
                <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div>
            <div className="shop-product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {sortedProducts.map(p => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
            <p className="text-center text-xs text-[#687386] mt-10">
              Showing {sortedProducts.length} personalized gifts
            </p>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-[#071A2F]/8 p-8 max-w-md mx-auto shadow-xs">
            <h3 className="font-extrabold text-base sm:text-lg text-[#071A2F] mb-2 tracking-tight">
              {isInvalidCategory ? "COLLECTION NOT FOUND" : "NO PRODUCTS AVAILABLE IN THIS COLLECTION YET."}
            </h3>
            <p className="text-xs text-[#687386] mb-6 font-light leading-relaxed">
              {isInvalidCategory 
                ? "The category you navigated to was not recognized. Explore our full catalog below."
                : "We are handcrafting pieces for this collection. Explore all our available gifts below."
              }
            </p>
            <Link
              to="/shop"
              className="btn-physical-3d inline-block bg-[#071A2F] hover:bg-[#0B2748] text-white px-7 py-3 rounded-full text-xs font-bold tracking-wide shadow-sm"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext, openCartDrawer } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isMainImgLoaded, setIsMainImgLoaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyLinkClicked, setCopyLinkClicked] = useState(false);
  const [phoneCompany, setPhoneCompany] = useState('');
  const [phoneModel, setPhoneModel] = useState('');
  // phoneCompanies expected as an object mapping company -> [models]
  const [phoneCompanies, setPhoneCompanies] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [wrapType, setWrapType] = useState('none');
  const [wrapPrice, setWrapPrice] = useState(0);
  const [hamperItems, setHamperItems] = useState([]);
  const [hamperItemTotal, setHamperItemTotal] = useState(0);
  const [hamperPackageType, setHamperPackageType] = useState('full-hamper');
  const [videoInvitationType, setVideoInvitationType] = useState('');
  const [digitalInvitationType, setDigitalInvitationType] = useState('');
  const [frameColor, setFrameColor] = useState('white');
  const [flowerWrapColor, setFlowerWrapColor] = useState('pink');
  const [roseColor, setRoseColor] = useState('white');
  const [artificialLightsOption, setArtificialLightsOption] = useState('without-lights');
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
  const [bulkSizes, setBulkSizes] = useState({ S: '', M: '', L: '', XL: '', XXL: '' });
  // T-Shirt configuration states
  const [tshirtMaterial, setTshirtMaterial] = useState('poly-cotton');
  const [tshirtNeck, setTshirtNeck] = useState('round');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [tshirtColor, setTshirtColor] = useState('white'); // For round neck
  const [, setTshirtBasePrice] = useState(499);
  // Signature Day T-Shirt states
  const [, setSignatureDayBasePrice] = useState(179);
  
  // New fabric-based t-shirt variant state
  const [currentVariant, setCurrentVariant] = useState({
    fabric: '',
    color: '',
    size: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  });

  // Polaroid pricing state
  const [polaroidPricing, setPolaroidPricing] = useState({
    selectedSize: 'mini',
    quantities: { mini: 12, medium: 8, large: 4 },
    pricing: {
      mini: { quantity: 12, totalPrice: 60, unitPrice: 5 },
      medium: { quantity: 8, totalPrice: 64, unitPrice: 8 },
      large: { quantity: 4, totalPrice: 60, unitPrice: 15 }
    },
    currentPricing: { quantity: 12, totalPrice: 60, unitPrice: 5 }
  });

  // Personalization states
  const [customText, setCustomText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [addedToBagSuccess, setAddedToBagSuccess] = useState(false);
  
  // Color options for t-shirts

  const roundNeckColors = [
    { name: 'white', hex: '#FFFFFF' },
    { name: 'light blue', hex: '#87CEEB' },
    { name: 'pink', hex: '#FFB6C1' },
    { name: 'yellow', hex: '#FFFF00' }
  ];
  const videoInvitationOptions = [
    'Wedding',
    'Half saree',
    'House ceremony',
    'Anniversary',
    'Birthday',
    'Death ceremony'
  ];

    const isPhoneCase = product && (product.id === 'case1' || (product.name || '').toLowerCase().includes('phone case'));
    const isHamper = product && (product.categoryId === 'hampers' || (product.name || '').toLowerCase().includes('hamper'));
    const isTShirt = product && (product.categoryId === 'apparel' && ((product.name || '').toLowerCase().includes('t-shirt') || (product.name || '').toLowerCase().includes('tshirt')));
    const isCustomizedTShirt = product && product.id === 't1';
    const isSignatureDayTShirt = product && product.id === 't2';
    const productId = product ? (product._id || product.id || '') : '';
    const isPremiumTransparentHamper = ['ham2', 'ham4'].includes(productId);
    const isFridgeMagnet = productId === 'mag1';
  const isCapProduct = product && productId === 'cap1';
  const isPolaroid = product && ['pol1', 'pol2', 'pol3'].includes(productId);
  const isDigitalVideoInvitation = product && (product.id === 'd4' || product._id === 'd4');
  const isDigitalInvitation = product && (product.id === 'd1' || product._id === 'd1');
  const isFrameColorChoice = product && (product.id === 'f3' || product._id === 'f3');
    const isFlowerProduct = product && product.categoryId === 'flowers';
    const isNaturalFlower = ['bou1', 'bou8'].includes(productId);
    const isNaturalRosesWrapProduct = productId === 'bou8';
    const isArtificialFlower = ['bou2', 'bou3', 'bou4', 'bou5'].includes(productId);

  const isPhotoProduct = product && (
    product.categoryId === 'frames' || 
    product.categoryId === 'memories' || 
    product.categoryId === 'magazines' || 
    isPhoneCase || 
    (product.name || '').toLowerCase().includes('frame') || 
    (product.name || '').toLowerCase().includes('polaroid') || 
    (product.name || '').toLowerCase().includes('magazine') || 
    (product.name || '').toLowerCase().includes('photo')
  );
  
  // New fabric/color/size based t-shirts
  const isFabricBasedTShirt = product && ['collared-tshirt', 'collarless-tshirt'].includes(product._id);
  const isQuantityBasedTShirt = product && product._id === 'signature-tshirt';
  const isNewStyleTShirt = isFabricBasedTShirt || isQuantityBasedTShirt;
  const isAnyTShirt = isTShirt || isNewStyleTShirt;

  // Calculate T-shirt price based on quantity
  const calculateTShirtPrice = (quantity) => {
    if (quantity <= 4) return 499;
    if (quantity === 5 || quantity <= 9) return 479;
    if (quantity >= 10 && quantity <= 19) return 459;
    if (quantity >= 20) return 419;
    return 499;
  };

  // Calculate Signature Day T-shirt price
  const calculateSignatureDayPrice = (quantity) => {
    if (quantity <= 4) return 199;
    if (quantity <= 10) return 189;
    if (quantity <= 20) return 179;
    if (quantity <= 100) return 169;
    return 169;
  };
  const getCapUnitPrice = (quantity) => {
    if (quantity >= 30) return 59;
    if (quantity >= 20) return 69;
    if (quantity >= 10) return 79;
    return 99;
  };

  useEffect(() => {
    if (isCustomizedTShirt) {
      let price = calculateTShirtPrice(qty);
      // Round neck is 50 rupees less
      if (tshirtNeck === 'round') {
        price -= 50;
      }
      setTshirtBasePrice(price);
    } else if (isSignatureDayTShirt) {
      setSignatureDayBasePrice(calculateSignatureDayPrice(qty));
    }
  }, [qty, isCustomizedTShirt, isSignatureDayTShirt, tshirtNeck]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setMainImage(data.image || data.images?.[0] || "");
          fetchReviews(data._id || data.id);
        } else {
          const localProduct = products.find(item => item.id === id);
          setProduct(localProduct);
          if (localProduct) {
            setMainImage(localProduct.image);
            setReviews(localProduct.reviews || []);
          }
        }
      } catch {
        const localProduct = products.find(item => item.id === id);
        setProduct(localProduct);
        if (localProduct) {
          setMainImage(localProduct.image);
          setReviews(localProduct.reviews || []);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchPhoneModels = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/phone-models`);
        if (res.ok) {
          const data = await res.json();
          // backend returns an object { Company: [models] } but guard against other shapes
          if (!data) return setPhoneCompanies({});
          if (Array.isArray(data)) {
            // convert array of {company, models} to object
            const obj = {};
            data.forEach(d => { if (d && d.company) obj[d.company] = d.models || []; });
            setPhoneCompanies(obj);
          } else if (typeof data === 'object') {
            setPhoneCompanies(data);
          } else {
            setPhoneCompanies({});
          }
        }
      } catch (err) {
        console.log('Could not load phone models:', err);
      }
    };

    const fetchReviews = async (productId) => {
      try {
        setReviewsLoading(true);
        const r = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
        if (!r.ok) throw new Error('Failed');
        const d = await r.json();
        setReviews(Array.isArray(d) ? d : []);
      } catch (err) {
        console.log('Could not load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProduct();
    fetchPhoneModels();
  }, [id]);

  useEffect(() => { 
    if (product) { 
      setSelectedVariant(product.variants ? product.variants[0] : null); 
      setMainImage(product.image || product.images?.[0] || "");
    } 
    setVideoInvitationType('');
    setDigitalInvitationType('');
    setFrameColor('white');
    setFlowerWrapColor('pink');
    setRoseColor('white');
    setHamperPackageType('full-hamper');
    setBulkSizes({ S: '', M: '', L: '', XL: '', XXL: '' });
    setCustomText('');
    setValidationError('');
    setAddedToBagSuccess(false);
  }, [product]);

  // Add-on wrap price calculation
  const computeWrapPrice = useCallback((price, type) => {
    if (!type || type === 'none') return 0;
    if (isNaturalRosesWrapProduct) {
      return 400;
    }
    const p = Number(price || 0);
    if (type === 'normal') {
      // Standard wrap: ₹39 for products below ₹300, ₹69 for ₹300 and above
      return p < 300 ? 39 : 69;
    }
    if (type === 'premium') {
      // Premium wrap: ₹79 for products below ₹300, ₹99 for ₹300 and above
      return p < 300 ? 79 : 99;
    }
    return 0;
  }, [isNaturalRosesWrapProduct]);

  useEffect(() => {
    setWrapPrice(computeWrapPrice(product?.price, wrapType));
  }, [product, wrapType, computeWrapPrice]);

  const getBulkTotalQty = () => {
    return sizeOptions.reduce((sum, size) => sum + (Number(bulkSizes[size]) || 0), 0);
  };

  const getBulkDetails = () => {
    return sizeOptions
      .filter(size => (Number(bulkSizes[size]) || 0) > 0)
      .map(size => `${size}-${Number(bulkSizes[size])} pcs`)
      .join(', ');
  };

  const getFabricBasePrice = () => {
    if (!product?.fabrics?.length) return Number(product?.price || 0);
    const selected = product.fabrics.find(f => f.name === currentVariant.fabric);
    return Number(selected?.price || product.price || 0);
  };

  const calcFabricBasedUnitPrice = (quantity) => {
    const base = getFabricBasePrice();
    if (quantity >= 20) return base - 80;
    if (quantity >= 10) return base - 40;
    if (quantity >= 5) return base - 20;
    return base;
  };

  const calcQuantityBasedUnitPrice = (quantity) => {
    const tiers = (product?.quantityBasedPricing || []).slice().sort((a, b) => b.quantity - a.quantity);
    const match = tiers.find(t => quantity >= t.quantity);
    return Number(match?.price || product?.price || 0);
  };

  const handleAddToCart = () => {
    setValidationError('');

    // Validate MOQ for new t-shirts
    if (isNewStyleTShirt && product.minimumOrderQuantity > 1) {
      if (currentVariant.quantity < product.minimumOrderQuantity) {
        setValidationError(`Minimum order quantity is ${product.minimumOrderQuantity} pieces. Please select at least that many.`);
        return;
      }
    }
    
    if (isPhoneCase) {
      if (!phoneCompany || !phoneModel) {
        setValidationError('Please select your phone company and model before adding to bag.');
        return;
      }
    }

    if (isDigitalVideoInvitation && !videoInvitationType) {
      setValidationError('Please select the video invitation type before adding to bag.');
      return;
    }
    if (isDigitalInvitation && !digitalInvitationType) {
      setValidationError('Please select the invitation type before adding to bag.');
      return;
    }
    
    let customizationDetails = '';
    let itemPrice = Number(product.price || 0);
    const bulkTotalQty = getBulkTotalQty();
    const bulkDetails = getBulkDetails();
    let itemQuantity = bulkTotalQty > 0 ? bulkTotalQty : qty;
    const capUnitPrice = isCapProduct ? getCapUnitPrice(itemQuantity) : null;
    const fridgeMagnetUnitPrice = isFridgeMagnet ? (itemQuantity === 2 ? 149.5 : Number(product.price || 0)) : null;
    
    if (isNewStyleTShirt) {
      // Handle new fabric-based and quantity-based t-shirts
      customizationDetails = `${product.subcategoryName} T-Shirt: Fabric: ${currentVariant.fabric}, Color: ${currentVariant.color}, Size: ${currentVariant.size}, Qty: ${itemQuantity} pcs`;
      itemPrice = isFabricBasedTShirt ? calcFabricBasedUnitPrice(itemQuantity) : calcQuantityBasedUnitPrice(itemQuantity);
    } else if (isPolaroid) {
      const sizeName = polaroidPricing.selectedSize.charAt(0).toUpperCase() + polaroidPricing.selectedSize.slice(1);
      customizationDetails = `${sizeName} Polaroids: ${polaroidPricing.currentPricing.quantity} pieces @ ₹${polaroidPricing.currentPricing.unitPrice}/pc`;
      itemPrice = polaroidPricing.currentPricing.unitPrice;
      itemQuantity = polaroidPricing.currentPricing.quantity;
    } else if (isCustomizedTShirt) {
      const selectedColor = tshirtNeck === 'round' ? tshirtColor : 'N/A';
      customizationDetails = `Material: ${tshirtMaterial}, Neck: ${tshirtNeck}, Color: ${selectedColor}, Size: ${tshirtSize}, Qty: ${itemQuantity} pcs`;
      itemPrice = calculateTShirtPrice(itemQuantity) + (tshirtNeck === 'round' ? -50 : 0);
    } else if (isSignatureDayTShirt) {
      customizationDetails = `Signature Day T-Shirt, Color: White, Qty: ${itemQuantity} pcs`;
      itemPrice = calculateSignatureDayPrice(itemQuantity);
    } else if (isCapProduct) {
      customizationDetails = `Cap: ${itemQuantity} pcs @ ₹${capUnitPrice}/pc`;
      itemPrice = capUnitPrice;
    } else if (isFridgeMagnet) {
      itemPrice = fridgeMagnetUnitPrice;
    } else if (isDigitalVideoInvitation) {
      customizationDetails = `Video Invitation Type: ${videoInvitationType}`;
    } else if (isDigitalInvitation) {
      customizationDetails = `Invitation Type: ${digitalInvitationType}`;
    } else if (isFrameColorChoice) {
      customizationDetails = `Frame Color: ${frameColor}`;
    } else if (isFlowerProduct) {
      customizationDetails = isNaturalFlower
        ? `Wrap Color: ${flowerWrapColor}`
        : `Wrap Color: ${flowerWrapColor}, Rose Color: ${roseColor}, Decorative Lights: ${artificialLightsOption === 'with-lights' ? 'Yes (+₹50)' : 'No'}`;
    } else if (isPhoneCase) {
      customizationDetails = `Phone: ${phoneCompany} / ${phoneModel}`;
    } else if (isHamper) {
      if (isPremiumTransparentHamper && hamperPackageType === 'box-only') {
        itemPrice = 200;
      }
      customizationDetails = JSON.stringify(hamperItems);
    } else {
      customizationDetails = product.customizationDetails || '';
    }

    if (isAnyTShirt && bulkDetails) {
      customizationDetails = `${customizationDetails} | Bulk Sizes: ${bulkDetails}`;
    }
    
    if (isNaturalRosesWrapProduct) {
      itemPrice = wrapType === 'none' ? 499 : 899;
    }

    // Append photo and custom text details cleanly
    let extraNotes = [];
    if (isPhotoProduct) {
      extraNotes.push('Photos to be shared via WhatsApp');
    }
    if (customText.trim()) {
      extraNotes.push(`Text: "${customText.trim()}"`);
    }
    if (extraNotes.length > 0) {
      customizationDetails = customizationDetails 
        ? `${customizationDetails} • ${extraNotes.join(' • ')}`
        : extraNotes.join(' • ');
    }

    const artificialLightsPrice = isArtificialFlower && artificialLightsOption === 'with-lights' ? 50 : 0;
    const wrapLabel = isNaturalRosesWrapProduct
      ? (wrapType !== 'none' ? 'Wrap' : '')
      : (wrapType === 'normal' ? 'Standard Wrap' : (wrapType === 'premium' ? 'Premium Wrap' : ''));
    const addOnType = [wrapLabel, artificialLightsPrice > 0 ? 'Decorative Lights' : ''].filter(Boolean).join(' + ');
    const addOnPrice = (isNaturalRosesWrapProduct ? 0 : wrapPrice) + artificialLightsPrice;
    
    const item = { 
      ...product, 
      id: product._id || product.id, 
      price: itemPrice, 
      quantity: itemQuantity, 
      customizationDetails, 
      customText: customText.trim(),
      photoCount: 0,
      photoMode: 'whatsapp',
      addOn: { type: addOnType, price: addOnPrice }, 
      hamperItems, 
      hamperItemTotal 
    };

    addToCartContext(item);
    if (openCartDrawer) openCartDrawer();
    setAddedToBagSuccess(true);
    setTimeout(() => setAddedToBagSuccess(false), 5000);
  };


  const handleBuyNow = () => {
    setValidationError('');

    // Validate MOQ for new t-shirts
    if (isNewStyleTShirt && product.minimumOrderQuantity > 1) {
      if (currentVariant.quantity < product.minimumOrderQuantity) {
        setValidationError(`Minimum order quantity is ${product.minimumOrderQuantity} pieces. Please select at least that many.`);
        return;
      }
    }
    
    if (isPhoneCase) {
      if (!phoneCompany || !phoneModel) {
        setValidationError('Please select your phone company and model before checkout.');
        return;
      }
    }

    if (isDigitalVideoInvitation && !videoInvitationType) {
      setValidationError('Please select the video invitation type before checkout.');
      return;
    }
    if (isDigitalInvitation && !digitalInvitationType) {
      setValidationError('Please select the invitation type before checkout.');
      return;
    }
    
    let customizationDetails = '';
    let itemPrice = Number(product.price || 0);
    const bulkTotalQty = getBulkTotalQty();
    const bulkDetails = getBulkDetails();
    let itemQuantity = bulkTotalQty > 0 ? bulkTotalQty : qty;
    const capUnitPrice = isCapProduct ? getCapUnitPrice(itemQuantity) : null;
    const fridgeMagnetUnitPrice = isFridgeMagnet ? (itemQuantity === 2 ? 149.5 : Number(product.price || 0)) : null;
    
    if (isNewStyleTShirt) {
      // Handle new fabric-based and quantity-based t-shirts
      customizationDetails = `${product.subcategoryName} T-Shirt: Fabric: ${currentVariant.fabric}, Color: ${currentVariant.color}, Size: ${currentVariant.size}, Qty: ${itemQuantity} pcs`;
      itemPrice = isFabricBasedTShirt ? calcFabricBasedUnitPrice(itemQuantity) : calcQuantityBasedUnitPrice(itemQuantity);
    } else if (isPolaroid) {
      const sizeName = polaroidPricing.selectedSize.charAt(0).toUpperCase() + polaroidPricing.selectedSize.slice(1);
      customizationDetails = `${sizeName} Polaroids: ${polaroidPricing.currentPricing.quantity} pieces @ ₹${polaroidPricing.currentPricing.unitPrice}/pc`;
      itemPrice = polaroidPricing.currentPricing.unitPrice;
      itemQuantity = polaroidPricing.currentPricing.quantity;
    } else if (isCustomizedTShirt) {
      const selectedColor = tshirtNeck === 'round' ? tshirtColor : 'N/A';
      customizationDetails = `Material: ${tshirtMaterial}, Neck: ${tshirtNeck}, Color: ${selectedColor}, Size: ${tshirtSize}, Qty: ${itemQuantity} pcs`;
      itemPrice = calculateTShirtPrice(itemQuantity) + (tshirtNeck === 'round' ? -50 : 0);
    } else if (isSignatureDayTShirt) {
      customizationDetails = `Signature Day T-Shirt, Color: White, Qty: ${itemQuantity} pcs`;
      itemPrice = calculateSignatureDayPrice(itemQuantity);
    } else if (isCapProduct) {
      customizationDetails = `Cap: ${itemQuantity} pcs @ ₹${capUnitPrice}/pc`;
      itemPrice = capUnitPrice;
    } else if (isFridgeMagnet) {
      itemPrice = fridgeMagnetUnitPrice;
    } else if (isDigitalVideoInvitation) {
      customizationDetails = `Video Invitation Type: ${videoInvitationType}`;
    } else if (isDigitalInvitation) {
      customizationDetails = `Invitation Type: ${digitalInvitationType}`;
    } else if (isFrameColorChoice) {
      customizationDetails = `Frame Color: ${frameColor}`;
    } else if (isFlowerProduct) {
      customizationDetails = isNaturalFlower
        ? `Wrap Color: ${flowerWrapColor}`
        : `Wrap Color: ${flowerWrapColor}, Rose Color: ${roseColor}, Decorative Lights: ${artificialLightsOption === 'with-lights' ? 'Yes (+₹50)' : 'No'}`;
    } else if (isPhoneCase) {
      customizationDetails = `Phone: ${phoneCompany} / ${phoneModel}`;
    } else if (isHamper) {
      if (isPremiumTransparentHamper && hamperPackageType === 'box-only') {
        itemPrice = 200;
      }
      customizationDetails = JSON.stringify(hamperItems);
    } else {
      customizationDetails = product.customizationDetails || '';
    }

    if (isAnyTShirt && bulkDetails) {
      customizationDetails = `${customizationDetails} | Bulk Sizes: ${bulkDetails}`;
    }
    
    if (isNaturalRosesWrapProduct) {
      itemPrice = wrapType === 'none' ? 499 : 899;
    }

    // Append photo and custom text details cleanly
    let extraNotes = [];
    if (isPhotoProduct) {
      extraNotes.push('Photos to be shared via WhatsApp');
    }
    if (customText.trim()) {
      extraNotes.push(`Text: "${customText.trim()}"`);
    }
    if (extraNotes.length > 0) {
      customizationDetails = customizationDetails 
        ? `${customizationDetails} • ${extraNotes.join(' • ')}`
        : extraNotes.join(' • ');
    }

    const artificialLightsPrice = isArtificialFlower && artificialLightsOption === 'with-lights' ? 50 : 0;
    const wrapLabel = isNaturalRosesWrapProduct
      ? (wrapType !== 'none' ? 'Wrap' : '')
      : (wrapType === 'normal' ? 'Standard Wrap' : (wrapType === 'premium' ? 'Premium Wrap' : ''));
    const addOnType = [wrapLabel, artificialLightsPrice > 0 ? 'Decorative Lights' : ''].filter(Boolean).join(' + ');
    const addOnPrice = (isNaturalRosesWrapProduct ? 0 : wrapPrice) + artificialLightsPrice;
    
    const item = { 
      ...product, 
      id: product._id || product.id, 
      price: itemPrice, 
      quantity: itemQuantity, 
      customizationDetails, 
      customText: customText.trim(),
      photoCount: 0,
      photoMode: 'whatsapp',
      addOn: { type: addOnType, price: addOnPrice }, 
      hamperItems, 
      hamperItemTotal 
    };

    addToCartContext(item);
    navigate('/checkout');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center py-24">
      <InfinityLoader size="lg" label="Loading product..." />
    </div>
  );
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const images = product.images || [product.image];
  const bulkTotalQty = getBulkTotalQty();
  const effectiveQty = bulkTotalQty > 0 ? bulkTotalQty : qty;
  const tshirtUnitPrice = calculateTShirtPrice(effectiveQty) + (tshirtNeck === 'round' ? -50 : 0);
  const signatureUnitPrice = calculateSignatureDayPrice(effectiveQty);
  const newStyleUnitPrice = isNewStyleTShirt ? (isFabricBasedTShirt ? calcFabricBasedUnitPrice(effectiveQty) : calcQuantityBasedUnitPrice(effectiveQty)) : 0;
    const hamperBaseUnitPrice = isPremiumTransparentHamper && hamperPackageType === 'box-only'
      ? 200
      : Number(product.price || 0);
    const capUnitPrice = isCapProduct ? getCapUnitPrice(qty) : 0;
    const fridgeMagnetTotal = isFridgeMagnet
      ? (effectiveQty === 2 ? 299 : (product.price * effectiveQty))
      : 0;
    const baseDisplayTotalPrice = isNewStyleTShirt
      ? (newStyleUnitPrice * effectiveQty)
      : isCustomizedTShirt
        ? (tshirtUnitPrice * effectiveQty)
        : isSignatureDayTShirt
          ? (signatureUnitPrice * effectiveQty)
          : isCapProduct
            ? (capUnitPrice * qty)
          : isFridgeMagnet
            ? fridgeMagnetTotal
          : isHamper
            ? (hamperBaseUnitPrice * qty)
            : (product.price * qty);
  const displayTotalPrice = isNaturalRosesWrapProduct
    ? ((wrapType === 'none' ? 499 : 899) * effectiveQty)
    : baseDisplayTotalPrice;
  const flowerShortDescriptions = {
    bou3: '12 flowers, 12 polaroids, and 6 chocolates',
    bou4: '12 flowers, 12 polaroids, and a cake topper',
    bou5: '12 flowers, 12 polaroids, 6 chocolates, and a cake topper'
  };
  const flowerShortText = flowerShortDescriptions[productId];
    const capShortText = isCapProduct ? 'Bulk pricing: 10+ ₹79, 20+ ₹69, 30+ ₹59 per cap.' : '';
    const fridgeMagnetText = isFridgeMagnet ? 'Buy 2 for ₹299' : '';

  return (
    <div className="min-h-screen bg-[#FAF8F4] pb-28 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#687386] mb-8 flex-wrap">
          <Link to="/" className="hover:text-[#071A2F] transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/shop/${product.categoryId || 'frames'}`} className="hover:text-[#071A2F] transition-colors capitalize">
            {product.categoryId || 'Collection'}
          </Link>
          <span>/</span>
          <span className="text-[#071A2F] font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ================= LEFT 55-60%: LARGE PRODUCT GALLERY (Sticky on Desktop) ================= */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="motion-product-gallery aspect-[4/5] rounded-sm overflow-hidden shadow-[0_8px_30px_rgba(7,26,47,0.06)] border border-[#071A2F]/8 bg-[#FAF8F4] relative group flex items-center justify-center">
              {!isMainImgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F4] z-0">
                  <InfinityLoader size="md" />
                </div>
              )}
              {(() => {
                const src = getImageSrc(mainImage);
                if (!src) return <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No image</div>;
                return isDataUrl(src) ? (
                  <img 
                    loading="lazy" 
                    src={src} 
                    onLoad={() => setIsMainImgLoaded(true)}
                    className={`w-full h-full object-cover group-hover:scale-[1.02] transition-opacity duration-300 ease-out ${
                      isMainImgLoaded ? 'opacity-100' : 'opacity-0'
                    }`} 
                    alt={product.name} 
                  />
                ) : (
                  <picture className="block w-full h-full">
                    <source type="image/webp" srcSet={responsiveImage(mainImage).srcSet} sizes="(max-width: 1024px) 90vw, 55vw" />
                    <img 
                      loading="eager"
                      fetchPriority="high"
                      decoding="async" 
                      {...responsiveImage(mainImage, '(max-width: 1024px) 90vw, 55vw')}
                      onLoad={() => setIsMainImgLoaded(true)}
                      className={`w-full h-full object-cover group-hover:scale-[1.02] transition-opacity duration-300 ease-out ${
                        isMainImgLoaded ? 'opacity-100' : 'opacity-0'
                      }`} 
                      alt={product.name} 
                    />
                  </picture>
                );
              })()}

              {/* Handcrafted Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full shadow-xs z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#071A2F]">
                  Personalized Craft
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {images && images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => {
                  const thumbSrc = getImageSrc(img);
                  if (!thumbSrc) return null;
                  const isActive = img === mainImage;
                  return (
                    <button 
                      key={idx} 
                      onClick={() => setMainImage(img)} 
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white cursor-pointer ${
                        isActive ? 'border-[#071A2F] shadow-sm scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img {...responsiveImage(img, '80px')} alt={`${product.name}, view ${idx+1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Instagram reels below images (for digital video invitations) */}
            {isDigitalVideoInvitation && product && product.instagramLinks && product.instagramLinks.length > 0 && (
              <div className="mt-8 bg-white p-5 rounded-3xl border border-[#071A2F]/8 shadow-xs">
                <h4 className="font-bold text-sm text-[#071A2F] mb-3">Watch Sample Invitations on Instagram</h4>
                <InstagramReelButtons instagramLinks={product.instagramLinks} />
              </div>
            )}
          </div>

          {/* ================= RIGHT 40-45%: PRODUCT SPECIFICATIONS & STEP-BASED CUSTOMIZATION ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header: Name, Price, Description */}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C5A46D] mb-2 block">
                {product.categoryId || 'Custom Keepsake'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071A2F] leading-tight mb-3">
                {product.name}
              </h1>

              {/* Price & Real Discount Tag */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl sm:text-4xl font-black text-[#071A2F]">
                  ₹{displayTotalPrice}
                </span>
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <span className="text-base text-[#687386] line-through">
                    ₹{Number(product.originalPrice) * qty}
                  </span>
                )}
                <span className="text-xs text-[#687386]">Taxes included</span>
              </div>

              {(() => {
                const fullDesc = getProductFullDescription(product);
                return fullDesc ? (
                  <p className="text-sm text-[#687386] leading-relaxed font-light mb-4">
                    {fullDesc}
                  </p>
                ) : null;
              })()}

              {flowerShortText && (
                <div className="text-xs font-semibold text-[#123C69] bg-white p-3 rounded-xl border border-gray-100 mb-3">{flowerShortText}</div>
              )}
              {capShortText && (
                <div className="text-xs font-semibold text-[#123C69] bg-white p-3 rounded-xl border border-gray-100 mb-3">{capShortText}</div>
              )}
              {fridgeMagnetText && (
                <div className="text-xs font-semibold text-[#123C69] bg-white p-3 rounded-xl border border-gray-100 mb-3">{fridgeMagnetText}</div>
              )}
            </div>

            {/* ================= STEP 1 — CHOOSE YOUR OPTION ================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#071A2F]/8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071A2F] text-white text-xs font-black flex items-center justify-center">1</span>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#071A2F]">
                    CHOOSE YOUR OPTION
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                  Required
                </span>
              </div>

              {/* Frame Color Choice */}
              {isFrameColorChoice && (
                <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-gray-200/60">
                  <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-2">Frame Color</label>
                  <select
                    value={frameColor}
                    onChange={(e) => setFrameColor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F]"
                  >
                    <option value="white">White Minimal</option>
                    <option value="black">Classic Black</option>
                  </select>
                </div>
              )}

              {/* Flower Options */}
              {isFlowerProduct && (
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-2">Wrap Color</label>
                    <select
                      value={flowerWrapColor}
                      onChange={(e) => setFlowerWrapColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-rose-400"
                    >
                      <option value="pink">Pink Elegance</option>
                      <option value="red">Classic Red</option>
                      <option value="black">Luxury Black</option>
                      <option value="white marble design">White Marble Design</option>
                    </select>
                  </div>
                  {isArtificialFlower && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-2">Rose Color</label>
                        <select
                          value={roseColor}
                          onChange={(e) => setRoseColor(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-rose-400"
                        >
                          <option value="white">White</option>
                          <option value="blue">Blue</option>
                          <option value="purple">Purple</option>
                          <option value="red">Red</option>
                          <option value="yellow">Yellow</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-2">Decorative Lights</label>
                        <select
                          value={artificialLightsOption}
                          onChange={(e) => setArtificialLightsOption(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-rose-400"
                        >
                          <option value="without-lights">Without Lights</option>
                          <option value="with-lights">With Fairy Lights (+₹50)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Digital Invitation Type */}
              {isDigitalInvitation && (
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200">
                  <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-2">Invitation Type</label>
                  <select
                    value={digitalInvitationType}
                    onChange={(e) => { setDigitalInvitationType(e.target.value); setValidationError(''); }}
                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select invitation type</option>
                    {videoInvitationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Digital Video Invitation Type */}
              {isDigitalVideoInvitation && (
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200">
                  <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-2">Video Invitation Type</label>
                  <select
                    value={videoInvitationType}
                    onChange={(e) => { setVideoInvitationType(e.target.value); setValidationError(''); }}
                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select invitation type</option>
                    {videoInvitationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Phone Case: Company & Model Selection */}
              {isPhoneCase && (
                <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-gray-200/60 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5">Phone Company</label>
                    <select 
                      value={phoneCompany} 
                      onChange={(e) => { setPhoneCompany(e.target.value); setPhoneModel(''); setValidationError(''); }} 
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F]"
                    >
                      <option value="">Select Phone Brand (Apple, Samsung, etc.)</option>
                      {Object.keys(phoneCompanies).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5">Phone Model</label>
                    <select 
                      value={phoneModel} 
                      onChange={(e) => { setPhoneModel(e.target.value); setValidationError(''); }} 
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F]"
                    >
                      <option value="">Select Exact Model</option>
                      {(phoneCompanies[phoneCompany] || []).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[#687386]">Precision Camera & Port Cutouts:</span>
                    <span className="font-bold text-emerald-700">100% Guaranteed Fit</span>
                  </div>
                </div>
              )}

              {/* New Style T-Shirt Variant Selector */}
              {isNewStyleTShirt && product && (
                <ProductVariantSelector key={productId}
                  product={product} 
                  onVariantChange={setCurrentVariant}
                />
              )}

              {/* Polaroid Pricing Selector */}
              {isPolaroid && product && (
                <PolaroidPricingSelector key={productId}
                  onPricingChange={setPolaroidPricing}
                  productId={productId}
                />
              )}

              {/* Standard T-Shirt Configuration */}
              {isTShirt && !isNewStyleTShirt && (
                <div className="bg-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-indigo-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">T-Shirt Configuration</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Material Type</label>
                    <select value={tshirtMaterial} onChange={(e) => setTshirtMaterial(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none">
                      <option value="poly-cotton">Poly Cotton (Standard)</option>
                      <option value="pure-cotton">Pure Cotton (Premium)</option>
                      <option value="polyester">Polyester (Quality)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Neck Type</label>
                    <select value={tshirtNeck} onChange={(e) => setTshirtNeck(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#071A2F] focus:outline-none">
                      <option value="round">Round Neck (Crew Neck) - ₹50 Less</option>
                      <option value="collar">Collar Neck (Polo) - Base Price</option>
                    </select>
                  </div>

                  {tshirtNeck === 'round' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Color (Round Neck)</label>
                      <div className="flex gap-2 flex-wrap">
                        {roundNeckColors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setTshirtColor(color.name)}
                            type="button"
                            title={color.name}
                            aria-label={color.name}
                            className="relative cursor-pointer"
                          >
                            <div
                              className={`w-7 h-7 rounded-full border-2 transition ${
                                tshirtColor === color.name
                                  ? 'border-[#071A2F] ring-2 ring-[#071A2F]/30 scale-105'
                                  : 'border-gray-300 hover:border-gray-500'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Size</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['M', 'L', 'XL', 'XXL'].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setTshirtSize(size)}
                          className={`py-2 px-2 rounded-xl border-2 font-bold text-xs transition cursor-pointer ${
                            tshirtSize === size
                              ? 'border-[#071A2F] bg-[#071A2F] text-white'
                              : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Signature Day T-Shirt Configuration */}
              {isSignatureDayTShirt && (
                <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">Signature Day Edition</h3>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs text-amber-800 font-semibold">
                    Color: Archival White (Optimized for pen signatures)
                  </div>
                </div>
              )}

              {/* Bulk Order Sizes (Optional for T-Shirts) */}
              {isAnyTShirt && (
                <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-gray-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#071A2F]">Bulk Order Sizes</span>
                    <span className="text-[10px] text-gray-500 font-medium">Optional</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {sizeOptions.map((size) => (
                      <div key={size} className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-600 mb-1">{size}</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={bulkSizes[size]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setBulkSizes(prev => ({ ...prev, [size]: v === '' ? '' : Math.max(0, Number(v)) }));
                          }}
                          className="w-full px-2 py-1.5 border rounded-lg text-xs text-center focus:outline-none focus:border-[#071A2F]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hampers Customization */}
              {isHamper && (
                <div className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#071A2F] uppercase tracking-wider">Hamper Configuration</label>
                    {isPremiumTransparentHamper && (
                      <div className="mt-2.5 bg-white p-3 rounded-xl border border-blue-100 text-xs text-gray-700 space-y-2">
                        <p className="font-semibold">Package Type</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hamper-package-type"
                            checked={hamperPackageType === 'full-hamper'}
                            onChange={() => setHamperPackageType('full-hamper')}
                          />
                          <span>Full hamper with frames and items - ₹{product?.price || 0}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hamper-package-type"
                            checked={hamperPackageType === 'box-only'}
                            onChange={() => setHamperPackageType('box-only')}
                          />
                          <span>Box only packing - ₹200 + item costs</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {hamperItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-600">Custom Item {idx + 1}</span>
                        <button 
                          type="button"
                          onClick={() => { const newItems = hamperItems.filter((_, i) => i !== idx); setHamperItems(newItems); setHamperItemTotal(newItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)); }} 
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Item Name" value={item.name} onChange={(e) => { const newItems = [...hamperItems]; newItems[idx].name = e.target.value; setHamperItems(newItems); }} className="text-xs px-2.5 py-1.5 border rounded-lg focus:outline-none" />
                        <input type="text" placeholder="Product URL" value={item.link} onChange={(e) => { const newItems = [...hamperItems]; newItems[idx].link = e.target.value; setHamperItems(newItems); }} className="text-xs px-2.5 py-1.5 border rounded-lg focus:outline-none" />
                      </div>
                      <input type="number" placeholder="Price (₹)" value={item.price} onChange={(e) => { const newItems = [...hamperItems]; newItems[idx].price = e.target.value; setHamperItems(newItems); setHamperItemTotal(newItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)); }} className="w-full text-xs px-2.5 py-1.5 border rounded-lg focus:outline-none" min="0" />
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={() => setHamperItems([...hamperItems, { name: '', link: '', price: 0 }])} 
                    className="w-full text-xs py-2 px-3 border border-blue-400 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    + Add Custom Gift Item
                  </button>
                </div>
              )}

              {/* Standard Quantity Selector (if not fabric-based variant) */}
              {!isNewStyleTShirt && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#071A2F]">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-[#FAF8F4]">
                    <button 
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))} 
                      className="w-9 h-9 flex items-center justify-center font-black text-sm text-[#071A2F] hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-9 text-center font-bold text-sm text-[#071A2F]">{qty}</span>
                    <button 
                      type="button"
                      onClick={() => setQty(qty + 1)} 
                      className="w-9 h-9 flex items-center justify-center font-black text-sm text-[#071A2F] hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Gift Wrap Selector */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#071A2F]">Gift Wrap</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                    wrapType === 'none' ? 'border-[#071A2F] bg-[#071A2F]/5 font-bold' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="wrap" value="none" checked={wrapType === 'none'} onChange={() => setWrapType('none')} className="w-3.5 h-3.5 accent-[#071A2F]" />
                    <span>No Wrap</span>
                  </label>
                  <label className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                    wrapType === 'normal' ? 'border-[#071A2F] bg-[#071A2F]/5 font-bold' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="wrap" value="normal" checked={wrapType === 'normal'} onChange={() => setWrapType('normal')} className="w-3.5 h-3.5 accent-[#071A2F]" />
                    <span>{isNaturalRosesWrapProduct ? 'Wrap (₹400)' : `Standard (+₹${computeWrapPrice(product?.price, 'normal')})`}</span>
                  </label>
                  {!isNaturalRosesWrapProduct && (
                    <label className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                      wrapType === 'premium' ? 'border-[#071A2F] bg-[#071A2F]/5 font-bold' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="wrap" value="premium" checked={wrapType === 'premium'} onChange={() => setWrapType('premium')} className="w-3.5 h-3.5 accent-[#071A2F]" />
                      <span>{`Premium (+₹${computeWrapPrice(product?.price, 'premium')})`}</span>
                    </label>
                  )}
                </div>
              </div>

            </div>

            {/* ================= STEP 2 — PERSONALIZATION (WHATSAPP WORKFLOW) ================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#071A2F]/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071A2F] text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#071A2F]">
                    PERSONALIZATION
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF8F4] text-[#071A2F] border border-[#071A2F]/15 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                  WhatsApp Personalization
                </span>
              </div>

              {/* Premium Information Panel */}
              <div className="bg-[#FAF8F4] rounded-2xl p-5 border border-[#071A2F]/8 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#071A2F]">
                  <span className="text-base">📱</span>
                  <span>Send your photos on WhatsApp</span>
                </div>

                <p className="text-xs text-[#687386] leading-relaxed">
                  After placing your order, send us the photos you'd like to use along with your personalization details.
                </p>

                {/* 3 Step Visual Guide */}
                <div className="pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#C5A46D] mb-2.5">
                    PERSONALIZE YOUR GIFT
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-mono font-bold text-[#687386] block mb-0.5">STEP 1</span>
                      <p className="font-bold text-[#071A2F]">Choose your product options</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-mono font-bold text-[#687386] block mb-0.5">STEP 2</span>
                      <p className="font-bold text-[#071A2F]">Place your order</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-mono font-bold text-[#687386] block mb-0.5">STEP 3</span>
                      <p className="font-bold text-[#071A2F]">Send your photos on WhatsApp</p>
                    </div>
                  </div>
                </div>

                {/* Prominent SEND ON WHATSAPP Button */}
                <div className="pt-2 border-t border-gray-200/60">
                  <a
                    href={getWhatsAppUrl(buildProductPersonalizationWhatsAppMessage({
                      productName: product?.name,
                      quantity: effectiveQty
                    }))}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-[#071A2F] hover:bg-[#0B2748] text-white py-3.5 px-5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow cursor-pointer"
                  >
                    <WhatsAppIcon size={16} />
                    <span>SEND ON WHATSAPP</span>
                  </a>
                  <p className="text-[11px] text-[#687386] text-center mt-2 font-light">
                    Have questions or photos ready? Chat directly with our studio designers.
                  </p>
                </div>
              </div>
            </div>

            {/* ================= STEP 3 — ADD YOUR TEXT ================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#071A2F]/8 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071A2F] text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#071A2F]">
                    ADD YOUR TEXT
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071A2F] mb-1.5">
                  Names, Anniversary Dates, Quotes or Special Notes
                </label>
                <textarea
                  rows={2}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., 'Aakash & Pooja • 24.10.2023' or 'Happy 25th Anniversary Mom & Dad'"
                  className="w-full p-3.5 bg-[#FAF8F4] border border-gray-200 rounded-2xl text-xs text-[#071A2F] placeholder:text-gray-400 focus:outline-none focus:border-[#071A2F] focus:bg-white transition-all"
                />
                <p className="text-[11px] text-[#687386] mt-1 font-light">
                  Our studio designers will format typography, font balance, and placement carefully.
                </p>
              </div>
            </div>

            {/* ================= STEP 4 — REVIEW ================= */}
            <div className="bg-[#FAF8F4] rounded-3xl p-5 sm:p-6 border border-[#071A2F]/10 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#071A2F]/10">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071A2F] text-white text-xs font-bold flex items-center justify-center">4</span>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#071A2F]">
                    REVIEW CUSTOMIZATION
                  </h2>
                </div>
                <span className="text-xs font-black text-[#071A2F]">
                  Total: ₹{displayTotalPrice}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#071A2F]/90">
                <div className="flex justify-between">
                  <span className="text-[#687386]">Item:</span>
                  <span className="font-semibold text-right">{product.name} (x{effectiveQty})</span>
                </div>
                {isPhoneCase && phoneCompany && (
                  <div className="flex justify-between">
                    <span className="text-[#687386]">Phone Model:</span>
                    <span className="font-semibold text-right">{phoneCompany} {phoneModel || 'Not selected'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#687386]">Photos:</span>
                  <span className="font-semibold text-right">
                    {isPhotoProduct ? 'Send via WhatsApp after ordering' : 'Not required'}
                  </span>
                </div>
                {customText.trim() && (
                  <div className="flex justify-between">
                    <span className="text-[#687386]">Custom Text:</span>
                    <span className="font-semibold text-right truncate max-w-[200px]">"{customText.trim()}"</span>
                  </div>
                )}
                {wrapType !== 'none' && (
                  <div className="flex justify-between">
                    <span className="text-[#687386]">Gift Wrap:</span>
                    <span className="font-semibold text-right">{wrapType === 'premium' ? 'Premium Wrap' : 'Standard Wrap'} (+₹{wrapPrice})</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#071A2F]/10 flex items-center gap-2 text-[11px] text-[#687386]">
                <ShieldCheck size={14} className="text-[#C5A46D] flex-shrink-0" />
                <span>100% Satisfaction Guarantee • Verified before printing</span>
              </div>
            </div>

            {/* ================= STEP 5 — ADD TO BAG ================= */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1">
                <span className="w-6 h-6 rounded-full bg-[#071A2F] text-white text-xs font-black flex items-center justify-center">5</span>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#071A2F]">
                  ADD TO BAG
                </h2>
              </div>

              {/* Friendly Inline Validation Alert */}
              {validationError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Success Toast Banner */}
              {addedToBagSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                    <span className="font-bold">Added to your bag!</span>
                  </div>
                  <Link
                    to="/cart"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-full text-[11px] transition-colors"
                  >
                    VIEW BAG →
                  </Link>
                </div>
              )}

              {/* Primary Prominent Navy Button */}
              <button 
                onClick={handleAddToCart} 
                className="w-full bg-[#071A2F] hover:bg-[#0B2748] active:scale-[0.99] text-white py-4 px-6 rounded-full font-bold text-sm tracking-wider uppercase shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <ShoppingBag size={18} />
                <span>ADD TO BAG — ₹{displayTotalPrice}</span>
              </button>
              
              {/* Secondary Buy Now Button */}
              <button 
                onClick={handleBuyNow} 
                className="w-full bg-white hover:bg-[#FAF8F4] active:scale-[0.99] text-[#071A2F] border-2 border-[#071A2F]/20 hover:border-[#071A2F] py-3.5 px-6 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer"
              >
                BUY NOW
              </button>

              {/* Share Button */}
              <button 
                onClick={() => setShowShareModal(true)}
                className="w-full bg-transparent hover:bg-gray-100 text-[#6B7280] hover:text-[#071A2F] py-2 rounded-full font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Share this product"
              >
                <Share2 size={14} />
                <span>Share this Product</span>
              </button>

              {/* Studio Assurance & Delivery Promise */}
              <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#071A2F]/8 space-y-2 text-xs text-[#071A2F]">
                <div className="flex items-center gap-2 font-bold">
                  <Truck size={16} className="text-[#C5A46D]" />
                  <span>Estimated Delivery: 4–6 Business Days</span>
                </div>
                <p className="text-[#687386] font-light leading-relaxed pl-6">
                  Handcrafted with care in our studio. Verified with you via WhatsApp (+91 89859 93948) before printing to ensure 100% satisfaction.
                </p>
              </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                      <Share2 size={24} className="text-brand-blue" />
                      Share Product
                    </h3>
                    <button 
                      onClick={() => setShowShareModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-3">
                    
                    {/* WhatsApp */}
                    <button 
                      onClick={() => {
                        const text = `Check out ${product.name} for ₹${product.price} at Infinity Customizations!\n\n${window.location.href}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        setShowShareModal(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition">
                        <svg className="w-6 h-6 text-green-600 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52z"/>
                        </svg>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">WhatsApp</p>
                        <p className="text-xs text-gray-500">Share via WhatsApp</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-green-500 transition" />
                    </button>

                    {/* Instagram */}
                    <button 
                      onClick={() => {
                        const text = `Check out ${product.name} - ${window.location.href}`;
                        window.open(`https://www.instagram.com/?text=${encodeURIComponent(text)}`, '_blank');
                        setShowShareModal(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center group-hover:shadow-lg transition">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.265-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                        </svg>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">Instagram</p>
                        <p className="text-xs text-gray-500">Share via Instagram Stories</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-pink-500 transition" />
                    </button>

                    {/* Copy Link */}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopyLinkClicked(true);
                        setTimeout(() => setCopyLinkClicked(false), 2000);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-brand-blue hover:bg-blue-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-brand-blue transition">
                        {copyLinkClicked ? (
                          <Check size={24} className="text-green-600 group-hover:text-white transition" />
                        ) : (
                          <Copy size={24} className="text-brand-blue group-hover:text-white transition" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">
                          {copyLinkClicked ? 'Copied!' : 'Copy Link'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {copyLinkClicked ? 'Link copied to clipboard' : 'Copy product link to clipboard'}
                        </p>
                      </div>
                      {copyLinkClicked && <Check size={20} className="text-green-600" />}
                    </button>

                    {/* Email */}
                    <button 
                      onClick={() => {
                        const subject = `Check out ${product.name}`;
                        const body = `I found this amazing product: ${product.name} - ${window.location.href}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                        setShowShareModal(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition">
                        <Mail size={24} className="text-orange-600 group-hover:text-white transition" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-brand-dark">Email</p>
                        <p className="text-xs text-gray-500">Share via email</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 transition" />
                    </button>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <button 
                      onClick={() => setShowShareModal(false)}
                      className="w-full py-3 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              By placing an order, you agree to our{' '}
              <Link to="/terms-and-conditions" className="underline hover:text-brand-blue">Terms & Conditions</Link>
              {' '}and{' '}
              <Link to="/refund-cancellation-policy" className="underline hover:text-brand-blue">Refund & Cancellation Policy</Link>.
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Customer Reviews</h3>
              {reviewsLoading ? (
                <div className="py-6 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div></div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-yellow-600">{reviews.length ? (Math.round((reviews.reduce((a,b)=>a+b.rating,0)/reviews.length)*10)/10) : '—'}</div>
                    <div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                      <div className="text-xs text-gray-500">Based on {reviews.length} reviews</div>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    <div className="space-y-3">{reviews.slice(0,5).map((r,idx)=> (
                      <div key={idx} className="p-3 rounded-lg border bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center font-semibold text-sm">{(r.name||'U').charAt(0)}</div>
                            <div>
                              <p className="font-semibold text-sm">{r.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            </div>
                          </div>
                          <div className="text-sm text-yellow-600">{Array.from({length: Math.round(r.rating||0)}).map((_,i)=>(<span key={i}>★</span>))}{Array.from({length:5-Math.round(r.rating||0)}).map((_,i)=>(<span className="text-gray-300" key={i}>☆</span>))}</div>
                        </div>
                        <p className="text-sm text-gray-700">{r.comment}</p>
                      </div>
                    ))}</div>
                  )}

                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Leave a Review</h4>
                    <div className="p-3 border rounded text-sm text-gray-600 mb-3">Posting as: <span className="font-semibold">{user?.name || 'Anonymous'}</span>{!isAuthenticated ? ' — please login to post' : ''}</div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Rating (click to select)</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} className="text-3xl transition"
                            style={{ color: star <= reviewForm.rating ? '#F59E0B' : '#D1D5DB' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea value={reviewForm.comment} onChange={(e)=>setReviewForm({...reviewForm,comment:e.target.value})} rows={3} className="w-full p-3 border rounded mb-3" placeholder="Write your review (optional)"></textarea>
                    <button onClick={async ()=>{
                      if(!isAuthenticated) { alert('Please login to post a review'); navigate('/login'); return; }
                      try{
                        const productId = product._id || product.id;
                        if(!productId) throw new Error('Product ID not found');
                        const payload = { name: user?.name || 'Anonymous', rating: reviewForm.rating, comment: reviewForm.comment || '' };
                        console.log('Submitting review:', { productId, payload });
                        const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`,{
                          method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
                        });
                        const d = await res.json();
                        console.log('Review response:', d, 'Status:', res.status);
                        if(!res.ok) throw new Error(d?.message || 'Failed to submit review');
                        setReviews(prev=>[d.review || { ...payload, _id: Date.now().toString() }, ...prev]);
                        setReviewForm({ rating:5, comment:'' });
                        alert('Thanks for your review!');
                      }catch(err){console.error('Review error:', err);alert(`Failed to submit review: ${err.message}`)}
                    }} className="w-full px-4 py-2 bg-yellow-600 text-white rounded font-semibold hover:bg-yellow-700">Submit Review</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Purchase Bar on Mobile with Safe Area Inset and Tactile 3D Button */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-[#FAF8F4]/95 backdrop-blur-xl px-4 pt-3 pb-[calc(14px+env(safe-area-inset-bottom,0px))] z-40 border-t border-[#071A2F]/10 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(7,26,47,0.1)]">
        <div>
          <span className="text-[10px] text-[#687386] block font-bold uppercase tracking-wider">Price</span>
          <span className="text-xl font-black text-[#071A2F]">₹{displayTotalPrice}</span>
        </div>
        <button 
          onClick={handleAddToCart}
          className="btn-physical-3d flex-1 bg-[#071A2F] active:bg-[#0B2748] text-white py-3.5 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <ShoppingBag size={15} /> 
          <span>{isPhotoProduct || isCustomizedTShirt || isSignatureDayTShirt ? 'CUSTOMIZE & BUY' : 'ADD TO BAG'}</span>
        </button>
      </div>

      <RelatedProducts currentProduct={product} />
    </div>
  );
};

const RelatedProducts = ({ currentProduct }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);

  const relatedProductId = String(currentProduct?._id || currentProduct?.id || '');
  const relatedCategoryId = currentProduct?.categoryId;
  useEffect(() => {
    let cancelled = false;
    const loadRelated = async () => {
      if (!relatedCategoryId) {
        if (!cancelled) setRelated([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/products/category/${relatedCategoryId}`);
        if (!res.ok) throw new Error('Failed to load related products');
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const currentId = relatedProductId;
        const filtered = list.filter(p => String(p._id || p.id || '') !== currentId).slice(0, 4);
        if (!cancelled) setRelated(filtered);
      } catch {
        if (!cancelled) setRelated([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadRelated();
    return () => { cancelled = true; };
  }, [relatedProductId, relatedCategoryId]);

  if (!currentProduct || loading || related.length === 0) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-12 border-t border-[#071A2F]/8">
      <div className="mb-8">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1">
          Complete the Moment
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#071A2F] tracking-tight">
          You May Also Cherish
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {related.map(p => (
          <ProductCard key={p._id || p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

const Cart = ({ items, updateQuantity, removeItem }) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    const recommendedProducts = products.slice(0, 4);
    return (
      <div className="min-h-[70vh] bg-[#FAF8F4] py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#071A2F] mx-auto mb-6 shadow-sm border border-[#071A2F]/8">
            <ShoppingBag size={32} className="text-[#071A2F]" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071A2F] mb-3 tracking-tight">
            YOUR BAG IS WAITING FOR SOMETHING PERSONAL.
          </h1>
          <p className="text-xs sm:text-sm text-[#687386] mb-8 max-w-md mx-auto font-light leading-relaxed">
            Turn your favorite memories into custom frames, keepsake polaroids, printed apparel, or bespoke magazines.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-[#071A2F] hover:bg-[#0B2748] text-white px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all"
          >
            <span>SHOP GIFTS</span>
            <span className="text-[#C5A46D]">→</span>
          </Link>
        </div>

        {/* Real Product Recommendations */}
        <div className="max-w-6xl mx-auto border-t border-[#071A2F]/8 pt-10">
          <h2 className="text-center font-bold text-lg sm:text-xl text-[#071A2F] mb-6">
            Recommended For You
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendedProducts.map(p => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const subtotal = items.reduce((acc, item) => {
    const addOnTotal = item.addOn && item.addOn.price ? Number(item.addOn.price) * item.quantity : 0;
    return acc + (Number(item.price || 0) * item.quantity) + addOnTotal;
  }, 0);

  const calcShippingForItems = (items) => {
    let s = 0;
    let hasPolaroids = false;
    items.forEach(item => {
      // Exclude digital products (video invitations, etc.) from shipping
      if (item.id === 'd4' || item._id === 'd4') {
        return;
      }
      if (['pol1', 'pol2', 'pol3'].includes(String(item.id || item._id || ''))) {
        hasPolaroids = true;
        return;
      }
      const price = Number(item.price || 0);
      let per = 150;
      if (price < 300) per = 69;
      else if (price <= 500) per = 99;
      else {
        const extra = Math.min(30, Math.max(0, Math.floor((price - 500) / 100) * 10));
        per = 150 + extra;
      }
      s += per * (item.quantity || 1);
    });
    if (hasPolaroids) {
      s += 69;
    }
    return s;
  };
  const shipping = calcShippingForItems(items);
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071A2F] mb-8 tracking-tight">
          YOUR BAG <span className="text-[#687386] text-xl font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            {items.map((item, i) => (
              <div key={item.id || item._id || i} className="bg-white p-4 sm:p-5 rounded-3xl border border-[#071A2F]/8 flex gap-4 sm:gap-5 shadow-xs hover:shadow-md transition-shadow">
                <img loading="lazy" src={item.image} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-gray-100 flex-shrink-0" alt="" />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-[#071A2F] text-base">{item.name}</h3>
                      {item.variant && <p className="text-xs text-[#687386] mt-0.5">{item.variant}</p>}
                      {item.customizationDetails && (
                        <p className="text-[11px] text-[#C5A46D] font-medium mt-1 line-clamp-2">
                          {item.customizationDetails}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id || item._id)} 
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-[#F7F8FA]">
                      <button onClick={() => updateQuantity(item.id || item._id, Math.max(1, item.quantity - 1))} className="px-3 py-1 text-[#071A2F] hover:bg-gray-200 font-bold transition-colors">-</button>
                      <span className="px-3 font-bold text-sm text-[#071A2F]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)} className="px-3 py-1 text-[#071A2F] hover:bg-gray-200 font-bold transition-colors">+</button>
                    </div>
                    <span className="font-black text-lg text-[#071A2F]">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                  {item.addOn && item.addOn.price ? (
                    <div className="text-xs font-semibold text-[#687386] mt-2">
                      ({item.addOn.type || 'Add-on'}) ₹{item.addOn.price} x {item.quantity} = ₹{(item.addOn.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#071A2F]/8 shadow-sm sticky top-28">
              <h3 className="font-bold text-base text-[#071A2F] mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-[#687386]">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#071A2F]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#687386]">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#071A2F]">₹{shipping.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between font-black text-lg text-[#071A2F]">
                  <span>Total Amount</span>
                  <span className="text-[#123C69]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/checkout')} 
                className="w-full bg-[#071A2F] hover:bg-[#0B2748] text-white py-4 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                PROCEED TO CHECKOUT
              </button>
              <p className="text-xs text-center text-[#687386] mt-3 font-medium">
                Personalization photos can be sent through WhatsApp after placing your order.
              </p>
              <p className="text-[11px] text-center text-[#687386] mt-2 font-light">
                Safe & encrypted checkout • Verification before print
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => (
  <div className="min-h-[70vh] bg-[#FAF8F4] flex flex-col items-center justify-center px-4 py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#071A2F] mx-auto mb-5 shadow-xs border border-[#071A2F]/10">
      <span className="font-mono font-black text-xl text-[#C5A46D]">404</span>
    </div>
    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071A2F] mb-3 tracking-tight">
      THIS MEMORY SEEMS TO HAVE GONE MISSING.
    </h1>
    <p className="text-xs sm:text-sm text-[#687386] mb-8 max-w-md font-light leading-relaxed">
      The page you were looking for doesn't exist or has moved. Explore our personalized collections instead.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        to="/"
        className="bg-[#071A2F] hover:bg-[#0B2748] text-white px-7 py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all"
      >
        BACK HOME
      </Link>
      <Link
        to="/shop"
        className="bg-white hover:bg-[#FAF8F4] text-[#071A2F] border border-[#071A2F]/15 px-7 py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-xs transition-all"
      >
        SHOP GIFTS →
      </Link>
    </div>
  </div>
);

// --- 5. MAIN APP WRAPPER ---

const AppContent = () => {
  const { cart, addToCart, updateQuantity, removeFromCart, isCartDrawerOpen, closeCartDrawer } = useCart();
  const location = useLocation();

  const isNavHidden = 
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/product/') ||
    location.pathname.startsWith('/admin');

  return (
    <div className={`${location.pathname === '/' ? 'home-shell' : ''} min-h-screen font-sans bg-[#F7F8FA] text-[#071A2F] flex flex-col ${
      isNavHidden ? '' : 'pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px)+16px)] md:pb-0'
    }`}>
      {location.pathname !== '/' && <AnnouncementBar />}
      <MemoryInteractions />
      <Navbar cartCount={cart.length} />
      <CartDrawer isOpen={isCartDrawerOpen} onClose={closeCartDrawer} />
      <React.Suspense fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center bg-[#FAF8F4]">
          <InfinityLoader size="md" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<AccountCenter />} />
          <Route path="/profile" element={<AccountCenter />} />
          <Route path="/orders" element={<AccountCenter />} />
          <Route path="/shop" element={<CategoryPage />} />
          <Route path="/shop/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart items={cart} updateQuantity={updateQuantity} removeItem={removeFromCart} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<LegalPage legalKey="about" />} />
          <Route path="/contact" element={<LegalPage legalKey="contact" />} />
          <Route path="/privacy-policy" element={<LegalPage legalKey="privacy" />} />
          <Route path="/terms-and-conditions" element={<LegalPage legalKey="terms" />} />
          <Route path="/refund-cancellation-policy" element={<LegalPage legalKey="refund" />} />
          <Route path="/shipping-policy" element={<LegalPage legalKey="shipping" />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/phone-models" element={<AdminPhoneModels />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
      <Footer />
      {location.pathname !== '/' && <MobileBottomNav />}
    </div>
  );
};

// --- 6. APP ENTRYPOINT ---

export default function App() {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      <IntroContext.Provider value={{ isIntroActive: false, introPhase: 'completed' }}>
        <AuthProvider>
          <CartProvider>
            <InfinityAIProvider>
              <QuickViewProvider>
                <Router>
                  <ScrollToTop />
                  {loading && <GlobalLoader />}
                  <AppContent />
                  <QuickViewModal />
                  <InfinityAIModal />
                </Router>
              </QuickViewProvider>
            </InfinityAIProvider>
          </CartProvider>
        </AuthProvider>
      </IntroContext.Provider>
    </LoaderContext.Provider>
  );
}
