import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useCatalog } from '../contexts/useCatalog';

export default function BestSellersSection() {
  const { products, loading, error } = useCatalog();
  const best = products.filter(product => product.isBestSeller).slice(0, 4);
  const items = best.length ? best : products.slice(0, 4);
  return <section id="best-sellers" className="studio-section studio-bestsellers">
    <div className="studio-section-heading"><div><p className="studio-eyebrow">A LITTLE INSPIRATION</p><h2>{best.length ? 'Best sellers.' : 'Discover your next keepsake.'}</h2></div><Link to="/shop" className="studio-text-link">Shop the collection <ArrowUpRight size={18} /></Link></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">{items.map(product => <ProductCard key={product._id || product.id} product={product} />)}</div>
    {loading && <p className="py-6 text-sm text-[#687386]">Finding something special…</p>}
    {error && <p className="py-6 text-sm text-[#687386]">The catalog is taking a moment. <Link to="/shop" className="underline">Visit the shop</Link> to try again.</p>}
  </section>;
}
