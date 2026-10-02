import { useRef, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Gift,
  MessageCircle,
  Heart,
} from "lucide-react";
import Hero3D from "../components/Hero3D";
import CategoryGrid from "../components/CategoryGrid";
import InfinityAISection from "../components/InfinityAI/InfinityAISection";
import ProductCard from "../components/ProductCard";
import PersistentMemoryScene from "../components/PersistentMemoryScene";
import { CatalogProvider } from "../contexts/CatalogContext";
import { useCatalog } from "../contexts/useCatalog";
import { MemoryExperienceContext } from "../contexts/useMemoryExperience";
import { CANONICAL_CATEGORIES } from "../utils/categoryUtils";

const moments = [
  ["01", "Birthdays", "For their next trip around the sun.", "Birthday gift"],
  [
    "02",
    "Anniversaries",
    "Your story. A little more tangible.",
    "Anniversary gift for my partner",
  ],
  [
    "03",
    "Friendship",
    "For the person in every good memory.",
    "Photo gift for my best friend",
  ],
  [
    "04",
    "Just because",
    "The little things say the most.",
    "A thoughtful photo gift",
  ],
];
function HomeExperience() {
  const experienceRef = useRef(null);
  const mobile = useIsMobile();
  const { products, loading, error } = useCatalog();
  const [aiProduct, setAIProduct] = useState(null);
  const [categoryProduct, setCategoryProduct] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [category, setCategory] = useState("all");
  const [pillar, setPillar] = useState(0);
  const [momentQuery, setMomentQuery] = useState("");
  const available = CANONICAL_CATEGORIES.filter(
    (item) =>
      item.id === "all" ||
      products.some((product) => product.categoryId === item.id),
  );
  const discovery = products
    .filter((product) => category === "all" || product.categoryId === category)
    .slice(0, 6);
  const magazine = products.find(
    (product) => product.categoryId === "magazines",
  );

  const processScene = (
    <section
      id="how-it-works"
      className="film-process film-scene"
      data-memory-scene="howItWorks"
    >
      <div className="motion-chapter">
        <span>06 / SIMPLE TO ORDER. PERSONAL TO KEEP.</span>
      </div>
      <h2>
        You bring the memory.
        <br />
        <em>We make it physical.</em>
      </h2>
      <div
        className="memory-anchor film-process-anchor"
        data-memory-anchor="howItWorks"
      />
      <div className="film-process-steps">
        {[
          [
            Gift,
            "Find their kind of gift",
            "Explore the collection and choose your options.",
          ],
          [
            Heart,
            "Make it yours",
            "Add to your bag and place your order through checkout.",
          ],
          [
            MessageCircle,
            "Send the memories",
            "After ordering, send your photos and personalization details to us on WhatsApp.",
          ],
        ].map((step, index) => {
          const [Icon, title, copy] = step;
          return (
            <article key={title}>
              <div>
                <Icon size={23} />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
  const differenceScene = (
    <section
      id="infinity-difference"
      className="film-difference film-scene"
      data-memory-scene="infinityDifference"
    >
      <div className="motion-chapter">
        <span>05 / THE INFINITY DIFFERENCE</span>
        <span>MADE TO MEAN MORE</span>
      </div>
      <p className="film-eyebrow">THE DETAILS MAKE THE DIFFERENCE.</p>
      <div className="film-difference-layout">
        <div>
          <div
            className="memory-anchor film-brand-anchor"
            data-memory-anchor="infinityDifference"
          />
        </div>
        <div className="film-pillars">
          {[
            [
              "Personal, from the start.",
              "Your photos, your words, your story. At the heart of everything we make.",
            ],
            [
              "A little human attention.",
              "Share your personalization details with our team on WhatsApp after you order.",
            ],
            [
              "More than the moment.",
              "Made to display, wear, gift and keep close. A memory in a different form.",
            ],
          ].map(([title, copy], index) => (
            <button
              key={title}
              type="button"
              aria-pressed={pillar === index}
              onClick={() => setPillar(index)}
              onMouseEnter={() => setPillar(index)}
            >
              <span>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
  return (
    <MemoryExperienceContext.Provider
      value={{
        aiProduct,
        setAIProduct,
        categoryProduct,
        setCategoryProduct,
        tokens,
        setTokens,
        momentQuery,
      }}
    >
      <main className="memory-experience memory-film" ref={experienceRef}>
        <PersistentMemoryScene experienceRef={experienceRef} pillar={pillar} />
        <Hero3D />
        <div className="film-ribbon" aria-hidden="true">
          <span>YOUR PHOTOS</span>
          <i>✦</i>
          <span>YOUR PEOPLE</span>
          <i>✦</i>
          <span>YOUR STORIES</span>
          <i>✦</i>
          <span>MADE PERSONAL</span>
          <i>✦</i>
          <span>MADE TO KEEP</span>
        </div>
        <InfinityAISection />
        <CategoryGrid />
        {!mobile && (
          <section
            id="made-for-you"
            className="film-discovery film-scene"
            data-memory-scene="products"
          >
            <div className="motion-chapter">
              <span>03 / OUR FAVOURITES</span>
              <Link to="/shop">
                ALL PERSONALIZED GIFTS <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="film-section-heading">
              <h2>
                A few favourites.
                <br />
                <em>Made personal.</em>
              </h2>
              <p>
                Big celebrations. Little surprises.
                <br />
                Find something that feels like them.
              </p>
            </div>
            <div
              className="memory-anchor film-products-anchor"
              data-memory-anchor="products"
            />
            <div
              className="motion-product-filters"
              aria-label="Filter gifts by category"
            >
              {available.map((item) => (
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
              <p className="film-status" role="status">
                Opening the collection…
              </p>
            )}
            {error && (
              <p className="film-status" role="status">
                The collection is temporarily unavailable.{" "}
                <Link to="/shop">Try again in the shop →</Link>
              </p>
            )}
            {!loading && !error && !discovery.length && (
              <p className="film-status">
                There are no gifts in this collection right now.
              </p>
            )}
            <div className="motion-product-grid">
              {discovery.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
            <Link
              className="motion-link film-collection-link"
              to={category === "all" ? "/shop" : `/shop/${category}`}
            >
              Explore the collection <ArrowRight size={17} />
            </Link>
          </section>
        )}
        <section
          id="memory-transformation"
          className="film-photo-transformation film-scene"
        >
          <div className="motion-chapter">
            <span>05 / SAME MEMORY. A NEW FORM.</span>
          </div>
          <div className="film-gift-feeling" data-memory-scene="giftFeeling">
            <h2>
              A gift.
              <br />A feeling.
              <br />
              <em>A forever thing.</em>
            </h2>
          </div>
          <div className="film-one-photo" data-memory-scene="onePhotoChapter">
            <h2>
              One photo.
              <br />
              <em>A whole new chapter.</em>
            </h2>
            <div className="film-transform-copy">
              <p>
                A print to hold. A magazine to revisit. Your story, made
                personal.
              </p>
              <Link
                className="motion-link"
                to={
                  magazine
                    ? `/product/${magazine._id || magazine.id}`
                    : "/shop/magazines"
                }
              >
                Make your own magazine <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
        <section
          className="film-transformation film-scene"
          id="made-around-your-story"
          data-memory-scene="cameraRoll"
          data-memory-touch
        >
          <div className="motion-chapter">
            <span>04 / A MEMORY, IN A DIFFERENT FORM</span>
            <span>FROM DIGITAL TO TANGIBLE</span>
          </div>
          <div className="film-camera-copy">
            <h2>
              From
              <br />
              <span>camera roll.</span>
              <em>To something real.</em>
            </h2>
            <div className="film-story-note">
              <span>ONE PHOTO. A WHOLE NEW CHAPTER.</span>
              <p>
                A favourite day. An inside joke. Your entire love story.
                <br />
                Some things deserve more than a screen.
              </p>
              <Link
                className="motion-link"
                to={
                  magazine ? `/product/${magazine._id || magazine.id}` : "/shop"
                }
              >
                {magazine ? "Make your own magazine" : "Discover photo gifts"}{" "}
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
          <div
            className="memory-anchor film-story-anchor"
            data-memory-anchor="cameraRoll"
          />
        </section>
        {!mobile && (
          <section
            className="film-moments film-scene"
            data-memory-scene="moments"
          >
            <div
              className="memory-anchor film-moments-anchor"
              data-memory-anchor="moments"
            />
            <div className="film-section-heading">
              <div>
                <p className="film-eyebrow">
                  THE OCCASION IS ONLY THE BEGINNING
                </p>
                <h2>
                  For every kind
                  <br />
                  of <em>“you matter”.</em>
                </h2>
              </div>
              <span>GIFT BY MOMENT</span>
            </div>
            <div className="film-moment-list">
              {moments.map(([number, title, copy, query]) => (
                <a
                  key={title}
                  href="#infinity-ai-concierge"
                  onClick={() => setMomentQuery(query)}
                >
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <ArrowUpRight size={23} />
                </a>
              ))}
            </div>
          </section>
        )}
        {differenceScene}
        {processScene}
        {!mobile && (
          <section
            className="film-founder film-scene"
            data-memory-scene="founder"
          >
            <div
              className="memory-anchor film-founder-anchor"
              data-memory-anchor="founder"
            />
            <p className="film-eyebrow">
              THE STORY BEHIND INFINITY / EST. 20 APRIL 2025
            </p>
            <div>
              <h2>
                Started small.
                <br />
                <em>Made to grow.</em>
              </h2>
              <div>
                <p>
                  Infinity Customizations began with a simple idea: make
                  memories feel physical again.
                </p>
                <p>
                  Founded by Jashwanth Reddy on April 20, 2025 while studying
                  B.Tech, the studio brings photos, printing and personal
                  attention together to create meaningful gifts.
                </p>
                <Link className="motion-link" to="/about">
                  Meet Infinity <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}
        <section
          id="start-creating"
          className="film-final film-scene"
          data-memory-scene="finalMemory"
          data-memory-touch
        >
          <span className="film-final-watermark" aria-hidden="true">
            INFINITY
          </span>
          <p className="film-eyebrow">SOMETHING WORTH KEEPING.</p>
          <div
            className="memory-anchor film-final-anchor"
            data-memory-anchor="finalMemory"
          />
          <h2>
            Make the
            <br />
            <em>memory real.</em>
          </h2>
          <div className="motion-actions">
            <Link className="motion-button" to="/shop" data-magnetic>
              Let's customize <ArrowRight size={17} />
            </Link>
            <Link className="motion-link" to="/shop">
              Shop gifts <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="film-final-signoff">YOUR MOMENTS. INFINITE MEANING.</p>
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
