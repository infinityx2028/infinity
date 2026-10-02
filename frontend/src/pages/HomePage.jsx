import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import { CatalogProvider } from "../contexts/CatalogContext";
import { useCatalog } from "../contexts/useCatalog";
import { CANONICAL_CATEGORIES } from "../utils/categoryUtils";
import { responsiveImage } from "../utils/responsiveImages";
import { getWhatsAppUrl } from "../utils/whatsapp";
import MemoryFrameDirector from "../components/MemoryFrameDirector";
import HomeGiftFinder from "../components/HomeGiftFinder";
import { Chapter, FrameSlot, ShopLink } from "../home/SceneElements";

function Experience() {
  const root = useRef(null);
  const { products, loading, error } = useCatalog();
  const [tokens, setTokens] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const categories = CANONICAL_CATEGORIES.filter((c) => c.id !== "all")
    .map((c) => {
      const group = products.filter((p) => p.categoryId === c.id);
      const preferred =
        c.id === "apparel"
          ? group.find((p) => /t.?shirt/i.test(p.name))
          : c.id === "essentials"
            ? group.find((p) => /case/i.test(p.name))
            : null;
      return { ...c, product: preferred || group[0] };
    })
    .filter((c) => c.product);
  const magazine = products.find((p) => p.categoryId === "magazines");
  const universe = ["frames", "memories", "essentials", "apparel", "addons"]
    .map((id) => categories.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 4);
  const favourites = categories.slice(0, 4).map((c) => c.product);
  return (
    <main className="memory-world" ref={root}>
      <div className="scene-environment" aria-hidden="true">
        <div className="scene-paper-grain" />
      </div>
      <MemoryFrameDirector
        rootRef={root}
        magazine={magazine}
        universe={universe}
        tokens={tokens}
      />
      <section
        className="scene-scene scene-opening-hero"
        data-film-scene="hero"
      >
        <div className="scene-container">
          <div className="scene-hero-meta">
            <span>PERSONALIZED · MADE FOR YOU</span>
            <span>01 / A MEMORY ENTERS INFINITY</span>
          </div>
          <div className="scene-hero-layout">
            <h1>
              <span className="scene-hero-line">YOUR</span>
              <span className="scene-hero-line scene-hero-memories">
                MEMORIES.
              </span>
              <span className="scene-hero-personal">Made personal.</span>
            </h1>
            <div className="scene-hero-object">
              <FrameSlot scene="hero" />
              <span className="scene-photo-id">
                FIG. 01 — YOUR PEOPLE. YOUR STORY.
              </span>
            </div>
            <div className="scene-hero-intro">
              <span className="scene-cross" aria-hidden="true">
                ✦
              </span>
              <p>
                Turn photos, stories and moments
                <br /> into gifts made just for them.
              </p>
            </div>
            <div className="scene-hero-actions">
              <ShopLink />
              <a className="scene-link" href="#infinity-ai-concierge">
                Ask Infinity AI
                <Sparkles size={16} />
              </a>
            </div>
          </div>
          <a className="scene-scroll" href="#infinity-ai-concierge">
            <ArrowDown size={15} /> SCROLL TO FOLLOW THE MEMORY{" "}
            <span>02 — 13</span>
          </a>
        </div>
      </section>
      <HomeGiftFinder onIntent={setTokens} />
      <section
        id="collections-section"
        className="scene-scene scene-categories"
        data-film-scene="categories"
      >
        <div className="scene-container">
          <Chapter number="04" title="THE CATEGORY UNIVERSE" />
          <div className="scene-category-heading">
            <div>
              <p className="scene-eyebrow">SHOP BY CATEGORY</p>
              <h2>
                A whole world
                <br />
                of <em>personal.</em>
              </h2>
            </div>
            <div className="scene-category-background">
              <FrameSlot scene="categories" />
            </div>
            <Link className="scene-link" to="/shop">
              Every gift
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div
            className={`scene-category-universe ${activeCategory ? "has-selection" : ""}`}
            data-cursor="DRAG"
            onMouseLeave={() => setActiveCategory(null)}
          >
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/shop/${c.slug}`}
                className={`scene-category-object ${activeCategory === c.id ? "is-selected" : ""}`}
                style={{ "--depth": i % 3, "--angle": i % 2 === 0 ? -3 : 3 }}
                onMouseEnter={() => setActiveCategory(c.id)}
                onFocus={() => setActiveCategory(c.id)}
                onBlur={() => setActiveCategory(null)}
                data-cursor="VIEW"
              >
                <div>
                  <img
                    {...responsiveImage(
                      c.product.images?.[0] || c.product.image,
                      "(max-width: 767px) 110px, 250px",
                    )}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  {c.name}
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            ))}
          </div>
          {(loading || error || !categories.length) && (
            <p className="scene-status" role="status">
              {loading
                ? "Opening the collections…"
                : error
                  ? "The catalog is temporarily unavailable."
                  : "New gifts will appear here when available."}{" "}
              <Link to="/shop">Visit the shop ↗</Link>
            </p>
          )}
        </div>
      </section>
      <section
        className="scene-scene scene-emotional"
        data-film-scene="emotion"
      >
        <div className="scene-container">
          <p className="scene-eyebrow">05 / FOR THE PEOPLE WHO STAY WITH YOU</p>
          <h2>
            A GIFT
            <br />
            FOR TODAY.
            <br />
            <span>A memory</span>
            <br />
            <em>for much longer.</em>
          </h2>
          <span className="scene-emotional-star" aria-hidden="true">
            ✦
          </span>
        </div>
      </section>
      <section
        id="made-around-your-story"
        className="scene-scene scene-camera"
        data-film-scene="camera"
      >
        <div className="scene-container">
          <Chapter number="06" title="SOME THINGS DESERVE MORE THAN A SCREEN" />
          <div className="scene-grid">
            <div className="scene-camera-copy">
              <h2>
                FROM
                <br />
                CAMERA
                <br />
                ROLL.
              </h2>
            </div>
            <div className="scene-camera-followup">
              <p className="scene-body">
                A favourite day. An inside joke. The people in every good
                memory.
              </p>
              <span className="scene-link">
                To something real.
                <ArrowRight size={18} />
              </span>
            </div>
            <div className="scene-camera-stage">
              <FrameSlot scene="camera" />
              <span className="scene-annotation">
                ONE PHOTO.
                <br />A WHOLE NEW CHAPTER.
              </span>
            </div>
          </div>
        </div>
      </section>
      <section
        className="scene-scene scene-magazine"
        data-film-scene="magazine"
      >
        <div className="scene-container">
          <Chapter number="07" title="YOUR STORY, COVER TO COVER" />
          <div className="scene-magazine-layout">
            <div className="scene-magazine-aside">
              <span className="scene-eyebrow">
                THE PHOTOS ALIGN.
                <br />
                THE STORY TAKES SHAPE.
              </span>
              <p className="scene-body">
                Turn the photos on your phone into something you can hold, gift
                and remember.
              </p>
            </div>
            <div className="scene-magazine-stage">
              <FrameSlot scene="magazine" />
            </div>
            <div className="scene-magazine-copy">
              <h2>
                To something
                <br />
                <em>real.</em>
              </h2>
              <ShopLink
                to={
                  magazine ? `/product/${magazine._id || magazine.id}` : "/shop"
                }
              >
                {magazine ? "Create your magazine" : "Discover photo gifts"}
              </ShopLink>
            </div>
          </div>
        </div>
      </section>
      <section
        className="scene-scene scene-product-universe"
        data-film-scene="universe"
      >
        <div className="scene-container">
          <Chapter number="08" title="A MEMORY. IN A DIFFERENT FORM." />
          <div className="scene-grid">
            <div className="scene-universe-stage">
              <FrameSlot scene="universe" />
              <span className="scene-annotation">
                SAME MOMENT.
                <br />
                INFINITE POSSIBILITIES.
              </span>
            </div>
            <div className="scene-universe-copy">
              <p className="scene-eyebrow">
                FROM A PHOTO. TO YOUR KIND OF GIFT.
              </p>
              <h2>
                Keep it.
                <br />
                Wear it.
                <br />
                <em>Make it yours.</em>
              </h2>
              <div className="scene-universe-links">
                {universe.map((c, i) => (
                  <Link
                    key={c.id}
                    to={`/product/${c.product._id || c.product.id}`}
                    data-universe-link={i}
                  >
                    <span>0{i + 1}</span>
                    {c.name}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
              <Link className="scene-link" to="/shop">
                Find your form of personal
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section
        id="made-for-you"
        className="scene-scene scene-favourites"
        data-film-scene="favourites"
      >
        <div className="scene-container">
          <div className="scene-favourites-heading">
            <p className="scene-eyebrow">MADE FOR YOUR MOMENTS.</p>
            <Link className="scene-link" to="/shop">
              Shop all
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="scene-favourites-grid">
            {favourites.map((p) => (
              <Link
                key={p._id || p.id}
                to={`/product/${p._id || p.id}`}
                data-cursor="VIEW"
              >
                <div>
                  <img
                    {...responsiveImage(
                      p.images?.[0] || p.image,
                      "(max-width: 1023px) 40vw, 320px",
                    )}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h3>{p.name}</h3>
                <span>
                  FROM{" "}
                  <strong>₹{Number(p.price).toLocaleString("en-IN")}</strong>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="scene-scene scene-process"
        data-film-scene="process"
      >
        <div className="scene-container">
          <Chapter number="09" title="SIMPLE TO ORDER. PERSONAL TO KEEP." />
          <div className="scene-process-heading">
            <h2>
              You bring
              <br />
              the <em>memory.</em>
            </h2>
            <p className="scene-body">
              We turn it into something physical.
              <br />
              Here's how your moment becomes a gift.
            </p>
            <FrameSlot scene="process" />
          </div>
          <div className="scene-process-path">
            <div className="scene-path-track" aria-hidden="true">
              <div className="scene-travelling-photo">
                <img src="/images/memory-core-480.webp" alt="" loading="lazy" />
              </div>
            </div>
            <ol className="scene-steps">
              {[
                [
                  "Choose your gift",
                  "Find a product, select options and add it to your bag.",
                ],
                [
                  "Place your order",
                  "Complete checkout and payment. Keep your order confirmation.",
                ],
                [
                  "Send your photos",
                  "After confirmation, send photos and customization details on WhatsApp.",
                ],
                [
                  "We personalize it",
                  "Your photos, words and story become part of your chosen gift.",
                ],
                [
                  "Your memory is real",
                  "Something to display, wear, gift and hold close.",
                ],
              ].map(([title, copy], i) => (
                <li key={title}>
                  <span>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="scene-process-note">
            <p>
              Personalization happens after order confirmation.
              <br />
              No website photo upload needed.
            </p>
            <a
              className="scene-link"
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
            >
              Questions? Talk to the studio
              <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>
      <section
        id="infinity-difference"
        className="scene-scene scene-difference"
        data-film-scene="difference"
      >
        <div className="scene-infinity-ghost" aria-hidden="true">
          INFINITY
        </div>
        <div className="scene-container">
          <Chapter
            number="10"
            title="THE INFINITY DIFFERENCE"
            aside="MADE TO MEAN MORE"
          />
          <div className="scene-grid">
            <div className="scene-difference-copy">
              <p className="scene-eyebrow">NOT JUST A GIFT.</p>
              <h2>
                A MEMORY
                <br />
                MADE
                <br />
                <em>tangible.</em>
              </h2>
              <FrameSlot scene="difference" />
            </div>
            <div className="scene-difference-rows">
              {[
                [
                  "Personalized",
                  "Made around your photos, stories and moments.",
                ],
                [
                  "Made with care",
                  "Thoughtfully created with attention to every detail.",
                ],
                [
                  "Made to mean more",
                  "Personal gifts created to become lasting memories.",
                ],
              ].map(([title, copy], i) => (
                <article key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                  <ArrowUpRight size={20} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="scene-scene scene-studio" data-film-scene="studio">
        <div className="scene-container">
          <Chapter
            number="11"
            title="THE STORY BEHIND INFINITY"
            aside="EST. 20 APRIL 2025"
          />
          <div className="scene-grid">
            <div className="scene-studio-title">
              <h2>
                STARTED
                <br />
                SMALL.
                <br />
                <em>Made to grow.</em>
              </h2>
            </div>
            <div className="scene-studio-copy">
              <p>
                It began with a simple idea.
                <br />
                Some moments deserve to become real.
              </p>
              <p>
                Jashwanth Reddy started Infinity Customizations on April 20,
                2025 while studying B.Tech. Personalized gifts, custom printing
                and creative products became a way to turn that ambition into
                something people could hold.
              </p>
              <p>
                Today, the idea stays personal. Your photos. Your people. Your
                story.
              </p>
              <Link className="scene-link" to="/about">
                Meet Infinity
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section
        id="start-creating"
        className="scene-scene scene-final"
        data-film-scene="final"
      >
        <div className="scene-container">
          <p className="scene-eyebrow">12 / SOMETHING WORTH KEEPING.</p>
          <FrameSlot scene="final" />
          <h2>
            MAKE THE
            <br />
            <em>memory real.</em>
          </h2>
          <p>Turn a moment into something they can hold.</p>
          <div className="scene-final-actions">
            <ShopLink>Let's customize</ShopLink>
            <Link className="scene-link" to="/shop">
              Explore gifts
              <ArrowRight size={16} />
            </Link>
          </div>
          <span className="scene-final-signoff">
            YOUR MOMENTS. INFINITE MEANING.
          </span>
        </div>
      </section>
    </main>
  );
}
export default function HomePage() {
  return (
    <CatalogProvider>
      <Experience />
    </CatalogProvider>
  );
}
