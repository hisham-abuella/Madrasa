#!/usr/bin/env python3
"""Decode the flyer's QR out of the finished PDF (same tests as book/tools/check-qr.py):
exact URL, printed symbol >= 25 mm (quiet zone excluded), 4-module quiet zone white.
  uvx --with zxing-cpp --with pillow --with segno python print/flyer/check-flyer-qr.py"""
import subprocess, sys, tempfile
from pathlib import Path
import zxingcpp, segno
from PIL import Image
HERE = Path(__file__).resolve().parent
URL = 'https://hisham-abuella.github.io/Madrasa/parents.html'
DPI = 300
tmp = Path(tempfile.mkdtemp(prefix='flyerqr-'))
subprocess.run(['pdftoppm', '-r', str(DPI), '-png', '-singlefile', str(HERE / 'nawras-flyer-a5.pdf'), str(tmp / 'p')], check=True)
img = Image.open(tmp / 'p.png').convert('L')
res = zxingcpp.read_barcodes(img)
bad = []
if len(res) != 1: bad.append(f'{len(res)} codes found, expected 1')
for r in res:
    p = r.position
    xs = [p.top_left.x, p.top_right.x, p.bottom_left.x, p.bottom_right.x]
    ys = [p.top_left.y, p.top_right.y, p.bottom_left.y, p.bottom_right.y]
    w_px = max(xs) - min(xs); mm = w_px / DPI * 25.4
    n = segno.make(URL, error='q').symbol_size(scale=1, border=0)[0]
    mod = w_px / n; qz = 4 * mod
    box = (int(min(xs) - qz) + 2, int(min(ys) - qz) + 2, int(max(xs) + qz) - 2, int(max(ys) + qz) - 2)
    ring = img.crop(box); e = int(qz) - 5   # symbol edge inside the crop, minus 3 px of anti-aliasing slack
    inner = (e, e, ring.width - e, ring.height - e)
    dark = sum(1 for i, v in enumerate(ring.get_flattened_data() if hasattr(ring, 'get_flattened_data') else ring.getdata())
               if v < 128 and not (inner[0] <= i % ring.width < inner[2] and inner[1] <= i // ring.width < inner[3]))
    ok_url = r.text == URL
    print(f'decoded: {r.text}\n  exact URL: {ok_url}\n  symbol width: {mm:.1f} mm ({n} modules, {mod / DPI * 25.4:.2f} mm/module)\n  dark px in quiet zone: {dark}')
    if not ok_url: bad.append('URL mismatch')
    if mm < 25: bad.append(f'symbol {mm:.1f} mm < 25 mm')
    if dark: bad.append('quiet zone not white')
print('QR check passed' if not bad else 'QR CHECK FAILED: ' + '; '.join(bad))
sys.exit(1 if bad else 0)
