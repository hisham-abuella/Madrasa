#!/usr/bin/env bash
# Scaffold a new Nawras topic lesson book from the Noori book (noori-shell).
#
#   bash .claude/skills/topic-book/scripts/new-topic-book.sh <slug>
#
# Writes (refuses to overwrite either):
#   book/stories/<slug>.json      a copy of stories/noori-shell.json: the SAME 32 pages,
#                                 same types, same order; slug set, a "topic" stub added,
#                                 every word still Noori's — the agent swaps the topic content
#   book/source/gen-<slug>.sh     the Noori art script's fixed part copied verbatim (NOORI,
#                                 SAMI, SALMA, SHELL, STYLE, NEG, gen()), then one TODO gen
#                                 line per picture, seeds 600 up in page order
# Prints the next commands. Never draws, never narrates.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
BOOK=$ROOT/book
slug=${1:?usage: new-topic-book.sh <slug>   (lowercase-hyphens, e.g. noori-two)}
[[ $slug =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || { echo "slug must be lowercase-with-hyphens" >&2; exit 1; }
[[ $slug == noori-shell ]] && { echo "noori-shell is the template; pick a new slug" >&2; exit 1; }
spec=$BOOK/stories/$slug.json
gen=$BOOK/source/gen-$slug.sh
for f in "$spec" "$gen"; do [[ -e $f ]] && { echo "exists, not overwriting: $f" >&2; exit 1; }; done
# a slug that is a prefix of another book's (noori vs noori-shell) would make globs ambiguous
for s in "$BOOK"/stories/*.json; do
  other=$(basename "$s" .json)
  [[ $other == "$slug"-* || $slug == "$other"-* ]] && { echo "slug '$slug' is a prefix of / prefixed by '$other'; pick another" >&2; exit 1; }
done

node - "$BOOK" "$slug" <<'JS'
const fs = require('fs'), path = require('path');
const [book, slug] = process.argv.slice(2);
const s = JSON.parse(fs.readFileSync(path.join(book, 'stories', 'noori-shell.json'), 'utf8'));
const out = { slug, title: 'TODO عُنْوَانٌ — TODO English title', icon: s.icon, accent: s.accent,
  desc: 'TODO', ogdesc: 'TODO',
  _todo: 'Copied from noori-shell.json by new-topic-book.sh. Keep every page, type, order and exercise type; swap only the topic content. Fill "topic" (only the fields that differ from the Noori defaults in tools/lib.js TOPIC_DEFAULT). Delete this field when done.',
  _markup: s._markup,
  topic: { _fill: 'see SKILL.md step 1c: auto, ending, last, lone, choices, recapFirst, hint, addMark, addHint, addAria, addBoxAria, adjHint, fillFence, answersEn, coverAlt, coverAltPrint, backLine, backLineEn' },
  pages: s.pages };
fs.writeFileSync(path.join(book, 'stories', `${slug}.json`), JSON.stringify(out, null, 1) + '\n');
console.log(`stories/${slug}.json — ${s.pages.length} pages copied from noori-shell (edit the words, keep the structure)`);
JS

{
  echo '#!/bin/zsh'
  echo "# Artwork for the Nawras topic book \"$slug\", drawn locally by Z-Image Turbo at 1536px."
  echo "# Scaffolded from source/gen-noori-shell.sh by .claude/skills/topic-book/scripts/new-topic-book.sh."
  echo '#'
  echo "#   pgrep -fl \"draw-things|narrate|mlx|voicebox\"     # must print nothing: ONE GPU job at a time"
  echo "#   DEST=\$PWD/art-hi/images-$slug zsh source/gen-$slug.sh   # run_in_background; skips drawn pages"
  echo "#   zsh tools/try-seeds.sh $slug <page> <first-seed> [n]"
  echo "#   bash tools/web-art.sh $slug"
  echo '#'
  echo '# The characters, STYLE and NEG below are copied verbatim from the Noori book. Do not'
  echo '# edit them for this book: every book must look like the same series. Add page-specific'
  echo '# negatives with NEG="$NEG, …" on that page'"'"'s gen line, and a comment saying why.'
  sed -n '/^REPO=/,/^# Seeds:/p' "$BOOK/source/gen-noori-shell.sh" | sed "s/images-noori-shell/images-$slug/g"
  echo '# refuse to draw while a prompt is still a TODO (a "TODO" picture costs 90s of GPU and proves nothing)'
  echo 'grep -qE '"'"'^[^#]*gen +[A-Za-z0-9_-]+ +"TODO'"'"' "$0" && { echo "write the TODO prompts in $0 first" >&2; exit 1; }'
  echo "# ── cover and story (TODO: one prompt per page, built from \$NOORI \$SAMI \$SALMA \$SHELL + \$STYLE) ──"
  seed=600
  for key in $(node -e "const s=require('$spec');const k=[];s.pages.forEach(p=>p.img&&!k.includes(p.img)&&k.push(p.img));k.push('back');console.log(k.join(' '))"); do
    echo "gen $key \"TODO \$NOORI …, \$STYLE\" $seed"
    seed=$((seed + 1))
  done
  echo "echo \"$slug IMAGES DONE\""
  echo
  echo '# ── REVIEW LOG (every page checked by eye on contact sheets and at full size) ──'
  echo '#   <page> <seed> · …   Redrawn: <page> (<old seeds> <why>).   Accepted drift: …'
} > "$gen"
echo "source/gen-$slug.sh — fixed characters/style/negatives + TODO gen lines (keys follow the spec's img fields; rename them with the pages)"
cat <<EOF

next:
  1. edit book/stories/$slug.json (topic block + every page's words), then
     node .claude/skills/topic-book/scripts/check-spec.js $slug
  2. write the gen lines in book/source/gen-$slug.sh (after the spec is final)
EOF
