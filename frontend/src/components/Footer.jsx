import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Instagram } from "lucide-react";
import {
  getWhatsAppUrl,
  WHATSAPP_DISPLAY_PHONE,
  WHATSAPP_PHONE,
} from "../utils/whatsapp";
const GROUPS = [
  {
    title: "SHOP",
    links: [
      ["All gifts", "/shop"],
      ["Photo frames", "/shop/frames"],
      ["Polaroids", "/shop/memories"],
      ["Magazines", "/shop/magazines"],
      ["Phone cases", "/shop/essentials"],
      ["T-shirts", "/shop/apparel"],
    ],
  },
  {
    title: "HELP",
    links: [
      ["Shipping", "/shipping-policy"],
      ["Returns & refunds", "/refund-cancellation-policy"],
      ["Privacy", "/privacy-policy"],
      ["Terms", "/terms-and-conditions"],
    ],
  },
  {
    title: "ABOUT",
    links: [
      ["About us", "/about"],
      ["Contact", "/contact"],
      ["Your account", "/account"],
      ["Your orders", "/orders"],
    ],
  },
];
export default function Footer() {
  const footer = useRef(null);
  const home = useLocation().pathname === "/";
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting))
          footer.current?.classList.add("is-visible");
      },
      { threshold: 0.05 },
    );
    observer.observe(footer.current);
    const desktop = window.matchMedia("(min-width: 768px)");
    const syncGroups = () => {
      footer.current
        ?.querySelectorAll(".film-footer-group")
        .forEach((group) => {
          group.open = desktop.matches;
        });
    };
    syncGroups();
    desktop.addEventListener("change", syncGroups);
    const wordmark = footer.current.querySelector(".motion-footer-wordmark");
    const name = wordmark.querySelector(".footer-infinity-name");
    const fitWordmark = () => {
      wordmark.style.setProperty(
        "--wordmark-width",
        wordmark.clientWidth / name.offsetWidth,
      );
    };
    const resize = new ResizeObserver(fitWordmark);
    resize.observe(wordmark);
    document.fonts.ready.then(() => {
      if (footer.current) fitWordmark();
    });
    fitWordmark();
    return () => {
      observer.disconnect();
      resize.disconnect();
      desktop.removeEventListener("change", syncGroups);
    };
  }, []);
  return (
    <footer className="motion-footer" ref={footer} data-memory-scene="footer">
      <div className="footer-information">
        <div className="motion-footer-top">
          <p>
            Personalized gifts made from the moments you never want to forget.
          </p>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="motion-link"
          >
            Let’s make it personal <ArrowUpRight size={19} />
          </a>
        </div>
        <div className="motion-footer-links">
          {GROUPS.map((group) => (
            <details key={group.title} className="film-footer-group">
              <summary>
                {group.title}
                <span>+</span>
              </summary>
              {group.links.map(([label, to]) => (
                <Link key={to} to={to}>
                  {label}
                </Link>
              ))}
            </details>
          ))}
          <div>
            <h3>THE STUDIO</h3>
            <a href="mailto:infinitycustomizations@gmail.com">
              Write to us <ArrowUpRight size={13} />
            </a>
            <a href={`tel:+${WHATSAPP_PHONE}`}>{WHATSAPP_DISPLAY_PHONE}</a>
            <a
              href="https://instagram.com/infinitycustomizations"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={14} /> Instagram
            </a>
          </div>
        </div>
        <div className="motion-footer-bottom">
          <span>© {new Date().getFullYear()} INFINITY CUSTOMIZATIONS</span>
          <span>YOUR MOMENTS. INFINITE MEANING.</span>
          <a href="#root">BACK TO TOP ↑</a>
        </div>
      </div>
      {home && (
        <div className="footer-frame-stage" aria-hidden="true">
          <div
            className="memory-anchor film-footer-anchor"
            data-memory-anchor="footer"
          />
        </div>
      )}
      <div
        className="motion-footer-wordmark"
        aria-label="Infinity Customizations"
      >
        <span className="footer-infinity-name">INFINITY</span>
        <small>CUSTOMIZATIONS</small>
      </div>
    </footer>
  );
}
