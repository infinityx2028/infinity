import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

type SceneName =
  | "hero"
  | "ai"
  | "categories"
  | "emotion"
  | "camera"
  | "magazine"
  | "universe"
  | "favourites"
  | "process"
  | "difference"
  | "studio"
  | "final";
type Pose = {
  x: number;
  y: number;
  width: number;
  rotation: number;
  opacity: number;
};
type Scene = {
  node: HTMLElement;
  name: SceneName;
  top: number;
  bottom: number;
  slot: { x: number; y: number; width: number } | null;
  pin: boolean;
};
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const visible: Record<SceneName, number> = {
  hero: 1,
  ai: 1,
  categories: 0.32,
  emotion: 0,
  camera: 1,
  magazine: 1,
  universe: 1,
  favourites: 0,
  process: 0.65,
  difference: 0.55,
  studio: 0,
  final: 1,
};
const rotation: Record<SceneName, number> = {
  hero: -8,
  ai: 5,
  categories: -9,
  emotion: 0,
  camera: -4,
  magazine: 0,
  universe: 3,
  favourites: 0,
  process: -5,
  difference: -7,
  studio: 0,
  final: 0,
};

/** One scroll authority; cached geometry, transform-only travel, no positional springs. */
export function createFilmDirector(
  root: HTMLElement,
  stage: HTMLElement,
): () => void {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)");
  const object = stage.querySelector<HTMLElement>(".world-object");
  const forms = Array.from(
    stage.querySelectorAll<HTMLElement>("[data-product-form]"),
  );
  const process = root.querySelector<HTMLElement>(".scene-process-path");
  let scenes: Scene[] = [];
  let footerTop = Infinity;
  let mobile = false;
  let refreshFrame = 0;
  let lastY = -1;
  const style = (name: string, value: number | string) =>
    stage.style.setProperty(name, String(value));
  function measure(): void {
    mobile = innerWidth < 768;
    const y = window.scrollY;
    scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-film-scene]"))
      .filter((node) => node.offsetHeight > 0)
      .map((node) => {
        const r = node.getBoundingClientRect();
        const slot = node
          .querySelector<HTMLElement>("[data-film-anchor]")
          ?.getBoundingClientRect();
        return {
          node,
          name: node.dataset.filmScene as SceneName,
          top: r.top + y,
          bottom: r.bottom + y,
          slot:
            slot && slot.width > 0
              ? {
                  x: slot.left + slot.width / 2,
                  y: slot.top + y + slot.height / 2,
                  width: slot.width,
                }
              : null,
          pin: node.hasAttribute("data-pin-stage"),
        };
      });
    const footer = document.querySelector("footer");
    footerTop = footer ? footer.getBoundingClientRect().top + y : Infinity;
    render(y);
  }
  function poseFor(scene: Scene, y: number): Pose | null {
    if (!scene.slot || !visible[scene.name]) return null;
    const slot = scene.slot;
    const half = slot.width * 0.66;
    const header = mobile ? 72 : 94;
    let center = slot.y - y;
    if (scene.pin && !mobile && !reduced.matches)
      center = clamp(
        center,
        header + half + 24,
        Math.max(header + half + 24, innerHeight - half - 42),
      );
    return {
      x: slot.x,
      y: center,
      width: slot.width,
      rotation: reduced.matches ? 0 : rotation[scene.name],
      opacity: visible[scene.name],
    };
  }
  function render(y: number): void {
    const sample =
      y +
      (mobile
        ? Math.min(innerHeight * 0.34, 240)
        : Math.min(innerHeight * 0.42, 390));
    const index = scenes.findIndex((s) => s.bottom > sample);
    const scene = scenes[index];
    root.dataset.directedScene = scene?.name || "footer";
    stage.dataset.scene = scene?.name || "footer";
    const pose = scene ? poseFor(scene, y) : null;
    if (
      !scene ||
      !pose ||
      y + innerHeight >= footerTop + 8 ||
      sample < scenes[0].top
    ) {
      stage.style.opacity = "0";
      stage.style.visibility = "hidden";
      lastY = y;
      return;
    }
    const progress = clamp(
      (y - scene.top + (mobile ? 72 : 94)) /
        Math.max(250, scene.bottom - scene.top - innerHeight * 0.35),
    );
    let current = pose;
    const previous = scenes[index - 1];
    const transit = clamp(
      (sample - scene.top) / Math.min(180, innerHeight * 0.2),
    );
    const prevPose = previous ? poseFor(previous, y) : null;
    if (!mobile && !reduced.matches && prevPose && transit < 1) {
      current = {
        x: mix(prevPose.x, pose.x, transit),
        y: mix(prevPose.y, pose.y, transit),
        width: mix(prevPose.width, pose.width, transit),
        rotation: mix(prevPose.rotation, pose.rotation, transit),
        opacity: mix(prevPose.opacity, pose.opacity, transit),
      };
    }
    let scale = current.width / 360;
    let alpha = current.opacity;
    if (scene.name === "final" && !reduced.matches) {
      const tail = clamp(
        (y - scene.top + (mobile ? 72 : 94) - 90) / 180,
      );
      scale *= mix(1, 0.2, tail);
      alpha *= 1 - tail;
      current.y -= tail * 50;
      style("--contact-alpha", 1 - tail);
    } else style("--contact-alpha", 1);
    stage.style.visibility = "visible";
    stage.style.opacity = String(alpha);
    stage.style.transform = `translate3d(${current.x - 180}px,${current.y - 237.6}px,0) scale(${scale})`;
    style("--object-rotation", `${current.rotation}deg`);
    const unfolding =
      scene.name === "camera"
        ? reduced.matches
          ? 0
          : clamp(progress * 1.25)
        : scene.name === "magazine"
          ? reduced.matches
            ? 1
            : 1 - clamp(progress * 1.5)
          : 0;
    const book =
      scene.name === "magazine"
        ? reduced.matches
          ? 1
          : clamp((progress - 0.1) / 0.45)
        : scene.name === "universe"
          ? 1 - clamp(progress * 4)
          : 0;
    const universe = scene.name === "universe";
    const frame = scene.name === "magazine" ? 1 - book : universe ? 0 : 1;
    style("--frame-alpha", frame);
    style("--photo-alpha", universe ? 0 : 1 - book);
    style("--photo-lift", `${unfolding * (mobile ? -30 : -70)}px`);
    style("--photo-shift", `${unfolding * (mobile ? -38 : -105)}px`);
    style("--photos-alpha", unfolding);
    style("--photo-spread", `${unfolding * (mobile ? 48 : 115)}px`);
    style("--book-alpha", book);
    style("--book-turn", `${mix(-6, 2, book)}deg`);
    style(
      "--card-alpha",
      universe ? Math.sin(clamp(progress * 1.15) * Math.PI) * 0.95 : 0,
    );
    style("--card-x", `${universe ? mix(-135, 115, progress) : 0}px`);
    style("--card-y", `${universe ? Math.sin(progress * Math.PI) * -65 : 0}px`);
    style("--token-alpha", scene.name === "ai" ? 1 : 0);
    style("--light-x", `${35 + clamp(current.x / innerWidth) * 30}%`);
    style("--shadow-x", `${mix(22, -12, clamp(current.x / innerWidth))}px`);
    const productPosition = clamp(progress * forms.length - .35, 0, Math.max(0, forms.length - 1));
    const selected = universe ? Math.round(productPosition) : -1;
    forms.forEach((form, i) => {
      const weight = universe ? Math.max(0, 1 - Math.abs(i - productPosition)) : 0;
      form.style.opacity = String(weight * clamp(progress * 5));
      form.style.transform = `translateZ(${weight * 28}px) rotateY(${weight * 4}deg)`;
    });
    root
      .querySelectorAll<HTMLElement>("[data-universe-link]")
      .forEach((link, i) => {
        if (i === selected) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    if (process)
      process.style.setProperty(
        "--journey-progress",
        String(scene.name === "process" ? progress : 0),
      );
    if (!reduced.matches) {
      scene.node.style.setProperty(
        "--text-travel",
        `${clamp((y - scene.top) / innerHeight, -1, 1) * -18}px`,
      );
    }
    if (object && scene.name !== "hero") {
      object.style.setProperty("--pointer-y", "0deg");
      object.style.setProperty("--pointer-x", "0deg");
    }
    stage.dataset.scroll = String(y);
    stage.dataset.direction = y < lastY ? "up" : "down";
    lastY = y;
  }
  function pointer(event: PointerEvent): void {
    if (
      reduced.matches ||
      coarse.matches ||
      stage.dataset.scene !== "hero" ||
      !object
    )
      return;
    object.style.setProperty(
      "--pointer-y",
      `${clamp((event.clientX / innerWidth) * 2 - 1, -1, 1) * 4}deg`,
    );
    object.style.setProperty(
      "--pointer-x",
      `${clamp((event.clientY / innerHeight) * 2 - 1, -1, 1) * -2}deg`,
    );
    style("--light-x", `${30 + (event.clientX / innerWidth) * 40}%`);
  }
  function refresh(): void {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  ScrollTrigger.addEventListener("refresh", measure);
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => render(self.scroll()),
    onRefresh: measure,
  });
  const resize = new ResizeObserver(refresh);
  resize.observe(root);
  window.addEventListener("pointermove", pointer, { passive: true });
  reduced.addEventListener("change", refresh);
  document.fonts.ready.then(() => {
    if (root.isConnected) refresh();
  });
  measure();
  return () => {
    trigger.kill();
    resize.disconnect();
    cancelAnimationFrame(refreshFrame);
    ScrollTrigger.removeEventListener("refresh", measure);
    window.removeEventListener("pointermove", pointer);
    reduced.removeEventListener("change", refresh);
  };
}
