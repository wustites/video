import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EVENTS, METRICS, Metric, MetricId, SOURCES, YEARS} from './data';
import {useEntrance, useSceneOpacity, useSceneProgress} from './timing';

const W = 1080;
const H = 1920;
const FONT = '"Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif';

const C = {
  bg: '#0a0d14',
  panel: '#111722',
  panelAlt: '#151d2a',
  line: '#293344',
  text: '#f3f5f8',
  sub: '#aab5c5',
  muted: '#718096',
  faint: '#455163',
  white10: 'rgba(255,255,255,0.1)',
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
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 10%, rgba(94,167,255,0.13), transparent 34%), radial-gradient(circle at 7% 82%, rgba(194,155,255,0.10), transparent 30%)'}} />
      <div style={{position: 'absolute', top: -410, right: -270, width: 900, height: 900, borderRadius: '50%', border: '1px solid rgba(94,167,255,0.12)', opacity: pulse, transform: `rotate(${frame / 38}deg)`}} />
      <div style={{position: 'absolute', bottom: -460, left: -310, width: 980, height: 980, borderRadius: '50%', border: '1px dashed rgba(194,155,255,0.13)', transform: `rotate(${-frame / 55}deg)`}} />
      <div style={{position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: 'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '72px 72px'}} />
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: 8, background: 'linear-gradient(90deg, #ff6b4a, #f6c85f, #62d7c2, #5ea7ff, #c29bff)'}} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{eyebrow: string; title: string; sceneId: string}> = ({eyebrow, title, sceneId}) => {
  const e = useEntrance(sceneId, 0.15, 0.55, 'rise');
  return (
    <div style={{opacity: e.opacity, transform: e.transform, ...base}}>
      <div style={{fontSize: 25, fontWeight: 800, letterSpacing: 5, color: '#62d7c2', textTransform: 'uppercase'}}>{eyebrow}</div>
      <div style={{fontSize: 64, fontWeight: 900, color: C.text, letterSpacing: -2, marginTop: 18}}>{title}</div>
    </div>
  );
};

const SectionLabel: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = '#62d7c2'}) => (
  <div style={{...base, display: 'flex', alignItems: 'center', gap: 14, fontSize: 23, color, fontWeight: 800, letterSpacing: 2}}>
    <span style={{width: 34, height: 4, borderRadius: 2, background: color}} />
    {children}
  </div>
);

const EventChip: React.FC<{year: number; title: string; note: string; color: string; sceneId: string; delay: number}> = ({year, title, note, color, sceneId, delay}) => {
  const e = useEntrance(sceneId, delay, 0.5, 'rise');
  return (
    <div style={{...base, opacity: e.opacity, transform: e.transform, flex: 1, minWidth: 0, padding: '22px 18px', borderRadius: 20, background: C.panelAlt, border: `1px solid ${color}55`, borderTop: `4px solid ${color}`}}>
      <div style={{fontSize: 30, fontWeight: 900, color}}>{year}</div>
      <div style={{fontSize: 24, fontWeight: 800, color: C.text, marginTop: 8, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{fontSize: 19, fontWeight: 600, color: C.muted, marginTop: 8, lineHeight: 1.4}}>{note}</div>
    </div>
  );
};

const Timeline: React.FC<{sceneId: string; activeYears?: number[]}> = ({sceneId, activeYears = []}) => {
  const e = useEntrance(sceneId, 1.0, 0.65);
  return (
    <div style={{...base, opacity: e.opacity, position: 'absolute', bottom: 42, left: 70, right: 70, color: C.muted}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, letterSpacing: 1}}><span>1985</span><span>日本经济指标 · 年度趋势</span><span>2026*</span></div>
      <div style={{position: 'relative', height: 20, marginTop: 12}}>
        <div style={{position: 'absolute', top: 8, left: 0, right: 0, height: 2, background: C.line}} />
        {YEARS.filter((year) => activeYears.includes(year)).map((year) => {
          const left = `${((year - 1985) / (2026 - 1985)) * 100}%`;
          return <div key={year} style={{position: 'absolute', left, top: 2, width: 14, height: 14, marginLeft: -7, borderRadius: '50%', background: '#ff6b4a', boxShadow: '0 0 0 5px rgba(255,107,74,0.16)'}} />;
        })}
      </div>
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

const MetricChart: React.FC<{sceneId: string; metricId: MetricId; width?: number; height?: number; delay?: number; compact?: boolean}> = ({sceneId, metricId, width = 900, height = 330, delay = 0.8, compact = false}) => {
  const metric = METRICS.find((item) => item.id === metricId)!;
  const e = useEntrance(sceneId, delay, 0.65, 'rise');
  const progress = useSceneProgress(sceneId);
  const visible = Math.max(0, Math.min(1, (progress - 0.12) / 0.62));
  const points = pointsFor(metric, width, height);
  const last = metric.values[metric.values.length - 1];
  const lastX = width - 28;
  const lastY = height - 24 - ((last - metric.min) / (metric.max - metric.min)) * (height - 48);
  return (
    <div style={{...base, opacity: e.opacity, transform: e.transform, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 28, padding: compact ? '22px 20px 16px' : '26px 24px 20px', boxSizing: 'border-box', width}}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 6px 12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 12, height: 12, borderRadius: '50%', background: metric.color, boxShadow: `0 0 14px ${metric.color}`}} />
          <span style={{fontSize: compact ? 23 : 27, fontWeight: 800, color: C.text}}>{metric.label}</span>
        </div>
        <span style={{fontSize: compact ? 18 : 20, fontWeight: 700, color: C.muted}}>{metric.unit}</span>
      </div>
      <svg width={width - (compact ? 40 : 48)} height={height - (compact ? 50 : 56)} viewBox={`0 0 ${width} ${height}`} style={{display: 'block', overflow: 'visible'}}>
        {[0.25, 0.5, 0.75].map((fraction) => <line key={fraction} x1={28} x2={width - 28} y1={height - 24 - fraction * (height - 48)} y2={height - 24 - fraction * (height - 48)} stroke={C.line} strokeWidth={1} strokeDasharray="4 8" />)}
        <polyline points={points} fill="none" stroke={metric.color} strokeWidth={compact ? 5 : 7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - visible} />
        <circle cx={lastX} cy={lastY} r={compact ? 7 : 9} fill={C.bg} stroke={metric.color} strokeWidth={compact ? 4 : 5} opacity={visible} />
        {[{label: '85', x: 28}, {label: '00', x: width * 0.38}, {label: '15', x: width * 0.72}, {label: '26*', x: width - 28}].map((tick) => <text key={tick.label} x={tick.x} y={height + 2} fill={C.muted} fontSize={compact ? 17 : 19} textAnchor={tick.x === 28 ? 'start' : tick.x === width - 28 ? 'end' : 'middle'} fontFamily={FONT}>{tick.label}</text>)}
      </svg>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: compact ? 1 : 6, color: metric.color, fontSize: compact ? 25 : 31, fontWeight: 900}}>{metric.formatter(last)}</div>
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
  const num = useEntrance('intro', 1.8, 0.7, 'scale');
  const sub = useEntrance('intro', 2.8, 0.7);
  return <Scene id="intro" style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
    <div style={{...base, opacity: badge.opacity, transform: badge.transform, color: '#62d7c2', border: '1px solid #62d7c288', borderRadius: 999, padding: '14px 30px', fontSize: 25, letterSpacing: 5, fontWeight: 800}}>数据可视化 · 日本</div>
    <div style={{...base, opacity: title.opacity, transform: title.transform, marginTop: 52, fontSize: 92, lineHeight: 1.08, fontWeight: 900, letterSpacing: -5, color: C.text}}>1985—2026<br/><span style={{color: '#62d7c2'}}>经济的 41 年</span></div>
    <div style={{...base, opacity: num.opacity, transform: num.transform, display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 58}}><span style={{fontSize: 148, fontWeight: 900, color: '#ff6b4a'}}>5</span><span style={{fontSize: 34, fontWeight: 800, color: C.sub}}>条指标</span></div>
    <div style={{...base, opacity: sub.opacity, marginTop: 32, color: C.sub, fontSize: 30, lineHeight: 1.65, fontWeight: 600}}>房价 · 失业率 · 汇率<br/>出生人口 · GDP</div>
    <div style={{...base, position: 'absolute', bottom: 76, color: C.muted, fontSize: 19, letterSpacing: 1}}>从泡沫繁荣，到人口与货币的再平衡</div>
  </Scene>;
};

const Bubble: React.FC = () => <Scene id="bubble">
  <Header sceneId="bubble" eyebrow="01 · 资产价格" title="泡沫，曾经有多大？" />
  <div style={{...base, marginTop: 42, color: C.sub, fontSize: 26, lineHeight: 1.55, fontWeight: 600}}>1985 年后，日元升值与宽松资金<br/>把房地产推向历史高点。</div>
  <div style={{marginTop: 42}}><MetricChart sceneId="bubble" metricId="house" delay={1.1} /></div>
  <div style={{marginTop: 22}}><MetricChart sceneId="bubble" metricId="gdp" height={270} delay={1.45} /></div>
  <div style={{...base, display: 'flex', gap: 16, marginTop: 22}}>
    <EventChip sceneId="bubble" delay={2.3} {...EVENTS[0]} />
    <EventChip sceneId="bubble" delay={2.55} {...EVENTS[1]} />
  </div>
  <div style={{...base, marginTop: 30, padding: '20px 24px', borderLeft: '4px solid #ff6b4a', background: 'rgba(255,107,74,0.08)', color: C.text, fontSize: 24, lineHeight: 1.55, fontWeight: 700}}>房价峰值约为基准的 1.6 倍；泡沫破裂后，资产负债表修复成为长期主题。</div>
  <Timeline sceneId="bubble" activeYears={[1985, 1991]} />
</Scene>;

const LostDecades: React.FC = () => <Scene id="lost">
  <Header sceneId="lost" eyebrow="02 · 失落的三十年" title="就业与人口，双重下行" />
  <div style={{...base, marginTop: 38, color: C.sub, fontSize: 26, lineHeight: 1.55, fontWeight: 600}}>经济没有崩溃，却长期缺少增长的动能。<br/>失业率上升，出生人口持续减少。</div>
  <div style={{marginTop: 38}}><MetricChart sceneId="lost" metricId="unemployment" height={290} delay={1.0} /></div>
  <div style={{marginTop: 20}}><MetricChart sceneId="lost" metricId="births" height={290} delay={1.25} /></div>
  <div style={{...base, display: 'flex', gap: 12, marginTop: 22}}>
    <EventChip sceneId="lost" delay={2.15} {...EVENTS[2]} />
    <EventChip sceneId="lost" delay={2.35} {...EVENTS[3]} />
    <EventChip sceneId="lost" delay={2.55} {...EVENTS[4]} />
  </div>
  <Timeline sceneId="lost" activeYears={[1997, 2008, 2011]} />
</Scene>;

const YenScene: React.FC = () => {
  const e = useEntrance('yen', 0.85, 0.7, 'scale');
  const p = useSceneProgress('yen');
  const value = Math.round(interpolate(p, [0.1, 0.7], [79, 150], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return <Scene id="yen">
    <Header sceneId="yen" eyebrow="03 · 货币与政策" title="日元，走过一轮大摆动" />
    <div style={{...base, marginTop: 46, textAlign: 'center', opacity: e.opacity, transform: e.transform, padding: '35px 0 28px', borderTop: '1px solid #62d7c244', borderBottom: '1px solid #62d7c244'}}>
      <div style={{fontSize: 24, color: C.muted, fontWeight: 700, letterSpacing: 2}}>美元兑日元 · 年均值</div>
      <div style={{fontSize: 164, lineHeight: 1, fontWeight: 900, color: '#62d7c2', marginTop: 14}}>{value}</div>
      <div style={{fontSize: 25, color: C.sub, fontWeight: 700, marginTop: 12}}>79 → 150 日元 / 美元</div>
    </div>
    <div style={{marginTop: 30}}><MetricChart sceneId="yen" metricId="yen" height={320} delay={1.75} /></div>
    <div style={{...base, display: 'flex', gap: 16, marginTop: 22}}>
      <EventChip sceneId="yen" delay={2.55} {...EVENTS[5]} />
      <EventChip sceneId="yen" delay={2.8} {...EVENTS[7]} />
    </div>
    <div style={{...base, display: 'flex', gap: 14, marginTop: 18}}>
      <StatPill sceneId="yen" delay={3.1} value="2013" label="再通胀实验开始" color="#62d7c2" />
      <StatPill sceneId="yen" delay={3.25} value="2022" label="输入型通胀出现" color="#ff6b4a" />
    </div>
    <Timeline sceneId="yen" activeYears={[2013, 2022]} />
  </Scene>;
};

const MiniCard: React.FC<{sceneId: string; metric: Metric; index: number}> = ({sceneId, metric, index}) => <div style={{...base, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 22, padding: '19px 18px 13px', opacity: useEntrance(sceneId, 0.7 + index * 0.16, 0.5, 'rise').opacity}}>
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{fontSize: 23, fontWeight: 800, color: C.text}}><span style={{color: metric.color}}>●</span> {metric.shortLabel}</div><div style={{fontSize: 17, color: C.muted, fontWeight: 700}}>{metric.unit}</div></div>
  <div style={{marginTop: 10}}><MetricChart sceneId={sceneId} metricId={metric.id} width={415} height={160} compact delay={0.7 + index * 0.16} /></div>
</div>;

const Dashboard: React.FC = () => <Scene id="dashboard">
  <Header sceneId="dashboard" eyebrow="04 · 一张图看懂" title="五条曲线，五种现实" />
  <div style={{...base, marginTop: 30, color: C.sub, fontSize: 25, lineHeight: 1.55, fontWeight: 600}}>同一条时间轴上，资产、就业、货币、人口与产出，走出了不同的方向。</div>
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 34}}>{METRICS.map((metric, index) => <MiniCard key={metric.id} sceneId="dashboard" metric={metric} index={index} />)}</div>
  <div style={{...base, marginTop: 26, padding: '26px 24px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(98,215,194,0.15), rgba(94,167,255,0.08))', border: '1px solid rgba(98,215,194,0.3)'}}>
    <div style={{fontSize: 23, color: '#62d7c2', fontWeight: 900, letterSpacing: 1}}>2026* 的注脚</div>
    <div style={{fontSize: 24, color: C.text, fontWeight: 700, lineHeight: 1.55, marginTop: 12}}>人口仍在下行；房价与名义 GDP 则在通胀和城市集中中回升。增长，变得更依赖结构，而不是总量。</div>
  </div>
  <Timeline sceneId="dashboard" activeYears={[1991, 2008, 2020, 2024]} />
</Scene>;

const ConclusionCard: React.FC<{sceneId: string; index: string; title: string; desc: string; color: string; delay: number}> = ({sceneId, index, title, desc, color, delay}) => {
  const e = useEntrance(sceneId, delay, 0.55, 'rise');
  return <div style={{...base, opacity: e.opacity, transform: e.transform, display: 'flex', alignItems: 'center', gap: 20, padding: '22px 24px', background: C.panel, borderRadius: 22, borderLeft: `5px solid ${color}`}}><div style={{fontSize: 24, color, fontWeight: 900}}>{index}</div><div><div style={{fontSize: 28, color: C.text, fontWeight: 900}}>{title}</div><div style={{fontSize: 22, color: C.sub, fontWeight: 600, lineHeight: 1.4, marginTop: 6}}>{desc}</div></div></div>;
};

const Outro: React.FC = () => {
  const title = useEntrance('outro', 0.35, 0.7, 'rise');
  const cards = [
    ['01', '泡沫破裂', '房价用了二十多年才触底。', '#ff6b4a'],
    ['02', '人口收缩', '出生人口从 143 万降到约 64 万。', '#c29bff'],
    ['03', '货币转向', '日元从 79 走到 150，外部价格被重新定价。', '#62d7c2'],
    ['04', '新的分化', '总量回升，不代表每个人都感到更富。', '#5ea7ff'],
  ] as const;
  return <Scene id="outro">
    <div style={{...base, opacity: title.opacity, transform: title.transform}}><SectionLabel color="#f6c85f">结论 · 41 年之后</SectionLabel><div style={{fontSize: 68, lineHeight: 1.15, color: C.text, fontWeight: 900, marginTop: 22}}>日本经济的变化，<br/><span style={{color: '#f6c85f'}}>不是一条线。</span></div></div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 48}}>{cards.map(([index, titleText, desc, color], i) => <ConclusionCard key={index} sceneId="outro" index={index} title={titleText} desc={desc} color={color} delay={1.0 + i * 0.3} />)}</div>
    <div style={{...base, marginTop: 38, paddingTop: 24, borderTop: `1px solid ${C.line}`, color: C.muted, fontSize: 17, lineHeight: 1.6, fontWeight: 600}}>数据来源：{SOURCES.join(' · ')}<br/>* 2025—2026 为暂估 / 预测，用于展示趋势，不代表最终统计值。</div>
    <div style={{...base, position: 'absolute', bottom: 48, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', color: C.faint, fontSize: 18, fontWeight: 700}}><span>JAPAN · 1985—2026</span><span>END OF DATA STORY</span></div>
  </Scene>;
};

export const JapanEconomy: React.FC = () => <AbsoluteFill style={{background: C.bg, color: C.text}}>
  <Backdrop />
  <Intro />
  <Bubble />
  <LostDecades />
  <YenScene />
  <Dashboard />
  <Outro />
</AbsoluteFill>;
