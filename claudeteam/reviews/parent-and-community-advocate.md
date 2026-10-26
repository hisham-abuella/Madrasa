# parent-and-community-advocate — Team review 2 (2026-10-26)

**Verdict: FIX (copy only, all small).** A San Diego parent on a phone gets most of the basics within ten seconds on the mockups:
- **What:** "Fusha for little hearts, by the Pacific".
- **Ages:** KG to Grade 3 cards.
- **When:** "Saturdays 9:30 – 12:00 (KG until 11:00)".
- **Where:** "Mira Mesa … 10 min from the 15 / 805".
- **Who:** "Ustadha Maryam & Ustadh Yusuf".
- **Action:** one trial button.

Everything is clearly marked "*details are placeholders until confirmed*" (4–5 per mockup). The article's parents' corner is excellent, warm and doable: "five minutes a day", the "This or this?" walk, and the dialect note "That's fine — at Nawras we learn the Fusha forms". There is no guilt copy and no fake urgency anywhere.

What is missing is what parents ask next: **cost**, and whether they can help **without Arabic at home**. On two mockups they also **cannot read the button**.

| id | sev | file + section | quoted copy / evidence | suggested change | effort |
|---|---|---|---|---|---|
| PCA-01 | major | mockups 01–06, «لِلْأَهْلِ / For parents» | There is no cost line at all: 0 hits for fee / tuition / $ / cost on any mockup or the hub. After "when and where", cost is the first question in every family WhatsApp group. | Add one marked line: "Fees: $___ a month · sibling discount · first class free — *placeholder until the owners confirm*". | S |
| PCA-02 | major | `mockups/01-andalus.html` parents' CTA; `mockups/05-mosaic.html` CTA | «اِحْجِزْ حِصَّةً تَجْرِيبِيَّةً · Book a free trial class» is white on gold (1.96:1) on Andalus, and the English is 1.58:1 on Mosaic (`sheet_ctas.png`). Parents cannot read the one action. | The CSS fix in `ui-designer` UI-02/03. | S |
| PCA-03 | minor | mockups 01–06 parents' section | Nothing for English-only, convert or non-Arab homes. The reassurance exists only deep inside the article. | Add one line: "No Arabic at home? You can still help — every lesson has a 5-minute English guide for parents." | S |
| PCA-04 | minor | mockups 01–05 (Mihrab has 1 mention) | The vision is "rooted in akhlaq and adab", but parents are not told. They choose an Islamic school for this as much as for the language. | Add one line in the parents' section: "Besides Arabic: adab every week — greeting with salam, kindness, sharing, respect for teachers." | S |
| PCA-05 | minor | mockups parents' section | There are no trust signals beyond names: nothing on safety, class size or the teachers' background. | Add a placeholder line: "Small classes (max 10 · *placeholder*) · teachers background-checked · parents welcome to sit in on the trial." | S |
| PCA-06 | minor | every CTA = `mailto:` only | A parent on a phone with no Mail app hits a dead end (kids-ux KUX-04). | Add "or text (619) 555-0142 *placeholder*" as a `tel:` / `sms:` link next to the button. | S |
| PCA-07 | minor | `index.html` mockup cards (owners read these) | "A bento grid of chunky tiles, 8-point stars, bold primaries, thick outlines and offset shadows." / "Full-bleed sunset ocean". Design jargon for owners who are parents, not designers. | Use plain words: "Big colourful tiles, like a playground"; "A sunset beach across the whole screen". | S |
| PCA-08 | minor | book back cover (`noori-shell-lulu-cover.pdf`) | "A Fusha lesson book for grade 1–2" | Change it to "for grades 1–2". This is spec/template wording, owned by `arabic-language-expert` / `print-production-specialist`, and needs a reprint. Do it with the next print run, not alone. | S |

**Re-verified:** REVIEW #7 ("(public)" on the hub footer), #20 (the CTA is on the hub, logos and web book footers), #5 (absolute og image, so WhatsApp previews should show the picture; not tried in a real chat app).

**Questions for the owners:** the monthly fee and sibling policy; a real phone/WhatsApp number for trial bookings; whether parents may sit in on the trial; the class-size cap.

## Top 3 suggestions for what to build next
1. **A "For parents" one-pager** (`parents.html`), linked from every CTA: when, where, cost, who teaches, what a Saturday looks like, the adab promise, "no Arabic at home is fine", and the trial button. Everything placeholder-marked. It is the page owners will actually forward.
2. **A printable A5 flyer** for the masjid noticeboard (Noori, schedule, a QR code to the parents page). San Diego families still find weekend schools at the masjid.
3. **The next topic book for a different age**: a KG letters-and-sounds book, so parents of 4–5 year olds see something for their child (today everything is grade 1–2).
