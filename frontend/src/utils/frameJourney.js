// Every scene owns a reserved visual anchor. Translation has no spring or scrub.
// Mobile has its own depth, lighting and rotation, rather than scaled desktop poses.
const pose = (
  rotate,
  tilt,
  z,
  opacity,
  light,
  photo,
  layer = "front",
  form = "frame",
) => ({ rotate, tilt, pitch: 2, z, opacity, light, photo, layer, form });

export const FRAME_SCENES = {
  desktop: {
    hero: pose(-8, -10, 35, 1, 0, 0),
    ai: pose(3, 6, -30, 1, 0, 1),
    categories: pose(-4, -6, 15, 0.9, 0, 1),
    products: pose(9, 8, -280, 0.35, 0, 1, "back"),
    story: pose(3, -6, 15, 1, 0, 0),
    transformation: pose(5, 6, -70, 0.9, 0, 2, "front", "magazine"),
    moments: pose(-3, -6, -200, 0.4, 0, 2, "back"),
    brand: pose(-6, 9, 10, 0.9, 1, 0),
    process: pose(4, -6, -220, 0.5, 0, 0),
    founder: pose(-3, 5, -220, 0.35, 0, 0, "back"),
    final: pose(-3, -8, 80, 1, 0, 0),
    footer: pose(2, 6, -140, 0.9, 1, 0),
    ending: pose(0, 4, -380, 0.65, 1, 0),
  },
  mobile: {
    hero: pose(-5, -7, 0, 1, 0, 0),
    ai: pose(4, 5, -70, 0.55, 0, 1),
    categories: pose(-3, -5, -100, 0.55, 0, 1),
    story: pose(-3, -6, 15, 1, 0, 0),
    transformation: pose(4, 5, -35, 0.9, 0, 2, "front", "magazine"),
    process: pose(3, -4, -90, 0.55, 0, 2),
    brand: pose(-4, 6, -40, 0.7, 1, 0),
    final: pose(-3, -7, 25, 1, 0, 0),
    footer: pose(2, 4, -90, 0.85, 1, 0),
    ending: pose(0, 3, -300, 0.65, 1, 0),
  },
};

FRAME_SCENES.tablet = Object.fromEntries(
  Object.entries(FRAME_SCENES.desktop).map(([key, scene]) => [
    key,
    {
      ...scene,
      rotate: scene.rotate * 0.65,
      tilt: scene.tilt * 0.65,
      z: scene.z * 0.75,
    },
  ]),
);
