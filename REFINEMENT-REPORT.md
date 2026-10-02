# Infinity animation and mobile refinement

The existing memory film, scene order, shopping behavior and animation direction are retained. Changes target scroll timing, the physical frame, real memory imagery, mobile Quick View and the footer. Backend, payment, catalog data and deployment configuration are unchanged.

## Scroll

The previous section interpolation used `(sectionProgress - 0.65) / 0.35`: position stayed at its old anchor for the first 65% of each section transition, then moved through the remaining 35% with cubic easing. Its scroll update also waited for requestAnimationFrame, and a separate seven-second CSS breathing animation continued after scrolling stopped. These were the concrete sources of late movement and independent drift.

Native browser scrolling is now the timing authority. A passive scroll listener reads the current `window.scrollY` and writes the object's transform immediately. Section progress is linear across the whole interval; scene anchors start approximately 100px before the incoming section reaches the header. No scroll spring, GSAP scrub, Lenis interpolation, timer or extra positional CSS transition is used. Pointer tilt alone uses requestAnimationFrame and a short 90ms transition. Photo crossfades are 240ms and do not delay position.

The frame and all three inner photos remain mounted. React state changes only on discrete scene changes. Commerce regions fade the object away rather than moving it across product controls. Reduced motion snaps to section poses and disables tilt, parallax and image crossfade. The atmosphere is clipped at the main story boundary so it cannot cover footer links.

## Frame and memories

Construction uses CSS perspective and preserve-3d. There are 12 logical surfaces: rear panel, four side walls, outer bevel, face, inner bevel, recessed cavity, active photo, glass and highlight. Three photo planes remain mounted for crossfading, plus two paper backs for the existing polaroid form and a separate ground shadow.

The rim sits at Z=18px, the rear at Z=-12px, giving 30px physical depth. The face is Z=3px and the photo cavity adds 4px, placing the photo at Z=7px. Glass and highlight sit above the photo, below the outer rim. Bevels use directional highlights and contact shadows; the ground shadow changes scale with distance rather than animating blur. Low quality mode retains the side walls, bevels and cavity.

Desktop reflections follow pointer position through requestAnimationFrame. Mobile reflection follows scroll progress; low quality mode uses a quieter static reflection. All photos are upright and normalized for EXIF orientation during extraction.

The three memories come from existing Infinity product photographs, preserving the originals:

- `4 x 6 white frame 199.jpg`: the original candid friendship memory.
- `4 x 6 p2.jpg`: a real family photograph.
- `4 x 6 p4.jpg`: a real group celebration photograph.

The crop script records each exact crop. These are actual photographs from the existing assets, not invented people or replacement product pictures. Hero and story supporting photos reuse the same memories. Background, typography, paper and frame move at distinct rates; mobile uses fewer supporting elements.

## Mobile Quick View

Previously the panel filled the mobile width, allowed 92dvh (about 776px at 390x844) and used a 300px image. It now has 12px outer margins, width `min(viewport - 24px, 400px)`, and maximum height `min(82dvh, 720px)`. The image height is clamped to 165–235px. The close control remains 44px and the main action is 48px; the content region scrolls vertically on short screens while the action remains reachable. Description is 13px, clamped to three lines; title is 21px and price 19px. Product images use contain on mobile.

Measured production-bundle results for the tested catalog item:

| Viewport | Panel width × height | Image height |
| --- | --- | --- |
| 320 × 568 | 296 × 466px | 165px |
| 360 × 800 | 336 × 532px | 216px |
| 390 × 844 | 366 × 544px | 228px |
| 430 × 932 | 400 × 551px | 235px |

Content-dependent height stays bounded by the maximum. All four checks confirm reachable actions and no horizontal overflow.

## Footer

The new wordmark is live text: “Infinity” in the existing Playfair Display italic, weight 600, with tight tracking. “CUSTOMIZATIONS” uses small tracked Manrope in champagne. Mobile Infinity is 46px; desktop uses `clamp(72px, 8vw, 120px)` (about 115px at 1440px). The entrance uses a 350ms mask reveal and 450ms champagne line, disabled under reduced motion. The persistent frame settles quietly at the side. Mobile keeps compact accordions; desktop link groups open automatically.

## Performance and verification

The main memory uses an AVIF responsive preload. All three selected memories are eager loaded, asynchronously decoded and permanently available as current/previous/next images. AVIF and WebP variants are provided at 480px and 1024px; the 480px AVIF photos total about 49KB. Original product assets remain intact.

Mobile, coarse pointers, save-data connections and lower CPU counts select low quality mode: fewer supporting photos and simpler reflections, with physical frame depth retained. Scroll does not trigger a React render for each event. Position and shadows avoid animated blur. The existing large main JavaScript chunk remains a build warning; this change adds no animation library or 3D runtime.

All 47 Chrome production-bundle checks pass, with no runtime errors. QA covers slow and fast scrolling at 390x844 and 1440x900, native touch gestures, same-event scroll sampling, stopping without drift, one persistent frame, desktop pointer tilt, footer visibility, desktop links, all four Quick View sizes and reduced motion. Wider regression checks cover 15 widths from 320px to 2560px, real catalog recommendations, guest saves, routes and browser-only authenticated fixtures. Authenticated fixtures do not verify a real customer session. Screenshots and the machine-readable result are in ignored `qa/local/`.

`npm.cmd run build` passes. Repository lint retains 74 inherited errors; comparison by file, rule and message found no new findings. No runtime errors were observed in the completed browser checks. Reproduce with `node qa/serve-build.cjs`, then `node qa/browser.cjs http://127.0.0.1:4173`.

## Git and production

Implementation commit `0a3222191cf30998478ce839a508c0e43bceab46` was pushed successfully to `origin/redesign/memory-film`. This report is updated in a subsequent documentation commit.

GitHub's Vercel integration attempted deployment `dpl_8uGyFN8jpjswkGNb5SifpEY4Mwoa`, then reported failure. [Deployment details](https://vercel.com/infinityx2028/i/8uGyFN8jpjswkGNb5SifpEY4Mwoa). The available Vercel CLI session lacks authentication, preventing access to the build logs or an authenticated redeploy. The failure's underlying cause has not been established; local build success does not resolve that deployment failure.

Both `https://www.infinitycustomizations.com` and `https://i.infinitycustomizationz.com` returned HTTP 200 but served older assets. Neither served the expected `/assets/index-BOE6mDiW.js` and `/assets/index-DzjRqw5m.css`. The refinements are **not production-deployed**. Live mobile and desktop verification of these refinements therefore remains incomplete. Local production-bundle mobile and desktop checks passed.

An authenticated Vercel project owner must inspect this failed deployment and deploy the branch to the existing project. After deployment, run `node qa/verify-deployment.cjs 0a32221` and verify the live mobile and desktop experience. The local development server is running at `http://localhost:5173` (HTTP 200 checked after push); the tested production bundle is available at `http://127.0.0.1:4173`.
