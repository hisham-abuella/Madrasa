#!/usr/bin/env bash
# Stand-in pictures for a book whose art is not drawn yet (a dry run of the
# topic-book skill, or a spec being proofread before the GPU batch).
#
#   bash tools/placeholder-art.sh <slug> [page=noori-key …]
#
# For every picture the spec needs (each page's "img" + back), copies a
# noori-shell master from art-hi/images-noori-shell/ into art-hi/images-<slug>/
# and stamps it "PLACEHOLDER" across the middle, so it can never pass for the
# real art. The source is the same key in the Noori book when it has one, else
# the cover; name pairs to choose (qariban=qarib). Writes
# art-hi/images-<slug>/PLACEHOLDER.txt, which makes print-book.sh name every PDF
# -DRAFT. Real pictures replace these one by one (gen-<slug>.sh skips pages that
# exist, so delete a placeholder before drawing its page, or run:
#   bash tools/placeholder-art.sh <slug> --clear      # removes every placeholder
# ). Never draws anything: no GPU.
set -euo pipefail
cd "$(dirname "$0")/.."
slug=${1:?usage: tools/placeholder-art.sh <slug> [page=noori-key …] | --clear}
shift
dest=art-hi/images-$slug
if [[ ${1:-} == --clear ]]; then
  [[ -f $dest/PLACEHOLDER.txt ]] || { echo "no placeholders in $dest"; exit 0; }
  while read -r key _; do
    [[ $key == \#* || -z $key ]] && continue
    rm -f "$dest/$key.png" "images-$slug/$key.webp" "input/img-hi/images-$slug/$key.jpg"
  done < "$dest/PLACEHOLDER.txt"
  [[ -f images-$slug/cover.jpg ]] && rm -f "images-$slug/cover.jpg"
  rm -f "$dest/PLACEHOLDER.txt"; echo "placeholders removed from $dest"; exit 0
fi
[[ -f stories/$slug.json ]] || { echo "no stories/$slug.json" >&2; exit 1; }
mkdir -p "$dest"
python3 - "$slug" "$dest" "$@" <<'PY'
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
slug, dest, *pairs = sys.argv[1:]
spec = json.loads(Path(f'stories/{slug}.json').read_text())
want = []
for p in spec['pages']:
    if p.get('img') and p['img'] not in want: want.append(p['img'])
if 'back' not in want: want.append('back')
src_dir = Path('art-hi/images-noori-shell')
pick = dict(x.split('=', 1) for x in pairs)
try:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 120)
    small = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 44)
except OSError:
    font = small = ImageFont.load_default()
log = ['# placeholder pictures (tools/placeholder-art.sh) — NOT the book\'s art. key  source']
made = 0
listed = Path(dest) / 'PLACEHOLDER.txt'
old = {l.split()[0] for l in listed.read_text().splitlines() if l.strip() and not l.startswith('#')} if listed.exists() else set()
for key in want:
    out = Path(dest) / f'{key}.png'
    if out.exists() and key not in old:
        continue                                  # a real master: never overwrite it
    src = pick.get(key) or (key if (src_dir / f'{key}.png').exists() else 'cover')
    im = Image.open(src_dir / f'{src}.png').convert('RGB')
    im = Image.blend(im, Image.new('RGB', im.size, (255, 255, 255)), 0.35)   # washed out
    d = ImageDraw.Draw(im)
    W, H = im.size
    d.rectangle([0, H // 2 - 110, W, H // 2 + 110], fill=(200, 30, 30))
    d.text((W // 2, H // 2 - 20), 'PLACEHOLDER', fill='white', font=font, anchor='mm')
    d.text((W // 2, H // 2 + 70), f'{slug} / {key}  (from noori-shell / {src})', fill='white', font=small, anchor='mm')
    im.save(out)
    log.append(f'{key}  {src}'); made += 1
(Path(dest) / 'PLACEHOLDER.txt').write_text('\n'.join(log) + '\n')
print(f'{dest}: {made} placeholder picture(s), list in {dest}/PLACEHOLDER.txt')
PY
