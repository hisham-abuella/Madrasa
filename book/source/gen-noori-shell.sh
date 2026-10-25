#!/bin/zsh
# Artwork for «نُورِي وَالصَّدَفَةُ الصَّغِيرَةُ» (noori-shell), drawn locally by
# Z-Image Turbo — always at 1536px (bedtime-stories storybook skill §4–§6).
#
#   DEST=$PWD/art-hi/images-noori-shell zsh source/gen-noori-shell.sh   # run_in_background
#   tools/web-art.sh noori-shell                                         # 1024px web copies
#   tools/try-seeds.sh noori-shell <page> <first-seed> [n]               # test seeds for one page
#
# Noori is pinned down in words once ($NOORI, matching the mascot: assets/kids.js
# KS.gull and logos/img/c1.png) and reused verbatim in every prompt. Sami and
# Salma have one fixed description and one fixed outfit each, modest dress
# (Salma: headscarf, long sleeves, dress over long trousers, socks and shoes —
# the first test, seeds 602-604 and 611, showed bare shins, so the trousers
# and shoes are spelled out; do not "simplify" them away).
# No grown-ups are drawn (the mother on the fence page lives in the words).
# The model cannot write: every Arabic word, including the big ة, is typeset by
# the book itself, never drawn.
REPO=$(cd "$(dirname "$0")/.." && pwd)
DEST=${DEST:-$REPO/art-hi/images-noori-shell}
SIZE=${SIZE:-1536}
mkdir -p "$DEST"
CLI=/opt/homebrew/bin/draw-things-cli

# ── the characters, in parts. Never retype these in a prompt. ─────────────
NOORI="a cute round chubby cartoon baby seagull named Noori with a round white and cream body, a small orange beak, big kind round dark eyes with a white sparkle, rosy pink cheeks, soft grey wings with grey wing tips, small orange feet, and a tiny teal scarf around his neck"
SAMI="a cheerful six-year-old cartoon boy with short black curly hair, warm light-brown skin, round soft face, small thin eyebrows, wearing a long-sleeved blue t-shirt, long navy trousers and white sneakers"
SALMA="a cheerful six-year-old cartoon girl wearing a soft pink headscarf that covers all her hair and neck, warm light-brown skin, round soft face, small thin eyebrows, wearing a long-sleeved yellow dress with long white trousers underneath that cover her legs, white socks and pink shoes"
SHELL="a small pale pink scallop seashell"
STYLE="bright cartoon children's book illustration, bold clean dark navy outlines, flat vibrant colours, simple rounded shapes, soft San Diego beach palette of ocean teal, warm sand, sunset coral and sky blue, gentle and cheerful, simple uncluttered background"
# What Noori must not become, grown-ups, text, and the house content rules.
NEG="text, letters, words, numbers, arabic script, arabic calligraphy, writing, signs, logo, label, caption, watermark, \
adult, grown-up, man, woman, adult arms, adult hands, extra arms, extra hands, extra fingers, extra limbs, extra wings, extra legs, extra eyes, deformed, \
black bird, crow, duck, chicken, penguin, pelican, long neck, \
idol, statue, cross, church, steeple, temple, pig, alcohol, wine, beer, bottle, revealing clothing, bare shoulders, bare legs, shorts, swimsuit, bikini, sleeveless, short skirt, \
musical instrument, scary, angry, sharp teeth, crowd, cluttered, blurry, photorealistic, photograph, 3d render, painterly, gouache, watercolour texture"

gen () {   # gen <key> "<prompt>" <seed>
  [[ -f "$DEST/$1.png" ]] && { echo "skip $1"; return; }
  $CLI generate --model z_image_turbo_1.0_q8p.ckpt \
    --prompt "$2" --negative-prompt "$NEG" \
    --width $SIZE --height $SIZE --seed "$3" --disable-preview \
    --output "$DEST/$1.png" >/dev/null 2>&1 && echo "done $1" || echo "FAIL $1"
}

# Seeds: first draw 600 up in page order; a redraw adds 100 (7xx, 8xx, 9xx).
# ── cover and story ────────────────────────────────────────────────────────
gen cover "$NOORI standing on warm sand at the edge of a calm turquoise sea, holding $SHELL up proudly in one wing and smiling, one palm tree and soft white clouds behind, $STYLE" 600
gen salam "$NOORI flying happily over the calm blue Pacific ocean on a sunny morning, waving one wing at the viewer, small sailboats far away, golden cliffs and palm trees of the San Diego coast in the distance, $STYLE" 601
# friends: with both children in one clause the model drew only Salma (seeds
# 602-603, 704-706), so the three are placed left / middle / right explicitly.
gen friends "three friends standing in a row on a sunny beach, full body view: on the left $SAMI waving, in the middle $NOORI, on the right $SALMA waving, calm sea behind, $STYLE" 804
gen qarib "$NOORI standing on a wooden post by the sea, pointing with one wing at a small red sailboat with a plain white sail floating on the calm water, $STYLE" 603
gen kitab "$NOORI sitting on a striped beach towel on the sand, reading a big open picture book with plain blank pages, $STYLE" 604
gen samaka "a happy little orange fish jumping out of a curling teal wave, and $NOORI watching it with delight from the shore, $STYLE" 605
# nakhla: seed 606 had Noori hugging the trunk halfway up; the words say he sits
# on top, so "sitting among the leaves at the very top" is spelled out.
gen nakhla "$NOORI sitting among the green leaves at the very top of a tall palm tree, looking down and smiling, the whole palm tree visible from the sand to the leaves, sunny beach, $STYLE" 706
gen sadafa "$NOORI bending down on wet sand and finding $SHELL, close view, small bubbles and gentle foam of a little wave, $STYLE" 607
gen ta "close-up of $SHELL resting on smooth sand, and $NOORI peeking at it with big amazed eyes, lots of plain empty sand around, $STYLE" 608
# qitt: seed 609 merged the white she-cat into Noori (a seagull with a bow), so
# this page has the two cats only, positions spelled out, and no bird at all.
# 709/710 worked, but a white cat with a pink bow on her ear is too close to a
# famous character, so she is a calico with a pink collar instead.
NEG="$NEG, bird, seagull, duck, bow, ribbon, hello kitty" gen qitt "two cute cartoon cats sitting side by side on a low stone beach wall, on the left a big orange striped tabby tomcat, on the right a smaller calico she-cat with white, orange and grey patches and a little pink collar, both cats smiling, calm sea behind, $STYLE" 810   # 809 fine too; 810 has the smaller she-cat
# sadiq: seed 610 gave Sami a headscarf too; the children are placed left and
# right and Sami's short black hair is repeated.
gen sadiq "on the left $SAMI with his short black curly hair uncovered, on the right $SALMA, the two children kneeling on the sand building a big sandcastle together, both smiling, full body view, $NOORI standing on top of the sandcastle, $STYLE" 710
# bint: seed 611 dropped Noori's scarf, so the scarf is repeated on this page.
gen bint "$SALMA standing on the beach with a curious puzzled face, one finger on her chin, thinking, $NOORI standing next to her looking up at her, his teal scarf clearly visible, full body view, $STYLE" 711
gen shams "a big round smiling yellow sun shining over the calm blue sea, and $NOORI standing on a rock waving at the sun, $STYLE" 612
gen nashit "$SAMI and $SALMA running happily along the beach side by side, full body view, flying a bright kite together, $NOORI flying above them, $STYLE" 613
gen bye "$NOORI flying over the sea at sunset waving goodbye with one wing, an orange and pink sky, a thin crescent moon rising, $STYLE" 614
# ── back cover ─────────────────────────────────────────────────────────────
gen back "$NOORI standing on the sand waving goodbye with one wing, $SHELL at his feet, plain warm sand and sky with lots of empty space, $STYLE" 615
echo "noori-shell IMAGES DONE"

# ── REVIEW LOG (every page checked by eye on contact sheets and at full size) ──
#   cover 600 · salam 601 · friends 804 · qarib 603 · kitab 604 · samaka 605
#   nakhla 706 · sadafa 607 · ta 608 · qitt 810 · sadiq 710 · bint 711
#   shams 612 · nashit 613 · bye 614 · back 615
#   Redrawn: friends (602-604, 704-706 lost Sami or showed bare shins),
#   bint (611 lost Noori's scarf), nakhla (606 not on top of the tree),
#   qitt (609 she-cat merged into Noori; 709/710 too close to a famous cat),
#   sadiq (610 gave Sami a headscarf).
#   Accepted drift: nashit 613 shows Sami in short sleeves (outfit says long).
