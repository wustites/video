import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {LimaMap, useMapData, type MapData} from './Map';
import {useEntrance, useSceneOpacity} from './timing';

const W = 1080;
const H = 1920;

const C = {
  bg: '#060a14',
  card: 'rgba(16,26,48,0.85)',
  border: 'rgba(34,48,79,0.9)',
  text: '#ffffff',
  sub: '#c7d2e8',
  muted: '#93a5c7',
  fine: '#5b6b8c',
  accent: '#ffd75e',
  red: '#ff4d4d',
  green: '#2ee6a8',
};

const font = {
  fontFamily: '"Noto Sans", "Arial", sans-serif',
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

const Kicker: React.FC<{children: React.ReactNode; sceneId: string; offsetSec: number}> = ({
  children,
  sceneId,
  offsetSec,
}) => {
  const e = useEntrance(sceneId, offsetSec, 0.5);
  return (
    <div
      style={{
        ...font,
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: 8,
        color: '#8fa3c8',
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
    Datos: ATU · © OpenStreetMap contributors
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
            border: '2px solid rgba(255,215,94,0.5)',
            borderRadius: 999,
            padding: '18px 44px',
            marginBottom: 60,
            textTransform: 'uppercase',
          }}
        >
          Perú · Lima y Callao
        </div>
      </div>
      <div
        style={{
          ...font,
          fontSize: 132,
          fontWeight: 900,
          letterSpacing: -3,
          lineHeight: 1.05,
          opacity: title.opacity,
          transform: title.transform,
        }}
      >
        Metro
        <br />
        de Lima
      </div>
      <div
        style={{
          width: 560 * line.opacity,
          height: 6,
          background: 'linear-gradient(90deg, #ff4d4d, #ffd75e)',
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
        El sistema de trenes urbanos
        <br />
        más importante del Perú
      </div>
    </Scene>
  );
};

/* ---------------- 场景 2：客流 ---------------- */
const Ridership: React.FC = () => {
  const kicker = useEntrance('ridership', 0.3, 0.5);
  const num = useEntrance('ridership', 0.7, 0.7, 'scale');
  const unit = useEntrance('ridership', 1.5, 0.5);
  const bar = useEntrance('ridership', 2.1, 1.4);
  const sub = useEntrance('ridership', 3.3, 0.5);
  const fillWidth = 78 * bar.opacity;
  return (
    <Scene id="ridership">
      <Kicker sceneId="ridership" offsetSec={0.3}>Cada día</Kicker>
      <div
        style={{
          ...font,
          fontSize: 200,
          fontWeight: 900,
          letterSpacing: -4,
          lineHeight: 1,
          color: C.text,
          opacity: num.opacity,
          transform: num.transform,
        }}
      >
        500 000
        <span style={{fontSize: 110}}>+</span>
      </div>
      <div style={{...font, fontSize: 56, fontWeight: 700, color: C.accent, marginTop: 24, opacity: unit.opacity}}>
        pasajeros
      </div>
      <div
        style={{
          marginTop: 60,
          width: 760,
          height: 20,
          borderRadius: 999,
          background: '#17233c',
          overflow: 'hidden',
          opacity: bar.opacity,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${fillWidth}%`,
            background: 'linear-gradient(90deg, #ff4d4d, #ffd75e)',
            borderRadius: 999,
          }}
        />
      </div>
      <div
        style={{
          ...font,
          marginTop: 48,
          fontSize: 40,
          fontWeight: 600,
          color: C.sub,
          lineHeight: 1.6,
          opacity: sub.opacity,
        }}
      >
        Cruza la capital de sur a norte
        <br />
        y conecta sus distritos
      </div>
    </Scene>
  );
};

/* ---------------- 场景 3：Línea 1 地图 ---------------- */
const MapL1: React.FC<{data: MapData | null}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // 线路绘制进度：场景开始(9.98s)后 0.8s 起画，1.6s 内完成
  const draw = interpolate(t, [10.8, 12.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chip = useEntrance('map-l1', 0, 0.5, 'scale');
  const title = useEntrance('map-l1', 0.5, 0.6);
  const stats = useEntrance('map-l1', 1.8, 0.6);
  const desc = useEntrance('map-l1', 2.8, 0.5);
  return (
    <Scene id="map-l1" style={{padding: 0}}>
      {/* 地图铺满背景，加深色遮罩保证文字可读 */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.85}}>
        <LimaMap
          data={data}
          showL2Under={false}
          l2DrawProgress={0}
          showLabels={false}
          lineDrawProgress={draw}
          emphasize="l1"
        />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(6,10,20,0.25) 0%, rgba(6,10,20,0.88) 78%)'}} />
      {/* 顶部标题区 */}
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
            background: '#e8323a',
            borderRadius: 999,
            padding: '18px 52px',
            textTransform: 'uppercase',
          }}
        >
          Línea 1
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
          fontSize: 54,
          fontWeight: 900,
          color: C.text,
          opacity: title.opacity,
        }}
      >
        De sur a norte
        <br />
        por un viaducto elevado
      </div>
      {/* 底部数据条 */}
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
          {num: '34,6', label: 'km'},
          {num: '26', label: 'estaciones'},
        ].map((s) => (
          <div key={s.label} style={{textAlign: 'center'}}>
            <div style={{...font, fontSize: 92, fontWeight: 900, color: C.red, lineHeight: 1}}>{s.num}</div>
            <div
              style={{
                ...font,
                fontSize: 28,
                fontWeight: 700,
                color: C.muted,
                marginTop: 12,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              {s.label}
            </div>
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
        Villa El Salvador → San Juan de Lurigancho
      </div>
    </Scene>
  );
};

/* ---------------- 场景 4：L1 纪录 ---------------- */
const L1Record: React.FC = () => {
  const kicker = useEntrance('l1record', 0.2, 0.5);
  const title = useEntrance('l1record', 0.6, 0.7);
  const y1 = useEntrance('l1record', 1.4, 0.6);
  const y2 = useEntrance('l1record', 1.7, 0.6);
  const rec = useEntrance('l1record', 2.6, 0.6, 'scale');
  return (
    <Scene id="l1record">
      <Kicker sceneId="l1record" offsetSec={0.2}>Línea 1</Kicker>
      <div style={{...font, fontSize: 76, fontWeight: 900, lineHeight: 1.2, letterSpacing: -2, opacity: title.opacity, transform: title.transform}}>
        Un viaducto elevado
        <br />
        que hizo historia
      </div>
      <div style={{display: 'flex', gap: 60, marginTop: 64}}>
        <div
          style={{
            width: 300,
            padding: '44px 20px',
            background: C.card,
            borderRadius: 32,
            border: `1px solid ${C.border}`,
            opacity: y1.opacity,
            transform: y1.transform,
          }}
        >
          <div style={{...font, fontSize: 80, fontWeight: 900, color: C.accent}}>2011</div>
          <div style={{...font, fontSize: 26, fontWeight: 700, color: C.muted, marginTop: 12}}>Inauguración</div>
        </div>
        <div
          style={{
            width: 300,
            padding: '44px 20px',
            background: C.card,
            borderRadius: 32,
            border: `1px solid ${C.border}`,
            opacity: y2.opacity,
            transform: y2.transform,
          }}
        >
          <div style={{...font, fontSize: 80, fontWeight: 900, color: C.accent}}>2014</div>
          <div style={{...font, fontSize: 26, fontWeight: 700, color: C.muted, marginTop: 12}}>Línea completa</div>
        </div>
      </div>
      <div
        style={{
          ...font,
          marginTop: 60,
          fontSize: 38,
          fontWeight: 700,
          color: C.text,
          background: 'rgba(232,50,58,0.14)',
          border: '1px solid rgba(232,50,58,0.5)',
          borderRadius: 28,
          padding: '30px 48px',
          lineHeight: 1.5,
          opacity: rec.opacity,
          transform: rec.transform,
        }}
      >
        El viaducto elevado
        <br />
        más largo de América Latina
      </div>
    </Scene>
  );
};

/* ---------------- 场景 5：Línea 2 地图 ---------------- */
const MapL2: React.FC<{data: MapData | null}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const l2Draw = interpolate(t, [26.2, 27.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chip = useEntrance('map-l2', 0, 0.5, 'scale');
  const title = useEntrance('map-l2', 0.5, 0.6);
  const features = useEntrance('map-l2', 1.0, 0.6);
  const stats = useEntrance('map-l2', 1.8, 0.6);
  return (
    <Scene id="map-l2" style={{padding: 0}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.85}}>
        <LimaMap data={data} showL2Under l2DrawProgress={l2Draw} showLabels={false} emphasize="l2" />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(6,10,20,0.25) 0%, rgba(6,10,20,0.88) 78%)'}} />
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
            background: '#7b5cff',
            borderRadius: 999,
            padding: '18px 52px',
            textTransform: 'uppercase',
          }}
        >
          Línea 2
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
          fontSize: 54,
          fontWeight: 900,
          color: C.text,
          opacity: title.opacity,
        }}
      >
        El primer metro
        <br />
        subterráneo del país
      </div>
      <div style={{position: 'absolute', bottom: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 44, opacity: features.opacity}}>
        {[
          {icon: '🚇', t: 'Bajo tierra', d: '100% subterráneo'},
          {icon: '🤖', t: 'Sin conductor', d: 'Automático, autónomo'},
        ].map((f) => (
          <div
            key={f.t}
            style={{
              width: 400,
              padding: '44px 24px',
              background: C.card,
              borderRadius: 32,
              border: `1px solid ${C.border}`,
              textAlign: 'center',
            }}
          >
            <div style={{fontSize: 56, lineHeight: 1, marginBottom: 20}}>{f.icon}</div>
            <div style={{...font, fontSize: 34, fontWeight: 900, color: C.green}}>{f.t}</div>
            <div style={{...font, fontSize: 25, fontWeight: 600, color: C.muted, marginTop: 10}}>{f.d}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 120, opacity: stats.opacity}}>
        {[
          {num: '27', label: 'km'},
          {num: '27', label: 'estaciones'},
        ].map((s) => (
          <div key={s.label} style={{textAlign: 'center'}}>
            <div style={{...font, fontSize: 88, fontWeight: 900, color: C.green, lineHeight: 1}}>{s.num}</div>
            <div style={{...font, fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 12, textTransform: 'uppercase', letterSpacing: 2}}>{s.label}</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

/* ---------------- 场景 6：L2 进度 ---------------- */
const L2Progress: React.FC = () => {
  const kicker = useEntrance('l2progress', 0.2, 0.5);
  const title = useEntrance('l2progress', 0.6, 0.6);
  const s1 = useEntrance('l2progress', 1.4, 0.6);
  const arrow = useEntrance('l2progress', 2.0, 0.4);
  const s2 = useEntrance('l2progress', 1.7, 0.6);
  const desc = useEntrance('l2progress', 2.8, 0.5);
  return (
    <Scene id="l2progress">
      <Kicker sceneId="l2progress" offsetSec={0.2}>Línea 2 · Callao → Ate</Kicker>
      <div style={{...font, fontSize: 56, fontWeight: 900, lineHeight: 1.2, letterSpacing: -2, opacity: title.opacity, transform: title.transform}}>
        El este y el oeste
        <br />
        cada vez más cerca
      </div>
      <div style={{display: 'flex', alignItems: 'center', marginTop: 70}}>
        <div style={{width: 360, textAlign: 'center', opacity: s1.opacity, transform: s1.transform}}>
          <div style={{...font, fontSize: 72, fontWeight: 900, color: C.green}}>2023</div>
          <div style={{...font, fontSize: 26, fontWeight: 700, color: C.muted, marginTop: 14, lineHeight: 1.4}}>
            Primer tramo
            <br />
            operativo
          </div>
        </div>
        <div style={{...font, fontSize: 64, color: C.accent, fontWeight: 900, padding: '0 8px', opacity: arrow.opacity}}>→</div>
        <div style={{width: 360, textAlign: 'center', opacity: s2.opacity, transform: s2.transform}}>
          <div style={{...font, fontSize: 72, fontWeight: 900, color: C.accent}}>2028</div>
          <div style={{...font, fontSize: 26, fontWeight: 700, color: C.muted, marginTop: 14, lineHeight: 1.4}}>
            Línea completa
            <br />
            prevista
          </div>
        </div>
      </div>
      <div style={{...font, marginTop: 56, fontSize: 34, fontWeight: 600, color: C.sub, lineHeight: 1.6, opacity: desc.opacity}}>
        Conectará Callao con Ate,
        <br />
        de oeste a este de la metrópoli
      </div>
    </Scene>
  );
};

/* ---------------- 场景 7：未来 ---------------- */
const Future: React.FC = () => {
  const kicker = useEntrance('future', 0.2, 0.5);
  const title = useEntrance('future', 0.6, 0.6);
  const card1 = useEntrance('future', 1.5, 0.6);
  const card2 = useEntrance('future', 1.8, 0.6);
  const airport = useEntrance('future', 2.7, 0.6);
  return (
    <Scene id="future">
      <Kicker sceneId="future" offsetSec={0.2}>El futuro</Kicker>
      <div style={{...font, fontSize: 76, fontWeight: 900, lineHeight: 1.2, letterSpacing: -2, opacity: title.opacity, transform: title.transform}}>
        La red sigue
        <br />
        creciendo
      </div>
      <div style={{display: 'flex', gap: 44, marginTop: 70}}>
        {[
          {line: 'Línea 3', color: C.red, desc: 'Nueva línea\nen proyecto'},
          {line: 'Línea 4', color: C.green, desc: 'Nueva línea\nen proyecto'},
        ].map((f, i) => {
          const e = i === 0 ? card1 : card2;
          return (
            <div
              key={f.line}
              style={{
                width: 410,
                padding: '56px 30px',
                background: C.card,
                borderRadius: 36,
                border: `1px solid ${C.border}`,
                opacity: e.opacity,
                transform: e.transform,
              }}
            >
              <div style={{...font, fontSize: 40, fontWeight: 900, letterSpacing: 2, color: f.color, marginBottom: 24}}>{f.line}</div>
              <div style={{...font, fontSize: 28, fontWeight: 600, color: C.muted, lineHeight: 1.55, whiteSpace: 'pre-line'}}>{f.desc}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...font,
          marginTop: 56,
          fontSize: 34,
          fontWeight: 700,
          color: C.accent,
          border: '1px dashed rgba(255,215,94,0.5)',
          borderRadius: 24,
          padding: '26px 40px',
          opacity: airport.opacity,
        }}
      >
        ✈ Conectará con el aeropuerto
        <br />
        internacional Jorge Chávez
      </div>
    </Scene>
  );
};

/* ---------------- 场景 8：结尾 ---------------- */
const Fare: React.FC = () => {
  const title = useEntrance('fare', 0.2, 0.7);
  const price = useEntrance('fare', 0.9, 0.7, 'scale');
  const sub = useEntrance('fare', 1.8, 0.5);
  const card = useEntrance('fare', 2.4, 0.6);
  const outro = useEntrance('fare', 3.2, 0.9);
  return (
    <Scene id="fare">
      <div style={{...font, fontSize: 66, fontWeight: 900, lineHeight: 1.25, letterSpacing: -2, opacity: title.opacity, transform: title.transform}}>
        Viajar en metro
        <br />
        está al alcance de todos
      </div>
      <div
        style={{
          ...font,
          marginTop: 60,
          fontSize: 150,
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(90deg, #ffd75e, #ff9d4d)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          opacity: price.opacity,
          transform: price.transform,
        }}
      >
        S/ 1,50
      </div>
      <div style={{...font, marginTop: 20, fontSize: 34, fontWeight: 700, color: C.sub, opacity: sub.opacity}}>
        la tarifa única
      </div>
      <div
        style={{
          ...font,
          marginTop: 60,
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
        💳 Pago sin contacto · Tarjeta única
      </div>
      <div
        style={{
          ...font,
          marginTop: 70,
          fontSize: 44,
          fontWeight: 900,
          color: C.accent,
          letterSpacing: 1,
          opacity: outro.opacity,
          transform: outro.transform,
        }}
      >
        Metro de Lima
      </div>
    </Scene>
  );
};

export const MetroLima: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // 结尾淡出黑场：53s → 55.5s（旁白 52.2s 结束，留余量）
  const fadeOut = interpolate(t, [53, 55.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // 地图数据顶层单次加载，两个地图场景共享
  const mapData = useMapData();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Intro />
      <Ridership />
      <MapL1 data={mapData} />
      <L1Record />
      <MapL2 data={mapData} />
      <L2Progress />
      <Future />
      <Fare />
      <FinePrint />
      <Audio src={staticFile('voiceover/narration.es.mp3')} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
