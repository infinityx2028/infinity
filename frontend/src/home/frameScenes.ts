export type SceneName =
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
  | "final"
  | "footer";
export type SceneConfig = {
  visible: boolean;
  layer: "foreground" | "midground" | "background" | "hidden";
  safeZone: SceneName;
  opacity: number;
  minWidth: number;
  rotation: [number, number, number];
  primary: [number, number];
  fallback: [number, number];
  light: [number, number, number];
};
const hidden = (safeZone: SceneName): SceneConfig => ({
  visible: false,
  layer: "hidden",
  safeZone,
  opacity: 0,
  minWidth: 0,
  rotation: [0, 0, 0],
  primary: [0.5, 0.5],
  fallback: [0.5, 0.25],
  light: [45, 25, 0],
});
const scene = (
  safeZone: SceneName,
  minWidth: number,
  layer: SceneConfig["layer"],
  rotation: SceneConfig["rotation"],
  light: SceneConfig["light"],
  opacity = 1,
): SceneConfig => ({
  visible: true,
  safeZone,
  minWidth,
  layer,
  rotation,
  light,
  opacity,
  primary: [0.5, 0.5],
  fallback: [0.7, 0.25],
});

export const DESKTOP_SCENE_CONFIG: Record<SceneName, SceneConfig> = {
  hero: scene("hero", 340, "foreground", [3, -7, -3], [34, 22, 1]),
  ai: scene("ai", 260, "midground", [2, 6, 2], [50, 30, 0.4]),
  categories: scene(
    "categories",
    170,
    "background",
    [3, -12, -3],
    [48, 25, 0.5],
    0.45,
  ),
  emotion: hidden("emotion"),
  camera: scene("camera", 300, "foreground", [3, -7, -2], [42, 22, 0.2]),
  magazine: scene("magazine", 260, "foreground", [2, 6, 0], [42, 22, 0.2]),
  universe: scene("universe", 260, "midground", [2, -5, 2], [45, 25, 0.3]),
  favourites: hidden("favourites"),
  process: scene("process", 150, "background", [2, 9, -2], [48, 26, 0.5], 0.55),
  difference: scene(
    "difference",
    150,
    "background",
    [3, -12, 2],
    [75, 18, 0.1],
    0.65,
  ),
  studio: hidden("studio"),
  final: scene("final", 340, "foreground", [2, 0, 0], [38, 20, 1]),
  footer: hidden("footer"),
};
export const MOBILE_SCENE_CONFIG: Record<SceneName, SceneConfig> = {
  hero: scene("hero", 180, "foreground", [2, -6, -2], [34, 22, 1]),
  ai: scene("ai", 100, "midground", [2, 5, 2], [50, 30, 0.4]),
  categories: scene(
    "categories",
    80,
    "background",
    [2, -9, -2],
    [48, 25, 0.5],
    0.45,
  ),
  emotion: hidden("emotion"),
  camera: scene("camera", 160, "foreground", [2, -6, -2], [42, 22, 0.2]),
  magazine: scene("magazine", 180, "foreground", [2, 5, 0], [42, 22, 0.2]),
  universe: scene("universe", 180, "midground", [2, -5, 2], [45, 25, 0.3]),
  favourites: hidden("favourites"),
  process: scene("process", 80, "background", [2, 8, -2], [48, 26, 0.5], 0.55),
  difference: scene(
    "difference",
    90,
    "background",
    [2, -9, 2],
    [75, 18, 0.1],
    0.65,
  ),
  studio: hidden("studio"),
  final: scene("final", 190, "foreground", [2, 0, 0], [38, 20, 1]),
  footer: hidden("footer"),
};
