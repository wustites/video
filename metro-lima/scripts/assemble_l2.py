#!/usr/bin/env python3
"""Export L2 construction ways as a MultiLineString (each way drawn separately)."""
import json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "public", "data")

with open(os.path.join(DATA, "l2_under.json"), encoding="utf-8") as f:
    raw = json.load(f)

ways = []
for el in raw["elements"]:
    if el["type"] == "way" and el.get("geometry"):
        pts = [(p["lon"], p["lat"]) for p in el["geometry"]]
        if len(pts) >= 3:
            ways.append(pts)

# dedupe mirrored duplicates
def sig(pts):
    return tuple(pts[0]), tuple(pts[-1])

seen = set()
unique = []
for pts in ways:
    a, b = sig(pts)
    if (a, b) in seen or (b, a) in seen:
        continue
    seen.add((a, b))
    unique.append(pts)
print("unique ways:", len(unique), "of", len(ways))

out = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {"ref": "L2", "name": "Línea 2 (en construcción)", "colour": "#FFC300"},
        "geometry": {"type": "MultiLineString", "coordinates": unique},
    }],
}
path = os.path.join(OUT, "lines_l2_under.geojson")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print("wrote", path, os.path.getsize(path), "bytes")
