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
