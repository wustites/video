"""Build the HyperFrames composition from the narration timing and the measured map data.

Inputs: public/voiceover/{narration.zh.txt, segment-durations.json, word-marks.json} from
`npm run voiceover`, and assets/map/map.json from scripts/prepare_imagery.py.
Writes index.html, compositions/scene-*.html, compositions/captions.html and the SRT.
Every reveal is keyed to the Edge TTS WordBoundary of the word that names it.
"""
import html
import json
import re
from pathlib import Path

P = Path(__file__).resolve().parent
VO = P / "public" / "voiceover"
paras = [p.strip() for p in (VO / "narration.zh.txt").read_text(encoding="utf-8").split("\n\n") if p.strip()]
durs = json.loads((VO / "segment-durations.json").read_text())
marks = json.loads((VO / "word-marks.json").read_text())
M = json.loads((P / "assets" / "map" / "map.json").read_text())
TAIL = 1.6  # hold on the last frame after the narration ends
starts = [sum(durs[:i]) for i in range(len(durs))]
slots = [d + (TAIL if i == len(durs) - 1 else 0) for i, d in enumerate(durs)]
TOTAL = round(sum(slots), 3)
W, H = 1080, 1920
ORANGE, SAND, INK = "#ff6b2c", "#e9c27a", "#f4f1ea"
PLACE = M["places"]
NANTOU = [636.4, 855.7]


def at(scene, word, nth=0):
    """Seconds from the scene start at which the narration says `word`."""
    hits = [m["start"] for m in marks[scene] if m["text"] == word]
    if len(hits) <= nth:
        raise SystemExit(f"scene {scene}: no word mark '{word}' (#{nth})")
    return hits[nth]


def cam(cx, cy, z):
    """Camera that puts map pixel (cx, cy) at the frame centre, clamped so the image always fills the frame."""
    cx = min(max(cx, W / 2 / z), W - W / 2 / z)
    cy = min(max(cy, H / 2 / z), H - H / 2 / z)
    return {"x": round(W / 2 - cx * z, 1), "y": round(H / 2 - cy * z, 1), "scale": z}


FULL = cam(540, 960, 1)
# Each scene: its imagery, what is already on the map, what it reveals and where the camera goes.
# `cams` are (time, camera) keyframes; a scene starts where the previous one ended.
SCENES = [
    dict(year="2026", fromYear=None, img=["2026"], title="向海要来的地", date="Landsat 8 · 2026-02-02",
         base=[], fresh=["1988", "1995", "2004", "2013", "2026"], freshAt=None, coastAt=at(0, "白色"),
         cams=[(0, FULL), (8.6, cam(560, 900, 1.08))],
         labels=[("estuary", "珠江口", at(0, "海岸"), "sea"), ("hongkong", "香港", at(0, "海岸"), "sea")],
         stat=None),
    dict(year="1979", fromYear="2026", img=["2026", "1979"], swapAt=at(1, "一九七九年"), title="蛇口 · 起点",
         date="Landsat 3 · 1979-11-06", base=[], fresh=[], fadeOut=["1988", "1995", "2004", "2013", "2026"],
         cams=[(0.3, cam(600, 940, 1.6))],
         labels=[("shekou", "蛇口", at(1, "蛇口")), (NANTOU, "南头半岛", at(1, "南头"))], stat=None),
    dict(year="1995", fromYear="1979", img=["1979", "1995"], swapAt=at(2, "一九九五年"), title="两岸一起向海",
         date="Landsat 5 · 1995-12-30", base=[], fresh=["1988", "1995"], freshAt=at(2, "西岸"),
         cams=[(0.2, cam(470, 790, 1.25))],
         labels=[("baoan", "宝安", at(2, "宝安")), ("houhai", "后海", at(2, "后海"))],
         stat=("1979—1995", M["newKm2"]["1988"] + M["newKm2"]["1995"], at(2, "推进"))),
    dict(year="2004", fromYear="1995", img=["1995", "2004"], swapAt=at(3, "二零零四年"), title="高楼站在海面上",
         date="Landsat 5 · 2004-11-20", base=["1988", "1995"], fresh=["2004"], freshAt=at(3, "后海"),
         cams=[(0.2, cam(720, 860, 1.7))],
         labels=[("houhai", "后海", at(3, "后海")), ("bay", "深圳湾", at(3, "深圳湾"), "sea")],
         stat=("1995—2004", M["newKm2"]["2004"], at(3, "如今"))),
    dict(year="2013", fromYear="2004", img=["2004", "2013"], swapAt=at(4, "二零一三"), title="新增最多的九年",
         date="Landsat 8 · 2013-11-29", base=["1988", "1995", "2004"], fresh=["2013"], freshAt=at(4, "新增"),
         cams=[(0.3, cam(420, 700, 1.3))],
         labels=[("airport", "宝安机场", at(4, "机场"), "below"), ("qianhai", "前海", at(4, "前海")),
                 ("dachan", "大铲湾", at(4, "大铲湾"))],
         stat=("2004—2013", M["newKm2"]["2013"], at(4, "最多"))),
    dict(year="2026", fromYear="2013", img=["2013", "2026"], swapAt=at(5, "此后"), title="放缓，但没有停下",
         date="Landsat 8 · 2026-02-02", base=["1988", "1995", "2004", "2013"], fresh=["2026"], freshAt=at(5, "围"),
         cams=[(0.6, cam(560, 900, 1.12)), (at(5, "深圳湾") - 0.3, cam(800, 860, 1.7))],
         labels=[("bay", "深圳湾", at(5, "深圳湾"), "sea"), ("mangrove", "福田红树林", at(5, "红树林"))],
         stat=("2013—2026", M["newKm2"]["2026"], at(5, "放缓")),
         policy=("2018", "全面停止新增围填海审批", "国家重大战略项目除外", at(5, "二零一八"))),
    dict(year="2026", fromYear=None, img=["2026"], title="1979—2026", date="本画面 · Landsat 影像水体对比估算",
         base=["1988", "1995", "2004", "2013", "2026"], fresh=[], promoteAt=at(6, "八十"),
         cams=[(0.1, FULL)], labels=[], stat=None, total=at(6, "八十")),
]

FONT = "'Noto Sans SC', sans-serif"
FONT_FILES = {400: "Regular", 700: "Bold"}  # system Noto Sans CJK, subset to the characters this film uses
FONT_FACE = "".join(
    f"@font-face{{font-family:'Noto Sans SC';src:url('assets/fonts/noto-sans-sc-{w}.woff2') format('woff2');"
    f"font-weight:{'100 500' if w == 400 else '600 900'};font-display:block}}" for w in FONT_FILES)
CSS = FONT_FACE + f"""
#root{{position:absolute;inset:0;overflow:hidden;background:#0b1416;font-family:{FONT};color:{INK}}}
.cam{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;transform-origin:0 0}}
.sat{{position:absolute;left:0;top:0;width:{W}px;height:{H}px}}
.land{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;-webkit-mask-size:{W}px {H}px;mask-size:{W}px {H}px}}
.land.sand{{background:{SAND};opacity:.42}}
.land.new{{background:{ORANGE};opacity:.66}}
.lines{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;overflow:visible}}
.coast{{fill:none;stroke:#fff;stroke-width:3;stroke-dasharray:10 7;vector-effect:non-scaling-stroke;opacity:.92}}
.edge{{fill:none;stroke:{ORANGE};stroke-width:3;stroke-linejoin:round;vector-effect:non-scaling-stroke}}
.place{{position:absolute;width:0;height:0}}
.place i{{position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:50%;background:{INK};box-shadow:0 0 0 3px rgba(11,20,22,.7)}}
.place span{{position:absolute;left:18px;top:-24px;white-space:nowrap;font-weight:700;font-size:36px;line-height:48px;
  color:{INK};text-shadow:0 2px 3px rgba(0,0,0,.85),0 0 1px #000}}
.place.below span{{left:-20px;top:48px}}
.place.sea i{{display:none}}
.place.sea span{{left:-60px;font-weight:500;letter-spacing:6px;color:#dfe9ea}}
.scrim{{position:absolute;left:0;top:0;width:{W}px;height:640px;
  background:linear-gradient(180deg,rgba(9,16,18,.86) 0%,rgba(9,16,18,.62) 48%,rgba(9,16,18,0) 100%)}}
.head{{position:absolute;left:72px;top:176px;right:72px}}
.year{{font-weight:900;font-size:176px;line-height:1;letter-spacing:-5px;font-variant-numeric:tabular-nums}}
.title{{font-weight:700;font-size:58px;line-height:1.25;margin-top:18px}}
.date{{font-weight:500;font-size:28px;line-height:1.4;margin-top:14px;color:#c9d6d6;letter-spacing:1px}}
.stat{{position:absolute;right:72px;top:206px;text-align:right}}
.stat b{{display:block;font-weight:900;font-size:76px;line-height:1;color:{ORANGE};font-variant-numeric:tabular-nums}}
.stat small{{display:block;font-weight:500;font-size:30px;line-height:1.5;margin-top:10px;color:#dfe9ea}}
.policy{{position:absolute;left:72px;right:72px;top:540px;padding:26px 30px;background:rgba(9,16,18,.8);border-left:6px solid {ORANGE}}}
.policy b{{display:block;font-weight:700;font-size:42px;line-height:1.35}}
.policy small{{display:block;font-weight:500;font-size:30px;line-height:1.5;color:#c9d6d6;margin-top:6px}}
.total{{position:absolute;left:72px;right:72px;top:420px}}
.total b{{display:block;font-weight:900;font-size:200px;line-height:1;letter-spacing:-6px;color:{ORANGE};font-variant-numeric:tabular-nums}}
.total b em{{font-style:normal;font-size:84px;letter-spacing:0;margin-left:14px}}
.total small{{display:block;font-weight:700;font-size:44px;line-height:1.4;margin-top:16px}}
.total p{{margin:12px 0 0;font-weight:500;font-size:30px;line-height:1.5;color:#dfe9ea}}
.legend{{position:absolute;left:72px;top:1340px;display:flex;gap:30px;font-size:24px;line-height:1.3;color:#dfe9ea;
  text-shadow:0 1px 2px #000}}
.legend span{{display:flex;align-items:center;gap:10px}}
.legend i{{display:inline-block;width:34px;height:0;border-top:3px dashed #fff}}
.legend i.o{{height:18px;border:0;background:{ORANGE};opacity:.85}}
.legend i.s{{height:18px;border:0;background:{SAND};opacity:.8}}
.credit{{position:absolute;left:72px;top:1384px;font-size:22px;line-height:1.3;color:#c9d6d6;text-shadow:0 1px 2px #000}}
"""


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


def place_xy(key):
    return key if isinstance(key, list) else PLACE[key]


def scene_html(i, s):
    sid = f"scene-{i}"
    d = slots[i]
    tl = []  # GSAP lines, scene-local seconds
    prev_cam = FULL if i == 0 else SCENES[i - 1]["cams"][-1][1]
    tl.append(f"tl.set('#{sid}-cam',{json.dumps(prev_cam)},0);")
    t_cur = 0
    for t, c in s["cams"]:
        dur = 2.0 if i == 0 else 1.8
        if i == 0:
            dur = t  # a slow push across the whole opening shot
            t = 0
        tl.append(f"tl.to('#{sid}-cam',{{...{json.dumps(c)},duration:{dur},ease:'{'none' if i == 0 else 'power2.inOut'}'}},{r(t)});")
        t_cur = t + dur

    imgs = []
    for k, y in enumerate(s["img"]):
        imgs.append(f'<img id="{sid}-img-{y}" class="sat" src="assets/map/y{y}.jpg" alt="Landsat {y}">')
    if len(s["img"]) == 2:
        new = s["img"][1]
        tl.append(f"tl.fromTo('#{sid}-img-{new}',{{opacity:0}},{{opacity:1,duration:.7,ease:'none'}},{r(s['swapAt'])});")

    layers = []
    for y in s["base"]:
        layers.append(f'<div id="{sid}-sand-{y}" class="land sand" style="-webkit-mask-image:url(assets/map/new-{y}.png);mask-image:url(assets/map/new-{y}.png)"></div>')
    for y in s.get("fadeOut", []):
        layers.append(f'<div id="{sid}-old-{y}" class="land new" style="-webkit-mask-image:url(assets/map/new-{y}.png);mask-image:url(assets/map/new-{y}.png)"></div>')
        tl.append(f"tl.to('#{sid}-old-{y}',{{opacity:0,duration:.6,ease:'power1.in'}},{r(s['swapAt'])});")
    edges = []
    for y in s["fresh"]:
        layers.append(f'<div id="{sid}-new-{y}" class="land new" style="-webkit-mask-image:url(assets/map/new-{y}.png);mask-image:url(assets/map/new-{y}.png)"></div>')
        if s.get("freshAt") is not None:
            t = s["freshAt"]
            edges.append(f'<path id="{sid}-edge-{y}" class="edge" pathLength="100" stroke-dasharray="100 120" d="{M["newEdges"][y]}"/>')
            tl.append(f"tl.fromTo('#{sid}-edge-{y}',{{strokeDashoffset:110}},{{strokeDashoffset:0,duration:1.1,ease:'power2.out'}},{r(t)});")
            tl.append(f"tl.fromTo('#{sid}-new-{y}',{{opacity:0}},{{opacity:.66,duration:.5,ease:'power1.out'}},{r(t + .45)});")
            tl.append(f"tl.to('#{sid}-edge-{y}',{{opacity:0,duration:.6,ease:'power1.in'}},{r(t + 1.8)});")
    if s.get("promoteAt") is not None:  # the payoff: every period's land turns back to the new-land colour
        for k, y in enumerate(s["base"]):
            layers.append(f'<div id="{sid}-hot-{y}" class="land new" style="-webkit-mask-image:url(assets/map/new-{y}.png);mask-image:url(assets/map/new-{y}.png)"></div>')
            tl.append(f"tl.fromTo('#{sid}-hot-{y}',{{opacity:0}},{{opacity:.66,duration:.35,ease:'power1.out'}},{r(s['promoteAt'] - 1.2 + k * .22)});")

    coast_style = ' pathLength="100" stroke-dasharray="100 120" style="opacity:0"' if s.get("coastAt") is not None else ""
    coast_id = f"{sid}-coast"
    if s.get("coastAt") is not None:
        # draw the 1979 line as a solid stroke, then switch to the dash once it has landed
        tl.append(f"tl.fromTo('#{coast_id}',{{opacity:0}},{{opacity:.92,duration:.25,ease:'none'}},{r(s['coastAt'])});")
        tl.append(f"tl.fromTo('#{coast_id}',{{strokeDashoffset:110}},{{strokeDashoffset:0,duration:1.2,ease:'power2.inOut'}},{r(s['coastAt'])});")
        tl.append(f"tl.set('#{coast_id}',{{attr:{{'stroke-dasharray':'10 7'}},strokeDasharray:'10 7',strokeDashoffset:0}},{r(s['coastAt'] + 1.25)});")
    lines = f'<svg class="lines" viewBox="0 0 {W} {H}" data-layout-ignore><path id="{coast_id}" class="coast"{coast_style} d="{M["coast1979"]}"/>{"".join(edges)}</svg>'

    z = s["cams"][-1][1]["scale"]
    places = []
    for k, lab in enumerate(s["labels"]):
        key, name, t = lab[:3]
        kind = lab[3] if len(lab) > 3 else ""
        x, y = place_xy(key)
        pid = f"{sid}-p{k}"
        places.append(f'<div id="{pid}" class="place {kind}" style="left:{x}px;top:{y}px;scale:{1 / z:.3f};transform-origin:0 0"><div id="{pid}-in"><i></i><span>{esc(name)}</span></div></div>')
        tl.append(f"tl.fromTo('#{pid}-in',{{opacity:0,y:10}},{{opacity:1,y:0,duration:.35,ease:'power3.out'}},{r(max(t, .05))});")

    head = [f'<div class="scrim"></div><div class="head" id="{sid}-head"><div class="year" id="{sid}-year">{s["fromYear"] or s["year"]}</div>'
            f'<div class="title" id="{sid}-title">{esc(s["title"])}</div><div class="date" id="{sid}-date">{esc(s["date"])}</div></div>']
    if s["fromYear"]:
        t = s["swapAt"]
        tl.append(f"const y{i}={{v:{s['fromYear']}}};tl.to(y{i},{{v:{s['year']},duration:.9,ease:'power1.out',onUpdate:()=>{{document.querySelector('#{sid}-year').textContent=Math.round(y{i}.v)}}}},{r(t)});")
        tl.append(f"tl.fromTo('#{sid}-title',{{opacity:0,x:-24}},{{opacity:1,x:0,duration:.45,ease:'power3.out'}},{r(t + .5)});")
        tl.append(f"tl.fromTo('#{sid}-date',{{opacity:0}},{{opacity:1,duration:.4,ease:'none'}},{r(t + .7)});")
        head[0] = head[0].replace(f'id="{sid}-title"', f'id="{sid}-title" style="opacity:0"').replace(f'id="{sid}-date"', f'id="{sid}-date" style="opacity:0"')
    if s.get("stat"):
        period, km2, t = s["stat"]
        head.append(f'<div class="stat" id="{sid}-stat"><b>+{km2:.1f} km²</b><small>{period} 西海岸围填海</small></div>')
        tl.append(f"tl.fromTo('#{sid}-stat',{{opacity:0,y:-14}},{{opacity:1,y:0,duration:.4,ease:'power3.out'}},{r(t)});")
    if s.get("policy"):
        yr, a, b, t = s["policy"]
        head.append(f'<div class="policy" id="{sid}-policy"><b>{yr} 起 · {esc(a)}</b><small>{esc(b)}</small></div>')
        tl.append(f"tl.fromTo('#{sid}-policy',{{opacity:0,x:-30}},{{opacity:1,x:0,duration:.45,ease:'power3.out'}},{r(t)});")
        tl.append(f"tl.to('#{sid}-policy',{{opacity:0,duration:.4,ease:'power1.in'}},{r(at(5, '深圳湾') - .5)});")
    if s.get("total") is not None:
        t = s["total"]
        head = [f'<div class="scrim" style="height:900px"></div><div class="total" id="{sid}-total"><b><span id="{sid}-num">0</span><em>km²</em></b>'
                f'<small>1979—2026 · 深圳西海岸围填海</small><p id="{sid}-reach">海岸线最远向海推进约 {M["maxReachKm"]:.1f} 公里 · Landsat 影像估算</p></div>']
        tl.append(f"tl.fromTo('#{sid}-total',{{opacity:0}},{{opacity:1,duration:.4,ease:'none'}},{r(t - 1.4)});")
        tl.append(f"const n{i}={{v:0}};tl.to(n{i},{{v:{M['totalKm2']},duration:1.4,ease:'power2.out',onUpdate:()=>{{document.querySelector('#{sid}-num').textContent=Math.round(n{i}.v)}}}},{r(t - 1.4)});")
        tl.append(f"tl.fromTo('#{sid}-reach',{{opacity:0}},{{opacity:1,duration:.4,ease:'none'}},{r(t + .8)});")

    legend = (f'<div class="legend" data-layout-ignore><span><i></i>1979 年海岸线</span><span><i class="o"></i>本阶段新增</span>'
              f'{"<span><i class=s></i>此前新增</span>" if s["base"] and s.get("promoteAt") is None else ""}</div>'
              f'<div class="credit" data-layout-ignore>影像 USGS/NASA Landsat · Microsoft Planetary Computer</div>')
    if i == 1:
        legend = '<div class="legend" data-layout-ignore><span><i></i>1979 年海岸线</span></div><div class="credit" data-layout-ignore>影像 USGS/NASA Landsat · Microsoft Planetary Computer</div>'

    body = (f'<div id="{sid}-cam" class="cam">{"".join(imgs)}{"".join(layers)}{lines}{"".join(places)}</div>'
            f'{"".join(head)}{legend}')
    return f"""<template>
<style>{CSS}</style>
<div id="root" data-composition-id="{sid}" data-width="{W}" data-height="{H}" data-start="0" data-duration="{r(d)}">
{body}
</div>
<script>
const tl=gsap.timeline({{paused:true}});
{chr(10).join(tl)}
window.__timelines["{sid}"]=tl;
</script>
</template>
"""


# Captions: phrases split at punctuation, timed by the WordBoundary of their first character.
norm = lambda s: "".join(c for c in s if c.isalnum())


def caption_groups():
    groups = []
    for i, para in enumerate(paras):
        clean = norm(para)
        pos, cursor = [], 0
        for m in marks[i]:
            q = norm(m["text"]); p = clean.find(q, cursor)
            if p >= 0:
                pos.append((p, m["start"])); cursor = p + len(q)
        phrases = [x for x in re.split(r"[，。；：、“”！？]", para) if x]
        cursor, timed = 0, []
        for ph in phrases:
            q = norm(ph); p = clean.find(q, cursor); cursor = p + len(q)
            t = next(tm for wp, tm in pos if wp >= p)
            timed.append((starts[i] + t, ph))
        for k, (t, ph) in enumerate(timed):
            end = timed[k + 1][0] if k + 1 < len(timed) else starts[i] + durs[i] - 0.05
            groups.append((max(t - 0.05, 0.12), end, ph))
    return groups


def stamp(v):
    ms = round(v * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def build_poster():
    """Single-frame release cover (npm run render:still): today's coast, every reclaimed patch, the total."""
    years = ["1988", "1995", "2004", "2013", "2026"]
    lands = "".join(f'<div class="land new" style="-webkit-mask-image:url(../assets/map/new-{y}.png);mask-image:url(../assets/map/new-{y}.png)"></div>' for y in years)
    css = CSS.replace("url('assets/", "url('../assets/")
    (P / "poster").mkdir(exist_ok=True)
    (P / "poster" / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>深圳填海造陆发展史 · 封面</title>
<script src="../assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}{css}
.cover-cam{{transform:translate(-48px,-60px) scale(1.09);transform-origin:0 0}}
.kicker{{position:absolute;left:72px;top:190px;font-weight:700;font-size:40px;letter-spacing:8px;color:#dfe9ea}}
.big{{position:absolute;left:66px;top:250px;font-weight:900;font-size:132px;line-height:1.12;letter-spacing:-2px}}
.num{{position:absolute;left:72px;top:582px;font-weight:900;font-size:180px;line-height:1;letter-spacing:-6px;color:{ORANGE}}}
.num em{{font-style:normal;font-size:76px;letter-spacing:0;margin-left:12px}}
.sub{{position:absolute;left:72px;top:782px;font-weight:700;font-size:42px;line-height:1.4}}
.note{{position:absolute;left:72px;top:846px;font-weight:500;font-size:30px;line-height:1.5;color:#dfe9ea}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="shenzhen-reclamation-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="cam cover-cam"><img class="sat" src="../assets/map/y2026.jpg" alt="Landsat 2026">{lands}
<svg class="lines" viewBox="0 0 {W} {H}" data-layout-ignore><path class="coast" d="{M["coast1979"]}"/></svg></div>
<div class="scrim" style="height:1060px"></div>
<div class="kicker">深圳 · 1979—2026</div>
<div class="big">向海要来<br>的地</div>
<div class="num">{round(M["totalKm2"])}<em>km²</em></div>
<div class="sub">六张卫星图，看西海岸怎样长进大海</div>
<div class="note">Landsat 影像估算 · 白色虚线为 1979 年海岸线</div>
<div class="credit" data-layout-ignore>影像 USGS/NASA Landsat · Microsoft Planetary Computer</div>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["shenzhen-reclamation-poster"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")


def subset_fonts():
    """Subset the system Noto Sans CJK SC (OFL) to every character in the built compositions.

    Without fontTools or the system font (e.g. on the release runner) the committed subsets are kept;
    rerun locally after adding new characters to the copy.
    """
    try:
        from fontTools import subset
        from fontTools.ttLib import TTCollection
    except ImportError:
        print("fontTools not installed; keeping assets/fonts as committed"); return
    if not all(Path(f"/usr/share/fonts/opentype/noto/NotoSansCJK-{s}.ttc").exists() for s in FONT_FILES.values()):
        print("Noto Sans CJK not installed; keeping assets/fonts as committed"); return
    text = "".join(f.read_text(encoding="utf-8") for f in [*(P / "compositions").glob("*.html"), P / "poster" / "index.html"])
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789+—·.km²年")
    out = P / "assets" / "fonts"; out.mkdir(parents=True, exist_ok=True)
    for weight, style in FONT_FILES.items():
        ttc = TTCollection(f"/usr/share/fonts/opentype/noto/NotoSansCJK-{style}.ttc")
        font = next(f for f in ttc.fonts if f["name"].getDebugName(1) == "Noto Sans CJK SC")
        opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]
        sub = subset.Subsetter(opts); sub.populate(text="".join(sorted(chars))); sub.subset(font)
        font.flavor = "woff2"; font.save(out / f"noto-sans-sc-{weight}.woff2")


def build():
    (P / "compositions").mkdir(exist_ok=True)
    for i, s in enumerate(SCENES):
        (P / "compositions" / f"scene-{i}.html").write_text(scene_html(i, s), encoding="utf-8")
    groups = caption_groups()
    caps, ctl = [], []
    for k, (a, b, text) in enumerate(groups):
        caps.append(f'<div id="cap-{k}" class="clip cap" data-start="{r(a)}" data-duration="{r(b - a)}" data-track-index="1"><span>{esc(text)}</span></div>')
        ctl.append(f"tl.fromTo('#cap-{k} span',{{opacity:0}},{{opacity:1,duration:.12,ease:'none'}},{r(a)});")
    cap_css = (FONT_FACE + f"#root{{position:absolute;inset:0;font-family:{FONT}}}"
               ".cap{position:absolute;left:0;top:1196px;width:1080px;text-align:center}"
               f".cap span{{display:inline-block;max-width:900px;padding:10px 22px;background:rgba(9,16,18,.74);border-radius:8px;"
               f"font-weight:700;font-size:46px;line-height:1.4;color:{INK}}}")
    (P / "compositions" / "captions.html").write_text(f"""<template>
<style>{cap_css}</style>
<div id="root" data-composition-id="captions" data-width="{W}" data-height="{H}" data-start="0" data-duration="{TOTAL}">
{chr(10).join(caps)}
</div>
<script>
const tl=gsap.timeline({{paused:true}});
{chr(10).join(ctl)}
window.__timelines["captions"]=tl;
</script>
</template>
""", encoding="utf-8")
    (VO / "subtitles.zh.srt").write_text("\n".join(f"{k + 1}\n{stamp(a)} --> {stamp(b)}\n{t}\n" for k, (a, b, t) in enumerate(groups)), encoding="utf-8")
    hosts = "\n".join(
        f'<div id="scene-{i}" data-composition-id="scene-{i}" data-composition-src="compositions/scene-{i}.html" '
        f'data-start="{r(starts[i])}" data-duration="{r(slots[i])}" data-track-index="1" data-track-kind="graphics" '
        f'data-width="{W}" data-height="{H}"></div>' for i in range(len(SCENES)))
    (P / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>深圳填海造陆发展史</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#0b1416}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="shenzhen-reclamation" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>
<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{r(sum(durs))}" data-track-index="3" data-volume="1"></audio>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["shenzhen-reclamation"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")
    build_poster()
    subset_fonts()
    print(f"Built {len(SCENES)} scenes, {len(groups)} caption groups, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
