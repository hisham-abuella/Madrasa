# Review: islamic-studies-advisor

**Date:** 2026-10-25 · **Reviewer:** team reviewer 1 acting as `islamic-studies-advisor` (read-only)
**Scope:** every picture, story line, greeting and moral message a child, teacher or parent sees:
- the hub and the 6 mockups
- the 3 lessons
- the book: spec, web book, the Lulu PDF rendered with pdftoppm, and every picture with Salma checked at full size
- the guide
- the owners' deck

## Verdict: PASS with fixes. **No veto** (0 blocker · 4 major · 3 minor)

Content rules checked and clean:
- No prophets or angels.
- No Qur'an or hadith text anywhere. A grep for «الرَّحْمَنِ / سُورَة / آيَة / ﷺ / عليه السلام» across the scope found nothing.
- Allah's name appears only in the teacher's «بِسْمِ اللهِ» note and one Egyptian narration line (ISA-05).
- 8-point khatam only, and the crescent and lanterns are shared heritage.
- Cats are a tabby and a calico, not a branded character.
- The rejected immodest guide image `bint-611` is shown blurred.
- The `pic/` set (girl, student-f, mother, teacher-f) has the white under-cap, with no hairline showing.
- The mockups and the hub greet with «السَّلَامُ عَلَيْكُمْ».

The majors: the **book art missed the hijab fix** that the site art received, and the **morals are stated as rules rather than lived** in the story.

## Findings

| id | severity | file + location | evidence | fix | effort |
|---|---|---|---|---|---|
| ISA-01 | major | `book/images-noori-shell/friends.webp` (seed 804), `sadiq.webp` (710), `bint.webp` (711), `nashit.webp` (613), reused as `assets/art/story/s03-friends.webp`, `s10-nashit.webp`, `s13-sadiq.webp`; Lulu interior pages 4, 12, 13, 15 | A brown fringe of hair shows across Salma's forehead in every book picture (cropped at full size). `book/source/gen-noori-shell.sh` line 27 `SALMA=…` never received the `$HIJAB` "snug white under-cap" clause that fixed `pic/girl` (`assets/art/source/gen-art.sh` line 65). | **Ruling: not a veto.** Salma is a six-year-old cartoon and the picture is modest; covering a child's hair is not obligatory before puberty. But it breaks our own stated rule and the pitch slide's claim "Modest clothing on every child", and this book goes to print. `art-director`: add `$HIJAB` + NEG "hair, fringe, bangs" to the book script, redraw these 4 (one GPU job at a time), re-export the 3 story scenes, rebuild the PDFs **before the Lulu order**. | M |
| ISA-02 | major | `book/images-noori-shell/nashit.webp` (seed 613): book p15 / story slide 10 | Salma's lower arm (the right side of the picture) shows a short sleeve with a bare forearm. Her raised arm is long-sleeved. Sami is also short-sleeved; that drift was accepted for the boy, and it stays accepted. | In the same redraw: "long sleeves to the wrists" for Salma. | S (with ISA-01) |
| ISA-03 | major | `book/stories/noori-shell.json` story pages 4–17; `lessons/story.html` slides 1–13; `pitch/index.html` slide 10 `adab`; `mockups/06-mihrab.html` «أَدَبٌ وَقِيَمٌ · Islamic manners woven into every lesson» | Only two moments model akhlaq: the greeting (p4 / slide 2) and building a sandcastle together (p13). There is no thanks, sharing, kindness, gratitude or care for the beach. The deck presents adab as a list of prohibitions, and mockup 06 promises manners "woven into every lesson", which is not yet true. | **Show, don't preach.** Text only, no new art: (a) p10 `sadafa`: Noori gives the shell to Salma: «تَفَضَّلِي يَا سَلْمَى!» — «شُكْرًا يَا نُورِي! جَزَاكَ اللَّهُ خَيْرًا.» (b) p13 `sadiq`: «نَبْنِي مَعًا، وَنَتَعَاوَنُ.» (c) p17 `bye`: «الْحَمْدُ لِلَّهِ، تَعَلَّمْنَا…». Mirror (a) in story slide 6 or 8. Then the deck's adab slide can add one honest line: "What children practise: salam, sharing, thanking." | S–M (re-record touched pages later) |
| ISA-04 | major | `lessons/article.html` §3 «سِحْرُ التَّاءِ» + EN "The magic of ة"; `lessons/story.html` slide 8 «الصَّدَفَةُ السِّحْرِيَّةُ» + "the magic shell"; `audio/transcripts/story-{ar,eg}.json` p08 title «الصدفة السحرية»; `index.html` "the “magic ة”" | In Islamic teaching سِحْر names a grave sin. Many careful parents and teachers, across schools of thought, avoid praising it to children, even playfully. | Rename: «سِرُّ التَّاءِ» (the deck already says «سِرُّ الصَّدَفَةِ الصَّغِيرَةِ») or «الصَّدَفَةُ الْعَجِيبَةُ»; in English, "the secret of ة" / "the amazing shell". Text only; the p08 clip does not say the word. | S |
| ISA-05 | minor | book spec p10 `sadafa` eg.say «الله، حلوة قوي!» | Allah's name is used as a casual exclamation. It is common Egyptian usage and not disrespectful, but it is a teaching chance missed. | → «ما شاء الله، حلوة قوي!» This teaches the phrase for admiring something beautiful. Re-record 1 clip when the user says go. | S |
| ISA-06 | minor | `lessons/story.html` slide 2 (greeting) | Noori says «السَّلَامُ عَلَيْكُمْ» but the child is never invited to reply. The book p4 does invite a reply: «رُدُّوا التَّحِيَّةَ مَعًا: وَعَلَيْكُمُ السَّلَامُ». | Add a reply button «وَعَلَيْكُمُ السَّلَامُ» under the greeting: a tap plays the clip and Noori smiles. Answering salam is itself the adab. | S |
| ISA-07 | minor | `lessons/presentation.html` slide 1 notes «بِسْمِ اللهِ»; slide 18 close | The opening invites بِسْمِ اللَّهِ; the close has no matching line. | Optional teacher line on slide 18: «الْحَمْدُ لِلَّهِ، تَعَلَّمْنَا الْيَوْمَ…». Vocalise «اللَّهِ» in both (`arabic-language-expert`). | S |

## Top 3 suggestions for what to build next
1. **One lived value per story** (ISA-03), starting with the shell gift: «تَفَضَّلِي» → «شُكْرًا، جَزَاكَ اللَّهُ خَيْرًا». The phrase is grammar too: تَفَضَّلْ for Sami, تَفَضَّلِي for Salma. For the next topic book, pick the value first (sharing, honesty, kindness to the cat, keeping the beach clean) and let the characters live it on 2–3 pages, with no moral stated at the end.
2. **"Adab phrases" stickers.** Noori poses already exist. Pair each with a phrase a child can use today: «السَّلَامُ عَلَيْكُمْ»، «شُكْرًا»، «مِنْ فَضْلِكَ»، «بِسْمِ اللَّهِ» before eating, «الْحَمْدُ لِلَّهِ». Use them as the end-of-lesson reward instead of generic stars. Allah's name never appears as a game mechanic or a wrong option: they are phrases to say, not to score.
3. **Beach clean-up page** in the book (Pacific + care for creation): Noori and the children pick up litter, «هَذِهِ زُجَاجَةٌ… هَذَا كِيسٌ…». It practises هَذَا / هَذِهِ on new nouns and lives the value. Draw a plain water bottle, never a bottle that could read as alcohol (NEG already has "bottles").
