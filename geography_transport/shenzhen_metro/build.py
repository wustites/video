"""Build the HyperFrames composition from the narration timing.

Inputs: public/voiceover/{narration.zh.txt, segment-durations.json, word-marks.json} from
`npm run voiceover`, and the cropped metro photos in assets/photos/ (scripts/prepare_photos.py).
Writes index.html, compositions/scene-*.html, compositions/captions.html, poster/index.html and the SRT.
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
TAIL = 2.0  # hold on the last frame after the narration ends
starts = [sum(durs[:i]) for i in range(len(durs))]
slots = [d + (TAIL if i == len(durs) - 1 else 0) for i, d in enumerate(durs)]
TOTAL = round(sum(slots), 3)
W, H = 1080, 1920
GREEN, INK, MUTED = "#2fd06e", "#f7f3ee", "#d6d2cc"
FIRST, NOW = 20, 653.7  # 2004 年首段约 20 公里 / 2026 年 6 月城市轨道交通运营里程（公里）

PHOTOS = {  # file: (credit, licence) — see SOURCES.md
    "luohu": ("Mosnaidaipro", "CC BY-SA 4.0"),
    "line1": ("颐园新居", "CC BY-SA 3.0"),
    "buji": ("Livewireshock", "CC BY-SA 3.0"),
    "gangxia": ("Tim Wu", "CC BY-SA 4.0"),
    "line14": ("Wei Kakurai", "CC BY-SA 4.0"),
    "chegongmiao": ("Tim Wu", "CC BY-SA 4.0"),
    "estuary": ("そらみみ", "CC BY-SA 4.0"),
}
# Line colours, approximating the Shenzhen Metro line identity colours
LINES = {"1": "#00b140", "2": "#b94700", "3": "#00a2e1", "4": "#dc241f", "5": "#9050d0",
         "10": "#f8779e", "11": "#7a1e48", "14": "#d6a81f"}


def at(scene, word, nth=0):
    """Seconds from the scene start at which the narration says `word`."""
    hits = [m["start"] for m in marks[scene] if m["text"] == word]
    if len(hits) <= nth:
        raise SystemExit(f"scene {scene}: no word mark '{word}' (#{nth})")
    return hits[nth]


# Each scene: photo, the push (start/end scale and drift in px), the header, and what it reveals.
SCENES = [
    dict(photo="luohu", place="1 号线 · 罗湖站", push=(1.0, 1.08, -30, -30), year="2004", title="深圳地铁",
         hero=dict(num=FIRST, unit="公里", sub="2004 年 12 月 28 日 · 首段开通", t=None)),
    dict(photo="line1", place="1 号线列车车厢", push=(1.04, 1.12, 0, 30), year="2004", title="最初的两条线",
         rows=[("1", "罗湖 — 世界之窗", at(1, "一号")), ("4", "少年宫 — 福民", at(1, "四号线"))]),
    dict(photo="buji", place="3 号线 · 布吉站", push=(1.0, 1.08, 30, 0), year="2011", title="大运会前夕",
         chips=(["1", "2", "3", "4", "5"], at(2, "五"), "二期 5 条线路全线通车"),
         grow=dict(a=FIRST, b=178, unit="公里", t=at(2, "一百七十八"), sub="全网运营里程")),
    dict(photo="gangxia", place="岗厦北站 · 站厅", push=(1.0, 1.1, 0, 40), year="2022", title="岗厦北枢纽",
         chips=(["2", "10", "11", "14"], at(3, "四条线"), "4 条线在这里交汇"),
         pin=(552, 800, "深圳之眼", at(3, "深圳"))),
    dict(photo="line14", place="14 号线列车", push=(1.06, 1.0, -20, 0), year="2022", title="14 号线 · 东部快线",
         speed=(at(4, "一百二十") - .3), steps=[("福田", at(4, "福田")), ("坪山", at(4, "坪山"))],
         stepsNote=("约 40 分钟", at(4, "四十分钟"))),
    dict(photo="chegongmiao", place="车公庙站 · 11 号线站厅", push=(1.0, 1.08, 0, -30), year="2025", title="一年 32.85 亿人次",
         grow=dict(a=0, b=900, unit="万人次", t=at(5, "九百万"), sub="平均每天"),
         card=("1305 万人次", "2025 年 12 月 31 日 · 单日最高", at(5, "跨年夜"))),
    dict(photo="estuary", place="11 号线车窗外的珠江口", push=(1.08, 1.0, 0, 0), year="2026", title="今天",
         grow=dict(a=FIRST, b=NOW, unit="公里", t=at(6, "六百五十三点七"), sub="18 条线路 · 452 座车站", dec=1),
         back=(f"2004 年 · {FIRST} 公里", at(6, "二十"))),
]

FONT = "'Noto Sans SC', sans-serif"
FONT_FILES = {400: "Regular", 700: "Bold"}  # system Noto Sans CJK, subset to the characters this film uses
FONT_FACE = "".join(
    f"@font-face{{font-family:'Noto Sans SC';src:url('assets/fonts/noto-sans-sc-{w}.woff2') format('woff2');"
    f"font-weight:{ '100 500' if w == 400 else '600 900' };font-display:block}}" for w in FONT_FILES)
CSS = FONT_FACE + f"""
#root{{position:absolute;inset:0;overflow:hidden;background:#101312;font-family:{FONT};color:{INK}}}
.cam{{position:absolute;left:-108px;top:-192px;width:1296px;height:2304px;transform-origin:50% 50%}}
.photo{{position:absolute;inset:0;width:1296px;height:2304px}}
.scrim{{position:absolute;left:0;top:0;width:{W}px;height:1240px;
  background:linear-gradient(180deg,rgba(10,13,12,.9) 0%,rgba(10,13,12,.78) 55%,rgba(10,13,12,0) 100%)}}
.floor{{position:absolute;left:0;top:1120px;width:{W}px;height:800px;
  background:linear-gradient(180deg,rgba(10,13,12,0) 0%,rgba(10,13,12,.55) 40%,rgba(10,13,12,.75) 100%)}}
.head{{position:absolute;left:72px;top:176px;right:72px}}
.year{{font-weight:900;font-size:176px;line-height:1;letter-spacing:-5px;font-variant-numeric:tabular-nums}}
.title{{font-weight:700;font-size:60px;line-height:1.25;margin-top:20px}}
.title::before{{content:"";display:inline-block;width:14px;height:52px;background:{GREEN};margin-right:20px;vertical-align:-6px}}
.hero{{position:absolute;left:66px;right:60px;top:560px}}
.hero b{{display:block;font-weight:900;font-size:260px;line-height:1;letter-spacing:-10px;color:{GREEN};font-variant-numeric:tabular-nums;white-space:nowrap}}
.hero b em{{font-style:normal;font-size:80px;letter-spacing:0;margin-left:18px;color:{INK}}}
.hero small{{display:block;font-weight:700;font-size:46px;line-height:1.4;margin:22px 0 0 8px}}
.hero p{{margin:18px 0 0 8px;font-weight:700;font-size:40px;line-height:1.4;color:{MUTED};text-shadow:0 2px 4px rgba(0,0,0,.8)}}
.chip{{display:inline-flex;align-items:center;justify-content:center;min-width:96px;height:96px;padding:0 14px;box-sizing:border-box;
  border-radius:48px;font-weight:900;font-size:52px;color:#fff;margin-right:18px;box-shadow:0 0 0 4px rgba(247,243,238,.9)}}
.chips{{position:absolute;left:76px;right:60px;top:530px}}
.chips small{{display:block;margin-top:28px;font-weight:700;font-size:46px;line-height:1.35}}
.rows{{position:absolute;left:72px;right:72px;top:560px}}
.row{{display:flex;align-items:center;gap:30px;padding:22px 0 22px 22px;margin-bottom:26px;
  background:linear-gradient(90deg,rgba(10,13,12,.86),rgba(10,13,12,.3))}}
.row .chip{{margin-right:0}}
.row span{{font-weight:900;font-size:62px;line-height:1.2}}
.pin{{position:absolute;width:0;height:0}}
.pin i{{position:absolute;left:-12px;top:-12px;width:24px;height:24px;border-radius:50%;background:{GREEN};box-shadow:0 0 0 5px rgba(247,243,238,.9)}}
.pin span{{position:absolute;left:30px;top:-38px;white-space:nowrap;font-weight:900;font-size:56px;line-height:76px;padding:0 18px;
  background:rgba(10,13,12,.78);color:{INK}}}
.speed{{position:absolute;left:66px;top:540px}}
.speed b{{font-weight:900;font-size:260px;line-height:1;letter-spacing:-10px;color:{GREEN}}}
.speed em{{font-style:normal;font-weight:700;font-size:72px;margin-left:16px}}
.speed small{{display:block;font-weight:700;font-size:44px;margin:10px 0 0 8px;color:{MUTED}}}
.steps{{position:absolute;left:72px;top:930px;display:flex;align-items:center;gap:26px;padding:20px 30px;background:rgba(10,13,12,.8)}}
.step b{{display:block;font-weight:900;font-size:76px;line-height:1}}
.arrow{{width:150px;height:6px;background:{GREEN};position:relative}}
.arrow::after{{content:"";position:absolute;right:-4px;top:-10px;border:13px solid transparent;border-left:18px solid {GREEN}}}
.stepnote{{font-weight:700;font-size:48px;color:{GREEN};margin-left:12px}}
.card{{position:absolute;left:72px;right:72px;top:960px;padding:28px 34px;background:rgba(10,13,12,.82);border-left:10px solid {GREEN}}}
.card b{{display:block;font-weight:900;font-size:76px;line-height:1.2}}
.card small{{display:block;font-weight:500;font-size:40px;line-height:1.5;color:{MUTED};margin-top:8px}}
.credit{{position:absolute;left:72px;right:72px;top:1384px;font-size:24px;line-height:1.4;color:{MUTED};text-shadow:0 1px 2px #000}}
"""


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


def lum(hex_):
    c = [int(hex_[k:k + 2], 16) / 255 for k in (1, 3, 5)]
    c = [v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4 for v in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]


def chip(line, cid=""):
    bg = LINES[line]
    fg = "#fff" if 1.05 / (lum(bg) + .05) >= 4.5 else "#101312"  # white unless it fails 4.5:1
    idattr = f' id="{cid}"' if cid else ""
    return f'<span class="chip"{idattr} style="background:{bg};color:{fg}">{line}</span>'


def show(tl, sel, t, dx=0, dy=14, dur=.4):
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,x:{dx},y:{dy}}},{{opacity:1,x:0,y:0,duration:{dur},ease:'power3.out'}},{r(max(t, .05))});")


def count(tl, i, sel, a, b, t, dur, dec=0):
    tl.append(f"const c{i}={{v:{a}}};tl.to(c{i},{{v:{b},duration:{dur},ease:'power2.out',"
              f"onUpdate:()=>{{document.querySelector('{sel}').textContent=c{i}.v.toFixed({dec})}}}},{r(t)});")


def scene_html(i, s):
    sid = f"scene-{i}"
    d = slots[i]
    tl = []
    z0, z1, dx, dy = s["push"]
    tl.append(f"tl.fromTo('#{sid}-cam',{{scale:{z0},x:0,y:0}},{{scale:{z1},x:{dx},y:{dy},duration:{r(d)},ease:'none'}},0);")
    body = [f'<div id="{sid}-cam" class="cam" data-layout-allow-overflow><img id="{sid}-photo" class="photo" src="assets/photos/{s["photo"]}.jpg" alt="{esc(s["place"])}"></div>',
            '<div class="scrim"></div><div class="floor"></div>']
    body.append(f'<div class="head" id="{sid}-head"><div class="year" id="{sid}-year">{s["year"]}</div>'
                f'<div class="title" id="{sid}-title">{esc(s["title"])}</div></div>')
    if i > 0:  # every scene after the cover lands its header on the cut
        show(tl, f"#{sid}-year", .05, dx=-30, dy=0, dur=.45)
        show(tl, f"#{sid}-title", .25, dx=-24, dy=0, dur=.45)

    if s.get("hero"):  # the cover: static, readable on frame 0
        h = s["hero"]
        body.append(f'<div class="hero"><b>{h["num"]}<em>{h["unit"]}</em></b><small>{esc(h["sub"])}</small></div>')
    if s.get("rows"):
        body.append('<div class="rows">' + "".join(
            f'<div class="row" id="{sid}-r{k}">{chip(line)}<span>{esc(route)}</span></div>'
            for k, (line, route, _) in enumerate(s["rows"])) + '</div>')
        for k, (_, _, t) in enumerate(s["rows"]):
            show(tl, f"#{sid}-r{k}", t - .05, dx=-40, dy=0)
    if s.get("chips"):
        lines, t, note = s["chips"]
        body.append('<div class="chips" id="{0}-chips">'.format(sid)
                    + "".join(chip(l, f"{sid}-c{k}") for k, l in enumerate(lines))
                    + f'<small id="{sid}-cn">{esc(note)}</small></div>')
        for k in range(len(lines)):
            tl.append(f"tl.fromTo('#{sid}-c{k}',{{opacity:0,scale:.5}},{{opacity:1,scale:1,duration:.3,ease:'back.out(2)'}},{r(t - .15 + k * .08)});")
        show(tl, f"#{sid}-cn", t + .45)
    if s.get("grow"):
        g = s["grow"]
        dec = g.get("dec", 0)
        top = 820 if s.get("chips") else 560
        body.append(f'<div class="hero" id="{sid}-hero" style="top:{top}px"><b><span id="{sid}-num">{g["a"]:.{dec}f}</span><em>{g["unit"]}</em></b>'
                    f'<small id="{sid}-sub">{esc(g["sub"])}</small>'
                    + (f'<p id="{sid}-back">{esc(s["back"][0])}</p>' if s.get("back") else "") + '</div>')
        t0 = max(g["t"] - .9, .3)
        tl.append(f"tl.fromTo('#{sid}-hero',{{opacity:0}},{{opacity:1,duration:.3,ease:'none'}},{r(t0)});")
        count(tl, i, f"#{sid}-num", g["a"], g["b"], t0, 1.6, dec)
        show(tl, f"#{sid}-sub", t0 + 1.2)
        if s.get("back"):
            show(tl, f"#{sid}-back", s["back"][1])
    if s.get("pin"):
        x, y, name, t = s["pin"]
        body.append(f'<div class="pin" id="{sid}-pin" style="left:{x}px;top:{y}px"><div id="{sid}-pin-in"><i></i><span>{esc(name)}</span></div></div>')
        tl.append(f"tl.fromTo('#{sid}-pin-in',{{opacity:0,scale:.6,transformOrigin:'0 0'}},{{opacity:1,scale:1,duration:.4,ease:'back.out(2)'}},{r(t)});")
    if s.get("speed") is not None:
        t = s["speed"]
        body.append(f'<div class="speed" id="{sid}-speed"><b>120</b><em>km/h</em><small>最高时速</small></div>')
        show(tl, f"#{sid}-speed", t, dy=24, dur=.45)
    if s.get("steps"):
        (a, ta), (b, tb) = s["steps"]
        note, tn = s["stepsNote"]
        body.append(f'<div class="steps" id="{sid}-steps"><div class="step" id="{sid}-s0"><b>{esc(a)}</b></div>'
                    f'<div class="arrow" id="{sid}-arrow"></div><div class="step" id="{sid}-s1"><b>{esc(b)}</b></div>'
                    f'<div class="stepnote" id="{sid}-sn">{esc(note)}</div></div>')
        tl.append(f"tl.fromTo('#{sid}-steps',{{opacity:0}},{{opacity:1,duration:.2,ease:'none'}},{r(ta - .1)});")
        show(tl, f"#{sid}-s0", ta - .1)
        tl.append(f"tl.fromTo('#{sid}-arrow',{{scaleX:0,transformOrigin:'0 50%'}},{{scaleX:1,duration:.5,ease:'power2.inOut'}},{r(ta + .25)});")
        show(tl, f"#{sid}-s1", tb - .05)
        show(tl, f"#{sid}-sn", tn - .05, dx=-20, dy=0)
    if s.get("card"):
        a, b, t = s["card"]
        body.append(f'<div class="card" id="{sid}-card"><b>{esc(a)}</b><small>{esc(b)}</small></div>')
        show(tl, f"#{sid}-card", t, dx=-30, dy=0)

    who, lic = PHOTOS[s["photo"]]
    body.append(f'<div class="credit" data-layout-ignore>{esc(s["place"])} · 照片 {esc(who)} / Wikimedia Commons · {esc(lic)}</div>')
    return f"""<template>
<style>{CSS}</style>
<div id="root" data-composition-id="{sid}" data-width="{W}" data-height="{H}" data-start="0" data-duration="{r(d)}">
{''.join(body)}
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
            if len(ph) > 13:  # too long for one line: split at the word boundary nearest the middle
                cut = min((wp - p for wp, _ in pos if p < wp < p + len(ph)), key=lambda c: abs(c - len(ph) / 2))
                timed.append((starts[i] + t, ph[:cut]))
                timed.append((starts[i] + next(tm for wp, tm in pos if wp >= p + cut), ph[cut:]))
                continue
            timed.append((starts[i] + t, ph))
        for k, (t, ph) in enumerate(timed):
            end = timed[k + 1][0] - 0.05 if k + 1 < len(timed) else starts[i] + durs[i] - 0.05
            groups.append((max(t - 0.05, 0.12), end, ph))
    return groups


def stamp(v):
    ms = round(v * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def build_poster():
    """Single-frame release cover (npm run render:still): Gangxia North, 20 km then, 653.7 km now."""
    css = CSS.replace("url('assets/", "url('../assets/")
    (P / "poster").mkdir(exist_ok=True)
    (P / "poster" / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>深圳地铁 · 封面</title>
<script src="../assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}{css}
.cover-cam{{transform:scale(1.04)}}
.kicker{{position:absolute;left:72px;top:190px;font-weight:700;font-size:40px;letter-spacing:8px;color:{MUTED}}}
.big{{position:absolute;left:66px;top:250px;font-weight:900;font-size:150px;line-height:1.1;letter-spacing:-2px}}
.from{{position:absolute;left:72px;top:640px;font-weight:700;font-size:46px;color:{MUTED}}}
.from b{{font-weight:900;font-size:120px;color:{INK};margin-right:10px}}
.to{{position:absolute;left:66px;top:800px;font-weight:900;font-size:220px;line-height:1;letter-spacing:-9px;color:{GREEN}}}
.to em{{font-style:normal;font-size:60px;letter-spacing:0;color:{INK};margin-left:16px}}
.sub{{position:absolute;left:72px;top:1050px;font-weight:700;font-size:44px;line-height:1.4}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="shenzhen-metro-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="cam cover-cam"><img class="photo" src="../assets/photos/gangxia.jpg" alt="深圳地铁岗厦北站站厅"></div>
<div class="scrim" style="height:1300px"></div>
<div class="kicker">2004—2026</div>
<div class="big">深圳地铁</div>
<div class="from"><b>{FIRST}</b>公里 · 2004 首段开通</div>
<div class="to">{NOW}<em>公里</em></div>
<div class="sub">18 条线路 · 452 座车站</div>
<div class="credit" data-layout-ignore>岗厦北站 · 照片 Tim Wu / Wikimedia Commons · CC BY-SA 4.0</div>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["shenzhen-metro-poster"]=gsap.timeline({{paused:true}});
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
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789+—·.,年月公里万人次kmh/")
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
               ".cap{position:absolute;left:0;top:1200px;width:1080px;text-align:center}"
               f".cap span{{display:inline-block;max-width:900px;padding:10px 22px;background:rgba(10,13,12,.76);border-radius:8px;"
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
<title>深圳地铁</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#101312}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="shenzhen-metro" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>
<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{r(sum(durs))}" data-track-index="3" data-volume="1"></audio>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["shenzhen-metro"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")
    build_poster()
    subset_fonts()
    print(f"Built {len(SCENES)} scenes, {len(groups)} caption groups, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
