import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { getImageSrc } from '../utils/imageUtils';
import { useCart } from '../contexts/CartContext';
import InfinityLoader from './InfinityLoader';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart, openCartDrawer } = useCart();
  const [added, setAdded] = React.useState(false);
  const [isImgLoaded, setIsImgLoaded] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const productId = product._id || product.id;
  const imageSrc = getImageSrc(product.images?.[0] || product.image);
  const price = Number(product.price || 0);
  const hasRealDiscount = product.originalPrice && Number(product.originalPrice) > price;
  const discountPercent = hasRealDiscount
    ? Math.round(((Number(product.originalPrice) - price) / Number(product.originalPrice)) * 100)
    : null;

  const requiresPersonalization = product.requiresCustomization !== false && (
    Boolean(product.categoryId) || 
    Boolean(product.variants?.length) || 
    Boolean(product.fabrics?.length) ||
    Boolean(product.isCustomized) ||
    !product.canDirectBuy
  );

  const handleQuickAdd = () => {
    addToCart({
      ...product,
      id: productId,
      price: price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      if (openCartDrawer) openCartDrawer();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#03101D]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#071A2F]/10 flex flex-col sm:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Quick View"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#071A2F] flex items-center justify-center shadow-md transition-transform hover:scale-105"
        >
          <X size={18} />
        </button>

        {/* Left: Product Image with Horizontal 8 Infinity Loader */}
        <div className="sm:w-1/2 aspect-square sm:aspect-auto bg-[#FAF8F4] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
          {!isImgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F4] z-0">
              <InfinityLoader size="md" />
            </div>
          )}
          <img
            src={imageSrc}
            alt={product.name}
            onLoad={() => setIsImgLoaded(true)}
            className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
              isImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {product.isBestSeller && (
            <span className="absolute top-3 left-3 bg-[#071A2F] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs z-10">
              Best Seller
            </span>
          )}
        </div>

        {/* Right: Details & CTA */}
        <div className="sm:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#687386] block mb-1.5">
              Personalized Gifting
            </span>
            <h2 className="font-semibold text-xl sm:text-2xl text-[#071A2F] tracking-tight leading-snug mb-2">
              {product.name}
            </h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl sm:text-2xl font-black text-[#071A2F]">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {hasRealDiscount && (
                <>
                  <span className="text-xs text-[#687386] line-through">
                    ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-[#C5A46D] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#C5A46D]/30">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs text-[#687386] font-light leading-relaxed mb-5">
              {product.description || 'Handcrafted to order with archival printing, premium materials, and personalized attention.'}
            </p>

            {/* Highlights */}
            <div className="space-y-2 mb-6 border-t border-b border-gray-100 py-3 text-xs text-[#071A2F]/80">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#C5A46D]" />
                <span>Custom photos & messages supported</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#071A2F]" />
                <span>Verified layout before printing</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2">
            {requiresPersonalization ? (
              <Link
                to={`/product/${productId}`}
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#071A2F] hover:bg-[#0B2748] text-white py-3 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                <span>CUSTOMIZE & BUY</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#071A2F] hover:bg-[#0B2748] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> ADD TO BAG
                  </>
                )}
              </button>
            )}
            <Link
              to={`/product/${productId}`}
              onClick={onClose}
              className="block text-center text-xs text-[#687386] hover:text-[#071A2F] font-semibold mt-3 transition-colors"
            >
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
