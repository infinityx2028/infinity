import { useEffect, useRef } from "react";
import { FRAME_SCENES } from "../utils/frameJourney";

const interpolate = (a, b, progress) => a + (b - a) * progress;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const MEMORIES = ["memory-rukmini", "memory-monika", "memory-yellow-saree"];

export default function PersistentMemoryScene({ experienceRef, pillar }) {
  const position = useRef(null);
  const frameBody = useRef(null);
  const world = useRef(null);

  useEffect(() => {
    const root = experienceRef.current;
    const object = position.current;
    const atmosphere = world.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
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

    let mobile = false;
    let rootEnd = 0;
    let footerStart = 0;
    function measure() {
      mobile = window.innerWidth < 768;
      root.dataset.quality = mobile ? "low" : quality;
      root.dataset.journey = mobile
        ? "mobile"
        : window.innerWidth < 1100
          ? "tablet"
          : "desktop";
      const poses = FRAME_SCENES[root.dataset.journey];
      const sample = window.scrollY;
      const header = mobile ? 76 : 90;
      rootEnd = root.getBoundingClientRect().bottom + sample;
      const footer = document.querySelector(".motion-footer");
      footerStart = footer.getBoundingClientRect().top + sample;
      anchors = [...root.querySelectorAll("[data-memory-scene]"), footer]
        .filter(
          (node) =>
            node.getClientRects().length && poses[node.dataset.memoryScene],
        )
        .map((node) => {
          const key = node.dataset.memoryScene;
          const rect = node.getBoundingClientRect();
          const slot = node.querySelector(`[data-memory-anchor="${key}"]`);
          const slotRect = slot?.getBoundingClientRect();
          return {
            ...poses[key],
            key,
            top: rect.top + sample,
            start: key === "hero" ? 0 : rect.top + sample - header,
            bottom: rect.bottom + sample,
            size: slotRect?.width || 180,
            x: slotRect
              ? slotRect.left + slotRect.width / 2
              : window.innerWidth / 2,
            y: slotRect
              ? slotRect.top + sample + slotRect.height / 2
              : rect.top + sample,
          };
        })
        .sort((a, b) => a.start - b.start);
      update();
    }
    function update() {
      if (!anchors.length) return;
      const sample = window.scrollY;
      const viewport = window.innerHeight;
      const header = mobile ? 76 : 90;
      let index = 0;
      while (
        index < anchors.length - 1 &&
        sample >= anchors[index + 1].start - 16
      )
        index++;
      const current = anchors[index];
      const next = anchors[index + 1];
      const span = Math.max(1, (next?.start ?? current.bottom) - current.start);
      const sectionProgress = clamp((sample - current.start) / span, 0, 1);
      const [from, to] = current.transitionRange;
      const transition = clamp((sectionProgress - from) / (to - from), 0, 1);
      let opacity = current.visible ? current.opacity : 0;
      let scale = current.scale;
      let depth = current.zDepth;
      // Exit before a typography-only scene enters the viewport. Re-entry stays
      // hidden until its own scene, then emerges directly from scroll progress.
      if (current.visible && next && !next.visible) {
        const deadline = ["giftFeeling", "onePhotoChapter", "footer"].includes(
          next.key,
        )
          ? next.top - viewport
          : next.start;
        const exit = clamp((sample - (deadline - 150)) / 150, 0, 1);
        opacity *= 1 - exit;
        scale *= interpolate(1, 0.72, exit);
        depth = interpolate(depth, -200, exit);
      } else if (current.visible && next?.visible) {
        opacity = interpolate(current.opacity, next.opacity, transition);
      }
      if (current.visible && index && !anchors[index - 1].visible) {
        const entry = clamp(
          (sample - current.start + header) / Math.max(1, header),
          0,
          1,
        );
        opacity *= entry;
        scale *= interpolate(0.72, 1, entry);
        depth = interpolate(-200, depth, entry);
      }
      // Footer owns the closing screen. Its first viewport intersection is the
      // hard visibility boundary, including reverse scrolling and deep links.
      const footerExit = clamp(
        (sample - (footerStart - viewport - 150)) / 150,
        0,
        1,
      );
      if (current.key === "finalMemory") {
        opacity *= 1 - footerExit;
        scale *= interpolate(1, 0.72, footerExit);
        depth = interpolate(depth, -200, footerExit);
      }
      if (sample + viewport >= footerStart) opacity = 0;
      const travel =
        current.visible &&
        next?.visible &&
        current.layer === "front" &&
        next.layer === "front"
          ? transition
          : 0;
      const x = interpolate(current.x, next?.x ?? current.x, travel);
      const size =
        interpolate(current.size, next?.size ?? current.size, travel) * scale;
      const y = interpolate(current.y, next?.y ?? current.y, travel) - sample;
      const apparentScale = ((size / 260) * 1200) / (1200 - depth);
      const halfHeight = 165 * apparentScale;
      // Natural anchor motion prevents a fixed pose lingering over later copy.
      if (
        y - halfHeight < header - 5 ||
        y + halfHeight > viewport - (mobile ? 62 : 8)
      )
        opacity = 0;
      if (media.matches) depth = 0;
      object.style.transform = `translate3d(${x - 130}px, ${y - 165}px, 0) perspective(1200px) translateZ(${depth}px) scale(${size / 260}) rotateZ(${media.matches ? 0 : interpolate(current.rotateZ, next?.rotateZ ?? current.rotateZ, travel)}deg) rotateY(${media.matches ? 0 : current.rotateY + (current.key === "infinityDifference" ? pillar - 1 : 0)}deg) rotateX(${media.matches ? 0 : current.rotateX}deg)`;
      object.style.opacity = opacity;
      object.style.visibility = opacity > 0.001 ? "visible" : "hidden";
      object.style.zIndex = current.layer === "back" ? "1" : "6";
      object.dataset.scene =
        sample + viewport >= footerStart ? "footer" : current.key;
      object.dataset.form = "frame";
      object.dataset.memory = current.photo;
      object.dataset.z = depth;
      object.dataset.scrollSample = sample;
      object.style.setProperty(
        "--shadow-scale",
        interpolate(1.14, 0.6, clamp(-depth / 200, 0, 1)),
      );
      object.style.setProperty(
        "--shadow-opacity",
        interpolate(0.32, 0.09, clamp(-depth / 200, 0, 1)),
      );
      frameBody.current.style.setProperty(
        "--scroll-light",
        `${interpolate(-12, 12, sectionProgress)}%`,
      );
      atmosphere.style.opacity = sample < rootEnd ? 1 : 0;
      atmosphere.style.clipPath = `inset(0 0 ${Math.max(0, viewport - (rootEnd - sample))}px 0)`;
      atmosphere.style.setProperty(
        "--world-dark",
        current.key === "infinityDifference" ? 1 : 0,
      );
      root.style.setProperty("--scene-progress", sectionProgress);
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
    const footerNode = document.querySelector(".motion-footer");
    if (footerNode) observer.observe(footerNode);
    const mutation = new MutationObserver(measure);
    mutation.observe(root, { childList: true, subtree: true });
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
      mutation.disconnect();
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
      <div
        className="memory-object-position"
        ref={position}
        data-form="frame"
        data-memory="0"
        aria-hidden="true"
      >
        <div className="memory-frame-body" ref={frameBody}>
          <div className="memory-paper-back">
            <img
              src="/images/memory-rukmini-480.webp"
              alt=""
              decoding="async"
            />
          </div>
          <div className="memory-paper-back">
            <img src="/images/memory-monika-480.webp" alt="" decoding="async" />
          </div>
          <div className="memory-frame-edge" />
          <div className="memory-depth-side memory-depth-right" />
          <div className="memory-depth-side memory-depth-left" />
          <div className="memory-depth-side memory-depth-top" />
          <div className="memory-depth-side memory-depth-bottom" />
          <div className="memory-outer-bevel" />
          <div className="memory-frame-face">
            <div className="memory-inner-bevel" />
            <div className="memory-photo-cavity">
              {MEMORIES.map((memory, index) => (
                <picture
                  key={memory}
                  className="memory-photo-layer"
                  data-photo={index}
                >
                  <source
                    type="image/avif"
                    srcSet={`/images/${memory}-480.avif 480w, /images/${memory}-1024.avif 1024w`}
                    sizes="(max-width: 767px) 220px, 400px"
                  />
                  <img
                    src={`/images/${memory}-480.webp`}
                    srcSet={`/images/${memory}-480.webp 480w, /images/${memory}-1024.webp 1024w`}
                    sizes="(max-width: 767px) 220px, 400px"
                    alt=""
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading="eager"
                    decoding="async"
                    onLoad={(event) => {
                      event.currentTarget.decode?.().catch(() => {});
                    }}
                  />
                </picture>
              ))}
            </div>
            <span className="memory-magazine-type">
              Our story.<small>THE MOMENTS THAT MADE US / INFINITY</small>
            </span>
            <div className="memory-frame-glass" />
            <div className="memory-glass-highlight" />
            <span className="memory-frame-stamp">INFINITY / MADE PERSONAL</span>
          </div>
        </div>
        <div className="memory-object-shadow" />
      </div>
    </>
  );
}
