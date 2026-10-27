"""Rebuild deterministic composition and captions from Edge TTS word boundaries."""
from pathlib import Path
import json, re, html
P=Path(__file__).resolve().parent
esc=html.escape
paras=(P/'public/voiceover/narration.zh.txt').read_text().strip().split('\n\n')
ds=json.loads((P/'public/voiceover/segment-durations.json').read_text())
marks=json.loads((P/'public/voiceover/word-marks.json').read_text())
starts=[]; t=0
for d in ds: starts.append(t); t+=d
T=round(t+2,3)
land=json.loads((P/'assets/land-paths.json').read_text())
# Fixed north-up geographical extent. Map coordinates are independent of frame time.
west,east,south,north=113.75,114.14,22.43,22.78
W,H=936,910
def xy(lon,lat): return ((lon-west)/(east-west)*W,(north-lat)/(north-south)*H)
nodes=[('蛇口',113.918,22.482,570,768),('后海',113.945,22.510,692,644),('宝安中心',113.887,22.553,245,541),('机场',113.814,22.639,80,284),('前海',113.886,22.524,230,625),('港区',113.865,22.501,160,724),('红树林',114.005,22.525,690,524)]
scene=[
('1979—至今','向海生长的','深圳','一部海岸变迁史','总览',list(range(7)),'工业起步 → 城市拓展 → 生态保护'),
('1979','蛇口','开山填海','临港工业，拉开建设序幕','工业起点',[0],'港口 · 工厂 · 基础设施'),
('1990年代','后海','城市向海延伸','从临港生产，走向城市生活','城市拓展',[1],'开发持续推进，阶段彼此重叠'),
('2000年代','宝安西岸','枢纽与新城','机场、港区与城市空间共同拓展','功能扩展',[2,3,5],'机场扩建 · 港口物流 · 新城建设'),
('2010','前海','从土地到产业','总体发展规划获批，服务业成为主题','产业转型',[4],'规划获批 ≠ 填海起点'),
('2018起','海岸开发','进入严控阶段','滨海湿地保护与生态修复受到重视','生态转向',[6],'例外：国家重大战略项目按程序报批'),
('发展与保护','改变海岸','也守护海洋','深圳填海史，是空间与发展方式的变迁','面向未来',list(range(7)),'如何让发展与海洋生态共存？')
]
colors=['#ffca78','#ffca78','#ffca78','#ffca78','#ffca78','#8fe3b7','#8fe3b7']

def map_svg(i,active):
 col=colors[i]
 grid=''.join(f'<path d="M{x} 0 V{H}"/>' for x in range(0,W,117))+''.join(f'<path d="M0 {y} H{W}"/>' for y in range(0,H,130))
 paths=''.join(f'<path d="{d}"/>' for d in land)
 # Radii locate thematic areas; they deliberately do not purport to be reclamation polygons.
 circles='';labels=''
 for k,(name,lon,lat,lx,ly) in enumerate(nodes):
  x,y=xy(lon,lat);on=k in active;c=col if on else '#a8c6cc'
  if on:
   circles+=f'<g class="focus focus-{k}"><circle cx="{x:.1f}" cy="{y:.1f}" r="39" fill="{col}" fill-opacity=".18" stroke="{col}" stroke-width="2"/><circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="{col}"/></g>'
  else: circles+=f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{c}"/>'
  labels+=f'<g class="map-label map-label-{k}"><path d="M{x:.1f} {y:.1f} L{lx+12} {ly-12}" fill="none" stroke="{c}" stroke-width="1.5"/><rect x="{lx-10}" y="{ly-35}" width="{len(name)*32+20}" height="47" rx="8" fill="#102e3b"/><text x="{lx}" y="{ly}" fill="{c}" font-size="31" font-weight="{700 if on else 400}">{name}</text></g>'
 sea=''.join(f'<text x="{x}" y="{y}" fill="#a3c3ca" font-size="{sz}" letter-spacing="{sp}">{txt}</text>' for x,y,sz,sp,txt in [(52,600,38,5,'珠江口'),(685,790,32,4,'深圳湾'),(740,325,42,8,'深圳'),(677,885,31,5,'香港')])
 # Land and coastline are Natural Earth generalized present-day context, not a historical survey.
 return f'''<svg class="map-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" aria-label="深圳西部海岸区位示意"><defs><clipPath id="map-clip-{i}"><rect width="{W}" height="{H}" rx="24"/></clipPath></defs><g clip-path="url(#map-clip-{i})"><rect width="{W}" height="{H}" fill="#102f40"/><g stroke="#789fac" stroke-opacity=".12" stroke-width="1">{grid}</g><g fill="#28505a" stroke="#83aeb4" stroke-width="2">{paths}</g>{sea}{circles}{labels}<g fill="#f5f1e6"><path d="M862 45 L850 77 L862 70 L874 77 Z"/><text x="851" y="107" font-size="24">N</text></g></g></svg>'''

sections=[]; anim=[]
for i,(year,line1,line2,sub,tag,active,note) in enumerate(scene):
 s=starts[i];d=ds[i]+(2 if i==6 else 0);col=colors[i]
 pol='<div class="policy"><strong>全面停止新增围填海项目审批</strong><span>除国家重大战略项目外</span></div>' if i==5 else ''
 sections.append(f'''<section id="scene-{i}" class="clip scene" data-scene="{i}" data-start="{s:.3f}" data-duration="{d:.3f}" data-track-index="1"><div class="scene-inner" style="--accent:{col}"><div class="eyebrow"><span>海岸档案 / 深圳</span><span>{i+1:02d} / 07</span></div><div class="year">{year}</div><div class="title"><div>{line1}</div><div style="color:{col}">{line2}</div></div><div class="sub">{sub}</div><div class="map-wrap">{map_svg(i,active)}<div class="map-tag">{tag}</div></div><div class="map-caption"><span style="color:{col}">● 开发／保护重点区位</span><span>北向上 · 西部海岸局部</span></div><div class="note">{note}</div>{pol}<div class="rail">{''.join(f'<b style="background:{col if k<=i else "#34515e"}"></b>' for k in range(7))}</div><div class="map-disclaimer">区位示意 · 圆圈不代表填海边界或面积</div></div></section>''')
 # Scene inner elements animate, while framework owns timed section visibility.
 anim.append(f'''tl.fromTo('#scene-{i} .year',{{opacity:0,y:18}},{{opacity:1,y:0,duration:.48,ease:'power2.out'}},{s+.03:.3f});
tl.fromTo('#scene-{i} .title',{{opacity:0,y:25}},{{opacity:1,y:0,duration:.6,ease:'power3.out'}},{s+.15:.3f});
tl.fromTo('#scene-{i} .map-wrap',{{opacity:0}},{{opacity:1,duration:.7}},{s+.1:.3f});
tl.fromTo('#scene-{i} .focus',{{opacity:0}},{{opacity:1,duration:.65,stagger:.32,ease:'power2.out'}},{s+.6:.3f});
tl.fromTo('#scene-{i} .note',{{opacity:0,y:12}},{{opacity:1,y:0,duration:.5}},{s+min(d*.42,4):.3f});''')
# Caption chunks align to Edge word marks via character offsets, punctuation ignored.
norm=lambda s: ''.join(c for c in s if c.isalnum())
captions=[];srt=[];num=1
for i,para in enumerate(paras):
 clean=norm(para);wordpos=[];cursor=0
 for w in marks[i]:
  q=norm(w['text']);pos=clean.find(q,cursor)
  if pos>=0:
   wordpos.append((pos,float(w['start'])));cursor=pos+len(q)
 chunks=[]
 for sentence in re.split(r'[，。！？：；]',para):
  if not sentence:continue
  while len(sentence)>21:
   chunks.append(sentence[:18]);sentence=sentence[18:]
  if sentence:chunks.append(sentence)
 cursor=0;ct=[]
 for chunk in chunks:
  q=norm(chunk);pos=clean.find(q,cursor)
  if pos<0:pos=cursor
  cursor=pos+len(q)
  local=next((tm for wp,tm in wordpos if wp>=pos),ds[i]*pos/max(1,len(clean)))
  ct.append((starts[i]+local,chunk))
 for k,(s,chunk) in enumerate(ct):
  e=ct[k+1][0] if k+1<len(ct) else starts[i]+ds[i]
  if e<=s:continue
  captions.append(f'<div id="caption-{num}" class="clip caption" data-start="{s:.3f}" data-duration="{e-s:.3f}" data-track-index="3">{esc(chunk)}</div>')
  def stamp(v):
   ms=round(v*1000);return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'
  srt.append(f'{num}\n{stamp(s)} --> {stamp(e)}\n{chunk}\n');num+=1
(P/'public/voiceover/subtitles.zh.srt').write_text('\n'.join(srt))
css='''@font-face{font-family:"Noto Sans SC";src:url("assets/noto-sc.woff2") format("woff2");font-weight:100 900;font-display:block}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#091e2b;color:#f5f1e6;font-family:"Noto Sans SC",sans-serif}#root{position:relative;width:100%;height:100%;overflow:hidden}.scene{position:absolute;inset:0;background:#091e2b}.scene-inner{position:absolute;inset:0;padding:68px 72px}.eyebrow{display:flex;justify-content:space-between;letter-spacing:3px;font-size:24px;color:#a3c3ca}.year{font-size:86px;line-height:1.25;font-weight:800;color:var(--accent);margin-top:28px;letter-spacing:-2px}.title{font-size:67px;font-weight:850;line-height:1.22;letter-spacing:-1px;margin-top:14px}.sub{font-size:27px;line-height:1.6;color:#c4d6d7;margin-top:18px}.map-wrap{position:absolute;left:72px;top:498px;width:936px;height:910px;border:1px solid #42616b;border-radius:24px;overflow:hidden}.map-svg{display:block;width:936px;height:910px}.map-tag{position:absolute;left:27px;top:25px;background:#091e2b;color:var(--accent);font-size:26px;padding:10px 22px;border-radius:30px;letter-spacing:3px}.map-caption{position:absolute;top:1428px;left:78px;right:78px;display:flex;justify-content:space-between;font-size:21px;color:#a3c3ca}.note{position:absolute;top:1480px;left:74px;right:74px;font-size:28px;line-height:1.5;color:var(--accent)}.rail{position:absolute;top:1736px;left:74px;right:74px;display:flex;gap:11px}.rail b{height:5px;flex:1;border-radius:4px}.map-disclaimer{position:absolute;top:1764px;left:74px;font-size:20px;color:#a3c3ca;letter-spacing:1px}.caption{position:absolute;left:72px;right:72px;top:1600px;height:100px;display:flex;justify-content:center;align-items:center;text-align:center;font-size:41px;font-weight:600;line-height:1.55;color:#f5f1e6;z-index:20}.caption>div{background:#091e2b;padding:12px 18px;border-radius:10px}.policy{position:absolute;left:74px;top:1540px;right:74px;font-size:23px;display:flex;justify-content:space-between;gap:10px;color:#d9eadf}.policy strong{font-weight:500}.policy span{color:#8fe3b7}'''
htmltext=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920"><title>深圳填海造陆发展史</title><script src="assets/gsap.min.js"></script><style>{css}</style></head><body><div id="root" data-composition-id="shenzhen-reclamation" data-width="1080" data-height="1920" data-duration="{T}" data-fps="30">{''.join(sections)}{''.join(captions)}<audio id="narration" src="public/voiceover/narration.zh.mp3" data-start="0" data-duration="{t:.3f}" data-track-index="2"></audio></div><script>const tl=gsap.timeline({{paused:true}});{''.join(anim)}window.__timelines['shenzhen-reclamation']=tl;</script></body></html>'''
(P/'compositions').mkdir(exist_ok=True)
hosts=[]
for i,section in enumerate(sections):
    start=starts[i]; duration=ds[i]+(2 if i==6 else 0)
    local=section.replace(f'id="scene-{i}" class="clip scene"', 'id="root" class="clip"').replace('<div class="scene-inner"',f'<div id="scene-{i}" class="scene-inner"').replace(f'data-start="{start:.3f}"', 'data-start="0"', 1).replace(f'data-scene="{i}"',f'data-composition-id="scene-{i}" data-width="1080" data-height="1920"')
    motion=anim[i]
    motion=re.sub(r'\},([0-9]+\.[0-9]+)\);',lambda m:'},'+f'{float(m.group(1))-start:.3f}'+');',motion)
    sub=f'<template><style>{css}</style>{local}<script>const tl=gsap.timeline({{paused:true}});{motion}window.__timelines["scene-{i}"]=tl;</script></template>'
    (P/f'compositions/scene-{i}.html').write_text(sub)
    hosts.append(f'<div id="host-{i}" class="clip scene" data-composition-id="scene-{i}" data-composition-src="compositions/scene-{i}.html" data-start="{start:.3f}" data-duration="{duration:.3f}" data-track-index="{i+1}"></div>')
htmltext=htmltext.replace(''.join(sections),''.join(hosts)).replace(''.join(anim),'')
(P/'index.html').write_text(htmltext)
(P/'audio_meta.json').write_text(json.dumps({'provider':'edge-tts','voice':'zh-CN-YunxiNeural','rate':'+10%','duration':t,'total':T,'scenes':[{'start':s,'duration':d} for s,d in zip(starts,ds)]},indent=2))
print(f'Built 7 scenes, {num-1} caption cues, duration {T:.3f}s')
