import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FACTS, NATIONAL, PROVINCES_2024} from './data';
import {fontFamily} from './fonts';
import {DURATION_IN_FRAMES, SCENES, cue, type SceneId} from './timing';

const PINK = '#e6194b';
const GOLD = '#ffd166';
const GREEN = '#4ade80';
const MUTED = '#a5b4fc';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const prog = (f: number, start: number, len = 15) => interpolate(f, [start, start + len], [0, 1], clamp);

const sceneOf = (id: SceneId) => SCENES.find((s) => s.id === id)!;
/** Out-then-in fades inside each scene window; the last scene holds to the end. */
const FADE = 10;
const useLocal = (id: SceneId) => useCurrentFrame() - sceneOf(id).start;

const Scene: React.FC<{id: SceneId; children: React.ReactNode; center?: boolean}> = ({id, children, center}) => {
  const frame = useCurrentFrame();
  const s = sceneOf(id);
  const isLast = s === SCENES[SCENES.length - 1];
  const o = frame < s.start || (!isLast && frame > s.end) ? 0 : Math.min(s.start === 0 ? 1 : (frame - s.start) / FADE, isLast ? 1 : (s.end - frame) / FADE, 1);
  return (
    <AbsoluteFill style={{opacity: Math.max(0, o), visibility: o > 0 ? 'visible' : 'hidden', padding: '120px 70px 150px', display: 'flex', flexDirection: 'column', justifyContent: center ? 'center' : 'flex-start', color: '#fff'}}>
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{alignSelf: 'flex-start', fontSize: 30, fontWeight: 800, letterSpacing: 4, color: PINK, padding: '10px 22px', border: `2px solid ${PINK}`, borderRadius: 999}}>{children}</div>
);
const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 86}) => (
  <div style={{fontSize: size, fontWeight: 900, lineHeight: 1.14, marginTop: 34}}>{children}</div>
);
const Pill: React.FC<{p: number; color?: string; children: React.ReactNode}> = ({p, color = GOLD, children}) => (
  <div style={{alignSelf: 'flex-start', marginTop: 40, padding: '18px 32px', borderRadius: 999, background: `${color}22`, border: `3px solid ${color}`, fontSize: 38, fontWeight: 800, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>{children}</div>
);

/* 1 — 2024 total */
const Intro: React.FC = () => {
  const f = useLocal('intro');
  const t = cue('intro', '954');
  const n = Math.round(interpolate(f, [t - 15, t + 15], [800, 954], clamp));
  return (
    <Scene id="intro" center>
      <Kicker>中国出生人口</Kicker>
      <Title size={100}>中国一年<br />出生多少人？</Title>
      <div style={{marginTop: 80, opacity: prog(f, t - 15)}}>
        <div style={{fontSize: 40, color: MUTED, fontWeight: 700}}>2024 年全国出生人口</div>
        <div style={{fontSize: 220, fontWeight: 900, lineHeight: 1, color: GOLD, marginTop: 10}}>{n}<span style={{fontSize: 90}}>万</span></div>
      </div>
      <Pill p={prog(f, cue('intro', '增加') - 5)} color={GREEN}>比上年 +52 万 · 8 年来首次回升</Pill>
    </Scene>
  );
};

/* 2 — National trend */
const Trend: React.FC = () => {
  const f = useLocal('trend');
  const max = NATIONAL[0].births;
  const H = 820;
  const peak = prog(f, cue('trend', '1883') - 5);
  const low = prog(f, cue('trend', '902') - 5);
  const half = prog(f, cue('trend', '一半') - 5);
  return (
    <Scene id="trend">
      <Kicker>全国趋势</Kicker>
      <Title>从 1883 万<br />到 902 万</Title>
      <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 22, height: H + 120, marginTop: 70}}>
        {/* half-of-2016 reference line */}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 70 + (H * 0.5), borderTop: `3px dashed ${PINK}`, opacity: half}}>
          <span style={{position: 'absolute', right: 0, top: -50, fontSize: 30, fontWeight: 800, color: PINK}}>2016 年的一半</span>
        </div>
        {NATIONAL.map((r, i) => {
          const e = r.year === 2016 ? peak : prog(f, cue('trend', '此后') + (i - 1) * 8, 18);
          const hl = (r.year === 2016 && peak > 0) || (r.year === 2023 && low > 0.5);
          return (
            <React.Fragment key={r.year}>
              {i === 1 && <div style={{alignSelf: 'center', fontSize: 40, color: MUTED, opacity: e}}>…</div>}
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
                <div style={{fontSize: 34, fontWeight: 900, color: hl ? GOLD : '#fff', opacity: e, marginBottom: 10}}>{r.births}</div>
                <div style={{width: '100%', height: (r.births / max) * H * e, borderRadius: '12px 12px 0 0', background: hl ? GOLD : r.year === 2024 ? GREEN : '#6366f1'}} />
                <div style={{fontSize: 30, fontWeight: 800, color: MUTED, marginTop: 14, height: 56}}>{r.year}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{fontSize: 24, color: MUTED, marginTop: 10}}>单位：万人。2017–2019 年仅有普查修订前的数据，未列出。</div>
    </Scene>
  );
};

/* 3 — Provinces 2024 */
const Provinces: React.FC = () => {
  const f = useLocal('provinces');
  const max = PROVINCES_2024[0].births;
  const named: Record<string, number> = {广东: cue('provinces', '广东'), 河南: cue('provinces', '河南'), 山东: cue('provinces', '山东')};
  const rest = cue('provinces', '山东') + 20;
  return (
    <Scene id="provinces">
      <Kicker>2024 年 · 省份</Kicker>
      <Title>广东连续 {FACTS.guangdongStreak} 年<br />出生人口第一</Title>
      <div style={{display: 'grid', gap: 34, marginTop: 70}}>
        {PROVINCES_2024.map((p, i) => {
          const e = prog(f, named[p.name] ?? rest + (i - 3) * 6, 18);
          return (
            <div key={p.name} style={{opacity: e}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{fontSize: 44, fontWeight: 900}}>{p.name}</span>
                <span style={{fontSize: 44, fontWeight: 900}}>{p.births}<span style={{fontSize: 28}}> 万</span></span>
              </div>
              <div style={{height: 40, marginTop: 10, background: 'rgba(255,255,255,.08)', borderRadius: 10}}>
                <div style={{height: '100%', width: `${(p.births / max) * 100 * e}%`, borderRadius: 10, background: p.color}} />
              </div>
            </div>
          );
        })}
      </div>
      <Pill p={prog(f, cue('provinces', '11.8') - 5)} color={PINK}>广东占全国 {FACTS.guangdongShare}%</Pill>
    </Scene>
  );
};

/* 4 — Concentration: 100 squares, 73 lit */
const Concentration: React.FC = () => {
  const f = useLocal('concentration');
  const t = cue('concentration', '73');
  return (
    <Scene id="concentration" center>
      <Kicker>集中度</Kicker>
      <Title>{FACTS.over30Provinces} 个省份，<br />占全国 {FACTS.over30Share}%</Title>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 14, marginTop: 70}}>
        {Array.from({length: 100}, (_, i) => {
          const lit = i < FACTS.over30Share;
          const e = prog(f, cue('concentration', '合计') + (lit ? (i / FACTS.over30Share) * 40 : 40), 10);
          return <div key={i} style={{aspectRatio: '1/1', borderRadius: 8, background: lit && e > 0.5 ? PINK : 'rgba(255,255,255,.12)', transform: `scale(${lit ? 0.7 + 0.3 * e : 1})`}} />;
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 40, fontSize: 38, fontWeight: 800, opacity: prog(f, t - 5)}}>
        <span style={{color: PINK}}>出生超过 30 万的 {FACTS.over30Provinces} 省：{FACTS.over30Births} 万</span>
        <span style={{color: MUTED}}>其余 17 省</span>
      </div>
    </Scene>
  );
};

/* 5 — Where the 2024 rebound came from */
const Rebound: React.FC = () => {
  const f = useLocal('rebound');
  const risers = PROVINCES_2024.filter((p) => p.change !== undefined && p.name !== '江苏');
  const max = risers[0].change!;
  return (
    <Scene id="rebound" center>
      <Kicker>回升来自哪里</Kicker>
      <Title>生育大省<br />贡献了回升</Title>
      <div style={{display: 'grid', gap: 44, marginTop: 80}}>
        {risers.map((p) => {
          const e = prog(f, cue('rebound', p.name) - 5, 18);
          return (
            <div key={p.name} style={{display: 'grid', gridTemplateColumns: '150px 1fr 200px', alignItems: 'center', gap: 24, opacity: e}}>
              <span style={{fontSize: 48, fontWeight: 900}}>{p.name}</span>
              <div style={{height: 56, background: 'rgba(255,255,255,.08)', borderRadius: 12}}>
                <div style={{height: '100%', width: `${(p.change! / max) * 100 * e}%`, borderRadius: 12, background: GREEN}} />
              </div>
              <span style={{fontSize: 52, fontWeight: 900, color: GREEN, textAlign: 'right'}}>+{p.change}万</span>
            </div>
          );
        })}
      </div>
      <div style={{fontSize: 30, color: MUTED, marginTop: 50}}>2024 年比 2023 年；全国 +52 万</div>
    </Scene>
  );
};

/* 6 — Outro */
const Outro: React.FC = () => {
  const f = useLocal('outro');
  return (
    <Scene id="outro" center>
      <Kicker>结语</Kicker>
      <Title size={92}>一增一减之间，<br /><span style={{color: GOLD}}>人口正在重塑<br />每个省份的未来</span></Title>
      <div style={{marginTop: 80, fontSize: 28, color: MUTED, lineHeight: 1.6, opacity: prog(f, cue('outro', '数据') - 5)}}>
        数据：国家统计局统计公报、第七次人口普查修订数据；<br />各省 2024 年统计公报、《中国统计年鉴 2025》
      </div>
    </Scene>
  );
};

export const PopulationCn: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', fontFamily: `"${fontFamily}", "Noto Sans SC", "Segoe UI", Arial, sans-serif`}}>
      <Intro />
      <Trend />
      <Provinces />
      <Concentration />
      <Rebound />
      <Outro />
      <Audio src={staticFile('voiceover/narration.zh.mp3')} />
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 60, height: 6, background: 'rgba(255,255,255,.12)', borderRadius: 3}}>
        <div style={{height: '100%', width: `${(frame / DURATION_IN_FRAMES) * 100}%`, background: PINK, borderRadius: 3}} />
      </div>
    </AbsoluteFill>
  );
};
