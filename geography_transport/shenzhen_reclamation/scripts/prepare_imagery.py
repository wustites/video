"""Fetch Landsat scenes from Microsoft Planetary Computer and derive the map assets.

Offline-reproducible inputs for build.py: graded year images, per-period "new land" masks,
outline paths and measured areas. Needs rasterio, numpy, scipy, scikit-image, pillow and network:

    python3 -m venv /tmp/szr-venv && /tmp/szr-venv/bin/pip install rasterio scipy scikit-image pillow
    /tmp/szr-venv/bin/python scripts/prepare_imagery.py [--cache /tmp/szr-cache]

Water is classified per scene (MNDWI > 0 for TM/OLI; Otsu on NDWI for the 1979 MSS scene, which has
no SWIR band). New land in a period = open sea in the earlier scene that is land in the later one,
restricted to the Shenzhen side of the frame. Tide, turbidity and 30-60 m pixels make the areas
estimates, so the film labels them as such.
"""
import argparse, json, time, urllib.parse, urllib.request
from pathlib import Path
import numpy as np, rasterio
from rasterio.transform import from_bounds
from rasterio.warp import reproject, Resampling
from PIL import Image
from scipy import ndimage as ndi
from skimage.draw import polygon as draw_polygon
from skimage.exposure import match_histograms
from skimage.measure import approximate_polygon, find_contours

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "map"
BBOX = (113.76, 22.26, 114.04, 22.72)  # west, south, east, north; 9:16 at this latitude
W, H = 1080, 1920
PX_KM = (BBOX[2] - BBOX[0]) / W * 111.32 * np.cos(np.radians(22.49))  # ~0.0266 km per pixel
STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"
SCENES = [  # dry-season, near-cloudless, WRS path 122 row 44 (MSS: WRS-1 131/44)
    ("1979", "landsat-c2-l1", "LM03_L1TP_131044_19791106_02_T2"),
    ("1988", "landsat-c2-l2", "LT05_L2SP_122044_19881210_02_T1"),
    ("1995", "landsat-c2-l2", "LT05_L2SP_122044_19951230_02_T1"),
    ("2004", "landsat-c2-l2", "LT05_L2SP_122044_20041120_02_T1"),
    ("2013", "landsat-c2-l2", "LC08_L2SP_122044_20131129_02_T1"),
    ("2026", "landsat-c2-l2", "LC08_L2SP_122044_20260202_02_T1"),
]
# Shenzhen side of the frame: the west coast and the north shore of Shenzhen Bay (Hong Kong excluded).
SHENZHEN = [(113.76, 22.72), (114.04, 22.72), (114.04, 22.522), (114.0, 22.518), (113.965, 22.505),
            (113.94, 22.493), (113.905, 22.468), (113.875, 22.458), (113.84, 22.47), (113.76, 22.52)]
PLACES = {  # lon, lat
    "shekou": (113.913, 22.483), "houhai": (113.947, 22.516), "qianhai": (113.879, 22.530),
    "airport": (113.812, 22.638), "dachan": (113.862, 22.562), "baoan": (113.880, 22.585),
    "bay": (113.985, 22.503), "mangrove": (114.012, 22.527), "hongkong": (114.02, 22.44),
    "estuary": (113.80, 22.36),
}

def px(lon, lat):
    return ((lon - BBOX[0]) / (BBOX[2] - BBOX[0]) * W, (BBOX[3] - lat) / (BBOX[3] - BBOX[1]) * H)

_tokens = {}
def signed(href):
    account, container = href.split("//")[1].split(".")[0], href.split("/")[3]
    while (account, container) not in _tokens:
        try:
            url = f"https://planetarycomputer.microsoft.com/api/sas/v1/token/{account}/{container}"
            _tokens[account, container] = json.load(urllib.request.urlopen(url))["token"]
        except urllib.error.HTTPError:
            time.sleep(10)  # the token endpoint rate-limits bursts
    return f"{href}?{_tokens[account, container]}"

def fetch(cache, coll, item):
    path = cache / f"{item}.npz"
    if path.exists():
        return dict(np.load(path))
    meta = json.load(urllib.request.urlopen(f"{STAC}/collections/{coll}/items/{item}"))
    names = ["green", "red", "nir08"] if coll.endswith("l1") else ["blue", "green", "red", "nir08", "swir16"]
    bands = {}
    for name in names:
        dst = np.zeros((H, W), np.float32)
        with rasterio.open(signed(meta["assets"][name]["href"])) as src:
            reproject(rasterio.band(src, 1), dst, dst_transform=from_bounds(*BBOX, W, H), dst_crs="EPSG:4326",
                      resampling=Resampling.cubic, src_nodata=0, dst_nodata=0)
        bands[name] = dst
    np.savez_compressed(path, **bands)
    return bands

def otsu(v):
    hist, edges = np.histogram(v, 256); c = (edges[:-1] + edges[1:]) / 2
    w1 = np.cumsum(hist); w2 = w1[-1] - w1; m = np.cumsum(hist * c)
    return c[np.argmax(w1 * w2 * (m / np.maximum(w1, 1) - (m[-1] - m) / np.maximum(w2, 1)) ** 2)]

def colour_and_water(bands):
    if "swir16" not in bands:  # MSS: no blue band, so build a pseudo-natural colour and use NDWI
        g, r, n = bands["green"], bands["red"], bands["nir08"]
        rgb = np.stack([r, g * 0.75 + n * 0.25, g * 0.9], -1)
        index = (g - n) / np.maximum(g + n, 1e-6); water = index > otsu(index)
    else:
        f = lambda k: np.clip(bands[k] * 2.75e-5 - 0.2, 0.002, 1.5)  # Collection 2 L2 reflectance
        rgb = np.stack([f("red"), f("green"), f("blue")], -1)
        water = (f("green") - f("swir16")) / (f("green") + f("swir16")) > 0  # MNDWI
    out = np.zeros_like(rgb)
    for i in range(3):
        lo, hi = np.percentile(rgb[..., i], [0.5, 99.7]); out[..., i] = np.clip((rgb[..., i] - lo) / (hi - lo), 0, 1)
    return (out ** 0.85 * 255), water

def open_sea(water):
    w = ndi.binary_opening(water, iterations=2); lab, n = ndi.label(w)
    return lab == 1 + np.argmax(ndi.sum(w, lab, range(1, n + 1)))

def clean(mask):
    mask = ndi.binary_opening(mask, iterations=3); lab, n = ndi.label(mask)
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    return np.isin(lab, 1 + np.where(sizes >= 150)[0])

def outline(mask, region=None, min_len=40):
    soft = ndi.gaussian_filter(mask.astype(float), 1.2); parts = []
    for c in find_contours(soft, 0.5):
        c = approximate_polygon(c, 1.0)
        runs, run = [], []
        for y, x in c:  # split where the line leaves the Shenzhen side
            if region is None or region[int(min(y, H - 1)), int(min(x, W - 1))]:
                run.append((x, y))
            elif run:
                runs.append(run); run = []
        runs.append(run)
        for r in runs:
            if len(r) > 2 and sum(np.hypot(*np.subtract(r[i + 1], r[i])) for i in range(len(r) - 1)) >= min_len:
                parts.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in r))
    return "".join(parts)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--cache", type=Path, default=Path("/tmp/szr-cache"))
    args = ap.parse_args(); args.cache.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
    region = np.zeros((H, W), bool)
    xs, ys = zip(*(px(*p) for p in SHENZHEN)); rr, cc = draw_polygon(np.array(ys), np.array(xs), (H, W)); region[rr, cc] = True
    years = [y for y, _, _ in SCENES]; imgs, sea, land = {}, {}, {}
    for year, coll, item in SCENES:
        imgs[year], water = colour_and_water(fetch(args.cache, coll, item))
        sea[year] = open_sea(water); land[year] = ndi.binary_fill_holes(~sea[year])
    ref = imgs["2026"]
    for year in years:  # pull every year towards the 2026 palette so cuts read as time, not as a colour shift
        im = imgs[year]
        if year != "2026":
            matched = match_histograms(im, ref, channel_axis=-1)
            im = matched if year != "1979" else matched.mean(-1, keepdims=True) * 0.8 + matched * 0.2
            if year != "1979":
                im = 0.75 * matched + 0.25 * imgs[year]
        Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(OUT / f"y{year}.jpg", quality=88)
    stats, edges = {}, {}
    for a, b in zip(years, years[1:]):
        new = clean(sea[a] & land[b] & region)
        alpha = (ndi.gaussian_filter(new.astype(float), 0.7) * 255).astype(np.uint8)
        Image.merge("LA", (Image.new("L", (W, H), 255), Image.fromarray(alpha))).save(OUT / f"new-{b}.png", optimize=True)
        stats[b] = round(float(new.sum() * PX_KM ** 2), 1); edges[b] = outline(new)
    total = clean(sea["1979"] & land["2026"] & region)
    reach = ndi.distance_transform_edt(~land["1979"]) * PX_KM
    coast = outline(land["1979"], ndi.binary_dilation(region, iterations=25), min_len=60)
    places = {k: [round(v, 1) for v in px(*ll)] for k, ll in PLACES.items()}
    data = {"bbox": BBOX, "size": [W, H], "kmPerPx": round(float(PX_KM), 5), "scenes": {y: i for y, _, i in SCENES},
            "newKm2": stats, "totalKm2": round(float(total.sum() * PX_KM ** 2), 1),
            "maxReachKm": round(float(reach[total].max()), 2), "places": places, "coast1979": coast, "newEdges": edges}
    (OUT / "map.json").write_text(json.dumps(data, ensure_ascii=False))
    print(json.dumps({k: v for k, v in data.items() if k not in ("coast1979", "newEdges")}, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
