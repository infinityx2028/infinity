import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { useCatalog } from "../contexts/useCatalog";
import { useMemoryExperience } from "../contexts/useMemoryExperience";
import { CANONICAL_CATEGORIES } from "../utils/categoryUtils";
import { responsiveImage } from "../utils/responsiveImages";

export default function CategoryGrid() {
  const { products } = useCatalog();
  const { setCategoryProduct } = useMemoryExperience();
  const [active, setActive] = useState(null);
  const rail = useRef(null);
  const categories = CANONICAL_CATEGORIES.filter(
    (category) => category.id !== "all",
  )
    .map((category) => ({
      ...category,
      product: products.find((product) => product.categoryId === category.id),
    }))
    .filter((category) => category.product);
  function select(index) {
    setActive(index);
    setCategoryProduct(categories[index]?.product || null);
  }
  return (
    <section
      id="collections-section"
      className="motion-categories motion-scene"
      data-memory-scene="categories"
    >
      <div className="motion-chapter">
        <span>02 / YOUR KIND OF PERSONAL</span>
        <Link to="/shop">
          EVERY GIFT <ArrowUpRight size={14} />
        </Link>
      </div>
      <h2>
        Shop by <em>category.</em>
      </h2>
      <p className="motion-category-intro">
        A whole world of ways to say “this is for you”.
      </p>
      <div
        className={`motion-category-world ${active !== null ? "has-active-category" : ""}`}
        onMouseLeave={() => {
          setActive(null);
          setCategoryProduct(null);
        }}
      >
        <div
          className="memory-anchor categories-memory-anchor"
          data-memory-anchor="categories"
        />
        <div
          className="motion-category-rail"
          ref={rail}
          data-cursor="DRAG"
          onScroll={() => {
            if (window.innerWidth < 768)
              select(
                Math.min(
                  categories.length - 1,
                  Math.round(rail.current.scrollLeft / 120),
                ),
              );
          }}
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop/${category.slug}`}
              className={`motion-category-object category-orbit-${index} ${active === index ? "is-active" : ""}`}
              onMouseEnter={() => select(index)}
              onFocus={() => select(index)}
              onBlur={() => {
                setActive(null);
                setCategoryProduct(null);
              }}
            >
              <div className="motion-category-image">
                <img
                  {...responsiveImage(
                    category.product.images?.[0] || category.product.image,
                  )}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <h3>{category.name}</h3>
                <ArrowUpRight size={17} />
              </div>
            </Link>
          ))}
        </div>
        <span className="motion-orbit-caption">
          ONE MEMORY.
          <br />
          INFINITE POSSIBILITIES.
        </span>
      </div>
      <div className="motion-category-mobile-controls">
        <span>SWIPE TO FIND YOUR KIND OF GIFT</span>
        <div>
          <button
            type="button"
            aria-label="Previous category"
            onClick={() =>
              rail.current.scrollBy({
                left: window.innerWidth < 768 ? -120 : -190,
                behavior: "smooth",
              })
            }
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next category"
            onClick={() =>
              rail.current.scrollBy({
                left: window.innerWidth < 768 ? 120 : 190,
                behavior: "smooth",
              })
            }
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
