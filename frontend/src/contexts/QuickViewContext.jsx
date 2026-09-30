import React, { createContext, useContext, useState, useCallback } from 'react';

const QuickViewContext = createContext(null);

export const QuickViewProvider = ({ children }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const openQuickView = useCallback((product) => {
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{
        quickViewProduct,
        isOpen: Boolean(quickViewProduct),
        openQuickView,
        closeQuickView
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
};

export const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
};
