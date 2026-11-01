#!/bin/zsh
# Artwork for the Nawras topic book "noori-huwa", drawn locally by Z-Image Turbo at 1536px.
# Scaffolded from source/gen-noori-shell.sh by .claude/skills/topic-book/scripts/new-topic-book.sh.
#
#   pgrep -fl "draw-things|narrate|mlx|voicebox"     # must print nothing: ONE GPU job at a time
#   DEST=$PWD/art-hi/images-noori-huwa zsh source/gen-noori-huwa.sh   # run_in_background; skips drawn pages
#   zsh tools/try-seeds.sh noori-huwa <page> <first-seed> [n]
#   bash tools/web-art.sh noori-huwa
#
# The characters, STYLE and NEG below are copied verbatim from the Noori book. Do not
# edit them for this book: every book must look like the same series. Add page-specific
# negatives with NEG="$NEG, …" on that page's gen line, and a comment saying why.
REPO=$(cd "$(dirname "$0")/.." && pwd)
DEST=${DEST:-$REPO/art-hi/images-noori-huwa}
SIZE=${SIZE:-1536}
mkdir -p "$DEST"
CLI=$HOME/.local/bin/draw-things-cli

# ── the characters, in parts. Never retype these in a prompt. ─────────────
NOORI="a cute round chubby cartoon baby seagull named Noori with a round white and cream body, a small orange beak, big kind round dark eyes with a white sparkle, rosy pink cheeks, soft grey wings with grey wing tips, small orange feet, and a tiny teal scarf around his neck"
SAMI="a cheerful six-year-old cartoon boy with short black curly hair, warm light-brown skin, round soft face, small thin eyebrows, wearing a long-sleeved blue t-shirt, long navy trousers and white sneakers"
SALMA="a cheerful six-year-old cartoon girl wearing a soft pink headscarf that covers all her hair and neck, warm light-brown skin, round soft face, small thin eyebrows, wearing a long-sleeved yellow dress with long white trousers underneath that cover her legs, white socks and pink shoes"
# S-001 (2026-11-01): the fringe showed on bint / friends / nashit, so Salma
# always carries the under-cap line, and her pages add NEG_SALMA.
HIJAB="no hair visible at all, a snug white under-cap beneath the headscarf covers her whole forehead hairline, only her face shows"
SALMA="$SALMA, $HIJAB"
SHELL="a small pale pink scallop seashell"
STYLE="bright cartoon children's book illustration, bold clean dark navy outlines, flat vibrant colours, simple rounded shapes, soft San Diego beach palette of ocean teal, warm sand, sunset coral and sky blue, gentle and cheerful, simple uncluttered background"
# What Noori must not become, grown-ups, text, and the house content rules.
NEG="text, letters, words, numbers, arabic script, arabic calligraphy, writing, signs, logo, label, caption, watermark, \
adult, grown-up, man, woman, adult arms, adult hands, extra arms, extra hands, extra fingers, extra limbs, extra wings, extra legs, extra eyes, deformed, \
black bird, crow, duck, chicken, penguin, pelican, long neck, \
idol, statue, cross, church, steeple, temple, pig, alcohol, wine, beer, bottle, revealing clothing, bare shoulders, bare legs, shorts, swimsuit, bikini, sleeveless, short skirt, \
musical instrument, scary, angry, sharp teeth, crowd, cluttered, blurry, photorealistic, photograph, 3d render, painterly, gouache, watercolour texture"

NEG_SALMA="hair, fringe, bangs, hair strands, bare forearms, bare arms, short sleeves, rolled-up sleeves"
gen () {   # gen <key> "<prompt>" <seed>
  [[ -f "$DEST/$1.png" ]] && { echo "skip $1"; return; }
  $CLI generate --model z_image_turbo_1.0_q8p.ckpt \
    --prompt "$2" --negative-prompt "$NEG" \
    --width $SIZE --height $SIZE --seed "$3" --disable-preview \
    --output "$DEST/$1.png" >/dev/null 2>&1 && echo "done $1" || echo "FAIL $1"
}

# Seeds: first draw 600 up in page order; a redraw adds 100 (7xx, 8xx, 9xx).
# refuse to draw while a prompt is still a TODO (a "TODO" picture costs 90s of GPU and proves nothing)
grep -qE '^[^#]*gen +[A-Za-z0-9_-]+ +"TODO' "$0" && { echo "write the TODO prompts in $0 first" >&2; exit 1; }
# ── reused from book 1 (copied masters, not redrawn; the series looks like one hand) ──
#   friends, qarib (page huwa), samaka (page hiya), shams (page shamsq), nashit (page ahsanta),
#   bye, back:  for k in friends qarib samaka shams nashit bye back; do
#                 cp -n art-hi/images-noori-shell/$k.png art-hi/images-noori-huwa/; done
# ── new pages. Salma's pages carry NEG_SALMA and the eyebrow cap line (S-001 lesson:
#    a small face otherwise grows a strip of hair under the cap). ─────────────────
NEG="$NEG, $NEG_SALMA, brown hair, dark hair, black hair, hairline, hair under the scarf" gen cover "on the left $SAMI with his short black curly hair uncovered, in the middle $NOORI standing on the sand, on the right $SALMA, her white under-cap comes down to just above her eyebrows so only her face shows inside the pink scarf, the three friends standing together smiling on a clean sunny San Diego beach, Sami holding a plain blue bag, calm turquoise sea and one palm tree behind, $STYLE" 600
# salam: the litter is plain and small (no bottle on this page: NEG bans bottles; S-049 bottle comes on zujaja)
gen salam "$NOORI flying over a sunny San Diego beach in the morning, looking down with a curious face, on the sand below a crumpled plain white paper cup and a plain blue plastic bag lying near the water, calm turquoise sea, $STYLE" 701
gen recall "close view of smooth sand at the beach with four things in a neat row: a small red sailboat toy with a plain white sail, a closed blue book with a plain cover, a happy little orange fish in a small puddle, and $SHELL, $NOORI standing behind them smiling, $STYLE" 702
NEG="$NEG, $NEG_SALMA, brown hair, dark hair, black hair, hairline, hair under the scarf" gen kis "on the right $SALMA, her white under-cap comes down to just above her eyebrows so only her face shows inside the pink scarf, holding out a big plain blue bag with no print on it to the boy on the left, $SAMI with his short black curly hair uncovered taking it with a smile, full body view, sunny beach, $NOORI standing on the sand beside them, $STYLE" 706
# zujaja: the book NEG bans "bottle" (alcohol rule); this page swaps it for an explicit plain-water-bottle negative set (islamic-studies-advisor, 2026-11-01)
NEG="${NEG//bottle, /}, $NEG_SALMA, brown hair, dark hair, black hair, hairline, hair under the scarf, glass bottle, wine bottle, beer bottle, brown bottle, green bottle, label, liquid" gen zujaja "$SAMI with his short black curly hair uncovered bending down and picking up an empty clear plastic water bottle with a blue cap from the sand, on the right $SALMA, her white under-cap comes down to just above her eyebrows so only her face shows inside the pink scarf, holding open a big plain blue bag, full body view, sunny beach, $NOORI watching, $STYLE" 704
NEG="$NEG, bird, seagull, duck, bow, ribbon, hello kitty" gen qitt "two cute cartoon cats on a low stone beach wall, on the left a big orange striped tabby tomcat curled up fast asleep with closed eyes, on the right a smaller calico she-cat with white, orange and grey patches and a little pink collar playfully batting a small ball of string, calm sea behind, $STYLE" 708
# umm (page fence): the mother lives in the words; the picture shows the sun and her things, no person, no hands
NEG="$NEG, person, people, child, hands, arms" gen umm "a big round smiling yellow sun shining over the calm blue sea, and on the sand below a wide straw sun hat and a woven picnic basket with bread and apples, a striped beach towel, lots of empty sand, $STYLE" 706
NEG="$NEG, $NEG_SALMA, brown hair, dark hair, black hair, hairline, hair under the scarf" gen clean "on the left $SAMI with his short black curly hair uncovered and on the right $SALMA, her white under-cap comes down to just above her eyebrows so only her face shows inside the pink scarf, together dropping a full plain blue bag into a plain green bin with no writing on it, both smiling, full body view, a clean sunny beach with smooth empty sand, $NOORI flying above them, $STYLE" 708
NEG="$NEG, $NEG_SALMA, brown hair, dark hair, black hair, hairline, hair under the scarf" gen hadiya "on the right $SALMA, her white under-cap comes down to just above her eyebrows so only her face shows inside the pink scarf, holding out an empty pale pink scallop seashell in her open hand to the boy on the left, $SAMI with his short black curly hair uncovered smiling, full body view, sunny beach, $NOORI standing on the sand beside them, $STYLE" 710
echo "noori-huwa IMAGES DONE"

# ── REVIEW LOG (every page checked by eye on contact sheets and at full size) ──
#   2026-11-01: cover 600 · salam 701 (702-704 drew the bag as a blob like an animal) ·
#   recall 702 (705 lost the book) · kis 706 (703/704 hid Sami, 705 hair under the cap).
#   zujaja 704 (705 hair under the cap, 706 two Nooris, 707 cap like a visor) · qitt 708 ·
#   umm 706 · clean 708 · hadiya 710. Salma checked at full size on every page: no hair.
