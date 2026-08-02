#!/usr/bin/env python3
"""Convert Overpass raw JSON dumps into compact GeoJSON for the Remotion composition."""
import json, sys, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "public", "data")
os.makedirs(OUT, exist_ok=True)


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


def dump(name, obj):
    path = os.path.join(OUT, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {path} ({os.path.getsize(path)} bytes)")


# ---- lines: relation -> LineString by concatenating way geometries ----
lines_raw = load("lines.json")
lines = []
# only the forward directions; reverse relations are skipped
forward_ids = {7727213, 16861881}
for rel in lines_raw["elements"]:
    if rel["type"] != "relation" or rel["id"] not in forward_ids:
        continue
    pts = []
    for m in rel["members"]:
        if m["type"] == "way":
            pts.extend((p["lon"], p["lat"]) for p in m["geometry"])
    t = rel["tags"]
    lines.append({
        "type": "Feature",
        "properties": {"ref": t.get("ref"), "name": t.get("name", ""), "colour": t.get("colour")},
        "geometry": {"type": "LineString", "coordinates": pts},
    })
dump("lines.geojson", {"type": "FeatureCollection", "features": lines})

# ---- stations ----
stations_raw = load("stations.json")
stations = []
for el in stations_raw["elements"]:
    tags = el.get("tags", {})
    if tags.get("station") != "subway":
        continue
    if "center" in el:
        lon, lat = el["center"]["lon"], el["center"]["lat"]
    elif "lat" in el:
        lat, lon = el["lat"], el["lon"]
    else:
        continue
    name = tags.get("name") or tags.get("name:es") or "?"
    line = tags.get("network") or tags.get("operator") or ""
    stations.append({
        "type": "Feature",
        "properties": {"name": name, "line": line},
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
    })
dump("stations.geojson", {"type": "FeatureCollection", "features": stations})

# ---- coastline: merge all ways into a MultiLineString ----
coast_raw = load("coastline.json")
coasts = []
for el in coast_raw["elements"]:
    if el["type"] == "way" and el.get("geometry"):
        coasts.append([(p["lon"], p["lat"]) for p in el["geometry"]])
dump("coastline.geojson", {
    "type": "FeatureCollection",
    "features": [{"type": "Feature", "properties": {}, "geometry": {"type": "MultiLineString", "coordinates": coasts}}],
})

print("done")
