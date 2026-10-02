# Strict alignment and frame direction

This pass follows the latest visibility brief, which replaces the previous always-visible frame/footer retreat. Existing copy and photographs are preserved. No features, fonts, dependencies, database changes or additional homepage sections were added. The existing Gift Feeling heading was moved into the existing transformation section, before One Photo Chapter; Camera Roll follows as the frame's return. The Difference pillars retain their own reserved background stage.

## Frame visibility

| Scene | Final direction |
| --- | --- |
| Hero | Visible, center-right desktop / centered mobile |
| Infinity AI | Visible, right desktop / upper-right mobile |
| Categories | Background only, maximum .22 opacity; may finish fading out on mobile |
| Gift Feeling | Completely hidden: opacity 0, visibility hidden |
| One Photo Chapter | Completely hidden: opacity 0, visibility hidden |
| Camera Roll | Visible again, main red-saree memory |
| Infinity Difference | Small background frame in a separate column, .25 opacity |
| How It Works | Reduced background frame in a reserved header slot, .3 opacity |
| Make Memory Real | Visible, centered above the heading |
| Footer | Completely hidden; zero frame objects or anchor/stage in footer DOM |

Desktop preview, occasions and founder scenes hide the frame to prioritize their content. Gift Feeling and One Photo remain frame-free throughout their typography states. The persistent object stays mounted and is never recreated between scenes.

## Director and scroll timing

`memoryFrameScenes` is the single configuration for desktop, tablet and mobile. Every state defines `visible`, `x`, `y`, `scale`, `rotateX`, `rotateY`, `rotateZ`, `opacity`, `zDepth`, `layer`, `photo` and `transitionRange`. Coordinates resolve from measured layout slots. Native passive scroll computes the current state directly from DOM geometry; no timer, positional spring or delayed scrub controls visibility or position.

The root cause of screenshot drift was interpolating fixed viewport poses across an entire section. The frame could linger over later copy while its real slot had already scrolled away. Position now follows the actual document slot; controlled transitions between foreground stages use the configured final 20% range. Background stages have dedicated columns instead of traveling through text. The boundary includes the header/scroll-margin tolerance, so section navigation and reverse scrolling select the same state.

Before frame-free typography enters, opacity fades to zero with a smaller scale, negative Z depth and softer shadow. Camera Roll re-entry resolves its own stage and scroll-linked depth/opacity. Before the footer's first viewport intersection, the final object recedes, shrinks and fades. At intersection opacity is exactly zero and visibility hidden. The same rules apply scrolling back up and opening deep links. A viewport safety boundary hides a stage once it has naturally scrolled out of the usable area, instead of pinning it over navigation or subsequent content.

## Alignment

| Scene | Result |
| --- | --- |
| AI alignment | **YES** — shared grid, reserved stage, input/prompts aligned; mobile body column clears the frame |
| Gift Feeling centered | **YES** — centered typography, no image |
| One Photo aligned | **YES** — heading, support copy and CTA share one column; no floating frame/magazine |
| Camera Roll fixed | **YES** — text in columns 1–7, stage in 8–12, both vertically centered |
| Final exact center | **YES** — frame, heading, existing supporting line and actions use one center axis |
| Footer centered/full-width | **YES** — compact information followed by the wordmark; no frame stage |

The master content width is **1520px**, with desktop gutters `clamp(24px, 4vw, 72px)` and shared 12-column gaps `clamp(16px, 2vw, 32px)`. Mobile uses 16px guides. Camera Roll's sans and serif lines share their left edge; mobile orders headline → frame → body → CTA using flex flow. On short phones the frame is 150px wide. The mobile hero also uses normal flex order for headline/copy/frame/actions, avoiding an absolute photo overlapping wrapped copy.

The final scene uses a centered vertical flex composition with the frame first, then heading, existing supporting text, actions and signoff. The existing pale duplicate watermark is absent. Its tail reserves space for the exit to finish before the footer becomes visible. No frame can cover footer content. Footer height is driven by links and typography after removal of its former image stage.

Footer INFINITY remains Manrope 800, uppercase and full-width. At 1440×900 its font is **230.4px** and measured text width **1309.8px**. At 390×844 it is **85.8px** and measured width **350.0px**, centered in the available 358px area. CUSTOMIZATIONS is **28.8px / 11px**, directly beneath at 22px / 14px spacing.

## Screenshot and browser QA

**1440×900 tested: YES. 390×844 tested: YES.** Screenshots cover AI, Gift Feeling, One Photo, Camera Roll, Difference, How It Works, final memory and footer. Temporary viewport-center lines, container edges, a 12-column overlay, section boundaries and frame crosshairs were injected into the QA browser for inspection. Matching `-debug.png` captures are saved; the overlay is removed immediately and is not part of the application.

**289 strict checks pass** across 1440×900, 390×844, 320×568, 360×800, 375×812, 393×852, 412×915, 430×932, 1280×720, 1366×768, 1728×1117 and 1920×1080. These cover the visibility map, true centers, overflow, zero footer objects and sampled complete down/up scroll paths. Those paths found no frame intersection with visible body-copy or interactive-control rectangles. These are browser-emulated viewport tests rather than hardware-device performance measurements.

**105 regression checks pass** for slow/fast/native-touch scroll, immediate stopping, one mounted object, reduced motion, mobile category access, six-product desktop preview, compact Shop cards, product-price taps, wishlist, Quick View, AI budget, menu, auth layouts, cart and checkout. Authenticated commerce uses isolated fixtures; no real order or payment is submitted. Mobile homepage has no full product grid; Shop retains two columns and whole-card links. Quick View keeps viewport-minus-24px width and 80dvh maximum height.

Screenshots and reports are ignored local artifacts in `qa/strict/` and `qa/local/`. Reproduce with `node qa/serve-build.cjs`, then `node qa/strict.cjs http://127.0.0.1:4173` and `node qa/browser.cjs http://127.0.0.1:4173`.

## Build, Git and live

Production build **passes**. Changed components/pages/director pass ESLint. Full-project lint still has **73 inherited errors, zero introduced findings** compared by file/rule/message. Typecheck was attempted: this JavaScript project has no typecheck script or TypeScript configuration. Existing chunk-size and Browserslist warnings remain.

Implementation commit **`067084a82c6275b03ff30d77dce2a46cd930d4ee`** was pushed successfully to the verified Production branch `main` and `redesign/memory-film` using normal fast-forwards. This report follow-up changes documentation only.

Vercel Production deployment **`6806849259`** for that exact commit reports **failure**. Deployment identifier: `dpl_GzVghUQ9T5a9Cri1rqR3ShDYDUHK`; [Production dashboard](https://vercel.com/infinityx2028/i/GzVghUQ9T5a9Cri1rqR3ShDYDUHK). Preview also failed. Deployment logs require Vercel authentication (API returns 403 for a missing token), which is unavailable in this workspace. Vercel login or the owner's build-error text is needed to diagnose the failure.

Actual domain checks show **neither live site serves this implementation**. Expected assets are `index-DSDiDtqC.js` and `index-Cl4_esZV.css`. www.infinitycustomizations.com still serves `index-gVFY4kzs.js` / `index-CWT2oU5a.css`; i.infinitycustomizationz.com still serves `index-MZaSSesk.js` / `index-BMqasS5B.css`. **Live mobile/desktop acceptance remains incomplete.** The passing checks above are against the local compiled production bundle, not the old deployed sites.

Local review: [localhost:5173](http://localhost:5173), confirmed HTTP 200. Compiled QA bundle: [127.0.0.1:4173](http://127.0.0.1:4173).
