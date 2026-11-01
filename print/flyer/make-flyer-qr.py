#!/usr/bin/env python3
"""QR for the A5 flyer -> qr-parents.svg (same settings as book/tools/make-qr.py:
segno, error Q, 4-module quiet zone, dark #111010 on white, viewBox injected).
  uvx --with segno python print/flyer/make-flyer-qr.py"""
import re, sys
from pathlib import Path
import segno
URL = 'https://hisham-abuella.github.io/Madrasa/parents.html'
q = segno.make(URL, error='q')
svg = q.svg_inline(scale=10, border=4, dark='#111010', light='#FFFFFF')
size = q.symbol_size(scale=10, border=4)[0]
svg = re.sub(r'<svg ', f'<svg viewBox="0 0 {size} {size}" preserveAspectRatio="xMidYMid meet" ', svg, count=1)
out = Path(__file__).resolve().parent / 'qr-parents.svg'
out.write_text(svg)
print(f'version {q.version} {q.error}, {q.symbol_size(scale=1, border=0)[0]} modules, -> {out.name}  {URL}')
