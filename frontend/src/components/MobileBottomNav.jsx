import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, openCartDrawer } = useCart();
  const { isAuthenticated } = useAuth();

  // Hide on checkout and product pages to give 100% priority to purchase CTAs and forms
  if (
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/product/') ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => navigate('/'),
      isActive: location.pathname === '/',
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: Compass,
      action: () => navigate('/shop/frames'),
      isActive: location.pathname.startsWith('/shop'),
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: () => navigate('/search'),
      isActive: location.pathname === '/search',
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
      isActive: location.pathname === '/cart',
      badge: cart.length,
    },
    {
      id: 'account',
      label: isAuthenticated ? 'Account' : 'Login',
      icon: User,
      action: () => navigate(isAuthenticated ? '/profile' : '/login'),
      isActive: location.pathname === '/profile' || location.pathname === '/login',
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#071A2F]/10 shadow-[0_-4px_20px_rgba(7,26,47,0.06)] pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1.5 px-2"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] transition-colors relative cursor-pointer ${
                active ? 'text-[#071A2F]' : 'text-[#687386] hover:text-[#071A2F]'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#C5A46D] text-[#071A2F] text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${active ? 'font-black' : 'font-medium'}`}>
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
