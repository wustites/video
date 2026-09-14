import React from 'react';
import {interpolate, Sequence, useCurrentFrame} from 'remotion';
import {FAN_LINES, MANY_LINES, TRIANGLES, TUBES} from './data';
import {SANS, SERIF} from './fonts';

export const FPS = 30;
export const DURATION_SECONDS = 42;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const BG = '#0d1220';
const INK = '#e7e8d1';
const TEAL = '#58c4a3';
const YELLOW = '#f4d35e';
const RED = '#fc6255';
const MUTED = '#c8cbbd';

/* ---------- easing map (exact GSAP formulas, fed to interpolate) ---------- */
type Easer = (p: number) => number;
const sineInOut: Easer = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
const sineOut: Easer = (p) => Math.sin((p * Math.PI) / 2);
const power1Out: Easer = (p) => 1 - Math.pow(1 - p, 2);
const power2Out: Easer = (p) => 1 - Math.pow(1 - p, 3);
const power3Out: Easer = (p) => 1 - Math.pow(1 - p, 4);
const power4Out: Easer = (p) => 1 - Math.pow(1 - p, 5);
const expoOut: Easer = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const circOut: Easer = (p) => Math.sqrt(1 - Math.pow(p - 1, 2));
const power1InOut: Easer = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const power1In: Easer = (p) => p * p;
const power3In: Easer = (p) => Math.pow(p, 4);
const backOut =
  (c = 1.7): Easer =>
  (p) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);

/** 0..1 progress of absolute time t over [start, start+dur], clamped. */
const prog = (
  t: number,
  start: number,
  dur: number,
  easing: (p: number) => number = (p) => p,
): number =>
  interpolate(t, [start, start + dur], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Per-element stagger progress: element i starts at base + i*stagger. */
const stag = (
  t: number,
  base: number,
  i: number,
  stagger: number,
  dur: number,
  easing: (p: number) => number = (p) => p,
): number => prog(t, base + i * stagger, dur, easing);

/* ---------- crossfade (blur 10px + scale) ---------- */
const XF = 0.65;
const xfOut = (t: number, at: number) => {
  const p = prog(t, at, XF, sineInOut);
  return {
    opacity: 1 - p,
    transform: `scale(${(1 - 0.015 * p).toFixed(4)})`,
    filter: p <= 0 ? undefined : `blur(${(10 * p).toFixed(2)}px)`,
  };
};
const xfIn = (t: number, at: number) => {
  const p = prog(t, at, XF, sineInOut);
  return {
    opacity: p,
    transform: `scale(${(1.015 - 0.015 * p).toFixed(4)})`,
    filter: p >= 1 ? undefined : `blur(${(10 * (1 - p)).toFixed(2)}px)`,
  };
};

/* ---------- shared chrome ---------- */
const Ambient: React.FC<{t: number}> = ({t}) => {
  const opacity = 1 - prog(t, 40.9, 0.8, sineInOut);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
      <div
        style={{
          position: 'absolute',
          inset: '-10%',
          backgroundImage:
            'linear-gradient(rgba(88,196,163,.055) 1px,rgba(88,196,163,0) 1px),linear-gradient(90deg,rgba(88,196,163,.055) 1px,rgba(88,196,163,0) 1px)',
          backgroundSize: '70px 70px',
          transform: `rotate(${-8 + 4 * prog(t, 0.15, 1.3, sineOut)}deg)`,
          opacity: prog(t, 0.15, 1.3, sineOut),
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 720,
          height: 720,
          borderRadius: '50%',
          filter: 'blur(90px)',
          opacity: 0.13 * prog(t, 0.2, 1.6, power1Out),
          background: TEAL,
          left: -300,
          top: -320,
          transform: `scale(${(0.65 + 0.35 * prog(t, 0.2, 1.6, power1Out)).toFixed(3)})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 720,
          height: 720,
          borderRadius: '50%',
          filter: 'blur(90px)',
          opacity: 0.13 * prog(t, 0.3, 1.9, circOut),
          background: YELLOW,
          right: -420,
          bottom: -420,
          transform: `scale(${(0.7 + 0.3 * prog(t, 0.3, 1.9, circOut)).toFixed(3)})`,
        }}
      />
    </div>
  );
};

const Topline: React.FC<{t: number; base: number; no: string; label: string}> = ({
  t,
  base,
  no,
  label,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: '2px solid rgba(88,196,163,.45)',
      paddingBottom: 20,
      fontFamily: SANS,
      fontSize: 24,
      letterSpacing: '0.18em',
      color: TEAL,
      fontWeight: 700,
      opacity: prog(t, base, 0.7, power3Out),
    }}
  >
    <span style={{fontFamily: SERIF, color: YELLOW, fontSize: 32}}>{no}</span>
    <span>{label}</span>
  </div>
);

/* ================= Scene 1 (0 - 8.1s) ================= */
const Scene1: React.FC<{t: number}> = ({t}) => {
  const s1 = [0, 1, 2, 3].map((i) => {
    const p = stag(t, 0.35, i, 0.13, 0.75, power3Out);
    const y0 = [0, 45, 30, 15][i];
    return {
      opacity: p,
      transform: `translate(${(i === 3 ? -25 * (1 - p) : 0).toFixed(1)}px, ${(y0 * (1 - p)).toFixed(1)}px) scale(${(i === 3 ? 0.96 + 0.04 * p : 1).toFixed(3)})`,
    };
  });
  const orbit = [0, 1].map((i) => 1500 * (1 - stag(t, 0.55, i, 0.12, 1.5, sineInOut)));
  const needleSx = prog(t, 0.75, 0.8, expoOut);
  const pivotS = prog(t, 1.05, 0.35, backOut(1.7));
  const angleP = prog(t, 1.25, 0.65, power2Out);
  const labels = [0, 1].map((i) => stag(t, 1.35, i, 0.12, 0.45, circOut));
  const rotor = 325 * prog(t, 1.6, 6.2, sineInOut);
  return (
    <div style={{position: 'absolute', inset: 0, ...xfOut(t, 8.1)}}>
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '88px 120px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <div style={{width: '54%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 28}}>
          <div style={{fontFamily: SANS, fontSize: 24, letterSpacing: '0.18em', color: TEAL, fontWeight: 700, ...s1[0]}}>
            KAKEYA CONJECTURE · 01
          </div>
          <h1 style={{fontFamily: SANS, fontSize: 104, lineHeight: 1.08, letterSpacing: '-0.035em', margin: 0, maxWidth: 980, color: INK, ...s1[1]}}>
            一根针，<span style={{color: YELLOW}}>能藏进多小</span>的地方？
          </h1>
          <p style={{fontFamily: SANS, fontSize: 34, lineHeight: 1.55, margin: 0, maxWidth: 850, color: MUTED, fontWeight: 350, ...s1[2]}}>
            允许一根长度为 1 的线段，在平面内转遍所有方向。
          </p>
          <div style={{fontFamily: SERIF, fontSize: 46, borderTop: `2px solid ${TEAL}`, paddingTop: 24, color: INK, ...s1[3]}}>
            <span style={{color: RED}}>最小面积</span>是多少？
          </div>
        </div>
        <div style={{width: '43%', height: 760, ...s1[3]}}>
          <svg viewBox="0 0 720 720" style={{width: '100%', height: '100%', overflow: 'visible'}}>
            <circle cx={360} cy={360} r={230} fill="none" stroke={TEAL} strokeWidth={4} opacity={0.65}
              strokeDasharray={1500} strokeDashoffset={orbit[0]} />
            <circle cx={360} cy={360} r={115} fill="none" stroke={TEAL} strokeWidth={2} opacity={0.65}
              strokeDasharray={1500} strokeDashoffset={orbit[1]} />
            <g style={{transform: `rotate(${rotor.toFixed(2)}deg)`, transformOrigin: '360px 360px'}}>
              <line x1={130} y1={360} x2={590} y2={360} stroke={YELLOW} strokeWidth={10}
                strokeLinecap="round" style={{transform: `scaleX(${needleSx.toFixed(3)})`, transformOrigin: '360px 360px'}} />
              <circle cx={360} cy={360} r={10} fill={RED}
                style={{transform: `scale(${Math.max(pivotS, 0.0001).toFixed(3)})`, transformOrigin: '360px 360px'}} />
            </g>
            <path d="M445 360 A85 85 0 0 1 420 420" fill="none" stroke={INK} strokeWidth={3}
              opacity={angleP} strokeDasharray={60} strokeDashoffset={60 * (1 - angleP)} />
            <text x={430} y={430} fill={INK} fontSize={34} fontFamily={SERIF} opacity={labels[0]}>θ</text>
            <text x={326} y={330} fill={INK} fontSize={30} fontFamily={SERIF} opacity={labels[1]}>|ℓ| = 1</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ================= Scene 2 (8.1 - 16.2s) ================= */
const Scene2: React.FC<{t: number}> = ({t}) => {
  const items = [0, 1, 2].map((i) => {
    const p = stag(t, 8.35, i, 0.16, 0.7, power3Out);
    return {
      opacity: p,
      transform: `translate(${(i === 2 ? 45 * (1 - p) : 0).toFixed(1)}px, ${(i === 1 ? 35 * (1 - p) : 0).toFixed(1)}px) scale(${(i === 1 ? 0.94 + 0.06 * p : 1).toFixed(3)})`,
    };
  });
  const diskOff = 1500 * (1 - prog(t, 8.55, 1.2, circOut));
  const fan = FAN_LINES.map((_, i) => stag(t, 8.8, i, 0.09, 0.65, expoOut));
  const formulaP = prog(t, 9.15, 0.55, backOut(1.3));
  const rows = [0, 1, 2, 3].map((i) => stag(t, 9.45, i, 0.15, 0.48, power2Out));
  const fanRot = 18 * prog(t, 10.1, 5.6, sineInOut);
  return (
    <div style={{position: 'absolute', inset: 0, ...xfIn(t, 8.1), ...(t >= 16.2 ? xfOut(t, 16.2) : {})}}>
      <div style={{width: '100%', height: '100%', padding: '88px 120px', display: 'flex', flexDirection: 'column', gap: 34, position: 'relative'}}>
        <div style={items[0]}>
          <Topline t={t} base={8.35} no="02" label="先别急着画圆" />
        </div>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 110}}>
          <div style={{width: '50%', height: 760, position: 'relative', ...items[1]}}>
            <svg viewBox="0 0 720 720" style={{width: '100%', height: '100%'}}>
              <circle cx={360} cy={360} r={232} fill="rgba(88,196,163,.08)" stroke={TEAL}
                strokeWidth={5} strokeDasharray={1500} strokeDashoffset={diskOff} />
              <g style={{transform: `rotate(${fanRot.toFixed(2)}deg)`, transformOrigin: '360px 360px'}}>
                {FAN_LINES.map(([x1, y1, x2, y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={YELLOW}
                    strokeWidth={5} strokeLinecap="round" opacity={0.78}
                    style={{transform: `scaleX(${fan[i].toFixed(3)})`, transformOrigin: '360px 360px'}} />
                ))}
              </g>
            </svg>
            <div style={{position: 'absolute', left: '50%', bottom: 25, transform: 'translateX(-50%)', fontSize: 25, color: '#9fbaaf', fontFamily: SANS}}>
              绕中点旋转
            </div>
          </div>
          <div style={{width: '43%', display: 'flex', flexDirection: 'column', gap: 26, ...items[2]}}>
            <div style={{fontFamily: SERIF, fontSize: 60, color: INK, opacity: formulaP,
              transform: `translateX(${(45 * (1 - formulaP)).toFixed(1)}px)`}}>
              A = π · (½)² = <b style={{color: YELLOW}}>π/4</b>
            </div>
            <p style={{fontFamily: SANS, margin: 0, fontSize: 42, color: INK, opacity: rows[0],
              transform: `translateY(${(24 * (1 - rows[0])).toFixed(1)}px)`}}>圆盘当然可行。</p>
            <p style={{fontFamily: SANS, margin: 0, fontSize: 42, color: INK, opacity: rows[1],
              transform: `translateY(${(24 * (1 - rows[1])).toFixed(1)}px)`}}>但它远远不是最省的。</p>
            <div style={{height: 2, background: 'rgba(88,196,163,.45)', opacity: rows[2]}} />
            <p style={{fontFamily: SANS, margin: 0, fontSize: 30, lineHeight: 1.6, color: MUTED, opacity: rows[3],
              transform: `translateY(${(24 * (1 - rows[3])).toFixed(1)}px)`}}>
              关键不是“针绕哪个点转”，而是：<em>每个方向</em>都能在集合中找到一根单位线段。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Scene 3 (16.2 - 24.0s, iris out) ================= */
const Scene3: React.FC<{t: number}> = ({t}) => {
  const items = [0, 1].map((i) => {
    const p = stag(t, 16.45, i, 0.14, 0.72, power4Out);
    return {
      opacity: p,
      transform: `translate(${((i === 1 ? -50 : 45) * (1 - p)).toFixed(1)}px, ${(i === 0 ? -18 * (1 - p) : 0).toFixed(1)}px) scale(${(i === 1 ? 0.96 + 0.04 * p : 1).toFixed(3)})`,
    };
  });
  const tris = TRIANGLES.map((_, i) => stag(t, 16.7, i, 0.12, 0.8, circOut));
  const squeeze = prog(t, 18.2, 4.8, power1InOut);
  const lines = MANY_LINES.map((_, i) => stag(t, 16.95, i, 0.055, 0.7, sineInOut));
  const res = [0, 1, 2].map((i) => stag(t, 17.45, i, 0.17, 0.5, expoOut));
  return (
    <div style={{position: 'absolute', inset: 0, ...xfIn(t, 16.2), opacity: t >= 24.55 ? 0 : xfIn(t, 16.2).opacity}}>
      <div style={{width: '100%', height: '100%', padding: '88px 120px', display: 'flex', flexDirection: 'column', gap: 34, position: 'relative'}}>
        <div style={items[0]}>
          <Topline t={t} base={16.45} no="03" label="贝西科维奇的反直觉" />
        </div>
        <div style={{display: 'flex', alignItems: 'center', flex: 1, gap: 70}}>
          <div style={{width: '65%', height: 710, ...items[0]}}>
            <svg viewBox="0 0 1000 620" style={{width: '100%', height: '100%'}}>
              <g style={{transform: `scaleX(${(1 - 0.32 * squeeze).toFixed(3)})`, transformOrigin: '500px 310px'}}>
                {TRIANGLES.map((pts, i) => (
                  <polygon key={i} points={pts} fill="rgba(88,196,163,.07)" stroke={TEAL}
                    strokeWidth={3} opacity={tris[i]}
                    style={{transform: `scaleY(${(0.35 + 0.65 * tris[i]).toFixed(3)})`, transformOrigin: '500px 620px'}} />
                ))}
              </g>
              <g style={{transform: `scaleX(${(1 - 0.28 * squeeze).toFixed(3)})`, transformOrigin: '500px 310px'}}>
                {MANY_LINES.map(([x1, y1, x2, y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={YELLOW}
                    strokeWidth={5} strokeLinecap="round" opacity={0.7 * lines[i]}
                    strokeDasharray={700} strokeDashoffset={700 * (1 - lines[i])} />
                ))}
              </g>
            </svg>
          </div>
          <div style={{width: '32%', display: 'flex', flexDirection: 'column', gap: 36, ...items[1]}}>
            <div style={{fontFamily: SANS, fontSize: 60, lineHeight: 1.2, color: INK, opacity: res[0],
              transform: `translateX(${(35 * (1 - res[0])).toFixed(1)}px)`}}>
              面积可以<br /><strong style={{fontSize: 112, color: RED, letterSpacing: '-0.05em'}}>任意小</strong>
            </div>
            <div style={{fontFamily: SERIF, fontSize: 62, border: '2px solid rgba(252,98,85,.55)', padding: '24px 32px', color: INK, opacity: res[1],
              transform: `translate(${(35 * (1 - res[1])).toFixed(1)}px, ${(4 * (1 - res[1])).toFixed(1)}px)`}}>
              area(K) → <span style={{color: RED, fontSize: 86}}>0</span>
            </div>
            <p style={{fontFamily: SANS, fontSize: 29, lineHeight: 1.65, color: MUTED, margin: 0, opacity: res[2],
              transform: `translate(${(35 * (1 - res[2])).toFixed(1)}px, ${(8 * (1 - res[2])).toFixed(1)}px)`}}>
              线段彼此大量重叠；方向一个不少，面积却几乎消失。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Scene 4 (24.55 - 33.2s) ================= */
const Scene4: React.FC<{t: number}> = ({t}) => {
  const items = [0, 1, 2].map((i) => {
    const p = stag(t, 24.7, i, 0.17, 0.75, power3Out);
    return {
      opacity: p,
      transform: `translate(${(i === 2 ? -35 * (1 - p) : 0).toFixed(1)}px, ${(i === 1 ? 42 * (1 - p) : 0).toFixed(1)}px) scale(${(i === 1 ? 0.95 + 0.05 * p : 1).toFixed(3)})`,
    };
  });
  const smallP = prog(t, 25.0, 0.7, sineOut);
  const bigP = prog(t, 25.25, 0.75, backOut(1.25));
  const brace = [0, 1].map((i) => stag(t, 25.65, i, 0.16, 0.5, circOut));
  const axis = [0, 1].map((i) => stag(t, 26.05, i, 0.1, 0.65, expoOut));
  const tubes = TUBES.map((_, i) => stag(t, 26.25, i, 0.08, 0.7, power2Out));
  const tubesRot = 4 * prog(t, 27.0, 5.0, sineInOut);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: t < 24.55 ? 0 : 1, ...(t >= 33.2 ? xfOut(t, 33.2) : {})}}>
      <div style={{width: '100%', height: '100%', padding: '88px 120px', display: 'flex', flexDirection: 'column', gap: 34, position: 'relative', alignItems: 'center'}}>
        <div style={{width: '100%', ...items[0]}}>
          <Topline t={t} base={24.7} no="04" label="面积失灵，就问“维数”" />
        </div>
        <div style={{textAlign: 'center', marginTop: 20, ...items[1]}}>
          <div style={{fontFamily: SANS, fontSize: 32, color: MUTED, opacity: smallP,
            transform: `translateX(${(-28 * (1 - smallP)).toFixed(1)}px)`}}>
            若 K ⊂ ℝⁿ 包含每个方向的一根单位线段
          </div>
          <div style={{fontFamily: SERIF, fontSize: 112, marginTop: 20, color: INK, opacity: bigP,
            transform: `scale(${(0.82 + 0.18 * bigP).toFixed(3)})`}}>
            dim<span style={{fontSize: '0.42em', verticalAlign: '-0.28em'}}>H</span>(K) = <b style={{color: TEAL}}>n</b>
          </div>
          <div style={{fontSize: 68, color: YELLOW, height: 55, lineHeight: 0.7, opacity: brace[0],
            transform: `translateY(${(-18 * (1 - brace[0])).toFixed(1)}px)`}}>⏟</div>
          <div style={{fontFamily: SANS, fontSize: 36, color: YELLOW, opacity: brace[1],
            transform: `translateY(${(-18 * (1 - brace[1])).toFixed(1)}px)`}}>它可以没有体积，却不能“降维”</div>
        </div>
        <div style={{width: 1120, height: 480, marginTop: -15, ...items[2]}}>
          <svg viewBox="0 0 900 420" style={{width: '100%', height: '100%', overflow: 'visible'}}>
            <g stroke={INK} strokeWidth={3} opacity={0.4}>
              <line x1={80} y1={350} x2={830} y2={350}
                style={{transform: `scaleX(${axis[0].toFixed(3)})`, transformOrigin: '80px 350px'}} />
              <line x1={130} y1={390} x2={130} y2={55}
                style={{transform: `scaleY(${axis[1].toFixed(3)})`, transformOrigin: '130px 390px'}} />
            </g>
            <g style={{transform: `rotate(${tubesRot.toFixed(2)}deg)`, transformOrigin: '450px 210px'}}>
              {TUBES.map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={i % 2 === 0 ? TEAL : YELLOW} strokeWidth={18} strokeLinecap="round"
                  opacity={(i % 2 === 0 ? 0.38 : 0.34) * tubes[i]}
                  strokeDasharray={700} strokeDashoffset={700 * (1 - tubes[i])} />
              ))}
            </g>
            <text x={760} y={392} fill={MUTED} fontSize={24} fontFamily={SANS}>方向</text>
            <text x={35} y={65} fill={MUTED} fontSize={24} fontFamily={SANS}>尺度</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ================= Scene 5 (33.2 - 42s) ================= */
const Scene5: React.FC<{t: number}> = ({t}) => {
  const items = [0, 1, 2, 3, 4].map((i) => {
    const p = stag(t, 33.45, i, 0.16, 0.72, power3Out);
    const y0 = [0, 42, 28, 20, 0][i];
    return {
      opacity: p,
      transform: `translate(${(i === 4 ? -30 * (1 - p) : 0).toFixed(1)}px, ${(y0 * (1 - p)).toFixed(1)}px) scale(${(i === 2 ? 0.94 + 0.06 * p : 1).toFixed(3)})`,
    };
  });
  const cards = [0, 1].map((i) => {
    const p = stag(t, 34.05, i, 0.16, 0.5, backOut(1.4));
    return {
      opacity: p,
      transform: `translateY(${(22 * (1 - p)).toFixed(1)}px) scale(${(0.9 + 0.1 * p).toFixed(3)})`,
    };
  });
  const needleP = prog(t, 34.65, 0.85, expoOut);
  const needleRot = 12 * prog(t, 35.3, 3.8, sineInOut);
  const outro = 1 - prog(t, 40.65, 1.0, power1In);
  return (
    <div style={{position: 'absolute', inset: 0, ...xfIn(t, 33.2), opacity: xfIn(t, 33.2).opacity * outro}}>
      <div style={{width: '100%', height: '100%', padding: '88px 190px', display: 'flex', flexDirection: 'column', gap: 34, position: 'relative', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontSize: 24, letterSpacing: '0.18em', color: TEAL, fontWeight: 700, ...items[0]}}>
          KAKEYA · THE BIG IDEA
        </div>
        <h2 style={{fontFamily: SANS, fontSize: 112, letterSpacing: '-0.04em', margin: '8px 0 15px', color: INK, ...items[1]}}>
          “小”不只有一种。
        </h2>
        <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 55, ...items[2]}}>
          <div style={{width: 520, padding: 30, borderTop: `3px solid ${TEAL}`, ...cards[0]}}>
            <span style={{display: 'block', fontSize: 24, letterSpacing: '0.2em', color: '#9fbaaf', marginBottom: 12, fontFamily: SANS}}>面积</span>
            <b style={{fontSize: 43, color: RED, fontFamily: SANS}}>可以趋近于 0</b>
          </div>
          <div style={{fontSize: 72, color: YELLOW}}>→</div>
          <div style={{width: 520, padding: 30, borderTop: `3px solid ${TEAL}`, ...cards[1]}}>
            <span style={{display: 'block', fontSize: 24, letterSpacing: '0.2em', color: '#9fbaaf', marginBottom: 12, fontFamily: SANS}}>维数</span>
            <b style={{fontSize: 43, color: TEAL, fontFamily: SANS}}>仍必须充满空间</b>
          </div>
        </div>
        <p style={{fontFamily: SANS, maxWidth: 1220, fontSize: 31, lineHeight: 1.65, color: MUTED, margin: '8px 0', ...items[3]}}>
          挂谷猜想把一个转针小游戏，变成了调和分析、几何测度论与偏微分方程交汇处的核心问题。
        </p>
        <div style={{display: 'flex', alignItems: 'center', gap: 25, color: YELLOW, fontStyle: 'italic', fontSize: 29, fontFamily: SERIF, ...items[4]}}>
          <span style={{display: 'inline-block', width: 180, height: 8, borderRadius: 4, background: YELLOW,
            transform: `scaleX(${needleP.toFixed(3)}) rotate(${needleRot.toFixed(2)}deg)`, transformOrigin: 'left center'}} />
          <i>每一个方向，都留下痕迹。</i>
        </div>
      </div>
    </div>
  );
};

/* ---------- iris wipe (24.0 - 25.15s) ---------- */
const Iris: React.FC<{t: number}> = ({t}) => {
  if (t < 24.0 || t > 25.15) return null;
  const r =
    t < 24.55
      ? 75 * prog(t, 24.0, 0.55, power3In)
      : 75 * (1 - prog(t, 24.55, 0.6, power3Out));
  return (
    <div style={{position: 'absolute', inset: 0, background: TEAL,
      clipPath: `circle(${r.toFixed(2)}% at 50% 50%)`}} />
  );
};

export const Kakeya: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <div style={{width: WIDTH, height: HEIGHT, background: BG, color: INK,
      fontFamily: SANS, position: 'relative', overflow: 'hidden'}}>
      <Ambient t={t} />
      {/* Overlapping mount windows let the blur crossfades blend */}
      <Sequence from={0} durationInFrames={264} name="scene-1">
        <Scene1 t={t} />
      </Sequence>
      <Sequence from={243} durationInFrames={264} name="scene-2">
        <Scene2 t={t} />
      </Sequence>
      <Sequence from={486} durationInFrames={252} name="scene-3">
        <Scene3 t={t} />
      </Sequence>
      <Sequence from={736} durationInFrames={280} name="scene-4">
        <Scene4 t={t} />
      </Sequence>
      <Sequence from={996} durationInFrames={264} name="scene-5">
        <Scene5 t={t} />
      </Sequence>
      <Iris t={t} />
    </div>
  );
};
