# «نُورِي وَالصَّدَفَةُ الصَّغِيرَةُ» — Noori and the Little Shell

The Nawras lesson book for **هَذَا / هَذِهِ** (grade 1–2, Fusha, fully vocalised):
14 story pages, a "remember" page, then **11 exercise pages** (tracing, writing, circling,
matching, drawing), a certificate, answers for parents and a writing page.

> **QR URL confirmed (2026-10-25):** https://hisham-abuella.github.io/Madrasa/book/books/noori-shell.html.
> If `book.config.json → urlConfirmed` is ever set back to `false`, print files are named `-DRAFT` again.

Built with the pipeline and rules of `~/Work/bedtime-stories` (storybook skill): one spec
drives the web book, the print PDFs and the narration. The tools were copied into
`book/tools/` and adapted; nothing in bedtime-stories was changed. Everything builds
from inside `book/` (the web book and the print pages also load the shared
`../assets/kids.js` + `kids.css` for `KS.writePad`, `KS.pic` and `KS.gull`).

## Where things live

```
book.config.json            bookUrl (the ONE place the public URL lives) + urlConfirmed
stories/noori-shell.json    the spec: every word on every page (ar / en / eg), exercises
source/gen-noori-shell.sh   the pictures: one fixed Noori, one gen line per page, seeds
source/noori-shell-{ar,eg}.json   narration scripts (made from the spec)
art-hi/images-noori-shell/  1536px masters (the pictures)
images-noori-shell/         1024px WebP web copies of the same pictures (≤150 KB each; cover.jpg for og:image)
input/img-hi/…              print JPEGs of the 1536px masters (not resized)
input/qr/                   QR codes (made from book.config.json)
books/noori-shell.html      the web book
audio/{ar,eg}/<page>.mp3    narration: Fusha (Sarah), Egyptian (Hisham)
fonts/                      Noto Naskh Arabic + Baloo Bhaijaan 2 (static instances for print)
print/                      the finished PDFs
build/                      scratch (print HTML, trial pictures, contact sheets)
tools/                      the pipeline (below)
```

## Rebuild everything

Run from `book/`.

```sh
# 1. Pictures (local, Z-Image Turbo via draw-things-cli; ~1.5 min each at 1536px; one at a time)
DEST=$PWD/art-hi/images-noori-shell zsh source/gen-noori-shell.sh   # skips pages already drawn
zsh tools/try-seeds.sh noori-shell <page> <first-seed> [n]          # try seeds for one page
python3 tools/contact-sheet.py build/sheet.png art-hi/images-noori-shell/*.png   # review for drift
bash tools/web-art.sh noori-shell                                     # 1024px WebP web copies

# 2. Web book + narration scripts (from the spec)
zsh tools/build-book.sh

# 3. QR codes + every PDF + every check (text, Lulu, QR)
bash tools/print-book.sh

# 4. Narration (ElevenLabs eleven_v4, stability 0.5, similarity 0.8)
node ~/Work/Elevenlabs-voice/generate.js --usage
node ~/Work/Elevenlabs-voice/lint-transcript.js --pair source/noori-shell-ar.json source/noori-shell-eg.json
node ~/Work/Elevenlabs-voice/generate.js source/noori-shell-ar.json audio/ar \
  --voice EXAVITQu4vr4xnSDxMaL --model eleven_v4 --stability 0.5 --similarity 0.8
node ~/Work/Elevenlabs-voice/generate.js source/noori-shell-eg.json audio/eg \
  --voice pusofH2Ro5Ny4RH6qBEO --model eleven_v4 --stability 0.5 --similarity 0.8
python3 ~/Work/Elevenlabs-voice/qa-audio.py source/noori-shell-ar.json audio/ar source/noori-shell-eg.json audio/eg
```

Change words → edit `stories/noori-shell.json`, then steps 2–4 (the generator skips clips
that exist: delete the changed page's mp3 first, or pass `--force`).

### Changing the QR URL (one value, one command)

1. Edit `book.config.json → bookUrl` (and set `urlConfirmed: true` once it is final).
2. `bash tools/print-book.sh` — remakes all 12 codes (`qr-book` + one per exercise page,
   `bookUrl#<page-key>`), every PDF, and decodes every code back out of the PDFs.

Note: the web book file is `book/books/noori-shell.html`. If the site is published with
the repo layout unchanged, the public URL will end in `/book/books/noori-shell.html`,
not the current default `/book/noori-shell.html` — set `bookUrl` to wherever the file
really lands, and open the link on a phone before printing.

## The pipeline (tools/)

| Tool | From bedtime-stories | What changed |
|---|---|---|
| `lib.js` | new | shared markup: `[[word]]` colours the ة (ZWJ both sides), هَذَا / هَذِهِ coloured |
| `new-story.js` + `story-template.html` | adapted | Arabic-first, exercise pages, `KS.writePad`, Fusha/مصري narration toggle, English captions toggle, `#page-key` deep links for the QR codes |
| `build-book.sh` | replaces `build-<slug>.sh` / `build-book.py` | runs new-story + make-transcripts |
| `make-transcripts.js` | adapted | ar + eg, id = page key, `say` per page |
| `make-print.js` + `print-pages.js` | adapted | reads the spec; story + exercise layouts; dotted tracing words with green start dots and arrows measured from the real glyphs; formats `lulu`, `cover`, `a5`, `letter`, `a4`; safe-area overflow check in the browser |
| `print-book.sh` | adapted | all five PDFs (`-DRAFT` names while the URL is unconfirmed), all checks |
| `check-print-text.py` | copied | rejoins up to 8 pdftotext fragments (full tashkeel splits words) |
| `check-lulu.sh` | copied | globs; spine from the interior page count |
| `make-qr.py`, `check-qr.py` | adapted | URL from `book.config.json`; checks exact URL per page, symbol ≥ 25mm, quiet zone |
| `try-seeds.sh`, `contact-sheet.py`, `web-art.sh` | copied | unchanged |

## Printing

### Lulu (the real book)

| Setting | Choose |
|---|---|
| Book size | **8.5 × 8.5 in (Square)** |
| Interior colour | **Premium Color** |
| Paper | 80# white coated (Lulu's default for Premium Color) |
| Binding | **Paperback, Perfect Bound** |
| Cover finish | Matte (or Gloss) |
| Interior file | `print/noori-shell-lulu-interior.pdf` — 32 pages, 8.75in square (8.5in + 0.125in bleed), no crop marks, fonts embedded, pictures 300–600ppi |
| Cover file | `print/noori-shell-lulu-cover.pdf` — one spread, back + spine + front |

- **Page count / binding:** perfect binding needs **32 pages minimum**; the book is
  written to exactly 32 interior pages (no blank padding needed). Saddle stitch was not
  chosen because it has no spine and the brief asks for a back + spine + front cover.
- **Spine:** Lulu's softcover perfect-bound formula, `spine (in) = pages / 444 + 0.06`
  ([Lulu: How is spine width calculated?](https://help.api.lulu.com/en/support/solutions/articles/64000254616-how-is-spine-width-calculated-)):
  32 / 444 + 0.06 = **0.1321 in (3.36 mm)**. Cover spread = 2 × 8.5 + 0.1321 + 2 × 0.125
  = **17.3821 × 8.75 in**. The spine is too thin for text (plain paper colour).
- Lulu binds on the left only, so the book opens like an English book; each page is
  self-contained, so the Arabic still reads page by page.
- Lulu's barcode area (bottom right of the back cover) is left empty; the QR sits left.
- **Order one proof copy first**: check colours, the Arabic, and that every QR scans from paper.

**Cost estimate** (PRINTING-GUIDE.md, Oct 2026 prices — confirm in Lulu's calculator):
paperback 8.5″ square premium colour **≈ $8–15 per copy** + shipping ≈ $5–10.
(A hardcover casewrap would be ≈ $16–25; it needs its own cover template.)

### At home and for teachers

| File | What it is |
|---|---|
| `print/noori-shell-home-a5.pdf` | A5 booklet: cover, all 32 pages, back (36 pages, 2 blanks before the back). Acrobat → Print → Page Sizing → **Booklet**, double-sided, flip on short edge, fold and staple. |
| `print/noori-shell-worksheets-letter.pdf` | the 11 exercise pages alone, US Letter, with a Name line and a QR per page |
| `print/noori-shell-worksheets-a4.pdf` | the same on A4 |

Exercise pages are white with thin lines for pencil and crayon; writing lines are 26mm
(8mm letter body, baseline + dotted mid-line); don't laminate them.

## Page map (for the classroom deck)

| Pages | What |
|---|---|
| 1 | title page («هَذَا الْكِتَابُ لِـ») |
| 2 | about this book — for parents (Arabic + English) + QR |
| 3–16 | the story (one idea per page) |
| 17 | تَذَكَّرْ — the whole lesson on one page |
| **18–28** | **exercises 1–11** (18 trace ة · 19 trace هَذَا · 20 trace هَذِهِ · 21 look and write · 22 circle the feminine · 23 add the ة · 24 match · 25 write هَذَا/هَذِهِ · 26 adjective challenge · 27 draw feminine · 28 draw masculine) |
| 29 | certificate |
| 30 | answers (for parents) |
| 31 | my writing page |
| 32 | goodbye + credits |

`lessons/presentation/PLAN.md` placeholders: `[BOOK-PAGES]` = **18–28** (tracing ة and
هَذِهِ: pages 18 and 20); `[BOOK-TITLE]` = «نُورِي وَالصَّدَفَةُ الصَّغِيرَةُ».

## Status (2026-10-24)

- **Pictures:** 16 masters at 1536px (cover, 14 story pages, back), reviewed on
  `build/noori-shell-sheet.png` and at full size. Redrawn: `friends` (Sami kept being
  dropped, bare shins), `bint` (Noori lost his scarf), `nakhla` (not on top of the
  tree), `qitt` (she-cat merged into Noori, then too close to a famous white cat with
  a bow, now a calico), `sadiq` (Sami got a headscarf). Seeds and reasons are in
  `source/gen-noori-shell.sh` (review log at the bottom). Accepted small drift: Sami's
  sleeves are short on `nashit`.
- **Narration:** 28 Fusha + 28 Egyptian clips, `qa-audio.py` clean, all 56 decode in the
  browser; Fusha checked word for word with Whisper (a lone ة is read «تاء»).
  Egyptian `ex-fill` was re-cut once (the first take read slowly). Quota used ≈ 6.5k
  credits; ≈ 12.4k left until 17 Nov.
- **Print:** `print-book.sh` ends with "all checks passed" — text not clipped and 17pt+
  median on every page, nothing outside the safe area, Lulu size / spine / 32 pages /
  374–592ppi / fonts embedded / no marks, 48 QR codes decoded to their exact URLs,
  symbols 26.7mm with a clear quiet zone.
- **Open:** a proof copy from Lulu.
