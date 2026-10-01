import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../contexts/useCatalog';
import { responsiveImage } from '../utils/responsiveImages';
import { getProductShortDescription } from '../data/productDescriptions';

const HERO_CATEGORIES = ['frames', 'magazines', 'essentials', 'memories', 'apparel'];

export default function Hero3D() {
  const { products, loading, error } = useCatalog();
  const selected = HERO_CATEGORIES.map(category => products.find(product => product.categoryId === category && (product.images?.[0] || product.image))).filter(Boolean);
  const featured = selected.length ? selected : products.filter(product => product.images?.[0] || product.image).slice(0, 5);
  const [index, setIndex] = useState(0);
  const stage = useRef(null);
  const hero = useRef(null);
  const frame = useRef(null);
  const touch = useRef(null);
  const active = featured[index % (featured.length || 1)];

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scrollFrame;
    const onScroll = () => {
      if (reduced.matches || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;
        const progress = Math.max(0, Math.min(1, -hero.current.getBoundingClientRect().top / 650));
        hero.current.style.setProperty('--journey', progress);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  function tilt(event) {
    if (!stage.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (event.pointerType === 'touch' && touch.current === null) return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = stage.current.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (clientX - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (clientY - rect.top) / rect.height * 2 - 1));
      stage.current.style.setProperty('--tilt-x', `${-y * 2}deg`);
      stage.current.style.setProperty('--tilt-y', `${x * 3.5}deg`);
    });
  }
  function reset() {
    cancelAnimationFrame(frame.current);
    stage.current?.style.setProperty('--tilt-x', '0deg');
    stage.current?.style.setProperty('--tilt-y', '0deg');
  }
  function step(direction) {
    if (featured.length) setIndex(current => (current + direction + featured.length) % featured.length);
  }

  return (
    <section className="studio-hero" ref={hero} aria-label="Personalized gift studio">
      <div className="studio-hero-top"><span>THE PERSONALIZED GIFT STUDIO</span><span>Little moments. Infinite meaning.</span></div>
      <div className="studio-hero-layout">
        <div className="studio-hero-copy">
          <p className="studio-eyebrow"><span /> PERSONALIZED · MADE FOR YOU</p>
          <h1>Your memories.<br /><span>Made personal.</span></h1>
          <p className="studio-hero-description">Turn a memory into something<br className="hidden sm:block" /> they can hold. And keep. And love.</p>
          <div className="studio-hero-actions">
            <Link to="/shop" className="studio-button">Shop personalized gifts <ArrowRight size={18} /></Link>
            <a href="#infinity-ai-concierge" className="studio-text-link">Ask Infinity AI <span aria-hidden="true">✦</span></a>
          </div>
          <div className="studio-hero-note"><span aria-hidden="true">↗</span><p>Your photos. Your stories.<br /><strong>Something beautifully yours.</strong></p></div>
        </div>
        <div className="studio-product-theatre">
          <div className="studio-stage-label"><span>MEMORIES, IN A NEW DIMENSION</span><span aria-hidden="true">✦</span></div>
          <div className="studio-stage" ref={stage} onPointerMove={tilt} onPointerLeave={reset}
            onPointerDown={event => { if (event.pointerType === 'touch') touch.current = event.clientX; }}
            onPointerUp={event => {
              if (touch.current !== null && Math.abs(event.clientX - touch.current) > 40 && featured.length > 1) step(event.clientX < touch.current ? 1 : -1);
              touch.current = null;
              reset();
            }} onPointerCancel={() => { touch.current = null; reset(); }}>
            <div className="studio-stage-floor" aria-hidden="true"><i /><i /><i /></div>
            <div className="studio-depth-stack">
              {featured.map((product, position) => {
                const offset = (position - index + featured.length) % featured.length;
                const slot = offset === 0 ? 'front' : offset === 1 ? 'right' : offset === featured.length - 1 ? 'left' : 'back';
                return <button key={product._id || product.id} type="button" className={`studio-object studio-object-${slot}`} tabIndex={slot === 'back' ? -1 : 0}
                  aria-label={`Show ${product.name}`} aria-pressed={offset === 0} onClick={() => setIndex(position)}>
                  <img {...responsiveImage(product.images?.[0] || product.image)} alt={product.name} fetchPriority={position === 0 ? 'high' : 'auto'} loading={position === 0 ? 'eager' : 'lazy'} decoding="async" />
                  <span className="studio-object-caption">INFINITY CUSTOMIZATIONS <span>↗</span></span>
                </button>;
              })}
            </div>
            {!active && <div className="studio-stage-empty">{loading ? 'Bringing your memories into focus…' : error ? 'Explore the gift collection below.' : 'New keepsakes are on their way.'}</div>}
            <span className="studio-stage-hint">{featured.length > 1 ? 'MOVE TO EXPLORE · SWIPE TO DISCOVER' : 'MADE AROUND YOUR STORY'}</span>
          </div>
          <div className="studio-product-info" aria-live="polite" aria-atomic="true">
            <div><p className="studio-eyebrow">{active ? 'MAKE IT YOURS' : 'EXPLORE THE STUDIO'}</p><h2>{active?.name || 'A little more personal.'}</h2><p className="studio-product-description">{active && getProductShortDescription(active)}</p>
              {active && <Link to={`/product/${active._id || active.id}`} className="studio-text-link">Customize & buy <ArrowRight size={15} /></Link>}
            </div>
            <div className="studio-product-controls">{active && <strong>₹{Number(active.price).toLocaleString('en-IN')}</strong>}<div>
              <button type="button" onClick={() => step(-1)} disabled={featured.length < 2} aria-label="Previous gift"><ChevronLeft size={18} /></button>
              <span>{String(index + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}</span>
              <button type="button" onClick={() => step(1)} disabled={featured.length < 2} aria-label="Next gift"><ChevronRight size={18} /></button>
            </div></div>
          </div>
        </div>
      </div>
      <div className="studio-hero-bottom"><a href="#collections-section">A gift for every kind of love <ArrowDown size={14} /></a><span>PHOTOS → STORIES → KEEPSAKES</span></div>
    </section>
  );
}
