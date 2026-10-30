"""Build the HyperFrames composition from the narration timing.

Inputs: public/voiceover/{narration.zh.txt, segment-durations.json, word-marks.json} from
`npm run voiceover`, and the cropped photos in assets/photos/ (scripts/prepare_photos.py).
Writes index.html, compositions/scene-*.html, compositions/captions.html, poster/index.html and the SRT.
Every reveal is keyed to the Edge TTS WordBoundary of the word that names it.
"""
import html
import json
import math
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
GOLD, INK, MUTED, GREY = "#f0b43c", "#f5f2ec", "#d3cfc8", "#5d6163"
SEATS, MAJORITY = 329, 165

PHOTOS = {  # file: (credit, licence) — see SOURCES.md
    "convention": ("James Gordon", "CC BY 2.0"),
    "posters": ("الدبوني", "CC BY-SA 4.0"),
    "tigris": ("Samir Al-Ibrahem", "CC BY-SA 4.0"),
    "hurriyah": ("ainudil", "CC BY-SA 2.0"),
    "hall": ("James Gordon", "CC BY 2.0"),
    "green": ("MohammadHuzam", "CC BY-SA 4.0"),
}
# The five largest lists of the November 2025 election (seats, IHEC final results ratified 2025-12-14).
# Colours only tell the blocs apart; they are not the parties' own colours.
PARTIES = [("重建与发展", 46, "#3fa7d6"), ("法治国家", 29, "#4caf6a"), ("进步党", 27, "#e8743b"),
           ("萨迪昆", 27, "#a66bd3"), ("库民党", 26, "#e94e4e")]
TOP5 = sum(n for _, n, _ in PARTIES)  # 155
WOMEN, MINORITY = 83, 9
MINORITY_SEATS = "基督徒 5 · 雅兹迪 1 · 沙巴克 1 · 曼达派 1 · 费利库尔德 1"


def at(scene, word, nth=0):
    """Seconds from the scene start at which the narration says `word`."""
    hits = [m["start"] for m in marks[scene] if m["text"] == word]
    if len(hits) <= nth:
        raise SystemExit(f"scene {scene}: no word mark '{word}' (#{nth})")
    return hits[nth]


def hemicycle(n=SEATS, rows=10, r0=180, r1=450, cx=480, cy=462):
    """Seat centres of a parliament half-circle, ordered left to right (seat n//2 sits on the vertical axis)."""
    radii = [r0 + (r1 - r0) * k / (rows - 1) for k in range(rows)]
    per = [n * r / sum(radii) for r in radii]
    counts = [math.floor(p) for p in per]
    for k in sorted(range(rows), key=lambda k: per[k] - counts[k], reverse=True)[:n - sum(counts)]:
        counts[k] += 1
    seats = []
    for r, c in zip(radii, counts):
        for j in range(c):
            a = math.pi * (1 - j / (c - 1))
            seats.append((a, cx + r * math.cos(a), cy - r * math.sin(a)))
    seats.sort(key=lambda s: -s[0])
    return [(x, y) for _, x, y in seats]


SEAT_XY = hemicycle()


def spread(k, n, skip=()):
    """k seat indices spread evenly over n seats, nudged right past any in `skip`."""
    out = []
    for j in range(k):
        i = round((j + .5) * n / k)
        while i in skip or i in out:
            i = (i + 1) % n
        out.append(i)
    return out


# Each scene: photo, the push (start/end scale and drift in px), the header, and what it reveals.
SCENES = [
    dict(photo="convention", place="巴格达会议中心（议会所在地）", push=(1.0, 1.08, 0, -30), year="第 6 届", title="伊拉克国民议会",
         hero=dict(num=SEATS, unit="席", sub="代表理事会 · 2025 年 11 月选出")),
    dict(photo="posters", place="2025 年大选前的竞选海报 · 摩苏尔", push=(1.04, 1.12, 20, 0), year="2025", title="11 月 11 日 · 议会选举",
         grow=dict(a=0, b=56.04, unit="%", t=at(1, "百分之五十六") + .5, sub="官方公布的投票率", dec=2),
         card=("2140 万", "登记选民", at(1, "两千一百四十万"))),
    dict(photo="tigris", place="巴格达 · 底格里斯河", push=(1.0, 1.06, 0, 20), year="2025", title="选举结果 · 无人过半", dim=True,
         seats=dict(kind="parties", t=[at(2, w) - .35 for w in ("四十六", "二十九", "二十七", "二十七", "二十六")],
                    top5=at(2, "一百五十五"), half=at(2, "一百六十五"))),
    dict(photo="hurriyah", place="巴格达解放广场 · 自由纪念碑", push=(1.06, 1.0, -20, 0), year="329", title="保留名额", dim=True,
         seats=dict(kind="quota", women=at(3, "八十三"), minority=at(3, "九席"), detail=at(3, "基督徒"))),
    dict(photo="hall", place="巴格达会议中心大厅（2008 年）", push=(1.0, 1.08, -30, 0), year="12.29", title="首次会议 · 选出议长",
         speaker=dict(t=at(4, "海巴特"), votes=at(4, "二百零八")),
         rows=[("议长", "逊尼派", at(4, "议长", 1)), ("总统", "库尔德人", at(4, "总统")), ("总理", "什叶派", at(4, "什叶派") - .5)]),
    dict(photo="green", place="巴格达 · 绿区一带", push=(1.0, 1.08, 30, 0), year="2026", title="总统与新政府",
         cards=[("4 月 11 日 · 总统", "尼扎尔·阿米迪", "议会 227 票选出", at(5, "二百二十七") - .4),
                ("5 月 14 日 · 总理", "阿里·扎伊迪", "政府通过信任投票", at(5, "五月十四日"))],
         ministers=(at(5, "二十三"), at(5, "十四"))),
    dict(photo="convention", place="巴格达会议中心（议会所在地）", push=(1.08, 1.0, 0, 0), year="6 个月", title="从投票到新政府",
         timeline=[("2025.11.11", "议会选举"), ("2025.12.29", "选出议长"), ("2026.04.11", "选出总统"), ("2026.05.14", "政府上任")],
         final=("329", "席", "任期四年", at(6, "三百二十九"))),
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
.dim{{position:absolute;inset:0;background:rgba(12,13,14,.55)}}
.floor{{position:absolute;left:0;top:1120px;width:{W}px;height:800px;
  background:linear-gradient(180deg,rgba(12,13,14,0) 0%,rgba(12,13,14,.55) 40%,rgba(12,13,14,.75) 100%)}}
.head{{position:absolute;left:72px;top:176px;right:72px}}
.year{{font-weight:900;font-size:176px;line-height:1;letter-spacing:-5px;font-variant-numeric:tabular-nums;white-space:nowrap}}
.title{{font-weight:700;font-size:60px;line-height:1.25;margin-top:20px}}
.title::before{{content:"";display:inline-block;width:14px;height:52px;background:{GOLD};margin-right:20px;vertical-align:-6px}}
.hero{{position:absolute;left:66px;right:60px;top:560px}}
.hero b{{display:block;font-weight:900;font-size:260px;line-height:1;letter-spacing:-10px;color:{GOLD};font-variant-numeric:tabular-nums;white-space:nowrap}}
.hero b em{{font-style:normal;font-size:80px;letter-spacing:0;margin-left:18px;color:{INK}}}
.hero small{{display:block;font-weight:700;font-size:46px;line-height:1.4;margin:22px 0 0 8px}}
.card{{position:absolute;left:72px;right:72px;padding:24px 34px;background:rgba(12,13,14,.82);border-left:10px solid {GOLD}}}
.card i{{display:block;font-style:normal;font-weight:700;font-size:36px;line-height:1.4;color:{GOLD}}}
.card b{{display:block;font-weight:900;font-size:76px;line-height:1.2}}
.card small{{display:block;font-weight:500;font-size:38px;line-height:1.5;color:{MUTED};margin-top:4px}}
.hemi{{position:absolute;left:60px;top:580px;width:960px;height:480px}}
.hemi svg{{position:absolute;inset:0;overflow:visible}}
.hollow{{position:absolute;left:300px;top:330px;width:360px;text-align:center}}
.hollow b{{display:block;font-weight:900;font-size:110px;line-height:1;color:{GOLD};font-variant-numeric:tabular-nums}}
.hollow small{{display:block;font-weight:700;font-size:32px;line-height:1.3;margin-top:6px}}
.half{{position:absolute;left:480px;top:-70px;width:0;height:540px;border-left:4px dashed {INK}}}
.half span{{position:absolute;left:16px;top:-6px;white-space:nowrap;font-weight:900;font-size:40px;line-height:56px;padding:0 14px;background:rgba(12,13,14,.85)}}
.legend{{position:absolute;left:72px;right:60px;top:1072px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px 18px}}
.legend div{{font-weight:700;font-size:32px;line-height:44px;white-space:nowrap}}
.legend i,.qrow i{{display:inline-block;width:26px;height:26px;border-radius:50%;margin-right:12px;vertical-align:-3px}}
.legend b{{font-weight:900;margin-left:10px}}
.quota{{position:absolute;left:72px;right:60px;top:1060px}}
.qrow{{font-weight:700;font-size:36px;line-height:44px;white-space:nowrap}}
.qrow b{{font-weight:900}}
.qdetail{{font-weight:500;font-size:28px;line-height:38px;color:{MUTED};margin-left:38px}}
.rows{{position:absolute;left:72px;right:72px;top:830px}}
.row{{display:flex;align-items:center;gap:30px;padding:14px 0 14px 22px;margin-bottom:18px;
  background:linear-gradient(90deg,rgba(12,13,14,.86),rgba(12,13,14,.3))}}
.row em{{font-style:normal;display:inline-block;width:150px;text-align:center;font-weight:900;font-size:44px;line-height:72px;background:{GOLD};color:#111314}}
.row span{{font-weight:900;font-size:56px;line-height:1.2}}
.mins{{position:absolute;left:72px;right:60px;top:1052px}}
.mins .sq{{display:inline-block;width:32px;height:32px;margin-right:8px;box-sizing:border-box;border:3px solid {INK}}}
.mins small{{display:block;margin-top:16px;font-weight:700;font-size:44px}}
.mins small b{{color:{GOLD};font-weight:900}}
.tline{{position:absolute;left:72px;right:72px;top:530px}}
.tline div{{display:flex;gap:28px;align-items:baseline;padding:10px 0 10px 26px;margin-bottom:12px;border-left:6px solid {GOLD};background:rgba(12,13,14,.7)}}
.tline b{{font-weight:900;font-size:46px;font-variant-numeric:tabular-nums}}
.tline span{{font-weight:700;font-size:44px;color:{MUTED}}}
.final{{position:absolute;left:72px;top:950px;padding:20px 40px 26px 30px;background:rgba(12,13,14,.82);border-left:10px solid {GOLD}}}
.final b{{font-weight:900;font-size:200px;line-height:1;letter-spacing:-8px;color:{GOLD}}}
.final em{{font-style:normal;font-weight:700;font-size:72px;margin-left:14px}}
.final small{{font-weight:700;font-size:56px;margin-left:30px}}
.credit{{position:absolute;left:72px;right:72px;top:1384px;font-size:24px;line-height:1.4;color:{MUTED};text-shadow:0 1px 2px #000}}
"""


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


def show(tl, sel, t, dx=0, dy=14, dur=.4):
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,x:{dx},y:{dy}}},{{opacity:1,x:0,y:0,duration:{dur},ease:'power3.out'}},{r(max(t, .05))});")


def count(tl, name, sel, a, b, t, dur, dec=0):
    tl.append(f"const {name}={{v:{a}}};tl.fromTo({name},{{v:{a}}},{{v:{b},duration:{dur},ease:'power2.out',"
              f"onUpdate:()=>{{document.querySelector('{sel}').textContent={name}.v.toFixed({dec})}}}},{r(t)});")


def seats_svg(sid, fills):
    """The 329-seat half circle; `fills[i]` is (class, colour) of seat i."""
    dots = "".join(f'<circle class="{sid}-s {sid}-{c}" cx="{x:.1f}" cy="{y:.1f}" r="12.5" fill="{f}"/>'
                   for (x, y), (c, f) in zip(SEAT_XY, fills))
    return f'<svg width="960" height="480" viewBox="0 0 960 480">{dots}</svg>'


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
        body.append(f'<div class="hero"><b>{h["num"]}<em>{h["unit"]}</em></b><small>{esc(h["sub"])}</small></div>')
    if s.get("grow"):
        g = s["grow"]
        dec = g.get("dec", 0)
        body.append(f'<div class="hero" id="{sid}-hero"><b><span id="{sid}-num">{g["a"]:.{dec}f}</span><em>{g["unit"]}</em></b>'
                    f'<small id="{sid}-sub">{esc(g["sub"])}</small></div>')
        t0 = max(g["t"] - .9, .3)
        tl.append(f"tl.fromTo('#{sid}-hero',{{opacity:0}},{{opacity:1,duration:.3,ease:'none'}},{r(t0)});")
        count(tl, f"c{i}", f"#{sid}-num", g["a"], g["b"], t0, 1.6, dec)
        show(tl, f"#{sid}-sub", t0 + 1.2)
    if s.get("card"):
        a, b, t = s["card"]
        body.append(f'<div class="card" id="{sid}-card" style="top:{1000 if s.get("grow") else 960}px"><b>{esc(a)}</b><small>{esc(b)}</small></div>')
        show(tl, f"#{sid}-card", t, dx=-30, dy=0)

    if s.get("seats"):
        q = s["seats"]
        if q["kind"] == "parties":
            fills, k = [], 0
            for p, (_, n, col) in enumerate(PARTIES):
                fills += [(f"p{p}", GREY)] * n
            fills += [("rest", GREY)] * (SEATS - len(fills))
            body.append(f'<div class="hemi" id="{sid}-hemi">{seats_svg(sid, fills)}'
                        f'<div class="half" id="{sid}-half"><span>过半数 {MAJORITY}</span></div>'
                        f'<div class="hollow" id="{sid}-hollow"><b>{TOP5}</b><small>前五名合计</small></div></div>')
            legend = [(name, n, col) for name, n, col in PARTIES] + [("其他", SEATS - TOP5, GREY)]
            body.append('<div class="legend">' + "".join(
                f'<div id="{sid}-l{k}"><i style="background:{col}"></i>{esc(name)}<b>{n}</b></div>'
                for k, (name, n, col) in enumerate(legend)) + '</div>')
            tl.append(f"tl.fromTo('.{sid}-s',{{opacity:0,scale:0,transformOrigin:'50% 50%'}},"
                      f"{{opacity:1,scale:1,duration:.3,ease:'back.out(2)',stagger:.003}},.4);")
            for p, ((_, _, col), t) in enumerate(zip(PARTIES, q["t"])):
                tl.append(f"tl.fromTo('.{sid}-p{p}',{{attr:{{fill:'{GREY}'}}}},{{attr:{{fill:'{col}'}},duration:.25,ease:'none',stagger:.008}},{r(t)});")
                show(tl, f"#{sid}-l{p}", t, dx=-20, dy=0)
            show(tl, f"#{sid}-l5", q["t"][-1] + .6, dx=-20, dy=0)
            show(tl, f"#{sid}-hollow", q["top5"] - .1, dy=20)
            tl.append(f"tl.fromTo('#{sid}-half',{{opacity:0,scaleY:0,transformOrigin:'50% 100%'}},{{opacity:1,scaleY:1,duration:.5,ease:'power2.out'}},{r(q['half'] - .1)});")
        else:
            women = spread(WOMEN, SEATS)
            minority = spread(MINORITY, SEATS, skip=set(women))
            fills = [("w", GREY) if k in women else ("m", GREY) if k in minority else ("o", GREY) for k in range(SEATS)]
            body.append(f'<div class="hemi" id="{sid}-hemi">{seats_svg(sid, fills)}'
                        f'<div class="hollow" id="{sid}-hollow"><b>1/4</b><small>女性席位占比</small></div></div>')
            body.append(f'<div class="quota"><div class="qrow" id="{sid}-q0"><i style="background:{GOLD}"></i>女性保留 <b>{WOMEN}</b> 席</div>'
                        f'<div class="qrow" id="{sid}-q1"><i style="background:#3fa7d6"></i>少数群体保留 <b>{MINORITY}</b> 席</div>'
                        f'<div class="qdetail" id="{sid}-q2">{esc(MINORITY_SEATS)}</div></div>')
            tl.append(f"tl.fromTo('.{sid}-s',{{opacity:0}},{{opacity:1,duration:.4,ease:'none'}},.3);")
            tl.append(f"tl.fromTo('.{sid}-w',{{attr:{{fill:'{GREY}'}}}},{{attr:{{fill:'{GOLD}'}},duration:.2,ease:'none',stagger:.012}},{r(q['women'] - .2)});")
            show(tl, f"#{sid}-q0", q["women"], dx=-20, dy=0)
            show(tl, f"#{sid}-hollow", q["women"] + 1.6, dy=20)
            tl.append(f"tl.fromTo('.{sid}-m',{{attr:{{fill:'{GREY}'}},scale:1,transformOrigin:'50% 50%'}},{{attr:{{fill:'#3fa7d6'}},scale:1.25,duration:.3,ease:'back.out(2)',stagger:.05}},{r(q['minority'] - .1)});")
            show(tl, f"#{sid}-q1", q["minority"], dx=-20, dy=0)
            show(tl, f"#{sid}-q2", q["detail"] - .1, dx=-20, dy=0)

    if s.get("speaker"):
        q = s["speaker"]
        body.append(f'<div class="card" id="{sid}-card" style="top:540px"><i>议长 · 进步党</i><b>海巴特·哈尔布希</b>'
                    f'<small id="{sid}-votes"><span id="{sid}-vn">0</span> 票当选</small></div>')
        show(tl, f"#{sid}-card", q["t"] - .1, dx=-30, dy=0)
        count(tl, f"c{i}", f"#{sid}-vn", 0, 208, q["votes"] - .1, 1.0)
    if s.get("rows"):
        body.append('<div class="rows">' + "".join(
            f'<div class="row" id="{sid}-r{k}"><em>{esc(post)}</em><span>{esc(who)}</span></div>'
            for k, (post, who, _) in enumerate(s["rows"])) + '</div>')
        for k, (_, _, t) in enumerate(s["rows"]):
            show(tl, f"#{sid}-r{k}", t - .05, dx=-40, dy=0)
    if s.get("cards"):
        for k, (kicker, name, sub, t) in enumerate(s["cards"]):
            body.append(f'<div class="card" id="{sid}-k{k}" style="top:{516 + k * 264}px"><i>{esc(kicker)}</i><b>{esc(name)}</b><small>{esc(sub)}</small></div>')
            show(tl, f"#{sid}-k{k}", t, dx=-30, dy=0)
    if s.get("ministers"):
        t23, t14 = s["ministers"]
        body.append(f'<div class="mins" id="{sid}-mins">' + "".join(f'<span class="sq {sid}-sq{" " + sid + "-ok" if k < 14 else ""}"></span>' for k in range(23))
                    + f'<small id="{sid}-mn">23 名部长人选 · <b>14</b> 人获通过</small></div>')
        tl.append(f"tl.fromTo('.{sid}-sq',{{opacity:0,y:10}},{{opacity:1,y:0,duration:.2,ease:'power2.out',stagger:.02}},{r(t23 - .1)});")
        tl.append(f"tl.fromTo('.{sid}-ok',{{backgroundColor:'rgba(240,180,60,0)'}},{{backgroundColor:'{GOLD}',duration:.15,ease:'none',stagger:.04}},{r(t14 - .1)});")
        show(tl, f"#{sid}-mn", t14 + .3)
    if s.get("timeline"):
        body.append('<div class="tline">' + "".join(
            f'<div id="{sid}-t{k}"><b>{esc(day)}</b><span>{esc(what)}</span></div>' for k, (day, what) in enumerate(s["timeline"])) + '</div>')
        for k in range(len(s["timeline"])):
            show(tl, f"#{sid}-t{k}", .5 + k * .25, dx=-30, dy=0)
    if s.get("final"):
        num, unit, sub, t = s["final"]
        body.append(f'<div class="final" id="{sid}-final"><b>{num}</b><em>{unit}</em><small>{esc(sub)}</small></div>')
        show(tl, f"#{sid}-final", t - .2, dy=24, dur=.45)

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
                raw = 0  # map the cut in the normalised phrase back onto the phrase with its "·"
                for k, ch in enumerate(ph):
                    if raw == cut:
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
    """Single-frame release cover (npm run render:still): the 329-seat half circle by bloc."""
    css = CSS.replace("url('assets/", "url('../assets/")
    fills = []
    for _, n, col in PARTIES:
        fills += [("p", col)] * n
    fills += [("rest", GREY)] * (SEATS - len(fills))
    (P / "poster").mkdir(exist_ok=True)
    (P / "poster" / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>伊拉克国民议会 · 封面</title>
<script src="../assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}{css}
.cover-cam{{transform:scale(1.04)}}
.kicker{{position:absolute;left:72px;top:190px;font-weight:700;font-size:40px;letter-spacing:8px;color:{MUTED}}}
.big{{position:absolute;left:66px;top:250px;font-weight:900;font-size:136px;line-height:1.15;letter-spacing:-2px}}
.hemi{{top:720px}}
.hollow{{top:290px}}
.legend{{top:1230px}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="iraq-parliament-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="cam cover-cam"><img class="photo" src="../assets/photos/hall.jpg" alt="巴格达会议中心大厅"></div>
<div class="dim" style="background:rgba(12,13,14,.62)"></div>
<div class="scrim" style="height:1300px"></div>
<div class="kicker">第 6 届 · 2025 年选出</div>
<div class="big">伊拉克<br>国民议会</div>
<div class="hemi">{seats_svg("poster", fills)}<div class="hollow"><b>{SEATS}</b><small>席 · 无人过半</small></div></div>
<div class="legend">{"".join(f'<div><i style="background:{col}"></i>{esc(name)}<b>{n}</b></div>' for name, n, col in PARTIES)}<div><i style="background:{GREY}"></i>其他<b>{SEATS - TOP5}</b></div></div>
<div class="credit" data-layout-ignore>巴格达会议中心大厅 · 照片 James Gordon / Wikimedia Commons · CC BY 2.0</div>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["iraq-parliament-poster"]=gsap.timeline({{paused:true}});
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
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789+—·.,/%年月日席票万")
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
<title>伊拉克国民议会</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#111314}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="iraq-parliament" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>
<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{r(sum(durs))}" data-track-index="3" data-volume="1"></audio>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["iraq-parliament"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")
    build_poster()
    subset_fonts()
    print(f"Built {len(SCENES)} scenes, {len(groups)} caption groups, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
