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
TAIL = 2.0  # hold on the end card after the narration ends
starts = [sum(durs[:i]) for i in range(len(durs))]
slots = [d + (TAIL if i == len(durs) - 1 else 0) for i, d in enumerate(durs)]
TOTAL = round(sum(slots), 3)
W, H = 1080, 1920
SUN, INK, MUTED, SHADE = "#ff6b35", "#fff8ef", "#e4ddd3", "12,14,20"

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


def at(scene, word, nth=0):
    """Seconds from the scene start at which the narration says `word`."""
    hits = [m["start"] for m in marks[scene] if m["text"] == word]
    if len(hits) <= nth:
        raise SystemExit(f"scene {scene}: no word mark '{word}' (#{nth})")
    return hits[nth]


FONT = "'Noto Sans SC', sans-serif"
FONT_FILES = {400: "Regular", 700: "Bold"}  # system Noto Sans CJK, subset to the characters this film uses
FONT_FACE = "".join(
    f"@font-face{{font-family:'Noto Sans SC';src:url('assets/fonts/noto-sans-sc-{w}.woff2') format('woff2');"
    f"font-weight:{'100 500' if w == 400 else '600 900'};font-display:block}}" for w in FONT_FILES)
CSS = FONT_FACE + f"""
#root{{position:absolute;inset:0;overflow:hidden;background:#0c0e14;font-family:{FONT};color:{INK}}}
.cam{{position:absolute;left:-108px;top:-192px;width:1296px;height:2304px;transform-origin:50% 50%}}
.photo{{position:absolute;inset:0;width:100%;height:100%}}
.scrim{{position:absolute;left:0;top:0;width:{W}px;
  background:linear-gradient(180deg,rgba({SHADE},.9) 0%,rgba({SHADE},.74) 55%,rgba({SHADE},0) 100%)}}
.floor{{position:absolute;left:0;top:1120px;width:{W}px;height:800px;
  background:linear-gradient(180deg,rgba({SHADE},0) 0%,rgba({SHADE},.5) 40%,rgba({SHADE},.72) 100%)}}
.head{{position:absolute;left:72px;top:176px;right:72px}}
.big{{font-weight:900;font-size:176px;line-height:1;letter-spacing:-5px;font-variant-numeric:tabular-nums}}
.title{{font-weight:700;font-size:60px;line-height:1.25;margin-top:20px}}
.title::before{{content:"";display:inline-block;width:14px;height:52px;background:{SUN};margin-right:20px;vertical-align:-6px}}
.years{{position:absolute;left:66px;top:176px}}
.years div{{display:flex;align-items:baseline;gap:30px;font-weight:900;font-size:170px;line-height:1.02;letter-spacing:-5px}}
.years div.now{{color:{SUN}}}
.years span{{font-weight:700;font-size:44px;letter-spacing:0;color:{MUTED}}}
.cover-title{{position:absolute;left:72px;top:760px;font-weight:900;font-size:96px;line-height:1.2}}
.half{{position:absolute;left:0;width:{W}px;overflow:hidden}}
.half .cam{{left:-54px;top:-8px;width:1188px;height:1056px}}
.half.top .cam{{top:-88px}}
.half .shade{{position:absolute;left:0;top:0;width:{W}px;height:520px;
  background:linear-gradient(180deg,rgba({SHADE},.86) 0%,rgba({SHADE},.6) 50%,rgba({SHADE},0) 100%)}}
.half .lab{{position:absolute;left:72px}}
.half .lab span{{display:block;font-weight:700;font-size:48px;line-height:1.3;margin-top:10px}}
.pin{{position:absolute;width:0;height:0}}
.pin i{{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;background:{SUN};box-shadow:0 0 0 6px rgba(255,248,239,.92)}}
.pin span{{position:absolute;left:34px;top:-40px;white-space:nowrap;font-weight:900;font-size:54px;line-height:80px;padding:0 20px;
  background:rgba({SHADE},.8);color:{INK}}}
.cities{{position:absolute;left:72px;right:72px;top:600px}}
.city{{display:flex;align-items:baseline;gap:30px;padding:16px 0 16px 26px;border-left:8px solid rgba(255,248,239,.5);margin-bottom:22px;
  background:linear-gradient(90deg,rgba({SHADE},.88),rgba({SHADE},.35))}}
.city b{{font-weight:900;font-size:64px;line-height:1.2;min-width:210px}}
.city span{{font-weight:700;font-size:52px;line-height:1.2;font-variant-numeric:tabular-nums}}
.city.la{{border-left-color:{SUN}}}
.city.la span em{{font-style:normal;color:{SUN}}}
.steps{{position:absolute;left:72px;top:620px;display:flex;align-items:center;gap:30px}}
.step{{padding:18px 30px;background:rgba({SHADE},.82)}}
.step b{{display:block;font-weight:900;font-size:76px;line-height:1.1}}
.step span{{display:block;font-weight:500;font-size:36px;line-height:1.4;margin-top:4px;color:{MUTED}}}
.step.to b{{color:{SUN}}}
.arrow{{width:110px;height:6px;background:{SUN};position:relative}}
.arrow::after{{content:"";position:absolute;right:-6px;top:-11px;border:14px solid transparent;border-left:18px solid {SUN}}}
.sports{{position:absolute;left:72px;right:72px;top:520px}}
.sport{{display:flex;align-items:center;justify-content:space-between;padding:14px 26px;margin-bottom:18px;
  background:rgba({SHADE},.84);border-left:10px solid {SUN}}}
.sport b{{font-weight:900;font-size:68px;line-height:1.2}}
.sport span{{font-weight:700;font-size:38px;line-height:1.2;padding:6px 16px;color:#0c0e14;background:{INK}}}
.sport.debut span{{background:{SUN};color:#0c0e14}}
.hero{{position:absolute;left:66px;right:60px;top:420px}}
.hero b{{display:block;font-weight:900;font-size:260px;line-height:1;letter-spacing:-10px;color:{SUN};font-variant-numeric:tabular-nums}}
.hero small{{display:block;font-weight:700;font-size:50px;line-height:1.4;margin:16px 0 0 8px}}
.hero .plus{{display:inline-block;margin:18px 0 0 8px;padding:6px 18px;font-weight:900;font-size:44px;background:{INK};color:#0c0e14}}
.quota{{position:absolute;left:72px;right:72px;top:800px}}
.quota h3{{margin:0 0 20px;font-weight:700;font-size:44px;color:{INK}}}
.quota h3 em{{font-style:normal;font-weight:900;font-size:64px}}
.bar{{display:flex;align-items:center;gap:22px;margin-bottom:16px}}
.bar label{{width:110px;font-weight:700;font-size:44px}}
.bar i{{display:block;height:58px;background:{INK}}}
.bar.w i{{background:{SUN}}}
.bar span{{font-weight:900;font-size:50px;font-variant-numeric:tabular-nums}}
.firsttime{{display:inline-block;margin-top:14px;padding:8px 22px;font-weight:900;font-size:48px;background:{SUN};color:#0c0e14}}
.end{{position:absolute;left:72px;right:72px;top:176px}}
.end .city-name{{font-weight:900;font-size:150px;line-height:1.05}}
.end .yr{{font-weight:900;font-size:300px;line-height:.95;letter-spacing:-12px;color:{SUN};font-variant-numeric:tabular-nums}}
.end .dates{{font-weight:900;font-size:92px;line-height:1.2;margin-top:18px;font-variant-numeric:tabular-nums}}
.end .ord{{font-weight:700;font-size:46px;line-height:1.4;margin-top:6px;color:{MUTED}}}
.end .see{{display:inline-block;margin-top:34px;padding:10px 30px;font-weight:900;font-size:84px;background:{SUN};color:#0c0e14}}
.credit{{position:absolute;left:72px;right:72px;top:1384px;font-size:24px;line-height:1.4;color:{MUTED};text-shadow:0 1px 2px #000}}
"""


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


def show(tl, sel, t, dx=0, dy=14, dur=.4):
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,x:{dx},y:{dy}}},{{opacity:1,x:0,y:0,duration:{dur},ease:'power3.out'}},{r(max(t, .05))});")


def count(tl, key, sel, a, b, t, dur, grouped=False):
    fmt = "Math.round(c.v).toLocaleString('en-US')" if grouped else "Math.round(c.v)"
    tl.append(f"{{const c={{v:{a}}};tl.to(c,{{v:{b},duration:{dur},ease:'power2.out',"
              f"onUpdate:()=>{{document.querySelector('{sel}').textContent={fmt}}}}},{r(t)});}}")


def push(tl, sel, d, z0, z1, dx, dy):
    tl.append(f"tl.fromTo('{sel}',{{scale:{z0},x:0,y:0}},{{scale:{z1},x:{dx},y:{dy},duration:{r(d)},ease:'none'}},0);")


def photo(sid, name, alt, d, z, tl, cls="cam"):
    push(tl, f"#{sid}-{name}-cam", d, *z)
    return (f'<div id="{sid}-{name}-cam" class="{cls}" data-layout-allow-overflow>'
            f'<img id="{sid}-{name}" class="photo" src="assets/photos/{name}.jpg" alt="{esc(alt)}"></div>')


def credit(names, place=""):
    parts = [f"{esc(PHOTOS[n][0])} · {esc(PHOTOS[n][1])}" for n in names]
    lead = f"{esc(place)} · " if place else ""
    return f'<div class="credit" data-layout-ignore>{lead}照片 {" / ".join(parts)} · Wikimedia Commons</div>'


def header(tl, sid, big, title, t0=.05):
    show(tl, f"#{sid}-big", t0, dx=-30, dy=0, dur=.45)
    show(tl, f"#{sid}-title", t0 + .2, dx=-24, dy=0, dur=.45)
    return (f'<div class="head"><div class="big" id="{sid}-big">{esc(big)}</div>'
            f'<div class="title" id="{sid}-title">{esc(title)}</div></div>')


def scrim(h):
    return f'<div class="scrim" style="height:{h}px"></div><div class="floor"></div>'


# Scene builders: each returns (body html, timeline lines).
def s0(sid, d, tl):
    """Cover: the Coliseum gate, the two past Games and 2028 already on screen at frame 0."""
    body = [photo(sid, "gate", "洛杉矶纪念体育场大门", d, (1.0, 1.08, 0, -50), tl), scrim(1080)]
    body.append(f'<div class="years"><div id="{sid}-y0">1932<span id="{sid}-t0">开幕式</span></div>'
                f'<div id="{sid}-y1">1984<span id="{sid}-t1">开幕式</span></div>'
                f'<div class="now" id="{sid}-y2">2028</div></div>'
                f'<div class="cover-title" id="{sid}-ct">洛杉矶奥运会</div>')
    t = at(0, "两")
    show(tl, f"#{sid}-t0", t - .1, dx=-20, dy=0, dur=.35)
    show(tl, f"#{sid}-t1", t + .05, dx=-20, dy=0, dur=.35)
    body.append(credit(["gate"], "洛杉矶纪念体育场"))
    return body


def s1(sid, d, tl):
    """1932 on the top half, 1984 wipes in on the bottom half."""
    t84 = at(1, "一九八四年")
    body = [f'<div class="half top" style="top:0;height:880px">{photo(sid, "games1932", "1932 年第十届奥运会开幕式", d, (1.0, 1.08, 0, 20), tl)}'
            f'<div class="shade"></div><div class="lab" style="top:176px"><div class="big" id="{sid}-a">1932</div>'
            f'<span id="{sid}-as">第 10 届 · 开幕式</span></div></div>',
            f'<div class="half" id="{sid}-low" style="top:880px;height:1040px">{photo(sid, "games1984", "1984 年奥运会男子 400 米", d, (1.08, 1.0, -30, 0), tl)}'
            f'<div class="shade"></div><div class="lab" style="top:30px"><div class="big" id="{sid}-b">1984</div>'
            f'<span id="{sid}-bs">第 23 届 · 男子 400 米</span></div></div>']
    show(tl, f"#{sid}-a", .05, dx=-30, dy=0, dur=.45)
    show(tl, f"#{sid}-as", at(1, "第十"), dx=-20, dy=0)
    tl.append(f"tl.fromTo('#{sid}-low',{{clipPath:'inset(0 0 0 100%)'}},{{clipPath:'inset(0 0 0 0%)',duration:.55,ease:'power3.inOut'}},{r(t84 - .2)});")
    show(tl, f"#{sid}-b", t84 + .2, dx=-30, dy=0, dur=.45)
    show(tl, f"#{sid}-bs", t84 + .5, dx=-20, dy=0)
    body.append('<div class="credit" data-layout-ignore style="top:1840px">照片 Le Miroir des sports（1932）/ Ken Hackman, USAF（1984）· 公有领域 · Wikimedia Commons</div>')
    return body


def s2(sid, d, tl):
    """Aerial of the Coliseum; then the three three-time hosts."""
    body = [photo(sid, "aerial", "洛杉矶纪念体育场航拍", d, (1.0, 1.1, -20, 30), tl), scrim(1000)]
    body.append(header(tl, sid, "2028", "7 月 14 日 · 第 3 次开幕"))
    body.append(f'<div class="pin" style="left:640px;top:900px"><div id="{sid}-pin"><i></i><span>纪念体育场</span></div></div>')
    tl.append(f"tl.fromTo('#{sid}-pin',{{opacity:0,scale:.6,transformOrigin:'0 0'}},{{opacity:1,scale:1,duration:.4,ease:'back.out(2)'}},{r(at(2, '这里'))});")
    rows = [("伦敦", "1908 · 1948 · 2012", "伦敦"), ("巴黎", "1900 · 1924 · 2024", "巴黎"),
            ("洛杉矶", "1932 · 1984 · <em>2028</em>", "三次")]
    body.append('<div class="cities">' + "".join(
        f'<div class="city{" la" if k == 2 else ""}" id="{sid}-c{k}"><b>{n}</b><span>{y}</span></div>'
        for k, (n, y, _) in enumerate(rows)) + '</div>')
    tl.append(f"tl.to('#{sid}-pin',{{opacity:0,duration:.25,ease:'none'}},{r(at(2, '伦敦') - .35)});")
    for k, (_, _, w) in enumerate(rows):
        show(tl, f"#{sid}-c{k}", at(2, w) - .1, dx=-40, dy=0)
    return body


def s3(sid, d, tl):
    """SoFi Stadium: the same night's second opening, then the football field becomes the pool."""
    body = [photo(sid, "sofi", "SoFi 体育场内景", d, (1.0, 1.08, 0, 40), tl), scrim(1100)]
    body.append(header(tl, sid, "SoFi", "英格尔伍德 · 同晚开幕"))
    body.append(f'<div class="steps"><div class="step" id="{sid}-s0"><b>橄榄球场</b><span>平时</span></div>'
                f'<div class="arrow" id="{sid}-arrow"></div>'
                f'<div class="step to" id="{sid}-s1"><b>游泳</b><span>2028 奥运</span></div></div>')
    t0, t1 = at(3, "橄榄球场"), at(3, "游泳")
    show(tl, f"#{sid}-s0", t0 - .1)
    tl.append(f"tl.fromTo('#{sid}-arrow',{{scaleX:0,transformOrigin:'0 50%'}},{{scaleX:1,duration:.5,ease:'power2.inOut'}},{r(t1 - .6)});")
    show(tl, f"#{sid}-s1", t1 - .1)
    body.append(credit(["sofi"], "SoFi 体育场"))
    return body


def s4(sid, d, tl):
    """Venice Beach: the five sports, debut or return, each as it is named."""
    body = [photo(sid, "venice", "威尼斯海滩", d, (1.06, 1.0, 30, 0), tl), scrim(1150)]
    body.append(header(tl, sid, "5", "个新增项目"))
    sports = [("腰旗橄榄球", "首次", "腰旗"), ("壁球", "首次", "壁球"), ("板球", "1900 年后回归", "板球"),
              ("长曲棍球", "1908 年后回归", "长曲棍球"), ("棒垒球", "回归", "棒")]
    body.append('<div class="sports">' + "".join(
        f'<div class="sport{" debut" if tag == "首次" else ""}" id="{sid}-p{k}"><b>{n}</b><span>{tag}</span></div>'
        for k, (n, tag, _) in enumerate(sports)) + '</div>')
    for k, (_, _, w) in enumerate(sports):
        show(tl, f"#{sid}-p{k}", at(4, w) - .1, dx=-50, dy=0, dur=.35)
    body.append(credit(["venice"], "威尼斯海滩"))
    return body


def s5(sid, d, tl):
    """Downtown at night: 351 events, then the athlete quota with women ahead for the first time."""
    body = [photo(sid, "downtown", "洛杉矶市中心夜景", d, (1.0, 1.08, 0, -30), tl), scrim(1240)]
    body.append(header(tl, sid, "36", "个大项"))
    body.append(f'<div class="hero"><b id="{sid}-num">0</b><small id="{sid}-sub">个小项 · 历届最多</small>'
                f'<span class="plus" id="{sid}-plus">比巴黎 2024 多 22 个</span></div>')
    t = at(5, "三百五十一")
    tl.append(f"tl.fromTo('#{sid}-num',{{opacity:0}},{{opacity:1,duration:.2,ease:'none'}},{r(t - .3)});")
    count(tl, "e", f"#{sid}-num", 0, 351, t - .3, 1.1)
    show(tl, f"#{sid}-sub", t + .4)
    show(tl, f"#{sid}-plus", at(5, "多"), dx=-20, dy=0)
    women, men = 5655, 5543
    scale = 760 / women
    body.append(f'<div class="quota"><h3 id="{sid}-q"><em id="{sid}-qn">11,198</em> 个参赛名额</h3>'
                f'<div class="bar w" id="{sid}-w"><label>女子</label><i id="{sid}-wb" style="width:{round(women * scale * .78)}px"></i><span>{women:,}</span></div>'
                f'<div class="bar" id="{sid}-m"><label>男子</label><i id="{sid}-mb" style="width:{round(men * scale * .78)}px"></i><span>{men:,}</span></div>'
                f'<div class="firsttime" id="{sid}-ft">奥运史上首次 女 &gt; 男</div></div>')
    tq = at(5, "一万一千一百九")
    # the hero steps back so the quota block can take the frame
    tl.append(f"tl.to('#{sid}-plus',{{opacity:0,duration:.3,ease:'none'}},{r(tq - .4)});")
    show(tl, f"#{sid}-q", tq - .1)
    tw = at(5, "女子")
    for k, sel in enumerate(("w", "m")):
        show(tl, f"#{sid}-{sel}", tw - .1 + k * .15, dx=-30, dy=0)
        tl.append(f"tl.fromTo('#{sid}-{sel}b',{{scaleX:0,transformOrigin:'0 50%'}},{{scaleX:1,duration:.7,ease:'power2.out'}},{r(tw + k * .15)});")
    show(tl, f"#{sid}-ft", at(5, "第一") - .1, dx=-20, dy=0)
    body.append(credit(["downtown"], "洛杉矶市中心"))
    return body


def s6(sid, d, tl):
    """End card on the Coliseum peristyle: city, year, dates, the ordinal, see you there."""
    body = [photo(sid, "peristyle", "洛杉矶纪念体育场柱廊", d, (1.06, 1.0, 0, 0), tl), scrim(1450)]
    body.append(f'<div class="end"><div class="city-name" id="{sid}-c">洛杉矶</div><div class="yr" id="{sid}-y">2028</div>'
                f'<div class="dates" id="{sid}-d">7.14 — 7.30</div><div class="ord" id="{sid}-o">第 34 届夏季奥运会</div>'
                f'<div class="see" id="{sid}-s">洛杉矶见</div></div>')
    show(tl, f"#{sid}-c", .05, dx=-30, dy=0, dur=.45)
    tl.append(f"tl.fromTo('#{sid}-y',{{opacity:0,scale:.86,transformOrigin:'0 100%'}},{{opacity:1,scale:1,duration:.55,ease:'back.out(1.6)'}},{r(.25)});")
    show(tl, f"#{sid}-d", at(6, "七月十四") - .1, dx=-30, dy=0)
    show(tl, f"#{sid}-o", at(6, "第三十四") - .1, dx=-20, dy=0)
    tl.append(f"tl.fromTo('#{sid}-s',{{opacity:0,clipPath:'inset(0 100% 0 0)'}},{{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.45,ease:'power3.out'}},{r(at(6, '洛杉矶') - .05)});")
    body.append(credit(["peristyle"], "洛杉矶纪念体育场"))
    return body


SCENES = [s0, s1, s2, s3, s4, s5, s6]


def scene_html(i, build_body):
    sid = f"scene-{i}"
    d = slots[i]
    tl = []
    body = build_body(sid, d, tl)
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
.sub{{position:absolute;left:72px;top:900px;font-weight:700;font-size:46px;line-height:1.4}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="la28-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="cam cover-cam"><img class="photo" src="../assets/photos/gate.jpg" alt="洛杉矶纪念体育场大门"></div>
{scrim(1150)}
<div class="years"><div>1932<span>开幕式</span></div><div>1984<span>开幕式</span></div><div class="now">2028</div></div>
<div class="cover-title">洛杉矶奥运会</div>
<div class="sub">7 月 14 日—30 日 · 第三次在这里开幕</div>
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
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789,—·.")
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
               ".cap{position:absolute;left:0;top:1220px;width:1080px;text-align:center}"
               f".cap span{{display:inline-block;max-width:900px;padding:10px 22px;background:rgba({SHADE},.78);border-radius:8px;"
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
<title>洛杉矶 2028 奥运会</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#0c0e14}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="la28-olympics" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>
<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{r(sum(durs))}" data-track-index="3" data-volume="1"></audio>
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
    print(f"Built {len(SCENES)} scenes, {len(groups)} caption groups, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
