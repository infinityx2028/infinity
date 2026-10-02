export type Rect = { left: number; top: number; right: number; bottom: number };
export type Point = { x: number; y: number };
export const clamp = (v: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, v));
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
export const intersect = (a: Rect, b: Rect): Rect => ({
  left: Math.max(a.left, b.left),
  top: Math.max(a.top, b.top),
  right: Math.min(a.right, b.right),
  bottom: Math.min(a.bottom, b.bottom),
});
export const overlaps = (a: Rect, b: Rect, gap = 0): boolean =>
  a.left < b.right + gap &&
  a.right > b.left - gap &&
  a.top < b.bottom + gap &&
  a.bottom > b.top - gap;
/** Conservative projected bounds include ±14° yaw, ±4° pitch, ±3° roll,
 * 36px side faces, glass and the bounded shadow. Secondary photos are clipped here. */
export const footprint = (center: Point, width: number): Rect => ({
  left: center.x - width * 0.64,
  right: center.x + width * 0.64,
  top: center.y - width * 0.77,
  bottom: center.y + width * 0.77,
});
export function safePoint(
  area: Rect,
  width: number,
  anchor: [number, number],
): Point | null {
  const halfX = width * 0.64,
    halfY = width * 0.77;
  if (area.right - area.left < halfX * 2 || area.bottom - area.top < halfY * 2)
    return null;
  return {
    x: clamp(
      mix(area.left, area.right, anchor[0]),
      area.left + halfX,
      area.right - halfX,
    ),
    y: clamp(
      mix(area.top, area.bottom, anchor[1]),
      area.top + halfY,
      area.bottom - halfY,
    ),
  };
}
export function chooseSafePose(
  area: Rect,
  width: number,
  exclusions: Rect[],
  gap: number,
  primary: [number, number],
  fallback: [number, number],
  lockCenterAxis = false,
): { center: Point; fallback: boolean } | null {
  const anchors: [number, number][] = [
    primary,
    fallback,
    [0.25, 0.75],
    [0.75, 0.75],
    [0.5, 0.5],
  ];
  for (let i = 0; i < anchors.length; i++) {
    if (lockCenterAxis && anchors[i][0] !== 0.5) continue;
    const center = safePoint(area, width, anchors[i]);
    if (
      center &&
      !exclusions.some((rect) => overlaps(footprint(center, width), rect, gap))
    )
      return { center, fallback: i > 0 };
  }
  // Project onto exclusion edges instead of guessing offsets. This resolves
  // narrow gaps between a heading above and a CTA below the same visual region.
  const base = safePoint(area, width, primary);
  if (!base) return null;
  const relevant = exclusions.filter((rect) => overlaps(area, rect, gap));
  for (const rect of relevant) {
    const candidates = [
      { x: base.x, y: rect.top - gap - width * 0.77 },
      { x: base.x, y: rect.bottom + gap + width * 0.77 },
      { x: rect.left - gap - width * 0.64, y: base.y },
      { x: rect.right + gap + width * 0.64, y: base.y },
    ];
    for (const desired of candidates) {
      const center = {
        x: lockCenterAxis
          ? base.x
          : clamp(
              desired.x,
              area.left + width * 0.64,
              area.right - width * 0.64,
            ),
        y: clamp(
          desired.y,
          area.top + width * 0.77,
          area.bottom - width * 0.77,
        ),
      };
      if (!exclusions.some((r) => overlaps(footprint(center, width), r, gap)))
        return { center, fallback: true };
    }
  }
  return null;
}
/** Depth portal has explicit retreat, curved travel and approach stages. */
export function portalPoint(
  start: Point,
  end: Point,
  edge: number,
  progress: number,
): Point {
  const t = clamp(progress),
    u = 1 - t;
  return {
    x:
      u * u * u * start.x +
      3 * u * u * t * edge +
      3 * u * t * t * edge +
      t * t * t * end.x,
    y:
      u * u * u * start.y +
      3 * u * u * t * start.y +
      3 * u * t * t * end.y +
      t * t * t * end.y,
  };
}
