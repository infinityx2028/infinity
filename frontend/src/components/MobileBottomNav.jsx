import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useInfinityAI } from '../contexts/InfinityAIContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, openCartDrawer } = useCart();
  const { openInfinityAI, isOpen: isAIOpen } = useInfinityAI();

  // Hide on checkout, product pages, and admin routes to prioritize purchase CTAs and forms
  if (
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/product/') ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  // Real total items count in cart
  const totalCartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => navigate('/'),
      isActive: location.pathname === '/' && !isAIOpen,
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: Compass,
      action: () => navigate('/shop'),
      isActive: location.pathname.startsWith('/shop') && !isAIOpen,
    },
    {
      id: 'ai',
      label: 'AI',
      icon: Sparkles,
      action: () => openInfinityAI(),
      isActive: isAIOpen,
    },
    {
      id: 'bag',
      label: 'Bag',
      icon: ShoppingBag,
      action: () => {
        if (openCartDrawer) {
          openCartDrawer();
        } else {
          navigate('/cart');
        }
      },
      isActive: location.pathname === '/cart' && !isAIOpen,
      badge: totalCartCount,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-3 inset-x-3 sm:inset-x-6 z-40 max-w-md mx-auto bg-[#FAF8F4]/95 backdrop-blur-xl border border-[#071A2F]/10 rounded-2xl shadow-[0_8px_30px_rgba(7,26,47,0.12)] px-2 py-1 h-[60px] flex items-center select-none"
    >
      <div className="flex items-center justify-around w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[52px] min-h-[44px] transition-all duration-200 relative cursor-pointer active:scale-95 ${
                active ? 'text-[#071A2F]' : 'text-[#687386] hover:text-[#071A2F]'
              }`}
            >
              <div className={`relative transition-transform duration-250 ease-out ${active ? '-translate-y-0.5' : ''}`}>
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#C5A46D] text-[#071A2F] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${active ? 'font-bold text-[#071A2F]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
