import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  COMPANIES,
  COUNTRY_SPLIT,
  DURATION_IN_FRAMES,
  MAX_REVENUE,
  PROFIT_LEADERS,
  SCENES,
  SECTORS,
  SECTOR_OTHER,
  TOTALS,
  yi,
} from './data';
import {fontFamily} from './fonts';

const INK = '#0F172A';
const MUTED = '#64748B';
const GREY = '#CBD5E1';

/** Scenes overlap by ~30 frames. Fade the outgoing scene out in the first
 * half of the overlap and the incoming one in during the second half, so two
 * titles are never visible at the same time. */
const HALF_OVERLAP = 15;
function sceneOpacity(frame: number, start: number, end: number): number {
  const fadeIn = start === 0 ? 0 : HALF_OVERLAP;
  const fadeOut = end >= DURATION_IN_FRAMES ? 0 : HALF_OVERLAP;
  return interpolate(
    frame,
    [start + fadeIn, start + fadeIn + HALF_OVERLAP, end - fadeOut - HALF_OVERLAP, end - fadeOut],
    [start === 0 ? 1 : 0, 1, 1, end >= DURATION_IN_FRAMES ? 1 : 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
}

/** 0 → 1 over `duration` frames starting at `start`. */
function enterAt(frame: number, start: number, duration: number): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

const BgGrid: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity: 0.36,
      backgroundImage:
        'linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)',
      backgroundSize: '72px 72px',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 88%, transparent)',
      maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 88%, transparent)',
    }}
  />
);

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 18px',
      border: '1px solid rgba(15,23,42,.12)',
      borderRadius: 8,
      background: 'rgba(255,255,255,.76)',
      color: MUTED,
      fontSize: 30,
      fontWeight: 800,
      alignSelf: 'flex-start',
    }}
  >
    <span style={{width: 10, height: 10, borderRadius: 20, background: '#10B981'}} />
    {children}
  </div>
);

const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 80}) => (
  <div style={{fontSize: size, lineHeight: 1.1, fontWeight: 900, marginTop: 30}}>{children}</div>
);

const Sub: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{fontSize: 34, lineHeight: 1.45, color: MUTED, fontWeight: 700, marginTop: 22, ...style}}>{children}</div>
);

/** A takeaway pill that appears once the chart has landed. */
const Takeaway: React.FC<{p: number; color: string; children: React.ReactNode}> = ({p, color, children}) => (
  <div
    style={{
      alignSelf: 'flex-start',
      marginTop: 40,
      padding: '18px 30px',
      borderRadius: 999,
      background: `${color}1F`,
      border: `3px solid ${color}`,
      fontSize: 38,
      fontWeight: 900,
      opacity: p,
      transform: `translateY(${(1 - p) * 24}px)`,
    }}
  >
    {children}
  </div>
);

const SceneShell: React.FC<{
  frame: number;
  start: number;
  end: number;
  children: React.ReactNode;
  center?: boolean;
}> = ({frame, start, end, children, center = false}) => {
  const opacity = sceneOpacity(frame, start, end);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '96px 64px 140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: center ? 'center' : 'flex-start',
        opacity,
        visibility: opacity > 0 ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  );
};

/** 500 squares, one per company, filled in order. */
const COLS = 25;
const Waffle: React.FC<{local: number; colors: string[]; dim?: (i: number) => boolean; dimP?: number}> = ({local, colors, dim, dimP = 0}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 7, marginTop: 44}}>
    {colors.map((c, i) => {
      const e = enterAt(local, (i / colors.length) * 40, 12);
      return (
        <div
          key={i}
          style={{
            aspectRatio: '1/1',
            borderRadius: 4,
            background: c,
            opacity: e * (dim?.(i) ? 1 - dimP * 0.75 : 1),
            transform: `scale(${0.4 + e * 0.6})`,
          }}
        />
      );
    })}
  </div>
);

const expand = (groups: {count: number; color: string}[]) => groups.flatMap((g) => Array(g.count).fill(g.color) as string[]);

/* ---------------- Scene 1: intro ---------------- */
const IntroScene: React.FC<{frame: number}> = ({frame}) => {
  const enter = enterAt(frame, 0, 36);
  const count = interpolate(frame, [10, 60], [30, TOTALS.revenueTrillion], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const metrics = [
    {label: '总收入', value: `$${TOTALS.revenueTrillion}万亿`, accent: '#2563EB'},
    {label: '总利润', value: `$${TOTALS.profitTrillion}万亿`, accent: '#10B981'},
    {label: '员工', value: `${(TOTALS.employeesMillion * 100).toLocaleString('en-US')}万`, accent: '#F59E0B'},
    {label: '女性 CEO', value: `${TOTALS.womenCeos} 位`, accent: '#EC4899'},
  ];
  return (
    <SceneShell frame={frame} start={SCENES[0].start} end={SCENES[0].end}>
      <Kicker>2025《财富》世界500强</Kicker>
      <div style={{marginTop: 140, opacity: enter, transform: `translateY(${(1 - enter) * 76}px)`}}>
        <div style={{fontSize: 120, lineHeight: 1.04, fontWeight: 900}}>
          谁在驱动全球
          <br />
          <span style={{color: '#2563EB'}}>{count.toFixed(1)} 万亿美元</span>
        </div>
        <Sub style={{marginTop: 40, fontSize: 40}}>500 家最大企业的合计收入。<br />从冠军、国家到行业，看懂这份榜单。</Sub>
      </div>
      <div style={{marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
        {metrics.map((m, i) => {
          const e = enterAt(frame, 30 + i * 8, 24);
          return (
            <div key={m.label} style={{borderTop: `8px solid ${m.accent}`, padding: '28px 30px', background: 'rgba(255,255,255,.86)', boxShadow: '0 22px 70px rgba(15,23,42,.10)', opacity: e, transform: `translateY(${(1 - e) * 30}px)`}}>
              <div style={{fontSize: 30, color: MUTED, fontWeight: 800}}>{m.label}</div>
              <div style={{fontSize: 62, fontWeight: 900, marginTop: 8}}>{m.value}</div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ---------------- Scene 2: revenue Top 10 ---------------- */
const TopbarsScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - SCENES[1].start;
  const focus = enterAt(local, 170, 24);
  const byCountry = (c: string) => COMPANIES.filter((x) => x.country === c).length;
  return (
    <SceneShell frame={frame} start={SCENES[1].start} end={SCENES[1].end}>
      <Kicker>收入排行 Top 10</Kicker>
      <Title>沃尔玛连续 {TOTALS.walmartStreak} 年<br />位居榜首</Title>
      <Sub>2024 财年营业收入（美元）</Sub>
      <div style={{marginTop: 44, display: 'grid', gap: 22}}>
        {COMPANIES.map((item, i) => {
          const enter = enterAt(local, 20 + i * 5, 30);
          return (
            <div key={item.rank} style={{display: 'grid', gridTemplateColumns: '62px 1fr 190px', gap: 18, alignItems: 'center', opacity: enter, transform: `translateX(${(1 - enter) * -60}px)`}}>
              <div style={{width: 58, height: 58, display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 900, background: '#E2E8F0', borderLeft: `8px solid ${item.color}`}}>{item.rank}</div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                  <div style={{fontSize: 36, fontWeight: 900}}>{item.nameZh}</div>
                  <div style={{fontSize: 26, color: item.color, fontWeight: 900}}>{item.country}</div>
                </div>
                <div style={{height: 34, background: 'rgba(15,23,42,.08)', marginTop: 8, overflow: 'hidden'}}>
                  <div style={{height: '100%', width: `${enter * (item.revenue / MAX_REVENUE) * 100}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}B8)`}} />
                </div>
              </div>
              <div style={{fontSize: 34, fontWeight: 900, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{yi(item.revenue)}</div>
            </div>
          );
        })}
      </div>
      <Takeaway p={focus} color="#2563EB">
        前十：美国 {byCountry('美国')} 家 · 中国 {byCountry('中国')} 家 · 沙特 {byCountry('沙特')} 家
      </Takeaway>
    </SceneShell>
  );
};

/* ---------------- Scene 3: country split ---------------- */
const CountryScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - SCENES[2].start;
  const focus = enterAt(local, 110, 24);
  return (
    <SceneShell frame={frame} start={SCENES[2].start} end={SCENES[2].end}>
      <Kicker>国家与地区分布</Kicker>
      <Title>美国 138 家，<br />中国 130 家</Title>
      <Sub>每个方块代表一家上榜公司</Sub>
      <Waffle local={local - 15} colors={expand(COUNTRY_SPLIT)} dim={(i) => i >= 268} dimP={focus} />
      <div style={{display: 'grid', gap: 18, marginTop: 44}}>
        {COUNTRY_SPLIT.map((c, i) => {
          const e = enterAt(local, 40 + i * 10, 24);
          return (
            <div key={c.name} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: e}}>
              <span style={{width: 30, height: 30, borderRadius: 6, background: c.color}} />
              <span style={{fontSize: 38, fontWeight: 900, flex: 1}}>{c.name}{c.note && <span style={{fontSize: 26, color: MUTED, fontWeight: 700}}>（{c.note}）</span>}</span>
              <span style={{fontSize: 44, fontWeight: 900}}>{c.count}</span>
            </div>
          );
        })}
      </div>
      <Takeaway p={focus} color="#EF4444">两国合计 268 家，占榜单 54%</Takeaway>
    </SceneShell>
  );
};

/* ---------------- Scene 4: sectors ---------------- */
const IndustryScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - SCENES[3].start;
  const focus = enterAt(local, 110, 24);
  const big5 = SECTORS.reduce((s, x) => s + x.count, 0);
  return (
    <SceneShell frame={frame} start={SCENES[3].start} end={SCENES[3].end}>
      <Kicker>行业结构</Kicker>
      <Title>五大行业，<br />撑起六成席位</Title>
      <Sub>按上榜公司数量排序的前五个行业</Sub>
      <Waffle local={local - 15} colors={[...expand(SECTORS), ...Array(SECTOR_OTHER).fill(GREY)]} />
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 40px', marginTop: 40}}>
        {SECTORS.map((x, i) => {
          const e = enterAt(local, 40 + i * 8, 24);
          return (
            <div key={x.name} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: e}}>
              <span style={{width: 28, height: 28, borderRadius: 6, background: x.color}} />
              <span style={{fontSize: 34, fontWeight: 900, flex: 1}}>{x.name}</span>
              <span style={{fontSize: 40, fontWeight: 900}}>{x.count}</span>
            </div>
          );
        })}
      </div>
      <Takeaway p={focus} color="#8B5CF6">合计 {big5} 家，贡献约三分之二收入</Takeaway>
    </SceneShell>
  );
};

/* ---------------- Scene 5: profit ---------------- */
const ProfitScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - SCENES[4].start;
  const walmart = COMPANIES[0];
  const maxProfit = PROFIT_LEADERS[0].profit;
  const compare = enterAt(local, 20, 26);
  return (
    <SceneShell frame={frame} start={SCENES[4].start} end={SCENES[4].end} center>
      <Kicker>利润视角</Kicker>
      <Title size={86}>收入第一，<br />不一定利润第一</Title>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 56, opacity: compare, transform: `translateY(${(1 - compare) * 30}px)`}}>
        {[
          {tag: '收入第 1', name: walmart.nameZh, value: yi(walmart.profit), color: '#2563EB'},
          {tag: '利润第 1', name: PROFIT_LEADERS[0].nameZh, value: yi(PROFIT_LEADERS[0].profit), color: '#10B981'},
        ].map((c) => (
          <div key={c.tag} style={{padding: '30px 30px', background: 'rgba(255,255,255,.9)', borderTop: `8px solid ${c.color}`, boxShadow: '0 20px 64px rgba(15,23,42,.10)'}}>
            <div style={{fontSize: 30, color: c.color, fontWeight: 900}}>{c.tag}</div>
            <div style={{fontSize: 44, fontWeight: 900, marginTop: 12}}>{c.name}</div>
            <div style={{fontSize: 28, color: MUTED, fontWeight: 800, marginTop: 18}}>净利润</div>
            <div style={{fontSize: 60, fontWeight: 900}}>${c.value}</div>
          </div>
        ))}
      </div>
      <Sub style={{marginTop: 56}}>利润最高的四家公司（美元）</Sub>
      <div style={{display: 'grid', gap: 22, marginTop: 24}}>
        {PROFIT_LEADERS.map((p, i) => {
          const e = enterAt(local, 60 + i * 10, 28);
          return (
            <div key={p.nameZh} style={{opacity: e}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{fontSize: 36, fontWeight: 900}}>{i + 1}. {p.nameZh}</span>
                <span style={{fontSize: 36, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{yi(p.profit)}</span>
              </div>
              <div style={{height: 30, background: 'rgba(15,23,42,.08)', marginTop: 8}}>
                <div style={{height: '100%', width: `${e * (p.profit / maxProfit) * 100}%`, background: p.color}} />
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ---------------- Scene 6: outro ---------------- */
const OutroScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - SCENES[5].start;
  const reveal = enterAt(local, 10, 24);
  const lineW = interpolate(local, [22, 44], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const facts = [
    `500 家公司 · ${TOTALS.countries} 个国家和地区`,
    `${TOTALS.revenueTrillion} 万亿美元收入`,
    `${TOTALS.profitTrillion} 万亿美元利润`,
  ];
  return (
    <SceneShell frame={frame} start={SCENES[5].start} end={SCENES[5].end} center>
      <div style={{opacity: reveal, transform: `translateY(${(1 - reveal) * 54}px)`}}>
        <Kicker>可视化结论</Kicker>
        <div style={{fontSize: 96, lineHeight: 1.12, fontWeight: 900, marginTop: 56}}>
          世界500强，
          <br />
          全球经济的
          <br />
          年度体检表。
        </div>
        <div style={{height: 12, marginTop: 56, width: `${lineW}%`, background: 'linear-gradient(90deg, #2563EB, #10B981, #F59E0B)'}} />
        <div style={{marginTop: 56, display: 'grid', gap: 24, fontSize: 46, fontWeight: 900}}>
          {facts.map((f, i) => (
            <span key={f} style={{opacity: enterAt(local, 34 + i * 8, 20)}}>{f}</span>
          ))}
        </div>
        <div style={{marginTop: 64, fontSize: 26, color: MUTED, fontWeight: 700}}>数据：《财富》2025 年世界500强（按 2024 财年收入排名）</div>
      </div>
    </SceneShell>
  );
};

export const Top500: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = (frame / DURATION_IN_FRAMES) * 100;
  return (
    <AbsoluteFill style={{backgroundColor: '#F8FAFC', fontFamily, color: INK}}>
      <BgGrid />
      <IntroScene frame={frame} />
      <TopbarsScene frame={frame} />
      <CountryScene frame={frame} />
      <IndustryScene frame={frame} />
      <ProfitScene frame={frame} />
      <OutroScene frame={frame} />
      <div style={{position: 'absolute', left: 64, right: 64, bottom: 48, height: 7, background: 'rgba(15,23,42,.12)'}}>
        <div style={{height: '100%', background: INK, width: `${progress}%`}} />
      </div>
    </AbsoluteFill>
  );
};

