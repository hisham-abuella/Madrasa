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
# ── cover and story (TODO: one prompt per page, built from $NOORI $SAMI $SALMA $SHELL + $STYLE) ──
gen cover "TODO $NOORI …, $STYLE" 600
gen salam "TODO $NOORI …, $STYLE" 601
gen friends "TODO $NOORI …, $STYLE" 602
gen qarib "TODO $NOORI …, $STYLE" 603
gen kitab "TODO $NOORI …, $STYLE" 604
gen samaka "TODO $NOORI …, $STYLE" 605
gen nakhla "TODO $NOORI …, $STYLE" 606
gen sadafa "TODO $NOORI …, $STYLE" 607
gen ta "TODO $NOORI …, $STYLE" 608
gen qitt "TODO $NOORI …, $STYLE" 609
gen sadiq "TODO $NOORI …, $STYLE" 610
gen bint "TODO $NOORI …, $STYLE" 611
gen shams "TODO $NOORI …, $STYLE" 612
gen nashit "TODO $NOORI …, $STYLE" 613
gen bye "TODO $NOORI …, $STYLE" 614
gen back "TODO $NOORI …, $STYLE" 615
echo "noori-huwa IMAGES DONE"

# ── REVIEW LOG (every page checked by eye on contact sheets and at full size) ──
#   <page> <seed> · …   Redrawn: <page> (<old seeds> <why>).   Accepted drift: …
