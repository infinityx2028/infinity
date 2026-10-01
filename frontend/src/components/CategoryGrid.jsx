import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCatalog } from '../contexts/useCatalog';
import { CANONICAL_CATEGORIES } from '../utils/categoryUtils';
import { responsiveImage } from '../utils/responsiveImages';

export default function CategoryGrid() {
  const { products, loading, error } = useCatalog();
  const categories = CANONICAL_CATEGORIES.filter(category => category.id !== 'all').map(category => ({
    ...category, items: products.filter(product => product.categoryId === category.id),
  })).filter(category => category.items.length);
  return <section id="collections-section" className="studio-categories studio-section">
    <div className="studio-section-heading"><div><p className="studio-eyebrow">FIND YOUR KIND OF PERSONAL</p><h2>Shop by category.</h2></div><Link to="/shop" className="studio-text-link">Explore all gifts <ArrowUpRight size={18} /></Link></div>
    <div className="studio-category-rail">
      {categories.map((category, index) => {
        const item = category.items.find(product => product.images?.[0] || product.image);
        const minimum = Math.min(...category.items.map(product => Number(product.price)));
        return <Link key={category.id} to={`/shop/${category.slug}`} className="studio-category">
          <div className="studio-category-photo"><span className="studio-category-number">{String(index + 1).padStart(2, '0')}</span>{item && <img {...responsiveImage(item.images?.[0] || item.image)} alt={category.name} loading="lazy" decoding="async" />}<span className="studio-category-arrow"><ArrowUpRight size={20} /></span></div>
          <div className="studio-category-caption"><h3>{category.name}</h3><span>From ₹{minimum.toLocaleString('en-IN')}</span></div>
        </Link>;
      })}
      {loading && <p className="py-6 text-sm text-[#687386]">Opening the collections…</p>}
      {error && <Link to="/shop" className="studio-text-link">Browse the gift catalog <ArrowUpRight size={18} /></Link>}
    </div>
  </section>;
}
