# هَذَا وَهَذِهِ — دَرْسٌ لِلصَّفِّ (Nawras classroom presentation)

- **Audience**: children aged 6 to 8 (grade 1 to 2) in a weekend Islamic Arabic (Fusha) school in San Diego. They read slowly or not yet, know the Arabic letters and some Arabic nouns; many speak English or a dialect at home (دَه / دِي, هَاد / هَاي). They cannot read English on screen and do not need to: the teacher reads everything aloud. The **teacher** is the presenter and reads the speaker notes (Arabic lines to say + English guidance).
- **Occasion and time**: one classroom lesson, about 20 minutes **including** the class activity and the writing time; shown on a classroom TV or projector (laptop, Chrome, F for fullscreen) or on an iPad facing the class. No Q&A; the class answers aloud all through. Deck at `/Users/hishamabuella/Work/Arabic-school/lessons/presentation.html`.
- **Goal**: every child can say هَذَا with a masculine word and هَذِهِ with a feminine word, spots the ة at the end of a word, knows that بِنْتٌ، أُمٌّ، شَمْسٌ take هَذِهِ without a ة, and has traced ة and هَذِهِ in the lesson book.
- **Promise**: «الْيَوْمَ سَنَتَعَلَّمُ: مَتَى نَقُولُ هَذَا، وَمَتَى نَقُولُ هَذِهِ!» (Today we will learn when to say هَذَا and when to say هَذِهِ), on slide 2, read aloud by the teacher and repeated by the class.
- **Story**: نَقُولُ هَذَا لِلْمُذَكَّرِ وَهَذِهِ لِلْمُؤَنَّثِ، وَالصَّدَفَةُ الصَّغِيرَةُ ة فِي آخِرِ الْكَلِمَةِ تُخْبِرُنَا فِي الْغَالِبِ أَنَّهَا مُؤَنَّثَةٌ. (We say هَذَا for masculine words and هَذِهِ for feminine words, and the little seashell ة at the end of a word usually tells us the word is feminine.)
- **Fence**: the ة is a helper, not the rule. Some feminine words have no ة (بِنْتٌ، أُمٌّ، شَمْسٌ) and still take هَذِهِ; we learn them by heart. Also not today's topic: dialect forms دَه / دِي (fine at home; in class we use Fusha).
- **Look**: `data-theme="schoolyard"`, `data-fonts=""` (theme's own Lexend for the little Latin there is), `lang="ar" dir="rtl"`, with a Nawras Pacific override: ocean-teal brand and hero, sunset-coral for the ة, and **Noto Naskh Arabic** for all Arabic (brief: children's words always vocalised Naskh). Why: schoolyard is the library's big, friendly, high-contrast teacher look with a `quiz (reveal)` recipe; the teal/coral override ties it to the Nawras brand and to the sister lessons' colours (blue = masculine, coral = feminine).
- **Sources**:
  - `/Users/hishamabuella/Work/Arabic-school/BRIEF.md` (brand, Noori, content rules, tashkeel/Naskh, ZWJ rule, writing-practice rules, the printed-book exercise types)
  - `/Users/hishamabuella/Work/Arabic-school/lessons/article.html` (sections, example words, «سِحْرُ التَّاءِ», fence, «تَحَدِّي الْأَبْطَالِ», writing station, 5-question knowledge check, «تَذَكَّرْ» box, parents' corner, printable worksheet)
  - `/Users/hishamabuella/Work/Arabic-school/lessons/story.html` (Noori, the ة as «صَدَفَةٌ صَغِيرَةٌ», the magic shell, 4-question quiz, «مَاذَا تَعَلَّمْنَا؟»)
  - `/Users/hishamabuella/Work/Arabic-school/assets/kids.js` (KS.pic names, KS.gull moods, KS.writePad, KS.ta) and `assets/kids.css` (Pacific tokens and the picture, gull and writing-pad CSS)
  - `/Users/hishamabuella/Work/Arabic-school/audio/samples/ar/s1.mp3`, `s2.mp3`, `s3.mp3` and `audio/transcripts/sample-ar.json` (recorded Fusha clips, about 7 s each)
- **Placeholders**:
  - `[BOOK-PAGES]`: page numbers of the «هَذَا وَهَذِهِ» exercise pages in the printed Nawras lesson book (the book is not built yet: there is no `book/` folder). Used on slides 16 and 18.
  - `[BOOK-TITLE]`: the printed book's title as the children see it on the cover (likely «نُورِي وَالصَّدَفَةُ الصَّغِيرَةُ», the story's title; confirm). Used in the notes of slides 16 and 18.
  - `[VERIFY-VOICE]`: the coordinator says the Fusha voice is now ElevenLabs **Sarah** (`EXAVITQu4vr4xnSDxMaL`), but `audio/transcripts/sample-ar.json` and `story-ar.json` still name voice `pusofH2Ro5Ny4RH6qBEO`. Confirm that `audio/samples/ar/s1–s3.mp3` are the Sarah renders before shipping (slides 1, 5, 8).
  - **To verify** (not facts, but quality checks): (a) a Fusha teacher proofreads the tashkeel of every Arabic line that does not come word for word from article.html or story.html (marked † in the table); (b) the Magic Move on slides 9 to 10 with a ZWJ-split ة renders joined in Noto Naskh Arabic (fallback in "Build notes"); (c) the writing pad works with a finger on the iPad and with a mouse on the classroom laptop.

| # | data-id | layout | claim (the slide's h2) | content and facts (with source) | role | min |
|---|---|---|---|---|---|---|
| 1 | start | title | h1 «هَذَا وَهَذِهِ» | label «مَدْرَسَةُ نَوْرَس لِلْفُصْحَى · الصَّفُّ الْأَوَّلُ وَالثَّانِي»; sub «مَعَ نُورِي النَّوْرَسِ الصَّغِيرِ» †. Picture: KS.gull('wave'), large, inline-end side. Listen button «اسْتَمِعْ إِلَى نُورِي» plays `../audio/samples/ar/s1.mp3` (Noori's greeting «السَّلَامُ عَلَيْكُمْ يَا أَصْدِقَائِي الصِّغَارَ!…», transcript s1). Source: BRIEF, story.html p.1, sample-ar.json. | promise (opening) | 0.5 |
| 2 | promise | agenda | «الْيَوْمَ سَنَتَعَلَّمُ: مَتَى نَقُولُ هَذَا، وَمَتَى نَقُولُ هَذِهِ!» † | ol: ١ «هَذَا لِلْمُذَكَّرِ» ٢ «هَذِهِ لِلْمُؤَنَّثِ» ٣ «سِرُّ الصَّدَفَةِ الصَّغِيرَةِ: ة» † ٤ «نَلْعَبُ وَنَكْتُبُ» †. Small KS.gull('think') decorative (aria-hidden). Items 1 to 2 from article.html «تَعَلُّمُ» list. | promise, signpost | 1 |
| 3 | masc | two-column, `data-cols="3"` | «نَقُولُ هَذَا لِلْمُذَكَّرِ» | 3 picture cards, each `data-build="rise"`, `data-order` 1, 2, 3 (one word per click): KS.pic('boy') «هَذَا وَلَدٌ», KS.pic('cat') «هَذَا قِطٌّ», KS.pic('book') «هَذَا كِتَابٌ». «هَذَا» in `--masc-text`. Source: article.html §١. | evidence | 1.5 |
| 4 | fem | two-column, `data-cols="3"` | «نَقُولُ هَذِهِ لِلْمُؤَنَّثِ» | 3 picture cards, built one per click: KS.pic('cat-f') «هَذِهِ قِطَّةٌ», KS.pic('fish') «هَذِهِ سَمَكَةٌ», KS.pic('star') «هَذِهِ نَجْمَةٌ». «هَذِهِ» in `--fem-text`; the final ة of each noun in `--ta` (ZWJ split, as KS.ta does). No بِنْت here (kept for the fence). Source: article.html §٢. | evidence | 1.5 |
| 5 | pair | statement | «هَذَا قِطٌّ… وَهَذِهِ قِطَّةٌ!» | The h2 in two halves: «هَذَا قِطٌّ…» shows first, «وَهَذِهِ قِطَّةٌ!» `data-build="fade"` on the click. Label «مُذَكَّرٌ وَمُؤَنَّثٌ». Small KS.pic('cat') under the first half, KS.pic('cat-f') under the second (≤ 200 px, drop them if the checker flags overflow). Listen button plays `s2.mp3` («هَذَا وَلَدٌ، وَهَذِهِ بِنْتٌ. هَذَا قِطٌّ، وَهَذِهِ قِطَّةٌ.»). Source: story.html p.3, sample-ar.json s2. | thesis (1: by example) | 1 |
| 6 | q-moon | quiz | «ـــــ قَمَرٌ» (label «هَذَا أَمْ هَذِهِ؟» †) | KS.pic('moon') next to the question (≈ 220 px). `<ol class="opts" data-build="reveal">`: «هَذِهِ», «هَذَا» `data-correct`. Class answers aloud before the click. Word from article.html §١ (هَذَا قَمَرٌ). | question | 0.5 |
| 7 | part-ta | agenda (returns) | «الْيَوْمَ سَنَتَعَلَّمُ: مَتَى نَقُولُ هَذَا، وَمَتَى نَقُولُ هَذِهِ!» | Same list as slide 2, `aria-current` on item ٣ «سِرُّ الصَّدَفَةِ الصَّغِيرَةِ: ة». Small KS.gull('fly'). | signpost | 0.5 |
| 8 | ta | image-left (mirrors to the right in RTL) | «إِذَا رَأَيْتَ الصَّدَفَةَ ة، فَقُلْ: هَذِهِ!» † | Figure: KS.pic('shell') with a big ة (Naskh, `--ta`) over it. Label «ة مِثْلُ صَدَفَةٍ صَغِيرَةٍ!» (story.html). p: «التَّاءُ الْمَرْبُوطَةُ تَأْتِي فِي آخِرِ الْكَلِمَةِ، وَتَجْعَلُهَا مُؤَنَّثَةً فِي الْغَالِبِ.» (article.html, adapted from «هَذَا الْحَرْفُ يَأْتِي…»). Then 3 chips built one per click, ة glowing in `--ta`: «قِطَّةٌ»، «سَمَكَةٌ»، «نَجْمَةٌ». Listen button plays `s3.mp3` («هَلْ سَمِعْتُمُ التَّاءَ الصَّغِيرَةَ…؟ إِنَّهَا التَّاءُ الْمَرْبُوطَةُ! قِطٌّ… قِطَّةٌ!»). | thesis (2: metaphor), question | 1.5 |
| 9 | magic-a | image-right | «هَذَا مُعَلِّمٌ» | Figure: KS.pic('teacher-m'). Under the h2 a large coral chip holding ة (`data-magic="ta"`), with a small «+ ة» label, `data-build="scale"`: the teacher clicks, "here comes the shell!". h2 spans: `data-magic="dem"` on «هَذَا», `data-magic="word"` on «مُعَلِّمٌ». Source: article.html §٣ «سِحْرُ التَّاءِ». | story | 0.5 |
| 10 | magic-b | image-right | «هَذِهِ مُعَلِّمَةٌ» | **Magic Move from slide 9**: the ة chip flies into the end of the word and turns coral-red; «هَذَا» morphs into «هَذِهِ» and changes from masc to fem colour. Figure: KS.pic('teacher-f') in the same position (no `data-magic` on pictures; they dissolve). Small line under the h2: «مُعَلِّمٌ + ة ← مُعَلِّمَةٌ» †. Source: article.html §٣, story.html p.8. | story, evidence | 1 |
| 11 | q-student | quiz | «هَذِهِ ـــــ» (label «أَضِفِ الصَّدَفَةَ!» †) | KS.pic('student-f'). opts: «طَالِبٌ», «طَالِبَةٌ» `data-correct` (ة in `--ta`). Source: story.html quiz Q3. | question | 0.5 |
| 12 | fence | two-column, `data-cols="3"` | «انْتَبِهْ! بَعْضُ الْكَلِمَاتِ مُؤَنَّثَةٌ بِلَا ة» | Label «مُؤَنَّثٌ بِلَا ة». 3 cards built one per click, each with a small chip «بِلَا ة»: KS.pic('girl') «هَذِهِ بِنْتٌ», KS.pic('mother') «هَذِهِ أُمٌّ», KS.pic('sun') «هَذِهِ شَمْسٌ». Coral top rule on the cards to mark "careful". Source: article.html «انْتَبِهْ!», story.html p.9. | fence | 1.5 |
| 13 | q-sun | quiz | «ـــــ شَمْسٌ» (label «انْتَبِهْ!») | KS.pic('sun'). opts: «هَذَا», «هَذِهِ» `data-correct`. Source: article.html knowledge check Q4. | question, fence | 0.5 |
| 14 | part-play | agenda (returns) | «الْيَوْمَ سَنَتَعَلَّمُ: مَتَى نَقُولُ هَذَا، وَمَتَى نَقُولُ هَذِهِ!» | Same list, `aria-current` on item ٤ «نَلْعَبُ وَنَكْتُبُ». KS.gull('happy'). | signpost | 0.5 |
| 15 | play | two-column | «قُومُوا! هَذَا أَمْ هَذِهِ؟» † | Col 1 (the rule in the body): two big chips, «هَذَا ← أَشِرْ بِإِصْبَعٍ وَاحِدٍ» † (blue) and «هَذِهِ ← اصْنَعْ صَدَفَةً بِيَدَيْكَ» † (coral). Col 2: `<ol data-build="list">` of 7 pictures **without words**, one per click: door (بَابٌ), rose (وَرْدَةٌ), pen (قَلَمٌ), apple (تُفَّاحَةٌ), house (بَيْتٌ), palm (نَخْلَةٌ), mother (أُمٌّ, the fence again). Children stand, make the gesture and say the full sentence. Words from article.html §١ §٢, story.html p.6, KS.pic labels. | thesis (3: with the body), question | 2.5 |
| 16 | write | two-column, `data-fit="off" data-demo` | «هَيَّا نَكْتُبْ: ة، ثُمَّ هَذِهِ» | Col 1: label «مَحَطَّةُ الْكِتَابَةِ»; p «ابْدَأْ مِنَ النُّقْطَةِ الْخَضْرَاءِ، مِنَ الْيَمِينِ إِلَى الْيَسَارِ.» †; p «افْتَحُوا الْكِتَابَ: صَفْحَةُ [BOOK-PAGES]» †. Col 2 (`.bx-ui`): live `KS.writePad` with model `['ة','هَذِهِ']`, 2 lines; the teacher traces on the iPad or with the mouse while the class watches, then the children trace and write in the printed book. Source: BRIEF "Writing practice", article.html and story.html writing stations. | evidence (practice) | 2.5 |
| 17 | remember | bullets | «هَذَا لِلْمُذَكَّرِ، وَهَذِهِ لِلْمُؤَنَّثِ» | Label «تَذَكَّرْ · نُرَدِّدُ مَعًا» †. `data-build="list"`, 4 items, the class repeats each: «هَذَا وَلَدٌ.» · «هَذِهِ بِنْتٌ.» · «مُعَلِّمٌ ← مُعَلِّمَةٌ» (ة in `--ta`) · «بِلَا ة: بِنْتٌ، أُمٌّ، شَمْسٌ». Small KS.gull('happy'). Source: article.html «تَذَكَّرْ», story.html «مَاذَا تَعَلَّمْنَا؟». | thesis (4: the class says it back), signpost (recap) | 1 |
| 18 | close | closing | «أَنْتُمُ الْآنَ تَقُولُونَ هَذَا وَهَذِهِ مِثْلَ الْكِبَارِ!» † | KS.gull('cheer'). `p.contact` with the homework, 3 short spans: «١ الْكِتَابُ: صَفْحَةُ [BOOK-PAGES]» † · «٢ ابْحَثْ عَنْ ة فِي الْبَيْتِ» † · «٣ أَشِرْ وَقُلْ لِأَهْلِكَ: هَذَا… هَذِهِ…» †. Phrase «مِثْلَ الْكِبَارِ» from article.html promise; homework from article.html parents' corner ("This or this?" walk, ة hunt) and BRIEF book exercises. | contribution (and homework) | 1 |
| — | backup | appendix | «لِلْأَبْطَالِ» † | Starts the backup part; skipped in play. Reach with G (overview) if time is left. | backup | – |
| B1 | champions | two-column | «الصِّفَةُ تَتْبَعُ الِاسْمَ» | Col 1: KS.pic('boy') «هَذَا وَلَدٌ نَشِيطٌ». Col 2: KS.pic('girl') «هَذِهِ بِنْتٌ نَشِيطَةٌ» (ة of نَشِيطَةٌ in `--ta`), built on click. Line: «بِنْتٌ بِلَا ة، وَلَكِنَّ صِفَتَهَا فِيهَا ة.» (article.html «انْظُرْ جَيِّدًا», shortened). | backup | – |
| B2 | q-champ | quiz | «هَذِهِ بِنْتٌ ـــــ» (label «سُؤَالُ الْأَبْطَالِ» †) | KS.pic('girl'). opts: «نَشِيطٌ», «نَشِيطَةٌ» `data-correct`. Source: article.html knowledge check Q5. | backup | – |
| B3 | q-which | quiz | «أَيُّ كَلِمَةٍ مُؤَنَّثَةٌ؟» | opts: «مُعَلِّمٌ», «قَلَمٌ», «مُعَلِّمَةٌ» `data-correct`. Source: article.html knowledge check Q3. | backup | – |

**Total**: 18 slides in play (+ 1 appendix divider and 3 backup slides), about 19.5 minutes, of which about 5 minutes are class activity (slides 15 and 16) and 2 minutes are quiz answers (slides 6, 11, 13). That is the full 20-minute slot by design: a lesson has no Q&A to leave room for; the backup slides are the reserve if the class is quick, and the teacher can shorten slide 16 by finishing the writing in the book after the lesson. Set `data-duration="20"` on `<main class="deck">`.
**Restatements of the story**: slides 5, 8 and 17 (three, said three different ways: an example pair «هَذَا قِطٌّ… وَهَذِهِ قِطَّةٌ», the seashell metaphor «إِذَا رَأَيْتَ الصَّدَفَةَ ة، فَقُلْ: هَذِهِ», and the rule itself chanted back by the class), plus slide 15, where the children say it with their bodies.

## Look: exact settings

On `<html>`: `lang="ar" dir="rtl" data-theme="schoolyard" data-fonts="" data-theme-fixed data-no-picker`
(the last two stop `kids.js` from overwriting `data-theme` with the saved Nawras site theme and from adding its floating theme picker).

Run `node "$S/scripts/add-look.mjs" presentation.html --theme schoolyard` before the checker. Add
`<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">`.
Offline it falls back to Geeza Pro on Mac and iPad, which also stacks tashkeel well.

Deck `<style>` override (values from `assets/kids.css` Pacific; contrasts computed):

```css
html[data-theme="schoolyard"]{
  --brand:#0B7A7E; --brand-text:#0B6E72; --on-brand:#FFFFFF;         /* white on teal 5.1:1; #0B6E72 on white 6.0:1 */
  --hero-bg:#0B7A7E; --hero-ink:#FFFFFF; --hero-ink2:#FFF3DC;         /* #FFF3DC on teal 4.7:1 */
  --hero-rule:#FFF3DC; --hero-brand:#FFF3DC;
  --bg2:#FFF6E0; --rule:#CBE6E2;
  --hot:#FF7A5C; --hot-text:#B8391C;                                  /* coral is a fill only; #B8391C on white 5.8:1 */
}
html{
  --f-ar-d:"Noto Naskh Arabic","Geeza Pro","Amiri",serif;
  --f-ar-b:"Noto Naskh Arabic","Geeza Pro","Amiri",serif; --w-display-ar:700;
  --masc:#3BA7D6; --masc-text:#12658C;                                 /* 6.4:1 on white */
  --fem:#FF8A6B;  --fem-text:#B8391C;                                  /* 5.8:1 on white */
  --ta:#C23B1E;                                                        /* the ة; 5.3:1 on white */
  --accent:#FF7A5C;
  /* plus the --gull-* tokens (body, belly, wing, tip, beak, dot, scarf, eye, cheek, line), --surface, --surface2,
     --border-w, --border-c, --shadow, --radius-sm and --tap-min, copied with their Pacific values from kids.css */
}
```

Hero slides (title, section and closing layouts, here slides 1 and 18) are teal with white text: never put `--masc-text` / `--fem-text` / `--ta` words on them. Colour words only on the white slides. Never letter-space Arabic. Every Arabic word on a slide is fully vocalised. Footer (every slide): «مَدْرَسَةُ نَوْرَس لِلْفُصْحَى · هَذَا وَهَذِهِ». `<title>` and `data-title`: «هَذَا وَهَذِهِ · دَرْسٌ لِلصَّفِّ — Nawras».

## Pictures: where they come from

All pictures are the shared kid illustrations in `assets/kids.js` (inline SVG, modest figures, no text on them). Do **not** use the logo concepts in `logos/img/` (the logo pick is still open) or generated photos.

- Link `<script src="../assets/kids.js"></script>` at the end of `<body>` (the deck lives in `lessons/`, so the path is `../assets/`). The deck is then not a single self-contained file; that matches the sister lessons, which also load `../assets/`.
- Place pictures as `<div data-pic="cat-f" class="pic-box"></div>` and Noori as `<div data-gull="wave" class="gull-box"></div>`: kids.js fills them on DOMContentLoaded. Give every box a fixed height in the deck CSS (for example `.pic-box{height:260px}`) so auto-fit measures the same size before and after the SVG arrives.
- **Do not link `assets/kids.css`**: its `:root` sets `--bg`, `--ink`, `--f-display` and base element styles that fight the engine. Copy only these blocks into the deck `<style>`: the `.gull` rules (kids.css "Noori the seagull", about lines 556 to 589), the `.pic` fill classes (about lines 800 to 823), the writing-pad `.wp*` rules (about lines 711 to 750) and the keyframes they use (`blink`, `wave`, `flapL`, `flapR`, `hop`, `glow`).
- Names used: boy, cat, book, cat-f, fish, star, moon, shell, teacher-m, teacher-f, student-f, girl, mother, sun, door, rose, pen, apple, house, palm. Gull moods: wave (1), think (2), fly (7), happy (14, 17), cheer (18). All exist in `KS.PIC_NAMES` and `KS.gull`.
- If the checker's screenshot runs before the pictures fill in, the alternative is to paste the SVG markup inline: run `KS.pic(name)` / `KS.gull(mood)` once in the browser console on `lessons/article.html` and paste the strings into the boxes. Either way, keep `alt`-style labels: each SVG carries `role="img"` and an `aria-label` from KS (Arabic + English).

## Builds and Magic Move

- **One word at a time**: slides 3, 4 and 12 build their three cards one per click (`data-build="rise"`, `data-order="1|2|3"`); slide 5 reveals its second half; slide 8 its three chips; slide 15 its seven pictures (`data-build="list"`); slide 17 its four lines. The teacher says the sentence, the class repeats, then the next click.
- **Quizzes** (6, 11, 13, B2, B3): `<ol class="opts" data-build="reveal">`; the class answers aloud first, the click marks the correct option.
- **Magic Move 9 → 10** (the ة flying in): slide 9 holds `<span data-magic="dem">هَذَا</span> <span data-magic="word">مُعَلِّمٌ</span>` and the chip `<span class="ta-chip" data-magic="ta">ة</span>` (coral `--accent` fill, ink `#0B3540`, 5.1:1). Slide 10 holds `<span data-magic="dem">هَذِهِ</span> <span data-magic="word">مُعَلِّمَ&zwj;</span><span data-magic="ta" class="ta">&zwj;ةٌ</span>`, so the chip morphs into the word's final ة and its colour moves from coral fill to `--ta` text. Use `<span>`, not `<em>`, for every morphing piece. **Verify** in Chrome and on iPad Safari that «مُعَلِّمَةٌ» renders joined. Fallback if it breaks: on slide 10 let the chip land as a large detached ة just after the word (inline-end), then a `data-build="fade"` swaps in the joined word «مُعَلِّمَةٌ».
- Pictures on 9 and 10 sit in the same place and simply dissolve (Magic Move does not morph one SVG drawing into another).
- No other motion. Noori's built-in blink and wave are the only idle animation; honour `prefers-reduced-motion`.

## Audio (recorded Fusha clips)

Three approved clips exist: `audio/samples/ar/s1.mp3` (greeting), `s2.mp3` (هَذَا وَلَدٌ، وَهَذِهِ بِنْتٌ. هَذَا قِطٌّ، وَهَذِهِ قِطَّةٌ), `s3.mp3` (التَّاءُ الْمَرْبُوطَةُ… قِطٌّ… قِطَّةٌ), each about 7 s, Fusha, voice to confirm (`[VERIFY-VOICE]`).

Plan them as **tap-to-play buttons**, not the engine's narration mode: narration mode (`data-narration`, key A) plays a clip per slide and auto-advances, and a slide without a clip moves on after 3 s, which would run away from a teacher in a live class. So:

- Slide 1: button «اسْتَمِعْ إِلَى نُورِي» → `../audio/samples/ar/s1.mp3`
- Slide 5: button «اسْتَمِعْ» → `../audio/samples/ar/s2.mp3`
- Slide 8: button «اسْتَمِعْ» → `../audio/samples/ar/s3.mp3`

Markup: a round 64 px button with the speaker icon (`KS.ICON_SPEAK`) inside a `.bx-ui` wrapper that stops `click`, an `<audio preload="none">`, play only on tap, stop when the slide loses `.is-current`. Never autoplay. If someone later wants narration mode for self-study, copy the clips as `audio/presentation/start.mp3`, `pair.mp3`, `ta.mp3` and record the other slides first.

## The writing slide (16)

- `data-layout="two-column" data-fit="off" data-demo`; col 2 is `.col.bx-stage.bx-ui` with `<div data-writepad data-model="ة|هَذِهِ" data-lines="2"></div>` (kids.js wires it). Stop `click` and `pointerdown` on the `.bx-ui` so a stroke never advances the slide; `touch-action:none` is already on the canvas.
- Pad tools (pens, eraser, undo, clear, show/hide model, «انْتَهَيْتُ») stay 52 to 56 px; no grading, a star on «انْتَهَيْتُ».
- The children write on paper, not on the screen: the printed lesson book's exercise pages `[BOOK-PAGES]` (dotted tracing of ة, هَذَا, هَذِهِ with start dots and arrows, ruled lines, "add the ة", "circle the feminine word", per BRIEF). If the book is not printed yet, use the printable worksheet from `lessons/article.html` (its Print button; exercise ١ trace and write).

## Speaker notes (the teacher's script, one `<aside class="notes">` per slide)

Arabic lines are what the teacher says (vocalised, Fusha); English lines are guidance. Keep each note short enough to glance at.

1. **start**: «السَّلَامُ عَلَيْكُمْ يَا أَصْدِقَائِي!» Wait for «وَعَلَيْكُمُ السَّلَامُ». Point at Noori: «هَذَا نُورِي، النَّوْرَسُ الصَّغِيرُ.» Tap the speaker button to let Noori greet the class. (If your class opens with بِسْمِ اللهِ, say it here.)
2. **promise**: Read the title slowly, class repeats: «الْيَوْمَ سَنَتَعَلَّمُ: مَتَى نَقُولُ هَذَا، وَمَتَى نَقُولُ هَذِهِ!» Point at the four steps. English: "By the end you'll use هَذَا and هَذِهِ like a grown-up, and you'll write them."
3. **masc**: Click, picture appears, say «هَذَا وَلَدٌ», class repeats; same for قِطٌّ, كِتَابٌ. Then: «نَقُولُ هَذَا لِلْمُذَكَّرِ.» English: masculine = "boy words"; keep it simple.
4. **fem**: Same rhythm: «هَذِهِ قِطَّةٌ… هَذِهِ سَمَكَةٌ… هَذِهِ نَجْمَةٌ.» «نَقُولُ هَذِهِ لِلْمُؤَنَّثِ.» Do not explain the ة yet; just let them notice the red letter.
5. **pair**: «هَذَا قِطٌّ…» (click) «وَهَذِهِ قِطَّةٌ!» Class says both. Optional: tap «اسْتَمِعْ» (the clip also says هَذِهِ بِنْتٌ; that is fine, we come back to بِنْت later). English: this is the whole lesson in one pair.
6. **q-moon**: «هَذَا أَمْ هَذِهِ؟» Let the class shout, then click. «أَحْسَنْتُمْ! هَذَا قَمَرٌ.»
7. **part-ta**: «وَالْآنَ… سِرٌّ صَغِيرٌ!» Point at step ٣.
8. **ta**: Tap «اسْتَمِعْ» (Noori asks about the little letter). «هَلْ تَرَوْنَ الصَّدَفَةَ الصَّغِيرَةَ فِي آخِرِ الْكَلِمَةِ؟ إِنَّهَا التَّاءُ الْمَرْبُوطَةُ: ة.» Click the three chips; children point to the ة in the air. «إِذَا رَأَيْتَ الصَّدَفَةَ ة، فَقُلْ: هَذِهِ!» English: say "usually"; the exceptions come in two slides.
9. **magic-a**: «هَذَا مُعَلِّمٌ.» Click: the shell appears. «نَضَعُ الصَّدَفَةَ فِي آخِرِ الْكَلِمَةِ… مَاذَا يَحْدُثُ؟»
10. **magic-b**: (the ة flies in) «هَذِهِ مُعَلِّمَةٌ!» Class repeats. English: point at the teacher's own title: «أَنَا مُعَلِّمٌ / أَنَا مُعَلِّمَةٌ».
11. **q-student**: «هَذِهِ… طَالِبٌ أَمْ طَالِبَةٌ؟» Click. «هِيَ بِنْتٌ، فَنُضِيفُ ة: طَالِبَةٌ.» (story.html quiz explanation)
12. **fence**: «انْتَبِهُوا! بَعْضُ الْكَلِمَاتِ مُؤَنَّثَةٌ بِلَا ة.» Click each: «هَذِهِ بِنْتٌ… هَذِهِ أُمٌّ… هَذِهِ شَمْسٌ.» «نَحْفَظُهَا حِفْظًا.» English: no shell, but still هَذِهِ; we learn these three by heart.
13. **q-sun**: «هَذَا أَمْ هَذِهِ؟… شَمْسٌ!» Click. «شَمْسٌ مُؤَنَّثَةٌ بِلَا ة، فَنَقُولُ: هَذِهِ شَمْسٌ.» (article.html)
14. **part-play**: «هَيَّا نَلْعَبُ!» Point at step ٤.
15. **play**: «قُومُوا!» Teach the two gestures: one finger pointing for هَذَا, two cupped hands (a seashell) for هَذِهِ. Click each picture; the class does the gesture and says the sentence: «هَذَا بَابٌ / هَذِهِ وَرْدَةٌ / هَذَا قَلَمٌ / هَذِهِ تُفَّاحَةٌ / هَذَا بَيْتٌ / هَذِهِ نَخْلَةٌ / هَذِهِ أُمٌّ». English: children who cannot stand join seated. If time allows, point at real things in the room (الْبَابُ، الْكِتَابُ، الطَّاوِلَةُ). Variant: a sorting game with two baskets هَذَا / هَذِهِ and printed picture cards. Praise every try; no one is "out".
16. **write**: «هَيَّا نَكْتُبْ!» Trace ة slowly on the pad, starting at the green dot, right to left; then هَذِهِ. «افْتَحُوا الْكِتَابَ، صَفْحَةَ [BOOK-PAGES].» English: walk around; praise effort, never mark handwriting wrong; about 2 minutes, finish at home if needed. Book: `[BOOK-TITLE]`.
17. **remember**: «نُرَدِّدُ مَعًا:» click each line, class repeats: «هَذَا وَلَدٌ.» «هَذِهِ بِنْتٌ.» «مُعَلِّمٌ… مُعَلِّمَةٌ.» «بِلَا ة: بِنْتٌ، أُمٌّ، شَمْسٌ.» Then once more, fast and loud.
18. **close**: «أَنْتُمُ الْآنَ تَقُولُونَ هَذَا وَهَذِهِ مِثْلَ الْكِبَارِ!» Read the three homework lines; English for parents at pickup: book pages `[BOOK-PAGES]`, an ة hunt on food labels, and the "This or this?" walk at home. End: «أَحْسَنْتُمْ يَا أَبْطَالُ! إِلَى اللِّقَاءِ فِي الدَّرْسِ الْقَادِمِ.» (article.html), a salute to the class, not "thank you".
- B1 to B3 (backup): use only if time is left; press G and pick the slide. Explanation lines from article.html knowledge check Q3 and Q5.

## Checks for the builder and reviewer

- Titles in order tell the lesson: هَذَا for masculine → هَذِهِ for feminine → the pair → the ة shell → مُعَلِّم becomes مُعَلِّمَة → feminine without ة → act it out → write it → say it back → you can now do it.
- Every Arabic string vocalised; strings marked † to be proofread by a Fusha teacher. The words and sentences match article.html and story.html exactly (same nouns, same fence trio, same quiz answers).
- Content rules (BRIEF): no Qur'an verses on slides, no prophets or angels, modest figures only (KS.pic), no music; only the three recorded speech clips.
- Text at least 28 px everywhere (children's words much larger), contrast as computed above, tap targets ≥ 56 px on the iPad.
- `node "$S/scripts/check.mjs" lessons/presentation.html --outline` must list the 18 rows (plus appendix and B1 to B3) in this order with these layouts.
