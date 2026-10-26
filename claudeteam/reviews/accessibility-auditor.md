# accessibility-auditor — Team review 2 (2026-10-26)

**Verdict: FIX.** Two AA failures, both on parent-facing text, plus one screen-reader issue that runs through every Arabic page.

Method:
- Token contrast for 6 themes × 20 pairs, computed from `assets/kids.css`.
- A rendered-text contrast scan of every page (Playwright, 1280 px, plus theme overrides).
- Tab-through of 6 pages with a `:focus-visible` check.
- Hit areas measured at 820×1180 and 390×844 (mobile emulation, after reveals finished).
- `prefers-reduced-motion: reduce` emulation on 15 pages.
- A lang/alt/heading audit via the DOM.

Baselines that still hold:
- All text token pairs are ≥ 4.5:1 in all 6 themes (tightest: Mihrab on-brand/brand 4.99).
- 0 focusables without a visible ring. Fanous draws its ring on `.lamp-card .body`, which is OK.
- 0 running animations under reduced motion.
- All child targets are ≥ 56 px. The REVIEW #8 fixes hold; `.say--sm` has a 58 px `::after` hit area.
- Hub iframes are `tabindex=-1 aria-hidden`.
- Book progress dots are `aria-hidden`.
- Counters are isolated (REVIEW #12 holds).

| id | sev | WCAG | file + selector | measured | fix | effort |
|---|---|---|---|---|---|---|
| A11Y-01 | major | 1.4.3 Contrast (AA) | parent CTA: `index.html` `.deck-copy .btn .en`; `mockups/01-andalus.html` `.parents .btn--sun`; `mockups/05-mosaic.html` `.t-cta .en`; `404.html` `.lost .btn .en` | Hub "Watch the presentation" 2.99 (pacific) / 1.53 / 1.35 / 1.40 / 2.42 / 3.81; Andalus CTA (both lines) 1.96; Mosaic "Book a free trial class" 1.58; 404 "Back to the hub" 2.99. All need 4.5. | The `frontend-engineer` FE-01 CSS fix. Then re-run the rendered scan; every CTA span should be ≥ 4.5. | S |
| A11Y-02 | major | 3.1.2 Language of Parts (AA) | every `.en` caption on Arabic pages | `.en` without `lang="en"`: hub 37, article 86, story 49, logos 48, Pacific mockup 25, 404 6, presentation 2. VoiceOver/TalkBack read the English captions with the Arabic voice. | One line in `kids.js` init: `document.querySelectorAll('.en:not([lang])').forEach(e => e.lang = 'en')`. Better still, add `lang="en"` in the markup/templates (book template, `build.py`). | S |
| A11Y-03 | minor | 2.4.6 / 4.1.2 Name | `lessons/article.html` picture-card buttons | 19 buttons are all named «اِسْتَمِعْ — Listen». In a rotor list they cannot be told apart. | Include the word: «اِسْتَمِعْ: قِطَّةٌ — Listen: cat» (FE-06). | S |
| A11Y-04 | minor | 3.1.2 | `guide.html` (lang=en), `pitch/index.html` (lang=en) | Arabic text leaves without `lang="ar"`: guide 27, pitch 28. | Wrap them in `<span lang="ar" dir="rtl">` (in the deck, via the `.ar` span in `build.py`). | S |
| A11Y-05 | minor | 1.1.1 Non-text content | `book/books/noori-shell.html` story images; `logos/index.html` (25); `guide.html` (19) | 6 of 16 book alts are English only (e.g. "I am Noori, the little seagull…"). The logos and guide alts are English only too; those are parent/designer pages, so that is acceptable. | Book: put the page's Arabic line first, as the cover alt already does («نُورِي يَحْمِلُ صَدَفَةً… — Noori holding a little shell»), via the spec → template. | S |
| A11Y-06 | minor | 2.5.8 (project rule 44 px for parents) | hub lesson-book file links 27 px tall; footer links 15–21 px | Measured at 820 and 390. | `min-height:44px` (KUX-02/03). | S |
| A11Y-07 | minor | 2.2.2 Pause, Stop, Hide | ة glow loops `article.html:72`, `story.html:113` (infinite); book `.breathe` | They loop for more than 5 s with no control. Reduced motion stops them, but default users cannot. | Limit them to 3 iterations (MS-02/03). | S |

**Not tested (say so):** a real VoiceOver pass on fully vocalised Arabic (does it read the tashkeel sensibly?), Switch Control on the writing pad, and a real Pencil. These need a device and are carried over from the charter.

## Top 3 suggestions for what to build next
1. **`lang` hygiene in the shared system** (A11Y-02): one `kids.js` line plus template changes. It is the biggest screen-reader win for parents for the least work.
2. **A short accessibility statement** in the parents' section and the footer (plain English, one paragraph: how to use the listen buttons and big text, how to report a problem). Parents of children with additional needs look for it.
3. **One real-device pass** (iPad + VoiceOver, 30 minutes) on the story and the book, logged here with what VoiceOver says for «هَذِهِ سَمَكَةٌ». It is the last unverified piece of the child path.
