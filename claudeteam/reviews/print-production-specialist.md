# print-production-specialist — Team review 2 (2026-10-26)

**Verdict: PASS (print files are Lulu-ready), with one art dependency before ordering the proof.** I ran the checks read-only from `book/`; the git tree was still clean afterwards, so no PDF bytes were rewritten:
- `bash tools/check-lulu.sh noori-shell` gave **all checks passed**:
  - Interior: 630 × 630 pt, **32 pages**, 16 images at 374–542 ppi, fonts embedded, no encryption, no marks.
  - Cover: 1252.08 × 630 pt for 32 pp, spine 0.1321 in, 2 images at 331–592 ppi.
- `check-print-text.py`: interior 32, A5 36, worksheets Letter 11 and A4 11, all **clean** (no clipping, no small text).
- `check-qr.py noori-shell`: **48** codes in 5 PDFs decode to exactly `https://hisham-abuella.github.io/Madrasa/book/books/noori-shell.html` (+ `#page-key`), ≥ 25 mm, quiet zone kept. All 11 `#ex-*` targets exist in the web book, and `#ex-ta` opens exercise 1 (checked in a browser).
- Exercise pages 18–28 measure **90–94 % white**, so the REVIEW baseline holds.
- `print/` has no `-DRAFT` noori-shell file; `book.config.json` is confirmed.
- Worksheet lines (Letter p. 2, at 70 dpi): letter body ≈ 7–8 mm, line pitch ≈ 28 mm, which is ≥ 12 mm.

Sheets: `/private/tmp/claude-501/-Users-hishamabuella-Work-Arabic-school/d88abab3-a4d7-40f9-b268-0ee19b844ff0/scratchpad/shots/team2/print_interior.png`, `print_cover_ws.png`, plus `…/scratchpad/pdf/coverhi-1.png` and `wl2hi-02.png`.

| id | sev | PDF + page | measured / evidence | fix | effort |
|---|---|---|---|---|---|
| PPS-01 | major | `noori-shell-lulu-interior.pdf` pp. 4 (friends), 13 (bint), 15 (nashit); same pages in A5 | Salma's fringe shows under the scarf (art-director ART-01). The site art was already redrawn for this rule. | **Do not order the Lulu proof until there is a ruling.** If `islamic-studies-advisor` asks for a redraw, wait for the 3 new pictures, then run `bash tools/print-book.sh noori-shell` once (all checks must pass again). | M (waits on art) |
| PPS-02 | minor | interior pp. 2 and 25 | `pdffonts` shows `LucidaGrande` (a Type 3, macOS system font) embedded for the «←» arrow, a fallback chosen by the machine. Another Mac or Linux build could draw a different arrow, and some preflights warn on Type 3. | Draw the arrow as inline SVG in `make-print.js` (as the trace-page arrows already are), or set the arrow span to a bundled font. Re-run `check-lulu.sh`. | S |
| PPS-03 | minor | worksheets Letter/A4 pp. 1–3 (trace pages) | After the 2 trace rows and 2 empty rows, about a third of the page is blank above the footer (`wl2hi-02.png`). | Add 2 more empty practice lines (same 26 mm pitch) to the trace exercises, worksheets only. Teachers like more practice per sheet. Ask `ui-designer` first (series look). | S |
| PPS-04 | minor | `noori-shell-lulu-cover.pdf` back | "A Fusha lesson book for grade 1–2" | Change it to "grades 1–2" in the spec/template wording at the next print run (not on its own). | S |
| PPS-05 | minor | `book/print/` | `noori-two-*-DRAFT.pdf` (5 files, git-ignored) sit beside the real `noori-shell-*.pdf`. A file picker on the Lulu upload page shows both. | Write dry-run drafts to `print/draft/` (one path change in `print-book.sh` for unconfirmed books). | S |
| PPS-06 | minor | all | **No Lulu proof ordered yet**, so colours, Arabic shaping and QR scanning from paper are unverified (known open item). | Order 1 proof after PPS-01 (≈ $8–15 + shipping, an Oct 2026 estimate). Scan every QR from the paper with a phone. | S |

**Re-verified:** REVIEW §7: 32 pp, 48 QR codes, white exercise pages, no `-DRAFT` files. Lulu binds on the left only; that is accepted and unchanged.

## Top 3 suggestions for what to build next
1. **Order the first Lulu proof** after PPS-01: the single most convincing object for the owners, and the only real test of print colour and QR codes.
2. **A one-page "teacher pack" PDF**: the 11 worksheets plus the answers page and a cover sheet with the QR codes, as one Letter file a teacher prints on Friday night.
3. **Run `print-book.sh` for the second topic book** once its real art exists. The tools are generalised; the check scripts above are the acceptance test.
