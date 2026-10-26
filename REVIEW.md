# Release review: Nawras demo

**Reviewer:** release review subagent · **Date:** 2026-10-25 · **Against:** BRIEF.md (including the "Hosting UPDATE" and "Owners' deck: NO narration" lines added on 2026-10-25) and README.md
**Commit reviewed:** `a286e08` (main = origin/main). The working tree had one uncommitted file, `logos/source/gen-logos.sh`, because a logo round 2 was being drawn in Draw Things during the review. The pitch deck also changed mid-review: commit a286e08 removed its narration. Everything below was checked again on a286e08.

## Verdict: **PASS** (after the fixes in the Fix log below; originally FIX)

1 blocker · 8 major · 13 minor. The work is in good shape:
- No console errors and no failed requests (0 of each) across 69 page loads: 15 URLs × 1280 / 390 / 820×1180, plus 6 themes on the hub and on mockup 02, plus both artwork modes on 6 pages.
- No horizontal scroll, except the pitch deck on phones (item 6).
- All theme tokens pass contrast.
- Tashkeel is complete, and the ZWJ joins are correct.
- Writing pads work with touch at iPad size.
- Every book check passes.
- Audio QA is clean.
- Both decks pass the checker in every theme.

The one blocker is a brief requirement for the hub that has not been built.

---

## Fix list (by priority)

### Blocker

1. **`index.html`: the owners' deck is not shown as the main slide.** The brief (Hosting and privacy, and the Hosting UPDATE) says `index.html` must show the owners' deck as the **main slide**, with the deck's title slide as the hero card at the top of the hub. Right now the hero is the Noori/brand block, and the deck is only a small 4th card under «الْمَزِيدُ» at the bottom of the page.
   **Fix:** add a hero card straight under the topbar, linking to `pitch/index.html`. It should show the title slide: «نَوْرَس», "Nawras: Arabic for little hearts, by the Pacific", "Five decisions in ten minutes.", and the badge `pitch/img/hilal-badge.svg`. It can be a static screenshot (`pitch/img/title.png`), or a scaled iframe of `pitch/index.html?clean` with `pointer-events:none`, using the same scaling as the mockup previews. Add a clear button «افْتَحِ الْعَرْضَ · Open the presentation». The brand hero can sit next to it or below it.

### Major

2. **`lessons/story.html` and `lessons/presentation.html`: the writing station is not complete.** The brief requires every lesson to have three steps: trace ة → trace **هَذَا / هَذِهِ** → **write a short sentence under a picture**. The story pad (`data-model="ة|هَذِهِ"`, line 465) and the deck pad (`model:['ة','هَذِهِ']`) are missing هَذَا and the sentence step. Only `article.html` has all three.
   **Fix:** use `ة|هَذَا|هَذِهِ` (3 lines). Add a second station with a picture (for example `pic/fish` or the shell) and an empty line (`data-model=""`) captioned «اكْتُبْ: هَذِهِ …», as in article.html `#pad-sentence`. In the deck, put this station on the `write` slide or on a new slide.

3. **`lessons/story.html`: 10 of the 13 slides are read by the browser's speech engine.** Only slides 2–4 have `data-audio` (s1–s3). The rest call `speakText()` (`speechSynthesis`). On many devices that gives a robotic voice or no Arabic voice at all. The «مَصْرِي» toggle also reads Fusha text, because there are no Egyptian clips. The transcripts already exist (`audio/transcripts/story-{ar,eg}.json`, p01–p13), but the clips were never rendered.
   **Fix:** render the 13 + 13 clips with ElevenLabs (cloud, Sarah / Hisham clone, the settings in the brief) into `audio/story/{ar,eg}/pNN.mp3`. Set `data-audio` on every slide and point `narrate()` at that folder. Alternatively, reuse the matching book clips in `book/audio/{ar,eg}/`. Then run `qa-audio.py`.

4. **There is no 404 page.** The brief's pre-launch checklist asks for one. `https://hisham-abuella.github.io/Madrasa/<anything>` returns GitHub's default 404.
   **Fix:** add `/404.html` in the repo root with Noori, «هَذِهِ الصَّفْحَةُ غَيْرُ مَوْجُودَةٍ · This page flew away» and a link back to the hub. GitHub Pages serves 404 pages from the site root, so use absolute `/Madrasa/...` URLs for its CSS and links. Relative URLs break on deep 404s.

5. **The `og:image` is a relative URL on every page.** Examples: `assets/og-nawras.png`, `../assets/art/og/pacific.jpg`, `../images-noori-shell/cover.jpg`. WhatsApp, iMessage and Facebook do not resolve relative `og:image` URLs, so links sent to the owners will show no preview picture. `og:url` is also missing.
   **Fix:** use absolute URLs such as `https://hisham-abuella.github.io/Madrasa/assets/og-nawras.png`, and add `og:url`, `og:description` and `twitter:card=summary_large_image`. Also add og/favicon tags to `pitch/index.html` and `lessons/presentation.html`, which have neither.

6. **`pitch/index.html`: horizontal scroll on phones.** With mobile emulation at 390×844 (`isMobile`), the layout viewport grows to 1560 px. The page zooms out and scrolls sideways by 1170 px. `lessons/presentation.html` uses the same engine but is RTL, and it stays at 390. Hiding every child of `.deck` does not fix it; hiding `.deck` itself does. So the cause is the 1920 px transformed `.deck` box in an LTR document.
   **Fix:** add `html{overflow:hidden}` and give `.deck` a fixed wrapper, for example `.deck{position:fixed}` (or `body{position:fixed;inset:0;overflow:hidden}`). Check again with Playwright `isMobile:true`. Consider fixing it upstream in the present-in-html engine, because every LTR deck is affected.

7. **The repo is public, but the pages say "private".** `gh repo view` gives `visibility: PUBLIC`, and github.com/hisham-abuella/Madrasa returns 200 when not logged in. The BRIEF Hosting UPDATE, README.md (header and footer: "(private)") and the hub footer (`index.html`: "github.com/hisham-abuella/Madrasa (private)") all say private.
   **Fix (decision for Hisham):** either make the repo private, which needs GitHub Pro for Pages to stay up, or change the wording to "(public)" in README.md, index.html and BRIEF.md. The repo has no secrets (see the hygiene section).

8. **Kid-facing touch targets are below the brief's 56 px.** Measured at iPad 820×1180:
   - Writing-pad tools (3 pens, eraser, undo, clear, model, save) are **52×52** on every pad. Fix in `assets/kids.css` `.wp-pen, .wp-btn`: set min 56.
   - The «اِسْتَمِعْ — Listen» `[data-say]` button is **44×44** on mockups 01–06.
   - The book's page dots are **12×12** (16 for the current one) in `book/books/noori-shell.html`. Either make them ≥ 44 px hit areas with padding (the visual dot can stay small), or set `tabindex=-1` and `aria-hidden` and rely on the big prev/next buttons.
   - «اسْتَمِعْ إِلَى نُورِي» in `lessons/presentation.html` is 143×31 at iPad size and 68×15 on a phone.
   - The story/book Fusha/Egyptian toggle is 70×48.

   **Fix:** set min-height/min-width 56 px on these controls in kids.css and in the page styles.

9. **`index.html` links the deck as `pitch/`.** That works on Pages but opens a directory listing from `file://`, and the brief says every page must open from `file://`.
   **Fix:** use `href="pitch/index.html"` (and the same in the new hero card).

### Minor

10. **`book/books/noori-shell.html`:** the cover eyebrow «قِصَّةٌ عَنْ هَذَا وَهَذِهِ» is set in Baloo Bhaijaan 2. The lesson words هَذَا / هَذِهِ should be in Naskh (brief). Fix: put `font-family: var(--f-word)` on `.eyebrow .m, .eyebrow .f`, or on the whole eyebrow. Also «صَفَحَاتِ التَّمَارِين» is missing its final vowel (→ «التَّمَارِينِ»).
11. **`mockups/05-mosaic.html` "word of the day":** the Noori sticker overlaps the start of the English line "najma — star…" at 1280 px, in both art modes. Fix: give the English line `padding-inline-end` (or `margin-left` in RTL) equal to the sticker width, or move the sticker into the grid flow.
12. **RTL slide counters read backwards:** "22 / 1" in `lessons/presentation.html` and "١٣/١" in `story.html`. Fix: wrap the counter in `<bdi dir="ltr">` or `dir="ltr"`, or write it as «١ مِنْ ١٣».
13. **`lessons/presentation.html` writing slide:** the pad is only 337×127 px at iPad portrait. Fix: on the `write` slide, give the pad most of the slide's height (2 lines × ~220 px in slide units), or let the pad open full screen.
14. **Book writing pad (`#ex-ta`):** the dotted model ة is very faint and small, about 60 px on a 418 px pad. Fix: on single-letter trace pads, use a bigger model font (`LH*0.75`) and a stronger stroke alpha (0.75).
15. **`pitch/index.html`:** `<title>` says "Arabic for little hearts" but `<main data-title>` still says "Fusha for little hearts". Make them the same.
16. **`pitch/PLAN.md` line 6** still says the deck "plays by itself with narration in Hisham's voice". `pitch/audio/transcripts/pitch-{en,eg}.json` are now unused. Update the line and remove the files (or mark them as archive).
17. **`audio/samples/nawras-sample-{ar,eg}.mp3`** are not referenced anywhere. Remove them or link them.
18. **`logos/img/tries/`** (22 files, 14 MB) is tracked but no page uses it. Add it to `.gitignore` the way `assets/art/hi/tries/` is, then `git rm --cached` it. `.playwright-mcp/` is untracked; add it to `.gitignore` too.
19. **`guide.html`** shows the rejected seed `assets/art/guide/bint-611.webp` (Salma with bare legs) on the public site. It is correctly labelled "Rejected", but since the site is public, crop it or blur the legs.
20. **Missing parent CTA:** the hub, `book/books/noori-shell.html` and `logos/index.html` have no «احْجِزْ حِصَّةً تَجْرِيبِيَّةً · Book a free trial class». The brief says every page should lead to it. The hub is an owners' page, so it is optional there; add a small CTA to the book's last page («إِلَى اللِّقَاءِ») and to the footer.
21. **README.md:** it says "54 local generations" for the illustrated set; gen-art.sh has 53 `gen` lines plus the reused book art. Check the number. Once the logo round 2 that is running now lands, re-check the logo count, the recommendation and the contact sheet.
22. **Logos (deferred on purpose):** round 2 (`logos/source/gen-logos.sh`, uncommitted; output in `logos/img/v2/` and `logos/build/v2/`) was being generated during this review, so `logos/` was left until the end as asked. The logos reviewed here are the committed round 1. Re-review `logos/img/*` and `logos/index.html` after round 2 is chosen and committed.

---

## What was checked, with results

**1. Pages (Playwright, `~/.kp-tools`, served at `/Madrasa/`).**
- Console errors 0, page errors 0, failed requests / 404s 0, broken images 0, across all 69 loads.
- Horizontal scroll: 0 everywhere except pitch on phone (#6).
- All 6 themes on the hub and on mockup 02 render with no errors. `svg` and `ill` artwork modes were tested on the hub, mockups 02/05, story, article and the book.
- Lazy images and IntersectionObserver reveals load correctly with real scrolling. Every image reported `complete`, and all 6 hub iframes loaded.
- Screenshots and contact sheets are in `/private/tmp/claude-501/-Users-hishamabuella-Work-Arabic-school/d88abab3-a4d7-40f9-b268-0ee19b844ff0/scratchpad/shots/review/` and in the `shots/` folder one level up (`sheet_*.png`, `c_*.png`). Full-page shots taken after a scripted `scrollTo` show unrevealed cards and blank lazy images; that comes from the capture method, not from the site.

**2. Links.**
- I crawled every href/src in the 16 shipped HTML files. No broken internal links, and no root-absolute `/` paths. The 7 flags were all JS-built paths, and I checked their files exist: pitch `img/logo-*.webp`, story `../audio/samples/{ar,eg}/s1–s3.mp3`.
- Live URLs return 200: hub, pitch, web book, interior PDF, og image, repo, present-in-html.
- The hub links logos, the 3 lessons, the web book, all 5 PDFs, the guide and the pitch. The main-slide hero is missing (#1).

**3. Arabic.**
- The rendered visible Arabic is fully vocalised on every page. Bare words: article 1 (a lone ـة), deck 4 (blank-line underscores), guide 7 (deliberate unvocalised examples).
- The only unvocalised line in the book is the Egyptian caption «حِكاية عن هذا، وهذهِ», which is dialect, so that is acceptable.
- Forms checked: هَذَا ×124, هَذِهِ ×103, التَّاءُ / الْمَرْبُوطَةُ, مُعَلِّمٌ / مُعَلِّمَةٌ, بِنْتٌ, شَمْسٌ, أُمٌّ, الصَّدَفَةُ. All good.
- RTL is set on every kid page; the guide and pitch are LTR on purpose.
- No `letter-spacing` on any Arabic text node.
- Every coloured ة that is joined to a letter has ZWJ. The one span without ZWJ is the guide's deliberate "wrong" example.
- Words in the lessons are set in Noto Naskh (except #10).

**4. Images (contact sheets of `assets/art/{pic,story,noori,site,og,guide}`, `book/images-noori-shell`, `logos/img`, `pitch/img`).**
- Dress is modest: hair is fully covered under the scarves, and the girls wear white leggings.
- There is no text inside the generated images; the og cards use typeset text.
- No prophets, angels or Qur'an. "بِسْمِ اللَّهِ" appears only in a teacher's speaker note.
- Nothing scary.
- The 8-point star in logo c3 is correct (8 points, not a hexagram).
- Only the guide's labelled reject shows bare legs (#19).

**5. Contrast (`assets/kids.css`, WCAG).** In all 6 themes, the main text, brand text and accent text tokens pass ≥ 4.5:1 on bg, surface and surface2. on-brand/brand, the masc/fem/ta text tokens and good/bad pass too.
- Lowest: Mihrab on-brand/brand 5.0, Pacific on-brand/brand 5.1, Mihrab brand-text/bg 5.3.
- Highest: Fanous ink/bg 15.3.

**6. Writing pads.**
- Present in article (3), story (1), presentation (1), the web book exercise pages (11) and mockups 02/04.
- The canvas has `touch-action:none` and uses Pointer Events with pen pressure and palm rejection.
- I simulated finger drawing (CDP touch events) at 820×1180, DPR 2. Ink appeared on every pad, and «انْتَهَيْتُ» praised the drawing («عَمَلٌ رَائِعٌ!») with stars and confetti. On the article pad, the first tap with no ink gave the gentle «جَرِّبْ أَنْ تَكْتُبَ أَوَّلًا».
- Brief gaps: #2, #13, #14.

**7. Book (existing PDFs, nothing rebuilt).**
- `check-lulu.sh`: all passed. Interior 630×630 pt, **32 pages**, 16 images at 374–542 ppi, fonts embedded, no marks. Cover 1252.08×630 pt, spine 0.1321 in.
- `check-print-text.py`: interior 32 pp, A5 36 pp, worksheets Letter/A4 11 pp each, all clean.
- `check-qr.py`: 48 codes in 5 PDFs all decode to exactly `https://hisham-abuella.github.io/Madrasa/book/books/noori-shell.html` (+ `#page-key`), ≥ 25 mm, quiet zone kept. `book.config.json` has `urlConfirmed:true`, and there are no `-DRAFT` PDFs in `print/`.
- The rasterised interior shows **pages 18–28 white** (90–94 % white pixels, white edges). Story pages 3–16 are tinted.

**8. Audio (ffprobe / volumedetect, plus `~/Work/Elevenlabs-voice/qa-audio.py`, which is ffmpeg-only with no model).**
- Book ar/eg: 28 + 28 clips = transcripts, 0 problems.
- Samples ar/eg: 3 + 3 = transcripts, 0 problems. Mean levels −18 to −21.5 dB, none silent.
- Pitch: narration was removed by the owner's decision (BRIEF, 2026-10-25), so there is nothing to QA. The 2 kept book clips in `pitch/audio/clips/` are healthy (−18/−19 dB).
- The story lesson has transcripts but no clips (#3).

**9. Decks.**
- `check.mjs --themes`: `lessons/presentation.html` 22 slides, 0 issues × 7 themes; `pitch/index.html` 13 slides, 0 issues × 7 themes.
- Pitch audience fit: 13 slides with a promise ("Five decisions in ten minutes") and a close. The English notes are about 1,130 words, roughly 8 minutes at 140 wpm, which fits 10 minutes. It has an ask slide with 5 decisions. Fusha is now named only in the brand / school name, as the new brief line asks.

**10. Repo hygiene.**
- `.gitignore` is sensible (#18 adds to it).
- No secrets: grep for sk-/ghp_/AKIA/api-key patterns found nothing.
- Largest tracked file < 20 MB; `.git` is 174 MB.
- `main` = `origin/main` (a286e08). Only `logos/source/gen-logos.sh` is modified (round 2 in progress).
- README: 6 mockups, 6 logos, 32-page book, 11 exercises and 13 slides all match. The narration line is already updated. Wording issues: #7, #21.

**11. Checklist.**
- Skip link, favicon, og:image (relative, #5), landmarks (main/header/nav/footer) and alt text in AR + EN are on every site page. The decks are exempt from the skip link; they have no favicon/og (#5).
- 404 page: missing (#4).
- "Placeholder" is marked on every mockup (7–9 per page) and in the hub footer.
- The parent CTA is on every mockup and lesson (#20 covers the rest).

---

## Fix log (2026-10-25, fix pass; nothing committed)

Owner decisions applied on top of this review: the repo stays **public**; the story narration is now recorded (ElevenLabs clips were provided, none generated here); the owners' deck keeps **no narration**; the v2 generated logo is the site logo and favicon on every page; the hub and deck use the generated art.

| # | Item | Status |
|---|---|---|
| 1 | Owners' deck as the main slide | **Fixed.** New hero card straight under the hub top bar: a screenshot of the deck's title slide (`pitch/img/title-1280.webp`, from `title.png`), a Noori sticker, and «افْتَحِ الْعَرْضَ · Watch the presentation» → `pitch/index.html`. Also added a «الْعَرْضُ» link in the top bar. The brand hero now sits below it. |
| 2 | Writing station incomplete (story, presentation) | **Fixed.** Story slide 11: pad `ة\|هَذَا\|هَذِهِ` (3 lines), then a fish picture, the caption «اكْتُبْ: هَذِهِ …», and an empty one-line pad. Presentation (via `build.py`/`deck.js`/`deck.css` + `run.sh`): the `write` slide now has 3 model lines, and a new `write-sentence` slide has a picture and an empty line. 23 slides, 0 issues. |
| 3 | Story uses speechSynthesis | **Fixed.** All 13 slides play `audio/story/{ar,eg}/p01–p13.mp3`, with the فُصْحَى / مَصْرِي toggle. `KS.speak` is used only if a clip fails to load. Checked: 13 ar + 1 eg clips returned 200 and speechSynthesis was called 0 times. No audio was generated. |
| 4 | No 404 page | **Fixed.** `/404.html` in the Pacific style: Noori flying, «هَذِهِ الصَّفْحَةُ غَيْرُ مَوْجُودَةٍ · This page flew away», links to the hub and the deck. It uses root-absolute `/Madrasa/…` URLs. |
| 5 | Relative og:image | **Fixed.** Absolute `https://hisham-abuella.github.io/Madrasa/…` og:image, plus og:url, og:description, og:type and twitter:card, on every page. The book got them via `story-template.html` + `build-book.sh`, the presentation via `build.py`, and the pitch via `_base.html` (its og image is `pitch/img/title.png`). |
| 6 | Pitch scrolls sideways on phones | **Fixed** in `pitch/build/build.py` CSS: `@media screen{html{overflow:hidden}.deck{position:fixed}}`. At 390×844 with isMobile, scrollWidth went from 1560 to 390. Not fixed upstream in the engine. |
| 7 | "private" wording | **Fixed (owner: stays public).** Changed to "(public)" in the README (header link, footer), the hub footer, the deck close slide (`build.py`, rebuilt) and `pitch/PLAN.md`. Added a dated line to the BRIEF Hosting UPDATE; history kept. |
| 8 | Touch targets < 56 px | **Fixed.** Pad tools 52 → 56 (kids.css). Inline mockup listen buttons: `.say--sm` keeps the 44 px look with a 58 px hit area. Story and book voice toggles 48/44 → 56. Book prev/next 52 → 56. Presentation: «اسْتَمِعْ» gets an invisible hit area scaled by 1/stage-scale (90 px tall at iPad), and the pad tools scale the same way (56 CSS px at 820 and 1280). Book page dots are now a visual progress bar only (`aria-hidden`, `tabindex=-1`, no pointer events); the 56 px prev/next buttons handle navigation. 29 dots at 56 px would not fit the bar. On phones the presentation pad tools are capped (scale cap 2.6); the deck is for the classroom TV or an iPad. |
| 9 | `pitch/` link breaks on file:// | **Fixed.** Every link is now `pitch/index.html`, including the hero and the README presentation link. No directory-style relative links remain. |
| 10 | Book eyebrow font / التَّمَارِين vowel | **Fixed** eyebrow → Naskh (`--word`) in the template, and the book was rebuilt. The vowel was **already correct**: every instance in the spec and the HTML is «التَّمَارِينِ». |
| 11 | Mockup 05 sticker overlap | **Fixed.** The English line is LTR, so `padding-inline-end` had padded the wrong side. It is now `padding-left:120px` (0 on small screens). |
| 12 | RTL counters backwards | **Fixed.** Story: «١ مِنْ ١٣». Presentation: the control-bar counter and the footer number are isolated LTR ("1 / 23"). |
| 13 | Presentation pad too small | **Fixed.** Text column 4/12 and pad 8/12. The line height is set in slide units (3 × 200, 1 × 300), and the stage height now follows the scale. At 820 the pad is 461×256, up from 337×127. |
| 14 | Faint single-letter model | **Fixed** in `KS.writePad`: a 1–2 letter model uses LH×0.75, stroke alpha 0.75 / 2.2 px and fill 0.16. |
| 15 | Pitch title mismatch | **Fixed.** `data-title` is now "Arabic for little hearts". |
| 16 | PLAN.md narration line / unused transcripts | **Fixed.** Updated PLAN.md line 6 (and the close row, now "public"). Removed `pitch/audio/transcripts/` (it is in git history). |
| 17 | Unused `nawras-sample-*.mp3` | **Fixed.** Removed. `audio/samples/{ar,eg}/s1–s3` are kept because the classroom deck still uses them. |
| 18 | `logos/img/tries/`, `.playwright-mcp/` | **Fixed.** Both added to `.gitignore`, and `git rm -r --cached logos/img/tries` is staged (the files stay on disk). |
| 19 | Rejected bare-legs image in the guide | **Fixed.** The legs in `assets/art/guide/bint-611.webp` are blurred (PIL, no model), and the alt says "(blurred here)". |
| 20 | Parent CTA missing | **Fixed.** Added «اِحْجِزْ حِصَّةً تَجْرِيبِيَّةً · Book a free trial class» to the hub footer, the logos footer and the web book footer bar (template). The web book has no «إِلَى اللِّقَاءِ» page (`web:false`), so the footer carries it. |
| 21 | README counts | **Fixed.** 54 → 53 local generations (53 `gen` lines in gen-art.sh). The logo count (6) and the recommendation (#1 + #6) match round 2. The README header logo is now `logos/img/v2/c1-m.webp`. |
| 22 | Logos re-review | **Quick look done.** `logos/index.html` shows the round-2 v2 emblems (main, dark, small, one colour) with the c1 + c6 recommendation, the favicon is the c6 mark, and there were no errors. No deeper re-review of the art. |

**Extra items (owner, via coordinator):**
- Logo + favicon on every page. The favicon is the c6 small mark (`assets/favicon-32.png`, `assets/apple-touch-icon.png`) and replaces `favicon.svg`. The top-bar logo is the c1 v2 main emblem (`assets/brand/logo-c1-128.webp`, class `.logo-mark`). Done on the hub, mockups 01–06, article, story (home button), guide, logos, the book (template), the presentation and the pitch (builds), and 404.
- Hub "Our pictures" strip: 10 generated pictures (Noori, story, word pictures, heroes, book pages), linking to guide.html.
- Deck: `pitch/build/shots.cjs` (run by `images.py`) re-took looks-montage, lesson-article / story / slides, writing-pad and title in illustrated mode. The grow slide has a 6-picture grid captioned "73 pictures, made locally, every one checked by eye". The deck title badge is now the v2 c1 emblem (`img/logo-c1-v2.webp`), and the slide-6 copy and sources were updated (19 slides, story narration on all pages).

**Verification:**
- Playwright (`~/.kp-tools`), served at `/Madrasa/`: 15 pages × 1280 / 820×1180 (mobile) / 390×844 (mobile). That is 0 console errors, 0 failed requests, 0 broken images and 0 horizontal scroll, run twice: before and after the last edits.
- On file://, the hub hero opens `pitch/index.html` (13 slides, no errors).
- `check.mjs --themes`: pitch 13 slides, 0 issues × 7 themes; presentation 23 slides, 0 issues × 7 themes.
- Book: `check-lulu.sh` all passed; `check-qr.py` every QR is exact. The print PDFs were not rebuilt or changed.
- Story clips: 26 files, 4–14 s each (ffprobe).
