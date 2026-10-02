import { useEffect, useRef } from "react";
import { responsiveImage } from "../utils/responsiveImages";

export default function MemoryExperience({
  rootRef,
  magazine,
  universe,
  tokens,
}) {
  const stage = useRef(null);
  useEffect(() => {
    let disposed = false;
    let cleanup;
    import("../home/filmDirector").then(({ createFilmDirector }) => {
      if (!disposed)
        cleanup = createFilmDirector(rootRef.current, stage.current);
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [rootRef, magazine, universe.length]);
  return (
    <div className="world-stage" ref={stage} aria-hidden="true">
      <div className="world-contact-shadow" />
      <div className="world-object">
        <div className="world-opening-photo">
          <img
            src="/images/memory-celebration-480.webp"
            alt=""
            decoding="async"
          />
        </div>
        <div className="world-frame-shell">
          <div className="world-frame-back" />
          <div className="world-frame-edge" />
          <div className="world-frame-cavity" />
          <div className="world-frame-front" />
          <div className="world-frame-glass" />
          <span className="world-frame-signature">
            a little moment. an infinite memory.
          </span>
        </div>
        <div className="world-primary-photo">
          <picture>
            <source
              type="image/avif"
              srcSet="/images/memory-core-480.avif 480w, /images/memory-core-1024.avif 1024w"
              sizes="(max-width: 767px) 180px, 360px"
            />
            <img
              src="/images/memory-core-480.webp"
              srcSet="/images/memory-core-480.webp 480w, /images/memory-core-1024.webp 1024w"
              sizes="(max-width: 767px) 180px, 360px"
              alt=""
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        </div>
        <div className="world-secondary-photos">
          {["memory-celebration", "memory-family"].map((name, i) => (
            <div key={name} style={{ "--photo-index": i }}>
              <img
                src={`/images/${name}-480.webp`}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
        {magazine && (
          <div className="world-magazine">
            <div className="world-magazine-pages" />
            <div className="world-magazine-cover">
              <img
                {...responsiveImage(
                  magazine.images?.[0] || magazine.image,
                  "(max-width: 767px) 220px, 400px",
                )}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
            <span>YOUR STORY. COVER TO COVER.</span>
          </div>
        )}
        <div className="world-products">
          {universe.map((c, i) => (
            <div
              key={c.id}
              className={`world-product world-product-${c.id}`}
              data-product-form={i}
            >
              <img
                {...responsiveImage(
                  c.product.images?.[0] || c.product.image,
                  "(max-width: 767px) 220px, 400px",
                )}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
        <div className="world-memory-card">
          <img
            src="/images/memory-core-480.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div className="world-ai-tokens">
        {tokens.map((token, i) => (
          <span key={token.key} style={{ "--token-index": i }}>
            {token.label}
          </span>
        ))}
      </div>
      <span className="world-object-crosshair" />
    </div>
  );
}
