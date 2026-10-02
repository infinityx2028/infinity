import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useCatalog } from "../contexts/useCatalog";
import {
  extractIntent,
  getIntentTokens,
  getGiftRecommendations,
  rankCatalogDeterministically,
} from "../services/giftAssistantService";
import { responsiveImage } from "../utils/responsiveImages";
import { Chapter, FrameSlot } from "../home/SceneElements";

export default function HomeGiftFinder({ onIntent }) {
  const { products, loading, error } = useCatalog();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const pending = useRef(false);
  const tokens = getIntentTokens(extractIntent(query));
  function update(value) {
    setQuery(value);
    onIntent(getIntentTokens(extractIntent(value)).slice(0, 4));
  }
  async function find(value = query) {
    if (!value.trim() || !products.length || pending.current) return;
    pending.current = true;
    update(value);
    setBusy(true);
    setNotice("");
    try {
      const response = await getGiftRecommendations({
        query: value,
        cachedProducts: products,
      });
      const real = (response.products || [])
        .map((item) =>
          products.find((p) => (p._id || p.id) === (item._id || item.id)),
        )
        .filter(Boolean);
      const safe = rankCatalogDeterministically(
        real,
        extractIntent(value),
      ).products.slice(0, 4);
      setResult(safe);
      setNotice(
        safe.length
          ? ""
          : "No available gifts fit that request. Try a different occasion or budget.",
      );
    } catch {
      setNotice("The gift finder is taking a moment. Please try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className="scene-scene scene-ai"
      id="infinity-ai-concierge"
      data-film-scene="ai"
    >
      <div className="scene-container">
        <Chapter number="03" title="A LITTLE THOUGHT GOES A LONG WAY" />
        <div className="scene-grid scene-ai-layout">
          <div className="scene-ai-title">
            <p className="scene-eyebrow">
              <Sparkles size={14} /> INFINITY AI
            </p>
            <h2>
              Who are we
              <br />
              gifting <em>today?</em>
            </h2>
          </div>
          <div className="scene-ai-stage">
            <FrameSlot scene="ai" />
            <span className="scene-annotation">
              A LITTLE HELP CHOOSING.
              <br />A LOT OF MEANING.
            </span>
          </div>
          <div className="scene-ai-controls" data-frame-exclusion>
            <p className="scene-body">
              Tell us who you're shopping for, the occasion and your budget. The
              right gift is already in our collection.
            </p>
            <form
              className="scene-query"
              onSubmit={(e) => {
                e.preventDefault();
                find();
              }}
              data-cursor="ASK"
            >
              <label htmlFor="infinity-gift-query" className="sr-only">
                Recipient, occasion and budget
              </label>
              <input
                id="infinity-gift-query"
                value={query}
                maxLength={400}
                onChange={(e) => update(e.target.value)}
                placeholder="Birthday gift for my best friend under ₹800…"
              />
              <button
                aria-label="Find gifts"
                disabled={busy || loading || !query.trim() || !products.length}
              >
                <ArrowRight size={24} />
              </button>
            </form>
            <div className="scene-intents" aria-live="polite">
              {tokens.map((t) => (
                <span key={t.key}>{t.label}</span>
              ))}
            </div>
            <div className="scene-suggestions">
              {[
                "Birthday gift under ₹800",
                "Anniversary gift for my partner",
                "For my best friend",
                "Photo gifts under ₹500",
              ].map((value) => (
                <button
                  key={value}
                  disabled={busy || !products.length}
                  onClick={() => find(value)}
                >
                  {value}
                  <ArrowUpRight size={13} />
                </button>
              ))}
            </div>
            <p className="scene-status" role="status">
              {loading
                ? "Opening the live gift catalog…"
                : error
                  ? "The catalog is unavailable. Please try again shortly."
                  : busy
                    ? "Finding their kind of personal…"
                    : notice ||
                      "Chosen from our real catalog. Within your budget."}
            </p>
          </div>
        </div>
        {!!result?.length && (
          <div
            className="scene-results"
            data-frame-exclusion
            aria-live="polite"
          >
            <div className="scene-results-heading">
              <h3>Found {result.length} gifts that fit.</h3>
              <button
                onClick={() => {
                  setResult(null);
                  update("");
                }}
              >
                Start again ↗
              </button>
            </div>
            <div className="scene-result-grid">
              {result.map((p, i) => (
                <article key={p._id || p.id}>
                  <Link to={`/product/${p._id || p.id}`} data-cursor="VIEW">
                    <img
                      {...responsiveImage(
                        p.images?.[0] || p.image,
                        "(max-width: 767px) 43vw, 280px",
                      )}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="scene-eyebrow">
                      {i === 0
                        ? "✦ BEST MATCH"
                        : `0${i + 1} / ANOTHER POSSIBILITY`}
                    </span>
                    <h4>{p.name}</h4>
                    <strong>₹{Number(p.price).toLocaleString("en-IN")}</strong>
                  </Link>
                  <p>{p.recommendationReason}</p>
                  <Link className="scene-link" to={`/product/${p._id || p.id}`}>
                    View product
                    <ArrowUpRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
