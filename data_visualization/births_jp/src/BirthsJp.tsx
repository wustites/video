import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FACTS, FIRST, LAST, NATIONAL, PREFECTURES, RANKED, TILES, byCode, type Prefecture} from './data';
import {fontFamilies} from './fonts';
import {CUES, TEXT, type Locale} from './i18n';
import {getTimeline, type SceneId, type Timeline} from './timing';

const RED = '#ff6b6b';
const GOLD = '#ffd166';
const GREEN = '#4ade80';
const MUTED = '#9fb3c8';
const BAR = '#3b82f6';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const prog = (f: number, start: number, len = 15) => interpolate(f, [start, start + len], [0, 1], clamp);

type Ctx = {locale: Locale; tl: Timeline; t: (typeof TEXT)[Locale]};
const LocaleContext = createContext<Ctx>(null!);

/** Local frame of scene `id` plus `at(key)`: the frame its narration says that scene's cue word. */
const useScene = (id: SceneId) => {
  const {locale, tl, t} = useContext(LocaleContext);
  const f = useCurrentFrame() - tl.scenes.find((s) => s.id === id)!.start;
  const at = (key: string) => tl.cue(id, CUES[locale][id][key]);
  return {f, at, t, locale};
};

const FADE = 10;
const Scene: React.FC<{id: SceneId; children: React.ReactNode; center?: boolean}> = ({id, children, center}) => {
  const {tl} = useContext(LocaleContext);
  const frame = useCurrentFrame();
  const s = tl.scenes.find((x) => x.id === id)!;
  const isLast = s === tl.scenes[tl.scenes.length - 1];
  const o = frame < s.start || (!isLast && frame > s.end) ? 0 : Math.min(s.start === 0 ? 1 : (frame - s.start) / FADE, isLast ? 1 : (s.end - frame) / FADE, 1);
  return (
    <AbsoluteFill style={{opacity: Math.max(0, o), visibility: o > 0 ? 'visible' : 'hidden', padding: '130px 70px 150px', display: 'flex', flexDirection: 'column', justifyContent: center ? 'center' : 'flex-start', color: '#fff'}}>
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{alignSelf: 'flex-start', fontSize: 32, fontWeight: 700, letterSpacing: 3, color: RED, padding: '10px 24px', border: `2px solid ${RED}`, borderRadius: 999}}>{children}</div>
);
const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 80}) => (
  <div style={{fontSize: size, fontWeight: 900, lineHeight: 1.18, marginTop: 34}}>{children}</div>
);
const Pill: React.FC<{p: number; color?: string; children: React.ReactNode}> = ({p, color = GOLD, children}) => (
  <div style={{alignSelf: 'flex-start', marginTop: 40, padding: '18px 34px', borderRadius: 999, background: `${color}22`, border: `3px solid ${color}`, color, fontSize: 42, fontWeight: 900, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>{children}</div>
);

/* 1 — 2025 vs 2000 */
const Intro: React.FC = () => {
  const {f, at, t} = useScene('intro');
  const rows = [
    {year: LAST, v: FACTS.last, cue: at('last'), color: RED},
    {year: FIRST, v: FACTS.first, cue: at('first'), color: BAR},
  ];
  return (
    <Scene id="intro" center>
      <Kicker>{t.intro.kicker}</Kicker>
      <Title size={104}>{t.intro.title}</Title>
      <div style={{display: 'grid', gap: 50, marginTop: 90}}>
        {rows.map((r) => {
          const e = prog(f, r.cue - 8, 20);
          return (
            <div key={r.year} style={{opacity: e}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{fontSize: 46, fontWeight: 700, color: MUTED}}>{t.intro.year(r.year)}</span>
                <span style={{fontSize: 96, fontWeight: 900, color: r.color}}>{t.big(Math.round(r.v * e))}<span style={{fontSize: 44}}>{t.unit}</span></span>
              </div>
              <div style={{height: 54, marginTop: 12, background: 'rgba(255,255,255,.08)', borderRadius: 12}}>
                <div style={{height: '100%', width: `${(r.v / FACTS.first) * 100 * e}%`, background: r.color, borderRadius: 12}} />
              </div>
            </div>
          );
        })}
      </div>
      <Pill p={prog(f, at('drop') - 5)} color={RED}>↓ {t.intro.drop}</Pill>
    </Scene>
  );
};

/* 2 — National trend, 26 bars */
const Trend: React.FC = () => {
  const {f, at, t} = useScene('trend');
  const H = 900;
  const max = 1_200_000;
  const million = prog(f, at('million') - 5);
  const streak = prog(f, at('streak') - 5);
  const low = prog(f, at('low') - 5);
  return (
    <Scene id="trend">
      <Kicker>{t.trend.kicker}</Kicker>
      <Title>{t.trend.title}</Title>
      <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 8, height: H, marginTop: 110}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: (1_000_000 / max) * H, borderTop: `3px dashed ${GOLD}`, opacity: million, zIndex: 3}}>
          <span style={{position: 'absolute', left: 0, top: -48, background: '#1c2541', padding: '0 10px', fontSize: 32, fontWeight: 700, color: GOLD}}>{t.trend.million}</span>
        </div>
        <div style={{position: 'absolute', right: 0, top: 0, textAlign: 'right', opacity: low, fontWeight: 900, zIndex: 3}}>
          <div style={{fontSize: 36, color: RED}}>{LAST} · {t.trend.low}</div>
          <div style={{fontSize: 56}}>{t.num(FACTS.last)}</div>
        </div>
        {NATIONAL.map((r, i) => {
          const e = prog(f, 5 + i * 4, 14);
          const inStreak = r.year >= FACTS.belowMillion;
          const color = r.year === LAST && low > 0 ? RED : inStreak && streak > 0 ? `rgba(255,107,107,${0.45 + 0.3 * streak})` : BAR;
          return (
            <div key={r.year} style={{flex: 1, height: (r.births / max) * H * e, background: color, borderRadius: '6px 6px 0 0', position: 'relative'}}>
              {r.year === FIRST && (
                <div style={{position: 'absolute', bottom: '100%', left: 0, marginBottom: 12, whiteSpace: 'nowrap', fontSize: 40, fontWeight: 900, opacity: e}}>{t.num(r.births)}</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 700, color: MUTED, marginTop: 16}}>
        {[FIRST, 2005, 2010, 2015, 2020, LAST].map((y) => <span key={y}>{y}</span>)}
      </div>
    </Scene>
  );
};

/* 3 — Top 10 prefectures in 2025 */
const Ranking: React.FC = () => {
  const {f, at, t, locale} = useScene('ranking');
  const top10 = RANKED.slice(0, 10);
  const max = top10[0].last;
  const rest = at('rest');
  return (
    <Scene id="ranking">
      <Kicker>{t.ranking.kicker}</Kicker>
      <Title>{t.ranking.title}</Title>
      <div style={{display: 'grid', gap: 22, marginTop: 60}}>
        {top10.map((p, i) => {
          const e = prog(f, i === 0 ? at('top') - 5 : rest - 5 + (i - 1) * 7, 16);
          return (
            <div key={p.code} style={{display: 'grid', gridTemplateColumns: '200px 1fr 190px', alignItems: 'center', gap: 20, opacity: e}}>
              <span style={{fontSize: 42, fontWeight: 900}}>{p[locale]}</span>
              <div style={{height: 50, background: 'rgba(255,255,255,.08)', borderRadius: 10}}>
                <div style={{height: '100%', width: `${(p.last / max) * 100 * e}%`, borderRadius: 10, background: i === 0 ? RED : BAR}} />
              </div>
              <span style={{fontSize: 40, fontWeight: 900, textAlign: 'right', color: i === 0 ? RED : '#fff'}}>{t.num(p.last)}</span>
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: 18, marginTop: 56, alignItems: 'center'}}>
        {Array.from({length: 8}, (_, i) => {
          const e = prog(f, at('oneIn8') + i * 3, 10);
          return <div key={i} style={{width: 64, height: 64, borderRadius: 999, background: i === 0 ? RED : 'rgba(255,255,255,.18)', transform: `scale(${e})`}} />;
        })}
      </div>
      <Pill p={prog(f, at('share') - 5)} color={RED}>{t.ranking.share}</Pill>
    </Scene>
  );
};

/* 4 — Tile map: 2025 as a share of 2000 */
const tileColor = (r: number) => (r < 0.5 ? '#e63946' : r < 0.7 ? '#f4a261' : '#e9d8a6');
const MapScene: React.FC = () => {
  const {f, at, t, locale} = useScene('map');
  const S = 72;
  const G = 6;
  const colored = prog(f, at('all') - 5, 30);
  const half = prog(f, at('half') - 5);
  const steep = prog(f, at('steepest') - 5);
  const mild = prog(f, at('mildest') - 5);
  const focus = mild > 0 ? FACTS.mildest.code : steep > 0 ? FACTS.steepest.code : null;
  return (
    <Scene id="map">
      <Kicker>{t.map.kicker}</Kicker>
      <Title>{t.map.title}</Title>
      <div style={{position: 'relative', width: 13 * S + 12 * G, height: 12 * S + 11 * G, marginTop: 60, alignSelf: 'center'}}>
        {TILES.map(([code, x, y], i) => {
          const p = byCode(code);
          const e = prog(f, 3 + i * 0.6, 12);
          const dim = (half > 0 && p.ratio >= 0.5 && !focus) || (focus !== null && focus !== code);
          const isFocus = focus === code;
          return (
            <div
              key={code}
              style={{
                position: 'absolute', left: x * (S + G), top: y * (S + G), width: S, height: S, borderRadius: 10,
                background: colored > 0 ? tileColor(p.ratio) : '#334155',
                opacity: e * (dim ? 0.4 : 1),
                outline: isFocus ? `5px solid #fff` : 'none',
                transform: `scale(${isFocus ? 1.25 : 1})`, zIndex: isFocus ? 2 : 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: colored > 0 && p.ratio >= 0.5 ? '#1e293b' : '#fff', lineHeight: 1.05,
              }}
            >
              <span style={{fontSize: p[locale].length > 2 ? 17 : 22, fontWeight: 900}}>{p[locale]}</span>
              <span style={{fontSize: 18, fontWeight: 700, opacity: colored}}>{Math.round(p.ratio * 100)}</span>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 0, top: 0, display: 'grid', gap: 14, opacity: colored}}>
          {t.map.legend.map((label, i) => (
            <div key={label} style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 700}}>
              <div style={{width: 34, height: 34, borderRadius: 8, background: tileColor([0.4, 0.6, 0.8][i])}} />{label}
            </div>
          ))}
        </div>
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 10}}>
        <Pill p={half} color={RED}>{t.map.half}</Pill>
        {steep > 0 && <Pill p={steep * (1 - mild)} color={RED}>{t.map.steepest}</Pill>}
        {mild > 0 && <Pill p={mild} color={GOLD}>{t.map.mildest}</Pill>}
      </div>
    </Scene>
  );
};

/* 5 — The smallest prefectures */
const Small: React.FC = () => {
  const {f, at, t, locale} = useScene('small');
  const rows = [...RANKED].reverse().slice(0, FACTS.under5000);
  const max = 6000;
  const under = prog(f, at('under') - 5);
  return (
    <Scene id="small">
      <Kicker>{t.small.kicker}</Kicker>
      <Title>{t.small.title}</Title>
      <div style={{position: 'relative', display: 'grid', gap: 14, marginTop: 60}}>
        <div style={{position: 'absolute', top: -20, bottom: -20, left: `calc(170px + (100% - 170px - 150px) * ${5000 / max})`, borderLeft: `3px dashed ${GOLD}`, opacity: under}}>
          <span style={{position: 'absolute', top: -46, left: -60, fontSize: 30, fontWeight: 700, color: GOLD, whiteSpace: 'nowrap'}}>{t.small.line}</span>
        </div>
        {rows.map((p, i) => {
          const first = i === 0;
          const e = first ? prog(f, at('smallest') - 5, 16) : prog(f, at('under') - 5 + i * 4, 12);
          return (
            <div key={p.code} style={{display: 'grid', gridTemplateColumns: '150px 1fr 150px', alignItems: 'center', gap: 10, opacity: e}}>
              <span style={{fontSize: 38, fontWeight: 900, color: first ? RED : '#fff'}}>{p[locale]}</span>
              <div style={{height: 46}}>
                <div style={{height: '100%', width: `${(p.last / max) * 100 * e}%`, borderRadius: 8, background: first ? RED : BAR}} />
              </div>
              <span style={{fontSize: 36, fontWeight: 900, textAlign: 'right', color: first ? RED : '#fff'}}>{t.num(p.last)}</span>
            </div>
          );
        })}
      </div>
      <Pill p={prog(f, at('count') - 5)} color={RED}>{FACTS.smallest[`${locale}Full`]} {t.num(FACTS.smallest.last)}{t.unit}</Pill>
    </Scene>
  );
};

/* 6 — Only a few prefectures grew year on year */
const Risers: React.FC = () => {
  const {f, at, t, locale} = useScene('risers');
  const risers = FACTS.risers;
  const max = risers[0].last - risers[0].prev;
  const fallers = PREFECTURES.filter((p) => p.last <= p.prev);
  const rest = prog(f, at('rest') - 10, 30);
  return (
    <Scene id="risers">
      <Kicker>{t.risers.kicker}</Kicker>
      <Title>{t.risers.title}</Title>
      <div style={{display: 'grid', gap: 30, marginTop: 70}}>
        {risers.map((p: Prefecture, i) => {
          const d = p.last - p.prev;
          const e = prog(f, i === 0 ? at('top') - 5 : at('others') - 5 + (i - 1) * 8, 16);
          return (
            <div key={p.code} style={{display: 'grid', gridTemplateColumns: '170px 1fr 170px', alignItems: 'center', gap: 20, opacity: e}}>
              <span style={{fontSize: 46, fontWeight: 900}}>{p[locale]}</span>
              <div style={{height: 56, background: 'rgba(255,255,255,.08)', borderRadius: 12}}>
                <div style={{height: '100%', width: `${Math.max(2, (d / max) * 100) * e}%`, borderRadius: 12, background: GREEN}} />
              </div>
              <span style={{fontSize: 48, fontWeight: 900, color: GREEN, textAlign: 'right'}}>+{t.num(d)}</span>
            </div>
          );
        })}
      </div>
      <div style={{fontSize: 44, fontWeight: 900, color: RED, marginTop: 80, opacity: rest}}>↓ {t.risers.rest}</div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 12, marginTop: 30}}>
        {fallers.map((p, i) => {
          const e = prog(f, at('rest') - 10 + i * 0.5, 8);
          return (
            <div key={p.code} style={{aspectRatio: '1/1', borderRadius: 8, background: RED, opacity: e, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: p[locale].length > 2 ? 15 : 20, fontWeight: 900}}>
              {p[locale]}
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

/* 7 — Outro */
const Outro: React.FC = () => {
  const {f, at, t} = useScene('outro');
  return (
    <Scene id="outro" center>
      <Title size={84}>{t.outro.title}</Title>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: 260, marginTop: 90}}>
        {NATIONAL.map((r) => (
          <div key={r.year} style={{flex: 1, height: (r.births / FACTS.first) * 260, background: r.year === LAST ? RED : 'rgba(255,255,255,.25)', borderRadius: '4px 4px 0 0'}} />
        ))}
      </div>
      <div style={{marginTop: 80, fontSize: 30, color: MUTED, lineHeight: 1.7, opacity: prog(f, at('source') - 5)}}>{t.outro.source}</div>
    </Scene>
  );
};

export const BirthsJp: React.FC<{locale: Locale}> = ({locale}) => {
  const frame = useCurrentFrame();
  const tl = getTimeline(locale);
  const family = fontFamilies[locale];
  return (
    <LocaleContext.Provider value={{locale, tl, t: TEXT[locale]}}>
      <AbsoluteFill lang={locale === 'zh' ? 'zh-CN' : 'ja'} style={{background: 'linear-gradient(180deg, #0b132b 0%, #1c2541 55%, #2a1f3d 100%)', fontFamily: `"${family}", ${locale === 'zh' ? '"Noto Sans SC"' : '"Noto Sans JP"'}, sans-serif`}}>
        <Intro />
        <Trend />
        <Ranking />
        <MapScene />
        <Small />
        <Risers />
        <Outro />
        <Audio src={staticFile(`voiceover/narration.${locale}.mp3`)} />
        <div style={{position: 'absolute', left: 70, right: 70, bottom: 60, height: 6, background: 'rgba(255,255,255,.12)', borderRadius: 3}}>
          <div style={{height: '100%', width: `${(frame / tl.duration) * 100}%`, background: RED, borderRadius: 3}} />
        </div>
      </AbsoluteFill>
    </LocaleContext.Provider>
  );
};
