# kids-ux-designer — Team review 2 (2026-10-26)

**Verdict: PASS for children, FIX for parents (small).** I re-measured every REVIEW.md #8 target after the reveals had finished; all are still fixed:
- Pad tools: 56×56.
- Mockup «اِسْتَمِعْ» `.say--sm`: 44 px visual with a 58 px `::after` hit area.
- Voice toggles: 56 px tall.
- Book prev/next: 56 px.
- Deck listen buttons: a scaled invisible hit area, 131 px tall at 820 and 146 px at 390.

The article quiz shuffles its options (`kids.js:909`), locks the answer, and always shows the explanation. Nothing autoplays on any of 15 pages (I hooked `play()`, `speechSynthesis.speak` and AudioContext before load). The only third-party hosts are `fonts.googleapis.com` and `fonts.gstatic.com`. localStorage is empty after load. The book QR deep link `noori-shell.html#ex-ta` opens straight on exercise 1 (`ux_book_exta.png`).

The problems are on the parent side: the one action does not read on two mockups, and the parent links are small.

| id | sev | file + location | evidence | fix | effort |
|---|---|---|---|---|---|
| KUX-01 | major | `mockups/01-andalus.html` parents' CTA; `mockups/05-mosaic.html` `.t-cta`; hub hero button | The parent's one action is hard to read: Andalus is white on gold at 1.96:1, the Mosaic English line is 1.58:1, and the hub "Watch the presentation" is 1.35–3.81:1 (see `ui-designer` UI-01..03, `sheet_ctas.png`). | Apply the UI-01..03 CSS fixes. Then check that the CTA reads at arm's length on a phone. | S |
| KUX-02 | minor | `index.html` lesson-book file links («See the book (PDF)», «Cover (PDF)», «Worksheets (Letter)», …) | Hit areas are 27 px tall at 820 and 390. The project rule is ≥ 44 px for parent controls. | Give them `display:inline-flex; min-height:44px; padding:0 10px` (chips), like the lesson chips beside them (43 → 44). | S |
| KUX-03 | minor | footer links on all mockups («all mockups» 66×15), article «demo hub» 42×17, hub repo link 195×21 | These are parent-only, but tiny on a phone. | `min-height:44px; display:inline-flex; align-items:center` on footer links. | S |
| KUX-04 | minor | every CTA `href="mailto:hello@nawras.example?subject=Free%20trial%20class"` | On an iPad or phone with no Mail account, tapping it does nothing, which is a dead end for the parent. It is a placeholder, but a dead tap still gives the owners a bad impression in the demo. | Add a second placeholder line under the button: «أَوْ اتَّصِلُوا · or call/text (619) 555-0142 *placeholder*» as a `tel:` link. Later, a parent-only form (see suggestion 1). | S |
| KUX-05 | minor | floating theme + mute buttons, at 390 px | They cover the last lines of content on long pages (guide, 404 footer). A child can mis-tap them while scrolling to the end. | `body { padding-bottom: 88px }` (same as UI-05). | S |
| KUX-06 | minor | `book/books/noori-shell.html` top bar at 390/820: «English», «تَقْلِيبٌ تِلْقَائِيٌّ», «Print / PDF», «مِلْءُ الشَّاشَةِ» = 44 px | These are within the parent rule, but «English» and «auto-flip» sit next to the 56 px child voice toggle and are easy to hit by mistake. | Leave them at 44, but group the grown-up controls under the existing «Print / PDF» style `<details>` («لِلْكِبَارِ · Grown-ups»). | M |

**Not tested:** a real Apple Pencil, Switch Control, and a real child. Writing pads were exercised with touch emulation only, in the earlier review.

## Top 3 suggestions for what to build next
1. **A real "Book a free trial" page** (`trial.html`): one short parent-only form (parent name, phone or email, child's age, preferred Saturday). It has no child data and states the privacy line plainly. Until the owners pick a backend it opens a pre-filled email/WhatsApp. Every CTA points to it.
2. **A pre-reader start screen** (`kids.html`): three huge picture buttons (story · book · write) with Noori saying the choice aloud on tap. A five-year-old can start a lesson without reading a word.
3. **A "next lesson" end card** on the story, book and article: big Noori, «أَحْسَنْتَ!», one button to the next activity and one back to the hub. Today the story ends on a slide and the child has to find the way out.
