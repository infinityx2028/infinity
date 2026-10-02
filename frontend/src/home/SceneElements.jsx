import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export function Chapter({ number, title, aside = "MEMORIES, MADE PHYSICAL." }) {
  return (
    <div className="scene-chapter">
      <span>
        {number} / {title}
      </span>
      <span>{aside}</span>
    </div>
  );
}
export function FrameSlot({ scene, className = "" }) {
  return (
    <div className="frame-safe-zone" data-frame-safe-zone={scene}>
      <div
        className={`scene-frame-slot ${className}`}
        data-film-anchor={scene}
        aria-hidden="true"
      />
    </div>
  );
}
export function ShopLink({
  children = "Explore gifts",
  className = "",
  to = "/shop",
}) {
  return (
    <Link
      className={`scene-button ${className}`}
      to={to}
      data-magnetic
      data-cursor="VIEW"
    >
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
