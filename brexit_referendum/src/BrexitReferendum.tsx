import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AGE_REMAIN, EVENTS, Metric, NATIONS, POLLS, SOURCES, TIMELINE_DAYS} from './data';
import {inter} from './fonts';
import {useEntrance, useSceneOpacity, useSceneProgress} from './timing';

const W = 1080;
const H = 1920;
const FONT = `${inter.fontFamily}, sans-serif`;

const C = {
  bg: '#0b0e18',
  panel: '#121828',
  panelAlt: '#161e30',
  line: '#2a3350',
  text: '#f3f5fa',
  sub: '#aab4cd',
  muted: '#7683a0',
  faint: '#46516e',
  red: '#ff6b4a',
  blue: '#5ea7ff',
  teal: '#62d7c2',
  gold: '#f6c85f',
  purple: '#c29bff',
};

const base: React.CSSProperties = {fontFamily: FONT};

const Scene: React.FC<{id: string; children: React.ReactNode; style?: React.CSSProperties}> = ({id, children, style}) => {
  const opacity = useSceneOpacity(id);
  return (
    <AbsoluteFill
      style={{
        opacity,
        visibility: opacity > 0 ? 'visible' : 'hidden',
        padding: '110px 70px 72px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + Math.sin(frame / 42) * 0.08;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 8%, rgba(94,167,255,0.14), transparent 34%), radial-gradient(circle at 8% 84%, rgba(255,107,74,0.10), transparent 30%)'}} />
      <div style={{position: 'absolute', top: -420, right: -280, width: 900, height: 900, borderRadius: '50%', border: '1px solid rgba(94,167,255,0.12)', opacity: pulse, transform: `rotate(${frame / 38}deg)`}} />
      <div style={{position: 'absolute', bottom: -470, left: -320, width: 980, height: 980, borderRadius: '50%', border: '1px dashed rgba(255,107,74,0.13)', transform: `rotate(${-frame / 55}deg)`}} />
      <div style={{position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: 'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '72px 72px'}} />
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: 8, background: `linear-gradient(90deg, ${C.red} 0 33%, #f3f5fa 33% 66%, ${C.blue} 66% 100%)`}} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{eyebrow: string; title: string; sceneId: string}> = ({eyebrow, title, sceneId}) => {
  const e = useEntrance(sceneId, 0.15, 0.55, 'rise');
  return (
    <div style={{opacity: e.opacity, transform: e.transform, ...base}}>
      <div style={{fontSize: 25, fontWeight: 800, letterSpacing: 5, color: C.teal, textTransform: 'uppercase'}}>{eyebrow}</div>
      <div style={{fontSize: 62, fontWeight: 900, color: C.text, letterSpacing: -2, marginTop: 18}}>{title}</div>
    </div>
  );
};

const SectionLabel: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.teal}) => (
  <div style={{...base, display: 'flex', alignItems: 'center', gap: 14, fontSize: 23, color, fontWeight: 800, letterSpacing: 2}}>
    <span style={{width: 34, height: 4, borderRadius: 2, background: color}} />
    {children}
  </div>
);

const EventChip: React.FC<{date: string; title: string; note: string; color: string; sceneId: string; delay: number}> = ({date, title, note, color, sceneId, delay}) => {
  const e = useEntrance(sceneId, delay, 0.5, 'rise');
  return (
    <div style={{...base, opacity: e.opacity, transform: e.transform, flex: 1, minWidth: 0, padding: '22px 18px', borderRadius: 20, background: C.panelAlt, border: `1px solid ${color}55`, borderTop: `4px solid ${color}`}}>
      <div style={{fontSize: 26, fontWeight: 900, color}}>{date}</div>
      <div style={{fontSize: 24, fontWeight: 800, color: C.text, marginTop: 8, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{fontSize: 19, fontWeight: 600, color: C.muted, marginTop: 8, lineHeight: 1.4}}>{note}</div>
    </div>
  );
};

function pointsFor(metric: Metric, width: number, height: number): string {
  const padX = 28;
  const padY = 24;
  return metric.values.map((value, index) => {
    const x = padX + (index / (metric.values.length - 1)) * (width - padX * 2);
    const y = height - padY - ((value - metric.min) / (metric.max - metric.min)) * (height - padY * 2);
    return `${x},${y}`;
  }).join(' ');
}

const MetricChart: React.FC<{sceneId: string; metric: Metric; width?: number; height?: number; delay?: number; compact?: boolean}> = ({sceneId, metric, width = 900, height = 300, delay = 0.8, compact = false}) => {
  const e = useEntrance(sceneId, delay, 0.65, 'rise');
  const progress = useSceneProgress(sceneId);
  const visible = Math.max(0, Math.min(1, (progress - 0.12) / 0.62));
  const points = pointsFor(metric, width, height);
  const last = metric.values[metric.values.length - 1];
  const lastX = width - 28;
  const lastY = height - 24 - ((last - metric.min) / (metric.max - metric.min)) * (height - 48);
  const ticks = metric.tickLabels.map((label, index) => ({
    label,
    x: 28 + (index / (metric.tickLabels.length - 1)) * (width - 56),
  }));
  return (
    <div style={{...base, opacity: e.opacity, transform: e.transform, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 28, padding: compact ? '22px 20px 16px' : '26px 24px 20px', boxSizing: 'border-box', width}}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 6px 12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 12, height: 12, borderRadius: '50%', background: metric.color, boxShadow: `0 0 14px ${metric.color}`}} />
          <span style={{fontSize: compact ? 22 : 26, fontWeight: 800, color: C.text}}>{metric.label}</span>
        </div>
      </div>
      <svg width={width - (compact ? 40 : 48)} height={height - (compact ? 50 : 56)} viewBox={`0 0 ${width} ${height}`} style={{display: 'block', overflow: 'visible'}}>
        {[0.25, 0.5, 0.75].map((fraction) => <line key={fraction} x1={28} x2={width - 28} y1={height - 24 - fraction * (height - 48)} y2={height - 24 - fraction * (height - 48)} stroke={C.line} strokeWidth={1} strokeDasharray="4 8" />)}
        <polyline points={points} fill="none" stroke={metric.color} strokeWidth={compact ? 5 : 7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - visible} />
        <circle cx={lastX} cy={lastY} r={compact ? 7 : 9} fill={C.bg} stroke={metric.color} strokeWidth={compact ? 4 : 5} opacity={visible} />
        {ticks.map((tick) => <text key={tick.label} x={tick.x} y={height + 2} fill={C.muted} fontSize={compact ? 16 : 19} textAnchor={tick.x === 28 ? 'start' : tick.x === width - 28 ? 'end' : 'middle'} fontFamily={FONT}>{tick.label}</text>)}
      </svg>
      {metric.formatter && <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: compact ? 1 : 6, color: metric.color, fontSize: compact ? 24 : 30, fontWeight: 900}}>{metric.formatter(last)}</div>}
    </div>
  );
};

const NationBars: React.FC<{sceneId: string}> = ({sceneId}) => {
  const progress = useSceneProgress(sceneId);
  return (
    <div style={{...base, marginTop: 34, display: 'flex', flexDirection: 'column', gap: 20}}>
      {NATIONS.map((nation, index) => {
        const e = useEntrance(sceneId, 1.2 + index * 0.25, 0.5, 'rise');
        const revealed = Math.max(0, Math.min(1, (progress - 0.25 - index * 0.08) / 0.35));
        return (
          <div key={nation.name} style={{opacity: e.opacity, transform: e.transform}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8}}>
              <span>{nation.name}</span>
              <span>Leave <span style={{color: nation.color}}>{nation.leave.toFixed(1)}%</span> · Remain {nation.remain.toFixed(1)}%</span>
            </div>
            <div style={{height: 22, borderRadius: 11, background: C.panelAlt, border: `1px solid ${C.line}`, overflow: 'hidden'}}>
              <div style={{width: `${nation.leave * revealed}%`, height: '100%', background: `linear-gradient(90deg, ${nation.color}88, ${nation.color})`}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CountdownTimeline: React.FC<{sceneId: string; delay?: number}> = ({sceneId, delay = 1.0}) => {
  const e = useEntrance(sceneId, delay, 0.65, 'rise');
  const progress = useSceneProgress(sceneId);
  const fill = Math.max(0, Math.min(1, (progress - 0.2) / 0.6));
  const max = TIMELINE_DAYS[TIMELINE_DAYS.length - 1].days;
  return (
    <div style={{...base, opacity: e.opacity, transform: e.transform, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 26, padding: '28px 28px 24px'}}>
      <div style={{fontSize: 23, fontWeight: 800, color: C.text, marginBottom: 20}}>Days from the vote to the exit timetable</div>
      <div style={{position: 'relative', height: 60}}>
        <div style={{position: 'absolute', top: 26, left: 0, right: 0, height: 4, borderRadius: 2, background: C.line}} />
        <div style={{position: 'absolute', top: 26, left: 0, height: 4, borderRadius: 2, width: `${fill * 100}%`, background: `linear-gradient(90deg, ${C.red}, ${C.teal})`}} />
        {TIMELINE_DAYS.map((item) => {
          const left = (item.days / max) * 100;
          return (
            <React.Fragment key={item.label}>
              <div style={{position: 'absolute', left: `${left}%`, top: 18, width: 20, height: 20, marginLeft: -10, borderRadius: '50%', background: C.bg, border: `4px solid ${item.color}`, boxShadow: `0 0 0 5px ${item.color}22`}} />
              <div style={{position: 'absolute', left: `${left}%`, marginLeft: -70, width: 140, top: -4, textAlign: 'center', fontSize: 18, fontWeight: 800, color: item.color}}>{item.label}</div>
              <div style={{position: 'absolute', left: `${left}%`, marginLeft: -70, width: 140, top: 52, textAlign: 'center', fontSize: 16, fontWeight: 700, color: C.muted}}>{item.days === 0 ? 'Jun 2016' : `+${item.days.toLocaleString('en-GB')}`}</div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const StatPill: React.FC<{sceneId: string; delay: number; value: string; label: string; color: string}> = ({sceneId, delay, value, label, color}) => {
  const e = useEntrance(sceneId, delay, 0.5, 'scale');
  return <div style={{...base, opacity: e.opacity, transform: e.transform, flex: 1, padding: '25px 16px', borderRadius: 22, background: C.panel, border: `1px solid ${color}55`, textAlign: 'center'}}><div style={{fontSize: 42, fontWeight: 900, color}}>{value}</div><div style={{fontSize: 20, color: C.muted, fontWeight: 700, marginTop: 8}}>{label}</div></div>;
};

const Intro: React.FC = () => {
  const badge = useEntrance('intro', 0.25, 0.5, 'rise');
  const title = useEntrance('intro', 0.8, 0.8, 'rise');
  const score = useEntrance('intro', 1.8, 0.7, 'scale');
  const sub = useEntrance('intro', 2.8, 0.7);
  return <Scene id="intro" style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
    <div style={{...base, opacity: badge.opacity, transform: badge.transform, color: C.teal, border: '1px solid rgba(98,215,194,0.55)', borderRadius: 999, padding: '14px 30px', fontSize: 25, letterSpacing: 5, fontWeight: 800}}>DATA STORY · UNITED KINGDOM</div>
    <div style={{...base, opacity: title.opacity, transform: title.transform, marginTop: 52, fontSize: 96, lineHeight: 1.08, fontWeight: 900, letterSpacing: -4, color: C.text}}>BREXIT<br/><span style={{color: C.teal}}>The Referendum Story</span></div>
    <div style={{...base, opacity: score.opacity, transform: score.transform, display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 58}}>
      <span style={{fontSize: 110, fontWeight: 900, color: C.red}}>51.9%</span>
      <span style={{fontSize: 40, fontWeight: 800, color: C.faint}}>—</span>
      <span style={{fontSize: 110, fontWeight: 900, color: C.blue}}>48.1%</span>
    </div>
    <div style={{...base, opacity: sub.opacity, marginTop: 30, color: C.sub, fontSize: 28, lineHeight: 1.65, fontWeight: 600}}>Leave vs Remain · 23 June 2016<br/>From pledge to exit in five years</div>
    <div style={{...base, position: 'absolute', bottom: 76, color: C.muted, fontSize: 19, letterSpacing: 1}}>How the UK voted to leave the European Union</div>
  </Scene>;
};

const Causes: React.FC = () => <Scene id="causes">
  <Header sceneId="causes" eyebrow="01 · The pledge" title="A promise, then a date" />
  <div style={{...base, marginTop: 40, color: C.sub, fontSize: 26, lineHeight: 1.55, fontWeight: 600}}>UKIP pressure and Conservative rebels pushed Cameron to promise an in–out vote. Parliament set the rules; Brussels set the stage.</div>
  <div style={{marginTop: 36}}><MetricChart sceneId="causes" metric={POLLS} height={320} delay={1.0} /></div>
  <div style={{...base, display: 'flex', gap: 16, marginTop: 24}}>
    <EventChip sceneId="causes" delay={1.9} {...EVENTS[0]} />
    <EventChip sceneId="causes" delay={2.15} {...EVENTS[1]} />
  </div>
  <div style={{...base, marginTop: 28, padding: '20px 24px', borderLeft: `4px solid ${C.gold}`, background: 'rgba(246,200,95,0.08)', color: C.text, fontSize: 24, lineHeight: 1.55, fontWeight: 700}}>For two years the polls sat on a knife edge — never far from 50/50.</div>
</Scene>;

const Vote: React.FC = () => {
  const p = useSceneProgress('vote');
  const leave = interpolate(p, [0.15, 0.55], [50, 51.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const remain = 100 - leave;
  const counter = useEntrance('vote', 0.6, 0.6, 'scale');
  return <Scene id="vote">
    <Header sceneId="vote" eyebrow="02 · 23 June 2016" title="The people decide" />
    <div style={{...base, marginTop: 40, textAlign: 'center', opacity: counter.opacity, transform: counter.transform, padding: '32px 0 26px', borderTop: '1px solid rgba(98,215,194,0.27)', borderBottom: '1px solid rgba(98,215,194,0.27)'}}>
      <div style={{fontSize: 23, color: C.muted, fontWeight: 700, letterSpacing: 2}}>FINAL RESULT · TURNOUT 72.2%</div>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26, marginTop: 16}}>
        <span style={{fontSize: 132, lineHeight: 1, fontWeight: 900, color: C.red}}>{leave.toFixed(1)}%</span>
        <span style={{fontSize: 44, fontWeight: 800, color: C.faint}}>/</span>
        <span style={{fontSize: 132, lineHeight: 1, fontWeight: 900, color: C.blue}}>{remain.toFixed(1)}%</span>
      </div>
      <div style={{fontSize: 25, color: C.sub, fontWeight: 700, marginTop: 12}}>LEAVE 17.4M · REMAIN 16.1M · 1.27M VOTES APART</div>
    </div>
    <NationBars sceneId="vote" />
    <div style={{marginTop: 30}}><MetricChart sceneId="vote" metric={AGE_REMAIN} width={900} height={300} delay={2.4} compact /></div>
    <div style={{...base, display: 'flex', gap: 14, marginTop: 24}}>
      <StatPill sceneId="vote" delay={2.9} value="72.2%" label="Turnout — highest since 1992" color={C.teal} />
      <StatPill sceneId="vote" delay={3.05} value="Next day" label="Cameron resigns" color={C.red} />
    </div>
  </Scene>;
};

const Aftermath: React.FC = () => <Scene id="aftermath">
  <Header sceneId="aftermath" eyebrow="03 · Deadlock" title="Three years of no" />
  <div style={{...base, marginTop: 36, color: C.sub, fontSize: 26, lineHeight: 1.55, fontWeight: 600}}>Article 50 started a two-year clock. The Commons rejected the withdrawal agreement by record margins — and the clock did not stop.</div>
  <div style={{marginTop: 30}}><CountdownTimeline sceneId="aftermath" delay={0.9} /></div>
  <div style={{...base, display: 'flex', gap: 12, marginTop: 26}}>
    <EventChip sceneId="aftermath" delay={1.6} {...EVENTS[3]} />
    <EventChip sceneId="aftermath" delay={1.85} {...EVENTS[4]} />
  </div>
  <div style={{...base, display: 'flex', gap: 12, marginTop: 16}}>
    <EventChip sceneId="aftermath" delay={2.1} {...EVENTS[5]} />
    <EventChip sceneId="aftermath" delay={2.35} {...EVENTS[6]} />
  </div>
  <div style={{...base, marginTop: 24, padding: '20px 24px', borderLeft: `4px solid ${C.purple}`, background: 'rgba(194,155,255,0.08)', color: C.text, fontSize: 24, lineHeight: 1.55, fontWeight: 700}}>Two prime ministers, three defeated deals, two extensions — one 80-seat majority at the end of it.</div>
</Scene>;

const Exit: React.FC = () => <Scene id="exit">
  <Header sceneId="exit" eyebrow="04 · Exit" title="Out — then the real work" />
  <div style={{...base, marginTop: 38, display: 'flex', gap: 16}}>
    <EventChip sceneId="exit" delay={0.9} {...EVENTS[7]} />
    <EventChip sceneId="exit" delay={1.15} {...EVENTS[8]} />
  </div>
  <div style={{marginTop: 28}}><CountdownTimeline sceneId="exit" delay={1.5} /></div>
  <div style={{...base, display: 'flex', gap: 14, marginTop: 26}}>
    <StatPill sceneId="exit" delay={2.1} value="47 yrs" label="Of membership, ended" color={C.blue} />
    <StatPill sceneId="exit" delay={2.25} value="11 mo" label="Transition to a trade deal" color={C.teal} />
    <StatPill sceneId="exit" delay={2.4} value="0" label="Tariffs — new paperwork instead" color={C.gold} />
  </div>
  <div style={{...base, marginTop: 26, padding: '20px 24px', borderLeft: `4px solid ${C.red}`, background: 'rgba(255,107,74,0.08)', color: C.text, fontSize: 24, lineHeight: 1.55, fontWeight: 700}}>The Trade and Cooperation Agreement was signed on 24 December 2020 — days before the transition expired.</div>
</Scene>;

const ConclusionCard: React.FC<{sceneId: string; index: string; title: string; desc: string; color: string; delay: number}> = ({sceneId, index, title, desc, color, delay}) => {
  const e = useEntrance(sceneId, delay, 0.55, 'rise');
  return <div style={{...base, opacity: e.opacity, transform: e.transform, display: 'flex', alignItems: 'center', gap: 20, padding: '22px 24px', background: C.panel, borderRadius: 22, borderLeft: `5px solid ${color}`}}><div style={{fontSize: 24, color, fontWeight: 900}}>{index}</div><div><div style={{fontSize: 28, color: C.text, fontWeight: 900}}>{title}</div><div style={{fontSize: 22, color: C.sub, fontWeight: 600, lineHeight: 1.4, marginTop: 6}}>{desc}</div></div></div>;
};

const Outro: React.FC = () => {
  const title = useEntrance('outro', 0.35, 0.7, 'rise');
  const cards = [
    ['01', 'A divided vote', '52–48, with England & Wales on one side and Scotland & N. Ireland on the other.', C.red],
    ['02', 'Parliament vs the clock', 'Article 50 set a deadline politics could not meet: three rejections, two extensions.', C.purple],
    ['03', 'Leave became the mandate', '"Get Brexit done" turned deadlock into an 80-seat majority.', C.teal],
    ['04', 'Exit was only the start', 'Trade, the union, and the rules — the consequences are still unfolding.', C.blue],
  ] as const;
  return <Scene id="outro">
    <div style={{...base, opacity: title.opacity, transform: title.transform}}><SectionLabel color={C.gold}>Conclusion · After the vote</SectionLabel><div style={{fontSize: 66, lineHeight: 1.15, color: C.text, fontWeight: 900, marginTop: 22}}>Brexit answered one question —<br/><span style={{color: C.gold}}>and opened many more.</span></div></div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 48}}>{cards.map(([index, cardTitle, desc, color], i) => <ConclusionCard key={index} sceneId="outro" index={index} title={cardTitle} desc={desc} color={color} delay={1.0 + i * 0.3} />)}</div>
    <div style={{...base, marginTop: 38, paddingTop: 24, borderTop: `1px solid ${C.line}`, color: C.muted, fontSize: 17, lineHeight: 1.6, fontWeight: 600}}>Sources: {SOURCES.join(' · ')}. Figures are illustrative anchors for trend display.</div>
    <div style={{...base, position: 'absolute', bottom: 48, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', color: C.faint, fontSize: 18, fontWeight: 700}}><span>UNITED KINGDOM · 2016—2020</span><span>DATA STORY · END</span></div>
  </Scene>;
};

export const BrexitReferendum: React.FC = () => <AbsoluteFill style={{background: C.bg, color: C.text}}>
  <Backdrop />
  <Intro />
  <Causes />
  <Vote />
  <Aftermath />
  <Exit />
  <Outro />
  <Audio src={staticFile('voiceover/narration.en.mp3')} />
</AbsoluteFill>;
