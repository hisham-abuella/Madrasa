#!/usr/bin/env bash
# The "Friday-night teacher pack" (S-053): one US Letter PDF a teacher prints in one go.
#
#   bash tools/make-teacher-pack.sh [slug]     # default: book.config.json -> slug
#
#   print/<slug>-teacher-pack-letter[-DRAFT].pdf   (drafts go to print/draft/, like print-book.sh)
#     page 1        cover sheet: logo, title, what is inside, how to use it on Saturday, QR to the web book
#     pages 2..12   the 11 worksheets, copied as they are from print/<slug>-worksheets-letter.pdf
#     page 13       the answers page, from print/<slug>-home-a5.pdf, scaled to fit Letter (x1.33, centred)
#
# It only ASSEMBLES the PDFs print-book.sh already made; it never rebuilds them. print-book.sh
# calls it as its last step (the only teacher pack: make-print.js has no `pack` format); run it
# alone only to remake the pack from existing PDFs. The QR codes come from make-qr.py (book.config.json);
# the cover is HTML (tools/teacher-pack-cover.js) printed by Playwright (~/.kp-tools).
# Checks, stops on a failure: page count = 1 + worksheets + answers, every page Letter,
# fonts embedded, check-print-text.py and check-qr.py on the finished file.
set -euo pipefail
cd "$(dirname "$0")/.."
slug=${1:-$(node -e "console.log(require('./book.config.json').slug)")}
[[ -f stories/$slug.json ]] || { echo "no stories/$slug.json" >&2; exit 1; }
draft=$(node -e "console.log(require('./tools/lib').bookConfig('$slug').urlConfirmed ? '' : '-DRAFT')")
[[ -f art-hi/images-$slug/PLACEHOLDER.txt ]] && draft=-DRAFT
src=print; [[ -n $draft ]] && src=print/draft
ws=$src/$slug-worksheets-letter$draft.pdf
a5=$src/$slug-home-a5$draft.pdf
for f in "$ws" "$a5"; do [[ -f $f ]] || { echo "missing $f — run bash tools/print-book.sh $slug first" >&2; exit 1; }; done
out=$src/$slug-teacher-pack-letter$draft.pdf
cov=build/$slug-teacher-pack-cover$draft.pdf
man=build/$slug-teacher-pack-letter$draft.html     # check manifest (the name check-qr.py looks for)
mkdir -p build

echo "QR codes from book.config.json…"
uvx --with segno python tools/make-qr.py "$slug" | tail -1
echo "cover sheet…"
node tools/teacher-pack-cover.js "$slug" "$cov" "$man"
ans=$(node -e "const d=require('fs').readFileSync('build/$slug-home-a5$draft.html','utf8').split(/<section class=\"(?:sheet|spread)/).slice(1);console.log(d.findIndex(s=>/data-key=\"answers\"/.test(s))+1)")
(( ans > 0 )) || { echo "no answers page in $a5" >&2; exit 1; }

echo "assembling (worksheets as they are, answers = A5 page $ans)…"
uvx --with pypdf python - "$cov" "$ws" "$a5" "$ans" "$out" <<'PY'
import sys
from pypdf import PdfReader, PdfWriter, PageObject, Transformation
cov, ws, a5, ans, out = sys.argv[1:]
W, H = 612, 792
w = PdfWriter()
w.append(PdfReader(cov))
w.append(PdfReader(ws))
src = PdfReader(a5).pages[int(ans) - 1]
sw, sh = float(src.mediabox.width), float(src.mediabox.height)
k = min(W / sw, H / sh)
page = PageObject.create_blank_page(width=W, height=H)
page.merge_transformed_page(src, Transformation().scale(k).translate((W - sw * k) / 2, (H - sh * k) / 2))
w.add_page(page)
w.add_metadata({'/Title': 'Teacher pack', '/Creator': 'book/tools/make-teacher-pack.sh'})
with open(out, 'wb') as f:
    w.write(f)
print(f'  answers scaled x{k:.3f}')
PY

echo; echo "checking…"
fail=0
nws=$(pdfinfo "$ws" | awk '/^Pages:/{print $2}')
want=$((1 + nws + 1)); got=$(pdfinfo "$out" | awk '/^Pages:/{print $2}')
[[ $got == "$want" ]] && echo "  pages: $got = 1 cover + $nws worksheets + 1 answers" || { echo "  PAGES: $got, expected $want" >&2; fail=1; }
nl=$(pdfinfo -f 1 -l "$got" "$out" | grep -c '^Page *[0-9]* size: *612 x 792 pts' || true)
[[ $nl == "$got" ]] && echo "  every page US Letter (612 x 792 pt)" || { echo "  SIZE: only $nl of $got pages are Letter" >&2; fail=1; }
noemb=$(pdffonts "$out" | awk 'NR>2 && $(NF-4)!="yes"' | wc -l | tr -d ' ')
[[ $noemb == 0 ]] && echo "  fonts embedded ($(pdffonts "$out" | awk 'NR>2' | wc -l | tr -d ' ') font objects)" || { echo "  FONTS NOT EMBEDDED: $noemb" >&2; pdffonts "$out" >&2; fail=1; }
python3 tools/check-print-text.py "$man" "$out" | sed 's/^/  /' || fail=1
echo "  QR (check-qr.py reads this book's print PDFs)…"
qr=$(uvx --with zxing-cpp --with pillow --with segno python tools/check-qr.py "$slug" 2>&1) || true
echo "$qr" | grep -E "teacher-pack-letter|PDFs, |PROBLEM|every QR" | sed 's/^/  /'
echo "$qr" | grep -q "$slug-teacher-pack-letter$draft:" && fail=1
echo "$qr" | grep -qE "^ +$slug-teacher-pack-letter$draft +$((nws + 1))\$" || { echo "  QR: pack not read, or not $((nws + 1)) codes" >&2; fail=1; }
(( fail )) && { echo; echo "make-teacher-pack: a check failed — see above." >&2; exit 1; }
echo; echo "$out ($(du -h "$out" | cut -f1)) — all checks passed${draft:+ (DRAFT: do not hand out)}"
