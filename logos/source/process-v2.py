#!/usr/bin/env python3
"""Round 2: turn the chosen tries in build/v2/ into logo files (4 variants per concept).

  python3 logos/source/process-v2.py c1-m=1111 c1-d=1121 ...

  img/v2/hi/<concept>-<var>.png   1024px master. m/s/o: transparent (round-1 cut() from process.py:
                                  white background touching the border flood-filled away, square crop);
                                  d: kept as the full dark square (the dark field IS the design).
  img/v2/<concept>-<var>.webp     web copy, 640px, quality stepped down until <= 80 KB
  img/v2/tries/                   every other build/v2 try
  contact-sheet-v2.png            all round-2 tries, winners marked "* chosen"
"""
import sys, shutil, subprocess
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from process import cut

ROOT = Path(__file__).resolve().parent.parent
BUILD, V2 = ROOT / 'build' / 'v2', ROOT / 'img' / 'v2'
HI, TRIES = V2 / 'hi', V2 / 'tries'
HI.mkdir(parents=True, exist_ok=True)
shutil.rmtree(TRIES, ignore_errors=True); TRIES.mkdir()
win = dict(a.split('=') for a in sys.argv[1:])

for kv, seed in win.items():
    src = BUILD / f'{kv}-{seed}.png'
    m = Image.open(src).convert('RGB') if kv.endswith('-d') else cut(src)
    m.save(HI / f'{kv}.png', optimize=True)
    web = m.resize((640, 640), Image.LANCZOS); w = V2 / f'{kv}.webp'
    for q in (90, 84, 78, 70, 62, 54):
        web.save(w, 'WEBP', quality=q, method=6)
        if w.stat().st_size <= 80_000:
            break
    print(f'{kv}: seed {seed} -> {w.stat().st_size // 1024} KB (q{q})')

pics = sorted(BUILD.glob('c[0-9]-[mdso]-[0-9]*.png'))
for p in pics:
    c, v, s = p.stem.split('-')
    if win.get(f'{c}-{v}') != s:
        shutil.copy(p, TRIES / p.name)

tmp = BUILD / 'sheet-labels'; shutil.rmtree(tmp, ignore_errors=True); tmp.mkdir()
labelled = []
for p in pics:
    c, v, s = p.stem.split('-')
    name = f'{p.stem} * chosen' if win.get(f'{c}-{v}') == s else p.stem
    q = tmp / f'{name}.png'; shutil.copy(p, q); labelled.append(str(q))
subprocess.run([sys.executable, str(ROOT / 'source' / 'contact-sheet.py'), str(ROOT / 'contact-sheet-v2.png'),
                *labelled, '--cols', '9', '--tile', '240'], check=True)
shutil.rmtree(tmp)
