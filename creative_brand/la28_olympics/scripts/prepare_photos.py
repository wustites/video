"""Crop the Wikimedia Commons photos and write assets/photos/*.jpg.

Usage: python3 scripts/prepare_photos.py <dir with raw_<name>.jpg>
The raw files are the Commons originals listed in SOURCES.md (3000 px thumbnails where larger).
Full-frame photos are 1296 x 2304 (1.2x the frame) so the camera can push in; the two archive
photos of scene 1 share the frame as halves, 1188 x 1056 each (1.1x a 1080 x 960 half).
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

OUT = Path(__file__).resolve().parent.parent / "assets" / "photos"
FULL, HALF = (1296, 2304), (1188, 1056)
# name: (output size, horizontal centre of the crop as a fraction of the source width)
CROPS = {"gate": (FULL, .5), "games1932": (HALF, .5), "games1984": (HALF, .38), "aerial": (FULL, .55),
         "sofi": (FULL, .5), "venice": (FULL, .62), "downtown": (FULL, .5), "peristyle": (FULL, .5)}

src = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
for name, ((W, H), fx) in CROPS.items():
    im = ImageOps.exif_transpose(Image.open(src / f"raw_{name}.jpg")).convert("RGB")
    cw = min(im.width, round(im.height * W / H))
    ch = round(cw * H / W)
    x = min(max(round(im.width * fx - cw / 2), 0), im.width - cw)
    y = (im.height - ch) // 2
    im.crop((x, y, x + cw, y + ch)).resize((W, H), Image.LANCZOS).save(OUT / f"{name}.jpg", quality=84, optimize=True)
    print(name, im.size, "->", (W, H), f"crop width {cw}px")
