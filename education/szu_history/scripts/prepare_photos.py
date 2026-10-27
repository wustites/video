"""Crop the Wikimedia Commons campus photos to 9:16 and write assets/photos/*.jpg.

Usage: python3 scripts/prepare_photos.py <dir with raw_<name>.jpg>
The raw files are the Commons originals listed in SOURCES.md (3840 px thumbnails where larger).
Each output is 1296 x 2304 (1.2x the frame) so the camera can push in without upscaling past the source.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

OUT = Path(__file__).resolve().parent.parent / "assets" / "photos"
W, H = 1296, 2304
# name: horizontal centre of the crop as a fraction of the source width
FOCUS = {"gate": .5, "wenshan": .56, "library": .58, "techbuilding": .5,
         "lihu_aerial": .46, "lihu_night": .5, "humanities": .5}

src = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
for name, fx in FOCUS.items():
    im = ImageOps.exif_transpose(Image.open(src / f"raw_{name}.jpg")).convert("RGB")
    cw = min(im.width, round(im.height * W / H))
    ch = round(cw * H / W)
    x = min(max(round(im.width * fx - cw / 2), 0), im.width - cw)
    y = (im.height - ch) // 2
    im.crop((x, y, x + cw, y + ch)).resize((W, H), Image.LANCZOS).save(OUT / f"{name}.jpg", quality=84, optimize=True)
    print(name, im.size, "->", (W, H), f"crop width {cw}px")
