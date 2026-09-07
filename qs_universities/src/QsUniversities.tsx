import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PAGES, PAGE_COLORS, type University} from './data';

export const FPS = 30;
export const TOTAL_SECONDS = 52;
export const DURATION_IN_FRAMES = Math.round(TOTAL_SECONDS * FPS); // 1560

const PAGE_LEN = 150; // 5s per page; last page absorbs the 2s tail
const FADE_FRAMES = Math.round(0.6 * FPS); // GSAP FADE 0.6s
const ITEM_OFFSET = Math.round(0.15 * FPS); // GSAP "<0.15" position
const STAGGER_FRAMES = 0.12 * FPS; // GSAP stagger 0.12s → per-index delay

const FONT = '"Noto Sans SC", "Segoe UI", Arial, sans-serif';

const UniversityRow: React.FC<{
  uni: University;
  accent: string;
  pageStart: number;
  index: number;
}> = ({uni, accent, pageStart, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - pageStart - ITEM_OFFSET - index * STAGGER_FRAMES;
  const raw = t <= 0 ? 0 : spring({frame: t, fps, config: {damping: 200}});
  const progress = Math.min(1, Math.max(0, raw));
  const isTop10 = uni.rank <= 10;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 28px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: progress,
        transform: `translateX(${(1 - progress) * 80}px)`,
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: isTop10 ? '#ffd700' : accent,
          minWidth: 75,
          textAlign: 'center',
          marginRight: 24,
          fontFamily: FONT,
          textShadow: isTop10 ? '0 2px 15px rgba(255, 215, 0, 0.4)' : undefined,
        }}
      >
        {uni.rank}
      </div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 28, color: '#fff', fontWeight: 700, marginBottom: 6, letterSpacing: 1}}>
          {uni.name}
        </div>
        <div style={{color: '#cbd5e1', fontSize: 17}}>{uni.nameEn}</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          marginLeft: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 16,
          }}
        >
          <span
            style={{width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block'}}
          />
          {uni.country}
        </div>
        <div style={{color: accent, fontWeight: 700, fontSize: 26, fontFamily: FONT}}>
          {String(uni.score)}
        </div>
      </div>
    </div>
  );
};

const Page: React.FC<{pageIndex: number}> = ({pageIndex}) => {
  const frame = useCurrentFrame();
  const start = pageIndex * PAGE_LEN;
  const nextStart = (pageIndex + 1) * PAGE_LEN;
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const fadeIn = interpolate(frame - start, [0, FADE_FRAMES], [0, 1], opts);
  const fadeOut =
    pageIndex < PAGES.length - 1 ? interpolate(frame - nextStart, [0, FADE_FRAMES], [1, 0], opts) : 1;
  const opacity = fadeIn * fadeOut;
  if (opacity <= 0) {
    return null;
  }
  const {color} = PAGE_COLORS[pageIndex];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        opacity,
        visibility: opacity > 0 ? 'visible' : 'hidden',
      }}
    >
      {PAGES[pageIndex].map((uni, i) => (
        <UniversityRow key={`${uni.rank}-${uni.name}`} uni={uni} accent={color} pageStart={start} index={i} />
      ))}
    </div>
  );
};

export const QsUniversities: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #0a0a1a 0%, #1a1a3e 40%, #0d2137 100%)',
        fontFamily: FONT,
        flexDirection: 'column',
        alignItems: 'center',
        padding: '50px 60px 40px',
      }}
    >
      <div style={{textAlign: 'center', marginBottom: 35, width: '100%'}}>
        <div
          style={{
            color: '#fff',
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: 4,
            textShadow: '0 4px 20px rgba(233, 69, 96, 0.3)',
          }}
        >
          QS<span style={{color: '#e94560'}}>世界大学</span>排名
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 24,
            marginTop: 12,
            letterSpacing: 8,
            textTransform: 'uppercase',
          }}
        >
          2027 Top 100
        </div>
        <div
          style={{
            width: 120,
            height: 3,
            background: 'linear-gradient(90deg, transparent, #e94560, transparent)',
            margin: '20px auto 0',
          }}
        />
      </div>
      <div style={{width: '100%', flex: 1, position: 'relative'}}>
        {PAGES.map((_, p) => (
          <Page key={p} pageIndex={p} />
        ))}
      </div>
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          color: '#aeb8c9',
          fontSize: 18,
          paddingTop: 25,
          letterSpacing: 2,
        }}
      >
        数据来源：QS Quacquarelli Symonds · 2026年6月发布
      </div>
    </AbsoluteFill>
  );
};
