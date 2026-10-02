import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useCatalog } from "../contexts/useCatalog";

export default function Hero3D() {
  const { products } = useCatalog();
  const frame = products.find((product) => product.categoryId === "frames");
  return (
    <section
      className="film-hero film-scene"
      data-memory-scene="hero"
      data-memory-touch
    >
      <div className="film-hero-top">
        <span>THE PERSONALIZED GIFT STUDIO</span>
        <span>YOUR MOMENTS. INFINITE MEANING.</span>
      </div>
      <p className="film-eyebrow">
        <i /> PERSONALIZED · MADE FOR YOU
      </p>
      <h1>
        <span className="film-desktop-copy">Make</span>
        <span className="film-desktop-copy">memories</span>
        <em className="film-desktop-copy">physical.</em>
        <span className="film-mobile-copy">Your memories.</span>
        <span className="film-mobile-copy">Made personal.</span>
      </h1>
      <div
        className="memory-anchor film-hero-anchor"
        data-memory-anchor="hero"
      />
      <div className="film-handwritten" aria-hidden="true">
        a little moment.
        <br />a forever feeling.<span>↙</span>
      </div>
      <div className="film-supporting-memories" aria-hidden="true">
        {["memory-monika", "memory-yellow-saree"].map((memory) => (
          <picture key={memory}>
            <source type="image/avif" srcSet={`/images/${memory}-480.avif`} />
            <img src={`/images/${memory}-480.webp`} alt="" decoding="async" />
          </picture>
        ))}
      </div>
      <div className="film-hero-bottom">
        <div>
          <p>Turn photos and moments into gifts made just for them.</p>
          <div className="motion-actions">
            <Link className="motion-button" to="/shop" data-magnetic>
              Explore gifts <ArrowRight size={17} />
            </Link>
            <a className="motion-link" href="#infinity-ai-concierge">
              Ask Infinity AI <span>✦</span>
            </a>
          </div>
        </div>
        {frame && (
          <Link
            className="film-product-caption"
            to={`/product/${frame._id || frame.id}`}
          >
            <span>MAKE IT A KEEPSAKE ↗</span>
            <strong>{frame.name}</strong>
            <span>₹{Number(frame.price).toLocaleString("en-IN")}</span>
          </Link>
        )}
      </div>
      <div className="film-hero-foot">
        <span>PHOTOS → STORIES → SOMETHING YOU CAN HOLD</span>
        <a href="#infinity-ai-concierge">
          <ArrowDown size={14} /> FOLLOW THE MEMORY
        </a>
      </div>
    </section>
  );
}
