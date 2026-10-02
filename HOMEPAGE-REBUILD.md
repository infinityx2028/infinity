# Infinity homepage V4

The homepage is rebuilt around one persistent layered CSS 3D memory frame. GSAP ScrollTrigger is the sole authority for object travel, with direct scroll updates, cached layout measurements and transform-only positioning. Desktop has pointer tilt, reflection response and magnetic buttons. Mobile uses reserved object space and a horizontal category carousel. Emotion and studio scenes hide the object; the final scene fades and shrinks it before the footer.

## Implemented experience

Opening photograph alignment, oversized editorial hero, Infinity AI, active categories, emotional typography, camera-roll separation, a physical magazine using the real magazine image, sequential real products with a traveling memory card, the five-step ordering journey, navy Infinity Difference, the founder story, final CTA and oversized footer wordmark. Separate responsive compositions keep the mobile layout compact. New scene classes avoid inheritance from the old homepage styles.

Catalog IDs, category IDs, displayed prices and product links come from the existing active catalog. AI resolves recommendations to that catalog and re-applies the query budget as a hard filter. The existing configured WhatsApp URL is used. The journey instructs customers to send photos after confirmation; no upload flow was added.

## Build and maintenance

- npm ci: passed.
- npm run build: passed; motion and framework chunks are split. Main JS is about 476 kB before compression and 128 kB gzip. GSAP loads through the homepage director import.
- npm run lint -- --max-warnings 0: passed.
- npm run typecheck: passed for the strict TypeScript motion director.
- git diff --check: passed.

Inherited lint failures were repaired without disabling rules. Context hooks moved into shared modules. Selector prices are derived from the same formulas instead of duplicated state. Existing Polaroid minimums, increments and prices and apparel discount tiers remain unchanged. Product identity keys reset selector defaults when changing products. Cart hydration now reads storage in its state initializer. The previously undefined fridgeMagnetUnitPrice in direct checkout now uses the exact existing Add to Bag formula. Authentication strategy, payment formulas, backend endpoints, orders, customer data and database schema remain unchanged.

## Verification artifacts

Run node qa/serve-build.cjs and node qa/v4.cjs from the repository root. This tests the production build against public catalog reads and the existing gift-assistant endpoint. Commerce tests use only disposable browser localStorage; they do not place orders, make payments or modify customer records.

49 browser checks pass with no runtime exceptions. The final scene is verified at full size, during its exit and after reversing scroll. Measured desktop headless Chrome scroll performance was 59.74 fps with a 16.9 ms 95th percentile frame interval.

QA covers all requested widths from 320 through 2560, mobile first-fold geometry, one physical frame, scene visibility, magazine transformation, direct scroll response, reduced motion, AI budget filtering, menu/search and commerce routes. It also checks Polaroid quantity changes, cart persistence and apparel discounts. Screenshots include every principal scene at 390x844 and 1440x900, the product forms, AI results, menu, search and a temporary grid overlay. Debug overlays are injected only by the QA script and removed immediately.

Local screenshots and the machine-readable report are in qa/v4-local/ (ignored generated artifacts). The scroll timing measurement is headless Chrome on this development machine, not a mobile hardware benchmark.

## Production acceptance

Production is not accepted merely because source is pushed. Run node qa/verify-production.cjs to compare the exact built asset paths with both custom domains and inspect the public GitHub Vercel status. Then run node qa/v4.cjs https://www.infinitycustomizations.com for live screenshot and interaction checks. A previous homepage on the domain is explicitly recorded as a failure, with live captures clearly labeled previous-live.

Production verification is pending the source push and Vercel deployment. The previous production commit was marked failed. Vercel's deployment API currently returns HTTP 403 because this workspace has no Vercel authentication; authenticated build logs may be needed if the new deployment also fails.
