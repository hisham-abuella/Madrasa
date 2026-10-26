# motion-and-sound-designer — Team review 2 (2026-10-26)

**Verdict: FIX (one sound gap, a few loops).** The narrated parts are healthy:
- `qa-audio.py` (ffmpeg only) is clean on book 28 + 28, story 13 + 13 and samples 3 + 3, with 0 problems.
- Story clips have a mean of −18.1 to −21.3 dB and a peak of ≤ −0.9 dBFS.
- Transcript voice ids match the brief: Sarah `EXAVITQu4vr4xnSDxMaL`, Hisham `pusofH2Ro5Ny4RH6qBEO`, `eleven_v4`, 0.5/0.8.
- The browser decodes **90/90** clips (`loadedmetadata`).
- No sound plays before a gesture on any of the 15 pages.
- With `prefers-reduced-motion: reduce`, **0 running animations** on all 15 pages.

The gap: **the article lesson and the mockups still speak with the device voice.**

| id | sev | file + location | evidence | fix | effort |
|---|---|---|---|---|---|
| MS-01 | major | `lessons/article.html` (19 `[data-say]` picture cards + the quiz «اِسْتَمِعْ»), mockups 01–06 word of the day (2 each) → `KS.speak` (`kids.js:284`) | These use `speechSynthesis` with no clip: 0 `.mp3` / `data-audio` in article.html. Where there is no Arabic voice, `speak()` returns silently (`kids.js:286`), so the child taps and **nothing happens**. This is the "robot voice" class REVIEW #3 fixed for the story but not here. | When the user says go: render one ElevenLabs Sarah clip per word picture, `audio/words/<name>.mp3` (24 `KS.pic` names + the 6 words of the day, about 30 short clips). In `KS.speak`, play `audio/words/<name>.mp3` first and fall back to `speechSynthesis`. Then run `qa-audio.py`. Until then: if no voice is available, add `is-speaking` + `KS.sfx('pop')` so the tap at least answers. | M |
| MS-02 | minor | `lessons/article.html:72` (`glow 2.4s … infinite`), `lessons/story.html:113` (`glow 2s … infinite`) | The hero ة badge glows forever. kids.css itself uses `glow … 2` (`kids.css:775, 851`). An endless attention loop competes with the lesson. | Change it to `animation: glow 2.4s ease-in-out 3;` (glow on arrival, then rest). | S |
| MS-03 | minor | `book/books/noori-shell.html:89` `.breathe` (6 s infinite, 2 % scale) on every story-page picture | The motion has no job while the child reads; it is also on the print-like page. | Keep it on the cover only (`.cover .breathe`), or delete it. | S |
| MS-04 | minor | mockups: Pacific `.sea svg drift 18s` + `.flyer float 3.6s` (`02-pacific.html:41,45`), Mosaic `.big-star spin 60s` (`05-mosaic.html:32`), Mihrab float | Ambient loops on the homepage concepts. They are acceptable as hero mood, but the owner prefers simple. | Leave them for the mockup choice. In the chosen theme, keep at most one ambient loop. | S |
| MS-05 | minor | `audio/story/ar/p02.mp3` peak −0.9 dBFS, `p03` −1.4 | No clipping, but it is close to full scale on cheap tablet speakers. | When clips are next re-cut, normalise to −1 dBTP. No action now. | S |

**Re-verified from REVIEW.md:** #3 (story clips on all 13 slides, a 26-file set, QA clean), #16/#17 (orphan transcripts and sample mp3s still removed). The deck has no narration (owner decision, 2026-10-25) and there is nothing to QA there.
**Not tested:** listening by ear, and the Whisper word check (a GPU job, not run). The story's "stop audio when the slide is left" could not be observed headless, because the clips are `new Audio()` objects, not DOM elements.

## Top 3 suggestions for what to build next
1. **Word clips for every picture card** (MS-01): about 30 short Sarah clips, so every «اِسْتَمِعْ» on the site sounds like the book.
2. **A tiny audio map** (`audio/words/index.json`: word → file) that `KS.speak` reads, so new topic books add words without code changes.
3. **One listening game in the article**: Noori says a word, and the child taps هَذَا or هَذِهِ. It reuses the clips from (1) and the quiz component, and adds no new motion.
