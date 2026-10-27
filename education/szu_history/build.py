"""Build the HyperFrames composition from the narration timing.

Inputs: public/voiceover/{narration.zh.txt, segment-durations.json, word-marks.json} from
`npm run voiceover`, and the cropped campus photos in assets/photos/ (scripts/prepare_photos.py).
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
RED, INK, MUTED = "#f0414f", "#f7f3ee", "#d6d2cc"
FIRST, NOW = 216, 50648  # 首届新生 (1983) / 在校生 (学校简介, 2026)

PHOTOS = {  # file: (credit, licence) — see SOURCES.md
    "gate": ("Perimeter Chou", "CC0"),
    "wenshan": ("Jauhnn", "公有领域"),
    "library": ("写意人生", "CC BY-SA 4.0"),
    "humanities": ("NAN LIU", "CC BY-SA 2.0"),
    "techbuilding": ("Jauhnn", "公有领域"),
    "lihu_aerial": ("Sparktour", "CC BY-SA 4.0"),
    "lihu_night": ("Sparktour", "CC BY-SA 4.0"),
}


def at(scene, word, nth=0):
    """Seconds from the scene start at which the narration says `word`."""
    hits = [m["start"] for m in marks[scene] if m["text"] == word]
    if len(hits) <= nth:
        raise SystemExit(f"scene {scene}: no word mark '{word}' (#{nth})")
    return hits[nth]


# Each scene: photo, the push (start/end scale and drift in px), the header, and what it reveals.
SCENES = [
    dict(photo="gate", place="粤海校区南门", push=(1.0, 1.08, 0, -40), year="1983", title="深圳大学发展史",
         hero=dict(num=FIRST, unit="人", sub="1983 年 9 月 · 首届新生", t=None)),
    dict(photo="wenshan", place="粤海校区 · 文山湖", push=(1.04, 1.12, 30, 0), year="1983", title="和特区一起起步",
         steps=[("5 月", "获批", at(1, "五月")), ("9 月", "开学", at(1, "九月"))],
         rows=[("北京大学", "中文 · 外语", at(1, "北大")), ("清华大学", "电子 · 建筑", at(1, "清华")),
               ("中国人民大学", "经济 · 法律", at(1, "人大"))], rowsTitle="对口援建"),
    dict(photo="library", place="粤海校区 · 图书馆", push=(1.0, 1.07, -30, 20), year="1984", title="搬进后海边的新校园",
         pin=(700, 900, "粤海校区", at(2, "粤海")), note=("1984 年 9 月迁入", at(2, "师生"))),
    dict(photo="humanities", place="粤海校区 · 文科楼一带", push=(1.06, 1.0, 0, 30), year="1980s", title="全国第一",
         firsts=[("毕业生不包分配", at(3, "毕业生")), ("教职工聘任制", at(3, "教职工")),
                 ("学分制", at(3, "学分")), ("勤工俭学", at(3, "勤工俭学"))]),
    dict(photo="techbuilding", place="粤海校区 · 科技楼", push=(1.0, 1.08, 0, -30), year="1990s", title="计算机系",
         names=[("马化腾", at(4, "马化腾")), ("张志东", at(4, "张志东"))],
         founders=dict(five=at(4, "五"), four=at(4, "四"))),
    dict(photo="lihu_aerial", place="丽湖校区", push=(1.0, 1.1, 20, 30), year="2017", title="第二个校区",
         pin=(330, 1080, "丽湖校区", at(5, "丽湖")),
         roll=dict(to="2018", t=at(5, "第二"), title="高水平大学建设", card=("广东省重点建设高校", "学校整体进入", at(5, "整体")))),
    dict(photo="lihu_night", place="丽湖校区夜景", push=(1.08, 1.0, 0, 0), year="2026", title="今天",
         hero=dict(num=NOW, unit="人", sub="在校生 · 粤海、丽湖两个校区", t=at(6, "五万零六百四十八")),
         back=(f"1983 年 · {FIRST} 人", at(6, "二百一十六"))),
]

FONT = "'Noto Sans SC', sans-serif"
FONT_FILES = {400: "Regular", 700: "Bold"}  # system Noto Sans CJK, subset to the characters this film uses
FONT_FACE = "".join(
    f"@font-face{{font-family:'Noto Sans SC';src:url('assets/fonts/noto-sans-sc-{w}.woff2') format('woff2');"
    f"font-weight:{ '100 500' if w == 400 else '600 900' };font-display:block}}" for w in FONT_FILES)
CSS = FONT_FACE + f"""
#root{{position:absolute;inset:0;overflow:hidden;background:#141210;font-family:{FONT};color:{INK}}}
.cam{{position:absolute;left:-108px;top:-192px;width:1296px;height:2304px;transform-origin:50% 50%}}
.photo{{position:absolute;inset:0;width:1296px;height:2304px}}
.scrim{{position:absolute;left:0;top:0;width:{W}px;height:1240px;
  background:linear-gradient(180deg,rgba(14,12,11,.9) 0%,rgba(14,12,11,.78) 55%,rgba(14,12,11,0) 100%)}}
.floor{{position:absolute;left:0;top:1120px;width:{W}px;height:800px;
  background:linear-gradient(180deg,rgba(14,12,11,0) 0%,rgba(14,12,11,.55) 40%,rgba(14,12,11,.75) 100%)}}
.head{{position:absolute;left:72px;top:176px;right:72px}}
.year{{font-weight:900;font-size:176px;line-height:1;letter-spacing:-5px;font-variant-numeric:tabular-nums}}
.title{{font-weight:700;font-size:60px;line-height:1.25;margin-top:20px}}
.title::before{{content:"";display:inline-block;width:14px;height:52px;background:{RED};margin-right:20px;vertical-align:-6px}}
.hero{{position:absolute;left:66px;right:60px;top:560px}}
.hero b{{display:block;font-weight:900;font-size:300px;line-height:1;letter-spacing:-12px;color:{RED};font-variant-numeric:tabular-nums}}
.hero b em{{font-style:normal;font-size:96px;letter-spacing:0;margin-left:18px;color:{INK}}}
.hero small{{display:block;font-weight:700;font-size:46px;line-height:1.4;margin:22px 0 0 8px}}
.hero p{{margin:18px 0 0 8px;font-weight:700;font-size:40px;line-height:1.4;color:{INK};text-shadow:0 2px 4px rgba(0,0,0,.8)}}
.steps{{position:absolute;left:72px;top:520px;display:flex;align-items:center;gap:26px}}
.step b{{display:block;font-weight:900;font-size:76px;line-height:1}}
.step span{{display:block;font-weight:500;font-size:34px;line-height:1.4;margin-top:8px;color:{MUTED}}}
.arrow{{width:120px;height:4px;background:{RED};position:relative;top:-20px}}
.arrow::after{{content:"";position:absolute;right:-4px;top:-10px;border:12px solid transparent;border-left:16px solid {RED}}}
.rows{{position:absolute;left:72px;right:72px;top:720px}}
.rows h3{{margin:0 0 18px;font-weight:500;font-size:34px;letter-spacing:6px;color:{MUTED}}}
.row{{display:flex;align-items:baseline;gap:28px;padding:18px 0 18px 26px;border-left:6px solid {RED};margin-bottom:22px;
  background:linear-gradient(90deg,rgba(14,12,11,.86),rgba(14,12,11,.3))}}
.row b{{font-weight:900;font-size:58px;line-height:1.2;min-width:390px}}
.row span{{font-weight:500;font-size:44px;line-height:1.2;color:{INK}}}
.note{{position:absolute;left:72px;top:500px;font-weight:500;font-size:40px;color:{MUTED}}}
.pin{{position:absolute;width:0;height:0}}
.pin i{{position:absolute;left:-12px;top:-12px;width:24px;height:24px;border-radius:50%;background:{RED};box-shadow:0 0 0 5px rgba(247,243,238,.9)}}
.pin span{{position:absolute;left:30px;top:-38px;white-space:nowrap;font-weight:900;font-size:56px;line-height:76px;padding:0 18px;
  background:rgba(14,12,11,.78);color:{INK}}}
.firsts{{position:absolute;left:72px;right:72px;top:520px}}
.first{{font-weight:900;font-size:88px;line-height:1.18;margin-bottom:26px;white-space:nowrap}}
.first::before{{content:"";display:inline-block;width:10px;height:70px;background:{RED};margin-right:26px;vertical-align:-6px}}
.names{{position:absolute;left:72px;top:500px}}
.names b{{display:block;font-weight:900;font-size:120px;line-height:1.15;letter-spacing:4px}}
.founders{{position:absolute;left:72px;right:72px;top:840px}}
.dots{{display:flex;gap:30px}}
.dot{{width:112px;height:112px;border-radius:50%;border:8px solid {INK};box-sizing:border-box}}
.dot.on{{background:{RED};border-color:{RED}}}
.founders small{{display:block;margin-top:30px;font-weight:700;font-size:52px;line-height:1.35}}
.founders small em{{font-style:normal;color:{RED}}}
.card{{position:absolute;left:72px;right:72px;top:560px;padding:30px 34px;background:rgba(14,12,11,.8);border-left:10px solid {RED}}}
.card b{{display:block;font-weight:900;font-size:66px;line-height:1.3}}
.card small{{display:block;font-weight:500;font-size:42px;line-height:1.5;color:{MUTED};margin-top:8px}}
.credit{{position:absolute;left:72px;right:72px;top:1384px;font-size:24px;line-height:1.4;color:{MUTED};text-shadow:0 1px 2px #000}}
"""


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


def show(tl, sel, t, dx=0, dy=14, dur=.4):
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,x:{dx},y:{dy}}},{{opacity:1,x:0,y:0,duration:{dur},ease:'power3.out'}},{r(max(t, .05))});")


def count(tl, i, sel, a, b, t, dur, fmt="v"):
    tl.append(f"const c{i}={{v:{a}}};tl.to(c{i},{{v:{b},duration:{dur},ease:'power2.out',"
              f"onUpdate:()=>{{document.querySelector('{sel}').textContent=Math.round(c{i}.v)}}}},{r(t)});")


def scene_html(i, s):
    sid = f"scene-{i}"
    d = slots[i]
    tl = []
    z0, z1, dx, dy = s["push"]
    tl.append(f"tl.fromTo('#{sid}-cam',{{scale:{z0},x:0,y:0}},{{scale:{z1},x:{dx},y:{dy},duration:{r(d)},ease:'none'}},0);")
    body = [f'<div id="{sid}-cam" class="cam" data-layout-allow-overflow><img id="{sid}-photo" class="photo" src="assets/photos/{s["photo"]}.jpg" alt="{esc(s["place"])}"></div>',
            '<div class="scrim"></div><div class="floor"></div>']
    head = (f'<div class="head" id="{sid}-head"><div class="year" id="{sid}-year">{s["year"]}</div>'
            f'<div class="title" id="{sid}-title">{esc(s["title"])}</div></div>')
    if i > 0:  # every scene after the cover lands its header on the cut
        show(tl, f"#{sid}-year", .05, dx=-30, dy=0, dur=.45)
        show(tl, f"#{sid}-title", .25, dx=-24, dy=0, dur=.45)
    body.append(head)

    if s.get("hero"):
        h = s["hero"]
        start = 0 if h["t"] is None else FIRST
        body.append(f'<div class="hero" id="{sid}-hero"><b><span id="{sid}-num">{h["num"] if h["t"] is None else start}</span><em>{h["unit"]}</em></b>'
                    f'<small id="{sid}-sub">{esc(h["sub"])}</small>'
                    + (f'<p id="{sid}-back">{esc(s["back"][0])}</p>' if s.get("back") else "") + '</div>')
        if h["t"] is not None:
            tl.append(f"tl.fromTo('#{sid}-hero',{{opacity:0}},{{opacity:1,duration:.3,ease:'none'}},{r(h['t'] - .9)});")
            count(tl, i, f"#{sid}-num", FIRST, h["num"], h["t"] - .9, 1.6)
            show(tl, f"#{sid}-sub", h["t"] + .9)
            show(tl, f"#{sid}-back", s["back"][1])
    if s.get("steps"):
        a, b = s["steps"]
        body.append(f'<div class="steps"><div class="step" id="{sid}-s0"><b>{a[0]}</b><span>{a[1]}</span></div>'
                    f'<div class="arrow" id="{sid}-arrow"></div><div class="step" id="{sid}-s1"><b>{b[0]}</b><span>{b[1]}</span></div></div>')
        show(tl, f"#{sid}-s0", a[2])
        tl.append(f"tl.fromTo('#{sid}-arrow',{{scaleX:0,transformOrigin:'0 50%'}},{{scaleX:1,duration:.5,ease:'power2.inOut'}},{r(a[2] + .4)});")
        show(tl, f"#{sid}-s1", b[2])
    if s.get("rows"):
        rows = "".join(f'<div class="row" id="{sid}-r{k}"><b>{esc(n)}</b><span>{esc(f)}</span></div>' for k, (n, f, _) in enumerate(s["rows"]))
        body.append(f'<div class="rows"><h3 id="{sid}-rh">{esc(s["rowsTitle"])}</h3>{rows}</div>')
        show(tl, f"#{sid}-rh", s["rows"][0][2] - .3)
        for k, (_, _, t) in enumerate(s["rows"]):
            show(tl, f"#{sid}-r{k}", t, dx=-40, dy=0)
    if s.get("note"):
        body.append(f'<div class="note" id="{sid}-note">{esc(s["note"][0])}</div>')
        show(tl, f"#{sid}-note", s["note"][1])
    if s.get("pin"):
        x, y, name, t = s["pin"]
        body.append(f'<div class="pin" id="{sid}-pin" style="left:{x}px;top:{y}px"><div id="{sid}-pin-in"><i></i><span>{esc(name)}</span></div></div>')
        tl.append(f"tl.fromTo('#{sid}-pin-in',{{opacity:0,scale:.6,transformOrigin:'0 0'}},{{opacity:1,scale:1,duration:.4,ease:'back.out(2)'}},{r(t)});")
    if s.get("firsts"):
        items = "".join(f'<div class="first" id="{sid}-f{k}">{esc(n)}</div>' for k, (n, _) in enumerate(s["firsts"]))
        body.append(f'<div class="firsts">{items}</div>')
        for k, (_, t) in enumerate(s["firsts"]):
            show(tl, f"#{sid}-f{k}", t - .1, dx=-50, dy=0, dur=.35)
            if k:  # the previous item steps back so the one being said leads
                tl.append(f"tl.to('#{sid}-f{k - 1}',{{opacity:.5,duration:.3,ease:'none'}},{r(t - .1)});")
    if s.get("names"):
        body.append('<div class="names">' + "".join(f'<b id="{sid}-n{k}">{esc(n)}</b>' for k, (n, _) in enumerate(s["names"])) + '</div>')
        for k, (_, t) in enumerate(s["names"]):
            show(tl, f"#{sid}-n{k}", t - .05, dy=20)
    if s.get("founders"):
        f = s["founders"]
        dots = "".join(f'<div class="dot" id="{sid}-d{k}"></div>' for k in range(5))
        body.append(f'<div class="founders"><div class="dots">{dots}</div>'
                    f'<small id="{sid}-fs">腾讯 5 位创始人中，<em>4 位</em>是深大校友</small></div>')
        for k in range(5):
            show(tl, f"#{sid}-d{k}", f["five"] - .1 + k * .07, dy=0, dur=.25)
        for k in range(4):
            tl.append(f"tl.to('#{sid}-d{k}',{{backgroundColor:'{RED}',borderColor:'{RED}',duration:.2,ease:'none'}},{r(f['four'] + k * .1)});")
        show(tl, f"#{sid}-fs", f["four"] + .3)
    if s.get("roll"):
        ro = s["roll"]
        tl.append(f"const y{i}={{v:{s['year']}}};tl.to(y{i},{{v:{ro['to']},duration:.6,ease:'power1.out',"
                  f"onUpdate:()=>{{document.querySelector('#{sid}-year').textContent=Math.round(y{i}.v)}}}},{r(ro['t'])});")
        tl.append(f"tl.to('#{sid}-title',{{opacity:0,duration:.2,ease:'none'}},{r(ro['t'])});")
        body.append(f'<div class="title" id="{sid}-title2" style="position:absolute;left:72px;top:{176 + 176}px">{esc(ro["title"])}</div>')
        show(tl, f"#{sid}-title2", ro["t"] + .25, dx=-24, dy=0)
        a, b, t = ro["card"]
        body.append(f'<div class="card" id="{sid}-card"><b>{esc(a)}</b><small>{esc(b)}</small></div>')
        show(tl, f"#{sid}-card", t, dx=-30, dy=0)
        tl.append(f"tl.to('#{sid}-pin-in',{{opacity:0,duration:.3,ease:'none'}},{r(t - .3)});")

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
            end = timed[k + 1][0] if k + 1 < len(timed) else starts[i] + durs[i] - 0.05
            groups.append((max(t - 0.05, 0.12), end, ph))
    return groups


def stamp(v):
    ms = round(v * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def build_poster():
    """Single-frame release cover (npm run render:still): the main gate, 216 then, 50648 now."""
    css = CSS.replace("url('assets/", "url('../assets/")
    (P / "poster").mkdir(exist_ok=True)
    (P / "poster" / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>深圳大学发展史 · 封面</title>
<script src="../assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}{css}
.cover-cam{{transform:scale(1.04)}}
.kicker{{position:absolute;left:72px;top:190px;font-weight:700;font-size:40px;letter-spacing:8px;color:{MUTED}}}
.big{{position:absolute;left:66px;top:250px;font-weight:900;font-size:150px;line-height:1.1;letter-spacing:-2px}}
.from{{position:absolute;left:72px;top:640px;font-weight:700;font-size:46px;color:{MUTED}}}
.from b{{font-weight:900;font-size:120px;color:{INK};margin-right:10px}}
.to{{position:absolute;left:66px;top:800px;font-weight:900;font-size:220px;line-height:1;letter-spacing:-9px;color:{RED}}}
.to em{{font-style:normal;font-size:60px;letter-spacing:0;color:{INK};margin-left:16px}}
.sub{{position:absolute;left:72px;top:1050px;font-weight:700;font-size:44px;line-height:1.4}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="szu-history-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="cam cover-cam"><img class="photo" src="../assets/photos/gate.jpg" alt="深圳大学粤海校区南门"></div>
<div class="scrim" style="height:1300px"></div>
<div class="kicker">1983—2026</div>
<div class="big">深圳大学<br>发展史</div>
<div class="from"><b>{FIRST}</b>人 · 1983 首届新生</div>
<div class="to">{NOW}<em>人</em></div>
<div class="sub">今天的在校生 · 和深圳一起长大</div>
<div class="credit" data-layout-ignore>照片 Perimeter Chou / Wikimedia Commons · CC0</div>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["szu-history-poster"]=gsap.timeline({{paused:true}});
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
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789+—·.,年月人s")
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
               f".cap span{{display:inline-block;max-width:900px;padding:10px 22px;background:rgba(14,12,11,.76);border-radius:8px;"
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
<title>深圳大学发展史</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#141210}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="szu-history" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>
<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{r(sum(durs))}" data-track-index="3" data-volume="1"></audio>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["szu-history"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")
    build_poster()
    subset_fonts()
    print(f"Built {len(SCENES)} scenes, {len(groups)} caption groups, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
