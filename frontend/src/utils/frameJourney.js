// The only director for the persistent frame. Geometry comes from grid slots.
const scene = (
  visible,
  opacity,
  zDepth,
  photo = 0,
  layer = "front",
  rotateY = 0,
) => ({
  visible,
  x: "anchor",
  y: "anchor",
  scale: visible ? 1 : 0.72,
  rotateX: 2,
  rotateY,
  rotateZ: visible ? 2 : 0,
  opacity,
  zDepth,
  layer,
  photo,
  transitionRange: [0.8, 1],
});
export const memoryFrameScenes = {
  desktop: {
    hero: scene(true, 1, 20, 0, "front", -6),
    ai: scene(true, 1, -30, 1, "front", 5),
    categories: scene(true, 0.22, -140, 1, "back"),
    products: scene(false, 0, -200),
    giftFeeling: scene(false, 0, -200),
    onePhotoChapter: scene(false, 0, -200),
    cameraRoll: scene(true, 1, 0, 0, "front", -4),
    moments: scene(false, 0, -200),
    infinityDifference: scene(true, 0.25, -180, 0, "back"),
    howItWorks: scene(true, 0.3, -150, 0, "back"),
    founder: scene(false, 0, -200),
    finalMemory: scene(true, 1, 0, 0, "front", -3),
    footer: scene(false, 0, -200),
  },
};
memoryFrameScenes.mobile = Object.fromEntries(
  Object.entries(memoryFrameScenes.desktop).map(([key, value]) => [
    key,
    {
      ...value,
      rotateX: 1,
      rotateY: value.rotateY * 0.5,
      zDepth: value.zDepth * 0.6,
    },
  ]),
);
memoryFrameScenes.tablet = memoryFrameScenes.desktop;
export const FRAME_SCENES = memoryFrameScenes;
