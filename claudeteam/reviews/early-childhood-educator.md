# Review: early-childhood-educator

**Date:** 2026-10-25 · **Reviewer:** team reviewer 1 acting as `early-childhood-educator` (read-only)
**Scope:** age-fit of the lessons (article, story, classroom deck), the book (web + Lulu PDF, rendered with pdftoppm), the mockups' class levels, and the quiz and writing-pad behaviour in `assets/kids.js`.

## Verdict: PASS with fixes (0 blocker · 2 major · 6 minor)

What works well for 6–8-year-olds:
- The deck is about 20 minutes with the mode changing every 1–2 minutes. It has a movement slide (15), a seated option ("children who cannot stand join seated"), backup slides for fast groups, and praise for every try.
- The pad's «انْتَهَيْتُ» gives a star with no grading, so a child who cannot trace still earns it.
- Book lines are 26 mm and tracing starts at a green dot.
- Noori is never sad or angry.

The two majors are a quiz that shows lost (empty) stars, and the KG gap.

## Findings

| id | severity | file + location | evidence | fix | effort |
|---|---|---|---|---|---|
| ECE-01 | major | `assets/kids.js` quiz (`paintStars`, `finish`); used in article (5 Q), story (4 Q) | `KS.star(results[k] === true)` draws an empty star for each wrong answer. The final screen says "You got 2 of 5". Each question allows one try, then locks. | An empty star is a lost star, and the brief says no punishment. Change the flow to: wrong → soft shake + hint → **try again** → star when found. Every child finishes with full stars. Drop "You got x of n"; say «أَحْسَنْتُمْ! كُلُّ النُّجُومِ لَكُمْ» / "You found them all!". | S |
| ECE-02 | major | `mockups/01–06` class cards «الرَّوْضَةُ · حُرُوفٌ وَأَصْوَاتٌ» (KG); `lessons/*` all grade 1–2 | Parents of 4–5-year-olds see a KG class advertised, but nothing on the site is pitched at a pre-reader without grammar terms. | Make a **KG cut of the story**: 6 slides, the same art, no «مُذَكَّرٌ / مُؤَنَّثٌ», just "point and say" (هَذَا قِطٌّ / هَذِهِ قِطَّةٌ), one tap per slide, recorded voice, and a sticker at the end. Mostly hiding slides 7, 8, 10 and 12 of story.html behind `?kg`. | M |
| ECE-03 | minor | `lessons/presentation.html` slide 16 `write` notes start «هَيَّا نَكْتُبْ!» right after the movement slide 15 | There is no calm-down cue between standing and writing. | Add to the slide 16 notes: «اجْلِسُوا… يَدَانِ عَلَى الرُّكْبَتَيْنِ… نَتَنَفَّسُ ثَلَاثَ مَرَّاتٍ» / "Sit, hands on knees, three slow breaths, then pencils." | S |
| ECE-04 | minor | book spec p3 `about` en.body | "read one story page a night aloud" | That spreads a 14-page story over 14 nights, and a 6-year-old loses the plot. → "Read the whole story in one sitting (about 5 minutes), then do one exercise page a day." | S |
| ECE-05 | minor | book p13 `bint` picture (seed 711), story slide 9 | Salma looks worried: a frown and hands clasped at her chin (rendered page 13). The prompt asked for "curious puzzled". | On a "careful!" page the child should feel *curious*, not anxious. Use a curious face (eyebrows up, small smile, finger on chin) when Salma is redrawn for ISA-01 anyway. | S (with ISA-01) |
| ECE-06 | minor | book p29 `certificate` (rendered) | 11 stars wrap as 10 + 1, leaving one orphan star on its own line. | Lay them out as 6 + 5 or in an arc, so the last page looks finished. | S |
| ECE-07 | minor | `lessons/article.html` §1–§5 | A 15-minute read-along with no movement prompt. | Add one body moment in §1: «قُمْ وَأَشِرْ إِلَى الْبَابِ: هَذَا بَابٌ!» / "Stand up, point at a door, say it." | S |
| ECE-08 | minor | `book/books/noori-shell.html` exercise pages | On a tablet only the writing pad works. Circle, match, fill and the adjective choice are static images of the paper page, so a child at home on an iPad has nothing to tap. | Make the circle and match pages tappable (reuse `KS.quiz` options, with retry). The tracing pages stay as they are. | M |

## Top 3 suggestions for what to build next
1. **KG "point and say" story cut** (ECE-02): the same story and art for 4–5-year-olds, with no grammar words, one tap per page, and a sticker at the end.
2. **"Show a grown-up" card** at the end of every lesson. A full-screen card the child holds up to a parent: three pictures with «هَذَا قِطٌّ · هَذِهِ قِطَّةٌ · هَذِهِ شَمْسٌ» and a listen button. The child performs and the parent praises, so home talk happens without the parent needing Fusha.
3. **Digital "two baskets" sorting game** with unlimited tries and no score (shared with pedagogy). It is a calm, tactile game that also works for children who cannot trace yet.
