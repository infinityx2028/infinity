import { useEffect, useRef, useState } from "react";
import { useCatalog } from "../contexts/useCatalog";
import { useMemoryExperience } from "../contexts/useMemoryExperience";

const STATES = {
  hero: { rotate: -9, tilt: -10, opacity: 1, dark: 0 },
  ai: { rotate: 6, tilt: 8, opacity: 1, dark: 0 },
  categories: { rotate: -4, tilt: -5, opacity: 1, dark: 0 },
  products: { rotate: 12, tilt: 8, opacity: 0, dark: 0 },
  story: { rotate: -5, tilt: -8, opacity: 1, dark: 0 },
  wall: { rotate: 8, tilt: 5, opacity: 0.65, dark: 0.15 },
  brand: { rotate: -12, tilt: 12, opacity: 0.5, dark: 1 },
  process: { rotate: 3, tilt: -6, opacity: 0, dark: 0 },
  final: { rotate: -5, tilt: -4, opacity: 1, dark: 0 },
};
const interpolate = (a, b, progress) => a + (b - a) * progress;

export default function PersistentMemoryScene({ experienceRef, pillar }) {
  const { products } = useCatalog();
  const { aiProduct, categoryProduct, tokens } = useMemoryExperience();
  const [scene, setScene] = useState("hero");
  const position = useRef(null);
  const frameBody = useRef(null);
  const world = useRef(null);
  const sceneRef = useRef("hero");
  const frameProduct = products.find(
    (product) => product.categoryId === "frames",
  );
  const product =
    scene === "ai"
      ? aiProduct || frameProduct
      : scene === "categories"
        ? categoryProduct || frameProduct
        : frameProduct;
  const form = scene === 'story' ? 'magazine'
    : scene === 'categories' ? 'polaroid'
    : scene === 'ai' && product?.categoryId === 'magazines' ? 'magazine'
    : scene === 'ai' && product?.categoryId === 'memories' ? 'polaroid'
    : scene === 'ai' && product?.categoryId === 'essentials' ? 'case' : 'frame';

  useEffect(() => {
    const root = experienceRef.current;
    const object = position.current;
    const atmosphere = world.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf;
    let pointerFrame;
    let anchors = [];
    let touch = null;
    let dragging = false;
    const quality =
      navigator.connection?.saveData ||
      navigator.hardwareConcurrency <= 4 ||
      window.matchMedia("(pointer: coarse)").matches
        ? "low"
        : navigator.hardwareConcurrency >= 8
          ? "high"
          : "medium";
    root.dataset.quality = quality;

    function measure() {
      anchors = [...root.querySelectorAll("[data-memory-anchor]")].map(
        (node) => {
          const rect = node.getBoundingClientRect();
          const sectionRect = node
            .closest("[data-memory-scene]")
            .getBoundingClientRect();
          const key = node.dataset.memoryAnchor;
          const header = window.innerWidth < 768 ? 75 : 85;
          return {
            key,
            x: rect.left + rect.width / 2,
            // Document coordinates keep the object inside the reserved safe zone.
            y: rect.top + window.scrollY + rect.height / 2,
            start: sectionRect.top + window.scrollY - header,
            size: rect.width,
            ...STATES[key],
          };
        },
      );
      update();
    }
    function update() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (!anchors.length) return;
        const viewport = window.innerHeight;
        const sample = window.scrollY;
        let left = anchors[0];
        let right = left;
        for (let index = 0; index < anchors.length - 1; index++) {
          if (sample >= anchors[index].start) {
            left = anchors[index];
            right = anchors[index + 1];
          }
        }
        if (sample >= anchors[anchors.length - 1].start)
          left = right = anchors[anchors.length - 1];
        const sectionProgress =
          left === right
            ? 0
            : Math.max(
                0,
                Math.min(1, (sample - left.start) / (right.start - left.start)),
              );
        const raw = Math.max(0, Math.min(1, (sectionProgress - 0.65) / 0.35));
        const progress = media.matches ? 0 : raw * raw * (3 - 2 * raw);
        const current = raw > 0.5 ? right : left;
        const x = interpolate(left.x, right.x, progress);
        const y = interpolate(left.y, right.y, progress) - sample;
        const size = interpolate(left.size, right.size, progress);
        const rootBounds = root.getBoundingClientRect();
        const visible = rootBounds.bottom > 100 && rootBounds.top < viewport;
        const mobileCategory =
          window.innerWidth < 768 && current.key === "categories";
        const opacity = visible
          ? interpolate(left.opacity, right.opacity, progress) *
            (mobileCategory ? 0 : 1)
          : 0;
        const tilt =
          current.key === "brand"
            ? [0, 12, -8][pillar]
            : interpolate(left.tilt, right.tilt, progress);
        const scale =
          (size / 260) * (current.key === "brand" ? 1 - pillar * 0.04 : 1);
        object.style.transform = `translate3d(${x - 130}px, ${y - 165}px, 0) scale(${scale}) rotateZ(${media.matches ? 0 : interpolate(left.rotate, right.rotate, progress)}deg) rotateY(${media.matches ? 0 : tilt}deg)`;
        object.style.opacity = opacity;
        object.dataset.scene = current.key;
        atmosphere.style.opacity = visible ? 1 : 0;
        atmosphere.style.setProperty(
          "--world-dark",
          interpolate(left.dark, right.dark, progress),
        );
        root.style.setProperty("--scene-progress", sectionProgress);
        root
          .querySelector('[data-memory-scene="story"]')
          ?.style.setProperty(
            "--story-progress",
            current.key === "story"
              ? sectionProgress
              : current.key === "wall"
                ? 1
                : 0,
          );
        if (sceneRef.current !== current.key) {
          sceneRef.current = current.key;
          setScene(current.key);
        }
      });
    }
    function move(event) {
      if (media.matches || document.hidden) return;
      const coarse = event.pointerType === "touch";
      if (coarse && !dragging) return;
      const x = coarse
        ? Math.max(-1, Math.min(1, (event.clientX - touch.x) / 65))
        : (event.clientX / window.innerWidth) * 2 - 1;
      const y = coarse
        ? Math.max(-1, Math.min(1, (event.clientY - touch.y) / 65))
        : (event.clientY / window.innerHeight) * 2 - 1;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        frameBody.current.style.setProperty("--pointer-x", `${x * 4}deg`);
        frameBody.current.style.setProperty("--pointer-y", `${-y * 2}deg`);
        frameBody.current.style.setProperty("--reflection-x", `${x * 18}%`);
      });
    }
    function down(event) {
      if (
        event.pointerType === "touch" &&
        event.target.closest("[data-memory-touch]") &&
        !event.target.closest("a, button, input")
      ) {
        dragging = true;
        touch = { x: event.clientX, y: event.clientY };
      }
    }
    function reset() {
      dragging = false;
      cancelAnimationFrame(pointerFrame);
      frameBody.current?.style.setProperty("--pointer-x", "0deg");
      frameBody.current?.style.setProperty("--pointer-y", "0deg");
      frameBody.current?.style.setProperty("--reflection-x", "0%");
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", reset);
    window.addEventListener("pointercancel", reset);
    media.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pointerFrame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", reset);
      window.removeEventListener("pointercancel", reset);
      media.removeEventListener("change", measure);
    };
  }, [experienceRef, pillar]);

  return (
    <>
      <div className="memory-atmosphere" ref={world} aria-hidden="true">
        <div className="memory-light" />
        <div className="memory-grain" />
      </div>
      <div className="memory-object-position" ref={position} data-form={form} aria-hidden="true">
        <div className="memory-frame-body" ref={frameBody}>
          {form === 'polaroid' && <><div className="memory-paper-back" /><div className="memory-paper-back" /></>}
          <div className="memory-frame-edge" />
          <div className="memory-frame-face">
            <picture>
              <source type="image/avif" srcSet="/images/memory-core-480.avif 480w, /images/memory-core-1024.avif 1024w" sizes="(max-width: 767px) 220px, 400px" />
              <img
                src="/images/memory-core-480.webp"
                srcSet="/images/memory-core-480.webp 480w, /images/memory-core-1024.webp 1024w"
                sizes="(max-width: 767px) 220px, 400px"
                alt=""
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <span className="memory-magazine-type">Our story.<small>THE MOMENTS THAT MADE US / INFINITY</small></span>
            <div className="memory-frame-glass" />
            <span className="memory-frame-stamp">INFINITY / MADE PERSONAL</span>
          </div>
        </div>
        <div className="memory-object-shadow" />
        {scene === "ai" && (
          <div className="memory-intent-orbit">
            {tokens.slice(0, 4).map((token, index) => (
              <span key={token.key} style={{ "--token-index": index }}>
                {token.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
