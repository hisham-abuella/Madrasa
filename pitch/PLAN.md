# Nawras: Fusha for little hearts, by the Pacific (a proposal for the school owners)

> Revised 2026-10-25 after owner feedback (REVIEW.md, reviews 1 and 2; review 2 added slide 3 `site`): 13 slides, about 10 minutes, no appendix, interactive logo and theme switchers, PDF links. The slide table and narration scripts below are the current plan; the Look and Build notes still apply (old slide numbers in the Build notes refer to the matching slide ids).

- **Audience**: 2 to 4 owners and principals of an Islamic Arabic (Fusha) weekend / after-school school for children in San Diego. Non-technical; parents themselves. They know Fusha teaching and their students well; they do not know web, AI or print-on-demand terms (never say "spec", "pipeline", "static HTML", "seed", "repo" on a slide or in a script). They care about Islamic adab, correct Fusha, children's engagement, and the cost and effort for teachers.
- **Occasion and time**: an approval meeting, about 10 minutes of talk, questions after (Q&A outside the slot). Hisham presents live from a laptop in Chrome, or the deck plays by itself with narration in Hisham's voice, in English or Egyptian Arabic. Set `data-duration="10"` on `<main class="deck">`.
- **Goal**: the owners approve the Nawras name, website look, logo and lesson-book format, and make five decisions: theme, logo, pilot class, a teacher to proofread the Fusha, and a printing budget.
- **Promise**: By the end of these ten minutes you will have seen everything we built for your school, and you will be able to make five decisions: which look, which logo, which class pilots it, which teacher checks the Fusha, and how many books to print. (Said on slide 1, asked on slide 12.)
- **Story**: One Fusha lesson, written once with care, reaches each child four ways (on a screen at home, on the classroom TV with the teacher, in a printed book they write in, and read aloud in their ears), so children enjoy Fusha more without more work for teachers.
- **Fence**: Nawras is a tool for the teachers, not a replacement for them; it is plain web pages plus a printed book, not an app or a paid subscription for families; and today it is one lesson that shows the format, not a finished curriculum.
- **Look**: `data-theme="trainer"`, `data-fonts="readex"` (Readex Pro for English and Arabic UI text), `lang="en" dir="ltr"`, recoloured to the Nawras Pacific palette (ocean teal brand, deep-teal hero, sunset coral as the only accent), plus **Noto Naskh Arabic** for every fully vowelled Arabic word. Why: `trainer` is the library's bilingual EN/AR look built from geometric tilework (fits Islamic adab and a faith-school audience); the teal recolour makes the deck look like the Nawras site the owners will open on their phones, and the Naskh font matches how children see the words in the lessons and the book. Exact CSS is in "Build notes".
- **Sources**:
  - `/Users/hishamabuella/Work/Arabic-school/BRIEF.md` (brand, Noori, taglines, alternate names, visual language, adab content rules, writing-pad rules, print exercise rules, book pipeline, narration voices, hosting update 2026-10-25, art pass)
  - `/Users/hishamabuella/Work/Arabic-school/index.html` (hub: six looks with their descriptions, "flagship" on Andalus, theme button on every page, lesson cards)
  - `/Users/hishamabuella/Work/Arabic-school/mockups/01-andalus.html` ... `06-mihrab.html` (the six looks)
  - `/Users/hishamabuella/Work/Arabic-school/logos/index.html` (6 concepts, names and reasons, "Recommended" on concept 1, pair with concept 6; 28 seeds tried; 2 vector SVGs; no text in the emblems)
  - `/Users/hishamabuella/Work/Arabic-school/logos/source/gen-logos.sh` (concepts, winning seeds, drawn locally with Draw Things / Z-Image Turbo)
  - `/Users/hishamabuella/Work/Arabic-school/lessons/article.html`, `lessons/story.html`, `lessons/presentation.html`, `lessons/presentation/PLAN.md` (one lesson هَذَا وَهَذِهِ three ways; article ≈ 15 min with 5-question check and printable worksheet; story with Sami and Salma, Fusha / Egyptian toggle, recorded clips on story pages 2, 4 and 7 with the device voice elsewhere; classroom deck 18 slides in about 20 minutes)
  - `/Users/hishamabuella/Work/Arabic-school/book/README.md` (32-page Lulu book, page map, exercise pages 18 to 28, Lulu settings, spine, cost estimate, worksheets, A5 booklet, 56 clips, 12 QR codes / 48 decoded, all print checks passed, redraws for modesty)
  - `/Users/hishamabuella/Work/Arabic-school/book/book.config.json` (book URL https://hisham-abuella.github.io/Madrasa/book/books/noori-shell.html, `urlConfirmed: true`)
  - `~/Work/bedtime-stories/PRINTING-GUIDE.md` (Oct 2026 estimates: Lulu paperback ≈ $8–15 + shipping ≈ $5–10; Lulu 5–10 days; home booklet ≈ $1–3 per book)
  - `/Users/hishamabuella/Work/Arabic-school/assets/art/source/gen-art.sh` and `assets/art/hi/` (illustrated set, in progress)
  - `/Users/hishamabuella/Work/Arabic-school/audio/transcripts/sample-ar.json`, `sample-eg.json`, `book/source/noori-shell-ar.json` (Fusha voice Sarah), `noori-shell-eg.json`
  - Live site: https://hisham-abuella.github.io/Madrasa/
- **Placeholders** (shown on the slide exactly as written, in a visible "TBC" style, until Hisham fills them):
  - `[HOSTING-COST]`: monthly cost of the website hosting. The repo is private with GitHub Pages on; the material gives no cost. (Resolved: $0 extra, GitHub Pages on the existing account; shown on slide 11.)
  - `[NARRATION-COST]`: the ElevenLabs plan cost for future narration. Material only says ≈ 6.5k credits used, ≈ 12.4k left until 17 Nov. (dropped.)
  - `[PILOT-CLASS]` and `[PILOT-START]`: which grade / teacher pilots, and from when. These are decisions the owners make in the meeting; the slide shows them as blanks to fill together. (Slide 11.)
  - `[NEXT-LESSONS]`: which lessons come after هَذَا وَهَذِهِ, and how many per term. (Dropped from the 12-slide deck.)
  - `[ART-COUNT]`: progress of the illustrated picture set. At planning time (2026-10-25) 39 of 52 masters exist in `assets/art/hi/` (pic 19/24, Noori 3/6, story 7/8, site 10/14) and 6 web copies. The builder recounts with `ls assets/art/hi/*/ | wc -l` against the 52 `gen` lines in `gen-art.sh` and writes the real number. (Slide 10.)
- **To verify before presenting** (marked ✱ in the table):
  - ✱1 Lulu prices are October 2026 estimates from PRINTING-GUIDE.md; confirm in Lulu's calculator before quoting a budget. The class-of-20 figure is illustrative arithmetic (20 × $8 = $160, 20 × $15 = $300), books only, shipping extra.
  - ✱2 No Lulu proof copy has been printed yet (book README "Open: a proof copy from Lulu").
  - ✱3 The image and animation guide (`guide.html`) does not exist yet; the hub lists it. It is presented as the next step, not as done.
  - ✱5 The hub's label "flagship" on Andalus is the designer's mark, not a decision; the slide says so.

| # | data-id | layout | claim (the slide's h2) | content and facts (with source) | role | min |
|---|---|---|---|---|---|---|
| 1 | start | title, `data-tone="hero"` | Nawras: Fusha for little hearts, by the Pacific | h1 «نَوْرَس» + "Nawras Fusha School, San Diego"; label «مَدْرَسَةُ نَوْرَس لِلْفُصْحَى»; tagline «نَتَعَلَّمُ الْفُصْحَى بِفَرَحٍ». Subtitle = the promise: "Five decisions in ten minutes." Picture `img/hilal-badge.svg`. | promise | 0.5 |
| 2 | idea | statement | Fusha has only our hours, so one lesson, written once, reaches the child four ways | Label "The idea". Four chips built one per click: "on a screen at home" · "on the classroom TV with the teacher" · "in a printed book they write in" · "read aloud in their ears". Closing line "Teachers teach. Nawras makes it joyful." A question to the room in the script (does your child run in or drag their feet?). Source: BRIEF; lessons/presentation/PLAN.md audience line. | question, thesis | 1 |
| 3 | site | two-column (interactive) | This is the Nawras website: scroll it, then open it on your own phone | Label "The website". The flagship homepage `../mockups/02-pacific.html` shown large as a live, scrollable iframe (pointer-events on) in a browser-window frame whose address bar reads hisham-abuella.github.io/Madrasa. Right column: button "Open the website ↗" (new tab); callout "Book a free trial class" (the one action for parents, the real CTA in the page); hint "scroll inside · click outside to continue". Arrow keys advance the deck whenever focus is outside the frame. Source: BRIEF (one action per page), mockups/02-pacific.html. | evidence | 0.75 |
| 4 | name | image-right | The seagull flies far and comes home, like our children returning to the language of the Qur'an | Figure `img/noori-happy.webp`. Bullets (3): «نَوْرَس» Nawras = the seagull, San Diego's coastal bird · mascot «نُورِي» Noori, from «نُور» light: round, kind, never scary · tagline «نَتَعَلَّمُ الْفُصْحَى بِفَرَحٍ». One small line: "Also prepared: شَاطِئُ الضَّاد · لُؤْلُؤَةُ الْفُصْحَى · الْأَنْدَلُسُ الصَّغِيرَة · هِلَال" (BRIEF alternate names). | evidence, story | 0.75 |
| 5 | logo | two-column (interactive) | We drew six logos and recommend the Gull and Crescent, with Noori's face as the app icon | Six thumbnail buttons (`img/logo-c1..c6.webp`) change one big logo with the typeset «نَوْرَس» wordmark, its Arabic + English name, a one-line reason (logos/index.html), a 32 px favicon preview, a light / dark background toggle. "Recommended" on 1, "App icon" on 6. Link "All six on one page" → `../logos/index.html`. 28 versions tried, no letters in the drawings. | evidence, question | 1 |
| 6 | look | two-column (interactive) | Six layouts and six colour themes are live: choose the look that feels like your school | Live iframe of `../mockups/02-pacific.html`. Row "Layout": the six mockups. Row "Theme": andalus, pacific, fanous, kurrasa, mosaic, mihrab, applied by `postMessage({nawras:'theme', id})` and `?theme=id` (assets/kids.js). Under the frame: theme name AR + EN and a one-line mood (hub index.html). Hub "flagship" on Andalus is the designer's mark, not a decision. | evidence, question | 1.25 |
| 7 | lesson | two-column, `data-cols="3"` | One grammar lesson, «هَذَا وَهَذِهِ», is ready three ways: to read, to hear, to present | Three cards built one per click, each screenshot + title + one line + link: `../lessons/article.html`, `story.html`, `presentation.html` (as in the old plan; sources: hub lesson cards, lessons/presentation/PLAN.md). | evidence | 1 |
| 8 | write | image-left | Children write with a finger or an Apple Pencil, and are praised, never marked wrong | Figure `img/writing-pad.png`. Bullets (4): trace the ة, then «هَذَا / هَذِهِ», then a sentence · start at the green dot, right to left · big buttons: pen colours, eraser, undo, clear, save · «انْتَهَيْتُ» gives a star; no auto-grading. Link "Try it" → `../lessons/story.html`. Source: BRIEF "Writing practice". | evidence | 0.75 |
| 9 | book | image-right | A 32-page printed book, and its QR code reads it aloud | Figure: `img/book-pages.png` (all 32 pages) + `img/qr-book.svg` (≥ 200 px, quiet zone kept) + two listen buttons (play on click only): «فُصْحَى» → `audio/clips/salam-fusha.mp3`, «مَصْرِي» → `salam-eg.mp3`. Bullets (3): 8.5 × 8.5 in square, full colour, printed on demand by Lulu · 14 story pages, 11 exercises, certificate, answers · QR on every exercise page opens the web book, read aloud in two voices (56 clips: 28 Fusha by Sarah, 28 Egyptian by Hisham). PDF buttons (new tab): See the book → `../book/print/noori-shell-lulu-interior.pdf`; Cover → `-lulu-cover.pdf`; Print at home (A5 booklet) → `noori-shell-home-a5.pdf`; Worksheets Letter / A4 → `-worksheets-letter.pdf` / `-a4.pdf`; Web book → `../book/books/noori-shell.html`. Source: book/README.md. | evidence | 1.25 |
| 10 | adab | two-column | Every picture follows Islamic adab, and Nawras serves your teachers, never replaces them | Col 1 "Our adab rules": no prophets or angels · no Qur'an verses as decoration or in games · modest clothing on every child · no music, only soft sounds. Col 2 "What it is not" (coral rule): not a replacement for the teacher · not an app, no subscription · not auto-grading · not yet a full curriculum. Source: BRIEF content rules; book/README.md Status. | evidence, fence | 1 |
| 11 | grow | process | Every new lesson follows the same five steps, from one written lesson to screen, paper and sound | Five steps, one line each (write once · draw on our own computer · build web book and slides · print files and QR checked · narration checked word by word). Strip: "In progress: colour pictures, N so far" · "Next: a short guide for images and animation". Source: BRIEF, gen-art.sh. | evidence | 0.75 |
| 12 | ask | ask | Five decisions today let one class start | Five numbered items: Look (one of the six; your call) · Logo (Gull & Crescent + Noori face) · Pilot class (which grade, which teacher, from when: blanks to fill together) · Fusha proofreading (coral highlight) · Printing budget (Lulu about $8–15 a copy, $160–300 for a class of 20, estimates Oct 2026; one proof copy first, 5–10 days). Strip: "Website: $0 extra" · "Home booklet: $1–3" · "Proof copy: 5–10 days". Sources: book/README.md, PRINTING-GUIDE.md. | contribution (the ask), question | 1.25 |
| 13 | close | closing | Your school now has a name, a look, a lesson and a book, ready for one class to try | Picture `img/noori-cheer.webp`; tagline; `hisham-abuella.github.io/Madrasa`; small reference line: repo https://github.com/hisham-abuella/Madrasa (private, ask Hisham for access). | contribution, thesis | 0.5 |

**Total**: 13 slides, about 10 minutes (data-duration 10), questions after. The deck ends on the close; there is no appendix. The old Backup section is folded in: alternate names on slide 3, Lulu settings and the voices on slide 8. Narration scripts total about 1,300 English words (about 9 minutes at 140 words a minute, the rest in pauses and the interactive demos).
**Restatements of the story**: slide 2 (one lesson, four ways, stated once) and slide 12 (as the result); no other slide repeats it.


## Look: exact settings

On `<html>`: `lang="en" dir="ltr" data-theme="trainer" data-fonts="readex"`. Run
`node "$S/scripts/add-look.mjs" /Users/hishamabuella/Work/Arabic-school/pitch/index.html --theme trainer` (and `--fonts readex` if that pairing is not carried by the theme) before the checker. Add Google Fonts
`Noto Naskh Arabic:wght@400;700` (offline it falls back to Geeza Pro).

Deck `<style>` override (Pacific values from `assets/kids.css` and the classroom deck plan; contrasts from that plan):

```css
html[data-theme="trainer"]{
  --brand:#0B7A7E; --brand-text:#0B6E72; --on-brand:#FFFFFF;      /* white on teal 5.1:1; #0B6E72 on white 6.0:1 */
  --s1:#0B7A7E; --bleed-bg:#0B7A7E;
  --hero-bg:#0B3540; --hero-ink:#FFF9EE; --hero-ink2:#BFE3E6;      /* Nawras dark teal */
  --hero-brand:#FFC94A; --hero-rule:#1F5A66;
  --bg2:#FFF6E0; --rule:#CBE6E2; --muted-bar:#CBE6E2;
  --hot:#FF7A5C; --hot-text:#B8391C;                              /* coral: fill only; #B8391C on white 5.8:1 */
  --ink:#0B3540; --ink2:#3A6470;
}
html{ --f-naskh:"Noto Naskh Arabic","Geeza Pro","Amiri",serif; }
.ar{ font-family:var(--f-naskh); direction:rtl; unicode-bidi:isolate; letter-spacing:0; }
```

The trainer theme draws a tile band on content slides with a hard-coded lapis stroke (`%231B4F9C`); copy that one rule into the deck `<style>` with the stroke changed to `%230B7A7E`. Wrap every Arabic word in `<span class="ar" lang="ar">`, fully vowelled as written in this plan; never letter-space Arabic; when colouring the ة inside a word, split with `&zwj;` on both sides (BRIEF). One accent only: coral marks "recommended", the fence's "not" column and the ask's item 4; nothing else is coral.

## Build notes

- **Folder**: deck at `/Users/hishamabuella/Work/Arabic-school/pitch/index.html`; every link relative (`../mockups/…`, `../lessons/…`, `../logos/index.html`, `../index.html`) so it works from `file://` and under `https://hisham-abuella.github.io/Madrasa/pitch/`. Links open in a new tab (`target="_blank" rel="noopener"`).
- **Images** (copy into `pitch/img/`; convert the 1536 px PNG masters to WebP at ≤ 1200 px, e.g. `sips -Z 1200` then `cwebp -q 82`, to keep the deck light):
  - `logos/svg/hilal-badge.svg` → `img/hilal-badge.svg`
  - `assets/art/hi/noori/happy.png` → `img/noori-happy.webp`; `assets/art/hi/noori/cheer.png` → `img/noori-cheer.webp`
  - `logos/img/c1.webp` … `c6.webp` → `img/logo-c1.webp` … `logo-c6.webp`
  - `$SHOTS/xmontage.png` → `img/looks-montage.png` (no longer used)
  - `$SHOTS/lessons/article-1280.png` → `img/lesson-article.png`; `$SHOTS/lessons/story-1280-03.png` → `img/lesson-story.png`; `$SHOTS/deck-lesson/presentation-05.png` → `img/lesson-slides.png`
  - `$SHOTS/lessons/story-1280-11b-written.png` → `img/writing-pad.png`
  - `assets/art/pic/shell.webp` → `img/shell.webp` (no longer used)
  - `book/build/prev-int.png` → `img/book-pages.png`
  - `book/input/qr/qr-book.svg` → `img/qr-book.svg`
  - `book/images-noori-shell/friends.png` → `img/friends.webp`
  - `book/audio/ar/salam.mp3` → `audio/clips/salam-fusha.mp3`; `book/audio/eg/salam.mp3` → `audio/clips/salam-eg.mp3`
  - where `$SHOTS=/private/tmp/claude-501/-Users-hishamabuella-Work-Arabic-school/d88abab3-a4d7-40f9-b268-0ee19b844ff0/scratchpad/shots` (a temporary folder: copy them first). Alt text on every image, in English with the Arabic name.
- **No narration** — presenter speaks; notes are the script. No audio tracks, no voice switch, no sound button; the engine's narration feature is removed from `_base.html`.
- **Speaker notes** (`<aside class="notes">`): the English script first, then a line `— مصري —`, then the Egyptian script, then a short "Sources:" line with the files from the table row. The presenter speaks live from them.
- **Slide 8 (book) listen buttons** must not play on slide enter and must stop when the slide is left; they play the book's sample audio (`audio/clips/`), not deck narration.
- **Checks**: `node "$S/scripts/check.mjs" pitch/index.html`, `--themes`, `--shots`, and `--outline` must match this table row for row. Look at slides 4, 5, 8 and 11 in the screenshots (densest and interactive; the QR must be large and square). Scan the QR from the projected screen with a phone.


## Speaker notes: the script (one per slide; English, then Egyptian Arabic). No narration; the presenter speaks.

Rules held: spoken sentences, no symbols or digits; numbers in words; no Latin letters inside Arabic; names transliterated (لولو، سان دييجو، آيباد، كيو آر). Egyptian is natural مصري, not a translation. About 45 to 60 seconds each (the ask is longer).

### 1 · start
**EN**: Assalamu alaikum. In ten minutes I will show you what we built for your school, under one name: Nawras. At the end I will ask you for five decisions: which look, which logo, which class tries it first, which teacher checks the Foos-ha, and how many books to print. Let us start with the children.

**EG**: السلام عليكم. في عشر دقايق هوريكم اللي عملناه للمدرسة تحت اسم واحد: نَوْرَس. وفي الآخر هطلب منكم خمس قرارات: أنهي شكل، وأنهي شعار، وأنهي فصل يجرّب الأول، ومين من المدرّسين يراجع الفصحى، وكام كتاب نطبع. يلّا نبدأ بالأولاد.

### 2 · idea
**EN**: Our students live in English, and at home in a dialect. Foos-ha, the language of the Qur'an, gets only the hours they spend with us. So those hours must be joyful. Let me ask you, as parents: when your own child comes to Arabic class, do they run in, or drag their feet? Here is our idea. We write a lesson once, carefully, in proper Arabic. The child gets it four ways: on a screen at home, on the classroom TV with the teacher, in a printed book they write in, and read aloud in their ears. Teachers teach; Nawras makes it joyful.

**EG**: ولادنا عايشين بالإنجليزي، وفي البيت بلهجة. والفصحى، لغة القرآن، مالهاش غير الساعات اللي معانا. يعني الساعات دي لازم تبقى فرحة. خلّوني أسألكم كأهالي: لما ابنكم أو بنتكم بييجوا حصة العربي، بيجروا على الفصل ولا بيتسحبوا؟ فكرتنا بسيطة. بنكتب الدرس مرة واحدة، بعناية، وبعربي سليم. والطفل ياخده بأربع طرق: على الشاشة في البيت، وعلى شاشة الفصل مع المدرّس، وفي كتاب مطبوع يكتب فيه، ومسموع في ودانه. المدرّسين بيعلّموا، ونَوْرَس بيخلّي التعليم فرحة.

### 3 · site
**EN**: This is the website itself, the real homepage, not a picture. Scroll inside the frame and look around. Parents see Noori, the colours, and Arabic words with an English line underneath. And they see one thing to do: Book a free trial class. Press the button to open it in its own tab, then try it on your own phone.

**EG**: ده الموقع نفسه، الصفحة الرئيسية الحقيقية، مش صورة. اسحبوا جوّه الإطار وشوفوا براحتكم. ولي الأمر هيشوف نوري والألوان، وكلمات عربي وتحتها سطر إنجليزي. وهيشوف حاجة واحدة يعملها: احجز حصة تجريبية مجانية. دوسوا على الزرار يفتح في تبويب لوحده، وجرّبوه على موبايلكم.

### 4 · name
**EN**: The name is Nawras, the seagull. Children in San Diego see seagulls every time they go to the beach. A seagull flies far and always comes home, like our children returning to the language of the Qur'an. Our mascot is a young seagull called Noori, from nur, light. He is round and kind, never scary. If you prefer another name, we prepared four more; they are at the bottom of the slide.

**EG**: الاسم نَوْرَس. والنورس الطفل في سان دييجو بيشوفه كل ما يروح البحر. بيطير بعيد وبيرجع دايمًا لبيته، زي ولادنا وهما راجعين للغة القرآن. والشخصية بتاعتنا نورس صغير اسمه نوري، من النور. مدوّر وطيّب وعمره ما يخوّف. ولو حابّين اسم تاني، جهّزنا أربع أسامي كمان، مكتوبين تحت.

### 5 · logo
**EN**: We drew six logo ideas, and you can try them yourselves: tap a number. None of the drawings has letters in it; the name is set in real Arabic type underneath. Switch the background to see it on light and on dark. Our recommendation is number one, the Gull and Crescent: the crescent says Islamic, the wave says San Diego, and Noori says children. For small places, like a phone icon, we pair it with number six, Noori's face. The tiny one shows how it looks on a phone.

**EG**: رسمنا ست أفكار للشعار، وتقدروا تجرّبوهم بنفسكم: دوسوا على أي رقم. مفيش حرف جوّه الرسمة، والاسم مكتوب تحتها بخط عربي حقيقي. غيّروا الخلفية تشوفوه فاتح وغامق. ترشيحنا رقم واحد: النورس والهلال. الهلال بيقول إسلامي، والموجة بتقول سان دييجو، ونوري بيقول أطفال. وللأماكن الصغيرة، زي الصورة الصغيرة اللي على شاشة الموبايل، معاه رقم ستة: وش نوري. والدايرة الصغيرة بتوريكم شكله على الموبايل.

### 6 · look
**EN**: Now the look of the website. There are six layouts and six colour themes, and they mix. Choose a layout in the top row, then a theme in the second row, and watch the page change. Andalus is a garden arch, Pacific is the ocean and the most playful, Fanous is lanterns at night, Kurrasa is a school notebook, Mosaic is bold tiles and stars, and Mihrab is soft and quiet. Which one feels like your school? You do not have to answer now; I will ask again at the end.

**EG**: دلوقتي شكل الموقع. فيه ست تصاميم وست ألوان، وبيتخلطوا مع بعض. اختاروا التصميم من الصف اللي فوق، وبعدين اللون من الصف التاني، وشوفوا الصفحة بتتغيّر. الأندلس قوس وجنينة، والمحيط بحر وهو أكتر واحد فيه لعب، والفانوس فوانيس بالليل، والكرّاسة كشكول مدرسة، والفسيفساء بلاط ملوّن ونجوم، والمحراب ناعم وهادي. أنهي واحد حاسّين إنه شبه مدرستكم؟ مش لازم تجاوبوا دلوقتي، هسألكم تاني في الآخر.

### 7 · lesson
**EN**: To show the format, we built one real lesson for grades one and two: hadha and hadhihi, "this" for masculine and for feminine words. The little ta marbuta becomes a seashell that Noori finds on the beach. The lesson comes three ways. An article to read together, about fifteen minutes, with five questions and a worksheet. A story with Noori and his friends Sami and Salma, read aloud in classical Arabic or Egyptian. And slides for the teacher, eighteen of them in about twenty minutes, with games. Tap a card to open any of them.

**EG**: علشان نوريكم الطريقة، عملنا درس حقيقي لأولى وتانية ابتدائي: هذا وهذه، هذا للمذكّر وهذه للمؤنّث. والتاء المربوطة بقت صدفة صغيرة نوري بيلاقيها على البحر. والدرس موجود بتلات طرق. مقالة يقروها مع بعض، حوالي ربع ساعة، فيها خمس أسئلة وورقة تمارين. وقصة فيها نوري وصاحبيه سامي وسلمى، مقروّة بالعربي السليم أو بالمصري. وعرض للمدرّس، تمنتاشر شريحة في حوالي عشرين دقيقة، فيه ألعاب. دوسوا على أي كارت يفتح.

### 8 · write
**EN**: Tapping is not enough; children must write. On an iPad the child traces the shell letter, then hadhihi, with a finger or an Apple Pencil, from the green dot, right to left. The buttons are big: colours, eraser, undo, clear. When they press "I finished", they get a star. We never grade handwriting automatically and never mark it wrong; that judgement stays with the teacher.

**EG**: الدوس مش كفاية، لازم الطفل يكتب. على الآيباد بيمشي على حرف الصدفة، وبعدين كلمة هذه، بصباعه أو بقلم الآيباد، من النقطة الخضرا، من اليمين للشمال. والزراير كبيرة: ألوان وأستيكة ورجوع ومسح. ولما يدوس انتهيت ياخد نجمة. وعمرنا ما بنصحّح الخط لوحده ولا بنقول للطفل غلط؛ الحكم ده بتاع المدرّس.

### 9 · book
**EN**: Now off the screen and into their hands. This is the book: Noori and the Little Shell. Thirty-two pages, square, in full colour, printed on demand by Lulu. Fourteen story pages, eleven exercise pages, a certificate, and an answer page for parents. On every exercise page there is a QR code; a parent scans it and the book opens on the web, read aloud in proper Arabic or in Egyptian. Scan this one now, or press a button to hear. The buttons below open the real print files: the book, the cover, a booklet to print at home, and the worksheets.

**EG**: ودلوقتي من الشاشة لإيد الطفل. ده الكتاب: نوري والصدفة الصغيرة. اتنين وتلاتين صفحة، مربّع، ألوان كاملة، بيتطبع عند الطلب في لولو. أربعتاشر صفحة قصة، وحداشر صفحة تمارين، وشهادة للطفل، وصفحة إجابات للأهل. وعلى كل صفحة تمرين كود كيو آر؛ ولي الأمر يصوّره والكتاب يفتح على النت مقروء بصوت عالي، بالعربي السليم أو بالمصري. صوّروا الكود ده دلوقتي، أو دوسوا على زرار تسمعوا. والزراير اللي تحت بتفتح ملفات الطباعة الحقيقية: الكتاب، والغلاف، وكتيّب يتطبع في البيت، وورق التمارين.

### 10 · adab
**EN**: You care about adab, and so do we. These rules are written into everything we make. No pictures of prophets or angels. No verses of the Qur'an as decoration or inside a game. Modest clothing on every child; when a picture came out wrong, we drew it again. No music, only soft sounds. And a word about what Nawras is not. It does not replace your teachers: the teacher presents and judges the writing. It is not an app, and families pay no subscription. And today it is one lesson that shows the format, not a full curriculum.

**EG**: إنتو بتهتمّوا بالأدب الإسلامي، وإحنا كمان، والقواعد دي مكتوبة في كل حاجة بنعملها. مفيش صور للأنبيا ولا للملايكة. مفيش آيات من القرآن للزينة ولا جوّه لعبة. لبس محتشم لكل طفل، ولما صورة طلعت غلط رسمناها من الأول. مفيش مزيكا، بس أصوات هادية. وكلمة عن اللي نَوْرَس مش هو. مش بديل للمدرّس: المدرّس هو اللي بيعرض وبيحكم على الخط. ومش أبلكيشن، ومفيش اشتراك على الأهالي. والنهارده هو درس واحد بيوري الطريقة، مش منهج كامل.

### 11 · grow
**EN**: How does this grow beyond one lesson? Every new lesson follows the same five steps. We write it once, every word in proper Arabic. We draw the pictures on our own computer, so Noori always looks like himself. We build the web book and the slides from that text. The print files and QR codes are made and checked automatically. And the narration is recorded and checked word by word. Right now we are drawing a fuller set of colour pictures, and the next step is a short guide for pictures and animation.

**EG**: طب إزاي ده يكبر لأكتر من درس؟ كل درس جديد بيمشي في نفس الخمس خطوات. بنكتبه مرة واحدة، كل كلمة بعربي سليم. وبنرسم الصور على جهازنا إحنا، علشان نوري يفضل شكله هو هو. والكتاب اللي على النت والعرض بيتعملوا من نفس النص. وملفات الطباعة وأكواد الكيو آر بتتعمل وتتراجع لوحدها. والتسجيل الصوتي بيتعمل وبيتراجع كلمة كلمة. ودلوقتي بنرسم مجموعة صور ملوّنة أكبر، والخطوة الجاية دليل قصير للصور والحركة.

### 12 · ask
**EN**: So here are the five decisions. One: the look, one of the six; the choice is yours. Two: the logo; we recommend the Gull and Crescent, with Noori's face as the icon. Three: a pilot class, which grade and which teacher, and from when; let us fill that in together. Four: one teacher who proofreads the Arabic, every vowel mark, before anything is printed. This one matters most, because children copy exactly what they see. Five: a printing budget. A Lulu paperback is about eight to fifteen dollars a copy, so a class of twenty is about one hundred and sixty to three hundred dollars; these are October estimates. We print one proof copy first, which takes five to ten days. The website costs nothing extra, and a home booklet costs one to three dollars. Which of these can we decide today?

**EG**: يبقى دي الخمس قرارات. واحد: الشكل، واحد من الستة، والقرار قراركم. اتنين: الشعار، وترشيحنا النورس والهلال، ووش نوري للصورة الصغيرة على الموبايل. تلاتة: فصل للتجربة، أنهي سنة وأنهي مدرّس، وإمتى نبدأ؛ نملّيها سوا. أربعة: مدرّس يراجع العربي السليم، كل حركة وكل تشكيلة، قبل ما أي حاجة تتطبع. ودي أهم واحدة، لأن الأطفال بينقلوا بالظبط اللي بيشوفوه. خمسة: ميزانية للطباعة. نسخة الكتاب من لولو تقديرها من تمانية لخمستاشر دولار، يعني فصل فيه عشرين طفل من مية وستين لتلتمية دولار، وده تقدير شهر أكتوبر. وبنطبع نسخة تجربة الأول، بتاخد من خمس لعشر أيام. والموقع مش هيكلّفنا حاجة زيادة، وكتيّب البيت بدولار لتلاتة. أنهي واحدة فيهم نقدر نقرّرها النهارده؟

### 13 · close
**EN**: Here is what your school has today: a name, a look, a logo, one lesson in three forms, and a book with its own voice. One lesson, written once in careful, proper Arabic, reaching each child on a screen, in class, on paper and in their ears. With your five decisions, it reaches your students next. May Allah bless your school, your teachers and your children.

**EG**: ده اللي عند مدرستكم النهارده: اسم، وشكل، وشعار، ودرس واحد بتلات طرق، وكتاب بصوته. درس واحد، مكتوب مرة واحدة بعربي سليم، بيوصل لكل طفل على الشاشة، وفي الفصل، وعلى الورق، وفي ودانه. وبالخمس قرارات بتوعكم، يوصل لتلاميذكم. ربنا يبارك في مدرستكم، وفي المدرّسين، وفي الولاد.
