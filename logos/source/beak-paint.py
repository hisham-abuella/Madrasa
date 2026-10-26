#!/usr/bin/env python3
"""Round 2, c6: the model keeps drawing a wide duck bill on Noori's face icon whatever the prompt says.
Paint over it with a small pointed seagull beak (a narrow downward triangle, navy outline), then
img2img the result at low strength (gen-logos.sh ROUND 2) so the model redraws it in its own style.

  python3 logos/source/beak-paint.py <in.png> <out.png>
"""
import sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(int)
m = (a[..., 0] > 200) & (a[..., 1] > 120) & (a[..., 1] < 200) & (a[..., 2] < 90)   # orange
ys, xs = np.where(m)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
face = tuple(int(v) for v in a[y0 - 30, (x0 + x1) // 2])
navy = (22, 30, 74)
clear = ndimage.binary_dilation(m, iterations=11)          # the bill and its outline, not the eyes
b = np.asarray(im).copy(); b[clear] = face; im = Image.fromarray(b); d = ImageDraw.Draw(im)
cx, top = (x0 + x1) // 2, y0 + 4
w, h = (x1 - x0) * 0.46, (y1 - y0) * 0.85
tri = [(cx - w / 2, top), (cx + w / 2, top), (cx, top + h)]
d.polygon(tri, fill=(247, 148, 30), outline=navy, width=9)
im.save(dst)
print(dst, 'beak', int(w), 'x', int(h))
