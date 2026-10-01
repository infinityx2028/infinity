import { Link } from "react-router-dom";
import { ArrowUpRight, Instagram } from "lucide-react";
const GROUPS = [
  {
    title: "EXPLORE",
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
    title: "LET’S TALK",
    links: [
      ["About us", "/about"],
      ["Contact", "/contact"],
      ["Your account", "/account"],
      ["Your orders", "/orders"],
    ],
  },
  {
    title: "THE DETAILS",
    links: [
      ["Shipping", "/shipping-policy"],
      ["Returns & refunds", "/refund-cancellation-policy"],
      ["Privacy", "/privacy-policy"],
      ["Terms", "/terms-and-conditions"],
    ],
  },
];
export default function Footer() {
  return (
    <footer className="motion-footer">
      <div className="motion-footer-top">
        <p>
          GOOD GIFTS START
          <br />
          <em>with a little thought.</em>
        </p>
        <a
          href="https://wa.me/918985993948"
          target="_blank"
          rel="noreferrer"
          className="motion-link"
        >
          Let’s make it personal <ArrowUpRight size={19} />
        </a>
      </div>
      <div className="motion-footer-links">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map(([label, to]) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </div>
        ))}
        <div>
          <h3>THE STUDIO</h3>
          <a href="mailto:infinitycustomizations@gmail.com">
            Write to us <ArrowUpRight size={13} />
          </a>
          <a href="tel:+918985993948">+91 89859 93948</a>
          <a
            href="https://instagram.com/infinitycustomizations"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={14} /> Instagram
          </a>
        </div>
      </div>
      <div
        className="motion-footer-wordmark"
        aria-label="Infinity Customizations"
      >
        infinity<span>✦</span>
      </div>
      <div className="motion-footer-bottom">
        <span>© {new Date().getFullYear()} INFINITY CUSTOMIZATIONS</span>
        <span>YOUR MOMENTS. INFINITE MEANING.</span>
        <a href="#root">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
