# REVIEW — owners' deck (pitch/index.html) — verdict: FIX

Owner feedback (Hisham, 2026-10-25), turned into fixes. Apply these and nothing else; then re-run the checker.

## 1. Deck feels broken at the end ("we stop at slide 19, some slides are missing")
The closing slide is 19 but the deck has 23 (Backup divider + 3 appendix slides after the close), so the
counter and overview show slides you never reach in the talk. **Remove the Backup section entirely.**
Fold its content where it belongs (see §2). The closing slide must be the last slide; counter = total.

## 2. Too much repetition — make it short and clear (target 12 slides, ~10 min)
Repeats to remove: "one lesson … four ways" (slides 4, 8, 10, 19), "same lesson, same shell" section (10),
agenda that restates the title (2), cost + timeline + ask spread over 3 slides. New order:
1. **Title** — نَوْرَس Nawras + one-line promise ("Five decisions in ten minutes").
2. **Problem + idea** (merge 3 + 4): Fusha has only our hours → one lesson reaches the child four ways.
3. **Name & Noori** (5) — add the 4 alternate names as one small line (from old backup "names").
4. **Logo switcher** — NEW interactive slide (see §3). Replaces 6.
5. **Theme switcher** — NEW interactive slide (see §3). Replaces 7.
6. **One lesson, three ways** (8) — three cards linking to ../lessons/article.html, story.html, presentation.html.
7. **Writing pad** (9) — keep, shorter text.
8. **The book** (merge 11 + 12 + old backup "lulu" + "voices"): 32 pages, QR, audio in two voices, and
   **PDF buttons** (see §4).
9. **Adab + what it is not** (merge 13 + 15): rules on one side, the fence on the other.
10. **How it scales** (14) — the five steps, one line each.
11. **Cost, timeline & the five decisions** (merge 16 + 17 + 18) — fill-in lines kept.
12. **Close** (19).
One idea per slide, ≤ 5 short lines, no sentence repeated across slides. Speaker notes and both narration
scripts shortened to match (≈ 45–60 s per slide).

## 3. Interactive switchers, inside the slides (data-demo, no navigation needed)
- **Theme slide:** an iframe of a live mockup (default ../mockups/02-pacific.html) with two rows of buttons:
  *Layout* (the 6 mockups) and *Theme* (andalus, pacific, fanous, kurrasa, mosaic, mihrab). Layout = change
  iframe src; Theme = `iframe.contentWindow.postMessage({nawras:'theme', id}, '*')` AND append `?theme=id`
  to the src so it also works on reload (assets/kids.js supports both — being added by the art step; if it is
  not there yet when you test, the `?theme=` reload path must still work once it lands). Show the theme's
  Arabic + English name and one-line mood under the frame. Keyboard: buttons must not steal deck arrows.
- **Logo slide:** 6 buttons (thumbnails of ../logos/img/c1–c6.webp) → one big logo with the typeset «نَوْرَس»
  wordmark, its name AR+EN, one-line reason, small 32 px favicon preview, light/dark background toggle;
  "Recommended" badge on #1 (+ #6 as app icon). Link "All six on one page →" ../logos/index.html.

## 4. Links to the PDFs — view and print the book
On the book slide, buttons that open in a new tab:
- **See the book (PDF)** → ../book/print/noori-shell-lulu-interior.pdf
- **Cover (PDF)** → ../book/print/noori-shell-lulu-cover.pdf
- **Print at home (A5 booklet)** → ../book/print/noori-shell-home-a5.pdf
- **Worksheets** → ../book/print/noori-shell-worksheets-letter.pdf · A4 → …-a4.pdf
- **Web book** → ../book/books/noori-shell.html
Also add the same PDF links to the hub `index.html` lesson-book card, and to the web book
(`book/books/noori-shell.html`) as a small "Print / PDF" menu (don't touch the book's tools or spec).

## 5. Narration
Rewrite `pitch/audio/transcripts/pitch-en.json` and `pitch-eg.json` for the new 12 slides (ids = new
data-ids), short and spoken, Egyptian natural مصري, numbers in words, no Latin inside Arabic. Lint with
`--pair`. Do not generate audio.

## 6. Checks
check.mjs clean, --themes clean, --shots, --outline shows 12 slides ending on the close. Click every switcher
button in Playwright (theme changes inside the iframe, logo changes), and every PDF link resolves to a file.

---
# REVIEW 2 — 2026-10-25 — verdict: FIX (apply after the narration run finishes)
## 7. Show the main website in the pitch
Add one slide right after "idea" (slide 2): **"This is the Nawras website"** — the flagship homepage
(../mockups/02-pacific.html) shown large as a live, scrollable iframe in a browser-window frame (address bar
reading hisham-abuella.github.io/Madrasa), with an "Open the website ↗" button (new tab) and a "Book a free trial
class" callout pointing at the real CTA. Unlike the theme-switcher slide, this frame is scrollable
(pointer-events on) — so make sure arrow keys still advance the deck when focus is outside the frame, and add a
small hint "scroll inside · click outside to continue". Keep slide 5 (layout/theme switcher) as is.
Deck becomes 13 slides. Add a matching short script to pitch-en.json and pitch-eg.json (new id), lint --pair.
Do not regenerate other clips.
- Also: put the repo link (https://github.com/hisham-abuella/Madrasa, "private — ask Hisham for access") as a small reference line on the close slide next to the website link.
- Egyptian narration: the local voice can't say «أيقونة» (comes out «أيكونة» in every take). Reword it in
  pitch-eg.json on the **logo** and **ask** slides, e.g. «زي صورة الأبلكيشن على الموبايل» → better avoid ق:
  «زي الصورة الصغيرة اللي على شاشة الموبايل». Keep the English unchanged. Those two clips plus the new website
  slide get re-narrated afterwards (local, one at a time).
