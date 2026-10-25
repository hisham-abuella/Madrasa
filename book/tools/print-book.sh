#!/usr/bin/env bash
# All print PDFs for the lesson book, checked. (Adapted from bedtime-stories/tools/print-book.sh.)
#
#   bash tools/print-book.sh [slug]          # default: book.config.json -> slug
#
#   print/<slug>-lulu-interior[-DRAFT].pdf   Lulu: 8.5in square, 32 pages, 0.125in bleed, no marks
#   print/<slug>-lulu-cover[-DRAFT].pdf      Lulu: back + spine + front, one spread
#   print/<slug>-home-a5[-DRAFT].pdf         home booklet, A5, print with "Booklet" in Acrobat
#   print/<slug>-worksheets-letter[-DRAFT].pdf  the 11 exercise pages alone, US Letter
#   print/<slug>-worksheets-a4[-DRAFT].pdf      the same on A4
#
# The QR codes come from book.config.json -> bookUrl (tools/make-qr.py, rerun every
# time, so changing the URL is one edit and one command). Until urlConfirmed is
# true every file is named -DRAFT: do not upload a -DRAFT file to Lulu.
#
# Pictures: every page is drawn once at 1536px into art-hi/images-<slug>/; the print
# JPEGs in input/img-hi/ are those masters, not resized (1536px holds 300ppi up to
# 130mm, the largest box in the book), and never the 1024px web copies.
#
# Checks, and the script stops on a failure:
#   - nothing outside the safe area (print-pages.js measures it in Chrome)
#   - check-print-text.py: no words clipped, story type 14pt+
#   - check-lulu.sh: Lulu's size, bleed, spine, page count, 300-600ppi, fonts, marks
#   - check-qr.py: every QR decodes to exactly its URL, symbol 25mm+, quiet zone
set -euo pipefail
cd "$(dirname "$0")/.."
slug=${1:-$(node -e "console.log(require('./book.config.json').slug)")}
draft=$(node -e "console.log(require('./book.config.json').urlConfirmed ? '' : '-DRAFT')")
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "QR codes from book.config.json…"
uvx --with segno python tools/make-qr.py | tail -1

mkdir -p build print "input/img-hi/images-$slug"
missing=0
for key in $(node -e "const s=require('./stories/$slug.json');const k=new Set(['back']);s.pages.forEach(p=>p.img&&k.add(p.img));console.log([...k].join(' '))"); do
  master=art-hi/images-$slug/$key.png
  hi=input/img-hi/images-$slug/$key.jpg
  if [[ -f $master ]]; then
    [[ -f $hi && $hi -nt $master ]] || sips -s format jpeg -s formatOptions 90 "$master" --out "$hi" >/dev/null
  elif [[ ! -f $hi ]]; then
    echo "  no high-resolution picture for $key: $master" >&2; missing=$((missing + 1))
  fi
done
(( missing )) && { echo "draw them first: DEST=\$PWD/art-hi/images-$slug zsh source/gen-$slug.sh" >&2; exit 1; }

# remove an older set (a DRAFT set once the URL is confirmed, or the other way round)
rm -f print/"$slug"-*.pdf

fail=0
made=()
one() {   # one <stem> <format>
  local stem=$1 fmt=$2
  node tools/make-print.js "$slug" "build/$stem.html" --format "$fmt" | sed 's/^/  /'
  "$CHROME" --headless --no-pdf-header-footer --virtual-time-budget=20000 \
       --print-to-pdf="print/$stem.pdf" "file://$PWD/build/$stem.html" 2>/dev/null
  local over
  over=$("$CHROME" --headless --virtual-time-budget=20000 --dump-dom "file://$PWD/build/$stem.html" 2>/dev/null \
         | grep -o 'data-overflow="[^"]*"' | head -1)
  if [[ $over != 'data-overflow=""' ]]; then echo "  OUTSIDE THE SAFE AREA: $over" >&2; fail=1; fi
  printf '  %-48s %s\n' "print/$stem.pdf" "$(du -h "print/$stem.pdf" | cut -f1)"
  made+=("$stem")
}
one "$slug-lulu-interior$draft" lulu
one "$slug-lulu-cover$draft" cover
one "$slug-home-a5$draft" a5
one "$slug-worksheets-letter$draft" letter
one "$slug-worksheets-a4$draft" a4

echo; echo "checking words and type size…"
for stem in "${made[@]}"; do
  [[ $stem == *-cover* ]] && continue
  python3 tools/check-print-text.py "build/$stem.html" "print/$stem.pdf" || fail=1
done
echo; echo "checking Lulu's rules…"
bash tools/check-lulu.sh || fail=1
echo; echo "checking QR codes…"
uvx --with zxing-cpp --with pillow --with segno python tools/check-qr.py | tail -3 || fail=1

(( fail )) && { echo; echo "print-book: a check failed — see above." >&2; exit 1; }
echo; echo "all checks passed${draft:+ (DRAFT: the QR URL is not confirmed yet — book.config.json)}"
