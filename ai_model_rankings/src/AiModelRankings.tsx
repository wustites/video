import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CARDS, METRICS, MODELS, PROVIDER_COUNTS, SCATTER_POINTS, TIER_COUNTS} from './data';
import {LOCALES, type LocaleKey} from './i18n';

export const FPS = 30;
export const DURATION_IN_FRAMES = 1800;

const SCENES = [
  {start: 0, end: 240},
  {start: 210, end: 510},
  {start: 480, end: 780},
  {start: 750, end: 1050},
  {start: 1020, end: 1320},
  {start: 1290, end: 1560},
  {start: 1530, end: 1800},
] as const;

const FADE = 18;
const TOP_SCORE = MODELS[0].score;
const TIER_MAX = Math.max(...TIER_COUNTS);
const PROVIDER_MAX = Math.max(...PROVIDER_COUNTS.map((p) => p.count));

// Same scale functions as public/video.js buildScatter — precomputed once at
// module scope so no per-frame DOM measurement is ever needed.
const SCATTER_W = 952;
const SCATTER_H = 800;
const scatterPos = (speed: number | null, score: number) => ({
  x: ((speed ?? 0) / 800) * (SCATTER_W - 120) + 60,
  y: SCATTER_H - ((score - 20) / 40) * (SCATTER_H - 120) - 60,
});
const SCATTER_POS = SCATTER_POINTS.map((p) => scatterPos(p.speed, p.score));
const prog = (frame: number, start: number, len: number) =>
  interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
const sceneOpacity = (frame: number, start: number, end: number) =>
  Math.min(
    prog(frame, start, FADE),
    interpolate(frame, [end - FADE, end], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
.bg-grid { position: absolute; inset: 0; opacity: 0.15;
  background-image: linear-gradient(rgba(248,250,252,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,.06) 1px, transparent 1px);
  background-size: 72px 72px; }
.scene { position: absolute; inset: 0; padding: 72px 64px 112px; display: flex; flex-direction: column; }
.scene-intro, .scene-outro { padding-top: 82px; }
.scene-providers { padding-top: 58px; }
.kicker { display: inline-flex; align-items: center; gap: 12px; align-self: flex-start; padding: 12px 18px;
  border: 1px solid rgba(248,250,252,.15); border-radius: 8px; background: rgba(248,250,252,.08);
  color: #94A3B8; font-size: 28px; font-weight: 700; }
.kicker-dot { width: 10px; height: 10px; border-radius: 20px; background: #10B981; }
.intro-title { margin-top: 146px; }
.hero-title { font-size: 108px; line-height: 1.02; font-weight: 900; }
.hero-title span { color: #10B981; }
.hero-subtitle { margin-top: 42px; width: 820px; font-size: 38px; line-height: 1.48; color: #94A3B8; font-weight: 600; }
.intro-metrics { margin-top: auto; display: grid; gap: 24px; }
.metric { border-top: 8px solid var(--accent); padding: 24px 28px; background: rgba(248,250,252,.06); box-shadow: 0 22px 70px rgba(0,0,0,.3); }
.metric-label { font-size: 28px; color: #94A3B8; font-weight: 700; }
.metric-value { font-size: 60px; font-weight: 900; margin-top: 8px; }
.scene-title { font-size: 68px; line-height: 1.08; font-weight: 900; margin-top: 30px; }
.scene-title.wide { font-size: 70px; }
.provider-title { font-size: 72px; }
.scene-subtitle { font-size: 28px; line-height: 1.42; color: #94A3B8; margin-top: 22px; font-weight: 650; }
.scene-subtitle.small { font-size: 24px; font-weight: 700; margin-top: 18px; }
.bars-container { margin-top: 42px; display: grid; gap: 16px; }
.bar-row { display: grid; grid-template-columns: 62px 1fr 132px; gap: 18px; align-items: center; }
.bar-rank { width: 54px; height: 54px; display: grid; place-items: center; color: white; font-size: 27px; font-weight: 900; }
.bar-track { height: 35px; background: rgba(248,250,252,.08); margin-top: 9px; overflow: hidden; }
.bar-fill { height: 100%; }
.bar-name { font-size: 28px; font-weight: 800; }
.bar-provider { font-size: 22px; color: #94A3B8; font-weight: 600; }
.bar-score { font-size: 28px; font-weight: 800; text-align: right; }
.scatter-container { position: relative; margin-top: 32px; flex: 1; }
.scatter-dot { position: absolute; border-radius: 50%; }
.scatter-label { position: absolute; font-size: 18px; font-weight: 700; white-space: nowrap; }
.legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; color: #94A3B8; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.insight-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; margin-top: 58px; }
.insight-card { min-height: 196px; padding: 24px; background: rgba(248,250,252,.07); border: 1px solid rgba(248,250,252,.12); }
.insight-label { font-size: 22px; color: #94A3B8; font-weight: 700; }
.insight-title { font-size: 34px; line-height: 1.1; font-weight: 900; margin-top: 18px; }
.insight-value { font-size: 46px; font-weight: 900; margin-top: 22px; }
.tier-list { display: grid; gap: 30px; margin-top: 64px; }
.tier-row { display: grid; grid-template-columns: 138px 1fr 92px; gap: 18px; align-items: center; }
.tier-label { font-size: 30px; font-weight: 900; }
.tier-note { font-size: 21px; color: #94A3B8; font-weight: 650; margin-top: 6px; }
.tier-track { height: 34px; background: rgba(248,250,252,.08); overflow: hidden; }
.tier-fill { height: 100%; }
.tier-count { font-size: 34px; font-weight: 900; text-align: right; }
.provider-list { display: grid; gap: 22px; margin-top: 44px; }
.provider-bar { height: 30px; background: rgba(248,250,252,.08); margin-top: 10px; }
.provider-fill { height: 100%; }
.provider-row-label { font-size: 32px; font-weight: 800; }
.provider-row-value { font-size: 36px; font-weight: 800; }
.outro-content { margin-top: 130px; }
.outro-title { font-size: 86px; line-height: 1.1; font-weight: 900; margin-top: 58px; }
.outro-bullets { margin-top: 58px; display: grid; gap: 20px; font-size: 36px; color: #94A3B8; font-weight: 700; }
.gradient-line { height: 12px; margin-top: 58px; background: linear-gradient(90deg, #3B82F6, #10B981, #F59E0B); }
.timeline-bar { position: absolute; left: 64px; right: 64px; bottom: 48px; height: 7px; background: rgba(248,250,252,.12); }
.timeline-fill { height: 100%; background: #10B981; }
`;

const Kicker: React.FC<{text: string}> = ({text}) => (
  <div className="kicker">
    <span className="kicker-dot" />
    {text}
  </div>
);

export const AiModelRankings: React.FC<{locale?: LocaleKey}> = ({locale: localeKey = 'en'}) => {
  const frame = useCurrentFrame();
  const loc = LOCALES[localeKey];
  const s = loc.scenes;
  const providerName = (key: string, label: string) => loc.providers[key] || label || key;

  const metricValues = [METRICS.totalModels, METRICS.topModel, METRICS.fastestModel];
  const totalPlain = METRICS.totalModels.replace('+', '');
  const bullets = s.outro.bullets.map((b) => b.replace('{{total}}', totalPlain));
  const effCards = s.efficiency.cards.map((c, i) => ({
    ...c,
    title: c.title.replace('{{card0}}', CARDS[0]?.name ?? '').replace('{{card1}}', CARDS[1]?.name ?? '').replace('{{card2}}', CARDS[2]?.name ?? '').replace('{{card3}}', CARDS[3]?.name ?? ''),
    value: CARDS[i]?.value || c.value,
    color: CARDS[i]?.color || c.color,
  }));
  const tiers = s.tiers.rows.map((row, i) => ({...row, count: TIER_COUNTS[i] || 0}));
  const providers = PROVIDER_COUNTS.map((p) => ({...p, name: providerName(p.providerKey, p.label)}));
  const legendSeen = new Map<string, string>();
  SCATTER_POINTS.forEach((p) => {
    const name = providerName(p.providerKey, p.providerLabel);
    if (!legendSeen.has(name)) legendSeen.set(name, p.color);
  });

  // Intro
  const titleEnter = prog(frame, 0, 36);
  const metricsOpacity = prog(frame, 24, 24);

  // Ranking bars (stagger: per-index 5-frame delay, 30-frame enter)
  const barLocal = frame - 220;
  // Scatter (stagger: 6-frame delay, 30-frame enter)
  const scatterLocal = frame - 520;
  // Efficiency cards (translateY stagger: 12-frame delay, 32-frame enter)
  const effLocal = frame - 770;
  // Tiers (12-frame delay, 34-frame enter, Math.round counters)
  const tierLocal = frame - 1040;
  // Providers (8-frame delay, 30-frame enter, Math.round counters)
  const provLocal = frame - 1310;
  // Outro
  const outroLocal = frame - 1540;
  const reveal = prog(outroLocal, 0, 24);
  const lineW = interpolate(outroLocal, [12, 34], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#0F172A', color: '#F8FAFC', fontFamily: loc.fontFamily}}>
      <style>{CSS}</style>
      <div className="bg-grid" />

      {/* 1 — Intro */}
      <div className="scene scene-intro" style={{opacity: sceneOpacity(frame, SCENES[0].start, SCENES[0].end)}}>
        <Kicker text={s.intro.kicker} />
        <div className="intro-title" style={{opacity: titleEnter, transform: `translateY(${(1 - titleEnter) * 76}px)`}}>
          <div className="hero-title" dangerouslySetInnerHTML={{__html: s.intro.title}} />
          <div className="hero-subtitle">{s.intro.subtitle}</div>
        </div>
        <div className="intro-metrics" style={{opacity: metricsOpacity}}>
          {s.intro.metrics.map((m, i) => (
            <div key={m.label} className="metric" style={{'--accent': m.color} as React.CSSProperties}>
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{metricValues[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2 — Ranking bars x15 */}
      <div className="scene" style={{opacity: sceneOpacity(frame, SCENES[1].start, SCENES[1].end)}}>
        <Kicker text={s.ranking.kicker} />
        <div className="scene-title" dangerouslySetInnerHTML={{__html: s.ranking.title}} />
        <div className="scene-subtitle small">{s.ranking.subtitle}</div>
        <div className="bars-container">
          {MODELS.map((item, i) => {
            const enter = prog(barLocal - i * 5, 0, 30);
            return (
              <div key={item.rank} className="bar-row" style={{opacity: enter, transform: `translateX(${(1 - enter) * -60}px)`}}>
                <div className="bar-rank" style={{background: item.color}}>{item.rank}</div>
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', gap: 20}}>
                    <div className="bar-name">{item.name}</div>
                    <div className="bar-provider">{providerName(item.providerKey, item.providerLabel)}</div>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width: `${enter * (item.score / TOP_SCORE) * 100}%`, background: `linear-gradient(90deg,${item.color},${item.color}B8)`}} />
                  </div>
                </div>
                <div className="bar-score">{item.score}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 — Scatter: speed/score scales → absolute divs */}
      <div className="scene" style={{opacity: sceneOpacity(frame, SCENES[2].start, SCENES[2].end)}}>
        <Kicker text={s.scatter.kicker} />
        <div className="scene-title">{s.scatter.title}</div>
        <div className="scene-subtitle small">{s.scatter.subtitle}</div>
        <div className="scatter-container" style={{width: SCATTER_W, height: SCATTER_H}}>
          <div style={{position: 'absolute', inset: 0}}>
            <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(248,250,252,.2)'}} />
            <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, background: 'rgba(248,250,252,.2)'}} />
            <div style={{position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)', fontSize: 20, color: '#94A3B8', fontWeight: 600}}>{s.scatter.xAxis}</div>
            <div style={{position: 'absolute', left: -48, top: '50%', transform: 'rotate(-90deg) translateX(-50%)', fontSize: 20, color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap'}}>{s.scatter.yAxis}</div>
          </div>
          {SCATTER_POINTS.map((item, i) => {
            const enter = prog(scatterLocal - i * 6, 0, 30);
            const {x, y} = SCATTER_POS[i];
            return (
              <React.Fragment key={`${item.name}-${i}`}>
                <div className="scatter-dot" style={{left: x, top: y, width: 24, height: 24, background: item.color, opacity: enter * 0.85, transform: `translate(-50%,-50%) scale(${enter})`}} />
                <div className="scatter-label" style={{left: x + 16, top: y - 8, color: item.color, opacity: enter}}>{item.name}</div>
              </React.Fragment>
            );
          })}
        </div>
        <div className="legend">
          {[...legendSeen.entries()].map(([name, color]) => (
            <div key={name} className="legend-item">
              <div className="legend-dot" style={{background: color}} />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* 4 — Efficiency cards */}
      <div className="scene" style={{opacity: sceneOpacity(frame, SCENES[3].start, SCENES[3].end)}}>
        <Kicker text={s.efficiency.kicker} />
        <div className="scene-title wide" dangerouslySetInnerHTML={{__html: s.efficiency.title}} />
        <div className="scene-subtitle">{s.efficiency.subtitle}</div>
        <div className="insight-grid">
          {effCards.map((item, i) => {
            const enter = prog(effLocal - i * 12, 0, 32);
            return (
              <div key={item.label} className="insight-card" style={{borderTop: `8px solid ${item.color}`, opacity: enter, transform: `translateY(${(1 - enter) * 42}px)`}}>
                <div className="insight-label">{item.label}</div>
                <div className="insight-title">{item.title}</div>
                <div className="insight-value" style={{color: item.color}}>{item.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 — Tiers */}
      <div className="scene" style={{opacity: sceneOpacity(frame, SCENES[4].start, SCENES[4].end)}}>
        <Kicker text={s.tiers.kicker} />
        <div className="scene-title wide" dangerouslySetInnerHTML={{__html: s.tiers.title}} />
        <div className="scene-subtitle">{s.tiers.subtitle}</div>
        <div className="tier-list">
          {tiers.map((item, i) => {
            const enter = prog(tierLocal - i * 12, 0, 34);
            return (
              <div key={item.label} className="tier-row" style={{opacity: enter, transform: `translateX(${(1 - enter) * -50}px)`}}>
                <div>
                  <div className="tier-label">{item.label}</div>
                  <div className="tier-note">{item.note}</div>
                </div>
                <div className="tier-track">
                  <div className="tier-fill" style={{background: item.color, width: `${enter * ((item.count / TIER_MAX) * 100)}%`}} />
                </div>
                <div className="tier-count">{Math.round(item.count * enter)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6 — Providers */}
      <div className="scene scene-providers" style={{opacity: sceneOpacity(frame, SCENES[5].start, SCENES[5].end)}}>
        <Kicker text={s.providers.kicker} />
        <div className="scene-title provider-title" dangerouslySetInnerHTML={{__html: s.providers.title}} />
        <div className="scene-subtitle">{s.providers.subtitle}</div>
        <div className="provider-list">
          {providers.map((item, i) => {
            const enter = prog(provLocal - i * 8, 0, 30);
            return (
              <div key={item.providerKey} style={{opacity: enter, transform: `translateY(${(1 - enter) * 36}px)`}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div className="provider-row-label">{item.name}</div>
                  <div className="provider-row-value">{Math.round(item.count * enter)}</div>
                </div>
                <div className="provider-bar">
                  <div className="provider-fill" style={{width: `${enter * (item.count / PROVIDER_MAX) * 100}%`, background: item.color}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7 — Outro + timeline fill */}
      <div className="scene scene-outro" style={{opacity: sceneOpacity(frame, SCENES[6].start, SCENES[6].end)}}>
        <div className="outro-content" style={{opacity: reveal, transform: `translateY(${(1 - reveal) * 54}px)`}}>
          <Kicker text={s.outro.kicker} />
          <div className="outro-title" dangerouslySetInnerHTML={{__html: s.outro.title}} />
          <div className="gradient-line" style={{width: `${lineW}%`}} />
          <div className="outro-bullets">
            {bullets.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="timeline-bar">
        <div className="timeline-fill" style={{width: `${(frame / DURATION_IN_FRAMES) * 100}%`}} />
      </div>
    </AbsoluteFill>
  );
};
