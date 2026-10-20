import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {notoSansJP} from './fonts';
import {IslandMap} from './IslandMap';
import {AUDIO_END, SceneId, cue, sceneById, useEntrance, useSceneOpacity} from './timing';

const C = {bg: '#071820', panel: 'rgba(16,43,53,.82)', text: '#f7f2e8', muted: '#a8bdc5', gold: '#f9c74f', coral: '#ef7b62', cyan: '#56c7d5', line: 'rgba(151,194,205,.22)'};
const font: React.CSSProperties = {fontFamily: `${notoSansJP.fontFamily}, sans-serif`};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Seconds elapsed since the start of scene `id`. */
const useLocal = (id: SceneId) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps - sceneById(id).start;
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.22;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 75% 18%, rgba(38,112,124,.34), transparent 34%), linear-gradient(155deg, ${C.bg}, #0b2630 54%, #07141b)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: -100, transform: `translateY(${drift % 64}px)`, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: '64px 64px', opacity: .18}} />
    {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: -160, top: 280 + i * 360 + Math.sin(frame / 40 + i) * 18, width: 1400, height: 220, border: '2px solid rgba(86,199,213,.09)', borderRadius: '50%'}} />)}
  </AbsoluteFill>;
};

const Scene: React.FC<{id: SceneId; children: React.ReactNode; center?: boolean}> = ({id, children, center = false}) => {
  const opacity = useSceneOpacity(id);
  return <AbsoluteFill style={{opacity, visibility: opacity > 0 ? 'visible' : 'hidden', padding: '150px 78px 140px', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', textAlign: 'center'}}>{children}</AbsoluteFill>;
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{...font, color: C.gold, fontSize: 30, letterSpacing: 8, fontWeight: 800, marginBottom: 30}}>{children}</div>;
const BigTitle: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 88}) => <div style={{...font, color: C.text, fontSize: size, lineHeight: 1.16, letterSpacing: -3, fontWeight: 900}}>{children}</div>;
const Rise: React.FC<{e: {opacity: number; y: number}; children: React.ReactNode; style?: React.CSSProperties}> = ({e, children, style}) => <div style={{opacity: e.opacity, transform: `translateY(${e.y}px)`, ...style}}>{children}</div>;

/* 1 — Intro: title on top, the whole island chain below (no longer cropped). */
const Intro: React.FC = () => {
  const local = useLocal('intro');
  const a = useEntrance('intro', .2, .8), b = useEntrance('intro', .7, .9), c = useEntrance('intro', cue('intro', '南'), .7);
  return <Scene id="intro">
    <div style={{marginTop: 120}}>
      <Rise e={a}><Kicker>NORTHWEST PACIFIC</Kicker></Rise>
      <div style={{opacity: b.opacity, transform: `translateY(${b.y}px) scale(${b.scale})`}}>
        <BigTitle size={128}>南千島群島</BigTitle>
        <div style={{...font, fontSize: 38, fontWeight: 700, color: C.muted, marginTop: 26}}>南クリル諸島 ／ 北方領土</div>
      </div>
      <div style={{width: 600, height: 5, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, margin: '52px auto', opacity: c.opacity}} />
      <div style={{...font, fontSize: 44, fontWeight: 700, lineHeight: 1.55, color: C.text, opacity: c.opacity}}>海と火山、そして<br />二つの国の記憶が交わる場所</div>
    </div>
    <div style={{position: 'absolute', left: '50%', bottom: 120, transform: `translateX(-50%) scale(${1 + local * 0.012})`, transformOrigin: '50% 100%', opacity: .5}}>
      <IslandMap sceneId="intro" labels={false} width={560} />
    </div>
  </Scene>;
};

/* 2 — Location: islands light up as the narration names them. */
const Location: React.FC = () => {
  const local = useLocal('location');
  const reveal = ['歯舞', '色丹', '国後', '択捉'].map((w) => cue('location', w));
  const name = useEntrance('location', cue('location', '北方領土'), .6);
  return <Scene id="location">
    <div style={{position: 'absolute', top: 150, left: 78, textAlign: 'left'}}>
      <Kicker>WHERE THEY ARE</Kicker>
      <BigTitle size={72}>北海道の北東へ</BigTitle>
      <div style={{...font, color: C.muted, fontSize: 26, fontWeight: 600, marginTop: 16}}>図は位置関係を示す概念図</div>
    </div>
    <div style={{position: 'absolute', left: 60, right: 40, top: 420, bottom: 120, display: 'flex', justifyContent: 'center', transform: `scale(${1 + local * 0.006})`}}>
      <IslandMap sceneId="location" width={760} revealAt={reveal} />
    </div>
    <Rise e={name} style={{position: 'absolute', right: 78, bottom: 170, background: C.panel, border: `2px solid ${C.gold}`, borderRadius: 24, padding: '22px 30px', textAlign: 'left'}}>
      <div style={{...font, color: C.muted, fontSize: 26, fontWeight: 700}}>日本での呼び方</div>
      <div style={{...font, color: C.gold, fontSize: 52, fontWeight: 900, marginTop: 4}}>北方領土</div>
    </Rise>
  </Scene>;
};

/* 3 — Scale: total area, a familiar comparison, and Etorofu's share. */
const AREAS = [{n: '択捉島', v: 3168}, {n: '国後島', v: 1490}, {n: '色丹島', v: 251}, {n: '歯舞群島', v: 95}];
const TOTAL = 5003;
const TOKYO = 2194;
const Scale: React.FC = () => {
  const local = useLocal('scale');
  const t0 = cue('scale', '五千');
  const total = useEntrance('scale', t0 - .2, .6);
  const count = Math.round(interpolate(local, [t0 - .2, t0 + .5], [3000, TOTAL], clamp));
  const compare = useEntrance('scale', cue('scale', 'キロ') + .3, .6);
  const tE = cue('scale', '択捉島');
  const focus = interpolate(local, [tE, tE + .5], [0, 1], clamp);
  return <Scene id="scale" center>
    <Kicker>FOUR ISLANDS</Kicker>
    <BigTitle size={70}>四島の広さ</BigTitle>
    <Rise e={total} style={{marginTop: 50}}>
      <div style={{...font, color: C.text, fontSize: 168, fontWeight: 900, letterSpacing: -6, lineHeight: 1}}>{count.toLocaleString()}<span style={{fontSize: 64, letterSpacing: 0}}> km²</span></div>
      <div style={{...font, color: C.muted, fontSize: 32, fontWeight: 700, marginTop: 14}}>四島の合計面積（約）</div>
    </Rise>
    <Rise e={compare} style={{marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 999, padding: '16px 36px'}}>
      <span style={{...font, color: C.muted, fontSize: 30, fontWeight: 700}}>東京都（{TOKYO.toLocaleString()} km²）の</span>
      <span style={{...font, color: C.gold, fontSize: 44, fontWeight: 900}}>約{(TOTAL / TOKYO).toFixed(1)}倍</span>
    </Rise>
    <div style={{width: '100%', display: 'grid', gap: 44, marginTop: 90}}>
      {AREAS.map((item, i) => {
        const e = useEntrance('scale', 1.0 + i * .25, .6);
        const isE = i === 0;
        const dim = isE ? 1 : 1 - focus * .5;
        return <div key={item.n} style={{opacity: e.opacity * dim, textAlign: 'left'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12}}>
            <span style={{...font, color: C.text, fontSize: 38, fontWeight: 900}}>{item.n}</span>
            <span style={{...font, color: isE ? C.gold : C.muted, fontSize: 32, fontWeight: 800}}>{item.v.toLocaleString()} km² · {Math.round((item.v / TOTAL) * 100)}%</span>
          </div>
          <div style={{height: 40, background: 'rgba(255,255,255,.08)', borderRadius: 30, overflow: 'hidden'}}>
            <div style={{width: `${(item.v / AREAS[0].v) * 100 * e.opacity}%`, height: '100%', background: `linear-gradient(90deg,${C.gold},${C.coral})`, borderRadius: 30, boxShadow: isE ? `0 0 ${30 * focus}px rgba(249,199,79,.7)` : undefined}} />
          </div>
        </div>;
      })}
    </div>
    <div style={{...font, marginTop: 56, color: C.gold, fontSize: 48, fontWeight: 900, opacity: focus}}>択捉島だけで六割以上</div>
  </Scene>;
};

/* 4 — Nature: one card per thing the narration names, highlighted in turn. */
const NATURE = [
  {k: '火', word: '火山', t: '火山', d: '島々をかたちづくる火山の連なり', c: C.coral},
  {k: '氷', word: '流氷', t: '流氷', d: '冬にはオホーツク海から流氷が届く', c: C.cyan},
  {k: '森', word: '針葉樹', t: '針葉樹の森', d: '寒冷な気候に育つ森', c: '#7bc47f'},
  {k: '海', word: '栄養', t: '栄養豊かな海', d: '寒流が育む豊かな漁場', c: C.gold},
];
const Nature: React.FC = () => {
  const local = useLocal('nature');
  const starts = NATURE.map((n) => cue('nature', n.word));
  const all = local >= cue('nature', '生態系');
  const current = starts.filter((t) => local >= t).length - 1;
  return <Scene id="nature" center>
    <Kicker>FIRE · ICE · FOREST · OCEAN</Kicker>
    <BigTitle size={76}>火と氷のあいだ</BigTitle>
    <div style={{marginTop: 70, width: '100%', display: 'grid', gap: 30}}>
      {NATURE.map((x, i) => {
        const e = useEntrance('nature', starts[i], .55);
        const active = all || i === current;
        return <Rise key={x.k} e={e} style={{display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', textAlign: 'left', background: C.panel, border: `2px solid ${active ? x.c : C.line}`, borderRadius: 30, padding: '40px 40px', boxShadow: active ? `0 0 40px ${x.c}33` : undefined, opacity: e.opacity * (active ? 1 : .55)}}>
          <div style={{...font, fontSize: 104, fontWeight: 900, color: x.c, lineHeight: 1}}>{x.k}</div>
          <div>
            <div style={{...font, fontSize: 48, fontWeight: 900, color: C.text}}>{x.t}</div>
            <div style={{...font, fontSize: 30, fontWeight: 600, color: C.muted, marginTop: 10}}>{x.d}</div>
          </div>
        </Rise>;
      })}
    </div>
    <div style={{...font, marginTop: 50, color: C.text, fontSize: 38, fontWeight: 800, opacity: all ? 1 : 0}}>独特の生態系が育まれる</div>
  </Scene>;
};

/* 5 — History: the timeline advances with the narration. */
const History: React.FC = () => {
  const local = useLocal('history');
  const starts = [cue('history', '一八五五年'), cue('history', '一九四五年'), cue('history', '五六年')];
  const current = starts.filter((t) => local >= t).length - 1;
  const border = useEntrance('history', cue('history', '国境'), .6);
  const unresolved = useEntrance('history', cue('history', '領土'), .6);
  const events = [
    {y: '1855', t: '日露通好条約', d: '択捉島と得撫島の間に国境を定める'},
    {y: '1945', t: 'ソ連が四島を占領', d: '終戦前後の8〜9月に支配が移る'},
    {y: '1956', t: '日ソ共同宣言', d: '国交回復。平和条約締結後の歯舞群島・色丹島の引き渡しを明記'},
  ];
  const lineH = interpolate(local, [starts[0], starts[0] + .6, starts[1], starts[1] + .6, starts[2], starts[2] + .6], [0, 22, 22, 60, 60, 100], clamp);
  return <Scene id="history">
    <Kicker>THREE DATES</Kicker>
    <BigTitle size={76}>境界をめぐる歴史</BigTitle>
    <div style={{position: 'relative', width: '100%', marginTop: 80, textAlign: 'left'}}>
      <div style={{position: 'absolute', left: 30, top: 20, bottom: 20, width: 6, background: 'rgba(255,255,255,.08)', borderRadius: 3}}>
        <div style={{height: `${lineH}%`, background: `linear-gradient(${C.gold},${C.coral})`, borderRadius: 3}} />
      </div>
      {events.map((e, i) => {
        const a = useEntrance('history', starts[i], .6);
        const active = i === current;
        return <div key={e.y} style={{position: 'relative', paddingLeft: 100, marginBottom: 64, opacity: a.opacity * (active ? 1 : .45), transform: `translateY(${a.y}px)`}}>
          <div style={{position: 'absolute', left: 14, top: 22, width: 38, height: 38, borderRadius: '50%', background: C.bg, border: `7px solid ${i === 2 ? C.coral : C.gold}`, boxShadow: active ? `0 0 24px ${C.gold}` : undefined}} />
          <div style={{...font, color: C.gold, fontSize: 72, fontWeight: 900, lineHeight: 1}}>{e.y}</div>
          <div style={{...font, color: C.text, fontSize: 48, fontWeight: 900, marginTop: 14}}>{e.t}</div>
          <div style={{...font, color: C.muted, fontSize: 30, fontWeight: 600, lineHeight: 1.5, marginTop: 10}}>{e.d}</div>
          {i === 0 && <Rise e={border} style={{display: 'flex', alignItems: 'center', gap: 0, marginTop: 24}}>
            <div style={{...font, background: 'rgba(86,199,213,.15)', border: `2px solid ${C.cyan}`, borderRadius: '18px 0 0 18px', padding: '12px 26px', color: C.text, fontSize: 30, fontWeight: 800}}>択捉島 <span style={{color: C.cyan, fontSize: 24}}>日本</span></div>
            <div style={{width: 6, alignSelf: 'stretch', background: `repeating-linear-gradient(${C.gold} 0 10px, transparent 10px 18px)`}} />
            <div style={{...font, background: 'rgba(239,123,98,.15)', border: `2px solid ${C.coral}`, borderRadius: '0 18px 18px 0', padding: '12px 26px', color: C.text, fontSize: 30, fontWeight: 800}}>得撫島 <span style={{color: C.coral, fontSize: 24}}>ロシア</span></div>
          </Rise>}
        </div>;
      })}
    </div>
    <Rise e={unresolved} style={{...font, marginTop: 10, background: 'rgba(239,123,98,.14)', border: `2px solid ${C.coral}`, borderRadius: 999, padding: '18px 44px', color: C.text, fontSize: 38, fontWeight: 900}}>領土問題は残った</Rise>
  </Scene>;
};

/* 6 — Positions: Russia, then Japan, then the gap between them. */
const Positions: React.FC = () => {
  const local = useLocal('positions');
  const left = useEntrance('positions', cue('positions', 'ロシア'), .7);
  const right = useEntrance('positions', cue('positions', '日本'), .7);
  const tGap = cue('positions', '見解');
  const gap = interpolate(local, [tGap, tGap + .8], [0, 1], clamp);
  const card = (who: string, color: string, bg: string, lines: [string, string], e: {opacity: number; y: number}, dx: number) =>
    <div style={{opacity: e.opacity, transform: `translate(${dx}px, ${e.y}px)`, background: bg, border: `3px solid ${color}`, borderRadius: 34, padding: '90px 26px', display: 'flex', flexDirection: 'column', gap: 40}}>
      <div style={{...font, color, fontSize: 40, fontWeight: 900, letterSpacing: 4}}>{who}</div>
      <div style={{height: 3, background: color, opacity: .4, margin: '0 30px'}} />
      <div style={{...font, color: C.text, fontSize: 46, fontWeight: 900, lineHeight: 1.35}}>{lines[0]}</div>
      <div style={{...font, color: C.muted, fontSize: 34, fontWeight: 800, lineHeight: 1.4}}>{lines[1]}</div>
    </div>;
  return <Scene id="positions" center>
    <Kicker>TWO POSITIONS</Kicker>
    <BigTitle size={76}>現在の四島</BigTitle>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 + gap * 40, width: '100%', marginTop: 90}}>
      {card('ロシア', C.coral, 'rgba(239,123,98,.12)', ['実効支配', '自国領と主張'], left, -gap * 10)}
      {card('日本', C.cyan, 'rgba(86,199,213,.12)', ['返還を求める', '固有の領土と主張'], right, gap * 10)}
    </div>
    <div style={{marginTop: 70, opacity: gap}}>
      <div style={{...font, color: C.gold, fontSize: 64, fontWeight: 900}}>← 隔たり →</div>
      <div style={{...font, color: C.muted, fontSize: 36, fontWeight: 700, lineHeight: 1.6, marginTop: 20}}>双方の見解には隔たりがあり<br />領土問題は未解決のまま</div>
    </div>
  </Scene>;
};

/* 7 — Outro: the open question, with the island chain as a bookend. */
const Outro: React.FC = () => {
  const local = useLocal('outro');
  const a = useEntrance('outro', .1, .8), b = useEntrance('outro', cue('outro', '平和'), .8), c = useEntrance('outro', cue('outro', '小さな'), .8);
  return <Scene id="outro">
    <div style={{marginTop: 160}}>
      <Rise e={a}><Kicker>UNRESOLVED</Kicker></Rise>
      <Rise e={b}><BigTitle size={86}>平和条約は<br />まだ結ばれていない</BigTitle></Rise>
      <div style={{width: 120, height: 6, background: C.gold, margin: '56px auto', opacity: c.opacity}} />
      <div style={{...font, color: C.muted, fontSize: 42, fontWeight: 700, lineHeight: 1.65, opacity: c.opacity}}>自然・暮らし・外交が交差する<br /><span style={{color: C.text}}>北の海の、四つの島々</span></div>
    </div>
    <div style={{position: 'absolute', left: '50%', bottom: 120, transform: `translateX(-50%) scale(${1.04 - local * 0.004})`, transformOrigin: '50% 100%', opacity: .35 * c.opacity}}>
      <IslandMap sceneId="outro" labels={false} width={460} />
    </div>
  </Scene>;
};

export const SouthernKurils: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const fade = interpolate(frame / fps, [AUDIO_END + .5, AUDIO_END + 2.4], [0, 1], clamp);
  return <AbsoluteFill style={{background: C.bg}}>
    <Background /><Intro /><Location /><Scale /><Nature /><History /><Positions /><Outro />
    <div style={{position: 'absolute', left: 50, bottom: 48, ...font, color: 'rgba(168,189,197,.55)', fontSize: 22, fontWeight: 600, letterSpacing: 1}}>SOUTHERN KURILS · EXPLAINED</div>
    <Audio src={staticFile('voiceover/narration.ja.mp3')} />
    <AbsoluteFill style={{background: '#020609', opacity: fade}} />
  </AbsoluteFill>;
};
