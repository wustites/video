"""Build the HyperFrames composition from the narration timing.

Inputs: public/voiceover/{narration.zh.txt, segment-durations.json, word-marks.json} from
`npm run voiceover`, and the cropped photos in assets/photos/ (scripts/prepare_photos.py).
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
GOLD, INK, MUTED, RED = "#f0b43c", "#f5f2ec", "#d3cfc8", "#dc4c4c"

PHOTOS = {  # file: (credit, licence) — see SOURCES.md
    "tk_winter": ("Adrian Grycuk", "CC BY-SA 3.0 PL"),
    "protest2015": ("Mathiasrex (Maciej Szczepańczyk)", "CC BY-SA 4.0"),
    "sejm": ("Lukas Plewnia", "CC BY-SA 2.0"),
    "tk_entrance": ("Adrian Grycuk", "CC BY-SA 3.0 PL"),
    "supreme": ("Spens03", "CC BY-SA 3.0"),
    "palace": ("Omenaga", "CC BY-SA 4.0"),
    "tk_hall": ("Adrian Grycuk", "CC BY-SA 3.0 PL"),
}
JUDGES, NEW, SWORN = 15, 8, 3  # bench size; judges the Sejm elected in 2026; of those, sworn in before the president
RIVALS = [  # the two leaderships claiming the tribunal on 31 October 2026
    ("院长", "希维昂奇科夫斯基", "总统与法律与公正党承认"),
    ("代行院长", "科尔温-<br>皮奥特罗夫斯卡", "政府一方承认"),
]


def at(scene, word, nth=0):
    """Seconds from the scene start at which the narration says `word`."""
    hits = [m["start"] for m in marks[scene] if m["text"] == word]
    if len(hits) <= nth:
        raise SystemExit(f"scene {scene}: no word mark '{word}' (#{nth})")
    return hits[nth]


# Each scene: photo, the push (start/end scale and drift in px), the header, and what it reveals.
SCENES = [
    dict(photo="tk_winter", place="华沙 · 波兰宪法法院", push=(1.0, 1.08, 0, -30), year="10.30", title="波兰宪法法院之争",
         hero=dict(big="政变？", sub="反对派的指控 · 政府称在恢复法治")),
    dict(photo="protest2015", place="2015 年 12 月 13 日 · 支持宪法法院法修改的集会", push=(1.04, 1.12, 20, 0), year="15", title="名法官 · 任期 9 年",
         dots=dict(n=JUDGES, gold=0, t=at(1, "十五") - .2, label="由议会众议院选出", tl=at(1, "众议院") - .2),
         cards=[("2015 · 法律与公正党上台", "拒绝监誓 · 另选法官", "时任总统不为上届议会所选法官监誓", at(1, "时任") - .2, 740),
                ("批评者", "法院成了执政党的工具", "", at(1, "批评"), 995)]),
    dict(photo="sejm", place="华沙 · 波兰议会众议院", push=(1.0, 1.06, 0, 20), year="2026", title="八名新法官",
         cards=[("2023 年 12 月", "图斯克政府上台", "不承认宪法法院的裁决", at(2, "二零二三年"), 520, at(2, "院长") - .3),
                ("宪法法院院长", "希维昂奇科夫斯基", "不让新法官全部上任", at(2, "院长"), 520)],
         dots=dict(n=NEW, gold=SWORN, t=at(2, "八") - .2, tg=at(2, "三") - .1, top=840,
                   label=f"总统监誓 {SWORN} 人 · 议会自行宣誓 {NEW - SWORN} 人", tl=at(2, "其余"))),
    dict(photo="tk_entrance", place="华沙 · 波兰宪法法院", push=(1.06, 1.0, -20, 0), year="10.30", title="周五晚 · 接管",
         rows=[("总统", "在塞内加尔访问", at(3, "塞内加尔") - .3),
               ("7 名新法官", "进入法院大楼", at(3, "七") - .1),
               ("院长、副院长", "停职一个月", at(3, "停职") - .2),
               ("科尔温-皮奥特罗夫斯卡", "代行院长职务", at(3, "代行") - .2),
               ("防暴警察", "包围法院", at(3, "防暴") - .2, True)]),
    dict(photo="supreme", place="华沙 · 波兰最高法院", push=(1.0, 1.08, -30, 0), year="政变", title="法院原领导层与反对派的指控", dim=True,
         quotes=[("宪法法院原领导层", "“这是政变”", at(4, "政变") - .8),
                 ("最高法院第一院长 卡平斯基", "“毫无疑问是政变”", at(4, "毫无疑问") - .2),
                 ("法律与公正党主席 卡钦斯基", "“警察国家”", at(4, "卡钦斯基") - .1),
                 ("法学家 马特恰克（长期批评该党）", "停职“缺乏依据”", at(4, "法学") - .2)]),
    dict(photo="palace", place="华沙 · 总统府", push=(1.0, 1.08, 30, 0), year="10.31", title="总统深夜进入法院",
         rows=[("专机", "中途折返", at(5, "专机") - .2),
               ("凌晨", "进入宪法法院，与新法官推挤", at(5, "凌晨") - .2),
               ("总统府", "“宪法秩序遭到破坏”", at(5, "总统府") - .2, True),
               ("总统府", "召集各党紧急磋商", at(5, "召集") - .2),
               ("司法部长", "指责总统“强行闯入”", at(5, "司法") - .2)]),
    dict(photo="tk_hall", place="宪法法院大审判庭（2016 年）", push=(1.08, 1.0, 0, 0), year="两套领导层", title="谁有权解释宪法？", dim=True,
         quotes=[("总理 图斯克", "“很痛苦，但别无他法”", at(6, "图斯克") - .2)],
         rivals=at(6, "两") - .2,
         final=("截至 10 月 31 日 · 对峙仍在继续", at(6, "争夺") - .2)),
]

FONT = "'Noto Sans SC', sans-serif"
FONT_FILES = {400: "Regular", 700: "Bold"}  # system Noto Sans CJK, subset to the characters this film uses
FONT_FACE = "".join(
    f"@font-face{{font-family:'Noto Sans SC';src:url('assets/fonts/noto-sans-sc-{w}.woff2') format('woff2');"
    f"font-weight:{ '100 500' if w == 400 else '600 900' };font-display:block}}" for w in FONT_FILES)
CSS = FONT_FACE + f"""
#root{{position:absolute;inset:0;overflow:hidden;background:#111314;font-family:{FONT};color:{INK}}}
.cam{{position:absolute;left:-108px;top:-192px;width:1296px;height:2304px;transform-origin:50% 50%}}
.photo{{position:absolute;inset:0;width:1296px;height:2304px}}
.scrim{{position:absolute;left:0;top:0;width:{W}px;height:1240px;
  background:linear-gradient(180deg,rgba(12,13,14,.9) 0%,rgba(12,13,14,.78) 55%,rgba(12,13,14,0) 100%)}}
.dim{{position:absolute;inset:0;background:rgba(12,13,14,.5)}}
.floor{{position:absolute;left:0;top:1120px;width:{W}px;height:800px;
  background:linear-gradient(180deg,rgba(12,13,14,0) 0%,rgba(12,13,14,.55) 40%,rgba(12,13,14,.75) 100%)}}
.head{{position:absolute;left:72px;top:176px;right:72px}}
.year{{font-weight:900;font-size:176px;line-height:1;letter-spacing:-5px;font-variant-numeric:tabular-nums;white-space:nowrap}}
.title{{font-weight:700;font-size:60px;line-height:1.25;margin-top:20px}}
.title::before{{content:"";display:inline-block;width:14px;height:52px;background:{GOLD};margin-right:20px;vertical-align:-6px}}
.hero{{position:absolute;left:66px;right:60px;top:600px}}
.hero b{{display:block;font-weight:900;font-size:240px;line-height:1;letter-spacing:-6px;color:{GOLD};white-space:nowrap}}
.hero small{{display:block;font-weight:700;font-size:46px;line-height:1.4;margin:28px 0 0 8px}}
.card{{position:absolute;left:72px;right:72px;padding:22px 34px;background:rgba(12,13,14,.82);border-left:10px solid {GOLD}}}
.card i{{display:block;font-style:normal;font-weight:700;font-size:36px;line-height:1.4;color:{GOLD}}}
.card b{{display:block;font-weight:900;font-size:68px;line-height:1.2}}
.card small{{display:block;font-weight:500;font-size:38px;line-height:1.5;color:{MUTED};margin-top:4px}}
.card.q{{padding:16px 30px}}
.card.q i{{font-size:32px}}
.card.q b{{font-size:56px}}
.dots{{position:absolute;left:72px;right:60px}}
.dots span{{display:inline-block;box-sizing:border-box;border:5px solid {INK};background:rgba(12,13,14,.6);margin-right:12px}}
.dots small{{display:block;margin-top:18px;font-weight:700;font-size:44px;text-shadow:0 2px 6px #000}}
.rows{{position:absolute;left:72px;right:72px;top:540px}}
.rows div{{display:flex;gap:26px;align-items:baseline;padding:14px 0 14px 26px;margin-bottom:16px;border-left:6px solid {GOLD};background:rgba(12,13,14,.74)}}
.rows div.alarm{{border-left-color:{RED}}}
.rows b{{font-weight:900;font-size:46px;white-space:nowrap}}
.rows span{{font-weight:700;font-size:42px;color:{MUTED};white-space:nowrap}}
.rivals{{position:absolute;left:72px;right:72px;top:730px;display:flex;gap:28px}}
.rivals > div{{flex:1;padding:22px 26px 26px;background:rgba(12,13,14,.84);border-top:10px solid {GOLD}}}
.rivals > div + div{{border-top-color:{RED}}}
.rivals i{{display:block;font-style:normal;font-weight:700;font-size:34px;color:{MUTED}}}
.rivals b{{display:block;font-weight:900;font-size:46px;line-height:1.3;margin:10px 0 14px}}
.rivals small{{display:block;font-weight:700;font-size:30px;line-height:1.4;color:{MUTED}}}
.vs{{position:absolute;left:504px;top:840px;width:72px;text-align:center;font-weight:900;font-size:40px;line-height:72px;background:{INK};color:#111314;border-radius:50%}}
.final{{position:absolute;left:72px;right:72px;top:1072px;font-weight:900;font-size:44px;line-height:1.3;color:{GOLD};text-shadow:0 2px 6px #000}}
.credit{{position:absolute;left:72px;right:72px;top:1384px;font-size:24px;line-height:1.4;color:{MUTED};text-shadow:0 1px 2px #000}}
"""


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


def show(tl, sel, t, dx=0, dy=14, dur=.4):
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,x:{dx},y:{dy}}},{{opacity:1,x:0,y:0,duration:{dur},ease:'power3.out'}},{r(max(t, .05))});")


def hide(tl, sel, t):
    tl.append(f"tl.to('{sel}',{{opacity:0,duration:.25,ease:'none'}},{r(t)});")


def scene_html(i, s):
    sid = f"scene-{i}"
    d = slots[i]
    tl = []
    z0, z1, dx, dy = s["push"]
    tl.append(f"tl.fromTo('#{sid}-cam',{{scale:{z0},x:0,y:0}},{{scale:{z1},x:{dx},y:{dy},duration:{r(d)},ease:'none'}},0);")
    body = [f'<div id="{sid}-cam" class="cam" data-layout-allow-overflow><img id="{sid}-photo" class="photo" src="assets/photos/{s["photo"]}.jpg" alt="{esc(s["place"])}"></div>',
            '<div class="dim"></div>' if s.get("dim") else "", '<div class="scrim"></div><div class="floor"></div>']
    body.append(f'<div class="head" id="{sid}-head"><div class="year" id="{sid}-year">{esc(s["year"])}</div>'
                f'<div class="title" id="{sid}-title">{esc(s["title"])}</div></div>')
    if i > 0:  # every scene after the cover lands its header on the cut
        show(tl, f"#{sid}-year", .05, dx=-30, dy=0, dur=.45)
        show(tl, f"#{sid}-title", .25, dx=-24, dy=0, dur=.45)

    if s.get("hero"):  # the cover: static, readable on frame 0
        h = s["hero"]
        body.append(f'<div class="hero"><b>{esc(h["big"])}</b><small>{esc(h["sub"])}</small></div>')
    if s.get("dots"):  # one square per judge; the gold ones were sworn in before the president
        q = s["dots"]
        size = 46 if q["n"] > 10 else 92
        body.append(f'<div class="dots" style="top:{q.get("top", 560)}px">'
                    + "".join(f'<span class="{sid}-d{" " + sid + "-g" if k < q["gold"] else ""}" style="width:{size}px;height:{size}px"></span>' for k in range(q["n"]))
                    + f'<small id="{sid}-dl">{esc(q["label"])}</small></div>')
        tl.append(f"tl.fromTo('.{sid}-d',{{opacity:0,scale:.4}},{{opacity:1,scale:1,duration:.3,ease:'back.out(2)',stagger:.05}},{r(q['t'])});")
        if q["gold"]:
            tl.append(f"tl.fromTo('.{sid}-g',{{backgroundColor:'rgba(12,13,14,.6)',borderColor:'{INK}'}},{{backgroundColor:'{GOLD}',borderColor:'{GOLD}',duration:.2,ease:'none',stagger:.12}},{r(q['tg'])});")
        show(tl, f"#{sid}-dl", q["tl"])
    for k, c in enumerate(s.get("cards", [])):
        kicker, name, sub, t, top = c[:5]
        body.append(f'<div class="card" id="{sid}-k{k}" style="top:{top}px"><i>{esc(kicker)}</i><b>{esc(name)}</b>'
                    + (f'<small>{esc(sub)}</small>' if sub else "") + '</div>')
        show(tl, f"#{sid}-k{k}", t, dx=-30, dy=0)
        if len(c) > 5:
            hide(tl, f"#{sid}-k{k}", c[5])
    if s.get("rows"):
        body.append('<div class="rows">' + "".join(
            f'<div id="{sid}-r{k}"{" class=alarm" if len(row) > 3 else ""}><b>{esc(row[0])}</b><span>{esc(row[1])}</span></div>'
            for k, row in enumerate(s["rows"])) + '</div>')
        for k, row in enumerate(s["rows"]):
            show(tl, f"#{sid}-r{k}", row[2], dx=-40, dy=0)
    for k, (kicker, quote, t) in enumerate(s.get("quotes", [])):
        body.append(f'<div class="card q" id="{sid}-q{k}" style="top:{520 + k * 172}px"><i>{esc(kicker)}</i><b>{esc(quote)}</b></div>')
        show(tl, f"#{sid}-q{k}", t, dx=-30, dy=0)
    if s.get("rivals"):
        t = s["rivals"]
        body.append(f'<div class="rivals">' + "".join(
            f'<div id="{sid}-v{k}"><i>{esc(post)}</i><b>{name}</b><small>{esc(who)}</small></div>'
            for k, (post, name, who) in enumerate(RIVALS)) + f'</div><div class="vs" id="{sid}-vs">VS</div>')
        show(tl, f"#{sid}-v0", t, dx=-40, dy=0)
        show(tl, f"#{sid}-v1", t + .25, dx=40, dy=0)
        tl.append(f"tl.fromTo('#{sid}-vs',{{opacity:0,scale:.3}},{{opacity:1,scale:1,duration:.35,ease:'back.out(2)'}},{r(t + .5)});")
    if s.get("final"):
        text, t = s["final"]
        body.append(f'<div class="final" id="{sid}-final">{esc(text)}</div>')
        show(tl, f"#{sid}-final", t, dy=20, dur=.45)

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
                cut = min((wp - p for wp, _ in pos if p < wp < p + len(q)), key=lambda c: abs(c - len(q) / 2))
                raw = 0  # map the cut in the normalised phrase back onto the phrase with its "-"
                for k, ch in enumerate(ph):
                    if raw == cut and ch.isalnum():
                        cut_raw = k; break
                    raw += ch.isalnum()
                timed.append((starts[i] + t, ph[:cut_raw]))
                timed.append((starts[i] + next(tm for wp, tm in pos if wp >= p + cut), ph[cut_raw:]))
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
    """Single-frame release cover (npm run render:still): the building and the two rival leaderships."""
    css = CSS.replace("url('assets/", "url('../assets/")
    (P / "poster").mkdir(exist_ok=True)
    (P / "poster" / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>波兰宪法法院之争 · 封面</title>
<script src="../assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}{css}
.cover-cam{{transform:scale(1.04)}}
.kicker{{position:absolute;left:72px;top:190px;font-weight:700;font-size:40px;letter-spacing:8px;color:{MUTED}}}
.big{{position:absolute;left:66px;top:250px;font-weight:900;font-size:136px;line-height:1.15;letter-spacing:-2px}}
.big em{{font-style:normal;color:{GOLD}}}
.rivals{{top:820px}}
.vs{{top:930px}}
.final{{top:1180px}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="poland-tribunal-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="cam cover-cam"><img class="photo" src="../assets/photos/tk_winter.jpg" alt="波兰宪法法院"></div>
<div class="dim" style="background:rgba(12,13,14,.45)"></div>
<div class="scrim" style="height:1400px"></div>
<div class="kicker">2026 年 10 月 · 华沙</div>
<div class="big">波兰宪法法院<br><em>“政变”</em>之争</div>
<div class="rivals">{"".join(f'<div><i>{esc(post)}</i><b>{name}</b><small>{esc(who)}</small></div>' for post, name, who in RIVALS)}</div><div class="vs">VS</div>
<div class="final">同一座法院 · 两套领导层</div>
<div class="credit" data-layout-ignore>华沙 · 波兰宪法法院 · 照片 Adrian Grycuk / Wikimedia Commons · CC BY-SA 3.0 PL</div>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["poland-tribunal-poster"]=gsap.timeline({{paused:true}});
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
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789+—·.,/%“”？年月日")
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
               f".cap span{{display:inline-block;max-width:900px;padding:10px 22px;background:rgba(12,13,14,.76);border-radius:8px;"
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
<title>波兰宪法法院之争</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#111314}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="poland-tribunal" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>
<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{r(sum(durs))}" data-track-index="3" data-volume="1"></audio>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["poland-tribunal"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")
    build_poster()
    subset_fonts()
    print(f"Built {len(SCENES)} scenes, {len(groups)} caption groups, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
