# frontend-engineer — Team review 2 (2026-10-26)

**Verdict: PASS with small fixes.** Everything REVIEW.md fixed is still fixed. The numbers, from Playwright `~/.kp-tools` served at `/Madrasa/`:
- **Page sweep:** 15 pages plus a deep 404 URL, each at 1280 / 820×1180 mobile / 390×844 mobile (48 loads). Results: 0 console errors, 0 page errors, 0 failed requests, 0 broken images, 0 horizontal scroll (the pitch at 390 stays at 390, so #6 holds). The only console line is the deep-404's own 404 status.
- **file://:** 9 key pages, 0 errors. The hub hero opens `pitch/index.html` (13 slides), so #9 holds.
- **Links:** I crawled every href/src in 15 pages. 0 broken; the 7 hits in `logos/index.html` are JS string templates. There are 0 root-absolute paths outside `404.html` and 0 directory links.
- **Social tags:** all 15 pages have an absolute `og:image` plus `og:url` (#5 holds).
- **Decks:** `check.mjs --themes` gives presentation 23 slides and pitch 13 slides, 0 issues × 7 themes.

| id | sev | file:line | evidence | fix | effort |
|---|---|---|---|---|---|
| FE-01 | major | `assets/kids.css:492` `.btn .en { color: inherit }` (specificity 0,2,0) loses to page rules `index.html:76`, `404.html:28`, `mockups/05-mosaic.html:82`; `mockups/01-andalus.html:93` `.parents a` overrides `.btn` itself | The parent CTA English (or the whole button) fails contrast: 1.35–3.81 on the hub across 6 themes, 1.96 on Andalus, 1.58 on Mosaic (ui-designer UI-01..04). | kids.css: `.btn.btn .en { color: inherit; }`. Andalus: `.parents a:not(.btn)`. Delete mosaic line 82. Then re-run the contrast scan. | S |
| FE-02 | major | `assets/kids.js:284-300` `speak()` | It returns silently when there is no `speechSynthesis` or no Arabic voice. Article (19 cards + quiz) and the mockups have no clip fallback (motion-and-sound MS-01). | Clip-first: when `audio/words/<key>.mp3` exists (`data-audio` or a name map), play it with `new Audio()`, and use `speechSynthesis` only as the fallback. Always toggle `.is-speaking`, so a tap gives visible feedback even with no voice. | M |
| FE-03 | minor | `pitch/img/*.png` (made by `pitch/build/shots.cjs` / `images.py`) | The deck weighs 4.7 MB on a phone: `lesson-article.png` 1253 KB, `book-pages.png` 600 KB, `lesson-story.png` 331 KB, `writing-pad.png` 315 KB. The owners will likely open it from a WhatsApp link. | Write WebP (q 80) in `images.py`, point `build.py` at the `.webp` files, and rebuild plus `check.mjs`. That saves about 2 MB. | S |
| FE-04 | minor | `index.html` six mockup `<iframe loading="lazy">` | The hub is 139 requests / 4.97 MB at 390 px. It is lazy, but each iframe loads a full mockup with its art. | On phones (`max-width:700px`), show the existing `assets/art/og/<theme>.jpg` card as an `<img>` and keep the iframe for wide screens. | S |
| FE-05 | minor | `kids.css` floating theme/mute buttons | They cover the last lines at 390 px (guide, 404). | `body { padding-bottom: 88px; }` (or `scroll-padding-bottom`). | S |
| FE-06 | minor | `lessons/article.html` picture cards | 19 buttons all named «اِسْتَمِعْ — Listen». A screen reader cannot tell them apart (accessibility-auditor A11Y-03). | Build the label from the word in the auto-wiring: `aria-label="اِسْتَمِعْ: قِطَّةٌ — Listen: cat"`. | S |
| FE-07 | minor | `index.html` lesson-book file links | They are 27 px tall (kids-ux KUX-02). | Use the `.chip` style with `min-height:44px`. | S |

**Re-verified:** #4 404 (a deep URL serves Noori with root-absolute `/Madrasa/` assets, 0 broken), #6, #8, #9, #12, #13 (pad 461×256 at 820 still holds visually), #14, #15.

## Top 3 suggestions for what to build next
1. **A one-command release sweep** (`tools/sweep.cjs`, outside the site): the Playwright loop from this review (errors, 404s, scroll, sub-56 px targets, rendered-contrast scan, autoplay hook, reduced motion). It prints one table, so every future fix pass can quote before/after numbers.
2. **Clip-first `KS.speak`** (FE-02): a small change in the shared system that upgrades every listen button the day the word clips land.
3. **Hub card for the next topic book** via the topic-book skill. The template, QR and print pipeline are already generalised (`f9f44af`).
