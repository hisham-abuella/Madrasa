"""Decode every QR in every print PDF and check it opens exactly the right page.
(Adapted from bedtime-stories/tools/check-qr.py.)

A QR that renders still looks like a QR when it is clipped, wrong, or stale. The
only proof is reading it back out of the finished PDF: rasterise each page,
decode, and compare with the URL that page was built to carry (the data-qr
attribute make-print.js writes next to each code, from book.config.json).

Also checked, per code: the printed symbol (without its quiet zone) is at least
25mm wide, and the quiet zone around it (4 modules) is white.

  uvx --with zxing-cpp --with pillow --with segno python tools/check-qr.py
"""
import glob, html, json, re, subprocess, sys, tempfile
from pathlib import Path
import zxingcpp
import segno
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DPI = 200
TMP = Path(tempfile.mkdtemp(prefix='qrpages-'))
config = json.loads((ROOT / 'book.config.json').read_text())

def expected(pdf):
    """the URLs each page should carry, read from the HTML the PDF was printed from"""
    src = ROOT / 'build' / (Path(pdf).stem + '.html')
    doc = src.read_text(encoding='utf-8')
    parts = re.split(r'<section class="(?:sheet|spread)', doc)[1:]
    return [[html.unescape(u) for u in re.findall(r'data-qr="([^"]*)"', p)] for p in parts]

bad, rows, total = [], [], 0
for pdf in sorted(glob.glob(str(ROOT / 'print' / '*.pdf'))):
    name = Path(pdf).stem
    want = expected(pdf)
    for f in TMP.glob('*.png'):
        f.unlink()
    subprocess.run(['pdftoppm', '-r', str(DPI), '-png', pdf, str(TMP / 'p')], check=True, capture_output=True)
    imgs = sorted(TMP.glob('*.png'))
    if len(imgs) != len(want):
        bad.append((name, f'{len(imgs)} pages but {len(want)} sections in the HTML')); continue
    found_n = 0
    for n, (img, urls) in enumerate(zip(imgs, want), 1):
        im = Image.open(img).convert('L')
        res = [r for r in zxingcpp.read_barcodes(im) if r.format == zxingcpp.BarcodeFormat.QRCode]
        got = sorted(r.text for r in res)
        found_n += len(res)
        if got != sorted(urls):
            bad.append((name, f'p{n}: decoded {got}, expected {sorted(urls)}'))
        for r in res:
            pts = [r.position.top_left, r.position.top_right, r.position.bottom_right, r.position.bottom_left]
            xs = [p.x for p in pts]; ys = [p.y for p in pts]
            mods = segno.make(r.text, error='q').symbol_size(scale=1, border=0)[0]
            w_mm = (max(xs) - min(xs)) * mods / (mods - 1) / DPI * 25.4
            if w_mm < 25:
                bad.append((name, f'p{n}: symbol {w_mm:.1f}mm wide, under 25mm'))
            # quiet zone: a band 4 modules wide around the symbol must be white.
            # The module count is that of the code make-qr.py makes for this text.
            side = max(xs) - min(xs)
            modules = segno.make(r.text, error='q').symbol_size(scale=1, border=0)[0]
            module = side / (modules - 1)          # zxing's corners sit on module centres
            q = int(4 * module)
            box = (int(min(xs)) - q, int(min(ys)) - q, int(max(xs)) + q, int(max(ys)) + q)
            ring = im.crop(box)
            pad = int(module / 2) + 2              # the symbol's own edge, half a module out
            inner = (q - pad, q - pad, ring.width - q + pad, ring.height - q + pad)
            dark = 0
            px = ring.load()
            for y in range(ring.height):
                for x in range(ring.width):
                    if inner[0] <= x < inner[2] and inner[1] <= y < inner[3]:
                        continue
                    if px[x, y] < 128:
                        dark += 1
            if dark > 0.002 * ring.width * ring.height:
                bad.append((name, f'p{n}: quiet zone not clear ({dark} dark pixels)'))
        total += len(res)
    rows.append((name, found_n))

print(f'{len(rows)} PDFs, {total} QR codes decoded (bookUrl {config["bookUrl"]})\n')
for name, n in rows:
    print(f'  {name:48} {n}')
print()
if bad:
    print(f'{len(bad)} PROBLEM(S):')
    for n, m in bad:
        print(f'  {n}: {m}')
    sys.exit(1)
print('every QR decodes to exactly its URL, 25mm+ with a clear quiet zone')
