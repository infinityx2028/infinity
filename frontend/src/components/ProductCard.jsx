import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, ArrowRight, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useQuickView } from '../contexts/QuickViewContext';
import { getImageSrc } from '../utils/imageUtils';
import { getProductShortDescription } from '../data/productDescriptions';
import InfinityLoader from './InfinityLoader';

const ProductCard = ({ product, showCategory = true }) => {
  const { addToCart, openCartDrawer } = useCart();
  const { openQuickView } = useQuickView();
  const [added, setAdded] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
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

  // Real discount check
  const hasRealDiscount = product.originalPrice && Number(product.originalPrice) > price;
  const discountPercent = hasRealDiscount
    ? Math.round(((Number(product.originalPrice) - price) / Number(product.originalPrice)) * 100)
    : null;

  // Most items at Infinity Customizations require personalization (photos, custom text, sizes, phone models).
  const requiresPersonalization = product.requiresCustomization !== false && (
    Boolean(product.categoryId) || 
    Boolean(product.variants?.length) || 
    Boolean(product.fabrics?.length) ||
    Boolean(product.isCustomized) ||
    !product.canDirectBuy
  );

  const isCase = 
    product.categoryId === 'cases' || 
    product.categoryId === 'essentials' || 
    (product.name && product.name.toLowerCase().includes('case'));

  const isPolaroid =
    product.categoryId === 'memories' ||
    (product.name && product.name.toLowerCase().includes('polaroid'));

  const shortDescription = getProductShortDescription(product);

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
    <div 
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
      className="group relative bg-white rounded-2xl border border-[#071A2F]/8 p-2.5 sm:p-4 shadow-[0_2px_12px_rgba(7,26,47,0.04)] hover:shadow-[0_12px_28px_rgba(7,26,47,0.08)] active:scale-[0.985] transition-all duration-200 flex flex-col h-full justify-between select-none"
    >
      
      {/* 1. PRODUCT IMAGE CONTAINER (Strict 1:1 Aspect Ratio + 3D Depth) */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FAF8F4] mb-2 sm:mb-2.5 flex-shrink-0 shadow-[0_2px_8px_rgba(7,26,47,0.04)]">
        
        {/* Badges: Top-Left */}
        <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-[#071A2F] text-white text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-xs">
              Best Seller
            </span>
          )}
          {hasRealDiscount && (
            <span className="bg-[#C5A46D] text-[#071A2F] text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button: Top-Right */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label="Save to Wishlist"
          className="absolute top-1.5 right-1.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#071A2F] hover:bg-white shadow-xs transition-all duration-200 cursor-pointer"
        >
          <Heart 
            size={13} 
            className={`transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-[#071A2F]/70 hover:text-red-500'}`} 
          />
        </button>

        {/* Quick View Button (hover on desktop, subtle pill on mobile) */}
        <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 z-10 flex justify-center opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickView(product);
            }}
            className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-[#071A2F] text-[10.5px] sm:text-[11px] font-bold py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-full shadow-md backdrop-blur-md transition-all active:scale-95 sm:hover:scale-105 cursor-pointer"
          >
            <Eye size={12} className="text-[#071A2F]" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Product Image Link */}
        <Link to={`/product/${productId}`} className="relative block w-full h-full overflow-hidden">
          {!isImgLoaded && !isImgError && imageSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F4] z-0">
              <InfinityLoader size="sm" />
            </div>
          )}

          {imageSrc && !isImgError ? (
            <img
              loading="lazy"
              decoding="async"
              src={imageSrc}
              alt={product.name}
              onLoad={() => setIsImgLoaded(true)}
              onError={() => {
                setIsImgError(true);
                setIsImgLoaded(true);
              }}
              className={`w-full h-full ${
                isCase ? 'object-contain p-2.5' : isPolaroid ? 'object-cover p-1 bg-white' : 'object-cover'
              } group-hover:scale-[1.03] group-active:scale-[1.03] transition-transform duration-300 ease-out ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F4F5F7] p-2 text-center">
              <span className="text-[10px] font-bold text-[#071A2F] line-clamp-1">{product.name}</span>
              <span className="text-[8px] uppercase tracking-wider text-[#687386] mt-0.5">{product.categoryId || 'Personalized'}</span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. PRODUCT INFORMATION (In Flow Above CTA) */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div>
          {/* Subtle Category Pill on Desktop only */}
          {showCategory && product.categoryId && (
            <span className="hidden sm:block text-[9px] uppercase font-bold tracking-wider text-[#C5A46D] mb-0.5">
              {product.categoryId}
            </span>
          )}

          {/* Product Title (Max 2 lines, line-clamp-2) */}
          <Link to={`/product/${productId}`} className="block">
            <h3 className="font-bold text-[14px] sm:text-[15px] text-[#071A2F] hover:text-[#123C69] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description (Hidden on mobile to save space, visible on tablet+) */}
          {shortDescription && (
            <p className="hidden sm:block text-[11px] text-[#687386] line-clamp-2 mt-1 font-light leading-snug">
              {shortDescription}
            </p>
          )}
        </div>

        {/* Price (ALWAYS visible, above CTA in document flow) */}
        <div className="pt-1.5 pb-1">
          <span className="text-[8.5px] uppercase font-bold text-[#687386] block leading-none mb-0.5">
            {requiresPersonalization ? 'From' : 'Price'}
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[16px] font-extrabold text-[#071A2F] leading-none">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {hasRealDiscount && (
              <span className="text-[10px] text-[#687386] line-through leading-none">
                ₹{Number(product.originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. CTA IN NORMAL DOCUMENT FLOW (44px height, full width) */}
      <div className="w-full mt-auto pt-1">
        {requiresPersonalization ? (
          <Link
            to={`/product/${productId}`}
            className="btn-physical-3d w-full h-[44px] min-h-[44px] px-2 bg-[#071A2F] hover:bg-[#0B2748] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 text-center whitespace-nowrap cursor-pointer transition-colors"
          >
            <span>CUSTOMIZE</span>
            <ArrowRight size={13} className="flex-shrink-0" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`btn-physical-3d w-full h-[44px] min-h-[44px] px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 text-center whitespace-nowrap cursor-pointer transition-colors ${
              added 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#071A2F] hover:bg-[#0B2748] text-white'
            }`}
          >
            {added ? (
              <>
                <Check size={13} className="flex-shrink-0" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={13} className="flex-shrink-0" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
