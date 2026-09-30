import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const getCapUnitPrice = (quantity) => {
    if (quantity >= 30) return 59;
    if (quantity >= 20) return 69;
    if (quantity >= 10) return 79;
    return 99;
  };
  const getMagnetUnitPrice = (quantity) => {
    if (quantity === 2) return 149.5;
    return 179;
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const id = product.id || product._id;
    const baseQty = product.quantity || 1;
    const isCap = id === 'cap1';
    const isMagnet = id === 'mag1';
    const normalizedPrice = isCap
      ? getCapUnitPrice(baseQty)
      : isMagnet
        ? getMagnetUnitPrice(baseQty)
        : Number(product.price || 0);
    const normalized = { ...product, id, price: normalizedPrice, quantity: baseQty };
    const existingItem = cart.find(item => (item.id || item._id) === id);
    
    if (existingItem) {
      // Update quantity if product already exists
      setCart(cart.map(item =>
        (item.id || item._id) === id ? (() => {
          const nextQty = item.quantity + normalized.quantity;
          const nextPrice = isCap ? getCapUnitPrice(nextQty) : (isMagnet ? getMagnetUnitPrice(nextQty) : item.price);
          return { ...item, quantity: nextQty, price: nextPrice };
        })()
          : item
      ));
    } else {
      // Add new product
      setCart([...cart, normalized]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? (() => {
          const nextPrice = item.id === 'cap1'
            ? getCapUnitPrice(quantity)
            : item.id === 'mag1'
              ? getMagnetUnitPrice(quantity)
              : item.price;
          return { ...item, quantity, price: nextPrice };
        })()
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const addOn = item.addOn && item.addOn.price ? Number(item.addOn.price) : 0;
      return total + ((Number(item.price || 0) + addOn) * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    openCartDrawer,
    closeCartDrawer
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
