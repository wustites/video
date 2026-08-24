import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {SapporoSchematicMap} from './SapporoSchematicMap';
import {FADE_OUT, useEntrance, useLineDraw, useSceneOpacity} from './timing';

const W = 1080;
const H = 1920;

const C = {
  bg: '#081120',
  card: 'rgba(16,28,52,0.85)',
  border: 'rgba(40,58,96,0.9)',
  text: '#ffffff',
  sub: '#c7d6ea',
  muted: '#93a5c7',
  fine: '#5b6b8c',
  accent: '#ffe08a',
  green: '#00ac84',
  orange: '#fda44a',
  sky: '#00a4e4',
};

const font = {
  fontFamily: '"Noto Sans CJK JP", "Noto Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
};

const Scene: React.FC<{id: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  id,
  children,
  style,
}) => {
  const opacity = useSceneOpacity(id);
  return (
    <AbsoluteFill
      style={{
        opacity,
        visibility: opacity > 0 ? 'visible' : 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '110px 80px',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode; sceneId: string; offsetSec: number; color?: string}> = ({
  children,
  sceneId,
  offsetSec,
  color = '#8fa3c8',
}) => {
  const e = useEntrance(sceneId, offsetSec, 0.5);
  return (
    <div
      style={{
        ...font,
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: 8,
        color,
        textTransform: 'uppercase',
        marginBottom: 40,
        opacity: e.opacity,
        transform: `translateY(${(1 - e.opacity) * -20}px)`,
      }}
    >
      {children}
    </div>
  );
};

const FinePrint: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 52,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 600,
      color: C.fine,
      letterSpacing: 1,
      ...font,
    }}
  >
    札幌市交通局 · データ 2024年度 · 図は概念図です
  </div>
);

/* ---------------- 场景 1：开场 ---------------- */
const Intro: React.FC = () => {
  const badge = useEntrance('intro', 0.4, 0.6);
  const title = useEntrance('intro', 0.8, 0.8, 'rise');
  const line = useEntrance('intro', 1.6, 0.7);
  const sub = useEntrance('intro', 2.4, 0.6);
  return (
    <Scene id="intro">
      <div style={{opacity: badge.opacity, transform: `translateY(${(1 - badge.opacity) * -24}px)`}}>
        <div
          style={{
            ...font,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 6,
            color: C.accent,
            border: '2px solid rgba(255,224,138,0.5)',
            borderRadius: 999,
            padding: '18px 44px',
            marginBottom: 60,
            textTransform: 'uppercase',
          }}
        >
          北海道 · 札幌市
        </div>
      </div>
      <div
        style={{
          ...font,
          fontSize: 118,
          fontWeight: 900,
          letterSpacing: -3,
          lineHeight: 1.05,
          color: C.text,
          opacity: title.opacity,
          transform: title.transform,
        }}
      >
        札幌市営
        <br />
        地下鉄
      </div>
      <div
        style={{
          width: 560 * line.opacity,
          height: 6,
          background: 'linear-gradient(90deg, #00ac84, #00a4e4)',
          borderRadius: 999,
          marginTop: 48,
        }}
      />
      <div
        style={{
          ...font,
          marginTop: 52,
          fontSize: 42,
          fontWeight: 600,
          color: C.sub,
          lineHeight: 1.55,
          opacity: sub.opacity,
        }}
      >
        都心を放射状に結ぶ
        <br />
        北の都市地下鉄
      </div>
    </Scene>
  );
};

/* ---------------- 场景 2：系统概览 ---------------- */
const Network: React.FC = () => {
  const kicker = useEntrance('network', 0.3, 0.5);
  const num = useEntrance('network', 0.7, 0.7, 'scale');
  const unit = useEntrance('network', 1.4, 0.5);
  const sub = useEntrance('network', 2.0, 0.5);
  const footnote = useEntrance('network', 3.0, 0.5);
  return (
    <Scene id="network">
      <Kicker sceneId="network" offsetSec={0.3}>3路線 · 大通で交差</Kicker>
      <div
        style={{
          ...font,
          fontSize: 188,
          fontWeight: 900,
          letterSpacing: -4,
          lineHeight: 1,
          color: C.text,
          opacity: num.opacity,
          transform: num.transform,
        }}
      >
        48
        <span style={{fontSize: 110}}>km</span>
      </div>
      <div style={{...font, fontSize: 56, fontWeight: 700, color: C.accent, marginTop: 24, opacity: unit.opacity}}>
        三線の総延長
      </div>
      <div
        style={{
          ...font,
          marginTop: 64,
          fontSize: 40,
          fontWeight: 600,
          color: C.sub,
          lineHeight: 1.6,
          opacity: sub.opacity,
        }}
      >
        全国4番目・3大都市圏以外では
        <br />
        最大の地下鉄網
      </div>
      <div
        style={{
          ...font,
          marginTop: 40,
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          opacity: footnote.opacity,
        }}
      >
        {[
          {label: '南北線', color: C.green},
          {label: '東西線', color: C.orange},
          {label: '東豊線', color: C.sky},
        ].map((l) => (
          <div
            key={l.label}
            style={{
              padding: '16px 34px',
              borderRadius: 999,
              border: `2px solid ${l.color}`,
              color: l.color,
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            {l.label}
          </div>
        ))}
      </div>
    </Scene>
  );
};

/* ---------------- 场景 3：南北線（地图） ---------------- */
const Namboku: React.FC = () => {
  // 线路绘制：场景开始后 0.8s 起画，1.6s 内完成
  const draw = useLineDraw('namboku', 0.8, 1.6);
  const chip = useEntrance('namboku', 0, 0.5, 'scale');
  const title = useEntrance('namboku', 0.5, 0.6);
  const stats = useEntrance('namboku', 1.8, 0.6);
  const desc = useEntrance('namboku', 2.8, 0.5);
  return (
    <Scene id="namboku" style={{padding: 0}}>
      <div style={{position: 'absolute', inset: 0}}>
        <SapporoSchematicMap emphasize="n" nDrawProgress={draw} tDrawProgress={0} hDrawProgress={0} showLabels />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,17,32,0.35) 0%, rgba(8,17,32,0) 30%, rgba(8,17,32,0) 60%, rgba(8,17,32,0.75) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: chip.opacity,
          transform: chip.transform,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            ...font,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 4,
            color: '#fff',
            background: '#00ac84',
            borderRadius: 999,
            padding: '18px 52px',
          }}
        >
          南北線
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 0,
          right: 0,
          textAlign: 'center',
          ...font,
          fontSize: 52,
          fontWeight: 900,
          color: C.text,
          opacity: title.opacity,
        }}
      >
        五輪の年に開業
        <br />
        麻生から真駒内へ
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 120,
          opacity: stats.opacity,
        }}
      >
        {[
          {num: '14.3', label: 'km'},
          {num: '16', label: '駅'},
        ].map((s) => (
          <div key={s.label} style={{textAlign: 'center'}}>
            <div style={{...font, fontSize: 92, fontWeight: 900, color: C.green, lineHeight: 1}}>{s.num}</div>
            <div style={{...font, fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 12, letterSpacing: 2}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          ...font,
          fontSize: 34,
          fontWeight: 600,
          color: C.sub,
          opacity: desc.opacity,
        }}
      >
        麻生 → 真駒内
      </div>
    </Scene>
  );
};

/* ---------------- 场景 4：東西線（地图） ---------------- */
const Tozai: React.FC = () => {
  const draw = useLineDraw('tozai', 0.8, 1.6);
  const chip = useEntrance('tozai', 0, 0.5, 'scale');
  const title = useEntrance('tozai', 0.5, 0.6);
  const stats = useEntrance('tozai', 1.6, 0.6);
  const desc = useEntrance('tozai', 2.8, 0.5);
  return (
    <Scene id="tozai" style={{padding: 0}}>
      <div style={{position: 'absolute', inset: 0}}>
        <SapporoSchematicMap emphasize="t" nDrawProgress={1} tDrawProgress={draw} hDrawProgress={0} showLabels />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,17,32,0.35) 0%, rgba(8,17,32,0) 30%, rgba(8,17,32,0) 60%, rgba(8,17,32,0.75) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: chip.opacity,
          transform: chip.transform,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            ...font,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 4,
            color: '#fff',
            background: '#fda44a',
            borderRadius: 999,
            padding: '18px 52px',
          }}
        >
          東西線
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 0,
          right: 0,
          textAlign: 'center',
          ...font,
          fontSize: 52,
          fontWeight: 900,
          color: C.text,
          opacity: title.opacity,
        }}
      >
        最も長く駅が多い
        <br />
        東西の大動脈
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 120,
          opacity: stats.opacity,
        }}
      >
        {[
          {num: '20.1', label: 'km'},
          {num: '19', label: '駅'},
        ].map((s) => (
          <div key={s.label} style={{textAlign: 'center'}}>
            <div style={{...font, fontSize: 92, fontWeight: 900, color: C.orange, lineHeight: 1}}>{s.num}</div>
            <div style={{...font, fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 12, letterSpacing: 2}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          ...font,
          fontSize: 34,
          fontWeight: 600,
          color: C.sub,
          opacity: desc.opacity,
        }}
      >
        宮の沢 → 新さっぽろ
      </div>
    </Scene>
  );
};

/* ---------------- 场景 5：東豊線（地图） ---------------- */
const Toho: React.FC = () => {
  const draw = useLineDraw('toho', 0.8, 1.6);
  const chip = useEntrance('toho', 0, 0.5, 'scale');
  const title = useEntrance('toho', 0.5, 0.6);
  const stats = useEntrance('toho', 1.6, 0.6);
  const desc = useEntrance('toho', 2.8, 0.5);
  return (
    <Scene id="toho" style={{padding: 0}}>
      <div style={{position: 'absolute', inset: 0}}>
        <SapporoSchematicMap emphasize="h" nDrawProgress={1} tDrawProgress={1} hDrawProgress={draw} showLabels />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,17,32,0.35) 0%, rgba(8,17,32,0) 30%, rgba(8,17,32,0) 60%, rgba(8,17,32,0.75) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: chip.opacity,
          transform: chip.transform,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            ...font,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 4,
            color: '#fff',
            background: '#00a4e4',
            borderRadius: 999,
            padding: '18px 52px',
          }}
        >
          東豊線
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 0,
          right: 0,
          textAlign: 'center',
          ...font,
          fontSize: 52,
          fontWeight: 900,
          color: C.text,
          opacity: title.opacity,
        }}
      >
        いちばん新しい
        <br />
        東側の路線
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 120,
          opacity: stats.opacity,
        }}
      >
        {[
          {num: '13.6', label: 'km'},
          {num: '14', label: '駅'},
        ].map((s) => (
          <div key={s.label} style={{textAlign: 'center'}}>
            <div style={{...font, fontSize: 92, fontWeight: 900, color: C.sky, lineHeight: 1}}>{s.num}</div>
            <div style={{...font, fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 12, letterSpacing: 2}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          ...font,
          fontSize: 34,
          fontWeight: 600,
          color: C.sub,
          opacity: desc.opacity,
        }}
      >
        栄町 → 福住
      </div>
    </Scene>
  );
};

/* ---------------- 场景 6：技术（札幌方式） ---------------- */
const Technology: React.FC = () => {
  const kicker = useEntrance('technology', 0.2, 0.5);
  const title = useEntrance('technology', 0.6, 0.7);
  const card1 = useEntrance('technology', 1.5, 0.6);
  const card2 = useEntrance('technology', 1.8, 0.6);
  const snow = useEntrance('technology', 2.8, 0.6);
  return (
    <Scene id="technology">
      <Kicker sceneId="technology" offsetSec={0.2}>札幌方式</Kicker>
      <div style={{...font, fontSize: 66, fontWeight: 900, lineHeight: 1.2, letterSpacing: -2, color: C.text, opacity: title.opacity, transform: title.transform}}>
        ゴムタイヤで走る
        <br />
        雪国の地下鉄
      </div>
      <div style={{display: 'flex', gap: 44, marginTop: 70}}>
        {[
          {icon: '🛞', t: '中央案内軌条', d: 'ゴムタイヤ駆動\nパリ式を参考に独自発展', color: C.green},
          {icon: '❄️', t: 'シェルター', d: '高架区間を覆う\n世界でも珍しい構造', color: C.sky},
        ].map((f, i) => {
          const e = i === 0 ? card1 : card2;
          return (
            <div
              key={f.t}
              style={{
                width: 410,
                padding: '52px 30px',
                background: C.card,
                borderRadius: 36,
                border: `1px solid ${C.border}`,
                opacity: e.opacity,
                transform: e.transform,
              }}
            >
              <div style={{fontSize: 58, lineHeight: 1, marginBottom: 22}}>{f.icon}</div>
              <div style={{...font, fontSize: 38, fontWeight: 900, color: f.color}}>{f.t}</div>
              <div style={{...font, fontSize: 26, fontWeight: 600, color: C.muted, marginTop: 12, lineHeight: 1.5, whiteSpace: 'pre-line'}}>{f.d}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...font,
          marginTop: 60,
          fontSize: 34,
          fontWeight: 700,
          color: C.text,
          background: 'rgba(0,164,228,0.12)',
          border: '1px solid rgba(0,164,228,0.5)',
          borderRadius: 28,
          padding: '28px 44px',
          opacity: snow.opacity,
          lineHeight: 1.5,
        }}
      >
        積雪に強い輸送で
        <br />
        街の暮らしを支える
      </div>
    </Scene>
  );
};

/* ---------------- 场景 7：利用状況・安全 ---------------- */
const Ridership: React.FC = () => {
  const kicker = useEntrance('ridership', 0.2, 0.5);
  const num = useEntrance('ridership', 0.7, 0.7, 'scale');
  const unit = useEntrance('ridership', 1.5, 0.5);
  const bar = useEntrance('ridership', 2.1, 1.4);
  const sub = useEntrance('ridership', 3.3, 0.5);
  const fillWidth = 92 * bar.opacity;
  return (
    <Scene id="ridership">
      <Kicker sceneId="ridership" offsetSec={0.2}>毎日</Kicker>
      <div
        style={{
          ...font,
          fontSize: 172,
          fontWeight: 900,
          letterSpacing: -4,
          lineHeight: 1,
          color: C.text,
          opacity: num.opacity,
          transform: num.transform,
        }}
      >
        63
        <span style={{fontSize: 96}}>万人</span>
      </div>
      <div style={{...font, fontSize: 52, fontWeight: 700, color: C.accent, marginTop: 24, opacity: unit.opacity}}>
        一日平均乗車人員
      </div>
      <div
        style={{
          marginTop: 60,
          width: 760,
          height: 20,
          borderRadius: 999,
          background: '#152238',
          overflow: 'hidden',
          opacity: bar.opacity,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${fillWidth}%`,
            background: 'linear-gradient(90deg, #00ac84, #00a4e4)',
            borderRadius: 999,
          }}
        />
      </div>
      <div
        style={{
          ...font,
          marginTop: 48,
          fontSize: 38,
          fontWeight: 600,
          color: C.sub,
          lineHeight: 1.6,
          opacity: sub.opacity,
        }}
      >
        全駅にホームドア設置
        <br />
        安全で快適な輸送
      </div>
    </Scene>
  );
};

/* ---------------- 场景 8：结尾 ---------------- */
const Outro: React.FC = () => {
  const title = useEntrance('outro', 0.2, 0.7);
  const price = useEntrance('outro', 0.9, 0.7, 'scale');
  const sub = useEntrance('outro', 1.7, 0.5);
  const card = useEntrance('outro', 2.4, 0.6);
  const outro = useEntrance('outro', 3.1, 0.9);
  return (
    <Scene id="outro">
      <div style={{...font, fontSize: 62, fontWeight: 900, lineHeight: 1.25, letterSpacing: -2, color: C.text, opacity: title.opacity, transform: title.transform}}>
        街のいちばん身近な
        <br />
        移動の柱
      </div>
      <div
        style={{
          ...font,
          marginTop: 58,
          fontSize: 142,
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(90deg, #ffe08a, #fda44a)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          opacity: price.opacity,
          transform: price.transform,
        }}
      >
        210
        <span style={{fontSize: 68}}>円〜</span>
      </div>
      <div style={{...font, marginTop: 20, fontSize: 32, fontWeight: 700, color: C.sub, opacity: sub.opacity}}>
        普通乗車料金（1区）
      </div>
      <div
        style={{
          ...font,
          marginTop: 56,
          fontSize: 34,
          fontWeight: 700,
          color: C.text,
          background: C.card,
          borderRadius: 28,
          border: `1px solid ${C.border}`,
          padding: '28px 44px',
          opacity: card.opacity,
        }}
      >
        💳 SAPICA・交通系IC対応
      </div>
      <div
        style={{
          ...font,
          marginTop: 66,
          fontSize: 44,
          fontWeight: 900,
          color: C.accent,
          letterSpacing: 1,
          opacity: outro.opacity,
          transform: outro.transform,
        }}
      >
        札幌市営地下鉄
      </div>
    </Scene>
  );
};

export const SapporoSubway: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const fadeOut = interpolate(t, [FADE_OUT.start, FADE_OUT.end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Intro />
      <Network />
      <Namboku />
      <Tozai />
      <Toho />
      <Technology />
      <Ridership />
      <Outro />
      <FinePrint />
      <Audio src={staticFile('voiceover/narration.ja.mp3')} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
