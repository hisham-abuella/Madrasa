#!/usr/bin/env python3
"""Web copies of the illustrated artwork (WebP, each <= 150 KB).

  python3 assets/art/source/make-web.py            # everything that is missing or older than its master
  python3 assets/art/source/make-web.py --force    # remake all

Masters (1536px PNG) live in assets/art/hi/ and are NEVER referenced by a page.
  hi/pic/*, hi/noori/*, hi/site/level-*, hi/site/wotd-*
        -> stickers: the white background that touches the border is flood-filled
           to transparency (logos/source/process.py method), cropped to the
           subject + a small margin, longest side 640px, transparent WebP.
  hi/story/*, hi/site/hero-*, hi/site/parents
        -> scenes: resized (story 1200 wide, heroes up to 1600), opaque WebP.
  book pictures reused for story slides 1, 2, 3, 10, 13 (REUSE below): the
        book's 1536px squares (book/art-hi/images-noori-shell) cropped to 3:2.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ART = Path(__file__).resolve().parent.parent
HI = ART / 'hi'
BOOK = ART.parent.parent / 'book' / 'art-hi' / 'images-noori-shell'
FORCE = '--force' in sys.argv
LIMIT = 150_000

# story slide -> (book picture, vertical crop centre 0..1 of the free height)
REUSE = {
    's01-cover': ('cover', .55),
    's02-salam': ('salam', .45),
    's03-friends': ('friends', .55),
    's10-nashit': ('nashit', .45),
    's13-sadiq': ('sadiq', .55),
}


def save_webp(im: Image.Image, out: Path, limit=LIMIT):
    out.parent.mkdir(parents=True, exist_ok=True)
    for q in (86, 80, 74, 68, 62, 56, 50, 44):
        im.save(out, 'WEBP', quality=q, method=6)
        if out.stat().st_size <= limit:
            break
    return q


def cut(src: Path) -> Image.Image:
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(int)
    near_white = (a.min(axis=2) > 226) & ((a.max(axis=2) - a.min(axis=2)) < 26)
    lab, _ = ndimage.label(near_white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    bg = ndimage.binary_dilation(bg, iterations=1)
    # drop specks: keep only foreground blobs bigger than 0.2% of the picture
    fg = ~bg
    flab, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, flab, range(1, n + 1))
        keep = np.isin(flab, [i + 1 for i, s in enumerate(sizes) if s > fg.size * 0.002])
        fg = keep
    alpha = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.9))
    rgba = im.convert('RGBA'); rgba.putalpha(alpha)
    ys, xs = np.where(fg)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    pad = int(max(x1 - x0, y1 - y0) * 0.03)
    box = (max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))
    return rgba.crop(box)


# Stickers sit on the same canvas shape as the SVG they replace (KS.pic people
# are 120x160, everything else 120x120), so layouts sized for the SVG still fit.
PEOPLE = {'boy', 'girl', 'teacher-m', 'teacher-f', 'student-m', 'student-f', 'mother'}
STAND = PEOPLE | {'cat', 'cat-f', 'happy', 'wave', 'think', 'cheer', 'sleep', 'palm', 'tree', 'house', 'door'}


def place(sub: Image.Image, key: str) -> Image.Image:
    W, H = (480, 640) if key in PEOPLE else (640, 640)
    m = 0.03
    sc = min(W * (1 - 2 * m) / sub.width, H * (1 - 2 * m) / sub.height)
    sub = sub.resize((max(1, round(sub.width * sc)), max(1, round(sub.height * sc))), Image.LANCZOS)
    can = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    x = (W - sub.width) // 2
    y = H - round(H * m) - sub.height if key in STAND else (H - sub.height) // 2
    can.paste(sub, (x, y), sub)
    return can


def stale(src: Path, out: Path) -> bool:
    return FORCE or not out.exists() or out.stat().st_mtime < src.stat().st_mtime


report = []
for src in sorted(HI.glob('*/*.png')):
    group, key = src.parent.name, src.stem
    if group == 'tries':
        continue
    sticker = group in ('pic', 'noori') or key.startswith(('level-', 'wotd-'))
    out = ART / group / f'{key}.webp'
    if not stale(src, out):
        continue
    if sticker:
        im = place(cut(src), key)
    else:
        im = Image.open(src).convert('RGB')
        w = 1200 if group == 'story' or key == 'parents' else (900 if im.height > im.width else 1000 if im.height == im.width else 1536)
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    q = save_webp(im, out)
    report.append(f'{group}/{key}.webp {im.width}x{im.height} {out.stat().st_size // 1024} KB q{q}{" (alpha)" if sticker else ""}')

for key, (book, yc) in REUSE.items():
    src = BOOK / f'{book}.png'
    out = ART / 'story' / f'{key}.webp'
    if not stale(src, out):
        continue
    im = Image.open(src).convert('RGB')
    h = round(im.width * 2 / 3)
    y = round((im.height - h) * yc)
    im = im.crop((0, y, im.width, y + h)).resize((1200, 800), Image.LANCZOS)
    q = save_webp(im, out)
    report.append(f'story/{key}.webp (book {book}) 1200x800 {out.stat().st_size // 1024} KB q{q}')

print('\n'.join(report) or 'nothing to do')
