# Project brief — shared by every agent working in this folder

## What we are building
A **demo** of a kid-friendly website for an Islamic Arabic (Fusha) weekend/after-school school for
children in **San Diego**. It is shown to the school owners to win approval. Static HTML/CSS/vanilla
JS only — no frameworks, no build step, opens from `file://`. Google Fonts allowed (degrade to
system fonts). Everything RTL Arabic-first, with small English captions for parents.

## Brand
- **Name:** **نَوْرَس — Nawras** · full: **مَدْرَسَةُ نَوْرَس لِلْفُصْحَى** / *Nawras Fusha School, San Diego*
- **Why:** النَّوْرَس = the seagull, San Diego's coastal bird; a seagull flies far and returns home,
  like children returning to the language of the Qur'an. Light, friendly, ownable.
- **Mascot:** a young seagull named **نُورِي (Noori)** — from نُور (light). Round, white/cream body,
  small orange beak, big kind eyes, a tiny teal scarf or kufi-free headband. Never scary, no text on him.
- **Taglines:** AR «نَتَعَلَّمُ الفُصْحَى بِفَرَحٍ» · EN *"Fusha for little hearts, by the Pacific."*
- **Alternate names** (for the owners' deck): شاطئ الضاد *Shores of Dad* · لؤلؤة الفصحى *Fusha Pearl* ·
  الأندلس الصغيرة *Little Andalus SD* (San Diego's Spanish-mission arches descend from Andalusian
  Islamic architecture) · هلال *Hilal Kids*.

## Visual language — Islamic + Arabic + kid-friendly + San Diego
- Islamic geometry (8-point star / khatam, zellige, girih), arches (mihrab / Andalusian horseshoe arch),
  lanterns (fanous), crescent & stars, calligraphy as *ornament* — softened, rounded, bright for kids.
- San Diego: Pacific ocean teal, sunset coral, sand, palm trees, mission-style arches, seagulls.
- **Respectful content rules:** no depictions of prophets or angels; no Qur'an verses used as decoration
  or inside games; modest clothing on any child figures (or use animals/objects instead); no music
  claims — sound effects are soft tones only. Islamic greetings OK («السَّلَامُ عَلَيْكُم»).
- Children's Arabic words are **always fully vocalised (tashkeel)** and set in a Naskh font
  (`Noto Naskh Arabic`); UI in `Baloo Bhaijaan 2` / `Readex Pro` / `Lalezar` / `Reem Kufi` per theme.
- Never letter-space Arabic. When colouring part of a word (e.g. the ة), wrap with ZWJ (`&zwj;`)
  on both sides of the split so letters stay joined.

## Design rules carried over from Wireless101 + present-in-html
- Every colour is a CSS token; a fill colour that fails 4.5:1 as text gets a darker `--*-text` twin.
- Cards lift on hover, staggered fade-up entrances, one accent per theme, motion has a job
  (feedback, attention, reward), honour `prefers-reduced-motion`.
- Touch targets ≥ 56px, no timers or punishment for kids, wrong answer = gentle shake + hint.
- Shared system lives in `assets/kids.css` + `assets/kids.js`; extend, don't fork.

## Grammar topic for the sample lessons
**هَذَا وَهَذِهِ — المُذَكَّر وَالمُؤَنَّث** (grade 1–2): هَذَا with masculine nouns, هَذِهِ with feminine;
the تاء مربوطة (ة) usually marks the feminine (مُعَلِّم → مُعَلِّمَة); fence: some feminine words have
no ة (بِنْت، أُمّ، شَمْس); extension: adjective agreement (هَذِهِ بِنْتٌ نَشِيطَةٌ).

## Folder map
```
index.html              hub: brand, links to everything
mockups/                5–6 UI mockups of the homepage (one per theme)
logos/                  logo concepts (generated images + HTML logo sheet)
lessons/                the same lesson in 3 styles: article, story, presentation
guide.html              how to make kid-friendly images and animations
pitch/                  the presentation for the school owners (present-in-html)
assets/                 kids.css, kids.js, images
```

## Borrowed from elayadesign/ai-design-skills (landing-page-design) — adapted, not installed
- **One action per page for parents:** "Book a free trial class / احجز حصة تجريبية". Every page ladders to it.
- **Content realism:** no lorem ipsum; believable class times, ages, teacher titles, San Diego neighbourhoods —
  marked *placeholder* where not confirmed by the owners.
- **Interaction states on everything:** hover, active (pressed), focus-visible ring, empty, error.
- **Nested radius:** inner radius = outer radius − gap.
- **Scroll reveals** via IntersectionObserver only, never a scroll listener; word-by-word tagline reveal allowed
  for «نَتَعَلَّمُ الفُصْحَى بِفَرَحٍ» with a reduced-motion fallback.
- **Pre-launch checklist:** skip link, alt text (Arabic + English), og:image, favicon, semantic landmarks, 404 page.

## Writing practice — required in every lesson and in the book
Kids must get room to **write**, not only tap.

**On screen (iPad / tablet / mouse) — a shared `KS.writePad()` component in `assets/kids.js`:**
- `<canvas>` with Pointer Events: finger or Apple Pencil (use `pressure` for line width), `touch-action: none`
  so the page does not scroll while writing, palm-friendly (ignore touches when a pen is active).
- Arabic handwriting lines: baseline + dotted mid-line, written **right to left**; a faint dotted model word
  to trace (e.g. ة, هَذَا, هَذِهِ, مُعَلِّمَة) in Naskh, with a green start dot.
- Tools: pen colours (3), eraser, undo, clear, "show model / hide model", save as PNG (download), big buttons.
- No auto-grading of handwriting — praise on "انتهيت" (I finished) with a star; never mark it wrong.
- Every lesson (article, story, presentation) has at least one writing station: **trace** the ة → **trace**
  هَذَا / هَذِهِ → **write** a short sentence under a picture (هَذِهِ ...).

**In print (the Lulu book + printable worksheet PDF):**
- Exercise pages after the story: dotted tracing words with stroke-start dots and arrows; empty Arabic
  ruled lines (baseline + mid-line, ≥ 12 mm line height for small hands); "circle the feminine word";
  "add the ة" fill-ins (مُعَلِّم_ → مُعَلِّمَة); match picture ↔ هَذَا / هَذِهِ; a "draw it" box with a caption line.
- Keep exercise pages light (white, thin lines) so they take pencil and crayon; no lamination on them.
- Also export the exercise pages alone as an A4/Letter **printable worksheet PDF** for teachers.

## The lesson book: web + print + narration + QR
- One spec (`book/stories/<slug>.json`) feeds the web book, the Lulu PDFs and the narration (bedtime-stories rules).
- **Web version of the book** (`book/books/<slug>.html`) with page-by-page narration, Fusha + Egyptian toggle.
- **Narration voices** (ElevenLabs `eleven_v4`, stability 0.5 / similarity 0.8, tags + breaks): **Fusha = Sarah
  `EXAVITQu4vr4xnSDxMaL`** (the Bedtime Stories fusha reader); **Egyptian = Hisham's clone `pusofH2Ro5Ny4RH6qBEO`**. Approved samples: `audio/samples/{ar,eg}/s1–s3.mp3`
  (transcripts in `audio/transcripts/`). Local-model draft optional; the shipped cut is ElevenLabs.
- **QR code** on the back cover and the "about this book" page linking to the web version of the book
  (and one per exercise page linking to its writing-pad page). Use bedtime-stories `tools/make-qr.py` +
  `tools/check-qr.py` (QR must decode to the exact URL, ≥ 25 mm printed, quiet zone kept, dark on white).
  Hosting URL: GitHub Pages — confirm the final URL with the user before printing.

## Hosting and privacy (decided 2026-10-24)
- Code lives in a **private GitHub repo** `hisham-abuella/nawras` (created at the end, after everything is built).
- The site and the owners' deck are published as **private claude.ai artifacts** (only Hisham can open them;
  he can share later). No public GitHub Pages for now.
- `index.html` links the owners' deck (`pitch/`) as the **main slide**: the deck's title slide is shown as the
  hero card at the top of the hub.
- The book's QR codes need a public URL before printing — decide that host when the book goes to Lulu.
- **Final step (on hold — not now):** email hisham.f.abuella@gmail.com (via the `email` skill) with the private repo + artifact links, a summary, and open decisions (voice, book QR URL, logo pick).

## Final pipeline (in order)
1. **Review subagent** — reviews EVERYTHING before release: mockups, logos, lessons, book (web + Lulu PDFs +
   worksheets + QR), audio QA, guide, deck. Checks against this brief (tashkeel, Islamic content rules,
   contrast, RTL, writing pads on iPad sizes, no console errors, links). Writes `REVIEW.md` with PASS/FIX;
   fixes are applied and re-checked before moving on.
2. **Deck + publish subagent** — makes sure the owners' slides (present-in-html, `pitch/`) are built, checked,
   linked as the main slide in `index.html`, and pushed to the private repo `hisham-abuella/nawras` with all
   artifacts (images, audio, PDFs, logos, worksheets); verifies the push (file list matches local), then the
   private claude.ai artifacts are published.
3. Email to Hisham — **on hold, user said not now** (2026-10-24).

## Illustrated artwork pass (after the book; local Draw Things only)
Every picture on the site is currently hand-drawn inline SVG (no broken image files, no emoji). Add a generated
**illustrated** set, bedtime-stories style, with an **Artwork switch (رُسُومٌ بَسِيطَةٌ / رُسُومٌ مُلَوَّنَةٌ)** and fallback to
the SVG when an image is missing. Same Noori description, negative prompt and seeds discipline as the book;
reuse the book's art where it already exists.
- Lessons: the 23 noun pictures used via `KS.pic` (cat, girl, teacher, shell, …) → `assets/art/pic/<name>.webp`.
- Story lesson: one scene per slide (13) → `assets/art/story/`.
- Mockups: one hero scene per theme (6), the 4 level cards, word-of-the-day picture, parents strip photo-style
  illustration → `assets/art/site/`.
- Social share image (og) per theme, and Noori poses (happy, wave, fly, think, cheer, sleep) as a sticker set.
- Script: `assets/art/source/gen-art.sh` (prompts + seeds), contact sheets, every image checked by eye.

## Hosting UPDATE (2026-10-25, supersedes "Hosting and privacy" above)
- Repo: **https://github.com/hisham-abuella/Madrasa** (private repo, branch main). GitHub Pages is ON and public:
  **https://hisham-abuella.github.io/Madrasa/** — the user accepted the site being public.
- Book QR URL confirmed: https://hisham-abuella.github.io/Madrasa/book/books/noori-shell.html (print files no longer DRAFT).
- All links must be relative so the site works under /Madrasa/.
- Owners' deck ("this whole effort") lives in `pitch/`, with narration in **English + Egyptian Arabic in Hisham's
  voice, local model** (Fish S2-Pro clone via ~/Work/Whisper-audio/bakeoff narrate.py, Whisper QA). Linked as the
  main slide in index.html.

## Local model jobs — ONE AT A TIME (user rule, 2026-10-25)
Never run Draw Things generations, Fish S2-Pro / Voicebox TTS or Whisper batches in parallel, and never two GPU
subagents at once. Check `pgrep -fl "draw-things|narrate|mlx|voicebox"` is empty before starting. Parallel runs
restarted the session once.

## Project skill: new topic book (queued 2026-10-25)
A project skill at `.claude/skills/topic-book/SKILL.md` that turns a new Arabic grammar topic into a complete
sample: lesson-book spec → art (Draw Things, one at a time) → web book + Lulu PDFs + worksheets → narration
(Sarah Fusha / Hisham Egyptian) → QR → hub card; optionally the 3 lesson styles. Written AFTER the book redesign
so it documents the final tools; validated with a dry run on a second topic (spec + build without new GPU work).
- Every new topic book MUST follow the same pattern as «نُورِي وَالصَّدَفَةُ الصَّغِيرَةُ»: same 32-page structure (title, about/QR,
  14 story pages, summary, 11 exercise pages, certificate, answers, free writing, goodbye), same cover border +
  pattern, same characters and style suffix, same exercise types, same Lulu settings and checks. The skill copies
  the Noori book as the template and only swaps topic content.

- **Owners' deck: NO narration (owner decision 2026-10-25)** — presenter speaks live from the notes. "Fusha" said at most once or twice in the deck. Keep it simple.
