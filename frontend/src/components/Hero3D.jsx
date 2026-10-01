import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useCatalog } from "../contexts/useCatalog";
import { responsiveImage } from "../utils/responsiveImages";

export default function Hero3D() {
  const { products } = useCatalog();
  const memories = products
    .filter((product) => product.categoryId === "memories")
    .slice(0, 2);
  const frame = products.find((product) => product.categoryId === "frames");
  return (
    <section
      className="motion-hero motion-scene"
      data-memory-scene="hero"
      data-memory-touch
    >
      <div className="motion-hero-meta">
        <span>THE PERSONALIZED GIFT STUDIO</span>
        <span>EST. IN MEMORIES / MADE FOR YOU</span>
      </div>
      <p className="motion-kicker">PERSONALIZED · MADE FOR YOU</p>
      <h1 className="motion-hero-title">
        <span>YOUR</span>
        <span>MEMORIES.</span>
        <em>Made personal.</em>
      </h1>
      <div
        className="memory-anchor hero-memory-anchor"
        data-memory-anchor="hero"
      />
      <div className="hero-memory-satellites" aria-hidden="true">
        {memories.map((product, index) => (
          <div
            key={product._id || product.id}
            className={`hero-photo hero-photo-${index}`}
          >
            <img
              {...responsiveImage(product.images?.[0] || product.image)}
              alt=""
              decoding="async"
            />
          </div>
        ))}
      </div>
      <div className="motion-hero-bottom">
        <div>
          <p>
            Turn photos, moments and stories
            <br />
            into gifts made just for them.
          </p>
          <div className="motion-actions">
            <Link className="motion-button" to="/shop" data-magnetic>
              Explore gifts <ArrowRight size={18} />
            </Link>
            <a className="motion-link" href="#infinity-ai-concierge">
              Ask Infinity AI <span>✦</span>
            </a>
          </div>
        </div>
        <div className="hero-product-caption">
          {frame && (
            <Link to={`/product/${frame._id || frame.id}`} data-cursor="VIEW">
              <span>THE MEMORY FRAME</span>
              <strong>{frame.name}</strong>
              <span>
                ₹{Number(frame.price).toLocaleString("en-IN")}{" "}
                <ArrowRight size={14} />
              </span>
            </Link>
          )}
        </div>
      </div>
      <a className="hero-scroll-cue" href="#infinity-ai-concierge">
        <ArrowDown size={14} /> SCROLL TO MOVE THROUGH MEMORIES
      </a>
    </section>
  );
}
