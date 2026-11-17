"""Trim, resize and convert watch photos to WebP.

Reads src/content/watches.ts for id -> image pairs, writes
public/images/watches/<id>.webp (720px tall) and <id>-s.webp (360px tall).
Run: python3 scripts/images.py
"""
import re, pathlib
from PIL import Image

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'src/content/watches.ts').read_text()
pairs = re.findall(r"id: '([^']+)',[\s\S]*?image: '([^']+)'", src.split('export const PLATES')[0])
out = root / 'public/images/watches'
out.mkdir(parents=True, exist_ok=True)
for wid, fname in pairs:
    p = root / 'assets-src/watches' / fname
    im = Image.open(p).convert('RGBA')
    bbox = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    # pad to a consistent 9:14 frame so every card lines up
    w, h = im.size
    target_ratio = 9 / 14
    if w / h > target_ratio:
        nh = int(w / target_ratio); canvas = Image.new('RGBA', (w, nh), (0, 0, 0, 0)); canvas.paste(im, (0, (nh - h) // 2))
    else:
        nw = int(h * target_ratio); canvas = Image.new('RGBA', (nw, h), (0, 0, 0, 0)); canvas.paste(im, ((nw - w) // 2, 0))
    for suffix, height in (('', 720), ('-s', 360)):
        c = canvas.copy()
        c.thumbnail((10000, height), Image.LANCZOS)
        c.save(out / f'{wid}{suffix}.webp', 'WEBP', quality=86, method=6)
    print(wid, canvas.size)
