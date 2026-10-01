import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight, MessageCircle } from 'lucide-react';
import { useQuickView } from '../contexts/QuickViewContext';
import { getProductShortDescription } from '../data/productDescriptions';
import InfinityLoader from './InfinityLoader';
import { responsiveImage } from '../utils/responsiveImages';

const QuickViewModal = ({ product: propProduct, isOpen: propIsOpen, onClose: propOnClose }) => {
  const navigate = useNavigate();
  const context = useQuickView();
  const [isImgLoaded, setIsImgLoaded] = React.useState(false);
  const scrollPositionRef = useRef(0);
  const dialogRef = useRef(null);

  // Support both single-context and direct props (if any)
  const product = propProduct || context?.quickViewProduct;
  const isOpen = propIsOpen !== undefined ? propIsOpen : context?.isOpen;
  const handleClose = propOnClose || context?.closeQuickView;

  // Lock background scrolling and restore position on close
  useEffect(() => {
    if (isOpen) {
      scrollPositionRef.current = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const previousFocus = document.activeElement;
      dialogRef.current?.querySelector('button')?.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && handleClose) handleClose();
        if (e.key === 'Tab') {
          const targets = dialogRef.current?.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]');
          if (!targets?.length) return;
          const first = targets[0];
          const last = targets[targets.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        previousFocus?.focus({ preventScroll: true });
      };
    }
  }, [isOpen, handleClose]);

  // Reset image loaded state when product changes
  useEffect(() => {
    setIsImgLoaded(false);
  }, [product?._id, product?.id]);

  if (!isOpen || !product) return null;

  const productId = product._id || product.id;
  const price = Number(product.price || 0);
  const hasRealDiscount = product.originalPrice && Number(product.originalPrice) > price;
  const discountPercent = hasRealDiscount
    ? Math.round(((Number(product.originalPrice) - price) / Number(product.originalPrice)) * 100)
    : null;

  const isCase = 
    product.categoryId === 'cases' || 
    product.categoryId === 'essentials' || 
    (product.name && product.name.toLowerCase().includes('case'));

  const isPolaroid =
    product.categoryId === 'memories' ||
    (product.name && product.name.toLowerCase().includes('polaroid'));

  const shortDescription = getProductShortDescription(product);

  const handleCustomizeAndBuy = (e) => {
    e.preventDefault();
    if (handleClose) handleClose();
    navigate(`/product/${productId}`);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && handleClose) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#03101D]/55 backdrop-blur-xs transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      {/* 
        Modal Container:
        Mobile (<768px): Width calc(100vw - 16px), Max Width 430px, Max Height calc(100dvh - 16px), Margin 8px, Radius 22px
        Desktop (>=768px): Max Width 960px, Two Columns (Image Left, Details Right)
      */}
      <div 
        className="relative w-[calc(100vw-16px)] max-w-[430px] md:max-w-4xl max-h-[calc(100dvh-16px)] sm:max-h-[90vh] bg-white rounded-[22px] sm:rounded-3xl shadow-[0_20px_60px_rgba(3,16,29,0.28)] border border-[#071A2F]/10 flex flex-col md:flex-row overflow-hidden animate-quickview-open select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* [ X ] Close Button: Fixed top-right, clearly visible, never overlaps content */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close Quick View"
          className="absolute top-3 right-3 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#071A2F] flex items-center justify-center shadow-md border border-[#071A2F]/10 transition-transform active:scale-90 hover:scale-105 cursor-pointer"
        >
          <X size={17} />
        </button>

        {/* 1. PRODUCT IMAGE CONTAINER (1:1 Ratio, max-height 300-340px) */}
        <div className="w-full md:w-1/2 aspect-square max-h-[300px] sm:max-h-[340px] md:max-h-none bg-[#FAF8F4] relative overflow-hidden flex-shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#071A2F]/8">
          {!isImgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F4] z-0">
              <InfinityLoader size="md" />
            </div>
          )}

          {/* Clean image without scaleX/scaleY/rotate transforms */}
          <img
            {...responsiveImage(product.images?.[0] || product.image, '(max-width: 767px) 90vw, 460px')}
            alt={product.name}
            onLoad={() => setIsImgLoaded(true)}
            className={`w-full h-full ${
              isCase ? 'object-contain p-4' : isPolaroid ? 'object-cover p-2 bg-white' : 'object-cover'
            } transition-opacity duration-300 ${
              isImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {product.isBestSeller && (
            <span className="absolute top-3 left-3 bg-[#071A2F] text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs z-10">
              Best Seller
            </span>
          )}
        </div>

        {/* 2. PRODUCT DETAILS CONTAINER (Strict information order, vertical scroll only) */}
        <div className="w-full md:w-1/2 p-4 sm:p-7 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0">
          
          <div className="space-y-2.5">
            {/* CATEGORY (10-11px) */}
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#C5A46D] block leading-none">
              {product.categoryId || 'Personalized Keepsake'}
            </span>

            {/* PRODUCT NAME (22-26px, Manrope 700) */}
            <h2 
              id="quickview-title"
              className="text-[22px] sm:text-[25px] font-bold text-[#071A2F] tracking-tight leading-snug break-words"
            >
              {product.name}
            </h2>

            {/* REAL PRICE (20-22px, Manrope 700) */}
            <div className="flex items-baseline gap-2.5 flex-wrap pt-0.5">
              <span className="text-[20px] sm:text-[22px] font-bold text-[#071A2F] leading-none">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {hasRealDiscount && (
                <>
                  <span className="text-xs text-[#687386] line-through leading-none">
                    ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#071A2F] bg-[#C5A46D]/20 px-2 py-0.5 rounded-full">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* PRODUCT-SPECIFIC DESCRIPTION (14px, line-height 1.5-1.6, full-width lines) */}
            <p className="text-[14px] text-[#4A5568] leading-[1.55] font-normal pt-1">
              {shortDescription}
            </p>

            {/* CUSTOMIZATION / ORDER NOTE (Clear, NO in-app photo upload) */}
            <div className="bg-[#FAF8F4] border border-[#071A2F]/8 rounded-xl p-3 flex items-start gap-2.5 my-2">
              <MessageCircle size={16} className="text-[#25D366] flex-shrink-0 mt-0.5" />
              <p className="text-[11.5px] sm:text-xs text-[#071A2F]/85 font-medium leading-relaxed">
                After placing your order, send your photos and personalization details to us on WhatsApp.
              </p>
            </div>
          </div>

          {/* ACTIONS: CUSTOMIZE & BUY (48-52px height) + VIEW FULL PRODUCT */}
          <div className="pt-3 sm:pt-4 space-y-2 mt-auto">
            {/* Primary: CUSTOMIZE & BUY (Deep Navy, 48-52px) */}
            <button
              type="button"
              onClick={handleCustomizeAndBuy}
              className="w-full h-[50px] min-h-[48px] bg-[#071A2F] hover:bg-[#0B2748] active:scale-[0.99] text-white font-bold text-[14px] sm:text-[15px] rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>CUSTOMIZE & BUY</span>
              <ArrowRight size={15} />
            </button>

            {/* Secondary: VIEW FULL PRODUCT → */}
            <button
              type="button"
              onClick={handleCustomizeAndBuy}
              className="w-full py-2 text-center text-[13px] sm:text-[14px] font-semibold text-[#071A2F] hover:text-[#C5A46D] transition-colors cursor-pointer"
            >
              VIEW FULL PRODUCT →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickViewModal;
