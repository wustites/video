import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  companies,
  countryCounts,
  facts,
  formatProfit,
  formatRevenue,
  industryMix,
} from './data';
const WARM = '#F8FAFC';
const INK = '#0F172A';
const MUTED = '#64748B';
const DURATION = 870;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const sceneOpacity = (frame: number, start: number, end: number) => {
  const fadeIn = interpolate(frame, [start, start + 18], [0, 1], clamp);
  const fadeOut = interpolate(frame, [end - 18, end], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

const number = (value: number, digits = 0) =>
  new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);

const Page: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      background: WARM,
      color: INK,
      fontFamily:
        '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", Arial, sans-serif',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(circle at 26% 14%, rgba(59,130,246,.16), transparent 30%), radial-gradient(circle at 86% 42%, rgba(16,185,129,.13), transparent 34%), linear-gradient(160deg, rgba(15,23,42,.05), transparent 55%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.36,
        backgroundImage:
          'linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage:
          'linear-gradient(to bottom, transparent, black 10%, black 88%, transparent)',
      }}
    />
    {children}
  </AbsoluteFill>
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
    }}
  >
    <span style={{width: 10, height: 10, borderRadius: 20, background: '#10B981'}} />
    {children}
  </div>
);

const Scene: React.FC<{children: React.ReactNode; pad?: number}> = ({
  children,
  pad = 72,
}) => (
  <AbsoluteFill
    style={{
      padding: `${pad}px 64px 112px`,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {children}
  </AbsoluteFill>
);

const Metric: React.FC<{
  label: string;
  value: string;
  accent: string;
  delay?: number;
}> = ({label, value, accent, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 20, stiffness: 120},
  });

  return (
    <div
      style={{
        borderTop: `8px solid ${accent}`,
        padding: '24px 28px',
        background: 'rgba(255,255,255,.82)',
        boxShadow: '0 22px 70px rgba(15,23,42,.10)',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [36, 0])}px)`,
      }}
    >
      <div style={{fontSize: 28, color: MUTED, fontWeight: 800}}>{label}</div>
      <div style={{fontSize: 60, fontWeight: 950, marginTop: 8}}>{value}</div>
    </div>
  );
};

const Intro = () => {
  const frame = useCurrentFrame();
  const title = spring({
    frame,
    fps: 30,
    config: {damping: 22, stiffness: 90},
  });
  const sweep = interpolate(frame, [20, 120], [-36, 120], clamp);

  return (
    <Scene pad={82}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Kicker>2025 财富世界500强</Kicker>
      </div>
      <div
        style={{
          marginTop: 146,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [76, 0])}px)`,
        }}
      >
        <div style={{fontSize: 116, lineHeight: 1.02, fontWeight: 950}}>
          谁在驱动全球
          <br />
          <span style={{color: '#2563EB'}}>41.7 万亿美元</span>
        </div>
        <div
          style={{
            marginTop: 42,
            width: 820,
            fontSize: 40,
            lineHeight: 1.48,
            color: MUTED,
            fontWeight: 700,
          }}
        >
          从收入冠军到国家版图，快速看懂世界最大企业的权力结构。
        </div>
      </div>
      <div style={{marginTop: 'auto', display: 'grid', gap: 24}}>
        <Metric label="总收入" value={`${facts.totalRevenue}万亿$`} accent="#2563EB" />
        <Metric
          label="覆盖员工"
          value={`${facts.totalEmployees}百万`}
          accent="#10B981"
          delay={8}
        />
        <Metric label="女性CEO" value={`${facts.femaleCeo}位`} accent="#EC4899" delay={16} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${sweep}%`,
          top: 0,
          bottom: 0,
          width: 210,
          transform: 'skewX(-12deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,.78), transparent)',
        }}
      />
    </Scene>
  );
};

const TopBars = () => {
  const frame = useCurrentFrame();
  const local = frame - 130;
  const max = companies[0].revenue;

  return (
    <Scene>
      <Kicker>收入排行 Top 10</Kicker>
      <div style={{fontSize: 72, lineHeight: 1.08, fontWeight: 950, marginTop: 30}}>
        沃尔玛继续领跑，
        <br />
        科技与能源贴身追赶
      </div>
      <div style={{fontSize: 24, color: MUTED, fontWeight: 800, marginTop: 18}}>
        单位：百万美元
      </div>
      <div style={{marginTop: 52, display: 'grid', gap: 20}}>
        {companies.map((item, index) => {
          const enter = spring({
            frame: local - index * 4,
            fps: 30,
            config: {damping: 22, stiffness: 120},
          });
          const width = interpolate(enter, [0, 1], [0, item.revenue / max], clamp);
          const rankPulse = interpolate(
            local,
            [index * 5, index * 5 + 20, 140],
            [0.84, 1.08, 1],
            clamp,
          );

          return (
            <div
              key={item.nameEn}
              style={{
                display: 'grid',
                gridTemplateColumns: '62px 1fr 132px',
                gap: 18,
                alignItems: 'center',
                opacity: enter,
                transform: `translateX(${interpolate(enter, [0, 1], [-60, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  display: 'grid',
                  placeItems: 'center',
                  background: item.color,
                  color: 'white',
                  fontSize: 27,
                  fontWeight: 950,
                  transform: `scale(${rankPulse})`,
                }}
              >
                {item.rank}
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: 20}}>
                  <div style={{fontSize: 31, fontWeight: 950}}>{item.nameZh}</div>
                  <div style={{fontSize: 26, color: MUTED, fontWeight: 850}}>
                    {item.country}
                  </div>
                </div>
                <div
                  style={{
                    height: 35,
                    background: 'rgba(15,23,42,.08)',
                    marginTop: 9,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${width * 100}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}B8)`,
                    }}
                  />
                </div>
              </div>
              <div style={{fontSize: 28, fontWeight: 950, textAlign: 'right'}}>
                {formatRevenue(item.revenue)}
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const CountryMap = () => {
  const frame = useCurrentFrame();
  const local = frame - 290;
  const total = countryCounts.reduce((sum, item) => sum + item.count, 0);
  const maxCountryCount = Math.max(...countryCounts.map((item) => item.count));

  return (
    <Scene pad={58}>
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
        {countryCounts.map((item, index) => {
          const progress = spring({
            frame: local - index * 8,
            fps: 30,
            config: {damping: 21, stiffness: 100},
          });
          return (
            <div
              key={item.country}
              style={{
                width: `${(item.count / total) * 100 * progress}%`,
                background: item.color,
                height: '100%',
              }}
            />
          );
        })}
      </div>
      <div style={{display: 'grid', gap: 22, marginTop: 44}}>
        {countryCounts.map((item, index) => {
          const enter = spring({
            frame: local - index * 9,
            fps: 30,
            config: {damping: 20, stiffness: 110},
          });
          return (
            <div
              key={item.country}
              style={{
                opacity: enter,
                transform: `translateY(${interpolate(enter, [0, 1], [36, 0])}px)`,
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{fontSize: 32, fontWeight: 950}}>{item.country}</div>
                <div style={{fontSize: 36, fontWeight: 950}}>
                  {number(Math.round(item.count * enter))}
                </div>
              </div>
              <div style={{height: 30, background: 'rgba(15,23,42,.08)', marginTop: 10}}>
                <div
                  style={{
                    width: `${(item.count / maxCountryCount) * 100 * enter}%`,
                    height: '100%',
                    background: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const IndustryScene = () => {
  const frame = useCurrentFrame();
  const local = frame - 470;
  const max = Math.max(...industryMix.map((item) => item.value));
  const dots = Array.from({length: 70}, (_, index) => index);

  return (
    <Scene>
      <Kicker>行业结构</Kicker>
      <div style={{fontSize: 70, lineHeight: 1.12, fontWeight: 950, marginTop: 34}}>
        资本密集型产业仍是底盘，科技贡献最高利润弹性
      </div>
      <div
        style={{
          marginTop: 62,
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: 13,
        }}
      >
        {dots.map((dot) => {
          const bucket = industryMix[dot % industryMix.length];
          const enter = spring({
            frame: local - dot * 0.6,
            fps: 30,
            config: {damping: 19, stiffness: 90},
          });
          return (
            <div
              key={dot}
              style={{
                aspectRatio: '1 / 1',
                background: bucket.color,
                opacity: 0.18 + enter * 0.72,
                transform: `scale(${interpolate(enter, [0, 1], [0.28, 1])})`,
              }}
            />
          );
        })}
      </div>
      <div style={{display: 'grid', gap: 30, marginTop: 72}}>
        {industryMix.map((item, index) => {
          const enter = spring({
            frame: local - index * 9,
            fps: 30,
            config: {damping: 20, stiffness: 120},
          });
          const bar = interpolate(enter, [0, 1], [0, item.value / max], clamp);
          return (
            <div key={item.name}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{fontSize: 36, fontWeight: 950}}>{item.name}</div>
                <div style={{fontSize: 27, color: MUTED, fontWeight: 850}}>
                  {item.label}
                </div>
              </div>
              <div
                style={{
                  height: 34,
                  background: 'rgba(15,23,42,.08)',
                  marginTop: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{width: `${bar * 100}%`, height: '100%', background: item.color}} />
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const ProfitScene = () => {
  const frame = useCurrentFrame();
  const local = frame - 640;
  const leaders = [...companies].sort((a, b) => b.profit - a.profit).slice(0, 4);

  return (
    <Scene>
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
        {leaders.map((item, index) => {
          const enter = spring({
            frame: local - index * 12,
            fps: 30,
            config: {damping: 18, stiffness: 110},
          });
          return (
            <div
              key={item.nameEn}
              style={{
                minHeight: 255,
                padding: 24,
                background: 'rgba(255,255,255,.84)',
                borderTop: `8px solid ${item.color}`,
                boxShadow: '0 20px 64px rgba(15,23,42,.10)',
                opacity: enter,
                transform: `translateY(${interpolate(enter, [0, 1], [44, 0])}px)`,
              }}
            >
              <div style={{fontSize: 28, color: MUTED, fontWeight: 850}}>
                #{index + 1} 利润
              </div>
              <div style={{fontSize: 40, fontWeight: 950, marginTop: 22}}>
                {item.nameZh}
              </div>
              <div style={{fontSize: 48, fontWeight: 950, marginTop: 30}}>
                {formatProfit(item.profit)}
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const local = frame - 760;
  const reveal = interpolate(local, [0, 24], [0, 1], clamp);
  const line = interpolate(local, [12, 34], [0, 100], clamp);

  return (
    <Scene pad={82}>
      <div
        style={{
          marginTop: 130,
          opacity: reveal,
          transform: `translateY(${interpolate(reveal, [0, 1], [54, 0])}px)`,
        }}
      >
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
            width: `${line}%`,
            height: 12,
            background: 'linear-gradient(90deg, #2563EB, #10B981, #F59E0B)',
            marginTop: 58,
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
          <span>{facts.stateOwned} 家国有企业</span>
          <span>41.7 万亿美元收入</span>
        </div>
      </div>
    </Scene>
  );
};

const Timeline = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, DURATION], [0, 1], clamp);
  const tick = interpolate(frame, [0, DURATION], [0, 1740], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });

  return (
    <>
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
        <div style={{height: '100%', width: `${progress * 100}%`, background: INK}} />
      </div>
      {/*
      <div
        style={{
          position: 'absolute',
          right: 64,
          bottom: 70,
          color: MUTED,
          fontWeight: 850,
          fontSize: 22,
        }}
      >
        GLOBAL 500 / {number(Math.round(tick))}
      </div>
      */}
    </>
  );
};

type Top500VideoProps = {
  audioUrl?: string;
  cachedAudioPath?: string;
  audioStartFromSeconds?: number;
};

export const Top500Video: React.FC<Top500VideoProps> = ({
  cachedAudioPath = 'audio/network-audio.mp3',
  audioStartFromSeconds = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const audioStartFromFrames = Math.round(audioStartFromSeconds * fps);
  const scene = [
    {start: 0, end: 150, component: <Intro />},
    {start: 120, end: 330, component: <TopBars />},
    {start: 300, end: 500, component: <CountryMap />},
    {start: 470, end: 650, component: <IndustryScene />},
    {start: 620, end: 780, component: <ProfitScene />},
    {start: 748, end: DURATION, component: <Outro />},
  ];

  return (
    <Page>
      <Audio src={staticFile(cachedAudioPath)} startFrom={audioStartFromFrames} volume={0.28} />
      {scene.map((item) => (
        <AbsoluteFill key={item.start} style={{opacity: sceneOpacity(frame, item.start, item.end)}}>
          {item.component}
        </AbsoluteFill>
      ))}
      <Timeline />
    </Page>
  );
};
