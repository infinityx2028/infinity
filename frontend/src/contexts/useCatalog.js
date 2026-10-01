import { createContext, useContext } from 'react';
export const CatalogContext = createContext({ products: [], loading: true, error: false });
export function useCatalog() { return useContext(CatalogContext); }
