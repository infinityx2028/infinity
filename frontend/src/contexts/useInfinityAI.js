import { createContext, useContext } from "react";
export const InfinityAIContext = createContext(null);

export const useInfinityAI = () => {
  const context = useContext(InfinityAIContext);
  if (!context) {
    throw new Error("useInfinityAI must be used within an InfinityAIProvider");
  }
  return context;
};
