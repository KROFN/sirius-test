# SIRIUS DARK EDITORIAL — implementation, validation and deviations
Date: 2026-11-11. Draft PR #5, not production.

## Architecture / source
The approved six PNG screenshots (1600 px wide) and original SIRIUS_full_redesign_concept(1).html define the visual baseline. DESIGN.md contains full audit. Existing repository is static index.html + styles.css + script.js, without package.json or React. Preserve original architecture, main/production untouched.

## By section (Chromium 1600 px, actual screenshots in docs/review)
1. Hero (900px) — large Arial SIRIUS behind real cutout from original photo, warm diagonal light, main text/CTA left, 3 benefits right, footer hint. Actual physical wall and floor shadows from reference cannot be reconstructed 1:1 without a new REAL shot; masked real model with CSS light is an approximation.
2. Services (1016px) — reference grid 1.15fr / 1.15fr / .7fr restored. Three equal-height cards, two images with text OVER photo; 3rd quiet editorial panel. Reference softbox/empty room photo absent; project images show models. Rental 900 ₽ / 30min and 1500 ₽ / 60min. Shoot price omitted because original code says 5000 ₽ and supplied visual shows 6000 ₽.
3. Studio (900px) — left/right .48fr / 1fr; right main/3 thumbnails with 1.45fr / .65fr. All photos from actual repo portfolio, labeled as shoot examples, NOT representations of the room. Need real verified studio photos; largest fidelity difference.
4. Portfolio (1011px) — four columns 1.2/.8/.8/1; two rows 275px; gap13; original project photos with subject-specific focal points. Functional filters and native lightbox, keyboard prev/next, Esc close, focus restoration.
5. Booking (1033px) — original picture/form 1fr / 1.15fr, actual HTML form (name, phone, format, preferred date, comment). Native + digit-count validation; composes WhatsApp message via verified original number, provides fallback link and alternative VK; does not claim booking confirmed or pretend to have a backend.
6. Contacts (1012px) — two columns .8/1.2, real Yandex Maps embed with address-search, exact address and existing WhatsApp + phone, terracotta #bd6647 final CTA. Real map necessarily differs from fictional road illustration.

## Original business data, unresolved
- Rental: 900 ₽/30 minutes, 1500 ₽/60 minutes.
- Original main code has photography with photographer 5000 ₽/hour; approved mockup displays 6000 ₽. Until client confirms the current price, UI says "Стоимость уточняйте".
- Address: Торжок, Красноармейская, 6, 2 этаж, кабинет №2. №2 is NOT two rooms.
- Source contact: +7 (952) 067-80-15, wa.me/79520678015, vk.me/siriusstudio. Reconfirm before launch.
- Original project mentions white cyclorama, changing locations and studio lighting but no currently verified separate photography of the room. No AI interior as real photograph.

## Validation
- Chromium Playwright fidelity-smoke.cjs: 52/52 passes at widths 320,360,390,768,1024,1440,1600px.
- 1600px exact rendered section heights: 900,1016,900,1011,1033,1012.
- No horizontal overflow or JS exceptions; all images decoded; one global header, one h1 and six DOM sections.
- Tested three service cards, four-column mosaic, filtering, lightbox open/arrow/Esc/focus, phone validation, WhatsApp message and fallback, mobile menu/Esc.
- axe-core WCAG2/2.1 A/AA automated checks: zero violations at 390 and 1600px. This is NOT full manual accessibility certification.
- Real Chromium screenshots saved for each section and mobile hero in docs/review, no 1:1 photometric claim.
- No fake booking confirmation, no messages sent, no production change.
- No Lighthouse score; performance design uses lean CSS/JS, responsive JPEGs, WebP alpha, lazy loading below hero. Manual device performance remains unverified.

## Required before release
Obtain and approve real empty-studio hero/detail photos (see docs/ASSET_BRIEF.md), confirm photography price, phone and equipment/current decorations; physically test iPhone/Android and external bookings. Review preview before merging into main.

Run locally: python3 -m http.server 8080
Visual: PLAYWRIGHT_MODULE=/path/to/playwright-core CHROMIUM_PATH=/path/to/chrome node tests/fidelity-shots.cjs
Smoke: PLAYWRIGHT_MODULE=/path/to/playwright-core CHROMIUM_PATH=/path/to/chrome node tests/fidelity-smoke.cjs
Axe requires local .audit-deps/node_modules/axe-core (not committed).

Release status: NOT APPROVED / draft PR only.
