import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {UNIVERSITIES, type University} from './data';
import {DURATION_IN_FRAMES, SCENES, cue, type SceneId} from './timing';

const FONT = '"Noto Sans SC", "Segoe UI", Arial, sans-serif';
const GOLD = '#ffd700';
const RED = '#e94560';
const MUTED = '#94a3b8';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 → 1 over `len` frames from `start`. */
const prog = (f: number, start: number, len = 15) => interpolate(f, [start, start + len], [0, 1], clamp);

const sceneOf = (id: SceneId) => SCENES.find((s) => s.id === id)!;
/** Out-then-in fades inside each scene window; the last scene holds to the end. */
const FADE = 10;
const sceneOpacity = (frame: number, id: SceneId) => {
  const s = sceneOf(id);
  const isFirst = s.start === 0;
  const isLast = s === SCENES[SCENES.length - 1];
  if (frame < s.start || (!isLast && frame > s.end)) return 0;
  return Math.max(0, Math.min(isFirst ? 1 : (frame - s.start) / FADE, isLast ? 1 : (s.end - frame) / FADE, 1));
};

const regionOf = (u: University) => (u.country === '中国' ? '中国内地' : u.country);

/** Top-100 count per country/region, largest first. */
const COUNTRIES = Object.entries(
  UNIVERSITIES.reduce<Record<string, number>>((acc, u) => ({...acc, [regionOf(u)]: (acc[regionOf(u)] ?? 0) + 1}), {}),
).sort((a, b) => b[1] - a[1]);

const Scene: React.FC<{id: SceneId; children: React.ReactNode; center?: boolean}> = ({id, children, center}) => {
  const frame = useCurrentFrame();
  const o = sceneOpacity(frame, id);
  return (
    <AbsoluteFill style={{opacity: o, visibility: o > 0 ? 'visible' : 'hidden', padding: '110px 64px 150px', display: 'flex', flexDirection: 'column', justifyContent: center ? 'center' : 'flex-start'}}>
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{alignSelf: 'flex-start', fontSize: 30, fontWeight: 800, letterSpacing: 4, color: RED, padding: '10px 22px', border: `2px solid ${RED}`, borderRadius: 999}}>{children}</div>
);
const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 84}) => (
  <div style={{fontSize: size, fontWeight: 800, lineHeight: 1.12, marginTop: 34}}>{children}</div>
);
const Pill: React.FC<{p: number; color?: string; children: React.ReactNode}> = ({p, color = GOLD, children}) => (
  <div style={{alignSelf: 'flex-start', marginTop: 36, padding: '16px 30px', borderRadius: 999, background: `${color}22`, border: `3px solid ${color}`, fontSize: 36, fontWeight: 800, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>{children}</div>
);

const Row: React.FC<{u: University; highlight?: boolean; dim?: boolean; compact?: boolean; style?: React.CSSProperties; badge?: React.ReactNode}> = ({u, highlight, dim, compact, style, badge}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '16px 24px', borderRadius: 16, background: highlight ? 'rgba(255,215,0,.14)' : 'rgba(255,255,255,.05)', border: `2px solid ${highlight ? GOLD : 'rgba(255,255,255,.08)'}`, opacity: dim ? 0.4 : 1, ...style}}>
    <div style={{fontSize: 44, fontWeight: 800, color: u.rank <= 10 ? GOLD : '#fff', minWidth: 80, textAlign: 'center'}}>{u.rank}</div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontSize: 34, fontWeight: 800}}>{u.name}</div>
      {!compact && <div style={{fontSize: 22, color: MUTED, marginTop: 4}}>{regionOf(u)}</div>}
    </div>
    {badge}
    <div style={{fontSize: 34, fontWeight: 800, color: '#cbd5e1'}}>{u.score}</div>
  </div>
);

/* 1 — Intro */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const mit = UNIVERSITIES[0];
  return (
    <Scene id="intro">
      <Kicker>QS 世界大学排名 2027</Kicker>
      <Title size={104}>全球最好的大学，<br /><span style={{color: GOLD}}>谁排第一？</span></Title>
      <div style={{display: 'flex', gap: 24, marginTop: 60, opacity: prog(f, cue('intro', '1500') - 5)}}>
        {[['1,500+', '所大学上榜'], ['106', '个高等教育体系']].map(([v, l]) => (
          <div key={l} style={{flex: 1, padding: '28px 30px', borderRadius: 24, background: 'rgba(255,255,255,.06)'}}>
            <div style={{fontSize: 64, fontWeight: 800}}>{v}</div>
            <div style={{fontSize: 28, color: MUTED, marginTop: 6}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop: 'auto', padding: '44px 40px', borderRadius: 32, background: 'linear-gradient(135deg, rgba(255,215,0,.22), rgba(255,215,0,.05))', border: `3px solid ${GOLD}`, opacity: prog(f, cue('intro', '麻省') - 5), transform: `scale(${0.94 + 0.06 * prog(f, cue('intro', '麻省') - 5)})`}}>
        <div style={{fontSize: 34, color: GOLD, fontWeight: 800}}>第 1 名 · 连续 15 年</div>
        <div style={{fontSize: 72, fontWeight: 800, marginTop: 14}}>{mit.name}</div>
        <div style={{fontSize: 28, color: MUTED, marginTop: 8}}>{mit.nameEn}</div>
      </div>
    </Scene>
  );
};

/* 2 — Top 10 */
const Top10: React.FC = () => {
  const f = useCurrentFrame() - sceneOf('top10').start;
  const tie = prog(f, cue('top10', '并列') - 5);
  const caltech = prog(f, cue('top10', '加州') - 5);
  return (
    <Scene id="top10">
      <Kicker>前十名</Kicker>
      <Title>帝国理工、斯坦福<br />并列第二</Title>
      <div style={{display: 'grid', gap: 14, marginTop: 50}}>
        {UNIVERSITIES.slice(0, 10).map((u, i) => {
          const e = prog(f, i * 4, 18);
          const isTie = u.rank === 2;
          const isCaltech = u.nameEn.startsWith('California Institute');
          const highlight = (isTie && tie > 0.5 && caltech < 0.5) || (isCaltech && caltech > 0.5);
          return (
            <Row
              key={u.nameEn}
              u={u}
              highlight={highlight}
              dim={caltech > 0.5 && !isCaltech}
              style={{opacity: e * (caltech > 0.5 && !isCaltech ? 0.4 : 1), transform: `translateX(${(1 - e) * 60}px)`}}
              badge={isCaltech ? <span style={{fontSize: 28, fontWeight: 800, color: '#4ade80', opacity: caltech}}>▲3 · 第10→第7</span> : undefined}
            />
          );
        })}
      </div>
    </Scene>
  );
};

/* 3 — Countries */
const Countries: React.FC = () => {
  const f = useCurrentFrame() - sceneOf('countries').start;
  const shown = COUNTRIES.slice(0, 8);
  const max = shown[0][1];
  const cues: Record<string, number> = {美国: cue('countries', '美国'), 英国: cue('countries', '英国'), 澳大利亚: cue('countries', '澳大利亚')};
  const rest = cue('countries', '澳大利亚') + 20;
  const unsw = prog(f, cue('countries', '新南') - 5);
  return (
    <Scene id="countries">
      <Kicker>前 100 名分布</Kicker>
      <Title>美国 25 所，<br />英国 16 所</Title>
      <div style={{display: 'grid', gap: 26, marginTop: 56}}>
        {shown.map(([name, n], i) => {
          const e = prog(f, cues[name] ?? rest + i * 4, 18);
          return (
            <div key={name} style={{opacity: e}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 36, fontWeight: 800}}>
                <span>{name}</span><span>{n}</span>
              </div>
              <div style={{height: 30, marginTop: 10, background: 'rgba(255,255,255,.07)', borderRadius: 8}}>
                <div style={{height: '100%', width: `${(n / max) * 100 * e}%`, borderRadius: 8, background: name === '澳大利亚' && unsw > 0.5 ? GOLD : RED}} />
              </div>
            </div>
          );
        })}
      </div>
      <Pill p={unsw}>新南威尔士大学（第 19）首次成为澳大利亚第一</Pill>
    </Scene>
  );
};

/* 4 — Greater China */
const China: React.FC = () => {
  const f = useCurrentFrame() - sceneOf('china').start;
  const mainland = UNIVERSITIES.filter((u) => u.country === '中国');
  const hk = UNIVERSITIES.filter((u) => u.country === '中国香港');
  const col = (title: string, list: University[], from: number, top: number[]) => (
    <div style={{display: 'grid', gap: 10, marginTop: 26}}>
      <div style={{fontSize: 40, fontWeight: 800, color: GOLD, opacity: prog(f, from - 5)}}>{title} · {list.length} 所</div>
      {list.map((u, i) => (
        <Row key={u.nameEn} u={u} highlight={top.includes(u.rank) && f > from + 30} style={{opacity: prog(f, from + i * 4, 15), padding: '8px 22px'}} />
      ))}
    </div>
  );
  return (
    <Scene id="china">
      <Kicker>中国高校</Kicker>
      <Title size={78}>北大第 13，清华第 14</Title>
      {col('中国内地', mainland, cue('china', '中国'), [13, 14])}
      {col('中国香港', hk, cue('china', '香港'), [11])}
    </Scene>
  );
};

/* 5 — Ranks 11–100 scroll, stopping on Buenos Aires (84) when the narration names it */
const ROW_H = 92;
const Scroll: React.FC = () => {
  const s = sceneOf('scroll');
  const f = useCurrentFrame() - s.start;
  const list = UNIVERSITIES.slice(10);
  const uba = list.findIndex((u) => u.rank === 84);
  const tUba = cue('scroll', '布宜诺斯');
  const viewH = 1000;
  const target = uba * ROW_H - viewH / 2 + ROW_H / 2;
  const endY = list.length * ROW_H - viewH;
  const y = f < tUba ? interpolate(f, [0, tUba], [0, target], clamp) : interpolate(f, [tUba + 60, s.end - s.start], [target, endY], clamp);
  const gap = prog(f, cue('scroll', '51') - 5);
  const ubaOn = f >= tUba - 5 && f < tUba + 80;
  return (
    <Scene id="scroll">
      <Kicker>第 11–100 名</Kicker>
      <Title size={78}>越往后，竞争越激烈</Title>
      <Pill p={gap} color={RED}>第 51–100 名：分数只差约 13 分</Pill>
      <div style={{position: 'relative', height: viewH, marginTop: 36, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(transparent, black 8%, black 92%, transparent)'}}>
        <div style={{transform: `translateY(${-y}px)`, display: 'grid', gap: ROW_H - 80}}>
          {list.map((u) => (
            <Row key={u.nameEn} u={u} compact highlight={u.rank === 84 && ubaOn} style={{height: 80, padding: '0 24px'}} badge={u.rank === 84 && ubaOn ? <span style={{fontSize: 24, fontWeight: 800, color: GOLD}}>拉美唯一</span> : undefined} />
          ))}
        </div>
      </div>
    </Scene>
  );
};

/* 6 — Outro */
const Outro: React.FC = () => {
  const f = useCurrentFrame() - sceneOf('outro').start;
  return (
    <Scene id="outro" center>
      <Kicker>结论</Kicker>
      <Title size={100}>美英领跑，<br /><span style={{color: GOLD}}>亚洲在上升</span></Title>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 64}}>
        {[['香港', '78%', cue('outro', '香港')], ['中国内地', '72%', cue('outro', '72')]].map(([who, pct, t]) => (
          <div key={who as string} style={{padding: '36px 32px', borderRadius: 28, background: 'rgba(255,255,255,.06)', border: '2px solid rgba(255,215,0,.4)', opacity: prog(f, (t as number) - 5)}}>
            <div style={{fontSize: 96, fontWeight: 800, color: GOLD}}>{pct}</div>
            <div style={{fontSize: 30, color: MUTED, marginTop: 8}}>{who}上榜大学名次提高</div>
          </div>
        ))}
      </div>
      <div style={{marginTop: 70, fontSize: 26, color: MUTED}}>数据：QS World University Rankings 2027（2026 年 6 月发布）</div>
    </Scene>
  );
};

export const QsUniversities: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color: '#fff', fontFamily: FONT}}>
      <Intro />
      <Top10 />
      <Countries />
      <China />
      <Scroll />
      <Outro />
      <Audio src={staticFile('voiceover/narration.zh.mp3')} />
      <div style={{position: 'absolute', left: 64, right: 64, bottom: 60, height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 3}}>
        <div style={{height: '100%', width: `${(frame / DURATION_IN_FRAMES) * 100}%`, background: RED, borderRadius: 3}} />
      </div>
    </AbsoluteFill>
  );
};
