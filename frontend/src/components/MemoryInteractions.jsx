import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
export default function MemoryInteractions() {
  const cursor = useRef(null);
  const wipe = useRef(null);
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    cursor.current.style.opacity = "0";
    if (
      previous.current !== pathname &&
      !/\/(checkout|cart|account|profile|orders|admin)/.test(pathname) &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      wipe.current.animate(
        [
          { transform: "translateX(-120vw) rotate(-8deg)", opacity: 0.8 },
          { transform: "translateX(120vw) rotate(8deg)", opacity: 0.8 },
        ],
        { duration: 450, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    }
    previous.current = pathname;
  }, [pathname]);
  useEffect(() => {
    let frame;
    let magnetic;
    function move(event) {
      if (
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        /\/(checkout|cart|admin)/.test(window.location.pathname)
      )
        return;
      const { clientX: x, clientY: y } = event;
      const target = event.target.closest("[data-cursor],a,button,input");
      const button = event.target.closest("[data-magnetic]");
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        cursor.current.style.transform = `translate3d(${x}px,${y}px,0)`;
        cursor.current.dataset.active = target ? "true" : "false";
        cursor.current.textContent = target?.dataset.cursor || "";
        cursor.current.style.opacity = "1";
        if (magnetic && magnetic !== button) {
          magnetic.style.setProperty("--magnet-x", "0px");
          magnetic.style.setProperty("--magnet-y", "0px");
        }
        if (button) {
          const rect = button.getBoundingClientRect();
          button.style.setProperty(
            "--magnet-x",
            `${Math.max(-5, Math.min(5, (x - rect.left - rect.width / 2) * 0.08))}px`,
          );
          button.style.setProperty(
            "--magnet-y",
            `${Math.max(-5, Math.min(5, (y - rect.top - rect.height / 2) * 0.08))}px`,
          );
        }
        magnetic = button;
      });
    }
    const leave = () => {
      cursor.current.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <>
      <div ref={cursor} className="memory-cursor" aria-hidden="true" />
      <div ref={wipe} className="memory-route-wipe" aria-hidden="true">
        <span>INFINITY / MEMORIES IN MOTION</span>
      </div>
    </>
  );
}
