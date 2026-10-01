import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '../contexts/useCatalog';
import { responsiveImage } from '../utils/responsiveImages';

export default function MomentsStorySection() {
  const { products } = useCatalog();
  const section = useRef(null);
  const magazine = products.find(product => product.categoryId === 'magazines');
  const memories = products.filter(product => ['frames', 'memories'].includes(product.categoryId)).slice(0, 2);
  useEffect(() => {
    const node = section.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    let visible = false;
    function update() {
      if (!visible || frame || media.matches) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const rect = node.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height * .25)));
        node.style.setProperty('--memory-progress', progress);
      });
    }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
    observer.observe(node);
    window.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); cancelAnimationFrame(frame); };
  }, []);
  return <section ref={section} id="made-around-your-story" className="studio-memory studio-section">
    <div className="studio-memory-visual" aria-label="Photos becoming a personalized keepsake">
      {memories.map((product, index) => <div key={product._id || product.id} className={`studio-memory-photo studio-memory-photo-${index}`}><img {...responsiveImage(product.images?.[0] || product.image)} alt={product.name} loading="lazy" decoding="async" /></div>)}
      {magazine && <Link to={`/product/${magazine._id || magazine.id}`} className="studio-memory-book"><img {...responsiveImage(magazine.images?.[0] || magazine.image)} alt={magazine.name} loading="lazy" decoding="async" /><span>YOUR STORY, IN PRINT.</span></Link>}
      <div className="studio-memory-axis" aria-hidden="true">A MOMENT <span>→</span> A MEMORY <span>→</span> A KEEPSAKE</div>
    </div>
    <div className="studio-memory-copy"><p className="studio-eyebrow">FROM YOUR WORLD, INTO YOUR HANDS</p><h2>From camera roll<br />to <em>something real.</em></h2><p>That one photo. That unforgettable trip. That person who means everything. Give your favourite memories a life beyond your screen.</p><Link to={magazine ? `/product/${magazine._id || magazine.id}` : '/shop'} className="studio-text-link">Make a memory tangible <ArrowRight size={18} /></Link><div className="studio-memory-note">01 / YOUR MOMENTS, REIMAGINED</div></div>
  </section>;
}
