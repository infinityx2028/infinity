import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { useCart } from "../contexts/useCart";
import { useInfinityAI } from "../contexts/useInfinityAI";
import { API_BASE_URL } from "../services/api";
import { CANONICAL_CATEGORIES } from "../utils/categoryUtils";
import { responsiveImage } from "../utils/responsiveImages";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { cart, openCartDrawer } = useCart();
  const { openInfinityAI } = useInfinityAI();
  const navigate = useNavigate();
  const location = useLocation();
  const [overlay, setOverlay] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [searchStatus, setSearchStatus] = useState("");
  const dialog = useRef(null);
  const open = overlay?.path === location.pathname ? overlay.kind : null;
  const count = cart.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0,
  );
  const matches = query.trim()
    ? catalog
        .filter((product) =>
          `${product.name} ${product.categoryId} ${product.description || ""}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
        )
        .slice(0, 6)
    : [];
  const show = (kind) => setOverlay({ kind, path: location.pathname });
  const close = () => setOverlay(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prior = document.activeElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current
      ?.querySelector(open === "search" ? "input" : "button")
      ?.focus();
    function keyboard(event) {
      if (event.key === "Escape") setOverlay(null);
      if (event.key === "Tab") {
        const elements = [
          ...dialog.current.querySelectorAll(
            "a[href],button:not([disabled]),input",
          ),
        ];
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", keyboard);
      prior?.focus({ preventScroll: true });
    };
  }, [open]);
  useEffect(() => {
    if (open !== "search") return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/products`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid catalog");
        setCatalog(data.filter((product) => product.isActive !== false));
        setSearchStatus("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setSearchStatus(
            "Search is temporarily unavailable. You can still browse the shop.",
          );
      });
    return () => controller.abort();
  }, [open]);
  function ai() {
    close();
    if (location.pathname === "/")
      document.getElementById("infinity-ai-concierge")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    else openInfinityAI();
  }
  function search(event) {
    event.preventDefault();
    if (query.trim()) {
      close();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }
  const links = [
    { label: "Shop", to: "/shop" },
    { label: "Collections", to: "/#collections-section" },
    { label: "Infinity AI", action: ai },
    { label: "Best sellers", to: "/shop?best=1" },
    { label: "About", to: "/about" },
  ];
  return (
    <>
      <header className={`motion-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="motion-header-inner">
          <button
            type="button"
            className="motion-menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={open === "menu"}
            onClick={() => show("menu")}
          >
            <Menu size={22} />
          </button>
          <Link
            to="/"
            className="motion-wordmark"
            aria-label="Infinity Customizations home"
          >
            <span>
              infinity<span className="motion-wordmark-star">✦</span>
            </span>
            <small>CUSTOMIZATIONS</small>
          </Link>
          <nav className="motion-desktop-nav" aria-label="Main navigation">
            {links.map((link) =>
              link.action ? (
                <button type="button" key={link.label} onClick={link.action}>
                  {link.label} <span>✦</span>
                </button>
              ) : link.label === "Collections" ? (
                <button
                  type="button"
                  key={link.label}
                  onClick={() => show("collections")}
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <div className="motion-nav-actions">
            <button
              type="button"
              onClick={() => show("search")}
              aria-label="Search gifts"
            >
              <Search size={19} />
            </button>
            <Link
              className="motion-account-link"
              to={isAuthenticated ? "/account" : "/login"}
              aria-label="Your account"
            >
              <User size={19} />
            </Link>
            <button
              type="button"
              onClick={openCartDrawer}
              aria-label={`Open bag, ${count} items`}
            >
              <ShoppingBag size={19} />
              <span className="motion-bag-label">BAG</span>
              {count > 0 && <span className="motion-bag-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="motion-overlay-title"
          className={`motion-nav-overlay ${open === "menu" ? "motion-menu-overlay" : ""}`}
        >
          <div className="motion-overlay-top">
            <Link to="/" className="motion-wordmark" onClick={close}>
              <span>INFINITY</span>
              <small>CUSTOMIZATIONS</small>
            </Link>
            <button type="button" onClick={close} aria-label={`Close ${open}`}>
              <X size={24} />
            </button>
          </div>
          {open === "menu" && (
            <>
              <div className="motion-menu-memory" aria-hidden="true">
                <img src="/images/memory-rukmini-480.webp" alt="" />
              </div>
              <h2 id="motion-overlay-title" className="sr-only">
                Explore Infinity
              </h2>
              <nav className="motion-fullscreen-menu">
                {[
                  ...links.slice(0, 4),
                  {
                    label: "Account",
                    to: isAuthenticated ? "/account" : "/login",
                  },
                  links[4],
                ].map((link, index) =>
                  link.action ? (
                    <button
                      type="button"
                      key={link.label}
                      onClick={link.action}
                    >
                      <span>0{index + 1}</span>
                      {link.label}
                      <i className="motion-menu-ai-star" aria-hidden="true">✦</i>
                      <ArrowUpRight size={25} />
                    </button>
                  ) : (
                    <Link key={link.label} to={link.to} onClick={close}>
                      <span>0{index + 1}</span>
                      {link.label}
                      <ArrowUpRight size={25} />
                    </Link>
                  ),
                )}
              </nav>
              <div className="motion-menu-bottom">
                <span>YOUR PHOTOS. YOUR STORIES. YOUR INFINITY.</span>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      close();
                      navigate("/");
                    }}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                ) : (
                  <Link to="/signup" onClick={close}>
                    Join Infinity <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </>
          )}
          {open === "collections" && (
            <>
              <p className="motion-kicker">THERE’S A MEMORY IN EVERYTHING.</p>
              <h2 id="motion-overlay-title">
                Find your
                <br />
                <em>kind of personal.</em>
              </h2>
              <nav className="motion-collection-menu">
                {CANONICAL_CATEGORIES.map((category, index) => (
                  <Link
                    key={category.id}
                    to={
                      category.id === "all" ? "/shop" : `/shop/${category.slug}`
                    }
                    onClick={close}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {category.name}
                    <ArrowUpRight size={21} />
                  </Link>
                ))}
              </nav>
            </>
          )}
          {open === "search" && (
            <>
              <p className="motion-kicker">
                LET’S FIND SOMETHING THAT MEANS SOMETHING.
              </p>
              <h2 id="motion-overlay-title">
                What are you
                <br />
                <em>looking for?</em>
              </h2>
              <form className="motion-search-form" onSubmit={search}>
                <label htmlFor="motion-search-input" className="sr-only">
                  Search the real gift catalog
                </label>
                <input
                  id="motion-search-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="A frame, a story, a little surprise…"
                />
                <button
                  type="submit"
                  aria-label="Search catalog"
                  disabled={!query.trim()}
                >
                  <ArrowRight size={24} />
                </button>
              </form>
              <p role="status" className="motion-search-status">
                {searchStatus ||
                  (query.trim() && catalog.length && !matches.length
                    ? "No exact matches. Try “frame”, “magazine”, or “polaroid”."
                    : "SEARCH BY PRODUCT OR CATEGORY")}
              </p>
              <div className="motion-search-results">
                {matches.map((product) => (
                  <Link
                    to={`/product/${product._id || product.id}`}
                    key={product._id || product.id}
                    onClick={close}
                  >
                    <img
                      {...responsiveImage(product.images?.[0] || product.image)}
                      alt={product.name}
                      decoding="async"
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
              </div>
              <button type="button" className="motion-link" onClick={ai}>
                Not sure? Ask Infinity AI ✦
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
