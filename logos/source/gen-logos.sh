#!/bin/zsh
# gen-logos.sh — Nawras logo emblems, drawn locally with Draw Things (Z-Image Turbo).
#
#   zsh logos/source/gen-logos.sh            # draws every try that is missing
#   ONLY=c1 zsh logos/source/gen-logos.sh    # one concept only
#
# Rules borrowed from ~/Work/bedtime-stories (storybook skill §4–§6):
#   - the seed is the picture: same prompt + seed + size = same image
#   - one STYLE string appended to every prompt; the opposite styles are negatives
#   - the mascot is held by words alone: $NOORI is never retyped
#   - the model cannot write → NO text in the emblems. The wordmark «نَوْرَس» is
#     typeset afterwards in HTML/SVG with real fonts (logos/index.html).
#   - runs ONE AT A TIME (GPU-bound). Existing files are skipped, so it can be re-run.
#
# Output: logos/build/<concept>-<seed>.png (1024px). The chosen seed is copied to
# logos/img/<concept>.png (+ .webp), the others to logos/img/tries/.
#
# ── WINNERS (picked by eye on logos/contact-sheet.png) ─────────────────────
#   see the WINNERS block at the bottom of this file (kept in sync with logos/index.html)
set -u
CLI=/opt/homebrew/bin/draw-things-cli
MODEL=z_image_turbo_1.0_q8p.ckpt
SIZE=1024
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${OUT:-$ROOT/build}
mkdir -p "$OUT"

# Noori, the mascot — fixed description (BRIEF.md), never retyped
NOORI="a cute round chubby cartoon baby seagull named Noori, white and cream body, small orange beak, big kind round dark eyes with a white sparkle, soft grey wings with dark grey wing tips, a tiny teal scarf"
NOORI_FLY="a cute round chubby cartoon baby seagull flying with wings spread wide, white and cream body, small orange beak, big kind round dark eyes, grey wing tips, a tiny teal scarf"
GULL_SIL="a simple white seagull silhouette with wings spread in flight, seen from the front"

STYLE="flat vector logo emblem, simple bold shapes, thick clean dark outline, limited palette of 3 to 4 flat colours, no gradients, centered composition, isolated on a plain pure white background, generous white margin, kid-friendly, friendly and soft, professional children's brand mark, clean edges"

NEG="text, letters, words, numbers, arabic script, arabic calligraphy, writing, typography, caption, signature, watermark, logo text, label, banner with text, \
idol, statue, cross, church, steeple, bell, pig, alcohol, wine, bottle, revealing clothing, bare shoulders, person, human, man, woman, child, face of a person, \
scary, angry, evil eyes, red eyes, sharp teeth, creepy, horror, extra wings, extra legs, extra eyes, deformed, \
photorealistic, photo, 3d render, realistic feathers, painterly, watercolour texture, grain, noise, busy background, mockup, paper texture, shadow on wall, multiple logos, grid of icons"

gen () {   # gen <concept> <seed> "<prompt>"
  local key=$1 seed=$2 prompt=$3 f="$OUT/$1-$2.png"
  [[ -n ${ONLY:-} && $ONLY != $key ]] && return
  [[ -f $f ]] && { echo "have $key-$seed"; return; }
  if $CLI generate --model $MODEL --prompt "$prompt, $STYLE" --negative-prompt "$NEG" \
       --width $SIZE --height $SIZE --seed $seed --disable-preview --output "$f" >/dev/null 2>&1
  then echo "drew $key-$seed"; else echo "FAIL $key-$seed"; fi
}

# 1 · Seagull + crescent (pacific) — Noori flying through a crescent over a wave
C1="a circular badge emblem: $NOORI_FLY gliding through the curve of a big golden crescent moon, above a single curling ocean wave in teal, colours ocean teal, sunset coral, warm yellow and white"
for s in 101 102 103 104; do gen c1 $s "$C1"; done

# 2 · Andalusian arch (andalus) — horseshoe arch framing an ocean sunset + gull
C2="an emblem shaped like an Andalusian horseshoe arch with a terracotta frame and a thin ring of simple geometric tile pattern, inside the arch a calm ocean with a round setting sun and one small white seagull flying, colours terracotta, teal, cream and warm gold"
for s in 201 202 203 204; do gen c2 $s "$C2"; done
# Redraw (seeds 251-254): "horseshoe arch" came out as a literal horseshoe on every
# seed (201-204), so describe the building instead and block horseshoes. Do not
# "simplify" this back to "horseshoe arch".
C2B="an emblem of a Moorish arched window like the Alhambra: a tall pointed keyhole-shaped arch with a rounded top, standing on two slim columns and a flat base, the arch frame in terracotta with a thin border of small geometric zellige tiles, through the arch window a calm teal ocean with a round golden setting sun and one small white seagull flying, cream sky, colours terracotta, teal, cream and warm gold"
NEG_C2="horseshoe, horse, magnet, lucky charm, U shape"
for s in 251 252 253 254; do NEG="$NEG, $NEG_C2" gen c2 $s "$C2B"; done

# 3 · Khatam 8-point star (mosaic) — seagull silhouette inside
C3="an eight-pointed Islamic star emblem made of two overlapping squares, filled with bold flat mosaic tile segments in blue, red and yellow, with $GULL_SIL in the center, thick dark navy outlines"
for s in 301 302 303 304; do gen c3 $s "$C3"; done

# 4 · Book + wave (kurrasa) — open book whose pages become waves, gull above
C4="an emblem of an open book seen from the front, its two pages curl up into blue ocean waves, a small white seagull flying above the book, colours pencil blue, crayon red, sunny yellow and white, simple notebook doodle feel"
for s in 401 402 403 404; do gen c4 $s "$C4"; done

# 5 · Lantern (fanous) — Noori perched on a Ramadan lantern, gold on lapis
C5="a circular emblem with a deep lapis blue round background: a traditional ornate brass fanous lantern glowing warm gold with simple geometric window cutouts, and $NOORI perched on top of the lantern, small golden stars around, colours lapis blue, gold, turquoise and cream"
for s in 501 502 503 504; do gen c5 $s "$C5"; done

# 6 · Mascot mark (app icon) — Noori's face in a circle, simple enough for 32px
C6="an app icon: a teal circle containing only the head of $NOORI, front view, very simple flat shapes, big friendly face filling the circle, no body, minimal details, sticker style"
for s in 601 602 603 604; do gen c6 $s "$C6"; done

echo "IMAGES DONE"

# ── WINNERS ──────────────────────────────────────────────────────────────
#   c1 Gull & Crescent  seed 102  (101/104 crescent bleeds outside the badge; 103 good but busier)
#   c2 Andalusian Arch   seed 253  (201-204 REJECTED: literal horseshoes; 253 best tile border + visible gull)
#   c3 Khatam Star       seed 301  (303 REJECTED: 6-point star reads wrong; 302/304 ok, 301 cleanest gull)
#   c4 Book of Waves     seed 401  (only seed where the pages really become waves; 403/404 show text-like lines)
#   c5 Noori's Lantern   seed 502  (only seed with Noori clearly perched on top, feet visible)
#   c6 Noori Face Mark   seed 603  (face fills the circle best -> reads at 32px)
# Then:  python3 logos/source/process.py c1=102 c2=253 c3=301 c4=401 c5=502 c6=603
#        (transparent masters img/cN.png, web img/cN.webp, rejected seeds -> img/tries/, contact-sheet.png)
# Vector versions (hand-built, not generated): logos/svg/hilal-badge.svg (c1), logos/svg/noori-icon.svg (c6)

# ═════════════════════════════════════════════════════════════════════════
# ROUND 2 (2026-10-25) — the SAME six concepts, now 4 generated variants each,
# replacing the hand-drawn SVGs on logos/index.html (the SVGs stay on disk for print).
#   m = main emblem v2   d = dark background   s = small mark (32-64 px)   o = one colour
#
#   ONLY=c2 VAR=m zsh logos/source/gen-logos.sh     # one concept / one variant
#
# Output: logos/build/v2/<concept>-<var>-<seed>.png (1024px). Seeds: 1000 + concept*100
# + variant*10 + n  (m=1, d=2, s=3, o=4; e.g. c3 small, 2nd try = 1332).
# Noori here uses the book's fixed description (book/source/gen-noori-shell.sh), so the
# logo bird and the book/site bird match: rosy cheeks, small orange feet, teal scarf.
# Still runs ONE AT A TIME; existing files are skipped.
OUT2=$ROOT/build/v2; mkdir -p "$OUT2"
NOORI2="a cute round chubby cartoon baby seagull named Noori with a round white and cream body, a small orange beak, big kind round dark eyes with a white sparkle, rosy pink cheeks, soft grey wings with grey wing tips, small orange feet, and a tiny teal scarf around his neck"
NOORI2_FLY="$NOORI2, flying with both wings spread wide"
GULL2="one large white seagull with grey wing tips and a small orange beak, flying with both wings spread wide"

S_M="$STYLE, crisp polished final logo, perfectly symmetric and balanced"
S_D="flat vector logo emblem, simple bold shapes, thick clean outline, limited palette of 3 to 4 flat colours, no gradients, centered composition, the emblem placed on a plain solid deep dark teal background that fills the whole square canvas edge to edge, generous margin, kid-friendly, professional children's brand mark, clean edges, glowing warm colours on dark"
S_S="minimal app icon mark, extremely simple, only two or three big bold flat shapes, very thick outlines, no small details, no thin lines, no tiny stars, readable at 32 pixels, centered, isolated on a plain pure white background, generous white margin, flat vector"
S_O="single colour logo stamp, monochrome dark teal ink only on a plain pure white background, one flat colour, no other colours, no grey, no shading, no gradients, bold clean line art and solid shapes like a rubber stamp or letterhead mark, centered, generous white margin, flat vector"
NEG_O="multiple colours, colourful, orange, yellow, red, pink, gradient, shading, grey"
NEG_N="duck, duck bill, flat wide bill, platypus, penguin, chicken, crow, black bird, pelican, long neck"
NEG_BULB="light bulb, electric bulb, filament, lamp bulb, LED"

gen2 () {   # gen2 <concept> <var> <seed> "<prompt>" "<style>" ["<extra neg>"]
  local key=$1 var=$2 seed=$3 f="$OUT2/$1-$2-$3.png"
  [[ -n ${ONLY:-} && $ONLY != $key ]] && return
  [[ -n ${VAR:-} && $VAR != $var ]] && return
  [[ -f $f ]] && { echo "have $key-$var-$seed"; return; }
  if $CLI generate --model $MODEL --prompt "$4, $5" --negative-prompt "$NEG${6:+, $6}" \
       --width $SIZE --height $SIZE --seed $seed --disable-preview --output "$f" >/dev/null 2>&1
  then echo "drew $key-$var-$seed"; else echo "FAIL $key-$var-$seed"; fi
}

# 1 · Gull & Crescent — round-1 composition (seed 102), crisper
R2C1="a circular badge emblem inside one thick navy ring: $NOORI2_FLY gliding in front of the curve of a big golden crescent moon, above a single curling teal ocean wave at the bottom of the circle, white inside the ring, colours ocean teal, sunset coral, warm yellow, navy and white"
R2C1S="a circular badge: a thick navy ring, inside it a big golden crescent moon and a simple white seagull silhouette with spread wings, one teal wave at the bottom"
R2C1O="a circular badge emblem inside one thick ring: a cute round cartoon baby seagull flying with wings spread wide in front of a big crescent moon, above a single curling ocean wave"
for s in 1111 1112 1113; do gen2 c1 m $s "$R2C1" "$S_M" "$NEG_N"; done
for s in 1121 1122 1123; do gen2 c1 d $s "$R2C1" "$S_D" "$NEG_N"; done
for s in 1131 1132 1133; do gen2 c1 s $s "$R2C1S" "$S_S" "$NEG_N"; done
for s in 1141 1142 1143; do gen2 c1 o $s "$R2C1O" "$S_O" "$NEG_N, $NEG_O"; done

# 2 · Andalusian keyhole arch — the gull was a speck in round 1: now large, centred, in front of the sun.
# (Never "horseshoe arch": it draws a horseshoe. The building is described instead.)
R2C2="an emblem of a Moorish arched window like the Alhambra: a tall pointed keyhole-shaped arch with a rounded top, standing on two slim columns and a flat base, the arch frame in terracotta with a thin border of small geometric zellige tiles, through the arch window a calm teal ocean and a round golden setting sun, and in the middle of the window, large and clearly visible in front of the sun, $GULL2, the seagull fills half the width of the window, cream sky, colours terracotta, teal, cream and warm gold"
R2C2S="a simple bold Moorish keyhole-shaped arch window with a rounded pointed top in terracotta, inside it a round golden sun over a teal sea and one big white seagull silhouette with spread wings in the middle"
R2C2O="an emblem of a Moorish arched window like the Alhambra: a tall pointed keyhole-shaped arch with a rounded top on two slim columns and a flat base, a thin border of small geometric tiles, inside the window a round setting sun over calm sea waves and one large seagull flying with spread wings in the middle"
for s in 1211 1212 1213; do gen2 c2 m $s "$R2C2" "$S_M" "$NEG_C2"; done
for s in 1221 1222 1223; do gen2 c2 d $s "$R2C2" "$S_D" "$NEG_C2"; done
for s in 1231 1232 1233; do gen2 c2 s $s "$R2C2S" "$S_S" "$NEG_C2"; done
for s in 1241 1242 1243; do gen2 c2 o $s "$R2C2O" "$S_O" "$NEG_C2, $NEG_O"; done

# 3 · Khatam 8-point star
R2C3="an eight-pointed Islamic khatam star emblem made of two overlapping squares, one rotated 45 degrees, filled with bold flat mosaic tile segments in teal, lapis blue, coral and warm yellow, with $GULL2 in the center, thick dark navy outlines, perfectly symmetric eight points"
R2C3S="a bold eight-pointed star made of two overlapping squares, one rotated 45 degrees, solid teal, with one simple white seagull silhouette with spread wings in the center, thick navy outline"
R2C3O="an eight-pointed Islamic khatam star emblem made of two overlapping squares, one rotated 45 degrees, with simple geometric tile lines inside, and a seagull silhouette with spread wings in the center, perfectly symmetric eight points"
for s in 1311 1312 1313; do gen2 c3 m $s "$R2C3" "$S_M" "six-pointed star, star of David, pentagram"; done
for s in 1321 1322 1323; do gen2 c3 d $s "$R2C3" "$S_D" "six-pointed star, star of David, pentagram"; done
for s in 1331 1332 1333; do gen2 c3 s $s "$R2C3S" "$S_S" "six-pointed star, star of David, pentagram"; done
for s in 1341 1342 1343; do gen2 c3 o $s "$R2C3O" "$S_O" "six-pointed star, star of David, pentagram, $NEG_O"; done

# 4 · Book + wave — pages are blank (round 1 drew text-like lines on 403/404)
R2C4="an emblem of an open book seen from the front, its two blank pages curl up into big blue ocean waves, $GULL2 above the book, colours ocean blue, teal, sunny yellow and white, the pages have no lines and no writing"
R2C4S="a very simple open book whose two pages are one big blue wave, one white seagull silhouette with spread wings above it"
R2C4O="an emblem of an open book seen from the front, its two blank pages curl up into ocean waves, one seagull flying with spread wings above the book, the pages have no lines and no writing"
for s in 1411 1412 1413; do gen2 c4 m $s "$R2C4" "$S_M" "lines of text, ruled lines, scribbles"; done
for s in 1421 1422 1423; do gen2 c4 d $s "$R2C4" "$S_D" "lines of text, ruled lines, scribbles"; done
for s in 1431 1432 1433; do gen2 c4 s $s "$R2C4S" "$S_S" "lines of text, ruled lines, scribbles"; done
for s in 1441 1442 1443; do gen2 c4 o $s "$R2C4O" "$S_O" "lines of text, ruled lines, scribbles, $NEG_O"; done

# 5 · Lantern with Noori — round 1 had a modern light bulb inside: now a candle flame
R2C5="a circular emblem with a deep lapis blue round background: a traditional ornate brass fanous Ramadan lantern with simple geometric window cutouts, inside the lantern one small white candle with a warm orange candle flame glowing softly, and $NOORI2 perched on top of the lantern, a few small golden stars around, colours lapis blue, gold, turquoise and cream"
R2C5S="a simple bold traditional fanous lantern in gold with one warm candle flame inside, a small round white baby seagull head peeking on top, thick outlines"
R2C5O="a circular emblem: a traditional ornate fanous Ramadan lantern with geometric window cutouts and one candle flame inside, and a cute round cartoon baby seagull perched on top of the lantern, a few small stars around"
for s in 1511 1512 1513; do gen2 c5 m $s "$R2C5" "$S_M" "$NEG_N, $NEG_BULB"; done
for s in 1521 1522 1523; do gen2 c5 d $s "$R2C5" "$S_D" "$NEG_N, $NEG_BULB"; done
for s in 1531 1532 1533; do gen2 c5 s $s "$R2C5S" "$S_S" "$NEG_N, $NEG_BULB"; done
for s in 1541 1542 1543; do gen2 c5 o $s "$R2C5O" "$S_O" "$NEG_N, $NEG_BULB, $NEG_O"; done

# 6 · Noori face app icon — round 1's beak read as a duck bill: now a small pointed seagull beak
R2C6="an app icon: a teal circle containing only the head of $NOORI2, front view, a small short pointed orange seagull beak like a little triangle, big friendly face filling the circle, very simple flat shapes, minimal details, sticker style"
R2C6O="an app icon: a circle containing only the head of a cute round cartoon baby seagull with a tiny scarf, front view, big round eyes, a small short pointed triangle seagull beak, very simple shapes"
for s in 1611 1612 1613; do gen2 c6 m $s "$R2C6" "$S_M" "$NEG_N"; done
for s in 1621 1622 1623; do gen2 c6 d $s "$R2C6" "$S_D" "$NEG_N"; done
for s in 1631 1632 1633; do gen2 c6 s $s "$R2C6" "$S_S" "$NEG_N"; done
for s in 1641 1642 1643; do gen2 c6 o $s "$R2C6O" "$S_O" "$NEG_N, $NEG_O"; done

# c3 small redraw: 1331-1333 drew 5-point stars / a diamond. Spell out the two squares and block 5 points.
R2C3S2="an eight-pointed star with exactly eight sharp points, made of two identical solid teal squares stacked on top of each other, the second square rotated 45 degrees, like an octagram, one simple white seagull silhouette with spread wings in the center, thick navy outline"
for s in 1334 1335 1336; do gen2 c3 s $s "$R2C3S2" "$S_S" "six-pointed star, star of David, pentagram, five-pointed star, five points, diamond, single square"; done
# 1334-1336 still 5 points / a square: the words "Islamic khatam star" (which worked for m/d/o) are what
# the model needs, so keep them and only drop the mosaic.
R2C3S3="an eight-pointed Islamic khatam star emblem made of two overlapping squares, one rotated 45 degrees, perfectly symmetric eight points, filled with one solid flat teal colour, a single big simple white seagull silhouette with spread wings in the center, thick navy outline"
for s in 1337 1338 1339; do gen2 c3 s $s "$R2C3S3" "$S_S" "six-pointed star, star of David, pentagram, five-pointed star, five points"; done
# c6 redraw: 1611-1633 drew Noori's whole body (feet, wings) and most beaks were still wide duck bills
# (only 1613/1623 had a small triangle). Crop to the face and make the beak smaller than the eyes.
R2C6B="an app icon: a teal circle filled by a close-up of only the big round white face of a cute chubby cartoon baby seagull named Noori, cropped at the neck with only the top of a tiny teal scarf at the bottom edge, big kind round dark eyes with a white sparkle, rosy pink cheeks, a tiny short pointed orange seagull beak like a small sharp triangle, the beak much smaller than the eyes, very simple flat shapes, sticker style"
NEG_C6="feet, legs, full body, wings, standing, duck bill, wide beak, big beak"
for s in 1614 1615 1616; do gen2 c6 m $s "$R2C6B" "$S_M" "$NEG_N, $NEG_C6"; done
for s in 1624 1625 1626; do gen2 c6 d $s "$R2C6B" "$S_D" "$NEG_N, $NEG_C6"; done
for s in 1634 1635 1636; do gen2 c6 s $s "$R2C6B" "$S_S" "$NEG_N, $NEG_C6"; done
# 1614-1636: face crop now right, but the beak is still a wide duck bill with a lip line.
# Describe its SHAPE (a narrow candy-corn triangle) instead of "seagull beak", and try a 3/4 view.
R2C6F="an app icon: a teal circle filled by a close-up of only the big round white face of a cute chubby cartoon baby seagull, cropped at the neck with only the top of a tiny teal scarf at the bottom edge, big kind round dark eyes with a white sparkle, rosy pink cheeks, between the eyes a very small narrow orange beak shaped like one candy corn, a slim triangle pointing straight down, no line across it, very simple flat shapes, sticker style"
R2C6Q="an app icon: a teal circle filled by a close-up of the big round white head of a cute chubby cartoon baby seagull, head turned three-quarters to the side, a small slim pointed orange seagull beak seen in profile with a tiny hook at the tip, big kind round dark eyes with a white sparkle, rosy pink cheeks, only the top of a tiny teal scarf at the bottom edge, very simple flat shapes, sticker style"
NEG_C6B="duck, duckling, duck bill, wide beak, flat beak, bill with a line, lips, mouth, smile line, beak with two halves"
for s in 1617 1618; do gen2 c6 m $s "$R2C6F" "$S_M" "$NEG_N, $NEG_C6, $NEG_C6B"; done
for s in 1619; do gen2 c6 m $s "$R2C6Q" "$S_M" "$NEG_N, $NEG_C6, $NEG_C6B"; done
# 1617-1619 still duck bills (the model's prior for a "cute round baby bird face" is a duckling).
# Fix: paint a small pointed seagull beak over the bill of the best face crops (1616, 1624, 1634) with
# logos/source/beak-paint.py, then img2img at low strength so the model redraws it in the same style.
# Seeds 16x7-16x9 = strength 0.30 / 0.40 on the painted image.
gen2i () {  # gen2i <concept> <var> <seed> <init.png> <strength> "<prompt>" "<style>" ["<extra neg>"]
  local f="$OUT2/$1-$2-$3.png"
  [[ -n ${ONLY:-} && $ONLY != $1 ]] && return
  [[ -n ${VAR:-} && $VAR != $2 ]] && return
  [[ -f $f ]] && { echo "have $1-$2-$3"; return; }
  if $CLI generate --model $MODEL --image "$4" --strength $5 --prompt "$6, $7" --negative-prompt "$NEG${8:+, $8}" \
       --width $SIZE --height $SIZE --seed $3 --disable-preview --output "$f" >/dev/null 2>&1
  then echo "drew $1-$2-$3"; else echo "FAIL $1-$2-$3"; fi
}
for k in m-1616 d-1624 s-1634; do [[ -f $OUT2/paint/c6-$k-painted.png ]] || python3 "$ROOT/source/beak-paint.py" "$OUT2/c6-$k.png" "$OUT2/paint/c6-$k-painted.png"; done
gen2i c6 m 1627 "$OUT2/paint/c6-m-1616-painted.png" 0.30 "$R2C6F" "$S_M" "$NEG_N, $NEG_C6, $NEG_C6B"
gen2i c6 m 1628 "$OUT2/paint/c6-m-1616-painted.png" 0.40 "$R2C6F" "$S_M" "$NEG_N, $NEG_C6, $NEG_C6B"
gen2i c6 d 1627 "$OUT2/paint/c6-d-1624-painted.png" 0.30 "$R2C6F" "$S_D" "$NEG_N, $NEG_C6, $NEG_C6B"
gen2i c6 d 1628 "$OUT2/paint/c6-d-1624-painted.png" 0.40 "$R2C6F" "$S_D" "$NEG_N, $NEG_C6, $NEG_C6B"
gen2i c6 s 1637 "$OUT2/paint/c6-s-1634-painted.png" 0.30 "$R2C6F" "$S_S" "$NEG_N, $NEG_C6, $NEG_C6B"
gen2i c6 s 1638 "$OUT2/paint/c6-s-1634-painted.png" 0.40 "$R2C6F" "$S_S" "$NEG_N, $NEG_C6, $NEG_C6B"
echo "ROUND 2 IMAGES DONE"

# ── ROUND 2 WINNERS (picked by eye on logos/contact-sheet-v2.png; 96 tries, 24 kept, 72 in img/v2/tries/) ──
#   c1 m 1111  crispest take on the round-1 composition; wave and crescent sit cleanly inside the ring (1112 ok, 1113 softer)
#      d 1121  flat dark teal field, no drop shadow (1122 has a shadow halo; 1123 wave crowds the ring)
#      s 1131  crescent + white gull + wave on navy disc, boldest at 32 px (1133 thin outline gull)
#      o 1143  the only truly single-colour one (1141 adds a second blue in the wave; 1142 gull reads as a hawk)
#   c2 m 1211  FIXED: big gull in front of the sun, centred in the arch (1212 gull smaller; 1213 gull above the sun, less clear)
#      d 1222  gull over the sun, largest (1221/1223 gull off-centre)
#      s 1231  sun + sea + gull inside a bold terracotta keyhole (1232/1233 gull too faint on yellow)
#      o 1241  boldest stamp lines (1242/1243 thin tile rings vanish when small)
#   c3 m 1311  clean symmetric 8 points (1312 fine but busier; 1313 REJECTED: square with 4 points)
#      d 1322  cleanest star on dark (1321 mosaic noisier; 1323 sun disc behind gull)
#      s 1339  8 points, solid teal, white gull. REJECTED: 1331/1333/1335 five-point stars, 1332 a diamond,
#              1334 ragged 9-point, 1336 a square with a star cut out, 1337 square with nubs, 1338 seven points
#      o 1341  double-line 8-point star, bold gull (1342 octagon inside; 1343 only reads as a square)
#   c4 m 1412  pages rise into one wave, blank pages (1413 REJECTED: text-like lines on the pages; 1411 wave barely there)
#      d 1422  pages really become waves (1421/1423 plain book, no wave)
#      s 1431  book = one blue wave, gull above (1432 framed, heavier; 1433 book shape lost)
#      o 1441  only one with a wave (1442/1443 a plain book)
#   c5 m 1511  FIXED: candle flame instead of the light bulb (no bulb on any seed); Noori perched, feet visible
#      d 1521  same, best balanced on the dark field
#      s 1531  lantern with flame and Noori's head on top (1532 head reads as a dome; 1533 head ring too big)
#      o 1542  dark-teal flame, no grey (1541/1543 flame is pale grey = second colour)
#   c6 m 1628  FIXED: small pointed seagull beak. Every prompt-only try kept a duck bill (1611-1619,
#              1621-1626, 1631-1636), and 1611-1633 also drew the whole body. Final = 1616 (face crop) with the
#              bill painted over (source/beak-paint.py) + img2img strength 0.40; 1627 (0.30) almost identical, 0.40 blends better
#      d 1628  same fix on 1624;   s 1638  same fix on 1634 (the face icon is already the simple mark)
#      o 1641  head-only stamp with a small diamond beak, scarf visible (1642 thin; 1643 no scarf knot)
# Then:  python3 logos/source/process-v2.py c1-m=1111 c1-d=1121 c1-s=1131 c1-o=1143 c2-m=1211 c2-d=1222 c2-s=1231 \
#          c2-o=1241 c3-m=1311 c3-d=1322 c3-s=1339 c3-o=1341 c4-m=1412 c4-d=1422 c4-s=1431 c4-o=1441 c5-m=1511 \
#          c5-d=1521 c5-s=1531 c5-o=1542 c6-m=1628 c6-d=1628 c6-s=1638 c6-o=1641
#        (masters img/v2/hi/cN-<var>.png 1024px, transparent except d; web img/v2/cN-<var>.webp 640px <= 80 KB;
#         contact-sheet-v2.png).  Deck switcher copies: pitch/build/images.py (logo-cN-v2.webp, logo-cN-s-v2.webp).
# The hand-drawn SVGs (logos/svg/) stay for print but are no longer shown on logos/index.html.
