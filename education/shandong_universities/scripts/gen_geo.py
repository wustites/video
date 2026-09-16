#!/usr/bin/env python3
"""Generate src/shandongGeo.ts from real Shandong boundary data (DataV GeoAtlas).

Data sources (committed under data/):
  data/shandong-370000.json       province outline       (adcode 370000)
  data/shandong-370000-full.json  16 prefecture cities   (370000_full)

Steps: Douglas-Peucker simplification -> equirectangular projection with
cos(mean latitude) correction -> normalize to a 1000-unit-wide viewBox ->
place city markers on documented city-centre coordinates -> solve label
placement (8-direction candidates, no label-label / label-marker overlap).

Run:  python3 scripts/gen_geo.py
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
RAW_PROVINCE = BASE / "data" / "shandong-370000.json"
RAW_CITIES = BASE / "data" / "shandong-370000-full.json"
OUT = BASE / "src" / "shandongGeo.ts"

VB_W = 1000          # viewBox width (units)
TOL = 0.008          # Douglas-Peucker tolerance, degrees (~1.1 vb units)
MIN_RING_AREA = 12.0 # drop specks smaller than this (vb units^2)
PAD = VB_W * 0.045   # margin around the geometry inside the viewBox
LABEL_FS = 19.0      # label font size in viewBox units
LABEL_RADI = (26.0, 40.0, 54.0)

# Preferred label directions per city (8 compass, ordered best-first).
DIRS = {
    "E": (1, 0), "W": (-1, 0), "N": (0, -1), "S": (0, 1),
    "NE": (0.7071, -0.7071), "NW": (-0.7071, -0.7071),
    "SE": (0.7071, 0.7071), "SW": (-0.7071, 0.7071),
}
PREF = {
    "济南": ["W", "NW", "SW", "N"],
    "青岛": ["E", "NE", "SE"],
    "淄博": ["E", "NE", "SE", "N"],
    "枣庄": ["S", "SE", "SW"],
    "东营": ["N", "NE", "E"],
    "烟台": ["N", "E", "NE"],
    "潍坊": ["N", "E", "NE"],
    "济宁": ["S", "SE", "SW", "W"],
    "泰安": ["S", "SE", "SW"],
    "威海": ["E", "NE", "N"],
    "日照": ["S", "SE", "E"],
    "临沂": ["W", "SW", "NW", "S"],
    "德州": ["S", "SE", "SW"],
    "聊城": ["W", "NW", "SW"],
    "滨州": ["N", "NE", "NW", "E"],
    "菏泽": ["W", "SW", "NW", "S"],
}
ORDER = ["济南", "青岛", "淄博", "枣庄", "东营", "烟台", "潍坊", "济宁",
         "泰安", "威海", "日照", "临沂", "德州", "聊城", "滨州", "菏泽"]


def simplify(pts, tol):
    """Douglas-Peucker on an open ring."""
    def seg_dist(p, a, b):
        (px, py), (ax, ay), (bx, by) = p, a, b
        dx, dy = bx - ax, by - ay
        if dx == dy == 0:
            return math.hypot(px - ax, py - ay)
        t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    def dp(lo, hi):
        d, idx = -1.0, -1
        for i in range(lo + 1, hi):
            dd = seg_dist(pts[i], pts[lo], pts[hi])
            if dd > d:
                d, idx = dd, i
        if d > tol and idx != -1:
            return dp(lo, idx)[:-1] + dp(idx, hi)
        return [pts[lo], pts[hi]]

    return dp(0, len(pts) - 1)


def rings_of(geom):
    rings = []
    for poly in geom["coordinates"]:
        rings.extend(poly)  # each polygon: outer ring + holes
    return rings


def ring_area(pts):
    return 0.5 * abs(sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
                         for i in range(len(pts) - 1)))


def centroid(pts):
    a = 0.0
    cx = cy = 0.0
    for i in range(len(pts) - 1):
        x1, y1 = pts[i]
        x2, y2 = pts[i + 1]
        w = x1 * y2 - x2 * y1
        a += w
        cx += (x1 + x2) * w
        cy += (y1 + y2) * w
    if a == 0:
        return pts[0]
    return (cx / (3 * a), cy / (3 * a))


def point_in_rings(pt, rings):
    x, y = pt
    inside = False
    for ring in rings:
        n = len(ring) - 1
        j = n - 1
        for i in range(n):
            xi, yi = ring[i]
            xj, yj = ring[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                inside = not inside
            j = i
    return inside


def main():
    province = json.loads(RAW_PROVINCE.read_text())["features"][0]
    full = json.loads(RAW_CITIES.read_text())
    city_feat = {f["properties"]["name"].replace("市", ""): f for f in full["features"]}
    if set(city_feat) != set(ORDER):
        sys.exit(f"city mismatch: {set(city_feat) ^ set(ORDER)}")

    mid_lat = math.radians((province["properties"]["centroid"] or [0, 36.4])[1])
    cos_mid = math.cos(mid_lat)

    # ---- simplify all geometry in degree space ------------------------------
    prov_rings = [simplify(r, TOL) for r in rings_of(province["geometry"])]
    city_rings = {
        name: [simplify(r, TOL) for r in rings_of(f["geometry"])]
        for name, f in city_feat.items()
    }

    def proj(lon, lat):
        return (lon * cos_mid, lat)

    # ---- normalize with uniform scale ---------------------------------------
    xs = [p[0] for r in prov_rings for p in r]
    ys = [p[1] for r in prov_rings for p in r]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    s = (VB_W - 2 * PAD) / (x1 - x0)
    h = (y1 - y0) * s

    def norm(p):
        return ((p[0] - x0) * s + PAD, (y1 - p[1]) * s + PAD)

    prov_t = [[norm(p) for p in r] for r in prov_rings]
    prov_t = [r for r in prov_t if ring_area(r) >= MIN_RING_AREA]
    cities_t = {
        name: [r for r in ([norm(p) for p in ring] for ring in rings)
               if ring_area(r) >= MIN_RING_AREA]
        for name, rings in city_rings.items()
    }

    def path_of(rings):
        parts = []
        for r in rings:
            parts.append("M" + " ".join(f"{p[0]:.2f} {p[1]:.2f}" for p in r) + "Z")
        return " ".join(parts)

    province_path = path_of(prov_t)

    # ---- per-city bounding boxes (drives the map camera focus) --------------
    city_bbox = {}
    for name, rings in cities_t.items():
        if not rings:
            sys.exit(f"no geometry for {name}")
        pts = [p for r in rings for p in r]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        city_bbox[name] = (min(xs), min(ys), max(xs), max(ys))

    # ---- markers: DataV city centre, fallback to ring centroid ---------------
    markers = {}
    for name, rings in cities_t.items():
        lon, lat = city_feat[name]["properties"]["center"]
        m = norm(proj(lon, lat))
        if not rings or not point_in_rings(m, rings):
            big = max(rings, key=ring_area, default=None)
            m = centroid(big) if big else m
        markers[name] = m

    # ---- label placement (greedy, densest city first) ------------------------
    half_w = LABEL_FS + 7.0
    half_h = LABEL_FS * 0.62 + 5.0

    def box_of(cx, cy):
        return (cx - half_w, cy - half_h, cx + half_w, cy + half_h)

    def hit(b, box):
        return not (b[2] <= box[0] or b[0] >= box[2] or b[3] <= box[1] or b[1] >= box[3])

    def covers_marker(box):
        for m in markers.values():
            if box[0] <= m[0] <= box[2] and box[1] <= m[1] <= box[3]:
                return True
        return False

    def density(name):
        x, y = markers[name]
        return sum(1 for n2, m in markers.items()
                   if n2 != name and math.hypot(m[0] - x, m[1] - y) < 100)

    labels = {}
    placed = []
    for name in sorted(markers, key=lambda n: (-density(n), n)):
        x, y = markers[name]
        cands = []
        order_dirs = list(dict.fromkeys(PREF.get(name, []) +
                                       [d for d in DIRS if d not in PREF.get(name, [])]))
        for d in order_dirs:
            ux, uy = DIRS[d]
            for r in LABEL_RADI:
                cands.append((box_of(x + ux * r, y + uy * r), d, r))
        chosen = None
        best_penalty = None
        for box, d, r in cands:
            penalty = 0
            if box[0] < 2 or box[2] > VB_W - 2 or box[1] < 2 or box[3] > 1.11 * h:
                penalty += 1
            if any(hit(box, b) for b in placed) or covers_marker(box):
                penalty += 100
            score = (penalty, d not in PREF.get(name, []))
            if best_penalty is None or score < best_penalty:
                best_penalty = score
                chosen = (box, d, r)
                if penalty == 0:
                    break
        box, d, r = chosen
        placed.append(box)
        labels[name] = (x + DIRS[d][0] * r, y + DIRS[d][1] * r, d)

    # ---- assertion: no label overlaps, no label covers a marker --------------
    for a in range(len(ORDER)):
        ba = box_of(*labels[ORDER[a]][:2])
        assert not covers_marker(ba), f"label covers marker: {ORDER[a]}"
        for b in range(a + 1, len(ORDER)):
            bb = box_of(*labels[ORDER[b]][:2])
            assert not hit(ba, bb), f"label overlap: {ORDER[a]} / {ORDER[b]}"

    pair = min((math.hypot(markers[a][0] - markers[b][0], markers[a][1] - markers[b][1]),
                a, b) for i, a in enumerate(ORDER) for b in ORDER[i + 1:])
    print(f"marker min distance: {pair[0]:.1f} vb ({pair[1]} / {pair[2]})")

    for name in ORDER:
        x0, y0, x1, y1 = city_bbox[name]
        print(f"  {name}: bbox {x1 - x0:6.1f} x {y1 - y0:6.1f} vb")

    lines = [
        "// Auto-generated by scripts/gen_geo.py — DO NOT EDIT BY HAND.",
        "// Source: DataV GeoAtlas (https://geo.datav.aliyun.com/areas_v3/bound/)",
        "//   data/shandong-370000.json (province outline, adcode 370000)",
        "//   data/shandong-370000-full.json (16 prefecture cities)",
        "// Projection: equirectangular with cos(mean latitude) correction.",
        "",
        f"export const MAP_VIEWBOX_W = {VB_W};",
        f"export const MAP_VIEWBOX_H = {math.ceil(h + 2 * PAD)};",
        "",
        "export const PROVINCE_PATH =",
        f"  '{province_path}';",
        "",
        "export type GeoCity = {",
        "  name: string;",
        "  path: string;",
        "  x: number;",
        "  y: number;",
        "  lx: number;",
        "  ly: number;",
        "  /** 简化后边界的包围盒（viewBox 单位），供地图相机推导聚焦窗口 */",
        "  bbox: {x: number; y: number; w: number; h: number};",
        "};",
        "",
        "export const GEO_CITIES: GeoCity[] = [",
    ]
    for name in ORDER:
        rings = cities_t[name]
        lines.append("  {")
        lines.append(f"    name: '{name}',")
        lines.append(f"    path: '{path_of(rings)}',")
        lines.append(f"    x: {markers[name][0]:.1f},")
        lines.append(f"    y: {markers[name][1]:.1f},")
        lx, ly = labels[name][:2]
        lines.append(f"    lx: {lx:.1f},")
        lines.append(f"    ly: {ly:.1f},")
        bx0, by0, bx1, by1 = city_bbox[name]
        lines.append(
            f"    bbox: {{x: {bx0:.1f}, y: {by0:.1f}, w: {bx1 - bx0:.1f}, h: {by1 - by0:.1f}}},"
        )
        lines.append("  },")
    lines.append("];")
    OUT.write_text("\n".join(lines) + "\n")
    npts = sum(len(r) for rings in cities_t.values() for r in rings)
    print(f"province rings: {len(prov_t)}, city rings: {npts} pts, "
          f"geojson {RAW_CITIES.stat().st_size // 1024}KB -> ts {OUT.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()