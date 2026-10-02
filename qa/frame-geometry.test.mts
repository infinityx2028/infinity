import assert from "node:assert/strict";
import { test } from "node:test";
import {
  overlaps,
  safePoint,
  footprint,
  chooseSafePose,
  portalPoint,
} from "../frontend/src/home/frameGeometry.ts";

test("a footprint includes the physical frame and bounded shadow", () => {
  const point = safePoint(
    { left: 8, right: 382, top: 88, bottom: 836 },
    200,
    [0, 0],
  );
  assert.ok(point);
  const rect = footprint(point, 200);
  assert.ok(
    rect.left >= 8 && rect.top >= 88 && rect.right <= 382 && rect.bottom <= 836,
  );
  assert.ok(
    rect.right - rect.left > 200 && rect.bottom - rect.top > 200 * 1.32,
  );
});
test("content gaps are enforced even without direct rectangle overlap", () => {
  const frame = { left: 10, right: 200, top: 10, bottom: 200 };
  const cta = { left: 10, right: 200, top: 220, bottom: 260 };
  assert.equal(overlaps(frame, cta), false);
  assert.equal(overlaps(frame, cta, 24), true);
});
test("a protected primary position selects a safe fallback at an exclusion edge", () => {
  const obstacle = { left: 300, right: 500, top: 250, bottom: 500 };
  const pose = chooseSafePose(
    { left: 0, right: 600, top: 0, bottom: 800 },
    200,
    [obstacle],
    24,
    [0.5, 0.5],
    [0.7, 0.25],
  );
  assert.ok(pose);
  assert.equal(pose.fallback, true);
  assert.equal(overlaps(footprint(pose.center, 200), obstacle, 24), false);
});
test("insufficient space returns absence, never a tiny frame", () => {
  assert.equal(
    safePoint({ left: 0, right: 100, top: 0, bottom: 100 }, 200, [0.5, 0.5]),
    null,
  );
  assert.equal(
    chooseSafePose(
      { left: 0, right: 400, top: 0, bottom: 500 },
      200,
      [{ left: 0, right: 400, top: 0, bottom: 500 }],
      24,
      [0.5, 0.5],
      [0.7, 0.25],
    ),
    null,
  );
});
test("the portal preserves endpoints and travels through the outer corridor", () => {
  const start = { x: 100, y: 200 },
    end = { x: 200, y: 500 };
  assert.deepEqual(portalPoint(start, end, 350, 0), start);
  assert.deepEqual(portalPoint(start, end, 350, 1), end);
  const mid = portalPoint(start, end, 350, 0.5);
  assert.ok(mid.x > end.x && mid.x < 350 && mid.y > start.y && mid.y < end.y);
});
test("the final scene never leaves its shared center axis during fallback", () => {
  const area = { left: 100, right: 500, top: 100, bottom: 800 };
  const obstacle = { left: 80, right: 520, top: 550, bottom: 900 };
  const pose = chooseSafePose(
    area,
    200,
    [obstacle],
    24,
    [0.5, 0.5],
    [0.7, 0.25],
    true,
  );
  assert.ok(pose);
  assert.equal(pose.center.x, 300);
  assert.equal(overlaps(footprint(pose.center, 200), obstacle, 24), false);
});
