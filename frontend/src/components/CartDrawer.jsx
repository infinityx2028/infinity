import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getImageSrc } from '../utils/imageUtils';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const subtotal = getTotalPrice();

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#071A2F]/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#071A2F]/10 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF8F4]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#071A2F] text-white flex items-center justify-center">
                <ShoppingBag size={15} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#071A2F]">Shopping Bag</h3>
                <p className="text-[11px] text-[#687386]">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-[#071A2F] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F4] border border-[#071A2F]/10 flex items-center justify-center mx-auto text-[#687386]">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#071A2F]">Your bag is waiting</h4>
                  <p className="text-xs text-[#687386] mt-1 max-w-xs mx-auto">
                    Add meaningful personalized gifts from our handcrafted collections.
                  </p>
                </div>
                <Link
                  to="/shop/frames"
                  onClick={onClose}
                  className="inline-block bg-[#071A2F] hover:bg-[#0B2748] text-white text-xs font-bold py-3 px-6 rounded-full shadow-sm hover:shadow transition-all"
                >
                  START SHOPPING
                </Link>
              </div>
            ) : (
              cart.map((item, idx) => {
                const imgSrc = getImageSrc(item.images?.[0] || item.image);
                const itemTotal = (Number(item.price || 0) + (item.addOn?.price ? Number(item.addOn.price) : 0)) * item.quantity;
                return (
                  <div 
                    key={item.id || item._id || idx} 
                    className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#071A2F]/8 flex gap-3.5 relative group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="pr-6">
                        <h4 className="font-semibold text-xs sm:text-sm text-[#071A2F] truncate">
                          {item.name}
                        </h4>
                        {item.customizationDetails && (
                          <p className="text-[11px] text-[#C5A46D] font-medium line-clamp-1 mt-0.5">
                            {item.customizationDetails}
                          </p>
                        )}
                        {item.customText && (
                          <p className="text-[10px] text-[#687386] italic line-clamp-1 mt-0.5">
                            "{item.customText}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
                        {/* Quantity stepper */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id || item._id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center font-bold text-xs text-[#071A2F] hover:bg-gray-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#071A2F]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-xs text-[#071A2F] hover:bg-gray-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-black text-xs sm:text-sm text-[#071A2F]">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id || item._id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-[#FAF8F4] space-y-3">
              <div className="space-y-1.5 text-xs text-[#687386]">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#071A2F] text-sm">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-semibold">Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="w-full bg-[#071A2F] hover:bg-[#0B2748] active:scale-[0.99] text-white py-3.5 rounded-full font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={14} />
                </button>

                <p className="text-[11px] text-[#687386] text-center py-1">
                  Personalization photos can be sent through WhatsApp after placing your order.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="w-full bg-white hover:bg-gray-50 border border-[#071A2F]/20 text-[#071A2F] py-2.5 rounded-full font-bold text-xs tracking-wide transition-all cursor-pointer"
                >
                  VIEW FULL BAG
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-center text-[11px] font-semibold text-[#687386] hover:text-[#071A2F] py-1 cursor-pointer"
                >
                  Continue Shopping →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
