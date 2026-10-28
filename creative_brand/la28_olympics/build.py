"""Build the HyperFrames composition from the music's beat grid.

Inputs: assets/music/{karma.mp3, beats.json} (scripts/prepare_music.py) and the cropped photos in
assets/photos/ (scripts/prepare_photos.py). Writes index.html, compositions/scene-*.html and
poster/index.html. No voiceover and no captions: every cut and every reveal lands on a beat.
"""
import html
import json
import re
from pathlib import Path

P = Path(__file__).resolve().parent
B = json.loads((P / "assets" / "music" / "beats.json").read_text())["beats"]  # B[k]: beat k, seconds from the film start
W, H = 1080, 1920
SUN, INK, MUTED, SHADE = "#ff6b35", "#fff8ef", "#e4ddd3", "12,14,20"
# Scene k runs from beat CUTS[k] to CUTS[k + 1]: intro (0-16) carries the history, the build (16-32)
# the 2028 date, and the drop (beat 32) cuts to SoFi.
CUTS = [0, 8, 16, 32, 40, 48, 56, 68]
TOTAL = B[CUTS[-1]]

PHOTOS = {  # file: (credit, licence) — see SOURCES.md
    "gate": ("Michael Barera", "CC BY-SA 4.0"),
    "games1932": ("Le Miroir des sports", "公有领域"),
    "games1984": ("Ken Hackman, U.S. Air Force", "公有领域"),
    "aerial": ("Ron Reiring", "CC BY 2.0"),
    "sofi": ("Thank You (21 Millions+) views", "CC BY 2.0"),
    "venice": ("Blake Everett", "CC0"),
    "downtown": ("Camiloarenivar", "CC BY-SA 4.0"),
    "peristyle": ("Anthony Kernich", "CC BY 2.0"),
}

FONT = "'Noto Sans SC', sans-serif"
FONT_FILES = {400: "Regular", 700: "Bold"}  # system Noto Sans CJK, subset to the characters this film uses
FONT_FACE = "".join(
    f"@font-face{{font-family:'Noto Sans SC';src:url('assets/fonts/noto-sans-sc-{w}.woff2') format('woff2');"
    f"font-weight:{'100 500' if w == 400 else '600 900'};font-display:block}}" for w in FONT_FILES)
CSS = FONT_FACE + f"""
#root{{position:absolute;inset:0;overflow:hidden;background:#0c0e14;font-family:{FONT};color:{INK}}}
.stage{{position:absolute;inset:0;overflow:hidden}}
.cam{{position:absolute;left:-108px;top:-192px;width:1296px;height:2304px;transform-origin:50% 50%}}
.photo{{position:absolute;inset:0;width:100%;height:100%}}
.scrim{{position:absolute;left:0;top:0;width:{W}px;
  background:linear-gradient(180deg,rgba({SHADE},.9) 0%,rgba({SHADE},.74) 55%,rgba({SHADE},0) 100%)}}
.mask{{overflow:hidden;padding-bottom:.06em}}
.mask>div{{will-change:transform}}
.head{{position:absolute;left:72px;right:72px;top:176px}}
.big{{font-weight:900;font-size:200px;line-height:1;letter-spacing:-6px;font-variant-numeric:tabular-nums}}
.sub{{font-weight:700;font-size:64px;line-height:1.3;margin-top:14px}}
.sub::before{{content:"";display:inline-block;width:14px;height:56px;background:{SUN};margin-right:22px;vertical-align:-7px}}
.sun{{color:{SUN}}}
.years{{position:absolute;left:66px;top:176px}}
.years .big{{font-size:190px;line-height:1.02}}
.cover-title{{position:absolute;left:72px;top:800px;font-weight:900;font-size:104px;line-height:1.2}}
.half{{position:absolute;left:0;width:{W}px;overflow:hidden}}
.half .cam{{left:-54px;top:-8px;width:1188px;height:1056px}}
.half.top .cam{{top:-88px}}
.half .shade{{position:absolute;left:0;top:0;width:{W}px;height:480px;
  background:linear-gradient(180deg,rgba({SHADE},.82) 0%,rgba({SHADE},.5) 55%,rgba({SHADE},0) 100%)}}
.half .lab{{position:absolute;left:72px}}
.half .lab .tag{{font-weight:700;font-size:52px;line-height:1.3;margin-top:6px}}
.pin{{position:absolute;width:0;height:0}}
.pin i{{position:absolute;left:-16px;top:-16px;width:32px;height:32px;border-radius:50%;background:{SUN};box-shadow:0 0 0 7px rgba(255,248,239,.92)}}
.pin span{{position:absolute;left:38px;top:-42px;white-space:nowrap;font-weight:900;font-size:58px;line-height:84px;padding:0 22px;
  background:rgba({SHADE},.82);color:{INK}}}
.cities{{position:absolute;left:72px;right:72px;top:640px}}
.city{{display:flex;align-items:baseline;gap:30px;padding:18px 0 18px 28px;border-left:10px solid rgba(255,248,239,.5);margin-bottom:22px;
  background:linear-gradient(90deg,rgba({SHADE},.9),rgba({SHADE},.35))}}
.city b{{font-weight:900;font-size:76px;line-height:1.15;min-width:250px}}
.city span{{font-weight:700;font-size:54px;line-height:1.15;font-variant-numeric:tabular-nums}}
.city.la{{border-left-color:{SUN}}}
.city.la b,.city.la em{{color:{SUN};font-style:normal}}
.steps{{position:absolute;left:72px;top:640px;display:flex;align-items:center;gap:34px}}
.step{{padding:20px 34px;background:rgba({SHADE},.84)}}
.step b{{display:block;font-weight:900;font-size:84px;line-height:1.1}}
.step.to b{{color:{SUN}}}
.arrow{{width:110px;height:8px;background:{SUN};position:relative}}
.arrow::after{{content:"";position:absolute;right:-6px;top:-12px;border:16px solid transparent;border-left:20px solid {SUN}}}
.sports{{position:absolute;left:72px;right:72px;top:560px}}
.sport{{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;margin-bottom:20px;
  background:rgba({SHADE},.86);border-left:12px solid {SUN}}}
.sport b{{font-weight:900;font-size:76px;line-height:1.15}}
.sport span{{font-weight:900;font-size:40px;line-height:1.2;padding:6px 18px;color:#0c0e14;background:{INK}}}
.sport.debut span{{background:{SUN}}}
.hero{{position:absolute;left:62px;right:60px;top:176px}}
.hero b{{display:block;font-weight:900;font-size:330px;line-height:.95;letter-spacing:-14px;color:{SUN};font-variant-numeric:tabular-nums}}
.quota{{position:absolute;left:72px;right:72px;top:760px}}
.bar{{display:flex;align-items:center;gap:24px;margin-bottom:22px}}
.bar label{{width:120px;font-weight:900;font-size:56px}}
.bar i{{display:block;height:76px;background:{INK}}}
.bar.w i{{background:{SUN}}}
.bar span{{font-weight:900;font-size:58px;font-variant-numeric:tabular-nums}}
.flag{{display:inline-block;margin-top:22px;padding:10px 26px;font-weight:900;font-size:60px;background:{SUN};color:#0c0e14}}
.end{{position:absolute;left:72px;right:72px;top:176px}}
.end .city-name{{font-weight:900;font-size:160px;line-height:1.05}}
.end .yr{{font-weight:900;font-size:330px;line-height:.95;letter-spacing:-14px;color:{SUN};font-variant-numeric:tabular-nums}}
.end .dates{{font-weight:900;font-size:100px;line-height:1.2;margin-top:20px;font-variant-numeric:tabular-nums}}
.end .ord{{font-weight:700;font-size:50px;line-height:1.4;margin-top:6px;color:{MUTED}}}
.end .see{{display:inline-block;margin-top:36px;padding:12px 34px;font-weight:900;font-size:92px;background:{SUN};color:#0c0e14}}
.credit{{position:absolute;left:72px;right:72px;top:1384px;font-size:24px;line-height:1.4;color:{MUTED};text-shadow:0 1px 2px #000}}
"""


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


# Motion vocabulary, all seek-safe fromTo tweens on the scene's one paused timeline.
def slam(tl, sel, t, s0=1.35, origin="0% 100%"):
    """A word lands on the beat: scale down onto its mark."""
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,scale:{s0},transformOrigin:'{origin}'}},"
              f"{{opacity:1,scale:1,duration:.28,ease:'expo.out'}},{r(max(t, 0))});")


def rise(tl, sel, t, dur=.42):
    """A line rises out of its mask."""
    tl.append(f"tl.fromTo('{sel}',{{yPercent:110}},{{yPercent:0,duration:{dur},ease:'power4.out'}},{r(max(t, 0))});")


def slide(tl, sel, t, dx=-80, dur=.32):
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,x:{dx}}},{{opacity:1,x:0,duration:{dur},ease:'power3.out'}},{r(max(t, 0))});")


def out(tl, sel, t, dur=.2):
    tl.append(f"tl.to('{sel}',{{opacity:0,duration:{dur},ease:'none'}},{r(t)});")


def grow(tl, sel, t, dur=.6):
    tl.append(f"tl.fromTo('{sel}',{{scaleX:0,transformOrigin:'0 50%'}},{{scaleX:1,duration:{dur},ease:'power3.out'}},{r(t)});")


def masked(id_, inner, cls=""):
    return f'<div class="mask"><div id="{id_}" class="{cls}">{inner}</div></div>'


def photo(sid, name, alt, tl, z, d, cls="cam"):
    """The photo and its camera: an entry move (z0 -> z1 over `zin` s), then a slow drift to z2."""
    z0, z1, z2, zin = z
    sel = f"#{sid}-{name}-cam"
    tl.append(f"tl.fromTo('{sel}',{{scale:{z0}}},{{scale:{z1},duration:{r(zin)},ease:'expo.out'}},0);")
    tl.append(f"tl.to('{sel}',{{scale:{z2},duration:{r(d - zin)},ease:'none'}},{r(zin)});")
    return (f'<div id="{sid}-{name}-cam" class="{cls}" data-layout-allow-overflow>'
            f'<img id="{sid}-{name}" class="photo" src="assets/photos/{name}.jpg" alt="{esc(alt)}"></div>')


def credit(names, place=""):
    parts = [f"{esc(PHOTOS[n][0])} · {esc(PHOTOS[n][1])}" for n in names]
    lead = f"{esc(place)} · " if place else ""
    return f'<div class="credit" data-layout-ignore>{lead}照片 {" / ".join(parts)} · Wikimedia Commons</div>'


def scrim(h):
    return f'<div class="scrim" style="height:{h}px"></div>'


# Scene builders: b(k) is beat k in scene time. Each returns the body html and fills `tl`.
def s0(sid, d, b, tl):
    """Cover: the Coliseum gate; 1932 is there at frame 0, 1984 and 2028 land on the beats."""
    body = [photo(sid, "gate", "洛杉矶纪念体育场大门", tl, (1.14, 1.06, 1.0, 1.2), d), scrim(1100)]
    body.append(f'<div class="years">{masked(f"{sid}-y0", "1932", "big")}{masked(f"{sid}-y1", "1984", "big")}'
                f'{masked(f"{sid}-y2", "2028", "big sun")}</div>'
                f'<div class="cover-title">{masked(f"{sid}-t", "洛杉矶奥运会")}</div>')
    rise(tl, f"#{sid}-y1", b(2))
    slam(tl, f"#{sid}-y2", b(4))
    rise(tl, f"#{sid}-t", b(6))
    body.append(credit(["gate"], "洛杉矶纪念体育场"))
    return body


def s1(sid, d, b, tl):
    """Both halves wipe in on the cut (1932 from the left, 1984 from the right); each year lands on its own beat."""
    body = [f'<div class="half top" id="{sid}-top" style="top:0;height:880px">{photo(sid, "games1932", "1932 年奥运会开幕式", tl, (1.2, 1.04, 1.0, .6), d)}'
            f'<div class="shade"></div><div class="lab" style="top:176px">{masked(f"{sid}-a", "1932", "big")}'
            f'{masked(f"{sid}-as", "第 10 届", "tag")}</div></div>',
            f'<div class="half" id="{sid}-low" style="top:880px;height:1040px">{photo(sid, "games1984", "1984 年奥运会男子 400 米", tl, (1.08, 1.08, 1.0, .1), d)}'
            f'<div class="shade"></div><div class="lab" style="top:40px">{masked(f"{sid}-b", "1984", "big")}'
            f'{masked(f"{sid}-bs", "第 23 届", "tag")}</div></div>']
    tl.append(f"tl.fromTo('#{sid}-top',{{clipPath:'inset(0 100% 0 0)'}},{{clipPath:'inset(0 0% 0 0)',duration:.4,ease:'expo.out'}},0);")
    tl.append(f"tl.fromTo('#{sid}-low',{{clipPath:'inset(0 0 0 100%)'}},{{clipPath:'inset(0 0 0 0%)',duration:.4,ease:'expo.out'}},.08);")
    rise(tl, f"#{sid}-a", .05)
    rise(tl, f"#{sid}-as", b(1))
    rise(tl, f"#{sid}-b", b(4))
    rise(tl, f"#{sid}-bs", b(5))
    body.append('<div class="credit" data-layout-ignore style="top:1840px">照片 Le Miroir des sports（1932）/ Ken Hackman, USAF（1984）· 公有领域 · Wikimedia Commons</div>')
    return body


def s2(sid, d, b, tl):
    """The build: the Coliseum from the air, 7.14, the third opening, then the three three-time hosts."""
    body = [photo(sid, "aerial", "洛杉矶纪念体育场航拍", tl, (1.25, 1.08, 1.0, .7), d), scrim(1000)]
    body.append(f'<div class="head" id="{sid}-head">{masked(f"{sid}-big", "7.14", "big sun")}'
                f'{masked(f"{sid}-sub", "2028 · 第 3 次开幕", "sub")}</div>')
    slam(tl, f"#{sid}-big", 0)
    rise(tl, f"#{sid}-sub", b(2))
    body.append(f'<div class="pin" style="left:640px;top:900px"><div id="{sid}-pin"><i></i><span>纪念体育场</span></div></div>')
    tl.append(f"tl.fromTo('#{sid}-pin',{{opacity:0,scale:.5,transformOrigin:'0 0'}},{{opacity:1,scale:1,duration:.35,ease:'back.out(2.2)'}},{r(b(4))});")
    out(tl, f"#{sid}-pin", b(8) - .2)
    rows = [("伦敦", "1908 · 1948 · 2012"), ("巴黎", "1900 · 1924 · 2024"), ("洛杉矶", "1932 · 1984 · <em>2028</em>")]
    body.append('<div class="cities">' + "".join(
        f'<div class="city{" la" if k == 2 else ""}" id="{sid}-c{k}"><b>{n}</b><span>{y}</span></div>'
        for k, (n, y) in enumerate(rows)) + '</div>')
    for k in range(3):
        slide(tl, f"#{sid}-c{k}", b(8 + 2 * k))
    return body


def s3(sid, d, b, tl):
    """The drop: punch into SoFi; the same night's second opening; the football field becomes the pool."""
    body = [photo(sid, "sofi", "SoFi 体育场内景", tl, (1.35, 1.06, 1.0, .5), d), scrim(1100)]
    body.append(f'<div class="head">{masked(f"{sid}-big", "SoFi", "big")}{masked(f"{sid}-sub", "同一晚 · 同时开幕", "sub")}</div>')
    slam(tl, f"#{sid}-big", 0, s0=1.6)
    rise(tl, f"#{sid}-sub", b(2))
    body.append(f'<div class="steps"><div class="step" id="{sid}-s0"><b>橄榄球场</b></div>'
                f'<div class="arrow" id="{sid}-arrow"></div><div class="step to" id="{sid}-s1"><b>游泳</b></div></div>')
    slide(tl, f"#{sid}-s0", b(4))
    grow(tl, f"#{sid}-arrow", b(5), dur=.35)
    slam(tl, f"#{sid}-s1", b(6), origin="50% 50%")
    body.append(credit(["sofi"], "SoFi 体育场"))
    return body


def s4(sid, d, b, tl):
    """Venice Beach wipes up from below; five sports, one per beat."""
    body = [f'<div class="stage" id="{sid}-stage">{photo(sid, "venice", "威尼斯海滩", tl, (1.15, 1.04, 1.0, .6), d)}{scrim(1180)}</div>']
    tl.append(f"tl.fromTo('#{sid}-stage',{{clipPath:'inset(100% 0 0 0)'}},{{clipPath:'inset(0% 0 0 0)',duration:.4,ease:'expo.out'}},0);")
    body.append(f'<div class="head">{masked(f"{sid}-big", "+5", "big sun")}{masked(f"{sid}-sub", "个新项目", "sub")}</div>')
    slam(tl, f"#{sid}-big", .05)
    rise(tl, f"#{sid}-sub", b(1) - .15)
    sports = [("腰旗橄榄球", "首次"), ("壁球", "首次"), ("板球", "回归"), ("长曲棍球", "回归"), ("棒垒球", "回归")]
    body.append('<div class="sports">' + "".join(
        f'<div class="sport{" debut" if tag == "首次" else ""}" id="{sid}-p{k}"><b>{n}</b><span>{tag}</span></div>'
        for k, (n, tag) in enumerate(sports)) + '</div>')
    for k in range(5):
        slide(tl, f"#{sid}-p{k}", b(1 + k), dx=-120, dur=.28)
    body.append(credit(["venice"], "威尼斯海滩"))
    return body


def s5(sid, d, b, tl):
    """Downtown at night: 351 counts up over two beats, then the quota bars, women ahead."""
    body = [photo(sid, "downtown", "洛杉矶市中心夜景", tl, (1.2, 1.05, 1.0, .6), d), scrim(1300)]
    body.append(f'<div class="hero"><b id="{sid}-num">0</b>{masked(f"{sid}-sub", "个小项 · 历届最多", "sub")}</div>')
    tl.append(f"tl.fromTo('#{sid}-num',{{opacity:0}},{{opacity:1,duration:.12,ease:'none'}},0);")
    tl.append(f"{{const c={{v:0}};tl.to(c,{{v:351,duration:{r(b(2))},ease:'power3.out',"
              f"onUpdate:()=>{{document.querySelector('#{sid}-num').textContent=Math.round(c.v)}}}},0);}}")
    rise(tl, f"#{sid}-sub", b(2))
    women, men = 5655, 5543
    scale = 600 / women
    body.append(f'<div class="quota"><div class="bar w" id="{sid}-w"><label>女子</label><i id="{sid}-wb" style="width:{round(women * scale)}px"></i><span>{women:,}</span></div>'
                f'<div class="bar" id="{sid}-m"><label>男子</label><i id="{sid}-mb" style="width:{round(men * scale)}px"></i><span>{men:,}</span></div>'
                f'<div class="flag" id="{sid}-ft">参赛名额 女子首次更多</div></div>')
    for k, sel in enumerate(("w", "m")):
        slide(tl, f"#{sid}-{sel}", b(4 + k), dx=-40, dur=.25)
        grow(tl, f"#{sid}-{sel}b", b(4 + k))
    slam(tl, f"#{sid}-ft", b(6))
    body.append(credit(["downtown"], "洛杉矶市中心"))
    return body


def s6(sid, d, b, tl):
    """End card: the Coliseum peristyle irises open; city, year, dates and the sign-off land on the beats."""
    body = [f'<div class="stage" id="{sid}-stage">{photo(sid, "peristyle", "洛杉矶纪念体育场柱廊", tl, (1.2, 1.06, 1.0, .8), d)}{scrim(1450)}</div>']
    tl.append(f"tl.fromTo('#{sid}-stage',{{clipPath:'circle(0% at 50% 45%)'}},{{clipPath:'circle(75% at 50% 45%)',duration:.5,ease:'expo.out'}},0);")
    body.append(f'<div class="end">{masked(f"{sid}-c", "洛杉矶", "city-name")}<div class="yr" id="{sid}-y">2028</div>'
                f'{masked(f"{sid}-d", "7.14 — 7.30", "dates")}{masked(f"{sid}-o", "第 34 届夏季奥运会", "ord")}'
                f'<div class="see" id="{sid}-s">洛杉矶见</div></div>')
    rise(tl, f"#{sid}-c", .05)
    slam(tl, f"#{sid}-y", b(1), s0=1.5)
    rise(tl, f"#{sid}-d", b(3))
    rise(tl, f"#{sid}-o", b(4))
    tl.append(f"tl.fromTo('#{sid}-s',{{clipPath:'inset(0 100% 0 0)'}},{{clipPath:'inset(0 0% 0 0)',duration:.4,ease:'expo.out'}},{r(b(6))});")
    body.append(credit(["peristyle"], "洛杉矶纪念体育场"))
    return body


SCENES = [s0, s1, s2, s3, s4, s5, s6]


def scene_html(i, build_body):
    sid = f"scene-{i}"
    t0, d = B[CUTS[i]], B[CUTS[i + 1]] - B[CUTS[i]]
    tl = []
    body = build_body(sid, d, lambda k: B[CUTS[i] + k] - t0, tl)
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


def build_poster():
    """Single-frame release cover (npm run render:still): the Coliseum gate and its three years."""
    css = CSS.replace("url('assets/", "url('../assets/")
    (P / "poster").mkdir(exist_ok=True)
    (P / "poster" / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>洛杉矶 2028 奥运会 · 封面</title>
<script src="../assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}{css}
.cover-cam{{transform:scale(1.03)}}
.cover-sub{{position:absolute;left:72px;top:950px;font-weight:700;font-size:50px;line-height:1.4}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="la28-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="cam cover-cam"><img class="photo" src="../assets/photos/gate.jpg" alt="洛杉矶纪念体育场大门"></div>
{scrim(1200)}
<div class="years"><div class="big">1932</div><div class="big">1984</div><div class="big sun">2028</div></div>
<div class="cover-title">洛杉矶奥运会</div>
<div class="cover-sub">7.14 — 7.30 · 第三次在这里开幕</div>
{credit(["gate"], "洛杉矶纪念体育场")}
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["la28-poster"]=gsap.timeline({{paused:true}});
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
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789,—·.+")
    out_dir = P / "assets" / "fonts"; out_dir.mkdir(parents=True, exist_ok=True)
    for weight, style in FONT_FILES.items():
        ttc = TTCollection(f"/usr/share/fonts/opentype/noto/NotoSansCJK-{style}.ttc")
        font = next(f for f in ttc.fonts if f["name"].getDebugName(1) == "Noto Sans CJK SC")
        opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]
        sub = subset.Subsetter(opts); sub.populate(text="".join(sorted(chars))); sub.subset(font)
        font.flavor = "woff2"; font.save(out_dir / f"noto-sans-sc-{weight}.woff2")


def build():
    comp = P / "compositions"
    comp.mkdir(exist_ok=True)
    for old in comp.glob("*.html"):
        old.unlink()
    for i, s in enumerate(SCENES):
        (comp / f"scene-{i}.html").write_text(scene_html(i, s), encoding="utf-8")
    hosts = "\n".join(
        f'<div id="scene-{i}" data-composition-id="scene-{i}" data-composition-src="compositions/scene-{i}.html" '
        f'data-start="{r(B[CUTS[i]])}" data-duration="{r(B[CUTS[i + 1]] - B[CUTS[i]])}" data-track-index="1" data-track-kind="graphics" '
        f'data-width="{W}" data-height="{H}"></div>' for i in range(len(SCENES)))
    (P / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>洛杉矶 2028 奥运会</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#0c0e14}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="la28-olympics" data-start="0" data-duration="{r(TOTAL)}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<audio id="music" src="assets/music/karma.mp3" data-start="0" data-duration="{r(TOTAL)}" data-track-index="2" data-volume="1"></audio>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["la28-olympics"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")
    build_poster()
    subset_fonts()
    print(f"Built {len(SCENES)} scenes on {CUTS[-1]} beats, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
