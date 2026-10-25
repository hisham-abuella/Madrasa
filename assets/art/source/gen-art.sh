#!/bin/zsh
# The ILLUSTRATED artwork set for the Nawras site, drawn locally by Z-Image Turbo
# (draw-things-cli), one picture at a time, 1536px masters.
#
#   zsh assets/art/source/gen-art.sh                 # draws every missing master (run_in_background)
#   ONLY="pic/cat pic/cat-f" zsh assets/art/source/gen-art.sh   # just these
#   SEED_ADD=100 ONLY=pic/cat zsh …                  # redraw with another seed (into hi/tries/)
#   python3 assets/art/source/make-web.py            # WebP web copies (+ transparent stickers)
#
# The characters, the style and the negative prompt are the BOOK's, copied
# verbatim from book/source/gen-noori-shell.sh so the site matches the book.
# Never retype them in a prompt; reuse the variables. The book's lessons hold:
#   - Salma: headscarf, long sleeves, dress OVER long trousers, socks and shoes
#     (without the trousers + shoes the model drew bare shins).
#   - Sami: short black curly hair UNCOVERED (the model gave him a headscarf once).
#   - The she-cat is a CALICO with a pink COLLAR (a white cat with a bow is too
#     close to a famous character): NEG adds bow, ribbon, hello kitty.
#   - Noori always has his teal scarf (repeat it when a pose hides it).
#   - Name the positions (left / middle / right) when two children share a picture.
# The model cannot write: no word, letter or number is ever drawn; every Arabic
# word on the site is typeset by the page.
REPO=$(cd "$(dirname "$0")/../../.." && pwd)
HI=${HI:-$REPO/assets/art/hi}
CLI=/opt/homebrew/bin/draw-things-cli

# ── from the book, verbatim ──────────────────────────────────────────────────
NOORI="a cute round chubby cartoon baby seagull named Noori with a round white and cream body, a small orange beak, big kind round dark eyes with a white sparkle, rosy pink cheeks, soft grey wings with grey wing tips, small orange feet, and a tiny teal scarf around his neck"
SAMI="a cheerful six-year-old cartoon boy with short black curly hair, warm light-brown skin, round soft face, small thin eyebrows, wearing a long-sleeved blue t-shirt, long navy trousers and white sneakers"
SALMA="a cheerful six-year-old cartoon girl wearing a soft pink headscarf that covers all her hair and neck, warm light-brown skin, round soft face, small thin eyebrows, wearing a long-sleeved yellow dress with long white trousers underneath that cover her legs, white socks and pink shoes"
SHELL="a small pale pink scallop seashell"
STYLE="bright cartoon children's book illustration, bold clean dark navy outlines, flat vibrant colours, simple rounded shapes, soft San Diego beach palette of ocean teal, warm sand, sunset coral and sky blue, gentle and cheerful, simple uncluttered background"
NEG="text, letters, words, numbers, arabic script, arabic calligraphy, writing, signs, logo, label, caption, watermark, \
adult, grown-up, man, woman, adult arms, adult hands, extra arms, extra hands, extra fingers, extra limbs, extra wings, extra legs, extra eyes, deformed, \
black bird, crow, duck, chicken, penguin, pelican, long neck, \
idol, statue, cross, church, steeple, temple, pig, alcohol, wine, beer, bottle, revealing clothing, bare shoulders, bare legs, shorts, swimsuit, bikini, sleeveless, short skirt, \
musical instrument, scary, angry, sharp teeth, crowd, cluttered, blurry, photorealistic, photograph, 3d render, painterly, gouache, watercolour texture"

# ── site additions ──────────────────────────────────────────────────────────
# Stickers / single objects: the book style, but one subject on plain white
# (make-web.py flood-fills the white that touches the border into transparency).
# (The book's "San Diego beach palette" words drew a whole beach behind a lone
# shell on the first try, seed 1021, so stickers drop them and NEG adds SCN.)
PSTYLE="a single cute cartoon sticker, bright cartoon children's book illustration, bold clean dark navy outlines, flat vibrant colours, simple rounded shapes, gentle and cheerful, one single subject in the centre with empty white space all around it, isolated on a plain solid white background"
# Review of the first pass: "sticker" in PSTYLE made the model add little sticker
# characters (a boy on the book cover, a bear by the door, a bunny on the apple,
# a speech bubble by the blocks). Redraws use PSTYLE2 and NEG_OBJ instead.
PSTYLE2="bright cartoon children's book illustration, bold clean dark navy outlines, flat vibrant colours, simple rounded shapes, gentle and cheerful, one single object in the centre with empty white space all around it, isolated on a plain solid white background, nothing else in the picture"
NEG_OBJ=", sticker, decal, emoji, badge, teddy bear, bear, bunny, small extra character, tiny person, mascot, speech bubble, face on object, print, logo on clothes, pattern on clothes"
SCN=", background scenery, landscape, beach, sea, ocean, sky, clouds, sand, horizon, ground, grass, floor, room, wall, shadow"
# Backgrounds that sit behind typeset text and stickers: no characters at all.
BSTYLE="$STYLE, no people, no animals, no birds, no characters"
NEG_BG="$NEG, person, people, child, boy, girl, animal, cat, bird, seagull, face"
# Grown-ups exist only in the word pictures (teacher, mother): modest, kind.
# The adult words are taken out of NEG for those three, everything else stays.
NEG_ADULT="${NEG//adult, grown-up, man, woman, adult arms, adult hands, /}"
NEG_CAT="$NEG, bird, seagull, duck, bow, ribbon, hello kitty"
# Review lessons for the site pass:
# - $NOORI's "big kind round dark eyes with a white sparkle" beat every "eyes closed"
#   (sleep 1105, 1205, 1305, 1306 all awake), so the sleep pose swaps that one clause.
NOORI_ASLEEP="${NOORI/big kind round dark eyes with a white sparkle/eyes peacefully closed in sleep, each eye drawn as one small curved line}"
# - The scarf showed a fringe of hair at the forehead (girl 1001, student-f 1005,
#   mother, teacher-f), so every headscarf now adds HIJAB.
# First wording (girl 1101/1102, student-f 1105, mother 1206, teacher-f 1203, parents 1430)
# still drew a dark fringe; the under-cap (bonnet) below the scarf is what hides it.
HIJAB="no hair visible at all, a snug white under-cap beneath the headscarf covers her whole forehead hairline, only her face shows"

gen () {   # gen <dir/key> "<prompt>" <seed> [w] [h] [neg]
  local key=$1 prompt=$2 seed=$3 w=${4:-1536} h=${5:-1536} neg=${6:-$NEG}
  if [[ -n $ONLY && " $ONLY " != *" $key "* ]]; then return; fi
  # stickers: no scenery behind them (pic/sea is itself a scene)
  if [[ $key == (pic|noori)/* || $key == site/(level|wotd)* ]] && [[ $key != pic/sea ]]; then neg="$neg$SCN"; fi
  local s=$((seed + ${SEED_ADD:-0})) out="$HI/$key.png"
  [[ -n $SEED_ADD ]] && out="$HI/tries/$key-$s.png"
  mkdir -p "$(dirname "$out")"
  [[ -f "$out" ]] && { echo "skip $key ($s)"; return; }
  local t0=$SECONDS
  $CLI generate --model z_image_turbo_1.0_q8p.ckpt \
    --prompt "$prompt" --negative-prompt "$neg" \
    --width $w --height $h --seed $s --disable-preview \
    --output "$out" >/dev/null 2>&1 && echo "done $key ($s) $((SECONDS - t0))s" || echo "FAIL $key ($s)"
}

# Seeds: first draw pic 1000+, noori 1100+, story 1200+, site 1300+;
# a redraw adds 100 per try (the winning seed is written on the gen line).

# ── 1. word pictures for KS.pic (assets/art/pic/<name>.webp) ────────────────
# pic/boy: first draw (1000) rejected — shirt had a little cat print
gen pic/boy "$SAMI standing and smiling, full body view from head to shoes, arms relaxed, his blue t-shirt completely plain, $PSTYLE2" 1100 1536 1536 "$NEG$NEG_OBJ"
# pic/girl: 1001, 1101, 1102 showed hair under the scarf at the forehead; 1201 and 1202 both fixed it
#   with the under-cap — 1202 chosen (centred, round face like the book's Salma)
gen pic/girl "$SALMA, $HIJAB, standing and smiling, full body view from head to shoes, arms relaxed, $PSTYLE2" 1202 1536 1536 "$NEG$NEG_OBJ, hair, fringe, bangs"
gen pic/teacher-m "a kind smiling cartoon male school teacher, a young grown-up man with short black hair and a short neat black beard, round glasses, wearing a long-sleeved light blue shirt, long navy trousers and brown shoes, holding a closed blue book with a plain cover, full body view from head to shoes, $PSTYLE" 1002 1536 1536 "$NEG_ADULT"
# pic/teacher-f: 1103 a fringe of hair. 1003 had a grey background and a face on the book
gen pic/teacher-f "a kind smiling cartoon female school teacher wearing a lavender headscarf that covers all her hair and neck, $HIJAB, round glasses, a long loose long-sleeved dark teal dress that reaches the floor, closed black shoes, holding a closed blue book with a plain cover, full body view from head to shoes, $PSTYLE2" 1303 1536 1536 "$NEG_ADULT$NEG_OBJ, grey background, hair, fringe, bangs"
gen pic/student-m "$SAMI wearing a red school backpack on his back, holding a closed green notebook, standing and smiling, full body view from head to shoes, $PSTYLE" 1004
# pic/student-f: 1005 showed hair under the scarf at the forehead
gen pic/student-f "$SALMA, $HIJAB, wearing a purple school backpack on her back, holding a closed green notebook, standing and smiling, full body view from head to shoes, $PSTYLE2" 1205 1536 1536 "$NEG$NEG_OBJ, hair, fringe, bangs"
# pic/mother: 1006 bare shins; 1106 a fringe of hair. 1006 showed bare shins under the dress (same lesson as Salma: spell out trousers + socks + shoes)
gen pic/mother "a gentle smiling cartoon mother wearing a soft green headscarf that covers all her hair and neck, $HIJAB, a long loose long-sleeved coral dress that reaches the floor, long trousers under the dress, socks and closed brown shoes so no skin shows below the dress, hands together kindly, full body view from head to shoes, $PSTYLE2" 1306 1536 1536 "$NEG_ADULT$NEG_OBJ, bare ankles, bare legs, skin below dress, hair, fringe, bangs"
gen pic/cat "a cute cartoon big orange striped tabby tomcat sitting and smiling, full body, $PSTYLE" 1007 1536 1536 "$NEG_CAT"
gen pic/cat-f "a cute cartoon small calico she-cat with white, orange and grey patches and a little pink collar, sitting and smiling, full body, $PSTYLE" 1008 1536 1536 "$NEG_CAT"
# pic/book: first draw (1009) rejected — a small boy sticker on the cover
# pic/book: 1109 had a face doodled on the cover
gen pic/book "a closed thick blue hardcover book with a completely plain smooth cover and cream page edges, flat cartoon drawing, $PSTYLE2" 1209 1536 1536 "$NEG$NEG_OBJ, doodle, drawing on cover, face, photograph, realistic"
# pic/door: first draw (1010) rejected — a yellow bear by the door
# pic/door: reworded: "horseshoe arch" draws literal horseshoes (logo pass); 1010 had a bear, 1110 was fine but used the old words
gen pic/door "a wooden door with two panels inside a Moorish keyhole arch doorway on two columns of cream stone, two small round gold door knobs, a step at the bottom, front view, $PSTYLE2" 1210 1536 1536 "$NEG$NEG_OBJ, horseshoe, magnet, lucky charm"
gen pic/house "a small cosy cream-coloured house with a red tiled roof, two square windows and a wooden arched door, front view, $PSTYLE" 1011
gen pic/moon "a smiling crescent moon with a sleepy kind face and rosy cheek, one small twinkling star beside it, $PSTYLE" 1012
gen pic/sun "a big round smiling yellow sun with short orange rays all around and rosy cheeks, $PSTYLE" 1013
gen pic/star "a single bright yellow five-pointed star with a small smiling face, $PSTYLE" 1014
gen pic/fish "a happy little orange fish with yellow fins, side view, $PSTYLE" 1015
gen pic/tree "a round leafy green tree with a short brown trunk, $PSTYLE" 1016
gen pic/rose "a single red rose with a green stem and two green leaves, $PSTYLE" 1017
# pic/apple: first draw (1018) rejected — a bunny face on the apple
gen pic/apple "a shiny red apple with one green leaf on its brown stem, $PSTYLE2" 1118 1536 1536 "$NEG$NEG_OBJ"
gen pic/boat "a small red sailboat with a plain white sail floating on a little curl of teal water, side view, $PSTYLE" 1019
# pic/sea: first draw (1020) rejected — a bear standing in the sea
gen pic/sea "a calm turquoise sea with gentle curling waves under a light blue sky with a small yellow sun, drawn inside a rounded square frame, no animals, $PSTYLE2" 1120 1536 1536 "$NEG$NEG_OBJ"
gen pic/shell "$SHELL, close view, $PSTYLE" 1021
gen pic/palm "a single tall palm tree with green fronds and brown coconuts with a short curved trunk, $PSTYLE" 1022
gen pic/pen "a single yellow wooden pencil with a pink eraser and a sharpened tip, lying diagonally, $PSTYLE" 1023

# ── 2. Noori stickers for KS.gull (assets/art/noori/<mood>.webp) ────────────
gen noori/happy "$NOORI standing and smiling happily, wings relaxed at his sides, full body front view, $PSTYLE" 1100
gen noori/wave "$NOORI standing and waving hello with one wing raised, smiling, full body front view, $PSTYLE" 1101
# noori/fly: first draw rejected — 1102 stood on the ground with wings out instead of flying
gen noori/fly "$NOORI flying high in the air, body leaning forward, both wings spread wide open like a gliding bird, feet tucked under him, smiling, full body, $PSTYLE2" 1202 1536 1536 "$NEG$NEG_OBJ"
# noori/think: first draw rejected — 1103 had no wing on the chin (same pose as happy)
# noori/think: 1103 and 1203 kept both wings out (no wing on the chin)
gen noori/think "$NOORI in a thinking pose: his right wing is bent up so the wing tip rests on his chin, like a child thinking hard, eyes looking up, a small curious smile, his teal scarf clearly visible, full body front view, $PSTYLE2" 1303 1536 1536 "$NEG$NEG_OBJ, wings spread"
gen noori/cheer "$NOORI jumping for joy with both wings raised high, big happy smile, full body front view, $PSTYLE" 1104
# noori/sleep: first draw rejected — 1105 had his eyes wide open
# noori/sleep: 1105 and 1205 had open eyes
# noori/sleep: 1105/1205/1305/1306 had open eyes
gen noori/sleep "$NOORI_ASLEEP, fast asleep sitting down, head resting to one side, a peaceful sleepy smile, wings folded, his teal scarf clearly visible, full body, $PSTYLE2" 1405 1536 1536 "$NEG$NEG_OBJ, open eyes, pupils, eyes open, sparkle in eyes"

# ── 3. story scenes (lessons/story.html) — backgrounds for the stickers ─────
# Slides 1, 2, 3, 10, 13 reuse book pictures (cover, salam, friends, nashit,
# sadiq); see make-web.py. The others are empty beach backgrounds: the page
# puts Noori, the children and the word pictures on top as stickers, so the
# sand in the lower half stays empty.
gen story/s04-wall "a sunny San Diego beach, a low rounded sandstone wall along the back, calm turquoise sea and a soft blue sky with two small clouds above, a wide stretch of empty smooth sand in the lower half, $BSTYLE" 1204 1536 1024 "$NEG_BG"
# story/s05-dusk: first draw rejected — 1205 came out photo-like (fine texture, realistic pier)
gen story/s05-dusk "a calm San Diego beach at dusk drawn as a flat cartoon, a soft lavender and peach sky, the calm sea with a few simple wave lines, a small wooden pier far away on the right, a wide stretch of empty smooth plain sand in the lower half, $BSTYLE" 1305 1536 1024 "$NEG_BG, realistic, detailed texture, pebbles"
gen story/s06-sunset "a San Diego beach at sunset, a warm coral and golden sky with soft pink clouds, the sun half under the calm sea horizon, a wide stretch of empty smooth sand in the lower half, $BSTYLE" 1206 1536 1024 "$NEG_BG"
gen story/s07-sand "close view of smooth wet sand at the edge of the sea, a thin line of white foam from a gentle little wave at the top, a few tiny pebbles, lots of empty sand, $BSTYLE" 1207 1536 1024 "$NEG_BG"
gen story/s08-shells "a sunny San Diego beach with a few small colourful seashells scattered at the edges of the sand, calm teal sea and blue sky, empty sand in the middle, $BSTYLE" 1208 1536 1024 "$NEG_BG"
gen story/s09-cliffs "a bright sunny San Diego beach below golden sandstone cliffs with a few green bushes on top, calm teal sea on the right, clear blue sky, a wide stretch of empty smooth sand in the lower half, $BSTYLE" 1209 1536 1024 "$NEG_BG"
gen story/s11-picnic "a cosy picnic on the beach seen from above: a striped blanket on the sand with colourful pencils, crayons and a closed notebook in one corner, lots of empty blanket, $BSTYLE" 1211 1536 1024 "$NEG_BG"
gen story/s12-sails "a calm turquoise sea with three small sailboats with plain white sails far away, a soft blue sky with round white clouds, a thin strip of sand at the bottom, $BSTYLE" 1212 1536 1024 "$NEG_BG"

# ── 4. site: heroes (behind or beside the typeset headline), levels, words ─
# andalus + mihrab: portrait, shown inside an arch beside / under the headline.
gen site/hero-andalus "a small Andalusian garden courtyard: a round stone fountain in the middle with a thin water channel, two tall dark green cypress trees, two round orange trees with oranges, a cream wall with a row of small horseshoe arches behind, a warm golden sky, empty paving in the lower middle, $BSTYLE" 1300 1152 1536 "$NEG_BG"
# pacific + fanous: wide, full-bleed behind a centred headline — the upper
# middle stays empty sky.
gen site/hero-pacific "a wide panoramic San Diego beach at golden sunset, a big soft round sun low on the calm sea horizon in the centre, a tall palm tree at the far left edge and another at the far right edge, gentle teal waves and warm sand along the bottom, a large calm empty pale peach sky across the whole upper middle, $BSTYLE" 1301 1536 768 "$NEG_BG"
gen site/hero-fanous "a wide night scene, a large calm empty dark navy blue night sky in the middle, a row of glowing golden hanging lanterns along the very top edge, a thin crescent moon at the top left, a few small stars, a low row of small white houses with domes and lit windows along the very bottom, $BSTYLE" 1302 1536 768 "$NEG_BG"
# kurrasa: the photo in the taped polaroid (Noori is placed on it as a sticker).
gen site/hero-kurrasa "a child's school desk seen from the front: a light wooden desk top with an open notebook with blank lined pages, colourful pencils in a cup, a red apple and crayons, a sunny window with a blue sky and a palm tree behind, empty space in the middle of the desk, $BSTYLE" 1303 1536 1536 "$NEG_BG"
# mosaic: the big Noori tile beside the headline tile.
gen site/hero-mosaic "a cheerful school playground with a low wall covered in bright geometric mosaic tiles of eight-pointed stars in blue, yellow and red, a small yellow slide on the left, a blue sky, empty playground floor in the middle, $BSTYLE" 1304 1536 1536 "$NEG_BG"
gen site/hero-mihrab "a calm peaceful courtyard seen through a tall pointed arch: soft cream walls, a small round fountain, potted green plants, soft morning light, a pale blue sky at the top, lots of quiet empty space, $BSTYLE" 1305 1152 1536 "$NEG_BG"
# the four level cards (transparent stickers)
# site/level-kg: first draw rejected — 1310 had a speech bubble with a face
gen site/level-kg "a small happy pile of soft colourful toy blocks with completely plain faces, a red ball and three crayons, $PSTYLE2" 1410 1536 1536 "$NEG$NEG_OBJ"
# site/level-1: first draw rejected — 1311 photo-like paper and a cat sticker on the page
# site/level-1: 1411 ran off the left edge and looked like a photo
gen site/level-1 "a small open picture book lying flat, the whole book fully visible with white space around it, a simple drawing of a cat on the left page and a sun on the right page, a yellow pencil beside it, flat cartoon drawing, $PSTYLE2" 1511 1536 1536 "$NEG$NEG_OBJ, photograph, realistic, paper texture, cropped"
gen site/level-2 "a stack of three colourful storybooks with completely plain covers and a small paper boat on top, $PSTYLE" 1312
# site/level-3: first draw rejected — 1313 stickers with faces on the pages
gen site/level-3 "an open notebook with blank ruled lines, a yellow pencil and a small round dark blue ink pot, $PSTYLE2" 1413 1536 1536 "$NEG$NEG_OBJ, photograph, paper texture"
# word of the day (the other three words reuse pic/sea, pic/star, pic/sun)
gen site/wotd-garden "a small round garden with green bushes, red and pink roses and a little round stone fountain, $PSTYLE" 1320
gen site/wotd-lantern "a single glowing golden Ramadan lantern (fanous) with coloured glass panes and a small ring on top, $PSTYLE" 1321
# site/wotd-notebook: first draw rejected — 1322 a boy sticker on the cover
gen site/wotd-notebook "a new closed school notebook with a plain teal cover and a yellow pencil lying on it, $PSTYLE2" 1422 1536 1536 "$NEG$NEG_OBJ"
# parents: a warm "photo-style" picture for the parents strip
# site/parents: 1430/1530 still showed Salma's fringe (under-cap now spelled out for her too); 1330 showed a fringe of hair under both scarves
gen site/parents "a warm sunny morning, a kind cartoon mother wearing a soft green headscarf that covers all her hair and neck, $HIJAB, and a long loose long-sleeved coral dress, walking hand in hand with $SALMA who also wears a snug white under-cap beneath her pink scarf so no hair shows, on the left side, toward a small cream school building with a mission-style arched entrance and two palm trees, full body view, $STYLE" 1630 1536 1024 "$NEG_ADULT$NEG_OBJ, crowd, hair, fringe, bangs"
echo "ART DONE"

# ── REVIEW LOG (every picture checked by eye at full size + contact sheets) ──
#   Every master was opened at full size and on contact sheets (people at 760px tiles),
#   and every sticker was checked again after the white was cut away (on teal).
#   Winning seeds are the ones on the gen lines above. Rejected draws: hi/tries/.
#   Accepted first time (seed 10xx / 11xx / 12xx / 13xx): teacher-m, student-m, cat, cat-f,
#     house, moon, sun, star, fish, tree, rose, boat, shell (2nd try after the beach
#     background), palm, pen; noori happy, wave, cheer; story s04 s06 s07 s08 s09 s11 s12;
#     all six heroes, level-2, wotd-garden, wotd-lantern.
#   Redrawn (why → winner):
#     pic/shell   1021 drew a whole beach behind the shell (PSTYLE fixed, SCN added) → 1021
#     pic/boy     1000 cat print on the shirt → 1100
#     pic/girl    1001, 1101, 1102 hair fringe under the scarf → 1202 (white under-cap)
#     pic/student-f 1005, 1105 fringe → 1205;  pic/mother 1006 bare shins, 1106/1206 fringe → 1306
#     pic/teacher-f 1003 grey background + face on book, 1103/1203 fringe → 1303
#     pic/book    1009 boy sticker on cover, 1109 face doodle → 1209
#     pic/door    1010 bear; 1110 fine but "horseshoe arch" wording → 1210 (keyhole arch)
#     pic/apple   1018 bunny face → 1118;  pic/sea 1020 bear in the sea → 1120
#     noori/fly   1102 standing, not flying → 1202
#     noori/think 1103, 1203 no wing on the chin → 1303 (1304 also fine)
#     noori/sleep 1105, 1205, 1305, 1306 eyes open → 1405 (NOORI_ASLEEP)
#     story/s05   1205 photo-like → 1305
#     site/level-kg 1310 speech bubble → 1410 (faces on the blocks accepted)
#     site/level-1  1311 sticker + photo look, 1411 cut off at the edge → 1511
#     site/level-3  1313 face stickers → 1413;  site/wotd-notebook 1322 boy sticker → 1422
#     site/parents  1330, 1430, 1530 hair fringe → 1630
#   Reused from the book instead of drawn: story s01 cover, s02 salam, s03 friends,
#     s10 nashit, s13 sadiq (book/art-hi/images-noori-shell, cropped by make-web.py).
