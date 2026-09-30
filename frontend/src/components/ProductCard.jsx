import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, ArrowRight, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getImageSrc, isDataUrl } from '../utils/imageUtils';
import QuickViewModal from './QuickViewModal';
import InfinityLoader from './InfinityLoader';

const ProductCard = ({ product, showCategory = true }) => {
  const { addToCart, openCartDrawer } = useCart();
  const [added, setAdded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_wishlist');
      const list = saved ? JSON.parse(saved) : [];
      return list.includes(product?._id || product?.id);
    } catch (e) {
      return false;
    }
  });

  if (!product) return null;

  const productId = product._id || product.id;
  const imageSrc = getImageSrc(product.images?.[0] || product.image);
  const price = Number(product.price || 0);

  // Compute real average rating ONLY if reviews exist
  const hasReviews = Array.isArray(product.reviews) && product.reviews.length > 0;
  const avgRating = hasReviews
    ? (product.reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / product.reviews.length).toFixed(1)
    : null;

  // Real discount check
  const hasRealDiscount = product.originalPrice && Number(product.originalPrice) > price;
  const discountPercent = hasRealDiscount
    ? Math.round(((Number(product.originalPrice) - price) / Number(product.originalPrice)) * 100)
    : null;

  // Most items at Infinity Customizations require personalization (photos, custom text, sizes, phone models).
  // Only explicitly non-customized or accessory items allow direct add-to-bag without configuration.
  const requiresPersonalization = product.requiresCustomization !== false && (
    Boolean(product.categoryId) || 
    Boolean(product.variants?.length) || 
    Boolean(product.fabrics?.length) ||
    Boolean(product.isCustomized) ||
    !product.canDirectBuy
  );

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('infinity_wishlist');
      const list = saved ? JSON.parse(saved) : [];
      let updated;
      if (list.includes(productId)) {
        updated = list.filter(id => id !== productId);
        setIsWishlisted(false);
      } else {
        updated = [...list, productId];
        setIsWishlisted(true);
      }
      localStorage.setItem('infinity_wishlist', JSON.stringify(updated));
    } catch (err) {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      id: productId,
      price: price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      if (openCartDrawer) openCartDrawer();
    }, 500);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-[#071A2F]/8 p-3 sm:p-4 shadow-[0_2px_10px_rgba(7,26,47,0.03)] hover:shadow-[0_16px_36px_rgba(7,26,47,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      
      {/* Top Image Showcase */}
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF8F4] mb-3.5">
        
        {/* Badges: Best Seller / Real Discount */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {product.isBestSeller && (
            <span className="bg-[#071A2F] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
              Best Seller
            </span>
          )}
          {hasRealDiscount && (
            <span className="bg-[#C5A46D] text-[#071A2F] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label="Save to Wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#071A2F] hover:bg-white shadow-xs transition-all duration-200 cursor-pointer"
        >
          <Heart 
            size={15} 
            className={`transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-[#071A2F]/70 hover:text-red-500'}`} 
          />
        </button>

        {/* Desktop Quick View Button (Smoothly appears on card hover) */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-[#071A2F] text-[11px] font-bold py-2 px-3.5 rounded-full shadow-md backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <Eye size={13} className="text-[#071A2F]" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Product Image with Restrained Zoom & Horizontal 8 Infinity Loader */}
        <Link to={`/product/${productId}`} className="relative block w-full h-full overflow-hidden">
          {!isImgLoaded && imageSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F4] z-0">
              <InfinityLoader size="sm" />
            </div>
          )}
          {imageSrc ? (
            isDataUrl(imageSrc) ? (
              <img
                loading="lazy"
                src={imageSrc}
                alt={product.name}
                onLoad={() => setIsImgLoaded(true)}
                className={`w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-400 ease-out ${
                  isImgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <picture>
                <source type="image/webp" srcSet={`${imageSrc}?q=75&w=400 400w, ${imageSrc}?q=75&w=700 700w`} />
                <img
                  loading="lazy"
                  decoding="async"
                  src={imageSrc}
                  alt={product.name}
                  onLoad={() => setIsImgLoaded(true)}
                  className={`w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-400 ease-out ${
                    isImgLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </picture>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B7280] text-xs">
              Photo preview
            </div>
          )}
        </Link>
      </div>

      {/* Product Information: Strict 4-Part Hierarchy (Image, Name, Price, Action) */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title */}
          <Link to={`/product/${productId}`} className="block">
            <h3 className="font-semibold text-sm sm:text-base text-[#071A2F] hover:text-[#123C69] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Clean 1-line benefit/description */}
          {product.description && (
            <p className="text-[11px] sm:text-xs text-[#687386] line-clamp-1 mt-1 font-light">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Obvious Primary Action */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#071A2F]/5 gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#687386] leading-none mb-0.5">
              {requiresPersonalization ? 'From' : 'Price'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-[#071A2F] leading-tight">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {hasRealDiscount && (
                <span className="text-[11px] text-[#687386] line-through">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Action Button: CUSTOMIZE & BUY for personalized items, ADD TO BAG for direct purchase */}
          {requiresPersonalization ? (
            <Link
              to={`/product/${productId}`}
              className="inline-flex items-center justify-center gap-1 bg-[#071A2F] hover:bg-[#0B2748] text-white text-[11px] sm:text-xs font-bold py-2 px-3 sm:px-3.5 rounded-xl shadow-xs hover:shadow transition-all active:scale-95 min-h-[38px] flex-shrink-0"
            >
              <span>CUSTOMIZE & BUY</span>
              <ArrowRight size={12} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold py-2 px-3 sm:px-3.5 rounded-xl shadow-xs transition-all active:scale-95 min-h-[38px] flex-shrink-0 cursor-pointer ${
                added 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#071A2F] hover:bg-[#0B2748] text-white'
              }`}
            >
              {added ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Add to Bag
                </>
              )}
            </button>
          )}
        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </div>
  );
};

export default ProductCard;
