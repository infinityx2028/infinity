import { createContext, useContext } from "react";
export const QuickViewContext = createContext(null);

export const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error("useQuickView must be used within a QuickViewProvider");
  }
  return context;
};
