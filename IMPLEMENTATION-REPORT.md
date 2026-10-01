# Infinity memory film rebuild

Implemented in the selected workspace on `redesign/memory-film`, based on GitHub `main` at `f20b44c`. The selected workspace was initially empty; this is a Git worktree of the existing Infinity repository.

## Experience

- Replaced the homepage composition with an ivory editorial canvas, large Manrope typography, emotional serif phrases, and a physical memory frame.
- One persistent DOM object follows measured scene anchors. The same photograph moves through frame, polaroid stack, magazine cover and the closing keepsake; the gift finder can change its presentation to a recommended product type.
- The photograph is cropped from Infinity's existing white-frame product image, with the original retained. The mobile AVIF is approximately 20 KB; WebP fallback and larger desktop variants are included.
- Live-catalog category universe and mobile swipe rail; calm product discovery with real prices and product routes; camera-roll story; gifting by occasion; Infinity Difference; WhatsApp ordering explanation; factual founder story; final CTA.
- Reworked the footer into navy with mobile accordions. Navigation, search, account links and bag retain their existing behavior. Removed the old intro overlay and artificial 800 ms navigation delay.
- Quick view is now a mobile bottom sheet above navigation. Account has an overview and exposes rewards only when the user profile contains a numeric balance. Existing orders, addresses, profile, security, preferences and support remain available.
- Signed-in saved gifts now use the existing authorized wishlist API. Anonymous gifts stay in browser storage. Save failures are visible and never pretend to succeed.

## Catalog and commerce integrity

The read-only live catalog audit found 53 products and 122 image references, all covered by the existing responsive image manifest. No products, IDs, prices, backend files, policies, payment calculations, database records or administrative routes were changed. No photo upload was added. Checkout and payment remain the existing implementation; no test purchase or payment was submitted.

Infinity AI no longer substitutes the static product list for an unavailable catalog or relaxes a customer's budget. Both server recommendations and the client ranking engine are checked against real catalog identity, availability and price bounds. Empty results remain empty. Occasion buttons fill the concierge prompt; refinement buttons use the actual engine keys. Urgency is extracted without promising delivery.

## Verification

- Production build: passed (`npm run build`).
- Browser checks on development and the compiled production bundle: passed, with no runtime errors.
- No horizontal overflow at 320, 360, 375, 390, 393, 412, 430, 768, 1024, 1280, 1366, 1440, 1728, 1920 and 2560 px. Mobile hero: 550 px.
- Screenshots of homepage scenes, footer, login, signup, account, mobile navigation and quick view at 390×844 and 1440×900 are in `qa/local/`. The production-bundle run overwrote the development screenshots.
- Tested one persistent object, pointer tilt, reduced motion, real gift recommendations within ₹800, anonymous wishlist toggle, invalid-category handling and quick-view fit.
- Authenticated account and wishlist checks used an isolated browser-only fixture. These validate the frontend and request contract, not a real signed-in production session. Fixture screenshots are explicitly named `account-fixture`.
- Deterministic catalog tests passed for intent extraction, empty catalogs, inactive/unavailable products, real product identity and strict budget ranges.
- Repository-wide lint still reports inherited errors. Comparison by file, rule and message against the original repository found no new lint errors from this change. Build output retains an existing large-main-chunk warning.

## Deployment status

Implementation commit `fcf4dcf` was pushed to GitHub on `redesign/memory-film`. GitHub's Vercel integration started a preview deployment. The machine's Vercel CLI is logged out. The existing GitHub `main` commit already reports a failed Vercel deployment. The custom domains currently serve different older bundles; this rebuild is **not production-deployed**.

Prepared production files are in `frontend/dist`. Existing Vercel configuration and API proxy remain intact. Deploy this branch to the existing Vercel project through an authenticated project owner, then verify that the custom domain serves the generated JS/CSS filenames. Do not treat a Git push as deployment verification.

Reproducible commands from the repository root:

```powershell
cd frontend
npm.cmd ci
npm.cmd run build
cd ..
node qa/catalog-checks.cjs
node qa/serve-build.cjs
# In another terminal:
node qa/browser.cjs http://127.0.0.1:4173
node qa/verify-deployment.cjs main
```

`qa/serve-build.cjs` is a local QA server. Its public API proxy permits reads and gift recommendations; other write requests are blocked. Production uses the existing Vercel proxy instead.
