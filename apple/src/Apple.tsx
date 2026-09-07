import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CHIPS, FPS, LINEUP, SCENES, SPECS, TOTAL_FRAMES, VOICEOVER_SRC} from './data';

const FONT = '"Noto Sans SC", sans-serif';

/* ---------- 入场工具：把 GSAP tl.from/at/duration 翻译为 frame-indexed 进度 ---------- */

/** easeAt：绝对秒 at、时长 dur → power3.out 缓动的 0–1 进度 */
function easeAt(t: number, at: number, dur: number): number {
  const p = interpolate(t, [at, at + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Easing.out(Easing.cubic)(p);
}

const rise = (
  t: number,
  at: number,
  dur: number,
  dy: number,
): {opacity: number; transform: string} => {
  const e = easeAt(t, at, dur);
  return {opacity: e, transform: `translateY(${(1 - e) * dy}px)`};
};

const scaleIn = (
  t: number,
  at: number,
  dur: number,
  from: number,
): {opacity: number; transform: string} => {
  const e = easeAt(t, at, dur);
  return {opacity: e, transform: `scale(${from + (1 - from) * e})`};
};

/* ---------- 场景外壳：0.4s 淡入 / 尾 0.5s 淡出，透明度为 0 时不渲染 ---------- */

const SceneShell: React.FC<{durationSec: number; children: React.ReactNode}> = ({
  durationSec,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const fadeOutStart = Math.max(0.4, durationSec - 0.5);
  const opacity = interpolate(
    t,
    [0, 0.4, fadeOutStart, durationSec],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 90px',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: 6,
      color: '#86868b',
      textTransform: 'uppercase',
      marginBottom: 44,
    }}
  >
    {children}
  </div>
);

const HeroSub: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT,
      marginTop: 40,
      fontSize: 42,
      fontWeight: 600,
      color: '#86868b',
      lineHeight: 1.5,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- 静态 Apple 剪影 logo（index.html 内联 SVG 转 JSX） ---------- */

const AppleMark: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <svg viewBox="0 0 200 250" aria-hidden="true" style={style}>
    <path
      d="M100 56 C 100 36, 108 22, 122 13"
      stroke="currentColor"
      strokeWidth={7}
      fill="none"
      strokeLinecap="round"
    />
    <path d="M125 11 C 140 3, 162 6, 169 17 C 154 28, 134 25, 125 11 Z" fill="currentColor" />
    <path
      d="M100 96
         C 86 78, 66 74, 53 84
         C 39 96, 33 118, 41 140
         C 51 166, 73 190, 92 199
         C 96 201, 104 201, 108 199
         C 127 190, 149 166, 159 140
         C 167 118, 161 96, 147 84
         C 134 74, 114 78, 100 96 Z"
      fill="currentColor"
    />
  </svg>
);

/* ---------- 场景 1：开场（旁白句子 1–2） ---------- */

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const apple = scaleIn(t, 0.2, 1.1, 0.6);
  const logo = rise(t, 1.6, 0.7, 40);
  const tagline = rise(t, 2.3, 0.6, 20);
  return (
    <SceneShell durationSec={5.0}>
      <AppleMark
        style={{
          width: 420,
          height: 500,
          color: '#f5f5f7',
          filter: 'drop-shadow(0 0 90px rgba(255,255,255,0.18))',
          ...apple,
        }}
      />
      <div
        style={{
          fontFamily: FONT,
          marginTop: 60,
          fontSize: 88,
          fontWeight: 800,
          letterSpacing: -3,
          color: '#f5f5f7',
          ...logo,
        }}
      >
        apple
      </div>
      <div
        style={{
          fontFamily: FONT,
          marginTop: 26,
          fontSize: 34,
          fontWeight: 600,
          color: '#86868b',
          ...tagline,
        }}
      >
        全新一代 正式发布
      </div>
    </SceneShell>
  );
};

/* ---------- 场景 2：揭幕（旁白句子 3） ---------- */

const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const kicker = rise(t, 0.2, 0.5, -20);
  const name = scaleIn(t, 0.6, 0.9, 1.35);
  const sub = rise(t, 1.9, 0.6, 30);
  return (
    <SceneShell durationSec={4.1}>
      <div style={kicker}>
        <Kicker>Now Introducing</Kicker>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 156,
          fontWeight: 900,
          letterSpacing: -4,
          lineHeight: 1.04,
          background: 'linear-gradient(90deg, #fa5541, #f5a623, #7cc144, #34c4a3, #2aa9e0, #8a6cf5)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          ...name,
        }}
      >
        apple
      </div>
      <div style={sub}>
        <HeroSub>苹果,重新定义。</HeroSub>
      </div>
    </SceneShell>
  );
};

/* ---------- 场景 3：设计（旁白句子 4–5） ---------- */

const Design: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const kicker = rise(t, 0.2, 0.5, -20);
  const hero = rise(t, 0.6, 0.8, 50);
  const sub = rise(t, 3.6, 0.6, 30);
  return (
    <SceneShell durationSec={6.6}>
      <div style={kicker}>
        <Kicker>设计</Kicker>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 128,
          fontWeight: 900,
          lineHeight: 1.04,
          letterSpacing: -2,
          background: 'linear-gradient(180deg, #ffffff 0%, #a1a1a6 120%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          ...hero,
        }}
      >
        恰到好处的
        <br />
        大小
      </div>
      <div style={{display: 'flex', gap: 36, marginTop: 90, alignItems: 'stretch'}}>
        {SPECS.map((s, i) => {
          const e = rise(t, 1.4 + i * 0.14, 0.7, 60);
          return (
            <div
              key={s.label}
              style={{
                width: 272,
                padding: '52px 30px',
                background: '#161617',
                borderRadius: 40,
                border: '1px solid #26262a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                ...e,
              }}
            >
              <div style={{fontFamily: FONT, fontSize: 84, fontWeight: 900, letterSpacing: -2}}>
                {s.num}
                <span style={{fontSize: 40, fontWeight: 700, color: '#d2d2d7'}}>{s.unit}</span>
              </div>
              <div
                style={{fontFamily: FONT, fontSize: 28, fontWeight: 600, color: '#86868b', marginTop: 18}}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={sub}>
        <HeroSub>圆润一体成型,手感无可挑剔。</HeroSub>
      </div>
    </SceneShell>
  );
};

/* ---------- 场景 4：芯片（旁白句子 6–9） ---------- */

const Chip: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const badge = rise(t, 0.3, 0.5, -24);
  const sub = rise(t, 8.4, 0.6, 30);
  return (
    <SceneShell durationSec={11.1}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 8,
          color: '#f5f5f7',
          border: '2px solid #3a3a3e',
          borderRadius: 999,
          padding: '22px 48px',
          marginBottom: 56,
          ...badge,
        }}
      >
        A1 仿生芯片
      </div>
      <div style={{display: 'flex', gap: 36}}>
        {CHIPS.map((c, i) => {
          const e = rise(t, 1.0 + i * 0.15, 0.7, 60);
          return (
            <div
              key={c.name}
              style={{
                width: 286,
                padding: '56px 30px',
                background: 'linear-gradient(180deg, #1d1d20 0%, #101012 100%)',
                border: '1px solid #2c2c30',
                borderRadius: 40,
                boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                ...e,
              }}
            >
              <div style={{fontFamily: FONT, fontSize: 88, fontWeight: 900, letterSpacing: -2}}>
                {c.value}
                <span style={{fontSize: 44, fontWeight: 700}}>{c.unit}</span>
              </div>
              <div
                style={{fontFamily: FONT, fontSize: 30, fontWeight: 700, color: '#d2d2d7', marginTop: 20}}
              >
                {c.name}
              </div>
              <div
                style={{fontFamily: FONT, fontSize: 26, fontWeight: 600, color: '#86868b', marginTop: 8}}
              >
                {c.sub}
              </div>
            </div>
          );
        })}
      </div>
      <div style={sub}>
        <HeroSub>轻薄,却满载能量。</HeroSub>
      </div>
    </SceneShell>
  );
};

/* ---------- 场景 5：市场（旁白句子 10–12） ---------- */

const Market: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const kicker = rise(t, 0.4, 0.5, -20);
  const m1 = rise(t, 0.8, 0.8, 50);
  const m2 = rise(t, 3.1, 0.6, 40);
  const caption = easeAt(t, 3.7, 0.5);
  const m3 = rise(t, 5.5, 0.6, 30);
  // #market-bar-fill width tween：0% → 51%（中国份额）
  const barWidth = interpolate(t, [3.5, 5.1], [0, 51], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <SceneShell durationSec={9.2}>
      <div style={kicker}>
        <Kicker>全球市场</Kicker>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 170,
          fontWeight: 900,
          letterSpacing: -4,
          lineHeight: 1.02,
          ...m1,
        }}
      >
        9,730<span style={{fontSize: 64}}> 万吨</span>
      </div>
      <div
        style={{
          fontFamily: FONT,
          marginTop: 56,
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.5,
          ...m2,
        }}
      >
        中国,独占<span style={{color: '#f5a623'}}> 51%</span>
      </div>
      <div
        style={{
          marginTop: 64,
          width: 720,
          height: 18,
          borderRadius: 999,
          background: '#1d1d1f',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, #f5a623, #fa5541)',
            borderRadius: 999,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT,
          marginTop: 26,
          fontSize: 26,
          fontWeight: 600,
          color: '#6e6e73',
          opacity: caption,
        }}
      >
        2023 年全球苹果产量(FAOSTAT)
      </div>
      <div
        style={{
          fontFamily: FONT,
          marginTop: 48,
          fontSize: 36,
          fontWeight: 600,
          color: '#86868b',
          ...m3,
        }}
      >
        世界上销量第一的水果,没有之一。
      </div>
    </SceneShell>
  );
};

/* ---------- 场景 6：系列（旁白句子 13–15） ---------- */

const Lineup: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const kicker = rise(t, 0.2, 0.5, -20);
  const hero = rise(t, 0.4, 0.7, 50);
  return (
    <SceneShell durationSec={8.3}>
      <div style={kicker}>
        <Kicker>三种型号</Kicker>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 104,
          fontWeight: 900,
          lineHeight: 1.2,
          letterSpacing: -1,
          ...hero,
        }}
      >
        总有一款
        <br />
        适合你
      </div>
      <div style={{display: 'flex', gap: 40, marginTop: 88}}>
        {LINEUP.map((m, i) => {
          const e = rise(t, 1.4 + i * 0.16, 0.7, 70);
          return (
            <div
              key={m.name}
              style={{
                width: 290,
                padding: '60px 28px 54px',
                background: '#161617',
                borderRadius: 44,
                border: '1px solid #26262a',
                ...e,
              }}
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  margin: '0 auto 34px',
                  background: m.dot,
                  boxShadow:
                    'inset -18px -22px 44px rgba(0,0,0,0.35), inset 8px 10px 24px rgba(255,255,255,0.28)',
                }}
              />
              <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 900, letterSpacing: -1}}>
                {m.name}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 30,
                  fontWeight: 700,
                  marginTop: 10,
                  background:
                    'linear-gradient(90deg, #fa5541, #f5a623, #7cc144, #34c4a3, #2aa9e0, #8a6cf5)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                {m.tag}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 26,
                  fontWeight: 600,
                  color: '#86868b',
                  marginTop: 26,
                  lineHeight: 1.5,
                }}
              >
                {m.desc[0]}
                <br />
                {m.desc[1]}
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ---------- 场景 7：起源（旁白句子 16–17） ---------- */

const Origin: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const kicker = rise(t, 0.4, 0.5, -20);
  const title = rise(t, 0.6, 0.8, 50);
  const sub = rise(t, 2.0, 0.7, 40);
  // back.out(1.6) 回弹 → spring 替代
  const quoteScale = spring({
    frame: frame - 3.4 * fps,
    fps,
    config: {damping: 12, stiffness: 120, mass: 1},
  });
  const quoteOpacity = interpolate(t, [3.4, 4.1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <SceneShell durationSec={6.0}>
      <div style={kicker}>
        <Kicker>Origin Story</Kicker>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 88,
          fontWeight: 900,
          lineHeight: 1.2,
          letterSpacing: -2,
          ...title,
        }}
      >
        来自天山脚下
      </div>
      <div
        style={{
          fontFamily: FONT,
          marginTop: 46,
          fontSize: 40,
          fontWeight: 600,
          color: '#86868b',
          lineHeight: 1.55,
          ...sub,
        }}
      >
        栽培苹果的祖先,
        <br />
        诞生于中亚的山谷之中。
      </div>
      <div
        style={{
          fontFamily: FONT,
          marginTop: 70,
          fontSize: 34,
          fontWeight: 700,
          color: '#d2d2d7',
          padding: '30px 52px',
          borderRadius: 999,
          border: '1px solid #2c2c30',
          background: '#161617',
          opacity: quoteOpacity,
          transform: `scale(${interpolate(quoteScale, [0, 1], [0.85, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })})`,
        }}
      >
        阿拉木图 · &quot;苹果之城&quot;
      </div>
    </SceneShell>
  );
};

/* ---------- 场景 8：结尾（旁白句子 18–20） ---------- */

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const oneMore = rise(t, 0.2, 0.7, 30);
  const main = rise(t, 1.6, 0.8, 50);
  // #outro-line scaleX tween + #outro-think letterSpacing tween
  const lineScale = interpolate(t, [1.0, 1.9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const thinkOpacity = interpolate(t, [3.9, 4.9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const thinkSpacing = interpolate(t, [3.9, 4.9], [18, 3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <SceneShell durationSec={7.0}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 72,
          fontWeight: 800,
          color: '#86868b',
          letterSpacing: 2,
          ...oneMore,
        }}
      >
        One more thing.
      </div>
      <div
        style={{
          width: 900,
          height: 3,
          margin: '60px 0',
          background: 'linear-gradient(90deg, transparent, #f5a623, #fa5541, #f5a623, transparent)',
          transform: `scaleX(${lineScale})`,
        }}
      />
      <div
        style={{
          fontFamily: FONT,
          fontSize: 92,
          fontWeight: 900,
          lineHeight: 1.25,
          letterSpacing: -2,
          ...main,
        }}
      >
        每天一 apple,
        <br />
        医生远离我。
      </div>
      <div
        style={{
          fontFamily: FONT,
          marginTop: 84,
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: thinkSpacing,
          opacity: thinkOpacity,
        }}
      >
        Think different.
      </div>
    </SceneShell>
  );
};

/* ---------- 成片：8 场景 Sequence + 单条旁白音轨 ---------- */

export const Apple: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000', color: '#f5f5f7', fontFamily: FONT}}>
      {SCENES.map((s) => (
        <Sequence
          key={s.id}
          from={Math.round(s.start * FPS)}
          durationInFrames={Math.max(1, Math.round((s.end - s.start) * FPS))}
          name={s.id}
        >
          {s.id === 'intro' ? (
            <Intro />
          ) : s.id === 'reveal' ? (
            <Reveal />
          ) : s.id === 'design' ? (
            <Design />
          ) : s.id === 'chip' ? (
            <Chip />
          ) : s.id === 'market' ? (
            <Market />
          ) : s.id === 'lineup' ? (
            <Lineup />
          ) : s.id === 'origin' ? (
            <Origin />
          ) : (
            <Outro />
          )}
        </Sequence>
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: 64,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 600,
          color: '#48484d',
        }}
      >
        本视频为创意演示,与 Apple Inc. 无关 | 数据来源:FAOSTAT 2023 / USDA FDC
      </div>
      <Audio src={staticFile(VOICEOVER_SRC)} />
    </AbsoluteFill>
  );
};

export {TOTAL_FRAMES};
