# ceo — consolidation of team reviews 1 + 2 (2026-10-26)

**Input:** 14 reviews in `claudeteam/reviews/` — 101 findings (0 blocker) + 42 "top 3" suggestions.
**Output:** `claudeteam/suggestions.jsonl` — **55 items** after merging duplicates (e.g. the parent-CTA contrast, raised by 6 roles, is one item, S-002). Every finding id and every top-3 suggestion (cited as `<PREFIX>-T1..T3`) appears in some `source_ids`; **nothing was dropped**.
**Judged against:** interaction not memorisation · morals lived in stories · joy · parents' trust · keep it simple (charter "How this role decides", steps 1–7).

## Release plan — the 10 "now" items (before the owners' meeting and before the Lulu order)
| id | what | effort |
|---|---|---|
| S-001 | Redraw Salma's 3 book pictures: under-cap, long sleeves, curious face, Noori beside (not on) her → re-export, reprint | M (art, one GPU job at a time) |
| S-002 | Parent CTA contrast: `.btn.btn .en`, Andalus `.parents a:not(.btn)`, delete mosaic line 82 | S |
| S-003 | Quiz: hint → try again → full stars; no "You got 2 of 5" | S |
| S-004 | Fence by pointing («هَيَّا نُشِيرُ وَنَقُولُ…»), not «نَحْفَظُهَا» / "by heart" | S |
| S-005 | «فِي الْغَالِبِ» in every ة recap (screen text) | S |
| S-006 | Praise girls: «بَطَلٌ / بَطَلَةٌ» certificate boxes, «أَحْسَنْتُمْ» on screen | S |
| S-007 | «سِحْرُ التَّاءِ» → «سِرُّ التَّاءِ» everywhere | S |
| S-008 | Lived morals in the story text (shell gift, «نَتَعَاوَنُ», «الْحَمْدُ لِلَّهِ»), then the honest deck line | S |
| S-009 | `lang="en"` on every `.en` caption (kids.js + templates) | S |
| S-010 | A listen tap always answers (is-speaking + pop) + clip-first hook in `KS.speak` | S |

Nine of ten are text or one-line code. Order of work: S-002, S-009, S-010, S-003 (frontend) in parallel with S-004…S-008 (Arabic text); then S-001 art; then **one** print rebuild that also carries S-016 (book text batch); then S-017 (Lulu proof).

## Owner decisions needed
1. **Salma's hair fringe (ruled, recorded):** `islamic-studies-advisor` — *not a veto*; covering a young child's hair is not obligatory, but it breaks our own rule and the deck's "Modest clothing on every child" claim, so **redraw before the Lulu order and before the owners' meeting** (S-001). The owners only need to know it is being done.
2. **Noori's beak** (S-036): accept the current wide beak as house style, or redraw toward the seagull beak in the next art round. No redraw for this alone.
3. **ElevenLabs credits** for ~30 word clips (S-012) and the batch of re-recorded story/book clips (S-015) — one go-ahead covers both.
4. **Parent details** (S-013, S-032, S-054): monthly fee + sibling policy · a real phone/WhatsApp number for trial bookings · class-size cap · may parents sit in on the trial?
5. Smaller: one Lulu proof copy (≈ $8–15 + shipping, S-017); keep or git-ignore the 12 MB logo masters (S-038); after the theme/logo choice — one ambient loop (S-037) and the brand sheet (S-051).
Standing (unchanged): theme, logo, pilot class, Fusha proofreading teacher, print budget.

## Counts
- **By priority:** now 10 · next 22 · later 23 (total 55). Severity: now 10 major · next 3 major, 16 minor, 3 idea · later 1 major, 10 minor, 12 idea. **Needs owner:** 10 items.
- **By area:** Kids UX 8 · Pedagogy 7 · Islamic adab 5 · Accessibility 5 · Motion & sound 5 · Print 5 · UI 4 · Arabic 4 · Art 4 · Frontend 3 · Parents 3 · Vision 1 · QA 1.
- **By suggested_by (first raiser):** arabic-pedagogy-specialist 9 · arabic-language-expert 7 · islamic-studies-advisor 5 · ui-designer 5 · accessibility-auditor 5 · motion-and-sound-designer 4 · print-production-specialist 4 · kids-ux-designer 4 · art-director 4 · early-childhood-educator 3 · parent-and-community-advocate 2 · qa-lead 1 · ceo 1 · frontend-engineer 1.
- **By role (named anywhere in `roles`):** arabic-pedagogy-specialist 12 · arabic-language-expert 9 · early-childhood-educator 9 · frontend-engineer 9 · islamic-studies-advisor 8 · ceo 8 · kids-ux-designer 8 · accessibility-auditor 8 · qa-lead 8 · print-production-specialist 7 · parent-and-community-advocate 7 · art-director 6 · motion-and-sound-designer 6 · ui-designer 5.

## Conventions
- `suggested_by` = the role whose finding the others cited (for example, ISA-01 for Salma and ECE-01 for the quiz); otherwise the earliest review in team order. `roles` = every role that raised it.
- Top-3 suggestions are cited as `ALE-T1` … `PPS-T3` (the reviews number them 1–3 under each role).
- `MS-01` / `FE-02` appear twice on purpose: the no-voice feedback + clip hook is "now" (S-010), and the recorded clips are "next" (S-012, credits).
