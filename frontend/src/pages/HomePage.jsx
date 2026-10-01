import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Hero3D from "../components/Hero3D";
import CategoryGrid from "../components/CategoryGrid";
import InfinityAISection from "../components/InfinityAI/InfinityAISection";
import ProductCard from "../components/ProductCard";
import PersistentMemoryScene from "../components/PersistentMemoryScene";
import { CatalogProvider } from "../contexts/CatalogContext";
import { useCatalog } from "../contexts/useCatalog";
import { MemoryExperienceContext } from "../contexts/useMemoryExperience";
import { CANONICAL_CATEGORIES } from "../utils/categoryUtils";
import { responsiveImage } from "../utils/responsiveImages";
import "../memory-motion.css";

function HomeExperience() {
  const experienceRef = useRef(null);
  const { products, loading, error } = useCatalog();
  const [aiProduct, setAIProduct] = useState(null);
  const [categoryProduct, setCategoryProduct] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [category, setCategory] = useState("all");
  const [pillar, setPillar] = useState(0);
  const memories = products
    .filter((product) => product.categoryId === "memories")
    .slice(0, 4);
  const magazine = products.find(
    (product) => product.categoryId === "magazines",
  );
  const availableCategories = CANONICAL_CATEGORIES.filter(
    (item) =>
      item.id === "all" ||
      products.some((product) => product.categoryId === item.id),
  );
  const discovery = products
    .filter((product) => category === "all" || product.categoryId === category)
    .slice(0, 8);
  const best = products.filter((product) => product.isBestSeller).slice(0, 4);
  return (
    <MemoryExperienceContext.Provider
      value={{
        aiProduct,
        setAIProduct,
        categoryProduct,
        setCategoryProduct,
        tokens,
        setTokens,
      }}
    >
      <main className="memory-experience" ref={experienceRef}>
        <PersistentMemoryScene experienceRef={experienceRef} pillar={pillar} />
        <Hero3D />
        <InfinityAISection />
        <CategoryGrid />
        <section
          id="made-for-you"
          className="motion-discovery motion-scene"
          data-memory-scene="products"
        >
          <div className="motion-chapter">
            <span>03 / MADE TO BE YOURS</span>
            <Link to="/shop">
              THE WHOLE COLLECTION <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="motion-discovery-heading">
            <h2>
              Made for
              <br />
              <em>your moments.</em>
            </h2>
            <p>
              Big celebrations. Little surprises.
              <br />
              The everyday things worth remembering.
            </p>
          </div>
          <div
            className="memory-anchor products-memory-anchor"
            data-memory-anchor="products"
          />
          <div
            className="motion-product-filters"
            aria-label="Filter gifts by category"
          >
            {availableCategories.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
          {loading && (
            <p className="motion-catalog-status" role="status">
              Opening the gift collection…
            </p>
          )}
          {error && (
            <p className="motion-catalog-status" role="status">
              The catalog is temporarily unavailable.{" "}
              <Link to="/shop">Try the shop</Link>.
            </p>
          )}
          <div className="motion-product-grid">
            {discovery.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
          <Link
            to={category === "all" ? "/shop" : `/shop/${category}`}
            className="motion-link motion-all-gifts"
          >
            Explore this collection <ArrowRight size={17} />
          </Link>
          <div id="best-sellers" className="motion-best-sellers">
            {best.length > 0 && (
              <>
                <div className="motion-results-heading">
                  <h3>
                    Best sellers. <em>For a reason.</em>
                  </h3>
                  <Link to="/shop" className="motion-link">
                    Shop all <ArrowUpRight size={17} />
                  </Link>
                </div>
                <div className="motion-product-grid">
                  {best.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
        <section
          id="made-around-your-story"
          className="motion-story motion-scene"
          data-memory-scene="story"
          data-memory-touch
        >
          <div className="motion-chapter">
            <span>04 / OUT OF YOUR CAMERA ROLL</span>
            <span>INTO YOUR HANDS</span>
          </div>
          <h2>
            From
            <br />
            <span>camera roll.</span>
            <em>To something real.</em>
          </h2>
          <div
            className="memory-anchor story-memory-anchor"
            data-memory-anchor="story"
          />
          <div className="motion-emerging-photos" aria-hidden="true">
            {memories.map((product, index) => (
              <div
                key={product._id || product.id}
                style={{ "--photo-index": index }}
              >
                <img
                  {...responsiveImage(product.images?.[0] || product.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          <div className="motion-magazine-pages" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="motion-story-foot">
            <p>
              Turn the photos on your phone into something
              <br />
              you can hold, gift and remember.
            </p>
            <Link
              className="motion-button"
              to={
                magazine ? `/product/${magazine._id || magazine.id}` : "/shop"
              }
              data-magnetic
            >
              Explore personalized gifts <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section
          className="motion-photo-wall motion-scene"
          data-memory-scene="wall"
        >
          <div
            className="memory-anchor wall-memory-anchor"
            data-memory-anchor="wall"
          />
          <p>
            Some moments deserve
            <br />
            <em>more than a screen.</em>
          </p>
          <div className="motion-wall-photos">
            {memories.map((product, index) => (
              <Link
                to={`/product/${product._id || product.id}`}
                key={product._id || product.id}
                style={{ "--photo-index": index }}
                data-cursor="VIEW"
              >
                <img
                  {...responsiveImage(product.images?.[0] || product.image)}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            ))}
          </div>
        </section>
        <section
          id="infinity-difference"
          className="motion-brand motion-scene"
          data-memory-scene="brand"
        >
          <span className="motion-brand-background" aria-hidden="true">
            INFINITY
          </span>
          <div className="motion-chapter">
            <span>05 / THE INFINITY DIFFERENCE</span>
            <span>MADE TO MEAN MORE</span>
          </div>
          <div className="motion-brand-layout">
            <div>
              <h2>
                Not just a gift.
                <br />
                <em>
                  A memory
                  <br />
                  made tangible.
                </em>
              </h2>
              <div
                className="memory-anchor brand-memory-anchor"
                data-memory-anchor="brand"
                style={{ "--pillar": pillar }}
              />
            </div>
            <div className="motion-pillars">
              {[
                {
                  title: "Personalized",
                  copy: "Made around your photos, stories and memories.",
                },
                {
                  title: "Made with care",
                  copy: "Thoughtfully created with attention to every detail.",
                },
                {
                  title: "Made to mean more",
                  copy: "Gifts designed to become memories you keep.",
                },
              ].map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  aria-pressed={pillar === index}
                  onClick={() => setPillar(index)}
                  onMouseEnter={() => setPillar(index)}
                  onFocus={() => setPillar(index)}
                >
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                  <ArrowUpRight size={20} />
                </button>
              ))}
            </div>
          </div>
        </section>
        <section
          id="how-it-works"
          className="motion-process motion-scene"
          data-memory-scene="process"
        >
          <div className="motion-chapter">
            <span>06 / A LITTLE PERSONAL. A LOT OF MEANING.</span>
          </div>
          <h2>
            From your heart.
            <br />
            <em>Into their hands.</em>
          </h2>
          <div className="motion-process-path">
            <div
              className="memory-anchor process-memory-anchor"
              data-memory-anchor="process"
            />
            {[
              {
                title: "Choose your gift",
                copy: "Find the keepsake that feels like them.",
              },
              {
                title: "Place your order",
                copy: "Choose your options and check out.",
              },
              {
                title: "Send your photos",
                copy: "After ordering, share your photos and personalization details with us on WhatsApp.",
              },
            ].map((item, index) => (
              <div className="motion-process-step" key={item.title}>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          id="start-creating"
          className="motion-final motion-scene"
          data-memory-scene="final"
          data-memory-touch
        >
          <p className="motion-kicker">A MEMORY IS ONLY THE BEGINNING.</p>
          <span className="motion-final-background" aria-hidden="true">
            INFINITY
          </span>
          <div
            className="memory-anchor final-memory-anchor"
            data-memory-anchor="final"
          />
          <h2>
            Make the
            <br />
            <em>memory real.</em>
          </h2>
          <div className="motion-actions">
            <Link to="/shop" className="motion-button" data-magnetic>
              Start creating <ArrowRight size={18} />
            </Link>
            <a href="#infinity-ai-concierge" className="motion-link">
              Ask Infinity AI <span>✦</span>
            </a>
          </div>
          <p className="motion-final-signoff">
            Your photos. Your stories. Forever, in a different form.
          </p>
        </section>
      </main>
    </MemoryExperienceContext.Provider>
  );
}
export default function HomePage() {
  return (
    <CatalogProvider>
      <HomeExperience />
    </CatalogProvider>
  );
}
