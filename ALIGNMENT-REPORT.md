# Infinity final alignment pass

Verified locally on 2 October 2026. This is an execution pass on the existing memory film: shared alignment, larger deliberate frame stages and a full-width closing brand shot. The three approved photographs remain, with Rukmini in the red saree as the main memory.

## Alignment

The homepage now shares `--page-inset` across every major section and footer. Desktop content caps at **1480px**, with `clamp(24px, 4vw, 72px)` gutters and a 12-column grid. Grid gaps are `clamp(16px, 2vw, 28px)`. Mobile uses **16px** horizontal padding for headings, body copy, inputs, categories, actions and footer information. Browser checks confirm the same computed guides in each major scene at all tested sizes.

AI uses columns 1–7 for content and 8–12 for the frame stage, with shared vertical centering. The frame is 280–350px at desktop widths, centered within its stage at approximately 77% viewport width, rather than parked at the edge. Its center aligns around the lower headline/input area. The form is capped at **640px** and 62px high, with a 60px square arrow action. Prompts use two equal columns and consistent 48px rows. The redundant visual-stage caption is hidden.

Camera Roll uses columns **1–6** for text and **8–12** for the frame. Both sans and serif lines share a starting edge. Sans size is `clamp(76px, 8vw, 130px)` with .88 line height; serif size is `clamp(52px, 6vw, 92px)`. Body spacing is 36px and CTA spacing 26px. The stage is centered alongside the complete copy block; the frame is **300–380px** with 3° rotation and physical depth. Tablet uses 260px to preserve the gap. Section height follows its content with a 650px minimum. The final CTA remains centered with its own reserved frame space; the pale duplicate INFINITY watermark is removed so the closing footer owns the brand moment.

## Persistent frame

The same CSS 3D object travels through hero, AI, categories, story, Difference, final and actual footer, alongside the other existing scenes. Native passive scroll writes translation, scale, rotation and depth synchronously. No positional spring, delayed scrub or new animation dependency was added. Mobile retains its own centered hero/story/final, top-right AI and background Difference states.

The footer anchor is now **centered in a dedicated stage**, rather than positioned in a corner. The entry pose retains a readable image and retreats along Z depth. Desktop moves from -140px to -380px; mobile moves from -90px to -300px. At the end, the frame stays above the wordmark, approximately **228px wide at 1440px** and **176px wide at 390px**. Its base size remains consistent during retreat instead of compounding negative Z with an extra size collapse. Final anchor Y comes from the real footer-stage geometry. Reduced motion retains the existing snapped poses with no Z animation.

## Cinematic footer

Useful information is first: short description, compact SHOP/HELP/ABOUT groups, studio/contact/social links and copyright. Mobile uses closed accordions; desktop expands the groups. The closing stage and giant wordmark are last.

INFINITY is uppercase **Manrope 800**, with -.055em tracking and .84 line height. Its native text is fitted horizontally to the available closing width with ResizeObserver and remeasured after fonts load. This retains selectable text and provides consistent edge alignment across phone and desktop sizes.

| Viewport | INFINITY font size | Measured text width | CUSTOMIZATIONS |
| --- | --- | --- | --- |
| 390×844 | 85.8px | **358px** | 11px, 14px below |
| 1440×900 | 230.4px | **1310px** | 28.8px, 22px below |

Desktop font size is `clamp(120px, 16vw, 300px)`; mobile is `clamp(72px, 22vw, 104px)`. CUSTOMIZATIONS uses weight 600 and .3em tracking, aligned to INFINITY's left edge. Desktop size is `clamp(18px, 2vw, 32px)`. The closing text occupies about 91–92% of the viewport at the two reference widths. Mobile bottom padding protects it from the fixed navigation.

## Mobile commerce

The previous commerce requirements remain verified: no product catalog on the mobile homepage; actual catalog categories remain accessible; Explore gifts and Ask Infinity AI remain available. Shop has two columns with whole-card detail links, compact image/name/FROM/price structure, functional wishlist and a small eye action. No large mobile Customize or Quick View text buttons return.

Quick View at 390×844 measures **366×527px**, with a **211px** image. Width is viewport minus 24px, max height 80dvh, and the purchase action remains reachable. The seven phone checks also pass for short-screen content scrolling.

## Screenshots and testing

**93 alignment checks pass**, covering shared guides, AI/story stage alignment, near-full-width wordmark, subtitle placement, visible frame retreat and overflow. **102 regression checks pass**, including native touch, slow/fast scroll, immediate stopping, object persistence, all journey scenes, commerce, Quick View, menu, auth layouts, cart and checkout. Authenticated commerce checks use isolated fixtures; no real order/payment is submitted. The final small footer-group ordering adjustment is followed by alignment verification against the rebuilt bundle.

Desktop alignment sizes: **1280×720, 1366×768, 1440×900, 1536×864, 1728×1117, 1920×1080**. Mobile: **320×568, 360×800, 375×812, 390×844, 393×852, 412×915, 430×932**. Regression coverage also includes 768, 1024 and 2560px widths. No horizontal overflow or runtime exceptions was observed.

Before screenshots are preserved in `qa/alignment/before/`. New desktop/mobile AI, Camera Roll and closing-footer screenshots are in `qa/alignment/1440-{ai,story,footer}.png` and `qa/alignment/390-{ai,story,footer}.png`. Visual inspection confirms a larger AI stage near the input, a larger Camera Roll frame aligned with its text, and the full-width brand moment replacing the previous small top-left logo/tiny corner frame. The screenshots and machine-readable reports are local QA artifacts excluded from Git.

Reproduce with `node qa/serve-build.cjs`, then `node qa/alignment.cjs http://127.0.0.1:4173` and `node qa/browser.cjs http://127.0.0.1:4173`.

## Build and Git

`npm.cmd run build` passes. Lint has **73 inherited errors and zero introduced findings**, compared by file/rule/message against the previous pass. Typecheck was attempted; this JavaScript project has no typecheck script or TypeScript configuration. Existing chunk-size and stale Browserslist warnings remain. No dependencies or backend/payment behavior changed.

Implementation commit: **`a6f21ecf41e82964ffbc1ef1909b8716cd7969b1`**, pushed successfully to verified production branch `main` and `redesign/memory-film` using normal fast-forwards. The report follow-up changes documentation only.

## Production verification

Vercel Production deployment **`6806270150`**, for this exact implementation commit, reports **failure**. The deployment identifier is `dpl_CgasDecXPyjMMLBnvCEnFHTqp4Tj`: [Production deployment dashboard](https://vercel.com/infinityx2028/i/CgasDecXPyjMMLBnvCEnFHTqp4Tj). Preview also failed. The Vercel deployment-log API requires authentication and returns HTTP 403 for a missing token. The underlying error remains unavailable without Vercel authentication or the owner's build-error text.

Actual live asset checks confirmed both domains still serve older bundles:

| Domain | Live JavaScript | Live CSS | Alignment bundle present |
| --- | --- | --- | --- |
| www.infinitycustomizations.com | `index-gVFY4kzs.js` | `index-CWT2oU5a.css` | No |
| i.infinitycustomizationz.com | `index-MZaSSesk.js` | `index-BMqasS5B.css` | No |

The expected final assets are **`index-BIe2ofUy.js`** and **`index-CEp_Xkyf.css`**. Live mobile/desktop acceptance of this pass is therefore **not complete**. All successful browser results above apply to the local production build. Push success is not treated as deployment success.

Local site: [localhost:5173](http://localhost:5173). Compiled QA bundle: [127.0.0.1:4173](http://127.0.0.1:4173).
