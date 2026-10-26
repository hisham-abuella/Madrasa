#!/usr/bin/env python3
"""Regenerate the book's printed QR codes from book.config.json -> bookUrl.
(Adapted from bedtime-stories/tools/make-qr.py.)

  uvx --with segno python tools/make-qr.py [slug]     # default: book.config.json -> slug

  <qrDir>/qr-book.svg           the web book (back cover, "about this book" page)
  <qrDir>/qr-<page-key>.svg     one per exercise page: the web book opened at that
                                page's writing pad, bookUrl#<page-key>

segno writes width/height but no viewBox, and without one the symbol renders at
its natural size and the page clips it into something that will not scan, so
every code gets a viewBox injected. Error correction Q, a 4-module quiet zone
(segno's border is in modules; the print layout adds white around it too).

qrDir is input/qr for noori-shell and input/qr/<slug> for every other book, and
the URL comes from book.config.json (books.<slug> or urlPattern): tools/lib.js
bookConfig() is the one place that rule lives, so it is asked here through node.
"""
import json, re, subprocess, sys
from pathlib import Path
import segno

ROOT = Path(__file__).resolve().parent.parent
slug = sys.argv[1] if len(sys.argv) > 1 else json.loads((ROOT / 'book.config.json').read_text())['slug']
config = json.loads(subprocess.run(['node', '-e', f"console.log(JSON.stringify(require('./tools/lib').bookConfig({json.dumps(slug)})))"],
                                   cwd=ROOT, capture_output=True, text=True, check=True).stdout)
spec = json.loads((ROOT / 'stories' / f"{slug}.json").read_text())
BASE = config['bookUrl']
OUT = ROOT / config['qrDir']
OUT.mkdir(parents=True, exist_ok=True)

CODES = {'qr-book': BASE}
for p in spec['pages']:
    if isinstance(p.get('exercise'), int):
        CODES[f"qr-{p['key']}"] = f"{BASE}#{p['key']}"

for old in OUT.glob('qr-*.svg'):
    old.unlink()
for name, url in CODES.items():
    q = segno.make(url, error='q')
    svg = q.svg_inline(scale=10, border=4, dark='#111010', light='#FFFFFF')
    size = q.symbol_size(scale=10, border=4)[0]
    svg = re.sub(r'<svg ', f'<svg viewBox="0 0 {size} {size}" preserveAspectRatio="xMidYMid meet" ', svg, count=1)
    (OUT / f'{name}.svg').write_text(svg)
    print(f'  {name:16} {url}')
(OUT / 'codes.json').write_text(json.dumps(CODES, indent=1, ensure_ascii=False) + '\n')
print(f'{len(CODES)} codes written to {OUT} (urlConfirmed={config.get("urlConfirmed")})')
