# SIRIUS — DARK EDITORIAL / DESIGN.md

**Source priority:** 6 user-supplied PNGs at 1600 px width → SIRIUS_full_redesign_concept(1).html layout/CSS → verified existing SIRIUS content → this documented implementation. Not a new concept.

## Audit (completed before code changes)

### Existing architecture
- Repository: KROFN/sirius-test; default branch main; implementation source is draft PR #5 branch feat/sirius-dark-editorial-20261111.
- Static HTML + styles.css + script.js; no package.json, no React/Vite/Next, no Tailwind, no bundling, no backend.
- Keep architecture. Use semantic sections and functional browser JS. Do not add a framework merely for component naming.
- Original behavior includes nav anchors, WhatsApp, VK, sticky mobile contact and original VK catalog/service links; current PR #5 adds category filters and a WhatsApp form composer. Preserve these functions.
- Production/main are out of scope.

### Image inventory (original project, 11 unique photographed scenes)
| Family | Largest dimension | Content | Use / focal |
|---|---|---|---|
| hero-08 | 736×1104 | Model in black dress on metal chair, bright gray backdrop | hero; derivative transparent WebP from ORIGINAL photo, preserve face/body/chair |
| rental-07 | 736×1104 | Model posed on stool / light studio backdrop | service rental, crop toward scene to retain breathing room |
| calm-21 | 1125×1687 | Brown-clad model on studio white | service photo session; crop subject to right |
| movement-24 | 1200×1801 | Body pose and floor | Studio: real photographic evidence, NOT a photo of empty studio |
| editorial-25 | 1200×1801 | White blouse portrait, strong direction of shadow | Portfolio large left |
| portrait-23 | 1200×1801 | Close-up soft light and skin | Booking editorial / portfolio |
| dynamic-28 | 1200×1800 | Dynamic movement pose | Portfolio secondary |
| proof-10 | 1200×1801 | Monochrome portrait | Portfolio secondary |
| proof-14 | 1200×1801 | Dancer in motion | Portfolio secondary |
| proof-29 | 1200×1801 | Pink ballet costume | Portfolio |
| proof-30 | 1200×1801 | Monochrome ballet | Portfolio |

Actual filenames are assets/img/responsive/<family>-480, -800 and -1200 as available; hero/rental max 736; calm max 1125.
NO verified empty-studio panoramic shots, separate vanity/mirror, softbox photo, curtains, or real scene photos in project. DO NOT reconstruct fake interior and call it real.

### Source facts / uncertainty
- Rental: 900 ₽ / 30 min; 1 500 ₽ / 60 min (both original project and user confirmed).
- Original main branch HTML/service code: 'Фотосессия со штатным фотографом · 5 000 ₽ / 1 час'; user-provided visual reference: 6 000 ₽. Conflict unresolved => show 'Стоимость — по запросу' pending client confirmation.
- Contact in main source: +7 (952) 067-80-15; https://wa.me/79520678015; https://vk.me/siriusstudio; https://vk.com/siriusstudio. Treat as original-project data requiring owner confirmation before public launch.
- Address: Торжок, Красноармейская, 6, 2 этаж, кабинет №2. №2 is ROOM number, not count of rooms.
- Existing site offers makeup and gift certificates via VK; do not invent fees or new product categories.
- Original notes: белая циклорама, сменные локации, постоянный/импульсный свет, гримёрная зона. Hardware count/current location features not independently confirmed: do not assert count.
- Form: contact request in WhatsApp, NOT real booked slot. Provide accurate status + keyboard accessible fallback.
- External map: Yandex Maps address query, no invented road geometry.

## Measured visual design specification

### Canvas and type
- Viewport reference width **1600 px**. Reference heights: hero 901; services 1016; studio 901; portfolio 1011; booking 1033; contacts 1012.
- Single 72 px fixed/sticky global header (six screenshot headers are presentation repeats only), left logo at x≈72, centered nav, city and quiet outlined booking button right.
- Desktop shell horizontal padding **72 px**, content width ≈1456 px. At <=1024 reduce to 36 px, <=760 to 22 px.
- Font per original prototype: **Arial, Helvetica, sans-serif**. No serif and no Onest. Main display ≈90–96 px/0.96 line-height, tracking -5 to -6.8px, weight 300; individual titles tuned per reference.
- Tiny uppercase eyebrow 11 px with 7–8px tracking; restrained paragraph fonts 13–21 px.
- Source palette exact CSS tokens:
  --ink:#151513; --coal:#22201f; --sepia:#8a6c5d; --cream:#f1e3d8; --dim:#afa6a0; --line:rgba(243,226,212,.22); --accent:#e2a67d; --canvas:#141312; --cta-terracotta:#bd6647.
- Screenshot background sampling shows gradient from dark charcoal (#171819) upper-left to warm coffee tones (#3a2c27) upper-right; portfolio almost-black #141312.
- Small border radius 5–10px on buttons, form, cards; no loud background noise or neon gradients.
- Distinct section rhythm; do not normalize all to same padding or content heights.

### Section geometry and photography
1. **Hero** width1600;height≈900. Giant SIRIUS x≈100 y≈150, height≈220px and to x≈1135, behind real transparent model; model centroid approx x≈850, feet near y≈855; warm diagonal beam from upper-right to left-of-center floor; lower-left lead at x≈104 y≈425, button around y≈680; benefits x≈1340 y≈350; footer hints around y≈840. Use actual photo cutout and CSS light layers; the screenshot hero in supplied HTML is only a flattened image, NOT source DOM.
2. **Services** h≈1016. Eyebrow y≈128; title x≈72 y≈180 with right note x≈1280; 3 cards y≈489..928, x≈70 width 530, x≈620 width 530, x≈1170 width 322. CSS grid exactly 1.15fr 1.15fr .7fr; photo fills first two; absolutely-positioned over-image text at bottom; muted editorial third card.
3. **Studio** h≈901. Eyebrow x≈72 y≈135; 0.48fr/1fr left/right grid gap45; right photos y≈163..753 with 1.45fr/.65fr main/stack, three vertical subshots. Keep left empty space between title and bottom icon list. Real project has only portraits, so real image panels replace pictured fictitious studio room; explicitly label as example photos, never fake interior.
4. **Portfolio** h≈1011. Title x≈72 y≈170 and to x≈850; filter in upper right y≈325. Photo grid x≈70..1497, y≈374..925, rows 275px/275px gap13, cols 1.2fr .8fr .8fr 1fr. First and last may span two rows, middle positions 4 cells. Personal focal point per photo. Click opens dialog/lightbox with Esc, close, arrows, focus restoration.
5. **Booking** h≈1033. Header/title x≈72 y≈180, giant 90px/0.96. Content y≈367..930. Left photo ≈630×565, right form ≈720×565, grid 1fr 1.15fr; labels styled as subtle text in input outlines. Actual form has name, phone, type, date, comment with validation; submission continues via WhatsApp, not simulated success.
6. **Contacts** h≈1012. Left huge title x≈72 y≈210, rows x≈72 y≈550 onward; right real interactive Yandex map x≈682 y≈175 to x≈1498 y≈690, rather than decorative fake roads; bottom CTA terracotta #bd6647 x≈70 y≈790 width1428 height135. Phone/VK/WA from existing project.

### Responsive strategy
- 1440: preserve same horizontal composition and photo hierarchy, fluid heading size.
- 1024: header compacts, services secondaries stay legible, studio side 3 thumbnails compress.
- 768: service cards first/second 2 columns; editorial third expands across both or turns into horizontal rail. Studio main panel wraps intelligently.
- 390: single main narrative hierarchy, unique hero crop keeping giant lettering and woman, functional menu; no horizontal scroll, booking stacked; portfolio maintains asymmetric 2-col mosaic, controls minimum 44px.
- Picture srcset and sizes, each image aspect-ratio, loading=lazy below hero, focal object-position.
- Prefers-reduced-motion disables decorative transforms, filters, and smooth scroll.
- One header, continuous scroll (screenshots were separate pages).

### Validation
- Desktop section screenshots at viewport 1600, height as reference; save screenshots, inspect manually against each PNG. Lower-resolution actual asset limitations documented.
- Also smoke tests at 390,768,1024,1440; axe WCAG 2/2.1 A/AA, image loading, mobile menu, portfolio filter/lightbox, form integration.
- Never claim 1:1 if photographed inputs differ.

## Explicit visual deviations permitted only because of real data
- Reference studio images are unverified synthetic interiors, NOT assets in repo => use real photography with materially different subject. Needs true studio photos to match reference.
- Reference portrait images repeat the same AI model in multiple generated poses => map real project gallery, not synthetic portfolio.
- Reference hero beam contains physical shadow from AI render; CSS compositing + original real cutout can approach but cannot reproduce exact actual scene without dedicated real photograph on set.
- Reference says 6 000 ₽ photo shoot; source says 5 000 ₽ => show request-only until verified.
- Reference schematic map must become live map / validated destination link; map appearance necessarily differs.
