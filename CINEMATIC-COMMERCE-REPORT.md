# Infinity cinematic commerce pass

Verified locally on 2 October 2026. This pass preserves the existing visual language and the three user-selected photographs, with Rukmini in the red saree as the main memory. The implementation changes the journey architecture, mobile homepage composition and product-card interaction together.

## Frame and scroll

The mobile root cause was explicit hiding: AI/category anchors were assigned zero opacity, the mobile AI visual was display:none, and shopping/process states also had zero opacity. Document-coordinate interpolation across a long homepage catalog could carry the object off screen. The earlier 65% transition gate had already been removed in the preceding refinement; this pass fixes the remaining visibility and coordinate-system problems.

`frameJourney.js` now defines desktop, tablet and mobile poses, including rotation, pitch, Z-depth, opacity, light, photo, layer and form. Responsive reserved anchors supply X/Y and scale. A single persistent frame survives every scene, including the actual footer. Position is written synchronously from a passive native scroll listener. There is no primary-motion spring, GSAP scrub, Lenis, debounce, timer or React setState on scroll. Pointer tilt alone uses requestAnimationFrame and a 90ms transition. Photo crossfade stays at 240ms.

Desktop has 12 frame-bearing scenes: hero, AI, categories, six-product preview, story, transformation, occasions, Difference, process, founder, final and footer. Mobile has nine: hero, AI, categories, story, transformation, process, Difference, final and footer. The ending pose extends the footer retreat. No journey pose has zero opacity: the lowest is 0.35.

| Mobile scene | Reserved frame width | Treatment |
| --- | --- | --- |
| Hero | 200px; 190px below 360px | Centered, main red-saree memory |
| AI | 120px; 110px below 360px | Top-right, behind the message |
| Categories | 105px | Receded beside the heading |
| Story | 180px | Strong centered return |
| Transformation | 180px | Magazine with a released polaroid |
| Process | 105px | Small and farther away |
| Difference | 115px | Partially lit, beside the headline |
| Final | 205px; 195px below 360px | Foreground, centered |
| Footer | 100px, then reduced | Retreat into distance |

Perspective changes the apparent widths. Short screens below 700px high use additional proportional scale reduction to protect the header and bottom navigation. Tablet rotations and depth are reduced from desktop, with separate CSS anchor positions. Mobile has its own configuration and layout, rather than desktop poses scaled down.

The physical construction retains the rear panel, four side walls, front bevel, face, inner bevel, recessed photo cavity, photo plane, glass and highlight: 12 logical surfaces, plus paper backs and ground shadow. The rim is Z=18px, rear Z=-12px and photo Z=7px, giving 30px physical depth. All photographs stay upright with backface visibility hidden. No 180-degree flip or negative image scale is used. Existing product-image optimization normalizes EXIF before resizing.

The final foreground frame recedes from Z=80 to -560 and then -760 on desktop; mobile uses 25 to -360 and then -540. It scales down, moves toward the footer's upper-right and continues retreating as the footer scrolls. The shadow becomes smaller and weaker. It remains visible rather than disappearing through opacity zero.

## Mobile home and commerce

- Full mobile homepage product grid removed: **YES**, including its DOM render. The mobile story also omits the desktop occasions/founder sections.
- Categories visible: **YES**. The horizontal strip uses real active catalog categories, approximately 108×137px cards and correct category links.
- Shop CTA: **YES**. “Explore gifts” opens `/shop`; “Let's customize” and “Shop gifts” also lead to shopping.
- Desktop product preview retained: **YES**, limited to six, with a collection link. Best Sellers navigation now opens a shop filter backed by the real `isBestSeller` field.
- Mobile Quick View text button removed: **YES**. A secondary 32px eye icon retains access to the compact overlay.
- Customize buttons removed from grid cards: **YES**. Customization stays in the modal and product page.
- Entire card clickable: **YES**. One product link owns the image, name, price and complete card surface; independent wishlist and eye controls sit above it.
- Mobile card height: approximately **258px at 390px**, in two columns, with 13px two-line titles and 16px prices. No grid descriptions; images remain upright and contained.
- Wishlist functional: **YES**, verified for guest saves and the authenticated API contract using a browser-only fixture. Badges require a real boolean bestseller flag; no invented ranking is added.

The shop reads active products from the API and filters locally by the resolved category. An empty or failed catalog no longer substitutes a static catalog. Checkout, cart, account and product pages have no homepage frame. Existing product options, checkout and WhatsApp personalization flow are preserved.

## Quick View and footer

Quick View width is `min(100vw - 24px, 400px)`, with 12px margins and maximum height `min(80dvh, 720px)`. Images use `clamp(160px, 25dvh, 220px)`. Content scrolls vertically on short phones; the 48px purchase action stays reachable.

| Phone viewport | Measured modal width × height | Image |
| --- | --- | --- |
| 320×568 | 296×454px | 160px |
| 360×800 | 336×535px | 200px |
| 375×812 | 351×519px | 203px |
| 390×844 | 366×527px | 211px |
| 393×852 | 369×529px | 213px |
| 412×915 | 388×536px | 220px |
| 430×932 | 400×536px | 220px |

Measurements use the tested catalog item; content-dependent height remains bounded.

Footer INFINITY all caps: **YES**. It uses Manrope weight 800, 44px on mobile (40px below 360px), and 76–130px on desktop, with tracked 9–10px CUSTOMIZATIONS beneath. The copy is short, the frame retreats into the background, mobile has accordions, and desktop links expand. Footer foreground typography has restrained scroll parallax, disabled for reduced motion. The navy menu has numbered links, a bold brand lockup and a quiet memory photograph behind it.

## Performance, testing and build

The main AVIF preload prioritizes Rukmini. The three selected memories are eager loaded and decoded; current/next photos are available without mounting a new image during a transition. AVIF/WebP responsive variants remain at 480/1024px. The catalog's images are not preloaded. Mobile removes hero satellites and a secondary transformation paper, simplifies reflections, and retains CSS depth without WebGL or an additional animation library. Primary motion animates transform/opacity; anchor layout dimensions are static. Scroll geometry is cached until layout changes. Shadows do not animate blur.

All **102 Chrome checks pass against the compiled production bundle**, with no runtime exceptions. Checks include slow/fast/native-touch scroll, immediate stopping, one persistent object, scene visibility, mobile controls outside the frame at inspected scene positions, all seven required phone dimensions, tablet/desktop widths from 768 to 1920 (also 2560), reduced motion, actual price taps, category routes, search, AI recommendations within budget, Quick View, menu, footer, auth layouts, cart and checkout. Authenticated account/wishlist and populated cart/checkout checks use isolated browser fixtures; no real customer account, order or payment is created. These are browser emulation checks, not hardware-device frame-rate measurements.

Catalog identity, budget, empty catalog and availability checks also pass. `npm.cmd run build` passes. Lint has **73 inherited errors and zero introduced findings** compared by file/rule/message. `npm.cmd run typecheck` was attempted: no typecheck script or TypeScript configuration exists in this JavaScript project. The existing main-chunk size and Browserslist warnings remain.

Screenshots and machine-readable results are in ignored `qa/local/`. Reproduce with `node qa/serve-build.cjs`, then `node qa/browser.cjs http://127.0.0.1:4173` and `node qa/catalog-checks.cjs`.

## Git and production

The production branch was verified from Vercel's GitHub deployment records: deployment `6792665177`, created by `vercel[bot]`, is labeled Production and points to `f20b44cefd24035ee8a1a7ce27a998c715d54d70`, the fetched `origin/main` head. Redesign branch deployments are labeled Preview. `origin/main` is an ancestor of the current work, allowing a normal fast-forward without a force push. Deployment results and implementation commit are recorded after push.

Local development: `http://localhost:5173`. Tested production bundle: `http://127.0.0.1:4173`. Live acceptance requires a matching bundle on the custom domain, followed by mobile and desktop checks; Git push alone is not deployment verification.
