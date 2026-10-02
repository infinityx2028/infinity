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
    let footer = null;
    let story = null;
    let bodyHeight = 0;
    let rootStart = 0;
    let rootEnd = 0;
    function measure() {
      mobile = window.innerWidth < 768;
      root.dataset.quality = mobile ? "low" : quality;
      root.dataset.journey = mobile
        ? "mobile"
        : window.innerWidth < 1100
          ? "tablet"
          : "desktop";
      const poses = FRAME_SCENES[root.dataset.journey];
      const header = mobile ? 76 : 90;
      const sample = window.scrollY;
      const rootRect = root.getBoundingClientRect();
      rootStart = rootRect.top + sample;
      rootEnd = rootRect.bottom + sample;
      bodyHeight = document.documentElement.scrollHeight;
      footer = document.querySelector(".motion-footer");
      story = root.querySelector('[data-memory-scene="transformation"]');
      const nodes = [
        ...root.querySelectorAll("[data-memory-anchor]"),
        ...document.querySelectorAll("footer [data-memory-anchor]"),
      ];
      anchors = nodes
        .filter(
          (node) =>
            node.getClientRects().length && poses[node.dataset.memoryAnchor],
        )
        .map((node) => {
          const rect = node.getBoundingClientRect();
          const sectionRect = node
            .closest("[data-memory-scene]")
            .getBoundingClientRect();
          const key = node.dataset.memoryAnchor;
          const maximumScroll = Math.max(0, bodyHeight - window.innerHeight);
          const start =
            key === "hero"
              ? 0
              : key === "footer"
                ? Math.max(
                    0,
                    Math.min(
                      sectionRect.top + sample - header,
                      maximumScroll - 180,
                    ),
                  )
                : Math.max(0, sectionRect.top + sample - header);
          return {
            key,
            start,
            size: rect.width,
            x: rect.left + rect.width / 2,
            // Each breakpoint's reserved slot supplies a viewport pose. Long sections
            // never send the frame off screen while waiting for a document anchor.
            y:
              key === "hero"
                ? rect.top + sample + rect.height / 2
                : key === "footer"
                  ? window.innerHeight * 0.48
                  : rect.top - sectionRect.top + header + rect.height / 2,
            ...poses[key],
          };
        })
        .sort((a, b) => a.start - b.start);
      const last = anchors.at(-1);
      if (last?.key === "footer") {
        anchors.push({
          ...last,
          ...poses.ending,
          key: "ending",
          start: Math.max(last.start + 1, bodyHeight - window.innerHeight),
          y: (() => {
            const rect = footer
              .querySelector('[data-memory-anchor="footer"]')
              .getBoundingClientRect();
            return (
              rect.top +
              sample +
              rect.height / 2 -
              (bodyHeight - window.innerHeight)
            );
          })(),
          size: last.size,
        });
      }
      update();
    }
    function update() {
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
      if (sample >= anchors.at(-1).start) left = right = anchors.at(-1);
      const sectionProgress =
        left === right
          ? 0
          : clamp((sample - left.start) / (right.start - left.start), 0, 1);
      const progress = media.matches
        ? sectionProgress >= 0.5
          ? 1
          : 0
        : sectionProgress;
      const current = progress >= 0.5 ? right : left;
      const x = interpolate(left.x, right.x, progress);
      const size =
        interpolate(left.size, right.size, progress) *
        (mobile && viewport < 700 ? viewport / 760 : 1);
      const depth = media.matches ? 0 : interpolate(left.z, right.z, progress);
      const apparentScale = ((size / 260) * 1200) / (1200 - depth);
      const halfHeight = 165 * apparentScale;
      const y = clamp(
        interpolate(left.y, right.y, progress),
        78 + halfHeight,
        Math.max(78 + halfHeight, viewport - (mobile ? 72 : 18) - halfHeight),
      );
      const visible = sample + viewport > rootStart && sample < bodyHeight;
      const opacity = visible
        ? interpolate(left.opacity, right.opacity, progress)
        : 0;
      const tilt =
        interpolate(left.tilt, right.tilt, progress) +
        (current.key === "brand" ? (pillar - 1) * 2 : 0);
      object.style.transform = `translate3d(${x - 130}px, ${y - 165}px, 0) perspective(1200px) translateZ(${depth}px) scale(${size / 260}) rotateZ(${media.matches ? 0 : interpolate(left.rotate, right.rotate, progress)}deg) rotateY(${media.matches ? 0 : tilt}deg) rotateX(${media.matches ? 0 : interpolate(left.pitch, right.pitch, progress)}deg)`;
      object.style.opacity = opacity;
      object.style.zIndex = current.layer === "back" ? "1" : "6";
      object.dataset.scene = current.key;
      object.dataset.form = current.form;
      object.dataset.memory = current.photo;
      object.dataset.depth = depth >= 0 ? "near" : "far";
      object.dataset.z = depth;
      object.dataset.scrollSample = sample;
      object.style.setProperty(
        "--shadow-scale",
        interpolate(1.14, 0.6, clamp(-depth / 760, 0, 1)),
      );
      object.style.setProperty(
        "--shadow-opacity",
        interpolate(0.32, 0.09, clamp(-depth / 760, 0, 1)),
      );
      frameBody.current.style.setProperty(
        "--scroll-light",
        `${interpolate(-12, 12, progress)}%`,
      );
      root.style.setProperty(
        "--type-parallax",
        `${media.matches || mobile ? 0 : Math.min(sample, anchors[1]?.start || 0) * 0.04}px`,
      );
      root.style.setProperty(
        "--paper-parallax",
        `${media.matches || mobile ? 0 : Math.min(sample, anchors[1]?.start || 0) * -0.04}px`,
      );
      atmosphere.style.opacity = sample < rootEnd ? 1 : 0;
      atmosphere.style.clipPath = `inset(0 0 ${Math.max(0, viewport - (rootEnd - sample))}px 0)`;
      atmosphere.style.setProperty(
        "--world-dark",
        interpolate(left.light, right.light, progress),
      );
      root.style.setProperty("--scene-progress", sectionProgress);
      story?.style.setProperty(
        "--story-progress",
        current.key === "transformation" ? sectionProgress : 0,
      );
      footer?.style.setProperty(
        "--footer-parallax",
        `${media.matches ? 0 : clamp(sample - (anchors.find((a) => a.key === "footer")?.start || bodyHeight), 0, 400) * -0.035}px`,
      );
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
