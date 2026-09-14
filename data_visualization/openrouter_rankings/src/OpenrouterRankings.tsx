import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {DATA} from './data';
import {displayProvider, getCopy, getInsights, type Locale} from './i18n';

export const FPS = 30;
export const DURATION_IN_FRAMES = 1350;

const SCENES = [
  {start: 0, end: 240},
  {start: 210, end: 540},
  {start: 510, end: 780},
  {start: 750, end: 1080},
  {start: 1050, end: 1350},
];

function sceneOpacity(frame: number, start: number, end: number): number {
  const fadeIn = interpolate(frame, [start, start + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [end - 18, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return Math.min(fadeIn, fadeOut);
}

function currentScene(frame: number): number {
  for (let i = SCENES.length - 1; i > 0; i--) {
    if (frame >= SCENES[i].start) {
      return i;
    }
  }
  return 0;
}

const DONUT_R = 200;
const DONUT_C = 2 * Math.PI * DONUT_R;

function growthBadge(g: number): {label: string; bg: string; color: string} {
  if (g > 0.05) {
    return {label: `+${g.toFixed(1)}%`, bg: 'rgba(34,197,94,.16)', color: '#4ade80'};
  }
  if (g < -0.05) {
    return {label: `${g.toFixed(1)}%`, bg: 'rgba(239,68,68,.16)', color: '#f87171'};
  }
  return {label: `${g.toFixed(1)}%`, bg: 'rgba(148,163,184,.14)', color: '#94a3b8'};
}

export const OpenrouterRankings: React.FC<{locale?: Locale}> = ({locale = 'en'}) => {
  const frame = useCurrentFrame();
  const copy = getCopy(locale);
  const insights = getInsights(locale);
  const progress = frame / DURATION_IN_FRAMES;
  const cur = currentScene(frame);

  // Intro
  const titleEnter = interpolate(frame, [0, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mEnter = interpolate(frame, [20, 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const totalEnter = interpolate(frame, [26, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const totalVal = (DATA.totalTokens * totalEnter).toFixed(1);
  const riserColor = DATA.topGrowth.growth >= 0 ? '#4ade80' : '#f87171';
  const riserSign = DATA.topGrowth.growth >= 0 ? '+' : '';

  // Ranking bars
  const local = frame - 220;
  const maxTokens = DATA.models[0].tokens;

  // Providers donut
  const plocal = frame - 520;
  const donutEnter = interpolate(plocal, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dEnter = interpolate(plocal, [14, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const donutTotal = (DATA.totalTokens * dEnter).toFixed(1);
  let acc = 0;
  const segments = DATA.providers.map((p) => {
    const from = acc;
    acc += p.pct;
    return {provider: p, fromPct: from};
  });

  // Growth
  const glocal = frame - 760;
  const maxGrowth = DATA.growthModels[0].growth;

  // Outro
  const olocal = frame - 1060;
  const reveal = interpolate(olocal, [0, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lineW = interpolate(olocal, [12, 34], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#06080d', color: '#f8fafc', fontFamily: '"Noto Sans SC","Segoe UI","Helvetica Neue",Arial,sans-serif'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 28% 12%, rgba(59,130,246,.16) 0%, transparent 58%),radial-gradient(ellipse at 78% 30%, rgba(139,92,246,.12) 0%, transparent 55%),radial-gradient(ellipse at 55% 92%, rgba(236,72,153,.1) 0%, transparent 50%)'}} />
      <div style={{position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '96px 96px'}} />
      <div style={{position: 'absolute', top: 84, right: 68, fontSize: 24, fontWeight: 700, color: '#94a3b8'}}>openrouter.ai/rankings</div>

      {/* Scene 0: intro */}
      <div style={{position: 'absolute', inset: 0, padding: '76px 68px 128px', display: 'flex', flexDirection: 'column', opacity: sceneOpacity(frame, SCENES[0].start, SCENES[0].end)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={kickerStyle}><span style={dotStyle} />{copy.kickerIntro}</div>
        </div>
        <div style={{marginTop: 120, opacity: titleEnter, transform: `translateY(${(1 - titleEnter) * 76}px)`}}>
          <div style={{fontSize: 102, lineHeight: 1.08, fontWeight: 900, letterSpacing: '-0.01em'}}>{copy.introTitleA}<br /><span style={accentStyle}>{copy.introTitleB}</span></div>
          <div style={{marginTop: 40, width: 880, fontSize: 37, lineHeight: 1.55, color: '#94a3b8', fontWeight: 600}}>{copy.introDesc}</div>
          <div style={{marginTop: 36}}>
            <span style={{...chipStyle, background: 'rgba(59,130,246,.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,.3)'}}>{copy.chipWeek}</span>
          </div>
        </div>
        <div style={{marginTop: 'auto', display: 'grid', gap: 24, opacity: mEnter, transform: `translateY(${(1 - mEnter) * 40}px)`}}>
          <div style={{...metricStyle, ['--accent' as string]: '#3B82F6'}}>
            <div style={metricLabelStyle}>{copy.metricTotalLabel}</div>
            <div style={metricValueStyle}>{totalVal} {copy.metricTotalUnit}</div>
            <div style={metricSubStyle}>{copy.metricTotalSub}</div>
          </div>
          <div style={{...metricStyle, ['--accent' as string]: '#8B5CF6'}}>
            <div style={metricLabelStyle}>{copy.metricTopLabel}</div>
            <div style={metricValueStyle}>{DATA.topModel}</div>
            <div style={metricSubStyle}>{copy.metricTopSub}</div>
          </div>
          <div style={{...metricStyle, ['--accent' as string]: '#EC4899'}}>
            <div style={metricLabelStyle}>{copy.metricRiserLabel}</div>
            <div style={metricValueStyle}>{DATA.topGrowth.model} <span style={{color: riserColor, fontSize: 42}}>{riserSign}{DATA.topGrowth.growth}%</span></div>
            <div style={metricSubStyle}>{copy.metricRiserSub}</div>
          </div>
        </div>
      </div>

      {/* Scene 1: ranking bars */}
      <div style={{position: 'absolute', inset: 0, padding: '76px 68px 128px', display: 'flex', flexDirection: 'column', opacity: sceneOpacity(frame, SCENES[1].start, SCENES[1].end)}}>
        <div style={kickerStyle}><span style={dotStyle} />{copy.kickerRanking}</div>
        <div style={{fontSize: 74, lineHeight: 1.08, fontWeight: 900, marginTop: 34}}>{DATA.topModel}<br /><span style={accentStyle}>{copy.rankTitleB}</span></div>
        <div style={{fontSize: 30, lineHeight: 1.45, color: '#94a3b8', fontWeight: 600, marginTop: 22}}>
          {copy.rankSubPrefix}
          <span style={cnChipStyle}>{copy.cnChip}</span> <span style={usChipStyle}>{copy.usChip}</span>
          {copy.rankSubSuffix}
        </div>
        <div style={{marginTop: 36, display: 'grid', gap: 6}}>
          {DATA.models.map((item, i) => {
            const enter = interpolate(local - i * 5, [0, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const valEnter = interpolate(local - i * 5 - 4, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const badge = growthBadge(item.growth);
            return (
              <div key={item.rank} style={{display: 'grid', gridTemplateColumns: '64px 1fr 170px', gap: 20, alignItems: 'center', padding: '6px 18px', borderRadius: 16, background: 'rgba(255,255,255,.035)', opacity: enter, transform: `translateX(${(1 - enter) * -60}px)`, boxShadow: i === 0 ? '0 0 0 1px rgba(96,165,250,.35), 0 18px 50px rgba(59,130,246,.18)' : undefined}}>
                <div style={{width: 58, height: 58, display: 'grid', placeItems: 'center', color: '#f8fafc', fontSize: 28, fontWeight: 900, borderRadius: 14, background: '#1e293b', borderLeft: `8px solid ${item.color}`}}>{item.rank}</div>
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center'}}>
                    <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.05}}>{item.name}</div>
                    <span style={{display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 999, fontSize: 21, fontWeight: 800, background: badge.bg, color: badge.color}}>{badge.label}</span>
                  </div>
                  <div style={{fontSize: 22, color: '#94a3b8', fontWeight: 600, marginTop: 5}}>{displayProvider(item.provider, locale)} {item.country === 'cn' ? <span style={cnChipStyle}>{copy.cnChip}</span> : <span style={usChipStyle}>{copy.usChip}</span>}</div>
                  <div style={{height: 30, background: 'rgba(255,255,255,.07)', marginTop: 8, borderRadius: 8, overflow: 'hidden'}}>
                    <div style={{height: '100%', borderRadius: 8, width: `${enter * (item.tokens / maxTokens) * 100}%`, background: `linear-gradient(90deg,${item.color},${item.color}B8)`}} />
                  </div>
                </div>
                <div style={{fontSize: 32, fontWeight: 900, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{(item.tokens * valEnter).toFixed(2)}<small style={{fontSize: 22, fontWeight: 700, color: '#94a3b8'}}> {copy.tokenUnit}</small></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scene 2: providers donut (SVG stroke-dasharray) */}
      <div style={{position: 'absolute', inset: 0, padding: '76px 68px 128px', display: 'flex', flexDirection: 'column', opacity: sceneOpacity(frame, SCENES[2].start, SCENES[2].end)}}>
        <div style={kickerStyle}><span style={dotStyle} />{copy.kickerProviders}</div>
        <div style={{fontSize: 68, lineHeight: 1.08, fontWeight: 900, marginTop: 34}}>{displayProvider(DATA.providers[0].name, locale)} {locale === 'zh' ? '领先' : 'Leads'}<br /><span style={accentStyle}>{locale === 'zh' ? `占全部 Token ${DATA.providers[0].pct}%` : `${DATA.providers[0].pct}% of all tokens`}</span></div>
        <div style={{fontSize: 30, lineHeight: 1.45, color: '#94a3b8', fontWeight: 600, marginTop: 22}}>{copy.provSub}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 56, marginTop: 56, opacity: donutEnter, transform: `scale(${0.92 + 0.08 * donutEnter})`}}>
          <div style={{position: 'relative', width: 520, height: 520, flex: '0 0 auto'}}>
            <svg width={520} height={520} viewBox="0 0 520 520">
              <circle cx={260} cy={260} r={DONUT_R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={130} />
              {segments.map((s) => {
                const len = (s.provider.pct / 100) * DONUT_C * dEnter;
                const offset = (s.fromPct / 100) * DONUT_C;
                return (
                  <circle
                    key={s.provider.name}
                    cx={260}
                    cy={260}
                    r={DONUT_R}
                    fill="none"
                    stroke={s.provider.color}
                    strokeWidth={130}
                    strokeDasharray={`${Math.max(len - 2, 0.1)} ${DONUT_C}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 260 260)"
                    strokeLinecap="butt"
                  />
                );
              })}
            </svg>
            <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 258, height: 258, borderRadius: '50%', background: '#0a0e16', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.08)'}}>
              <div style={{fontSize: 62, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{donutTotal}{copy.tokenUnit}</div>
              <div style={{fontSize: 24, color: '#94a3b8', fontWeight: 700, marginTop: 6}}>{copy.donutLabel}</div>
            </div>
          </div>
          <div style={{display: 'grid', gap: 20, flex: 1}}>
            {DATA.providers.map((item, i) => {
              const enter = interpolate(plocal - i * 5, [0, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              const valEnter = interpolate(plocal - i * 5 - 4, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <div key={item.name} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: enter, transform: `translateX(${(1 - enter) * 40}px)`}}>
                  <span style={{width: 26, height: 26, borderRadius: 8, flex: '0 0 auto', background: item.color}} />
                  <span style={{fontSize: 29, fontWeight: 800, flex: 1}}>{displayProvider(item.name, locale)}</span>
                  <span style={{fontSize: 27, fontWeight: 800, color: '#94a3b8', fontVariantNumeric: 'tabular-nums'}}>{(item.tokens * valEnter).toFixed(1)}{copy.tokenUnit}</span>
                  <span style={{fontSize: 27, fontWeight: 900, width: 74, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{item.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{marginTop: 34, fontSize: 26, color: '#94a3b8', fontWeight: 700}}>
          {copy.provFooterA} <span style={{color: '#f8fafc', fontWeight: 900}}>{DATA.top6Pct}%</span> {copy.provFooterB}
        </div>
      </div>

      {/* Scene 3: growth rows normalized */}
      <div style={{position: 'absolute', inset: 0, padding: '76px 68px 128px', display: 'flex', flexDirection: 'column', opacity: sceneOpacity(frame, SCENES[3].start, SCENES[3].end)}}>
        <div style={kickerStyle}><span style={dotStyle} />{copy.kickerGrowth}</div>
        <div style={{fontSize: 74, lineHeight: 1.08, fontWeight: 900, marginTop: 34}}>{copy.growthTitleA}<br /><span style={accentStyle}>{copy.growthTitleB}</span></div>
        <div style={{fontSize: 30, lineHeight: 1.45, color: '#94a3b8', fontWeight: 600, marginTop: 22}}>{copy.growthSub}</div>
        <div style={{marginTop: 40, display: 'grid', gap: 18}}>
          {DATA.growthModels.map((item, i) => {
            const enter = interpolate(glocal - i * 6, [0, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const valEnter = interpolate(glocal - i * 6 - 4, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={item.name} style={{padding: '20px 22px', borderRadius: 18, background: 'rgba(255,255,255,.035)', opacity: enter, transform: `translateY(${(1 - enter) * 34}px)`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div style={{fontSize: 31, fontWeight: 800}}>{item.name}</div>
                    <div style={{fontSize: 22, color: '#94a3b8', fontWeight: 600, marginTop: 4}}>{displayProvider(item.provider, locale)}</div>
                  </div>
                  <div style={{fontSize: 38, fontWeight: 900, color: '#4ade80', fontVariantNumeric: 'tabular-nums'}}>{(item.growth * valEnter).toFixed(1)}%</div>
                </div>
                <div style={{height: 22, background: 'rgba(255,255,255,.07)', marginTop: 14, borderRadius: 999, overflow: 'hidden'}}>
                  <div style={{height: '100%', borderRadius: 999, width: `${enter * (item.growth / maxGrowth) * 100}%`, background: `linear-gradient(90deg,${item.color},#4ade80)`}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scene 4: outro insights stagger */}
      <div style={{position: 'absolute', inset: 0, padding: '76px 68px 128px', display: 'flex', flexDirection: 'column', opacity: sceneOpacity(frame, SCENES[4].start, SCENES[4].end)}}>
        <div style={{marginTop: 60, opacity: reveal, transform: `translateY(${(1 - reveal) * 54}px)`}}>
          <div style={kickerStyle}><span style={dotStyle} />{copy.kickerOutro}</div>
          <div style={{fontSize: 86, marginTop: 48, lineHeight: 1.08, fontWeight: 900}}>{copy.outroTitleA}<br />{copy.outroTitleB}</div>
          <div style={{height: 12, borderRadius: 99, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)', marginTop: 52, width: `${lineW}%`}} />
          <div style={{marginTop: 52, display: 'grid', gap: 22}}>
            {insights.map((item, i) => {
              const enter = interpolate(olocal - 24 - i * 8, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '26px 30px', borderRadius: 18, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', opacity: enter, transform: `translateX(${(1 - enter) * -46}px)`}}>
                  <div style={{width: 56, height: 56, borderRadius: 16, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900, color: '#f8fafc', flex: '0 0 auto', background: '#1e293b', borderLeft: `8px solid ${item.color}`}}>{item.ic}</div>
                  <div>
                    <div style={{fontSize: 36, fontWeight: 800, lineHeight: 1.2}}>{item.text}</div>
                    <div style={{fontSize: 25, color: '#94a3b8', fontWeight: 600, marginTop: 6}}>{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dots nav + timeline */}
      <div style={{position: 'absolute', bottom: 78, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16}}>
        {SCENES.map((_, i) => (
          <div key={i} style={{width: 14, height: 14, borderRadius: 99, background: i === cur ? '#60a5fa' : 'rgba(255,255,255,.18)', boxShadow: i === cur ? '0 0 12px rgba(96,165,250,.8)' : undefined}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 68, right: 68, bottom: 52, height: 8, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden'}}>
        <div style={{height: '100%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)', borderRadius: 99, width: `${progress * 100}%`}} />
      </div>
    </AbsoluteFill>
  );
};

const kickerStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 22px', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, background: 'rgba(255,255,255,.05)', color: '#94a3b8', fontSize: 28, fontWeight: 700, letterSpacing: '.02em'};
const dotStyle: React.CSSProperties = {width: 12, height: 12, borderRadius: 20, background: '#3B82F6', boxShadow: '0 0 14px #3B82F6'};
const accentStyle: React.CSSProperties = {background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'};
const chipStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 999, fontSize: 26, fontWeight: 800};
const metricStyle: React.CSSProperties = {borderRadius: 20, padding: '30px 34px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 24px 60px rgba(0,0,0,.4)', position: 'relative', overflow: 'hidden'};
const metricLabelStyle: React.CSSProperties = {fontSize: 27, color: '#94a3b8', fontWeight: 700};
const metricValueStyle: React.CSSProperties = {fontSize: 60, fontWeight: 900, marginTop: 12, letterSpacing: '-0.01em'};
const metricSubStyle: React.CSSProperties = {fontSize: 24, color: '#64748b', fontWeight: 700, marginTop: 6};
const cnChipStyle: React.CSSProperties = {fontSize: 22, fontWeight: 900, padding: '4px 12px', borderRadius: 8, color: '#fff', background: 'rgba(244,63,94,.85)'};
const usChipStyle: React.CSSProperties = {fontSize: 22, fontWeight: 900, padding: '4px 12px', borderRadius: 8, color: '#fff', background: 'rgba(59,130,246,.85)'};
