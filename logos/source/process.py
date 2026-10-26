#!/usr/bin/env python3
"""Turn the chosen 1024px tries into logo files, and file the rest as tries.

  python3 logos/source/process.py c1=102 c2=203 ...

For each winner <concept>=<seed>:
  img/<concept>.png       transparent master: the white background that touches the
                          border is flood-filled away, cropped square to the emblem
  img/<concept>.webp      web copy, 640px, quality tuned to stay <= 120 KB
  img/<concept>-raw.png   the untouched 1024px render (white background)
Every other build/<concept>-<seed>.png is copied to img/tries/.
Then contact-sheet.png of ALL tries (winners marked with * in the label).
"""
import sys, shutil, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
BUILD, IMG, TRIES = ROOT / 'build', ROOT / 'img', ROOT / 'img' / 'tries'


def cut(src: Path) -> Image.Image:
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(int)
    near_white = (a.min(axis=2) > 232) & ((a.max(axis=2) - a.min(axis=2)) < 22)
    lab, _ = ndimage.label(near_white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # grow the background 1px into the anti-aliased fringe, then feather
    bg = ndimage.binary_dilation(bg, iterations=1)
    alpha = Image.fromarray(((~bg) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.9))
    rgba = im.convert('RGBA'); rgba.putalpha(alpha)
    ys, xs = np.where(~bg)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    side = int(max(x1 - x0, y1 - y0) * 1.04)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.paste(rgba.crop((cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side)), (0, 0))
    return sq.resize((1024, 1024), Image.LANCZOS)


if __name__ == '__main__':   # (guard added in round 2 so process-v2.py can import cut())
    IMG.mkdir(exist_ok=True)
    shutil.rmtree(TRIES, ignore_errors=True); TRIES.mkdir()
    win = dict(a.split('=') for a in sys.argv[1:])
    for key, seed in win.items():
        src = BUILD / f'{key}-{seed}.png'
        shutil.copy(src, IMG / f'{key}-raw.png')
        m = cut(src)
        m.save(IMG / f'{key}.png', optimize=True)
        web = m.resize((640, 640), Image.LANCZOS)
        for q in (88, 80, 72, 64, 56):
            web.save(IMG / f'{key}.webp', 'WEBP', quality=q, method=6)
            if (IMG / f'{key}.webp').stat().st_size <= 120_000:
                break
        print(f'{key}: seed {seed} -> {key}.png, {key}.webp {(IMG / f"{key}.webp").stat().st_size // 1024} KB (q{q})')

    pics = sorted(BUILD.glob('c[0-9]-[0-9]*.png'))
    for p in pics:
        k, s = p.stem.split('-')
        if win.get(k) != s:
            shutil.copy(p, TRIES / p.name)

    # contact sheet of every try; winners get a * in their label
    tmp = BUILD / 'sheet-labels'; shutil.rmtree(tmp, ignore_errors=True); tmp.mkdir()
    labelled = []
    for p in pics:
        k, s = p.stem.split('-')
        name = f'{p.stem} * chosen' if win.get(k) == s else p.stem
        q = tmp / f'{name}.png'; shutil.copy(p, q); labelled.append(str(q))
    subprocess.run([sys.executable, str(ROOT / 'source' / 'contact-sheet.py'), str(ROOT / 'contact-sheet.png'),
                    *labelled, '--cols', '4', '--tile', '300'], check=True)
    shutil.rmtree(tmp)
