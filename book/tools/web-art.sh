#!/usr/bin/env bash
# Make a book's web pictures from its high-resolution masters.
#
#   tools/web-art.sh <slug> [page …]
#
# Every page is drawn once, at 1536px, into art-hi/images-<slug>/ (DEST=…
# SIZE=1536 zsh source/gen-<slug>.sh). The web book shows images-<slug>/*.webp,
# the same pictures shrunk to 1024px (WebP, each <= 150 KB; plus cover.jpg for
# og:image, which social sites read best), so the screen and the print editions can
# never drift apart — a re-render at a new size would be a different picture.
#
# Name pages to update only those. Do that on books drawn before this rule
# (Loza, Susu, the Muslim books): their art-hi masters are separate 1536px
# re-renders, not the pictures on the web, and must not replace them.
set -euo pipefail
cd "$(dirname "$0")/.."
slug=${1:?usage: tools/web-art.sh <slug> [page …]}
shift
src=art-hi/images-$slug
[[ -d $src ]] || { echo "no $src — draw the pages first: DEST=\$PWD/$src SIZE=1536 zsh source/gen-$slug.sh" >&2; exit 1; }
mkdir -p "images-$slug"
n=0
if (( $# )); then masters=(); for k in "$@"; do masters+=("$src/$k.png"); done
else masters=("$src"/*.png); fi
for hi in "${masters[@]}"; do
  [[ -f $hi ]] || { echo "no $hi" >&2; exit 1; }
  key=$(basename "$hi" .png)
  out=images-$slug/$key.webp
  [[ -f $out && $out -nt $hi ]] && continue
  python3 - "$hi" "$out" <<'PY'
import sys, os
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
im.thumbnail((1024, 1024), Image.LANCZOS)
for q in (86, 80, 74, 68, 62, 56):
    im.save(out, 'WEBP', quality=q, method=6)
    if os.path.getsize(out) <= 150_000: break
if os.path.basename(out) == 'cover.webp':
    jpg = out[:-5] + '.jpg'
    for q in (85, 78, 70, 62):
        im.save(jpg, 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(jpg) <= 150_000: break
PY
  rm -f "images-$slug/$key.png"          # the old 1024px PNG web copy, if any
  n=$((n + 1))
done
echo "images-$slug: $n picture(s) updated from $src"
