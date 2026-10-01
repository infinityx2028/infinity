import { createContext, useContext } from "react";
export const MemoryExperienceContext = createContext(null);
export const useMemoryExperience = () => useContext(MemoryExperienceContext);
