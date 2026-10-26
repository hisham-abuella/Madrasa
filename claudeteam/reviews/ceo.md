# Review: ceo (vision pass only)

**Date:** 2026-10-25 · **Reviewer:** team reviewer 1 acting as `ceo`. These are the CEO's own findings. Consolidation into `claudeteam/suggestions.jsonl` comes later.
**Question:** does the whole product deliver *interaction, not memorisation* and *Islamic morals, woven in*? I ran the child test and the parent test on the hub, the mockups, the three lessons, the book (web + print), the guide and the owners' deck.

## Verdict: SEND BACK, gently (0 blocker · 4 major · 3 minor)

The product is correct, warm and consistent: one lesson, four ways, all with the same nouns, characters and fence. Correct is the floor, and on two points of the vision it is not yet more than that:
1. **The child never speaks Arabic on screen.** On screen they tap, choose and trace. They speak only in the classroom deck and in the book's adult notes.
2. **The morals are written as rules, not lived in the story.** Our adab shows up mostly as what we *don't* draw.

Both are cheap, text-level fixes, and neither needs a rewrite.

### Child test (a six-year-old heritage learner who cannot read English)

| Test | Story | Article | Classroom deck | Book (web + print) |
|---|---|---|---|---|
| 1. What do I do? | Taps to hear on slides 2–7; the first real choice is slide 8 (~3 min in) | Taps, morph, writing, quiz | Shout, point, gesture (slide 15), chant (17) | Answer the greeting (p4), point; 11 exercise pages |
| 2. Without reading? | Yes: recorded narration, big buttons | No: read-along with a parent (labelled) | Yes: the teacher reads | With a parent; QR to narration |
| 3. Word meaning? | Every word has a picture | Yes | Yes | Yes |
| 4. Safe when wrong? | Soft hint, **but an empty star stays** (`kids.js` quiz) | Same | Yes ("nobody is out") | Yes ("never mark handwriting wrong") |
| 5. Again? | «مِنَ الْبِدَايَةِ» button | "Play again" on the quiz | — | Certificate |
| 6. Used Arabic to do something? | Chose and traced; **never said** | Chose and traced; **never said** | **Yes: said, acted, chanted** | Wrote; said only if a parent follows the notes |

### Parent test (a busy San Diego parent on a phone)
- **10 seconds:** passes. The English captions are plain.
- **Trust:** placeholders are marked, there is no tracking and no account. But mockup 06 promises "Islamic manners woven into every lesson" and the deck says "Modest clothing on every child", while the book art shows Salma's fringe (ISA-01). A careful parent who opens the book will notice.
- **One action:** passes. «اِحْجِزْ حِصَّةً تَجْرِيبِيَّةً» on every mockup and lesson end.
- **Help at home:** the article and the book pass (Parents' corner, the about page). The story has no home line.
- **Send to my sister?** Yes, after ISA-01 and CEO-02.

## Findings

| id | severity | file + location | evidence | fix | effort |
|---|---|---|---|---|---|
| CEO-01 | major [VISION] | `lessons/story.html`, `lessons/article.html`, `book/books/noori-shell.html` | Test 6 fails on every screen lesson: no moment where the child says Arabic and Noori responds. ("Interaction is mostly choose-and-trace" was already an honest weakness in the charter.) | Adopt APS-01: the «دَوْرُكَ! قُلْ: …» echo (Noori models, pauses, models again; no microphone). Smallest change that passes test 6. | S–M |
| CEO-02 | major [VISION] | book story pages 4–17, `story.html`, `pitch/index.html` slide `adab`, `mockups/06-mihrab.html` | Akhlaq is lived on only 2 pages (salam, sandcastle). The adab slide lists prohibitions. Mockup 06 claims manners "woven into every lesson". | Adopt ISA-03: the shell gift «تَفَضَّلِي يَا سَلْمَى!» → «شُكْرًا يَا نُورِي! جَزَاكَ اللَّهُ خَيْرًا.», «نَتَعَاوَنُ» on the sandcastle, «الْحَمْدُ لِلَّهِ» at the end. Then add one line to the deck: "What children practise: salam, sharing, thanking". It is true only after the story changes, so change the story first. | S–M |
| CEO-03 | major [RULING] | `book/images-noori-shell/{friends,sadiq,bint,nashit}.webp`, story s03/s10/s13; `pitch/index.html` `adab` slide | "Modest clothing on every child" is on the owners' slide. The book shows Salma's fringe and, on p15, a bare forearm. | Back `islamic-studies-advisor`: not a veto, but **redraw before the Lulu order and before the owners' meeting**. It is the only finding that can cost us trust in the room. | M |
| CEO-04 | major [VISION] | book p15 «نَحْفَظُهَا فِي قُلُوبِنَا!», deck slide 12 «نَحْفَظُهَا حِفْظًا», article "we learn these by heart" | Our own page tells the child the method is memorising, the exact opposite of the vision line. | Adopt APS-03: «هَيَّا نُشِيرُ وَنَقُولُ: هَذِهِ بِنْتٌ، هَذِهِ أُمٌّ، هَذِهِ شَمْسٌ!» with the empty-hands «بِلَا صَدَفَةٍ» gesture. | S |
| CEO-05 | minor | `assets/kids.js` quiz | Empty stars and "You got 2 of 5" break the standing ruling "no punishment". | Adopt ECE-01: retry after the hint, every child ends with full stars. | S |
| CEO-06 | minor | `assets/kids.js` `KS.speak` | Every tap-to-hear word uses the device voice. The narration is warm; the words a child taps are robotic, or silent on some devices. | Adopt APS-02 (≈35 recorded word clips). This is the "next" item after the cheap text fixes. | M |
| CEO-07 | minor [VISION] | `pitch/index.html` slide `idea` | The deck says "Teachers teach. Nawras makes it joyful." It never says what the child *does*. | Add one plain line to the idea slide: "Children use Arabic from the first minute: they point, act, choose, write and say it back." No "Fusha" added (BRIEF limit). | S |

### Agreed with other roles (no separate finding)
ALE-01 ("usually" for the ة), ALE-02 (praise and certificate for girls too), ISA-04 (no "magic", say «سِرٌّ») and APS-06 (no answer-giving colour on exercises). All four are cheap, correct and serve the vision.

### My own ordering (input for the later consolidation, not the final list)
- **Now** (before the owners' meeting and before print): CEO-03 (redraw Salma), CEO-04, ALE-01, ALE-02, ISA-04, CEO-05. All text or one art job.
- **Next:** CEO-01 (echo), CEO-02 (lived values + re-record the touched clips), CEO-06 (word clips).
- **Later:** the KG cut (ECE-02), the sentence-builder game, a second lesson.
Reason: decision order step 1 (child respected; modesty claim matches reality), then step 2 (correct Arabic), then step 4 (active over passive), all at the cheapest cost.

## Top 3 suggestions for what to build next
1. **«دَوْرُكَ!» speak-back echo** in the story, the article and the web book. One small shared `KS` helper turns every screen lesson from "listen and tap" into "listen, say, check".
2. **One lived value per story**, starting with the shell gift: «تَفَضَّلِي» / «شُكْرًا» / «جَزَاكَ اللَّهُ خَيْرًا». The topic-book skill should ask "which value?" before "which pictures?".
3. **Sentence-builder game**: tap tiles [هَذَا | هَذِهِ] + noun + adjective under a picture, and Noori reads it back. It is the missing "build" step between choosing and free writing, and it reuses every picture we have.
