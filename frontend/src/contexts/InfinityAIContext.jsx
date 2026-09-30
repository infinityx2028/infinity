import React, { createContext, useContext, useState, useCallback } from 'react';

const InfinityAIContext = createContext(null);

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

export const useInfinityAI = () => {
  const context = useContext(InfinityAIContext);
  if (!context) {
    throw new Error('useInfinityAI must be used within an InfinityAIProvider');
  }
  return context;
};
