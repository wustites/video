"""Build the HyperFrames composition from the narration timing and data/births.json.

Inputs: data/births.json (npm run data:update) and public/voiceover/{narration.zh.txt,
segment-durations.json, word-marks.json} from `npm run voiceover`.
Writes index.html, compositions/scene-*.html, compositions/captions.html, poster/index.html and the SRT.
Every figure on screen is computed here from the data; every reveal is keyed to the Edge TTS
WordBoundary of the word that names it.
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
# Dark chart palette (dataviz reference instance, validated on the dark surface):
# series blue/orange, diverging blue arm for decline and red arm for growth.
BG, INK, MUTED, GRID, GOLD = "#1a1a19", "#f2f0ea", "#a3a29c", "#383835", "#f0b43c"
BLUE, ORANGE, RED = "#3987e5", "#d95926", "#e66767"
DECLINE = ["#184f95", "#256abf", "#3987e5", "#6da7ec"]  # 0~-5%, -5~-10%, -10~-15%, below -15%

# ---- data -------------------------------------------------------------------------------------
D = json.loads((P / "data" / "births.json").read_text(encoding="utf-8"))
YEARS = D["years"]
B = {code: s["births"] for code, s in D["states"].items()}
NAT = [sum(v[k] for v in B.values()) for k in range(len(YEARS))]
ABBR = {"01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE", "11": "DC",
        "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
        "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT",
        "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
        "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
        "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY"}
FIPS = {a: c for c, a in ABBR.items()}
SHORT = {"NC": "北卡", "SC": "南卡"}  # fits the one-line note
ZH = {"CA": "加州", "TX": "德州", "DC": "华盛顿特区", "AK": "阿拉斯加", "WY": "怀俄明", "HI": "夏威夷", "IL": "伊利诺伊",
      "FL": "佛罗里达", "CO": "科罗拉多", "NC": "北卡罗来纳", "SC": "南卡罗来纳", "TN": "田纳西", "ID": "爱达荷"}
# Tile-grid map of the 50 states + DC: one row per string, two letters per column, ".." empty.
GRID_ROWS = ["AK" + ".." * 9 + "ME", ".." * 5 + "WI" + ".." * 3 + "VTNH", "WAIDMTNDMNILMI..NYMA..",
             "ORNVWYSDIAINOHPANJCTRI", "CAUTCONEMOKYWVVAMDDE..", "..AZNMKSARTNNCSCDC....",
             "......OKLAMSALGA......", "HI....TX........FL...."]


def pct(code):
    """Change 2016 → 2025 in percent."""
    return (B[code][-1] / B[code][0] - 1) * 100


def wan(v, nd=1):
    return f"{v / 1e4:.{nd}f}万"


CA, TX, FL = FIPS["CA"], FIPS["TX"], FIPS["FL"]
GAP0, GAP1 = B[CA][0] - B[TX][0], B[CA][-1] - B[TX][-1]
NAT_PCT = (NAT[-1] / NAT[0] - 1) * 100
LOW = min(range(len(YEARS)), key=lambda k: NAT[k])
GREW = sorted((c for c in B if pct(c) > 0), key=pct)
OVER15 = [c for c in B if pct(c) < -15]
DROPS = sorted(B, key=pct)[:5]
YOY = sorted(B, key=lambda c: B[c][-1] - B[c][-2], reverse=True)
YOY_UP = [c for c in B if B[c][-1] > B[c][-2]]

# The narration states these figures in words; stop if the data no longer says the same.
CHECKS = [(GAP0 // 1000, 86, "十年前差距 八万六千多"), (GAP1 // 100, 84, "2025 差距 八千四百多"),
          (round(NAT[0], -4), 3970000, "2016 全国 三百九十七万"), (YEARS[LOW], 2021, "2021 低点"),
          (round(NAT[LOW], -4), 3580000, "低点 三百五十八万"), (round(NAT_PCT, 1), -8.8, "全国 百分之八点八"),
          ((B[CA][0] - B[CA][-1]) // 10000, 9, "加州少了 九万多"), (round(pct(CA), 1), -18.5, "加州 百分之十八点五"),
          (round(pct(TX)), -3, "德州 百分之三"), (round(B[TX][-1], -4), 390000, "德州 三十九万"),
          ([ABBR[c] for c in GREW], ["NC", "SC", "TN", "ID"], "增加的四个州"), (len(B) - len(GREW), 47, "其余四十七个"),
          (len(OVER15), 9, "九个超过百分之十五"), (ABBR[DROPS[0]], "DC", "降幅最大 华盛顿特区"),
          (round(pct(DROPS[0])), -24, "百分之二十四"), ([ABBR[c] for c in DROPS[1:]], ["AK", "WY", "HI", "IL"], "两成以上四州"),
          (len(YOY_UP), 32, "三十二个州回升"), (ABBR[YOY[0]], "FL", "增量最多 佛罗里达"),
          ((B[FL][-1] - B[FL][-2]) // 100, 47, "四千七百多"), (round(NAT[0] - NAT[-1], -4), 350000, "少了三十五万")]
for got, want, what in CHECKS:
    if got != want:
        raise SystemExit(f"Narration no longer matches data: {what}: data={got}, narration={want}")


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
#root{{position:absolute;inset:0;overflow:hidden;background:{BG};font-family:{FONT};color:{INK}}}
.stage{{position:absolute;inset:0;transform-origin:50% 40%}}
.head{{position:absolute;left:72px;top:176px;right:72px}}
.year{{font-weight:900;font-size:140px;line-height:1;letter-spacing:-4px;font-variant-numeric:tabular-nums;white-space:nowrap}}
.title{{font-weight:700;font-size:54px;line-height:1.25;margin-top:18px;white-space:nowrap}}
.title::before{{content:"";display:inline-block;width:12px;height:46px;background:{GOLD};margin-right:18px;vertical-align:-5px}}
.chart{{position:absolute;left:72px;top:500px;width:936px;height:600px}}
.chart svg{{position:absolute;left:0;top:0;overflow:visible}}
.ax{{position:absolute;font-size:28px;line-height:1;color:{MUTED};font-variant-numeric:tabular-nums;white-space:nowrap}}
.lab{{position:absolute;font-weight:700;font-size:36px;line-height:1.15;white-space:nowrap;font-variant-numeric:tabular-nums}}
.lab small{{display:block;font-weight:500;font-size:28px;color:{MUTED}}}
.call{{position:absolute;font-weight:900;font-size:96px;line-height:1;letter-spacing:-2px;white-space:nowrap;font-variant-numeric:tabular-nums}}
.call small{{display:block;font-weight:700;font-size:34px;letter-spacing:0;color:{MUTED};margin-top:10px}}
.note{{position:absolute;left:72px;right:72px;top:1112px;padding:14px 24px;background:#262624;border-left:8px solid {GOLD};
  font-weight:700;font-size:34px;line-height:1.35;white-space:nowrap}}
.tile{{position:absolute;width:72px;height:72px;border-radius:4px;background:{GRID};font-weight:700;font-size:28px;
  line-height:72px;text-align:center;color:{INK}}}
.legend{{position:absolute;left:72px;top:440px;display:flex;gap:22px;font-size:28px;color:{MUTED};white-space:nowrap}}
.legend i{{display:inline-block;width:28px;height:28px;border-radius:4px;margin-right:8px;vertical-align:-5px}}
.bars{{position:absolute;left:72px;right:72px;top:520px}}
.bar{{position:relative;height:96px;margin-bottom:22px}}
.bar b{{position:absolute;left:0;top:0;font-weight:700;font-size:36px;line-height:1;white-space:nowrap}}
.bar span{{position:absolute;left:0;top:50px;height:36px;border-radius:0 4px 4px 0;transform-origin:0 50%}}
.bar em{{position:absolute;top:46px;font-style:normal;font-weight:900;font-size:40px;line-height:1;font-variant-numeric:tabular-nums}}
.src{{position:absolute;left:72px;right:72px;top:1384px;font-size:24px;line-height:1.45;color:{MUTED}}}
"""
SOURCE = "数据：美国人口普查局人口估计（PEP，Vintage 2020 / 2025），50 州 + 华盛顿特区<br>年份 = 上一年 7 月 1 日至当年 6 月 30 日"


def esc(s):
    return html.escape(str(s))


def r(v):
    return f"{v:.3f}"


def show(tl, sel, t, dx=0, dy=14, dur=.4):
    tl.append(f"tl.fromTo('{sel}',{{opacity:0,x:{dx},y:{dy}}},{{opacity:1,x:0,y:0,duration:{dur},ease:'power3.out'}},{r(max(t, .05))});")


def draw(tl, sel, t, dur):
    """Draw an SVG path (pathLength=1) from its start."""
    tl.append(f"tl.fromTo('{sel}',{{strokeDashoffset:1}},{{strokeDashoffset:0,duration:{r(dur)},ease:'none'}},{r(t)});")


def line_chart(sid, series, lo, hi, ticks, fmt, cw=936, ch=600, pad=(0, 48, 40, 110)):
    """A line chart's axes, gridlines and one path per series; returns (markup, point function)."""
    top, right, bottom, left = pad
    pw, ph = cw - left - right, ch - top - bottom
    x = lambda k: left + pw * k / (len(YEARS) - 1)
    y = lambda v: top + ph * (hi - v) / (hi - lo)
    svg = [f'<svg width="{cw}" height="{ch}" viewBox="0 0 {cw} {ch}">']
    ax = []
    for v in ticks:
        svg.append(f'<line x1="{left}" x2="{cw - right}" y1="{y(v):.1f}" y2="{y(v):.1f}" stroke="{GRID}" stroke-width="2"/>')
        ax.append(f'<div class="ax" style="left:0;top:{y(v) - 14:.0f}px">{fmt(v)}</div>')
    for k, yr in enumerate(YEARS):
        if k % 3 == 0 or k == len(YEARS) - 1:
            ax.append(f'<div class="ax" style="left:{x(k) - 32:.0f}px;top:{ch - 30}px">{yr}</div>')
    for name, values, color in series:
        d = "M" + " L".join(f"{x(k):.1f},{y(v):.1f}" for k, v in enumerate(values))
        svg.append(f'<path id="{sid}-{name}" d="{d}" pathLength="1" fill="none" stroke="{color}" stroke-width="6" '
                   f'stroke-linejoin="round" stroke-linecap="round" style="stroke-dasharray:1;stroke-dashoffset:1"/>')
    svg.append("</svg>")
    return "".join(svg) + "".join(ax), (lambda k, v: (x(k), y(v)))


def dot(sid, name, xy, color):
    return (f'<div id="{sid}-{name}" style="position:absolute;left:{xy[0] - 11:.0f}px;top:{xy[1] - 11:.0f}px;width:22px;height:22px;'
            f'border-radius:50%;background:{color};box-shadow:0 0 0 4px {BG}"></div>')


def wrap(sid, head, body, tl):
    d = slots[int(sid.split("-")[1])]
    tl.insert(0, f"tl.fromTo('#{sid}-stage',{{scale:1}},{{scale:1.025,duration:{r(d)},ease:'none'}},0);")
    return f"""<template>
<style>{CSS}</style>
<div id="root" data-composition-id="{sid}" data-width="{W}" data-height="{H}" data-start="0" data-duration="{r(d)}">
<div id="{sid}-stage" class="stage" data-layout-allow-overflow>
{head}
{''.join(body)}
</div>
<div class="src" data-layout-ignore>{SOURCE}</div>
</div>
<script>
const tl=gsap.timeline({{paused:true}});
{chr(10).join(tl)}
window.__timelines["{sid}"]=tl;
</script>
</template>
"""


def header(sid, tl, year, title):
    show(tl, f"#{sid}-year", .05, dx=-30, dy=0, dur=.45)
    show(tl, f"#{sid}-title", .25, dx=-24, dy=0, dur=.45)
    return (f'<div class="head"><div class="year" id="{sid}-year">{esc(year)}</div>'
            f'<div class="title" id="{sid}-title">{esc(title)}</div></div>')


def scene0():
    """The hook, readable on frame 0: the California–Texas gap ten years apart."""
    sid, tl = "scene-0", []
    head = (f'<div class="head"><div style="font-weight:700;font-size:40px;color:{MUTED};letter-spacing:4px">美国各州出生人数 · 2016–2025</div>'
            f'<div class="title" style="font-size:72px;margin-top:26px">加州比德州多出生</div></div>')
    body = [f'<div style="position:absolute;left:72px;top:470px"><div class="ax" style="position:static;font-size:40px">{YEARS[0]} 年</div>'
            f'<div style="font-weight:900;font-size:150px;line-height:1.05;color:{MUTED};font-variant-numeric:tabular-nums">{GAP0:,}<span style="font-size:56px"> 人</span></div></div>',
            f'<div id="{sid}-now" style="position:absolute;left:72px;top:730px"><div class="ax" style="position:static;font-size:40px;color:{INK}">{YEARS[-1]} 年</div>'
            f'<div style="font-weight:900;font-size:230px;line-height:1.05;letter-spacing:-6px;color:{GOLD};font-variant-numeric:tabular-nums">{GAP1:,}<span style="font-size:64px;letter-spacing:0"> 人</span></div></div>',
            f'<div id="{sid}-bar" style="position:absolute;left:78px;top:1046px;width:{int(900 * GAP1 / GAP0)}px;height:18px;background:{GOLD};border-radius:0 4px 4px 0;transform-origin:0 50%"></div>'
            f'<div style="position:absolute;left:78px;top:1076px;width:900px;height:18px;background:{GRID};border-radius:0 4px 4px 0"></div>',
            f'<div id="{sid}-q" class="note" style="top:1100px">这十年发生了什么？</div>']
    tl.append(f"tl.fromTo('#{sid}-bar',{{scaleX:{GAP0 / GAP1:.3f}}},{{scaleX:1,duration:.9,ease:'power3.inOut'}},{r(at(0, '八千四百') - .1)});")
    show(tl, f"#{sid}-q", at(0, "美国") - .1)
    body[-1] = body[-1].replace('top:1100px', 'top:1112px')
    return wrap(sid, head, body, tl)


def scene1():
    sid, tl = "scene-1", []
    head = header(sid, tl, "全国", "每年出生人数")
    svg, pt = line_chart(sid, [("nat", NAT, BLUE)], 3.5e6, 4.0e6, [3.5e6 + k * 1e5 for k in range(6)], lambda v: f"{v / 1e4:.0f}万")
    t0, t1 = at(1, "二零一六年"), at(1, "最近")
    draw(tl, f"#{sid}-nat", t0, t1 - t0)
    body = [f'<div class="chart">{svg}']
    for k, word, label, sub, dx, dy in [(0, "三百九十七万", wan(NAT[0]), f"{YEARS[0]} 年", -10, -96),
                                        (LOW, "三百五十八万", wan(NAT[LOW]), f"{YEARS[LOW]} 年 · 低点", -90, 26),
                                        (len(YEARS) - 1, "三百六十万", wan(NAT[-1]), f"{YEARS[-1]} 年", -150, 26)]:
        x, y = pt(k, NAT[k])
        body.append(dot(sid, f"p{k}", (x, y), INK))
        body.append(f'<div class="lab" id="{sid}-l{k}" style="left:{x + dx:.0f}px;top:{y + dy:.0f}px">{label}<small>{sub}</small></div>')
        tl.append(f"tl.fromTo('#{sid}-p{k}',{{opacity:0,scale:.3}},{{opacity:1,scale:1,duration:.3,ease:'back.out(2)'}},{r(at(1, word) - .1)});")
        show(tl, f"#{sid}-l{k}", at(1, word))
    body.append(f'<div class="call" id="{sid}-c" style="left:560px;top:20px">{NAT_PCT:.1f}%<small>十年变化</small></div></div>')
    show(tl, f"#{sid}-c", at(1, "百分之八点八") - .1, dy=20)
    body.append(f'<div class="note" id="{sid}-n">年份 = 上一年 7 月 1 日至当年 6 月 30 日</div>')
    show(tl, f"#{sid}-n", at(1, "这里") - .1)
    return wrap(sid, head, body, tl)


def scene2():
    sid, tl = "scene-2", []
    head = header(sid, tl, "加州 · 德州", "每年出生人数")
    svg, pt = line_chart(sid, [("ca", B[CA], BLUE), ("tx", B[TX], ORANGE)], 3.5e5, 5.0e5,
                         [3.5e5 + k * 5e4 for k in range(4)], lambda v: f"{v / 1e4:.0f}万")
    draw(tl, f"#{sid}-ca", at(2, "加州") - .1, 3.0)
    draw(tl, f"#{sid}-tx", at(2, "德州") - .1, 2.0)
    n = len(YEARS) - 1
    (cx, cy), (tx, ty) = pt(n, B[CA][-1]), pt(n, B[TX][-1])
    body = [f'<div class="chart">{svg}', dot(sid, "cad", (cx, cy), BLUE), dot(sid, "txd", (tx, ty), ORANGE),
            f'<div class="lab" id="{sid}-cl" style="left:{cx - 230:.0f}px;top:{cy - 150:.0f}px">加州 {wan(B[CA][-1])}<small>{pct(CA):.1f}%</small></div>',
            f'<div class="lab" id="{sid}-tl" style="left:{tx - 230:.0f}px;top:{ty + 30:.0f}px">德州 {wan(B[TX][-1])}<small>{pct(TX):.1f}%</small></div>',
            f'<div class="lab" id="{sid}-g0" style="left:130px;top:{pt(0, B[CA][0])[1] - 70:.0f}px;color:{MUTED}">{YEARS[0]} 年 加州 {wan(B[CA][0])}</div>',
            f'<div class="lab" id="{sid}-g1" style="left:130px;top:{pt(0, B[TX][0])[1] - 66:.0f}px;color:{MUTED}">德州 {wan(B[TX][0])}</div>',
            '</div>', f'<div class="note" id="{sid}-n">{YEARS[-1]} 年两州只差 {GAP1:,} 人（{YEARS[0]} 年差 {GAP0:,} 人）</div>']
    show(tl, f"#{sid}-g0", at(2, "加州") - .1)
    for k, (name, word) in enumerate([("cad", "百分之十八点五"), ("txd", "二零二五年")]):
        tl.append(f"tl.fromTo('#{sid}-{name}',{{opacity:0,scale:.3}},{{opacity:1,scale:1,duration:.3,ease:'back.out(2)'}},{r(at(2, word) - .1)});")
    show(tl, f"#{sid}-cl", at(2, "百分之十八点五") - .1)
    show(tl, f"#{sid}-g1", at(2, "德州") - .1)
    show(tl, f"#{sid}-tl", at(2, "二零二五年") - .1)
    show(tl, f"#{sid}-n", at(2, "持平") - .3)
    return wrap(sid, head, body, tl)


def tile_color(code):
    p = pct(code)
    return RED if p > 0 else DECLINE[min(int(-p // 5), 3)]


def scene3():
    sid, tl = "scene-3", []
    head = header(sid, tl, f"{len(B)}", "个州和地区 · 2016→2025 变化")
    pitch, left, top = 76, 72 + (936 - 11 * 76) // 2, 490
    body = ['<div class="legend">' + "".join(f'<span><i style="background:{c}"></i>{t}</span>' for c, t in
            [(RED, "增加"), (DECLINE[0], "0~5%"), (DECLINE[1], "5~10%"), (DECLINE[2], "10~15%"), (DECLINE[3], "15% 以上")])
            + '<span>（减少）</span></div>']
    order = []
    for row, line in enumerate(GRID_ROWS):
        for col in range(len(line) // 2):
            a = line[2 * col:2 * col + 2]
            if a == "..":
                continue
            c = FIPS[a]
            cls = f"tile {sid}-t" + (f" {sid}-up" if c in GREW else "") + (f" {sid}-o15" if c in OVER15 else "")
            body.append(f'<div id="{sid}-{a}" class="{cls}" style="left:{left + col * pitch}px;top:{top + row * pitch}px">{a}</div>')
            order.append(c)
    if sorted(order) != sorted(B):
        raise SystemExit("Tile grid must hold every state exactly once")
    tl.append(f"tl.fromTo('.{sid}-t',{{opacity:0,scale:.6}},{{opacity:1,scale:1,duration:.3,ease:'back.out(2)',stagger:.02}},{r(at(3, '五十') - .1)});")
    for c in order:  # colour by the change once the whole map is on screen
        tl.append(f"tl.to('#{sid}-{ABBR[c]}',{{backgroundColor:'{tile_color(c)}',duration:.3,ease:'none'}},{r(at(3, '一起'))});")
    tl.append(f"tl.fromTo('.{sid}-up',{{scale:1}},{{scale:1.18,duration:.25,ease:'power2.out',yoyo:true,repeat:1}},{r(at(3, '四') - .1)});")
    tl.append(f"tl.fromTo('.{sid}-o15',{{boxShadow:'0 0 0 0px {INK}'}},{{boxShadow:'0 0 0 4px {INK}',duration:.3,ease:'none'}},{r(at(3, '九个') - .1)});")
    names = "、".join(SHORT.get(ABBR[c], ZH[ABBR[c]]) for c in sorted(GREW, key=lambda c: ["NC", "SC", "TN", "ID"].index(ABBR[c])))
    body.append(f'<div class="note" id="{sid}-n" style="top:1116px">只有 {len(GREW)} 个州增加：{names}</div>')
    show(tl, f"#{sid}-n", at(3, "只有") - .1)
    return wrap(sid, head, body, tl)


def bar_rows(sid, tl, rows, vmax, color_of):
    """Horizontal zero-based bars: (code or None, name, value, value label, reveal time)."""
    out = ['<div class="bars">']
    for k, (code, name, value, label, t) in enumerate(rows):
        w = 780 * abs(value) / vmax
        color = color_of(code)
        out.append(f'<div class="bar" id="{sid}-b{k}"><b style="color:{INK if code else MUTED}">{esc(name)}</b>'
                   f'<span id="{sid}-s{k}" style="width:{w:.0f}px;background:{color}"></span>'
                   f'<em style="left:{w + 16:.0f}px;color:{INK if code else MUTED}">{label}</em></div>')
        show(tl, f"#{sid}-b{k}", t, dx=-30, dy=0)
        tl.append(f"tl.fromTo('#{sid}-s{k}',{{scaleX:0}},{{scaleX:1,duration:.6,ease:'power3.out'}},{r(max(t, .05))});")
    return out + ["</div>"]


def scene4():
    sid, tl = "scene-4", []
    head = header(sid, tl, "降幅", "前五名 · 2016→2025")
    words = ["华盛顿", "阿拉斯加", "怀俄明", "夏威夷", "伊利诺伊"]
    rows = [(c, ZH[ABBR[c]], pct(c), f"{pct(c):.1f}%", at(4, w) - .1) for c, w in zip(DROPS, words)]
    rows.append((None, "全国", NAT_PCT, f"{NAT_PCT:.1f}%", .6))
    body = bar_rows(sid, tl, rows, 25, lambda c: tile_color(c) if c else GRID)
    return wrap(sid, head, body, tl)


def scene5():
    sid, tl = "scene-5", []
    head = header(sid, tl, f"{YEARS[-1]}", "比上一年")
    diff = lambda c: B[c][-1] - B[c][-2]
    rows = [(c, ZH[ABBR[c]], diff(c), f"+{diff(c):,}", at(5, "佛罗里") - .1 if k == 0 else at(5, "增量") + .1 + .15 * k)
            for k, c in enumerate(YOY[:4])]
    body = [f'<div class="call" id="{sid}-c" style="left:72px;top:440px;font-size:80px">{len(YOY_UP)} 个州增加'
            f'<small>其余 {len(B) - len(YOY_UP)} 个减少</small></div>']
    show(tl, f"#{sid}-c", at(5, "三十二") - .1, dy=20)
    bars = bar_rows(sid, tl, rows, diff(YOY[0]) * 1.12, lambda c: RED)
    bars[0] = '<div class="bars" style="top:620px">'
    body += bars
    body.append(f'<div class="note" id="{sid}-n" style="border-left-color:{BLUE}">全国仍比 {YEARS[0]} 年少 {wan(NAT[0] - NAT[-1])} 人'
                f'（{wan(NAT[-1])} 对 {wan(NAT[0])}）</div>')
    show(tl, f"#{sid}-n", at(5, "仍") - .2)
    return wrap(sid, head, body, tl)


SCENES = [scene0, scene1, scene2, scene3, scene4, scene5]


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
    """Single-frame release cover (npm run render:still): the two lines closing in."""
    css = CSS.replace("url('assets/", "url('../assets/")
    svg, pt = line_chart("poster", [("ca", B[CA], BLUE), ("tx", B[TX], ORANGE)], 3.5e5, 5.0e5,
                         [3.5e5 + k * 5e4 for k in range(4)], lambda v: f"{v / 1e4:.0f}万")
    svg = svg.replace("stroke-dashoffset:1", "stroke-dashoffset:0")
    n = len(YEARS) - 1
    (cx, cy), (tx, ty) = pt(n, B[CA][-1]), pt(n, B[TX][-1])
    (P / "poster").mkdir(exist_ok=True)
    (P / "poster" / "index.html").write_text(f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={W},height={H}">
<title>美国各州出生人数 · 封面</title>
<script src="../assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}{css}
.kicker{{position:absolute;left:72px;top:190px;font-weight:700;font-size:40px;letter-spacing:6px;color:{MUTED}}}
.big{{position:absolute;left:66px;top:250px;font-weight:900;font-size:120px;line-height:1.15;letter-spacing:-2px}}
.big em{{font-style:normal;color:{GOLD}}}
.chart{{top:640px}}
</style>
</head>
<body>
<!-- 发版封面：npm run render:still 截取第一帧输出 out/cover.png；由 build.py 生成 -->
<div id="root" data-composition-id="births-us-poster" data-start="0" data-duration="1" data-width="{W}" data-height="{H}">
<div class="kicker">美国各州出生人数 · {YEARS[0]}–{YEARS[-1]}</div>
<div class="big">加州与德州<br>只差 <em>{GAP1:,}</em> 人</div>
<div class="chart">{svg}{dot("poster", "cad", (cx, cy), BLUE)}{dot("poster", "txd", (tx, ty), ORANGE)}
<div class="lab" style="left:{cx - 230:.0f}px;top:{cy - 150:.0f}px">加州 {wan(B[CA][-1])}<small>{pct(CA):.1f}%</small></div>
<div class="lab" style="left:{tx - 230:.0f}px;top:{ty + 30:.0f}px">德州 {wan(B[TX][-1])}<small>{pct(TX):.1f}%</small></div></div>
<div class="note" style="top:1300px">全国十年减少 {-NAT_PCT:.1f}% · 只有 {len(GREW)} 个州增加</div>
<div class="src" data-layout-ignore>{SOURCE}</div>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["births-us-poster"]=gsap.timeline({{paused:true}});
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
    chars = set(re.sub(r"<[^>]+>", " ", text)) | set("0123456789+-—·.,/%~→（）？年月日万人")
    out = P / "assets" / "fonts"; out.mkdir(parents=True, exist_ok=True)
    for weight, style in FONT_FILES.items():
        ttc = TTCollection(f"/usr/share/fonts/opentype/noto/NotoSansCJK-{style}.ttc")
        font = next(f for f in ttc.fonts if f["name"].getDebugName(1) == "Noto Sans CJK SC")
        opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]
        sub = subset.Subsetter(opts); sub.populate(text="".join(sorted(chars))); sub.subset(font)
        font.flavor = "woff2"; font.save(out / f"noto-sans-sc-{weight}.woff2")


def build():
    (P / "compositions").mkdir(exist_ok=True)
    for i, scene in enumerate(SCENES):
        (P / "compositions" / f"scene-{i}.html").write_text(scene(), encoding="utf-8")
    groups = caption_groups()
    caps, ctl = [], []
    for k, (a, b, text) in enumerate(groups):
        caps.append(f'<div id="cap-{k}" class="clip cap" data-start="{r(a)}" data-duration="{r(b - a)}" data-track-index="1"><span>{esc(text)}</span></div>')
        ctl.append(f"tl.fromTo('#cap-{k} span',{{opacity:0}},{{opacity:1,duration:.12,ease:'none'}},{r(a)});")
    cap_css = (FONT_FACE + f"#root{{position:absolute;inset:0;font-family:{FONT}}}"
               ".cap{position:absolute;left:0;top:1220px;width:1080px;text-align:center}"
               f".cap span{{display:inline-block;max-width:900px;padding:10px 22px;background:rgba(12,12,11,.86);border-radius:8px;"
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
<title>美国各州出生人数 2016–2025</title>
<script src="assets/gsap.min.js"></script>
<style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:{BG}}}#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style>
</head>
<body>
<div id="root" data-composition-id="births-us" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}" data-fps="30">
{hosts}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>
<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{r(sum(durs))}" data-track-index="3" data-volume="1"></audio>
</div>
<script>
window.__timelines=window.__timelines||{{}};
window.__timelines["births-us"]=gsap.timeline({{paused:true}});
</script>
</body>
</html>
""", encoding="utf-8")
    build_poster()
    subset_fonts()
    print(f"Built {len(SCENES)} scenes, {len(groups)} caption groups, {TOTAL:.3f}s")


if __name__ == "__main__":
    build()
