---
name: topic-book
description: Make a new Nawras lesson book for an Arabic grammar topic, on exactly the pattern of «نُورِي وَالصَّدَفَةُ الصَّغِيرَةُ» (noori-shell) — spec with full tashkeel, Noori/Sami/Salma art drawn locally one picture at a time, web book with Fusha/Egyptian narration, Lulu interior + cover, A5 booklet, worksheets, QR codes, hub card, push to GitHub Pages. Use whenever the user asks for a new topic book, a second/next lesson book, "كتاب جديد", "كِتَابُ دَرْسٍ جَدِيدٌ", "make a lesson book about <grammar topic>" (المثنى، الجمع، الضمائر، أدوات الاستفهام…), a book sample for another lesson, or wants one step of that (spec, art, print, narration, wire-up) redone for a topic book — even if they don't say "skill" or "Noori".
---

# A new Nawras topic book

Every topic book is the Noori book with the topic swapped. The owners judge the
series by how alike the books are: same 32 pages, same characters and picture
style, same exercise types in the same order, same ornament border and pattern,
same Lulu settings and checks. So the job is **copy, then swap content** — never
redesign. Read `BRIEF.md` (content rules, voices, "ONE AT A TIME") before starting.

Worked examples, both in `book/`:
- `stories/noori-shell.json` — the template (هَذَا / هَذِهِ, the ة). Never edit it for another book.
- `stories/noori-two.json` — the dry run of this skill: «نُورِي وَالصَّدَفَتَانِ», singular and dual
  (وَلَدٌ → وَلَدَانِ). A full spec with a `topic` block and `proof` items; pictures are placeholders.

All commands run from `book/` unless they start with `.claude/`.

| Step | What | Command |
|---|---|---|
| 0 | Ask the inputs, one round | AskUserQuestion |
| 1 | Scaffold, write the spec, check it | `.claude/skills/topic-book/scripts/new-topic-book.sh <slug>`, `check-spec.js <slug>` |
| 2 | Art: prompts, seeds, draw one at a time, review, web copies | `source/gen-<slug>.sh`, `tools/try-seeds.sh`, `tools/contact-sheet.py`, `tools/web-art.sh` |
| 3 | Web book + print + every check | `zsh tools/build-book.sh <slug>`, `bash tools/print-book.sh <slug>` |
| 4 | Narration | `~/Work/Elevenlabs-voice/{lint-transcript.js,generate.js,qa-audio.py}` |
| 5 | Hub card, PDF links, README row (+ optional 3 lesson styles) | edit `index.html`, `README.md` |
| 6 | Commit, push, check Pages + QR | when the user says so |

## 0. Inputs — ask once, in one round

Late details mean rewritten pages and redrawn pictures, so ask everything together
(AskUserQuestion, several questions in one call) and offer the defaults:

| Ask | Default if they don't say |
|---|---|
| Grammar topic, Arabic + English (e.g. «المُفْرَدُ وَالمُثَنَّى» / singular and dual) | — (required) |
| Grade | 1–2 |
| 6–10 example words (with the pair they turn into, if the topic is a change) | you propose, user approves |
| Title idea | «نُورِي وَ…» + an object from the topic, so the series reads as one |
| The "fence" (the exception children must learn) | you propose from the grammar |
| Anything they don't want in the story | none |

Everything else is fixed by the template: characters (Noori, Sami, Salma), San Diego
beach, voices, 8.5″ square Lulu, QR URL pattern, accent colour, ornament. Then show a
one-screen page plan (14 story pages: key · idea · picture) and wait for approval
before writing the words.

## 1. The spec: `book/stories/<slug>.json`

**a. Slug and scaffold.** Lowercase-with-hyphens, starting `noori-` (`noori-two`,
`noori-plural`). It must not be a prefix of another slug (`noori` vs `noori-shell`
would make file globs ambiguous); the scaffold refuses it.

```sh
bash .claude/skills/topic-book/scripts/new-topic-book.sh <slug>
```

It copies `noori-shell.json` page for page (slug set, a `topic` stub) and writes
`source/gen-<slug>.sh` with the fixed characters/style/negatives and one TODO
`gen` line per picture. It never overwrites.

**b. Keep the structure; swap the words.** The 33 entries stay in this order (the
cover is its own file, so the interior is 32):

| Interior pages | Type(s) | Swap |
|---|---|---|
| 1 | `title` | title, keep "هَذَا الْكِتَابُ لِـ:" |
| 2 | `about` (+ QR) | 4 Arabic / 5 English paragraphs for parents: idea, rule, fence, how to use, scan |
| 3–16 | 14 × `story` | same arc as Noori: greeting · friends · first examples · the key mark page (`big`) · pairs · the question page ("انْتَبِهُوا!") · the fence answer · extension (adjective agreement) · goodbye |
| 17 | `recap` | `masc` / `fem` = the two sides' word lists, `rule`, `fence`; `heads` optional |
| 18–28 | `trace, trace, trace, write, circle, addta, match, fill, adj, draw, draw` | the same 11 types, numbers 1–11; keys may change (`ex-…`) |
| 29–32 | `certificate, answers, practice, end` | wording only; answers are generated from the exercises |

Keys `cover title about recap certificate answers practice end` are looked up by name:
keep them. Story keys are free (they name the pictures, audio clips and QR anchors).

**c. The `topic` block** tells the tools what to colour and what the exercises choose
between. Defaults are the Noori book (`tools/lib.js` → `TOPIC_DEFAULT`); give only what
differs. Two sides everywhere: `m` = first choice (blue), `f` = second (coral); every
`ans` is `"m"` or `"f"`.

| Field | Meaning (noori-two value) |
|---|---|
| `auto` | words coloured everywhere, `[word, side]` (`[["هَذَانِ","f"],["هَاتَانِ","f"],["هَذَا","m"],["هَذِهِ","m"]]`) — one regex, longest first, so هَذَانِ is never split |
| `ending`, `last` | regex of the ending `[[word]]` colours, and colour the last match (`"ا[ً-ْٰ]*ن[ً-ْٰ]*"`, `true`) |
| `lone` | the mark coloured when it stands alone in text (`["ـَانِ","انِ"]`) |
| `choices` | the two words of circle/match/fill/recap (`["مُفْرَدٌ","مُثَنًّى"]`); a page may set its own `choices` (noori-two's fill page: `["هَذَا","هَذَانِ"]`) |
| `recapFirst` | which column sits on the right of the recap (`"m"`) |
| `hint`, `adjHint`, `addMark`, `addHint`, `addAria`, `addBoxAria`, `fillFence` | web hints, the add-the-ending button, the print box label, the fill page's reminder |
| `answersEn` | the English labels on the answers page (keep them short: the page is full) |
| `coverAlt`, `coverAltPrint`, `backLine`, `backLineEn` | cover alt text and the back-cover blurb |

Picture items may take `"n": 2` (two copies of the `KS.pic` side by side — for "two"
topics); the add-the-ending page may take `"boxMm": 24` for a wider writing box. Both
are emitted only when used, so the Noori book builds byte-for-byte as before.
`KS.pic` names are the keys of `LABELS` in `assets/kids.js` (boy, girl, book, pen,
fish, boat, sun, moon, palm, shell, cat, …); the checker rejects others.

**d. Writing rules** (BRIEF.md; they are why the book is approved):
- **Fusha, full tashkeel on every Arabic word a child reads** (`ar.*`, exercise rows,
  trace models). Naskh does the rest. The checker flags thin words; look at each.
- `en` is for parents: short, plain, one practical sentence in each `note`.
- `eg` is Egyptian that *explains*, keeping the Fusha target words exactly as on the
  page (هذانِ وَلَدانِ). Every narrated page needs `eg.say`; `ar.say` on the cover,
  recap, exercises and certificate (story pages are read from `name/line/sound`).
- Voice tags only from the lint list (`[warmly] [cheerful] [gently] [playfully]
  [curious] [excited] [happy] [softly]`), `<break time="0.4s" />` between ideas.
- Content: Islamic greeting on page 3 is welcome; no prophets, angels, Qur'an verses as
  decoration; no grown-ups in scenes (they live in the words); modest dress.
- **Grammar checklist** — before showing the spec, check each against a grammar
  reference, not memory: the rule as stated is true for grade 1–2 · every example word
  follows it · the fence is a real exception and is taught on its own page · case
  endings agree (no ـَيْنِ / accusative forms unless deliberate) · demonstratives and
  adjectives agree in gender *and* number · mixed groups use the masculine.
- **Proofreading marks (†):** anything a teacher must confirm — a grammar choice, a
  metaphor, a form above grade level, a narration risk (a lone letter read as its name) —
  goes in the page's `"proof": ["† …"]` list. Never put † in the words themselves
  (it would print). `check-spec.js` lists them all for the teacher.

**e. Check the spec** — must end "spec follows the Noori pattern":

```sh
node .claude/skills/topic-book/scripts/check-spec.js <slug>
```

It fails on: a different page/type sequence, not 32 interior pages, exercise numbers,
missing fields, answers that don't fit, unknown `KS.pic`, a `[[word]]` the ending regex
can't colour, any TODO. It warns on thin tashkeel and pictures with no `gen` line.

## 2. Art: `book/source/gen-<slug>.sh` (local Draw Things, ONE AT A TIME)

**One GPU job at a time** (user rule — two parallel jobs restarted the session).
Before every Draw Things run, and never in a parallel subagent:

```sh
pgrep -fl "draw-things|narrate|mlx|voicebox"     # must print nothing
```

**Prompts.** `$NOORI $SAMI $SALMA $SHELL $STYLE $NEG` are copied verbatim from the
Noori script; never retype or "improve" them — the series must look like one hand. Each
page is one `gen <img-key> "<scene with the variables>, $STYLE" <seed>` line, seeds
600 up in page order (+100 per redraw: 7xx, 8xx). A page-only negative goes on its
line: `NEG="$NEG, bird, bow, ribbon" gen qittan "…" 608`, with a comment saying why.
Carry the Noori lessons (comments in `gen-noori-shell.sh`, `assets/art/source/gen-art.sh`
and `guide.html` → "Regeneration log"): place children left / middle / right; repeat
Sami's "short black curly hair uncovered"; repeat Noori's teal scarf when he is small;
cats are a tabby/calico, never white with a bow; ask for "plain blank pages" on books.
For number topics say "exactly two …" and count on the full picture.

```sh
zsh tools/try-seeds.sh <slug> cover 600 4           # test 3–6 varied pages first (cover, a two-child page, the key page)
DEST=$PWD/art-hi/images-<slug> zsh source/gen-<slug>.sh    # run_in_background; skips pages already drawn (~90 s each at 1536px)
python3 tools/contact-sheet.py build/<slug>-sheet.png art-hi/images-<slug>/*.png
bash tools/web-art.sh <slug>                         # 1024px WebP web copies + cover.jpg
```

Swap in a trial: copy `build/<slug>-try/<page>-<seed>.png` to `art-hi/images-<slug>/<page>.png`,
put the seed on its `gen` line, rerun `web-art.sh <slug> <page>`.

**Eye-check every picture** on the sheet, then suspicious ones at full size:
- [ ] Noori: round white/cream body, orange beak, **teal scarf visible**, no extra wings/legs
- [ ] Salma: headscarf covering **all hair, hairline and neck**, nothing showing under it;
      long sleeves; long trousers under the dress; **no bare shins**; socks and shoes
- [ ] Sami: short black curly hair uncovered, long sleeves, long trousers
- [ ] **no text, letters, numbers or squiggle-writing** anywhere (signs, sails, book pages)
- [ ] no grown-ups, no crosses/idols/statues/pigs/bottles, nothing scary
- [ ] the picture matches the words (count: one vs two, who is where)
- [ ] same style as the Noori pages side by side (put one Noori page on the sheet)

Log every accepted seed and every redraw with its reason in the REVIEW LOG at the
bottom of `gen-<slug>.sh` — it is how the next person knows not to "simplify" a prompt.

**No GPU yet?** (dry run, or proofreading before the batch):
`bash tools/placeholder-art.sh <slug> newkey=noorikey …` copies Noori masters, washed
out and stamped PLACEHOLDER, and writes `art-hi/images-<slug>/PLACEHOLDER.txt`, which
forces every print file to `-DRAFT`. Before drawing: `bash tools/placeholder-art.sh <slug> --clear`.

## 3. Build: web book, print files, checks

**URL.** Each book's public URL is `https://hisham-abuella.github.io/Madrasa/book/books/<slug>.html`
(`book.config.json → urlPattern`). Until it is live and opened on a phone, leave the book
out of `books` so it stays `urlConfirmed: false` and every PDF is named `-DRAFT`. Then add
`"books": { "<slug>": { "bookUrl": "…", "urlConfirmed": true } }` and rebuild. Never
change the top-level (noori-shell) values. Per book, the tools keep files apart:
`audio/<slug>/{ar,eg}/`, `input/qr/<slug>/`, `images-<slug>/`, `art-hi/images-<slug>/`,
`input/img-hi/images-<slug>/`, `print/<slug>-*`.

```sh
zsh tools/build-book.sh <slug>        # books/<slug>.html + source/<slug>-{ar,eg}.json
bash tools/print-book.sh <slug>       # QR codes, 5 PDFs, every check; must end "all checks passed"
```

`print-book.sh` makes the Lulu interior (32 pages, 8.5″ + 0.125″ bleed, DECO frames and
pattern from `tools/lib.js`), the cover spread (back + spine + front, zellige band, spine
from Lulu's formula), the A5 home booklet, and the 11 worksheets on Letter and A4; then it
checks the safe area in Chrome, clipped/small text (`check-print-text.py`), Lulu's rules
(`check-lulu.sh <slug>`), and decodes every QR to its exact URL (`check-qr.py <slug>`).

When a check fails, fix the **words**, not the layout: "OUTSIDE THE SAFE AREA:
answers:en" meant the answer captions (`topic.answersEn`) were too long; a clipped story
page means the line is too long for the page — shorten it. Don't edit `make-print.js` CSS
for one book: the series must print alike.

Look at it: `pdftoppm -r 40 -png print/<slug>-lulu-interior*.pdf build/look/p` +
`tools/contact-sheet.py` for all 32 pages, then the cover, recap, key page and two
exercise pages larger. In the web book open the recap, a match page and the add-ending
page at 390px and 1280px wide.

## 4. Narration (ElevenLabs, cloud — only when the user says go)

The scripts come from the spec (`build-book.sh` rewrites them), so rebuild first.

```sh
node ~/Work/Elevenlabs-voice/lint-transcript.js --pair source/<slug>-ar.json source/<slug>-eg.json   # clean, same ids
node ~/Work/Elevenlabs-voice/generate.js --usage                # quota: a book is ~9k characters (≈6.5k credits for Noori)
node ~/Work/Elevenlabs-voice/generate.js source/<slug>-ar.json audio/<slug>/ar \
  --voice EXAVITQu4vr4xnSDxMaL --model eleven_v4 --stability 0.5 --similarity 0.8     # Fusha: Sarah
node ~/Work/Elevenlabs-voice/generate.js source/<slug>-eg.json audio/<slug>/eg \
  --voice pusofH2Ro5Ny4RH6qBEO --model eleven_v4 --stability 0.5 --similarity 0.8     # Egyptian: Hisham's clone
python3 ~/Work/Elevenlabs-voice/qa-audio.py --pair source/<slug>-ar.json audio/<slug>/ar source/<slug>-eg.json audio/<slug>/eg
```

Audio goes to `audio/<slug>/` (only noori-shell uses `audio/` itself); the web book
already points there. The generator skips existing clips: after changing a page's words
delete its two mp3s (or `--force`). Listen to the key page and any `proof` item about
narration (Noori's lone ة was read «تاء»). Optional word check: a local Whisper pass —
it is a GPU job, so the `pgrep` rule applies.

## 5. Wire-up

- `index.html` → the lessons section: copy the noori-shell `lesson-card` (`<a class="card
  card--link lesson-card" href="book/books/noori-shell.html" …>`) for the new slug, its
  cover WebP, title in `<bdi class="word" dir="rtl">«…»</bdi>`, and copy the "Lesson book
  files" line with the five `book/print/<slug>-*.pdf` links + web book. Relative links only.
- `README.md` → a row in the "What's here" table and a "lesson book" files table like Noori's.
- Optional, if asked: the three lesson styles for the topic, copied from
  `lessons/article.html`, `lessons/story.html`, `lessons/presentation.html` (+
  `lessons/presentation/PLAN.md`, story narration `audio/transcripts/story-{ar,eg}.json` →
  `audio/story/`). Put them in `lessons/<slug>/` and fix the relative paths (`../../assets/`);
  keep a writing station in each (trace the mark → trace the pointer words → write a sentence).

## 6. Commit, push, verify (only when the user says so)

```sh
git add -A && git status --short     # only this book's files + index.html + README.md + tool fixes
git checkout -- book/print/noori-shell-*.pdf   # Chrome rewrites bytes even when nothing changed
git commit -m "<what the book teaches now>"    # attribution lines per the session's rules
git push origin main                 # github.com/hisham-abuella/Madrasa (public)
```

Wait for the Pages deploy (~2 min), then each must say 200:

```sh
for u in book/books/<slug>.html book/images-<slug>/cover.webp book/print/<slug>-lulu-interior.pdf book/audio/<slug>/ar/cover.mp3; do
  printf '%s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' "https://hisham-abuella.github.io/Madrasa/$u"; done
```

and one QR read back out of the print file must open that same page:
`uvx --with zxing-cpp --with pillow --with segno python tools/check-qr.py <slug>` (exact URLs),
then `curl` the decoded URL. Hand over the web link and the PDF paths, saying which go to Lulu.

## Final checklist

- [ ] Inputs asked in one round; page plan approved
- [ ] Spec: same 33 entries/32 pages/11 exercise types; full tashkeel; Fusha; grammar checklist done; `proof` items listed for the teacher; `check-spec.js` passes
- [ ] Art: fixed characters/STYLE/NEG; seeds logged; every page eye-checked (scarf, hairline, shins, no text); `web-art.sh` run; no PLACEHOLDER.txt left
- [ ] `print-book.sh <slug>` ends "all checks passed" without `-DRAFT` (URL confirmed in `books`)
- [ ] Narration lint clean, 2 × N clips, `qa-audio.py` clean
- [ ] Hub card + PDF links + README row; links relative
- [ ] Noori untouched: `bash tools/print-book.sh noori-shell` still passes; its PDFs reverted before commit
- [ ] Pushed when asked; Pages URLs 200; QR decodes to the live page

## What not to do

- **Never run two GPU jobs at once** (Draw Things, Whisper, Fish/Voicebox TTS) and never
  start one while `pgrep` shows another. No parallel art subagents.
- **Don't change the Noori book** — its spec, art, audio, top-level config or outputs. A
  tool change for a new topic must keep noori-shell byte-identical (check: rebuild, `cmp`
  the `build/noori-shell-*.html`, revert its PDFs).
- No new characters, styles, outfits or page types; no redesigning the layout per book.
- No text in images — every Arabic letter is typeset by the book.
- No prophets or angels depicted; no Qur'an verses as decoration or in exercises; no
  grown-ups drawn; modest dress always.
- Don't print or upload a `-DRAFT` file, and don't confirm a URL you haven't opened.
- Don't add a dry-run or placeholder book to the hub.
- Don't commit or push until the user asks.
