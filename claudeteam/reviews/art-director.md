# art-director — Team review 2 (2026-10-26)

**Verdict: FIX (one consistency issue, owner/adab ruling needed).** I looked at every shipped picture on contact sheets, then zoomed in on the suspicious ones:
- 24 word pictures (`assets/art/pic`)
- 13 story scenes (`assets/art/story`)
- 6 Noori poses (`assets/art/noori`)
- 14 site pictures (`assets/art/site`)
- 6 og cards (`assets/art/og`)
- 16 guide examples (`assets/art/guide`)
- 24 v2 logos (`logos/img/v2`)
- 17 book pages (`book/images-noori-shell`)

The sheets and crops are in `/private/tmp/claude-501/-Users-hishamabuella-Work-Arabic-school/d88abab3-a4d7-40f9-b268-0ee19b844ff0/scratchpad/shots/team2/` (`art_pic.png`, `art_story.png`, `art_noori_site.png`, `art_og_guide.png`, `art_logos.png`, `art_book.png`, `art_salma_hairline.png`, `art_beaks.png`).

What is clean:
- No text inside any image.
- No stray sticker characters in shipped files.
- Sami's hair is uncovered and he wears plain shirts.
- Long trousers or leggings everywhere.
- No grown-ups in story pictures.
- Every site WebP is ≤ 150 KB.
- `bint-611` in the guide is still blurred (REVIEW #19 holds).

The issue: **the site set got the `$HIJAB` under-cap fix, but the book set (and the story scenes reused from it) did not.**

| id | sev | file + seed | evidence | fix | effort |
|---|---|---|---|---|---|
| ART-01 | major | `book/images-noori-shell/bint.webp` (`gen-noori-shell.sh:69`), `friends.webp` (804, line 51), `nashit.webp` (613, line 71); the same pictures in `assets/art/story/s03-friends.webp`, `s10-nashit.webp`, and the print interior pages 4, 13 and 15 | A brown fringe of hair shows under Salma's pink scarf in all three (`art_salma_hairline.png`). `gen-art.sh:61-65` calls this exact drift a failure and fixed it for the site with `$HIJAB` (girl 1202, student-f 1205, parents 1630). `sadiq.webp` is already clean. So the same character is drawn two ways, and the book contradicts the guide's own rule («the scarf should cover all the hair», `guide.html:304`). | **First an `islamic-studies-advisor` ruling** on whether a visible fringe on a young girl is acceptable. If not: redraw bint, friends and nashit with `$SALMA, $HIJAB` and NEG `hair, fringe, bangs` (+100 seeds), one GPU job at a time, then `web-art.sh` and a re-print. If it is acceptable: write that ruling into `guide.html` §4 so the two sets stop contradicting each other. | M |
| ART-02 | minor | Noori across the book and site: `noori/happy`, `think`, `sleep`, `book/cover` | The beak is wide and flat with a lip line, more duck bill than the "small candy-corn seagull beak" in the charter (`art_beaks.png`). It is consistent everywhere, so it now reads as the house style. | Owner decision: either accept it as Noori's look and update the eye-check list, or apply the logo-c6 recipe (`beak-paint.py` + img2img 0.30–0.40) in the next redraw round. Don't redraw only for this. | S (decide) / L (redraw) |
| ART-03 | minor | `assets/art/site/level-1.webp` (640×640 RGBA) | A white cut-out halo is left around the open book on transparent backgrounds (visible on the grey contact sheet). | Re-run the background cut with a tighter threshold, or add a 2 px erode in `make-web.py` for this file. | S |
| ART-04 | minor | `book/images-noori-shell/sadiq.webp`, `assets/art/story/s13-sadiq.webp` | Noori is standing on top of Salma's head. It is cute, but it reads as a stacking glitch and hides her scarf top. | Keep it, unless it is redrawn with ART-01; if so, add "Noori standing on the sand beside them". | S |
| ART-05 | minor | `logos/img/v2/hi/` (24 PNG, 12 MB, tracked) | These are masters; no page references them (pages use the `.webp`). The budget says pages never reference a master, and the 12 MB is there for every clone. | Keep them if the owners want print-ready logos; otherwise git-ignore them like `tries/`. Owner call. | S |

**Re-verified:** REVIEW #19 (guide blur) holds. The logo c3 star has 8 points. The c2 arch is a keyhole arch, not a horseshoe (round 2).

## Top 3 suggestions for what to build next
1. **One Salma consistency redraw** (ART-01): 3 book pages, one at a time, with the site's `$HIJAB` words. It is the cheapest fix that makes the series consistent before the Lulu proof is ordered.
2. **A "cast sheet" image**: Noori, Sami and Salma front-on, side by side, at one size, kept in `assets/art/source/` as the visual reference for every future topic book (the topic-book skill copies it).
3. **Art for the second topic book**, reusing the fixed descriptions. Do it only after ART-01, so the new book starts from the corrected Salma.
