# qa-lead — Team review 2 (2026-10-26)

**Verdict: FIX (no blockers).** The commit is `79a5b88`, with a clean tree apart from the team's review and log files. **HEAD is 1 commit ahead of `origin/main` (`5d9c5e7`)**, so the live site does not have `claudeteam/` yet.

## Checks run (numbers)
| Area | Result | Baseline (REVIEW.md) |
|---|---|---|
| Pages (Playwright, `/Madrasa/`) | 16 URLs × 1280 / 820 mobile / 390 mobile = **48 loads**: 0 console errors (except the deep-404's own 404 status), 0 page errors, 0 failed requests, 0 broken images, 0 horizontal scroll | 0 / 0 / 0 / 0 / 0 ✔ |
| Themes | 6 themes × hub / article / story at 820: 0 errors, theme applied every time | ✔ |
| file:// | 9 pages, 0 errors; hub hero → `pitch/index.html#start` (13 slides) | ✔ (#9) |
| Links | 15 pages crawled: 0 broken (7 JS templates in logos), 0 root-absolute outside 404, 0 directory links | ✔ |
| og | 15/15 pages: absolute `og:image` + `og:url` | ✔ (#5) |
| Live | hub, pitch, web book, interior PDF, og image, story page, `audio/story/eg/p13.mp3` → 200; `/Madrasa/nope/x.html` → 404 with «نَوْرَس · Page not found» | ✔ (#4) |
| Decks | `check.mjs --themes`: presentation **23** slides, pitch **13**, 0 issues × 7 themes | ✔ |
| Book | `check-lulu.sh noori-shell`: all passed, 32 pp, interior images 374–542 ppi, cover images **331**–592 ppi, fonts embedded; `check-print-text.py` interior 32 / A5 36 / Letter 11 / A4 11 clean; `check-qr.py` **48** codes exact, ≥ 25 mm; the 11 `#ex-*` anchors exist in the web book | ✔ |
| Audio | `qa-audio.py`: book 28 + 28, story 13 + 13, samples 3 + 3, 0 problems; browser decode 90/90 | ✔ |
| Autoplay / motion | 0 sounds before a gesture (15 pages); 0 animations under reduced motion | ✔ |
| Hygiene | secrets grep 0; `.gitignore` covers tries/, `.playwright-mcp/`, noori-two; no PDF byte drift (git clean after the print checks) | ✔ |

## Findings
| id | sev | where | evidence | owner / fix | effort |
|---|---|---|---|---|---|
| QA-01 | major | parent CTA on hub, 404, mockups 01 + 05 | Contrast 1.35–3.81:1 on the English (or whole) CTA. **Escape route:** the token check passes, because page rules override `.btn .en`. | `frontend-engineer` FE-01. Add a "rendered contrast scan" to the release checklist. | S |
| QA-02 | major | book bint / friends / nashit (+ story s03 / s10, print pp 4 / 13 / 15) | Salma's fringe is visible, but the site set was redrawn with `$HIJAB` for exactly this. REVIEW.md §4 said "hair fully covered", so the earlier check missed it (it was a contact-sheet-only look). | `islamic-studies-advisor` ruling → `art-director` ART-01. | M |
| QA-03 | major | `lessons/article.html` + mockups `[data-say]` | Device TTS only, a silent no-op without an Arabic voice. This is the same class as REVIEW #3, fixed for the story only. | `motion-and-sound-designer` MS-01 + FE-02. | M |
| QA-04 | major | all Arabic pages | `.en` captions have no `lang="en"` (hub 37, article 86, story 49 …). | `frontend-engineer` (A11Y-02). | S |
| QA-05 | minor | git | `79a5b88` (team charters + logs) is not pushed. The BRIEF's suggestions slide will fetch `../claudeteam/suggestions.jsonl` on Pages, which needs a push. | Push when the user asks (not done here). | S |
| QA-06 | minor | BRIEF "Team review → suggestions slide" | `claudeteam/suggestions.jsonl` and the pitch's final "What the team suggests next" table do not exist yet. This is queued for the `ceo` step, not a defect; listed so it is not forgotten. | `ceo` → `frontend-engineer` (`pitch/build/build.py`). | M |
| QA-07 | minor | `pitch/index.html` | 4.7 MB on a phone (PNG screenshots); the hub is 4.97 MB / 139 requests. | FE-03 / FE-04. | S |

**Cross-cutting consistency, checked green:**
- README counts: 32 pages, 11 exercises, 53 generations = 53 `gen` lines.
- Pitch "73 pictures": 24 + 13 + 6 + 14 site + 16 book = 73 ✔.
- "Fusha" in the pitch appears only in the school name, the tagline and the alternate-names list (owner rule).
- "public" wording everywhere.
- Voice ids in the transcripts match the BRIEF.

**Coverage gaps (named):** no real device (iPad/Pencil/VoiceOver), no Lulu paper proof, no listening by ear or Whisper (GPU), and no WhatsApp preview render (`og` tags are correct, but no chat app was tried).

## Top 3 suggestions for what to build next
1. **A single `tools/sweep.cjs` release gate** that prints the table above. It should include the rendered-contrast scan and the autoplay hook, the two checks that caught what the token and link checks could not.
2. **Order one Lulu proof copy**: the only way to close "colours, Arabic and QR from paper", and the cheapest proof for the owners.
3. **Finish the queued suggestions slide** (QA-06) from these reviews, then push once, so the owners see the team's list in the deck.
