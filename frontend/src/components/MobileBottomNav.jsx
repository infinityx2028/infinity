import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, openCartDrawer } = useCart();
  const { isAuthenticated } = useAuth();

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
      badge: totalCartCount,
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#071A2F]/10 shadow-[0_-4px_20px_rgba(7,26,47,0.06)] pb-[env(safe-area-inset-bottom,0px)] pt-1 px-1 h-[var(--mobile-nav-height,64px)] flex items-center"
    >
      <div className="flex items-center justify-around w-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[54px] min-h-[44px] transition-colors relative cursor-pointer active:scale-95 ${
                active ? 'text-[#071A2F]' : 'text-[#687386] hover:text-[#071A2F]'
              }`}
            >
              <div className="relative">
                <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#C5A46D] text-[#071A2F] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${active ? 'font-bold text-[#071A2F]' : 'font-medium'}`}>
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
