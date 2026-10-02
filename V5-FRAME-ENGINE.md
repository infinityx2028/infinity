# Infinity Customizations — V5 frame engine

## Collision engine

`frontend/src/home/MemoryFrameDirector.ts` owns the persistent frame, scene state, projection, light, collision checks and fallback selection. `frameScenes.ts` contains separate desktop and mobile configurations; `frameGeometry.ts` contains the deterministic rectangle and curved-path calculations.

Every scene reserves a measured `.frame-safe-zone` in the content grid. The allowed region is its intersection with the viewport, below navigation and before the footer. Headings, paragraphs, links, buttons, inputs, forms, annotations, catalog grids, step lists and navigation become protected exclusions. Text measurement includes its actual glyph range. Geometry is cached on layout refresh; scrolling performs arithmetic against cached rectangles without reading layout.

The conservative frame footprint is 1.28 × nominal width horizontally and 1.54 × nominal width vertically, including projection and bounded shadows. A clip boundary contains secondary objects and all paint within that footprint. Minimum clearance is 48px on desktop and 24px on mobile; horizontal viewport clearance is 8px. Selection tries the primary and secondary anchors, then exclusion-edge projections and alternate anchors. Width can fit within its configured range but never below the scene minimum. An insufficient region hides the actor.

Transitions retreat in depth, follow a cubic curve toward the outside edge, then approach the destination. Every visible intermediate position must fit a measured region and clear all exclusions. Busy corridors use an invisible depth portal. Resize, image load, font readiness and font loading events invalidate cached geometry; the actor is hidden until refreshed. A ResizeObserver also watches the root and reserved visual regions.

## Physical frame

One React `MemoryFrameDirector` component creates one persistent object. Its frame has a back panel, body, four 36px side faces, cavity, front rim, inner bevel, four corner joints, glass, edge highlight, signature, photo and separate cast/contact shadows. Scene light coordinates drive the reflection, warmth and shadow direction; photo parallax remains approximately 1–3px. Foreground rotations stay within 8° yaw and 4° pitch, and background yaw within 14°. No full spins or flips are used.

The explicit layer tokens are 0 background, 5 environment, 8 frame behind content, 20 content, 30 foreground frame, 50 navigation and 100 overlays. Search/dialog overlays hide the frame. Development-only `?frameDebug=1` adds green safe regions, yellow exclusions, red projected bounds, anchor crosses, center axis and a twelve-column grid. Development assertions report `FRAME COLLISION`; production does not create the debug overlay.

## Exact scene configuration

| Scene | Layer/state | Opacity | Minimum width desktop/mobile |
| --- | --- | --- | --- |
| Hero | Foreground | 1 | 340 / 180px |
| AI | Midground | 1 | 260 / 100px |
| Categories | Background | .45 | 170 / 80px |
| Emotion | Hidden | 0 | — |
| Camera | Foreground | 1 | 300 / 160px |
| Magazine | Foreground | 1 | 260 / 180px |
| Universe | Midground | 1 | 260 / 180px |
| Favourites | Hidden | 0 | — |
| Process | Background | .55 | 150 / 80px |
| Difference | Background | .65 | 150 / 90px |
| Studio | Hidden | 0 | — |
| Final | Foreground, locked center axis | 1 | 340 / 190px |
| Footer | Hidden | 0 | — |

Visible states are conditional on available safe space. The magazine and universe scenes morph the persistent object into actual catalog image planes. The final frame fades and recedes before content or footer contact.

## Mobile and accessibility

Mobile uses its own scene coordinates and widths at ≤767px. Hero ordering is headline, frame and actions; camera ordering is headline, frame, body and CTA. AI places its visual region between the heading and full-width controls. The final frame and headline share a locked center axis. Semantic text wraps for enlarged fonts. Reduced motion removes 3D travel, pointer response and photo parallax while retaining collision-safe static placements.

## Verification

The production-build browser sweep passed **63 checks across 1,544 samples**, including 788 visible-frame samples, with **zero intersections, zero clearance violations and zero failed checks**. Each viewport tests scene scroll positions and the actual director transition interval at 0%, 25%, 50%, 75% and 100%, plus the reserved visual position. Every required visible scene must have at least one safe visible sample; hiding all frames cannot pass.

Tested viewports: 320×568, 360×800, 375×812, 390×844, 393×852, 412×915, 430×932, 1280×720, 1366×768, 1440×900, 1728×1117 and 1920×1080. Additional checks cover resize while in hero/AI/camera/final, 200% homepage text at mobile and desktop with five positions per scene, reduced motion, final center axis, footer hiding, search overlays, real AI results and product navigation cleanup. No runtime exceptions were reported.

The first sweep caught an offscreen-clearance defect at 1280×720: controls just below the viewport were incorrectly filtered out of the exclusions. Exclusion filtering now includes the configured clearance beyond the viewport, and the complete rerun passes. Screenshot review also corrected the magazine headline's size to prevent desktop word splitting.

The reusable harness is `qa/v5.cjs`; the six pure geometry tests are `qa/frame-geometry.test.mts`. Local artifacts are in `qa/v5-local/index.html` and `qa/v5-local/report.json`; the refreshed gallery contains 831 screenshots. The development run at 390×844 and 1440×900 passed another 23 checks across 364 samples with zero collisions, gaps, runtime exceptions or collision assertions. `qa/v5-debug/` contains 149 development-overlay screenshots, including actual transition checkpoints. Assertions disregard the transparent frame shell while it morphs into products. Generated artifacts are ignored by Git.

Build, lint, strict TypeScript checks, six geometry tests and whitespace checks passed. The physical director is a lazy chunk of approximately 4.5kB gzip. The main application bundle is approximately 128.4kB gzip.

## Performance

High quality retains multiple secondary photos and detailed reflections; medium limits secondary layers and removes the contact-shadow layer; low removes secondary/opening/card layers and uses simpler shadows and a static glass treatment. Save-data, device memory, pointer type and core count select the mode. Reduced motion is an independent static-placement mode. `will-change` is applied during movement and removed after idle.

Measured production-build headless Chrome scroll results on this development machine:

| Quality | FPS | 95th percentile frame interval |
| --- | --- | --- |
| High | 59.66 | 16.8ms |
| Medium | 59.33 | 16.8ms |
| Low | 59.66 | 16.8ms |

These measurements emulate the quality selector through core count; they are not mobile-device or low-end GPU benchmarks.

## Deployment

The previous V4 production and preview deployments failed. Neither custom domain served V4's built assets. Investigation found that the repository allowed only Node 16/18/20. [Vercel disabled new Node 20 deployments on October 1, 2026](https://vercel.com/changelog/node-js-20-is-being-deprecated). The root deployment engine now specifies `24.x`, matching the local runtime used for all builds and tests. Backend dependencies also install successfully under Node 24; backend and commerce logic were not edited. This corrects a confirmed configuration incompatibility; it does not establish the full cause of earlier failures without their private logs.

`node qa/verify-production.cjs` audits the exact current commit, public production/preview deployment states, and both custom-domain asset manifests. `node qa/v5.cjs https://www.infinitycustomizations.com` tests the actual live application; it explicitly fails and labels previous-live captures if the V5 director is absent. This workspace currently has no authenticated Vercel CLI session. A successful local build or Git push is not production verification; the final handoff reports the observed live result separately.

The frontend package also pins Node 24, with matching lockfile metadata, so projects whose configured root is `frontend/` select the supported runtime as well. No dependency versions were changed.
