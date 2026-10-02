import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DESKTOP_SCENE_CONFIG,
  MOBILE_SCENE_CONFIG,
  type SceneName,
  type SceneConfig,
} from "./frameScenes";
import {
  clamp,
  mix,
  intersect,
  footprint,
  chooseSafePose,
  portalPoint,
  overlaps,
  type Rect,
  type Point,
} from "./frameGeometry";
gsap.registerPlugin(ScrollTrigger);
type Scene = {
  node: HTMLElement;
  name: SceneName;
  top: number;
  bottom: number;
  zone: Rect | null;
  width: number;
};
type Exclusion = { node: HTMLElement; rect: Rect; fixed: boolean };
type Quality = "high" | "medium" | "low";
type Pose = {
  center: Point;
  width: number;
  opacity: number;
  depth: number;
  fallback: boolean;
};
const protectedSelector =
  "[data-frame-exclusion],h1,h2,h3,h4,p,form,input,button,a,.scene-chapter,.scene-annotation,.scene-photo-id,.scene-final-signoff,.scene-eyebrow,.scene-link,.scene-hero-meta,.scene-intents,.scene-category-universe,.scene-result-grid,.scene-favourites-grid,.scene-steps";
const overlaySelector =
  '.motion-nav-overlay,.motion-menu-overlay,.film-quickview,[role="dialog"]';
const toRect = (r: DOMRect, y = 0): Rect => ({
  left: r.left,
  right: r.right,
  top: r.top + y,
  bottom: r.bottom + y,
});
const screenRect = (r: Rect, y: number): Rect => ({
  ...r,
  top: r.top - y,
  bottom: r.bottom - y,
});

/** Owns every position, projection, exclusion, fallback and visual state.
 * Layout is measured on refresh only. Scroll uses cached arithmetic, never DOM geometry. */
export function createMemoryFrameDirector(
  root: HTMLElement,
  viewport: HTMLElement,
  stage: HTMLElement,
): () => void {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)");
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const quality: Quality =
    device.connection?.saveData ||
    (device.deviceMemory ?? 8) <= 4 ||
    navigator.hardwareConcurrency <= 4
      ? "low"
      : coarse.matches || navigator.hardwareConcurrency < 8
        ? "medium"
        : "high";
  viewport.dataset.quality = quality;
  const object = stage.querySelector<HTMLElement>(".world-object");
  const forms = Array.from(
    stage.querySelectorAll<HTMLElement>("[data-product-form]"),
  );
  const process = root.querySelector<HTMLElement>(".scene-process-path");
  let links: HTMLElement[] = [];
  let scenes: Scene[] = [],
    exclusions: Exclusion[] = [];
  let mobile = false,
    footerTop = Infinity,
    overlaid = false,
    disposed = false;
  let refreshFrame = 0,
    assertionFrame = 0,
    idleTimer = 0,
    lastScene = "",
    lastY = -1;
  let lastConfig: SceneConfig = DESKTOP_SCENE_CONFIG.hero;
  let currentBounds: Rect | null = null;
  const debug =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).has("frameDebug");
  const debugLayer = debug ? document.createElement("div") : null;
  if (debugLayer) {
    debugLayer.className = "frame-collision-debug";
    debugLayer.setAttribute("aria-hidden", "true");
    document.body.append(debugLayer);
  }
  const style = (name: string, value: string | number): void =>
    stage.style.setProperty(name, String(value));
  const configFor = (name: SceneName): SceneConfig =>
    (mobile ? MOBILE_SCENE_CONFIG : DESKTOP_SCENE_CONFIG)[name];
  function screenExclusions(y: number): Rect[] {
    const gap = mobile ? 24 : 48;
    return exclusions
      .map((e) => (e.fixed ? e.rect : screenRect(e.rect, y)))
      .filter((r) => r.bottom > -gap && r.top < innerHeight + gap);
  }
  function hide(reason: string): void {
    stage.style.opacity = "0";
    stage.style.visibility = "hidden";
    viewport.dataset.visibilityReason = reason;
    currentBounds = null;
    delete stage.dataset.bounds;
  }
  function measure(): void {
    if (disposed) return;
    mobile = innerWidth <= 767;
    viewport.dataset.breakpoint = mobile ? "mobile" : "desktop";
    const y = scrollY;
    scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-film-scene]"))
      .filter((node) => node.offsetHeight > 0)
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const zone = node.querySelector<HTMLElement>("[data-frame-safe-zone]");
        const anchor = zone?.querySelector<HTMLElement>("[data-film-anchor]");
        const z = zone?.getBoundingClientRect();
        return {
          node,
          name: node.dataset.filmScene as SceneName,
          top: rect.top + y,
          bottom: rect.bottom + y,
          zone: z && z.width > 0 ? toRect(z, y) : null,
          width: anchor?.getBoundingClientRect().width ?? 0,
        };
      });
    const nodes = new Set<HTMLElement>(
      root.querySelectorAll<HTMLElement>(protectedSelector),
    );
    document
      .querySelectorAll<HTMLElement>(".motion-header,.mobile-bottom-nav,footer")
      .forEach((node) => nodes.add(node));
    exclusions = Array.from(nodes)
      .filter(
        (node) =>
          node.getClientRects().length > 0 && !node.closest(".world-stage"),
      )
      .map((node) => {
        node.dataset.frameExclusion = "";
        const fixed = node.matches(".motion-header,.mobile-bottom-nav");
        let rect = toRect(node.getBoundingClientRect(), fixed ? 0 : y);
        if (node.matches("h1,h2,h3,h4,p,.scene-eyebrow,.scene-link")) {
          const range = document.createRange();
          range.selectNodeContents(node);
          const text = toRect(range.getBoundingClientRect(), fixed ? 0 : y);
          if (text.right > text.left)
            rect = {
              left: Math.min(rect.left, text.left),
              right: Math.max(rect.right, text.right),
              top: Math.min(rect.top, text.top),
              bottom: Math.max(rect.bottom, text.bottom),
            };
        }
        return { node, fixed, rect };
      });
    const footer = document.querySelector("footer");
    footerTop = footer ? footer.getBoundingClientRect().top + y : Infinity;
    links = Array.from(
      root.querySelectorAll<HTMLElement>("[data-universe-link]"),
    );
    overlaid = !!document.querySelector(overlaySelector);
    render(y);
    assertLayout();
  }
  function region(scene: Scene, y: number): Rect | null {
    if (!scene.zone) return null;
    const header = mobile ? 64 : 84;
    return intersect(screenRect(scene.zone, y), {
      left: 8,
      right: innerWidth - 8,
      top: header + (mobile ? 24 : 48),
      bottom: Math.min(innerHeight - 8, footerTop - y - 24),
    });
  }
  function poseFor(scene: Scene, y: number, obstacles: Rect[]): Pose | null {
    const config = configFor(scene.name),
      area = region(scene, y);
    if (!config.visible || !area || !scene.width) return null;
    const maxFit = Math.min(
      (area.right - area.left) / 1.28,
      (area.bottom - area.top) / 1.54,
      scene.width,
    );
    if (maxFit < config.minWidth) return null;
    for (const width of [
      maxFit,
      mix(maxFit, config.minWidth, 0.5),
      config.minWidth,
    ]) {
      const safe = chooseSafePose(
        area,
        width,
        obstacles,
        mobile ? 24 : 48,
        config.primary,
        config.fallback,
        scene.name === "final",
      );
      if (safe)
        return {
          center: safe.center,
          width,
          opacity: config.opacity,
          depth: config.layer === "background" ? -45 : 0,
          fallback: safe.fallback || width < maxFit,
        };
    }
    return null;
  }
  function render(y: number): void {
    if (disposed) return;
    const focus =
      y + Math.min(innerHeight * (mobile ? 0.34 : 0.42), mobile ? 240 : 390);
    const index = scenes.findIndex((s) => s.bottom > focus),
      scene = scenes[index];
    const name = scene?.name ?? "footer";
    const config = configFor(name);
    lastConfig = config;
    stage.dataset.scene = name;
    root.dataset.directedScene = name;
    stage.dataset.scroll = String(y);
    stage.dataset.direction = y < lastY ? "up" : "down";
    lastY = y;
    viewport.dataset.layer = config.layer;
    viewport.dataset.safeZone = config.safeZone;
    if (
      !scene ||
      !config.visible ||
      overlaid ||
      y + innerHeight >= footerTop ||
      focus < scenes[0].top
    ) {
      hide(overlaid ? "overlay" : "scene-hidden");
      drawDebug(y);
      return;
    }
    const obstacles = screenExclusions(y);
    const pose = poseFor(scene, y, obstacles);
    if (!pose) {
      hide("insufficient-safe-area");
      drawDebug(y);
      return;
    }
    const progress = clamp(
      (y - scene.top + (mobile ? 72 : 94)) /
        Math.max(250, scene.bottom - scene.top - innerHeight * 0.35),
    );
    const transit = clamp(
      (focus - scene.top) / Math.min(240, innerHeight * 0.3),
    );
    const previous = scenes[index - 1];
    let current = { ...pose, center: { ...pose.center } };
    stage.dataset.transition = reduced.matches ? "static" : "settled";
    if (
      !reduced.matches &&
      previous &&
      configFor(previous.name).visible &&
      transit < 1
    ) {
      const start = poseFor(previous, y, obstacles);
      const portalScale =
        transit < 0.35
          ? mix(1, 0.6, transit / 0.35)
          : transit < 0.7
            ? 0.6
            : mix(0.6, 1, (transit - 0.7) / 0.3);
      const width =
        mix(start?.width ?? pose.width, pose.width, transit) * portalScale;
      const edge = innerWidth - width * 0.64 - 8;
      const point = start
        ? portalPoint(start.center, pose.center, edge, transit)
        : pose.center;
      const bounds = footprint(point, width),
        area = region(scene, y);
      const inCurrent =
        !!area &&
        bounds.left >= area.left &&
        bounds.right <= area.right &&
        bounds.top >= area.top &&
        bounds.bottom <= area.bottom;
      const previousArea = start ? region(previous, y) : null;
      const inPrevious =
        !!previousArea &&
        bounds.left >= previousArea.left &&
        bounds.right <= previousArea.right &&
        bounds.top >= previousArea.top &&
        bounds.bottom <= previousArea.bottom;
      if (
        (inCurrent || inPrevious) &&
        !obstacles.some((r) => overlaps(bounds, r, mobile ? 24 : 48))
      ) {
        current = {
          ...pose,
          center: point,
          width,
          depth: -90 * Math.sin(transit * Math.PI),
          opacity: pose.opacity * mix(0.45, 1, portalScale),
        };
      } else {
        // A busy corridor uses an invisible depth portal; never a visible jump over UI.
        current.opacity *= clamp((transit - 0.7) / 0.3);
        current.depth = mix(-90, pose.depth, clamp((transit - 0.7) / 0.3));
      }
      stage.dataset.transition =
        transit < 0.35 ? "retreat" : transit < 0.7 ? "travel" : "approach";
    }
    let scale = current.width / 360,
      alpha = current.opacity;
    if (name === "final" && !reduced.matches) {
      const exit = clamp((y - scene.top + (mobile ? 72 : 94) - 90) / 180);
      scale *= mix(1, 0.55, exit);
      alpha *= 1 - exit;
      style("--contact-alpha", 1 - exit);
    } else style("--contact-alpha", 1);
    // The safe footprint is also the paint boundary for shadows and secondary objects.
    currentBounds = footprint(current.center, current.width);
    viewport.style.clipPath = `inset(${currentBounds.top}px ${innerWidth - currentBounds.right}px ${innerHeight - currentBounds.bottom}px ${currentBounds.left}px)`;
    stage.dataset.bounds = JSON.stringify(currentBounds);
    stage.dataset.fallback = String(current.fallback);
    viewport.dataset.visibilityReason = "safe";
    stage.style.visibility = alpha > 0.001 ? "visible" : "hidden";
    stage.style.opacity = String(alpha);
    stage.style.transform = `translate3d(${current.center.x - 180}px,${current.center.y - 237.6}px,0) scale(${scale})`;
    const rotations = reduced.matches ? [0, 0, 0] : config.rotation;
    style("--rotate-x", `${rotations[0]}deg`);
    style("--rotate-y", `${rotations[1]}deg`);
    style("--object-rotation", `${rotations[2]}deg`);
    style("--object-depth", `${current.depth}px`);
    style(
      "--light-x",
      `${config.light[0] + (reduced.matches || quality === "low" ? 0 : Math.sin(progress * Math.PI) * 6)}%`,
    );
    style("--light-y", `${config.light[1]}%`);
    style("--warmth", config.light[2]);
    style("--shadow-x", `${config.light[0] > 50 ? -12 : 12}px`);
    if (object) {
      object.style.setProperty("--pointer-y", "0deg");
      object.style.setProperty("--pointer-x", "0deg");
    }
    style(
      "--photo-parallax-x",
      `${reduced.matches || quality === "low" ? 0 : -rotations[1] * 0.2}px`,
    );
    style(
      "--photo-parallax-y",
      `${reduced.matches || quality === "low" ? 0 : rotations[0] * 0.4}px`,
    );
    decorate(scene, progress);
    if (import.meta.env.DEV && lastScene !== name) assertLayout();
    lastScene = name;
    drawDebug(y);
  }
  function decorate(scene: Scene, progress: number): void {
    const unfolding =
      quality === "low"
        ? 0
        : scene.name === "camera"
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
    style("--photo-lift", `${unfolding * (mobile ? -20 : -40)}px`);
    style("--photo-shift", `${unfolding * (mobile ? -24 : -45)}px`);
    style("--photos-alpha", unfolding);
    style("--photo-spread", `${unfolding * (mobile ? 35 : 60)}px`);
    style("--book-alpha", book);
    style("--book-turn", `${mix(-6, 2, book)}deg`);
    style(
      "--card-alpha",
      universe ? Math.sin(clamp(progress * 1.15) * Math.PI) * 0.95 : 0,
    );
    style("--card-x", `${universe ? mix(-135, 115, progress) : 0}px`);
    style("--card-y", `${universe ? Math.sin(progress * Math.PI) * -65 : 0}px`);
    style("--token-alpha", 0);
    const productPosition = clamp(
      progress * forms.length - 0.35,
      0,
      Math.max(0, forms.length - 1),
    );
    const selected = universe ? Math.round(productPosition) : -1;
    forms.forEach((form, i) => {
      const weight = universe
        ? Math.max(0, 1 - Math.abs(i - productPosition))
        : 0;
      form.style.opacity = String(weight * clamp(progress * 5));
      form.style.transform = `translateZ(${weight * 28}px) rotateY(${weight * 4}deg)`;
    });
    links.forEach((link, i) => {
      if (i === selected) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    if (process)
      process.style.setProperty(
        "--journey-progress",
        String(scene.name === "process" ? progress : 0),
      );
  }
  function pointer(event: PointerEvent): void {
    if (
      reduced.matches ||
      coarse.matches ||
      quality === "low" ||
      stage.dataset.scene !== "hero" ||
      !object
    )
      return;
    const x = clamp((event.clientX / innerWidth) * 2 - 1, -1, 1),
      y = clamp((event.clientY / innerHeight) * 2 - 1, -1, 1);
    object.style.setProperty("--pointer-y", `${x}deg`);
    object.style.setProperty("--pointer-x", `${-y}deg`);
    style("--light-x", `${lastConfig.light[0] + x * 6}%`);
    style("--light-y", `${lastConfig.light[1] + y * 6}%`);
    style("--photo-parallax-x", `${-x * 2}px`);
    style("--photo-parallax-y", `${y * 2}px`);
  }
  function assertLayout(): void {
    if (!import.meta.env.DEV) return;
    cancelAnimationFrame(assertionFrame);
    assertionFrame = requestAnimationFrame(() => {
      if (
        disposed ||
        stage.style.visibility === "hidden" ||
        Number(stage.style.opacity) < 0.01
      )
        return;
      const shell = stage.querySelector<HTMLElement>(".world-frame-shell");
      if (!shell || Number(getComputedStyle(shell).opacity) <= 0.01) return;
      const frame = toRect(shell.getBoundingClientRect());
      for (const exclusion of exclusions) {
        if (overlaps(frame, toRect(exclusion.node.getBoundingClientRect())))
          console.error("FRAME COLLISION", stage.dataset.scene, exclusion.node);
      }
    });
  }
  function drawDebug(y: number): void {
    if (!debugLayer) return;
    debugLayer.replaceChildren();
    const box = (rect: Rect, color: string, label: string): void => {
      if (
        rect.bottom < 0 ||
        rect.top > innerHeight ||
        rect.right <= rect.left ||
        rect.bottom <= rect.top
      )
        return;
      const node = document.createElement("div");
      node.textContent = label;
      node.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.right - rect.left}px;height:${rect.bottom - rect.top}px;border:1px solid ${color};color:${color};font:9px monospace;background:transparent`;
      debugLayer.append(node);
    };
    scenes.forEach((s) => {
      if (s.zone) {
        const zone = screenRect(s.zone, y);
        box(zone, "#219653", s.name + " / safe zone");
        const anchor = document.createElement("span");
        anchor.textContent = "+";
        anchor.style.cssText = `position:absolute;left:${(zone.left + zone.right) / 2}px;top:${(zone.top + zone.bottom) / 2}px;color:#219653;font:20px monospace;translate:-50% -50%`;
        debugLayer.append(anchor);
      }
    });
    exclusions.forEach((e) =>
      box(e.fixed ? e.rect : screenRect(e.rect, y), "#c99b16", "protected"),
    );
    if (currentBounds) box(currentBounds, "#e33", "frame + shadow");
  }
  function refresh(): void {
    hide("layout-refresh");
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => {
      if (!disposed) ScrollTrigger.refresh();
    });
  }
  const changes = new MutationObserver((records) => {
    if (
      !records.some((r) =>
        [...r.addedNodes, ...r.removedNodes].some(
          (n) =>
            n instanceof Element &&
            (n.matches(overlaySelector) || n.querySelector(overlaySelector)),
        ),
      )
    )
      return;
    overlaid = !!document.querySelector(overlaySelector);
    render(scrollY);
  });
  changes.observe(document.getElementById("root") ?? document.body, {
    childList: true,
    subtree: true,
  });
  ScrollTrigger.addEventListener("refresh", measure);
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onRefresh: measure,
    onUpdate: (self) => {
      stage.style.willChange = "transform";
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(
        () => stage.style.removeProperty("will-change"),
        120,
      );
      render(self.scroll());
    },
  });
  const resize = new ResizeObserver(refresh);
  resize.observe(root);
  root
    .querySelectorAll<HTMLElement>("[data-frame-safe-zone]")
    .forEach((node) => resize.observe(node));
  document.fonts.ready.then(() => {
    if (!disposed) refresh();
  });
  document.fonts.addEventListener("loadingdone", refresh);
  window.addEventListener("resize", refresh, { passive: true });
  root.addEventListener("load", refresh, true);
  window.addEventListener("pointermove", pointer, { passive: true });
  reduced.addEventListener("change", refresh);
  measure();
  return () => {
    disposed = true;
    trigger.kill();
    resize.disconnect();
    changes.disconnect();
    clearTimeout(idleTimer);
    cancelAnimationFrame(refreshFrame);
    cancelAnimationFrame(assertionFrame);
    ScrollTrigger.removeEventListener("refresh", measure);
    root.removeEventListener("load", refresh, true);
    window.removeEventListener("pointermove", pointer);
    reduced.removeEventListener("change", refresh);
    document.fonts.removeEventListener("loadingdone", refresh);
    window.removeEventListener("resize", refresh);
    debugLayer?.remove();
  };
}
