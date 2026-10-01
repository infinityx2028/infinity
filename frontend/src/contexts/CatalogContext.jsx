import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api';
import { CatalogContext } from './useCatalog';

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState({ products: [], loading: true, error: false });
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/products`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Invalid catalog');
        setCatalog({ products: data.filter(product => product && product.isActive !== false), loading: false, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalog({ products: [], loading: false, error: true });
      });
    return () => controller.abort();
  }, []);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}
