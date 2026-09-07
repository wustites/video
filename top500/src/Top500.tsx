import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  COMPANIES,
  COUNTRY_COUNTS,
  COUNTRY_TOTAL,
  DOT_COUNT,
  DURATION_IN_FRAMES,
  INDUSTRY_MIX,
  MAX_COUNTRY,
  MAX_INDUSTRY,
  MAX_REVENUE,
  PROFIT_LEADERS,
  SCENES,
  formatProfit,
  formatRevenue,
} from './data';
import {fontFamily} from './fonts';

const INK = '#0F172A';
const MUTED = '#64748B';

/** GSAP clamp((frame - start) / 18) + clamp((end - frame) / 18), min of both. */
function sceneOpacity(frame: number, start: number, end: number): number {
  return interpolate(frame, [start, start + 18, end - 18, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

/** GSAP clamp((frame - start) / duration): staggered per-item entrances. */
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
      // INTEGRATION SMOKE-TEST: mask-image must render in headless Chromium.
      // If it silently fails, fall back to a plain grid with no mask.
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
      fontSize: 28,
      fontWeight: 800,
      alignSelf: 'flex-start',
    }}
  >
    <span style={{width: 10, height: 10, borderRadius: 20, background: '#10B981'}} />
    {children}
  </div>
);

const SceneShell: React.FC<{
  frame: number;
  start: number;
  end: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({frame, start, end, children, style}) => {
  const opacity = sceneOpacity(frame, start, end);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '72px 64px 112px',
        display: 'flex',
        flexDirection: 'column',
        opacity,
        visibility: opacity > 0 ? 'visible' : 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------------- Scene 1: intro (0–150) ---------------- */
const IntroScene: React.FC<{frame: number}> = ({frame}) => {
  const enter = enterAt(frame, 0, 36);
  return (
    <SceneShell frame={frame} start={SCENES[0].start} end={SCENES[0].end} style={{paddingTop: 82}}>
      <Kicker>2025 财富世界500强</Kicker>
      <div style={{marginTop: 146, opacity: enter, transform: `translateY(${(1 - enter) * 76}px)`}}>
        <div style={{fontSize: 116, lineHeight: 1.02, fontWeight: 950}}>
          谁在驱动全球
          <br />
          <span style={{color: '#2563EB'}}>41.7 万亿美元</span>
        </div>
        <div style={{marginTop: 42, width: 820, fontSize: 40, lineHeight: 1.48, color: MUTED, fontWeight: 700}}>
          从收入冠军到国家版图，快速看懂世界最大企业的权力结构。
        </div>
      </div>
      <div style={{marginTop: 'auto', display: 'grid', gap: 24}}>
        {[
          {label: '总收入', value: '$41.7万亿', accent: '#2563EB'},
          {label: '覆盖员工', value: '约7,000万', accent: '#10B981'},
          {label: '女性CEO', value: '32位', accent: '#EC4899'},
        ].map((m) => (
          <div
            key={m.label}
            style={{
              borderTop: `8px solid ${m.accent}`,
              padding: '24px 28px',
              background: 'rgba(255,255,255,.82)',
              boxShadow: '0 22px 70px rgba(15,23,42,.10)',
            }}
          >
            <div style={{fontSize: 28, color: MUTED, fontWeight: 800}}>{m.label}</div>
            <div style={{fontSize: 60, fontWeight: 950, marginTop: 8}}>{m.value}</div>
          </div>
        ))}
      </div>
    </SceneShell>
  );
};

/* ---------------- Scene 2: revenue Top 10 bars (120–330) ---------------- */
const TopbarsScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 130;
  return (
    <SceneShell frame={frame} start={SCENES[1].start} end={SCENES[1].end}>
      <Kicker>收入排行 Top 10</Kicker>
      <div style={{fontSize: 72, lineHeight: 1.08, fontWeight: 950, marginTop: 30}}>
        沃尔玛继续领跑，
        <br />
        科技与能源贴身追赶
      </div>
      <div style={{fontSize: 24, color: MUTED, fontWeight: 800, marginTop: 18}}>单位：百万美元</div>
      <div style={{marginTop: 52, display: 'grid', gap: 20}}>
        {COMPANIES.map((item, i) => {
          const enter = enterAt(local, i * 4, 30);
          return (
            <div
              key={item.rank}
              style={{
                display: 'grid',
                gridTemplateColumns: '62px 1fr 132px',
                gap: 18,
                alignItems: 'center',
                opacity: enter,
                transform: `translateX(${(1 - enter) * -60}px)`,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  display: 'grid',
                  placeItems: 'center',
                  color: INK,
                  fontSize: 27,
                  fontWeight: 950,
                  background: '#E2E8F0',
                  borderLeft: `8px solid ${item.color}`,
                }}
              >
                {item.rank}
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: 20}}>
                  <div style={{fontSize: 31, fontWeight: 950}}>{item.nameZh}</div>
                  <div style={{fontSize: 26, color: MUTED, fontWeight: 850}}>{item.country}</div>
                </div>
                <div style={{height: 35, background: 'rgba(15,23,42,.08)', marginTop: 9, overflow: 'hidden'}}>
                  <div
                    style={{
                      height: '100%',
                      width: `${enter * (item.revenue / MAX_REVENUE) * 100}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}B8)`,
                    }}
                  />
                </div>
              </div>
              <div style={{fontSize: 28, fontWeight: 950, textAlign: 'right'}}>{formatRevenue(item.revenue)}</div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ---------------- Scene 3: country distribution (300–500) ---------------- */
const CountryScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 290;
  return (
    <SceneShell frame={frame} start={SCENES[2].start} end={SCENES[2].end} style={{paddingTop: 58}}>
      <Kicker>国家与地区分布</Kicker>
      <div style={{fontSize: 72, lineHeight: 1.08, fontWeight: 950, marginTop: 30}}>
        美国 138 家，
        <br />
        中国 130 家。
      </div>
      <div style={{fontSize: 28, lineHeight: 1.42, color: MUTED, marginTop: 22}}>
        两个最大经济体合计占据榜单过半席位，收入结构也开始呈现更分散的多极格局。
      </div>
      <div style={{height: 68, display: 'flex', overflow: 'hidden', marginTop: 38}}>
        {COUNTRY_COUNTS.map((item, i) => {
          const enter = enterAt(local, i * 8, 30);
          return (
            <div
              key={item.country}
              style={{width: `${enter * (item.count / COUNTRY_TOTAL) * 100}%`, background: item.color, height: '100%'}}
            />
          );
        })}
      </div>
      <div style={{display: 'grid', gap: 22, marginTop: 44}}>
        {COUNTRY_COUNTS.map((item, i) => {
          const enter = enterAt(local, i * 8, 30);
          return (
            <div key={item.country} style={{opacity: enter, transform: `translateY(${(1 - enter) * 36}px)`}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{fontSize: 32, fontWeight: 950}}>{item.country}</div>
                <div style={{fontSize: 36, fontWeight: 950}}>{Math.round(item.count * enter)}</div>
              </div>
              <div style={{height: 30, background: 'rgba(15,23,42,.08)', marginTop: 10}}>
                <div
                  style={{
                    height: '100%',
                    width: `${enter * (item.count / MAX_COUNTRY) * 100}%`,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ---------------- Scene 4: industry mix (470–650) ---------------- */
const IndustryScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 470;
  return (
    <SceneShell frame={frame} start={SCENES[3].start} end={SCENES[3].end}>
      <Kicker>行业结构</Kicker>
      <div style={{fontSize: 70, lineHeight: 1.12, fontWeight: 950, marginTop: 34}}>
        资本密集型产业仍是底盘，科技贡献最高利润弹性
      </div>
      <div style={{marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 10}}>
        {Array.from({length: DOT_COUNT}).map((_, d) => {
          const enter = enterAt(local, d * 0.6, 30);
          const bucket = INDUSTRY_MIX[d % INDUSTRY_MIX.length];
          return (
            <div
              key={d}
              style={{
                aspectRatio: '1/1',
                background: bucket.color,
                opacity: 0.18 + enter * 0.72,
                transform: `scale(${0.28 + enter * 0.72})`,
              }}
            />
          );
        })}
      </div>
      <div style={{display: 'grid', gap: 18, marginTop: 36}}>
        {INDUSTRY_MIX.map((item, i) => {
          const enter = enterAt(local, i * 9, 30);
          return (
            <div key={item.name} style={{opacity: enter, transform: `translateY(${(1 - enter) * 36}px)`}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{fontSize: 30, fontWeight: 950}}>{item.name}</div>
                <div style={{fontSize: 23, color: MUTED, fontWeight: 850}}>{item.label}</div>
              </div>
              <div style={{height: 24, background: 'rgba(15,23,42,.08)', marginTop: 8, overflow: 'hidden'}}>
                <div
                  style={{
                    height: '100%',
                    width: `${enter * (item.value / MAX_INDUSTRY) * 100}%`,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ---------------- Scene 5: profit leaders (620–780) ---------------- */
const ProfitScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 640;
  return (
    <SceneShell frame={frame} start={SCENES[4].start} end={SCENES[4].end}>
      <Kicker>利润视角</Kicker>
      <div style={{fontSize: 82, lineHeight: 1.08, fontWeight: 950, marginTop: 42}}>
        收入第一，
        <br />
        不一定利润第一。
      </div>
      <div style={{fontSize: 32, lineHeight: 1.48, color: MUTED, marginTop: 32}}>
        资源、硬件生态、资本配置与平台规模，构成了完全不同的盈利模型。
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginTop: 66}}>
        {PROFIT_LEADERS.map((item, i) => {
          const enter = enterAt(local, i * 12, 30);
          return (
            <div
              key={item.nameEn}
              style={{
                minHeight: 255,
                padding: 24,
                background: 'rgba(255,255,255,.84)',
                boxShadow: '0 20px 64px rgba(15,23,42,.10)',
                borderTop: `8px solid ${item.color}`,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 44}px)`,
              }}
            >
              <div style={{fontSize: 28, color: MUTED, fontWeight: 850}}>#{i + 1} 利润</div>
              <div style={{fontSize: 40, fontWeight: 950, marginTop: 22}}>{item.nameZh}</div>
              <div style={{fontSize: 48, fontWeight: 950, marginTop: 30}}>{formatProfit(item.profit)}</div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ---------------- Scene 6: outro (748–870) ---------------- */
const OutroScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 760;
  const reveal = enterAt(local, 0, 24);
  const lineW = interpolate(local, [12, 34], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <SceneShell frame={frame} start={SCENES[5].start} end={SCENES[5].end} style={{paddingTop: 82}}>
      <div style={{marginTop: 130, opacity: reveal, transform: `translateY(${(1 - reveal) * 54}px)`}}>
        <Kicker>可视化结论</Kicker>
        <div style={{fontSize: 90, lineHeight: 1.1, fontWeight: 950, marginTop: 58}}>
          世界500强，
          <br />
          是全球供应链、
          <br />
          能源、金融与科技的年度体检。
        </div>
        <div
          style={{
            height: 12,
            marginTop: 58,
            width: `${lineW}%`,
            background: 'linear-gradient(90deg, #2563EB, #10B981, #F59E0B)',
          }}
        />
        <div
          style={{
            marginTop: 58,
            display: 'grid',
            gap: 20,
            fontSize: 38,
            color: MUTED,
            fontWeight: 850,
          }}
        >
          <span>500 家公司</span>
          <span>291 家国有企业</span>
          <span>41.7 万亿美元收入</span>
        </div>
      </div>
    </SceneShell>
  );
};

export const Top500: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = (frame / DURATION_IN_FRAMES) * 100;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F8FAFC',
        fontFamily,
        color: INK,
      }}
    >
      <BgGrid />
      <IntroScene frame={frame} />
      <TopbarsScene frame={frame} />
      <CountryScene frame={frame} />
      <IndustryScene frame={frame} />
      <ProfitScene frame={frame} />
      <OutroScene frame={frame} />
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 48,
          height: 7,
          background: 'rgba(15,23,42,.12)',
        }}
      >
        <div style={{height: '100%', background: INK, width: `${progress}%`}} />
      </div>
    </AbsoluteFill>
  );
};
