import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { useCatalog } from "../../contexts/useCatalog";
import { useMemoryExperience } from "../../contexts/useMemoryExperience";
import {
  extractIntent,
  getIntentTokens,
  getGiftRecommendations,
} from "../../services/giftAssistantService";
import { responsiveImage } from "../../utils/responsiveImages";

const SUGGESTIONS = [
  "Birthday gift under ₹800",
  "For my best friend",
  "Anniversary gift for my partner",
  "Photo gifts under ₹500",
];
export default function InfinityAISection() {
  const { products, loading: catalogLoading, error } = useCatalog();
  const { setAIProduct, setTokens } = useMemoryExperience();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const tokens = getIntentTokens(extractIntent(query));
  function update(value) {
    setQuery(value);
    setTokens(getIntentTokens(extractIntent(value)));
  }
  async function recommend(value = query, refinement = null) {
    if (!value.trim() || !products.length || busy) return;
    update(value);
    setBusy(true);
    setNotice("");
    try {
      const response = await getGiftRecommendations({
        query: value,
        refinement,
        currentIntent: refinement ? result?.intent : null,
        cachedProducts: products,
      });
      // Resolve every recommendation against the current real catalog.
      const resolved = (response?.products || [])
        .map((item) => {
          const catalogProduct = products.find(
            (product) => (product._id || product.id) === (item._id || item.id),
          );
          return catalogProduct
            ? {
                ...catalogProduct,
                recommendationReason: item.recommendationReason,
              }
            : null;
        })
        .filter(Boolean)
        .slice(0, 4);
      setResult({ ...response, products: resolved });
      setAIProduct(resolved[0] || null);
      if (!resolved.length)
        setNotice(
          "No matching gifts this time. Try a different budget or occasion.",
        );
    } catch {
      setNotice("The gift finder is taking a moment. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      id="infinity-ai-concierge"
      className="motion-ai motion-scene"
      data-memory-scene="ai"
    >
      <div className="motion-chapter">
        <span>01 / THE GIFT FINDER</span>
        <span>A LITTLE THOUGHT GOES A LONG WAY</span>
      </div>
      <div className="motion-ai-layout">
        <div className="motion-ai-copy">
          <p className="motion-kicker">
            <Sparkles size={14} /> INFINITY AI
          </p>
          <h2>
            Who are we
            <br />
            <em>gifting today?</em>
          </h2>
          <p>
            Tell us a little about them.
            <br />
            We’ll find something that feels personal.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              recommend();
            }}
            className="motion-ai-form"
            data-cursor="ASK"
          >
            <label htmlFor="memory-gift-query" className="sr-only">
              Describe the recipient, occasion, and your budget
            </label>
            <input
              id="memory-gift-query"
              value={query}
              onChange={(event) => update(event.target.value)}
              placeholder="Birthday gift for my best friend under ₹800…"
              maxLength={400}
            />
            <button
              aria-label="Find their gift"
              type="submit"
              disabled={
                !query.trim() || busy || catalogLoading || !products.length
              }
            >
              <ArrowRight size={22} />
            </button>
          </form>
          <div className="motion-ai-intents" aria-live="polite">
            {tokens.map((token) => (
              <span key={token.key}>{token.label}</span>
            ))}
          </div>
          <div className="motion-ai-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => recommend(suggestion)}
                disabled={busy || !products.length}
              >
                {suggestion} <span>↗</span>
              </button>
            ))}
          </div>
          <p className="motion-ai-status" role="status">
            {catalogLoading
              ? "Opening the real gift catalog…"
              : error
                ? "Catalog unavailable. Please try again shortly."
                : busy
                  ? "Finding their kind of personal…"
                  : notice || "Recommendations from our real catalog. Always."}
          </p>
        </div>
        <div className="motion-ai-visual" data-memory-touch>
          <div
            className="memory-anchor ai-memory-anchor"
            data-memory-anchor="ai"
          />
          <span className="motion-ai-orbit-label">
            THE THOUGHT COUNTS.
            <br />
            WE MAKE IT TANGIBLE.
          </span>
        </div>
      </div>
      {result?.products?.length > 0 && (
        <div className="motion-ai-results" aria-live="polite">
          <div className="motion-results-heading">
            <h3>I found {result.products.length} gifts that fit.</h3>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                update("");
                setAIProduct(null);
              }}
            >
              <RotateCcw size={14} /> Start again
            </button>
          </div>
          {result.needsClarification && (
            <p className="motion-clarification">
              {result.clarificationQuestion}
            </p>
          )}
          <div className="motion-results-grid">
            {result.products.map((product, index) => (
              <article
                key={product._id || product.id}
                className={`motion-recommendation ${index === 0 ? "motion-best-match" : ""}`}
              >
                <Link
                  to={`/product/${product._id || product.id}`}
                  data-cursor="VIEW"
                >
                  <img
                    {...responsiveImage(
                      product.images?.[0] || product.image,
                      "(max-width: 767px) 45vw, 280px",
                    )}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
                <span className="motion-kicker">
                  {index === 0
                    ? "✦ BEST MATCH"
                    : `0${index + 1} / ANOTHER POSSIBILITY`}
                </span>
                <h4>{product.name}</h4>
                <strong>
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </strong>
                <p>{product.recommendationReason}</p>
                <Link
                  className="motion-link"
                  to={`/product/${product._id || product.id}`}
                >
                  Customize <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
          <div className="motion-refinements">
            {["Photo Gifts", "Under ₹500", "Premium", "Show More"].map(
              (refinement) => (
                <button
                  key={refinement}
                  type="button"
                  disabled={busy}
                  onClick={() => recommend(query, refinement)}
                >
                  {refinement} ↗
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}
