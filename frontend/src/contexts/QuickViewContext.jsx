import React, { useState, useCallback } from 'react';

import { QuickViewContext } from './useQuickView';

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
