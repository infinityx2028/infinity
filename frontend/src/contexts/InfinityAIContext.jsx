import React, { useState, useCallback } from 'react';

import { InfinityAIContext } from './useInfinityAI';

export const InfinityAIProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const openInfinityAI = useCallback((query = '') => {
    setInitialQuery(query);
    setIsOpen(true);
  }, []);

  const closeInfinityAI = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearInitialQuery = useCallback(() => {
    setInitialQuery('');
  }, []);

  return (
    <InfinityAIContext.Provider
      value={{
        isOpen,
        openInfinityAI,
        closeInfinityAI,
        initialQuery,
        clearInitialQuery
      }}
    >
      {children}
    </InfinityAIContext.Provider>
  );
};
