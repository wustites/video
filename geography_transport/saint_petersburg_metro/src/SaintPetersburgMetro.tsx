import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BilingualSubtitles} from './BilingualSubtitles';
import {LINE_COLORS, type MetroLine} from './SchematicMap';
import {FADE_OUT, useEntrance, useLineDraw, useSceneOpacity, type SceneId} from './timing';
import {notoSans} from './fonts';

const C = {
  bg: '#070c17',
  bgSoft: '#0e1a2e',
  card: 'rgba(12, 25, 45, 0.88)',
  border: 'rgba(97, 139, 183, 0.42)',
  text: '#f6f8fc',
  sub: '#c8d6e8',
  muted: '#8ea4c1',
  fine: '#617894',
  gold: '#f3c969',
  goldSoft: 'rgba(243, 201, 105, 0.18)',
  river: '#5da7c0',
};

const font = {
  fontFamily: `${notoSans.fontFamily}, sans-serif`,
};

const PageTexture: React.FC = () => (
  <AbsoluteFill
    style={{
      zIndex: 0,
      background: `radial-gradient(circle at 50% 20%, ${C.goldSoft} 0%, transparent 29%), radial-gradient(circle at 12% 70%, rgba(53, 104, 149, 0.18) 0%, transparent 30%), ${C.bg}`,
    }}
  >
    {Array.from({length: 28}).map((_, index) => (
      <div
        key={`texture-v-${index}`}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: index * 45,
          width: 1,
          background: 'rgba(150, 190, 225, 0.045)',
        }}
      />
    ))}
    {Array.from({length: 43}).map((_, index) => (
      <div
        key={`texture-h-${index}`}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: index * 45,
          height: 1,
          background: 'rgba(150, 190, 225, 0.045)',
        }}
      />
    ))}
    <div
      style={{
        position: 'absolute',
        right: -180,
        top: 230,
        width: 650,
        height: 650,
        borderRadius: '50%',
        border: '1px solid rgba(243, 201, 105, 0.09)',
        boxShadow: '0 0 0 34px rgba(243, 201, 105, 0.025), 0 0 0 68px rgba(243, 201, 105, 0.018)',
      }}
    />
  </AbsoluteFill>
);

const Scene: React.FC<{
  id: SceneId;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({id, children, style}) => {
  const opacity = useSceneOpacity(id);
  return (
    <AbsoluteFill
      style={{
        zIndex: 1,
        opacity,
        visibility: opacity > 0 ? 'visible' : 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '105px 74px 245px',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{
  children: React.ReactNode;
  sceneId: SceneId;
  offsetSec: number;
  color?: string;
}> = ({children, sceneId, offsetSec, color = C.muted}) => {
  const entrance = useEntrance(sceneId, offsetSec, 0.5);
  return (
    <div
      style={{
        ...font,
        fontSize: 25,
        fontWeight: 800,
        letterSpacing: 5,
        lineHeight: 1.2,
        color,
        marginBottom: 30,
        opacity: entrance.opacity,
        transform: `translateY(${(1 - entrance.opacity) * -18}px)`,
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
      zIndex: 20,
      left: 0,
      right: 0,
      bottom: 22,
      textAlign: 'center',
      ...font,
      color: C.fine,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: 1.2,
      pointerEvents: 'none',
    }}
  >
    Данные: ГУП «Петербургский метрополитен» · 2025 · схематичный рисунок
  </div>
);

const Metric: React.FC<{
  value: string;
  label: string;
  detail?: string;
  color?: string;
}> = ({value, label, detail, color = C.gold}) => (
  <div
    style={{
      minWidth: 205,
      padding: '23px 24px 21px',
      borderRadius: 22,
      background: C.card,
      border: `1px solid ${C.border}`,
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.18)',
    }}
  >
    <div style={{...font, color, fontSize: 57, fontWeight: 900, lineHeight: 1}}>{value}</div>
    <div style={{...font, color: C.sub, fontSize: 24, fontWeight: 700, marginTop: 12}}>{label}</div>
    {detail && <div style={{...font, color: C.fine, fontSize: 18, fontWeight: 600, marginTop: 7}}>{detail}</div>}
  </div>
);

const LineLegend: React.FC = () => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 850}}>
    {([
      [1, 'Красная'],
      [2, 'Синяя'],
      [3, 'Зелёная'],
      [4, 'Оранжевая'],
      [5, 'Фиолетовая'],
      [6, 'Бирюзовая'],
    ] as [MetroLine, string][]).map(([line, label]) => (
      <div
        key={line}
        style={{
          ...font,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '10px 15px',
          borderRadius: 999,
          border: `1px solid ${LINE_COLORS[line]}55`,
          background: `${LINE_COLORS[line]}12`,
          color: C.sub,
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        <span style={{width: 10, height: 10, borderRadius: '50%', background: LINE_COLORS[line]}} />
        {label}
      </div>
    ))}
  </div>
);

const NetworkBackdrop: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: 0.18}}>
    <path d="M 260 360 L 540 880 L 820 1510" fill="none" stroke={LINE_COLORS[2]} strokeWidth={12} strokeLinecap="round" />
    <path d="M 180 960 L 900 960" fill="none" stroke={LINE_COLORS[3]} strokeWidth={12} strokeLinecap="round" />
    <path d="M 850 390 L 610 900 L 330 1480" fill="none" stroke={LINE_COLORS[4]} strokeWidth={12} strokeLinecap="round" />
    <path d="M 350 1380 L 560 1180 L 790 980" fill="none" stroke={LINE_COLORS[5]} strokeWidth={12} strokeLinecap="round" />
    <path d="M 540 350 L 540 1530" fill="none" stroke={LINE_COLORS[1]} strokeWidth={12} strokeLinecap="round" />
    <path d="M 300 1480 L 500 1370" fill="none" stroke={LINE_COLORS[6]} strokeWidth={12} strokeLinecap="round" />
    {[
      [540, 350], [540, 650], [540, 910], [540, 1180], [540, 1530],
      [180, 960], [390, 960], [640, 960], [905, 960], [850, 390], [350, 1380], [500, 1370],
    ].map(([x, y], index) => <circle key={index} cx={x} cy={y} r={10} fill="#0a1628" stroke="#dce8f5" strokeWidth={3} />)}
  </svg>
);

const COMPACT_PATHS: Record<MetroLine, string> = {
  1: 'M 540 350 L 540 1530',
  2: 'M 300 500 L 425 735 L 540 910 L 650 1120 L 820 1460',
  3: 'M 175 950 L 905 950',
  4: 'M 840 400 L 700 650 L 610 910 L 430 1180 L 250 1480',
  5: 'M 350 1370 L 470 1280 L 560 1180 L 670 1080 L 780 970',
  6: 'M 300 1480 L 500 1370',
};

const COMPACT_NODES = [
  {x: 540, y: 350, transfer: false},
  {x: 540, y: 650, transfer: true},
  {x: 540, y: 910, transfer: true},
  {x: 540, y: 1180, transfer: false},
  {x: 540, y: 1530, transfer: false},
  {x: 175, y: 950, transfer: false},
  {x: 390, y: 950, transfer: false},
  {x: 640, y: 950, transfer: true},
  {x: 905, y: 950, transfer: false},
  {x: 840, y: 400, transfer: false},
  {x: 350, y: 1370, transfer: false},
  {x: 500, y: 1370, transfer: false},
];

const CompactMetroMap: React.FC<{progress: number}> = ({progress}) => {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" role="img" aria-label="Схема петербургского метрополитена">
      {([1, 2, 3, 4, 5, 6] as MetroLine[]).map((line, index) => {
        const lineProgress = Math.max(0, Math.min(1, (p * 7 - index) / 2));
        return (
          <g key={`compact-line-${line}`}>
            <path d={COMPACT_PATHS[line]} fill="none" stroke={LINE_COLORS[line]} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" opacity={0.16} />
            <path
              d={COMPACT_PATHS[line]}
              fill="none"
              stroke={LINE_COLORS[line]}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - lineProgress}
            />
          </g>
        );
      })}
      {COMPACT_NODES.map((node, index) => {
        const reached = p >= (index + 1) / (COMPACT_NODES.length + 4);
        if (!reached) return null;
        return (
          <g key={`compact-node-${index}`}>
            <circle cx={node.x} cy={node.y} r={node.transfer ? 14 : 9} fill="#081321" stroke="#dce8f5" strokeWidth={3} />
            {node.transfer && <circle cx={node.x} cy={node.y} r={5} fill="#f3c969" />}
          </g>
        );
      })}
      {[
        {x: 540, y: 350, text: 'Девяткино', anchor: 'middle'},
        {x: 540, y: 1530, text: 'Проспект Славы', anchor: 'middle'},
        {x: 175, y: 950, text: 'Беговая', anchor: 'end'},
        {x: 905, y: 950, text: 'Достоевская', anchor: 'start'},
        {x: 840, y: 400, text: 'Лахта', anchor: 'start'},
      ].map((label) => (
        <text key={label.text} x={label.x + (label.anchor === 'start' ? 20 : label.anchor === 'end' ? -20 : 0)} y={label.y + 6} fill="#b9c9df" fontSize={18} fontWeight={600} textAnchor={label.anchor as 'start' | 'middle' | 'end'} style={{paintOrder: 'stroke', stroke: '#081321', strokeWidth: 5, strokeLinejoin: 'round'}}>
          {label.text}
        </text>
      ))}
    </svg>
  );
};

/* ---------------- 1. Intro ---------------- */
const Intro: React.FC = () => {
  const badge = useEntrance('intro', 0.25, 0.55, 'rise');
  const title = useEntrance('intro', 0.75, 0.8, 'rise');
  const rule = useEntrance('intro', 1.55, 0.7);
  const sub = useEntrance('intro', 2.2, 0.6);
  const stats = useEntrance('intro', 2.9, 0.75);

  return (
    <Scene id="intro">
      <div style={{opacity: badge.opacity, transform: badge.transform}}>
        <div
          style={{
            ...font,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 22px',
            borderRadius: 999,
            border: '1px solid rgba(243, 201, 105, 0.6)',
            background: 'rgba(243, 201, 105, 0.08)',
            color: C.gold,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3.2,
            textTransform: 'uppercase',
          }}
        >
          <span style={{width: 9, height: 9, borderRadius: '50%', background: C.gold}} />
          Санкт-Петербург · 1955—2026
        </div>
      </div>

      <div
        style={{
          ...font,
          marginTop: 58,
          color: C.text,
          fontSize: 76,
          fontWeight: 900,
          lineHeight: 1.06,
          letterSpacing: -2.5,
          opacity: title.opacity,
          transform: title.transform,
        }}
      >
        Петербургский
        <br />
        метрополитен
      </div>
      <div
        style={{
          ...font,
          width: 590 * rule.opacity,
          height: 6,
          marginTop: 38,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${LINE_COLORS[1]}, ${LINE_COLORS[3]}, ${LINE_COLORS[6]})`,
        }}
      />
      <div
        style={{
          ...font,
          marginTop: 36,
          color: C.sub,
          fontSize: 31,
          fontWeight: 600,
          lineHeight: 1.42,
          opacity: sub.opacity,
        }}
      >
        Подземная магистраль города
        <br />
        <span style={{color: C.gold, fontSize: 25, letterSpacing: 1.5}}>SAINT PETERSBURG METRO</span>
      </div>
      <div style={{display: 'flex', gap: 16, marginTop: 48, opacity: stats.opacity, transform: stats.transform}}>
        <Metric value="6" label="линий" color={LINE_COLORS[1]} />
        <Metric value="75" label="станций" color={LINE_COLORS[3]} />
        <Metric value="131" label="км сети" color={LINE_COLORS[6]} />
      </div>
    </Scene>
  );
};

/* ---------------- 2. Network ---------------- */
const Network: React.FC = () => {
  const networkVisible = useSceneOpacity('network') > 0;
  const number = useEntrance('network', 0.65, 0.7, 'scale');
  const subtitle = useEntrance('network', 1.4, 0.55);
  const metrics = useEntrance('network', 2.0, 0.75);
  const legend = useEntrance('network', 2.8, 0.6);

  return (
    <Scene id="network">
      {networkVisible && <NetworkBackdrop />}
      <Kicker sceneId="network" offsetSec={0.2} color={C.gold}>СЕТЬ СЕГОДНЯ · NETWORK TODAY</Kicker>
      <div
        style={{
          ...font,
          color: C.text,
          fontSize: 184,
          fontWeight: 900,
          letterSpacing: -7,
          lineHeight: 0.95,
          opacity: number.opacity,
          transform: number.transform,
        }}
      >
        6
        <span style={{fontSize: 72, letterSpacing: -2, marginLeft: 14, color: C.gold}}>линий</span>
      </div>
      <div
        style={{
          ...font,
          maxWidth: 760,
          marginTop: 30,
          color: C.sub,
          fontSize: 34,
          fontWeight: 600,
          lineHeight: 1.45,
          opacity: subtitle.opacity,
        }}
      >
        Шесть радиусов связывают центр, острова и спальные районы города.
      </div>
      <div style={{display: 'flex', gap: 18, marginTop: 48, opacity: metrics.opacity, transform: metrics.transform}}>
        <Metric value="75" label="станций" detail="8 пересадочных узлов" color={LINE_COLORS[3]} />
        <Metric value="131" label="км" detail="общая длина" color={LINE_COLORS[6]} />
        <Metric value="≈1,8 млн" label="поездок в день" detail="данные 2024" color={C.gold} />
      </div>
      <div style={{marginTop: 48, opacity: legend.opacity}}>
        <LineLegend />
      </div>
    </Scene>
  );
};

/* ---------------- 3. History ---------------- */
const History: React.FC = () => {
  const title = useEntrance('history', 0.65, 0.7, 'rise');
  const timeline = useEntrance('history', 1.35, 0.9);
  const note = useEntrance('history', 2.5, 0.55);

  const events = [
    {year: '1941', label: 'Строительство\nначинается', color: LINE_COLORS[4]},
    {year: '1955', label: 'Первый участок\nоткрыт', color: C.gold},
    {year: '2025', label: 'Открыта\nшестая линия', color: LINE_COLORS[6]},
  ];

  return (
    <Scene id="history">
      <Kicker sceneId="history" offsetSec={0.2} color={C.gold}>ИСТОРИЯ · HISTORY</Kicker>
      <div
        style={{
          ...font,
          maxWidth: 820,
          color: C.text,
          fontSize: 65,
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: -2,
          opacity: title.opacity,
          transform: title.transform,
        }}
      >
        От блокадного города
        <br />
        к шести линиям
      </div>
      <div style={{position: 'relative', width: 830, marginTop: 76, height: 300, opacity: timeline.opacity}}>
        <div style={{position: 'absolute', left: 36, top: 25, bottom: 25, width: 2, background: 'linear-gradient(180deg, #6d8aa9, #f3c969)'}} />
        {events.map((event, index) => {
          const top = 20 + index * 118;
          return (
            <div key={event.year} style={{position: 'absolute', left: 0, top, display: 'flex', alignItems: 'center', gap: 28}}>
              <div style={{width: 74, height: 74, borderRadius: '50%', background: '#0b1628', border: `4px solid ${event.color}`, boxShadow: `0 0 0 8px ${event.color}15`}} />
              <div style={{...font, color: C.text, fontSize: 48, fontWeight: 900, minWidth: 155}}>{event.year}</div>
              <div style={{...font, color: C.sub, fontSize: 26, fontWeight: 600, lineHeight: 1.25, whiteSpace: 'pre-line'}}>{event.label}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...font,
          maxWidth: 780,
          marginTop: 38,
          padding: '20px 30px',
          borderRadius: 20,
          border: '1px solid rgba(243, 201, 105, 0.35)',
          background: C.goldSoft,
          color: C.gold,
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.35,
          opacity: note.opacity,
        }}
      >
        15 ноября 1955 года — семь станций открыли первую очередь
      </div>
    </Scene>
  );
};

/* ---------------- 4. Map ---------------- */
const MapScene: React.FC = () => {
  const mapVisible = useSceneOpacity('map') > 0;
  const draw = useLineDraw('map', 0.7, 2.3);
  const chip = useEntrance('map', 0.05, 0.5, 'scale');
  const title = useEntrance('map', 0.5, 0.65);
  const stats = useEntrance('map', 1.65, 0.65);

  return (
    <Scene id="map" style={{padding: 0}}>
      {mapVisible && (
        <div style={{position: 'absolute', inset: 0}}>
          <CompactMetroMap progress={draw} />
        </div>
      )}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5, 10, 20, 0.62) 0%, transparent 24%, transparent 67%, rgba(5, 10, 20, 0.76) 100%)'}} />
      <div style={{position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', opacity: chip.opacity, transform: chip.transform}}>
        <div
          style={{
            ...font,
            display: 'inline-block',
            padding: '15px 34px',
            borderRadius: 999,
            background: C.gold,
            color: '#111827',
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          6 линий · 75 станций
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 225,
          left: 0,
          right: 0,
          textAlign: 'center',
          ...font,
          color: C.text,
          fontSize: 52,
          fontWeight: 900,
          lineHeight: 1.12,
          opacity: title.opacity,
        }}
      >
        Узел пересадок
        <br />
        в центре города
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 410, display: 'flex', justifyContent: 'center', gap: 14, opacity: stats.opacity}}>
        {[
          {label: 'центр', value: '5 линий', color: C.gold},
          {label: 'пересадки', value: '8 узлов', color: LINE_COLORS[6]},
          {label: 'шестая линия', value: '2025', color: LINE_COLORS[6]},
        ].map((item) => (
          <div key={item.label} style={{...font, minWidth: 190, padding: '15px 18px', borderRadius: 18, background: 'rgba(7, 14, 27, 0.78)', border: `1px solid ${item.color}55`}}>
            <div style={{color: item.color, fontSize: 25, fontWeight: 900}}>{item.value}</div>
            <div style={{color: C.sub, fontSize: 18, fontWeight: 600, marginTop: 5}}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 260, textAlign: 'center', ...font, color: C.muted, fontSize: 22, fontWeight: 600, letterSpacing: 1.5}}>
        СХЕМАТИЧНАЯ КАРТА · NOT TO SCALE
      </div>
    </Scene>
  );
};

/* ---------------- 5. Depth ---------------- */
const Depth: React.FC = () => {
  const title = useEntrance('depth', 0.65, 0.7, 'rise');
  const gauge = useEntrance('depth', 1.25, 0.9);
  const number = useEntrance('depth', 1.6, 0.65, 'scale');
  const cards = useEntrance('depth', 2.35, 0.7);

  return (
    <Scene id="depth">
      <Kicker sceneId="depth" offsetSec={0.2} color={C.river}>ГЕОЛОГИЯ · DEPTH</Kicker>
      <div
        style={{
          ...font,
          maxWidth: 830,
          color: C.text,
          fontSize: 65,
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: -2,
          opacity: title.opacity,
          transform: title.transform,
        }}
      >
        Глубже, чем
        <br />
        кажется
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 38, width: 840, marginTop: 54}}>
        <svg width={180} height={360} viewBox="0 0 180 360" style={{flexShrink: 0}}>
          <defs>
            <linearGradient id="depth-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.gold} />
              <stop offset="100%" stopColor={C.river} />
            </linearGradient>
          </defs>
          <line x1={90} y1={20} x2={90} y2={330} stroke="#294158" strokeWidth={22} strokeLinecap="round" />
          <line x1={90} y1={20} x2={90} y2={330} stroke="url(#depth-gradient)" strokeWidth={8} strokeLinecap="round" strokeDasharray="310" strokeDashoffset={310 - 310 * gauge.opacity} />
          {[0, 1, 2, 3].map((index) => {
            const y = 20 + index * 103;
            return <line key={index} x1={54} y1={y} x2={126} y2={y} stroke={C.text} strokeWidth={3} opacity={0.72} />;
          })}
          <text x={10} y={28} fill={C.muted} fontSize={18}>0 м</text>
          <text x={10} y={130} fill={C.muted} fontSize={18}>−30</text>
          <text x={10} y={233} fill={C.muted} fontSize={18}>−60</text>
          <text x={10} y={335} fill={C.gold} fontSize={18}>−86 м</text>
        </svg>
        <div style={{textAlign: 'left', opacity: number.opacity, transform: number.transform}}>
          <div style={{...font, color: C.gold, fontSize: 152, fontWeight: 900, lineHeight: 0.9, letterSpacing: -6}}>86</div>
          <div style={{...font, color: C.text, fontSize: 37, fontWeight: 800, marginTop: 15}}>метров под землёй</div>
          <div style={{...font, color: C.sub, fontSize: 25, fontWeight: 600, marginTop: 16, lineHeight: 1.35}}>«Адмиралтейская» —<br />самая глубокая станция России</div>
        </div>
      </div>
      <div style={{display: 'flex', gap: 18, marginTop: 52, opacity: cards.opacity}}>
        {[
          {title: 'Водоносные горизонты', text: 'песчаные и глинистые слои', color: C.river},
          {title: 'Подземные воды', text: 'сложная гидрогеология', color: LINE_COLORS[3]},
          {title: 'Глубокие тоннели', text: 'инженерный вызов', color: C.gold},
        ].map((item) => (
          <div key={item.title} style={{width: 265, padding: '21px 20px', borderRadius: 20, background: C.card, border: `1px solid ${item.color}55`, textAlign: 'left'}}>
            <div style={{...font, color: item.color, fontSize: 23, fontWeight: 800, lineHeight: 1.2}}>{item.title}</div>
            <div style={{...font, color: C.muted, fontSize: 19, fontWeight: 600, marginTop: 9}}>{item.text}</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

/* ---------------- 6. Architecture ---------------- */
const Architecture: React.FC = () => {
  const title = useEntrance('architecture', 0.65, 0.7, 'rise');
  const cards = useEntrance('architecture', 1.35, 0.8);
  const note = useEntrance('architecture', 2.35, 0.55);

  const motifs = [
    {name: 'Мрамор', english: 'MARBLE', color: '#d8c7a5', detail: 'Свет и объём\nв центральных залах', background: 'linear-gradient(135deg, #d5c39e, #756c67 45%, #efe2c4)'},
    {name: 'Мозаика', english: 'MOSAIC', color: '#e1b967', detail: 'Сюжеты города\nи его память', background: 'repeating-linear-gradient(45deg, #183d62 0 16px, #d49a4f 16px 32px, #5e9b8a 32px 48px)'},
    {name: 'Свет', english: 'LIGHT', color: '#f3c969', detail: 'Люстры и свет\nкак часть образа', background: 'radial-gradient(circle at 50% 35%, #fff2b0 0 9%, #d79a3b 10% 18%, transparent 19%), radial-gradient(circle, #f3c969 0 3%, transparent 4%)'},
  ];

  return (
    <Scene id="architecture">
      <Kicker sceneId="architecture" offsetSec={0.2} color={C.gold}>АРХИТЕКТУРА · ARCHITECTURE</Kicker>
      <div
        style={{
          ...font,
          maxWidth: 820,
          color: C.text,
          fontSize: 70,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: -2.5,
          opacity: title.opacity,
          transform: title.transform,
        }}
      >
        Станции —
        <br />
        как дворцы
      </div>
      <div style={{display: 'flex', gap: 24, marginTop: 72}}>
        {motifs.map((motif) => {
          const entrance = cards;
          return (
            <div
              key={motif.name}
              style={{
                width: 270,
                padding: '13px 13px 24px',
                borderRadius: 25,
                background: C.card,
                border: `1px solid ${motif.color}55`,
                opacity: entrance.opacity,
                transform: entrance.transform,
              }}
            >
              <div style={{height: 145, borderRadius: 16, background: motif.background, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.13)'}} />
              <div style={{...font, color: motif.color, fontSize: 30, fontWeight: 900, marginTop: 21, textAlign: 'left'}}>{motif.name}</div>
              <div style={{...font, color: C.fine, fontSize: 16, fontWeight: 800, letterSpacing: 2.5, marginTop: 5, textAlign: 'left'}}>{motif.english}</div>
              <div style={{...font, color: C.sub, fontSize: 21, fontWeight: 600, lineHeight: 1.35, marginTop: 13, textAlign: 'left', whiteSpace: 'pre-line'}}>{motif.detail}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...font,
          maxWidth: 780,
          marginTop: 54,
          padding: '18px 30px',
          borderRadius: 18,
          background: 'rgba(243, 201, 105, 0.08)',
          border: '1px solid rgba(243, 201, 105, 0.3)',
          color: C.gold,
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.35,
          opacity: note.opacity,
        }}
      >
        Метро стало частью образа Санкт-Петербурга
      </div>
    </Scene>
  );
};

/* ---------------- 7. Service ---------------- */
const Service: React.FC = () => {
  const number = useEntrance('service', 0.65, 0.7, 'scale');
  const unit = useEntrance('service', 1.25, 0.5);
  const bar = useEntrance('service', 1.75, 1.2);
  const payment = useEntrance('service', 2.55, 0.7);

  return (
    <Scene id="service">
      <Kicker sceneId="service" offsetSec={0.2} color={C.gold}>КАЖДЫЙ ДЕНЬ · EVERY DAY</Kicker>
      <div
        style={{
          ...font,
          color: C.text,
          fontSize: 169,
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: -7,
          opacity: number.opacity,
          transform: number.transform,
        }}
      >
        1,8
        <span style={{fontSize: 76, color: C.gold, letterSpacing: -1}}>млн</span>
      </div>
      <div style={{...font, color: C.sub, fontSize: 38, fontWeight: 800, marginTop: 20, opacity: unit.opacity}}>пассажиров каждый день</div>
      <div style={{width: 760, marginTop: 55, opacity: bar.opacity}}>
        <div style={{...font, display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: 22, fontWeight: 700, marginBottom: 13}}>
          <span>2024 · годовой пассажиропоток</span>
          <span style={{color: C.gold}}>680+ млн</span>
        </div>
        <div style={{height: 22, borderRadius: 999, background: '#17263d', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${88 * bar.opacity}%`, borderRadius: 999, background: `linear-gradient(90deg, ${LINE_COLORS[3]}, ${C.gold})`}} />
        </div>
      </div>
      <div
        style={{
          ...font,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginTop: 62,
          padding: '24px 30px',
          borderRadius: 24,
          background: C.card,
          border: `1px solid ${LINE_COLORS[6]}66`,
          opacity: payment.opacity,
          transform: payment.transform,
          textAlign: 'left',
        }}
      >
        <div style={{width: 68, height: 68, borderRadius: 18, background: `linear-gradient(135deg, ${LINE_COLORS[6]}, ${C.gold})`, boxShadow: `0 0 0 7px ${LINE_COLORS[6]}18`}} />
        <div>
          <div style={{...font, color: C.text, fontSize: 29, fontWeight: 800}}>«Подорожник» · бесконтактная карта</div>
          <div style={{...font, color: C.muted, fontSize: 21, fontWeight: 600, marginTop: 7}}>оплата картой · быстрый проход</div>
        </div>
      </div>
    </Scene>
  );
};

/* ---------------- 8. Outro ---------------- */
const Outro: React.FC = () => {
  const title = useEntrance('outro', 0.2, 0.8, 'rise');
  const sub = useEntrance('outro', 1.1, 0.6);
  const badge = useEntrance('outro', 1.9, 0.7, 'scale');
  const end = useEntrance('outro', 2.8, 0.9);

  return (
    <Scene id="outro">
      <div
        style={{
          ...font,
          color: C.text,
          fontSize: 86,
          fontWeight: 900,
          lineHeight: 1.03,
          letterSpacing: -3,
          opacity: title.opacity,
          transform: title.transform,
        }}
      >
        Город
        <br />
        под землёй
      </div>
      <div
        style={{
          ...font,
          maxWidth: 760,
          marginTop: 42,
          color: C.sub,
          fontSize: 34,
          fontWeight: 600,
          lineHeight: 1.45,
          opacity: sub.opacity,
        }}
      >
        История, архитектура и движение —
        <br />
        в одной городской сети
      </div>
      <div
        style={{
          ...font,
          display: 'inline-block',
          marginTop: 62,
          padding: '19px 31px',
          borderRadius: 999,
          background: C.gold,
          color: '#101827',
          fontSize: 25,
          fontWeight: 900,
          letterSpacing: 2.6,
          opacity: badge.opacity,
          transform: badge.transform,
        }}
      >
        ПЕТЕРБУРГСКИЙ МЕТРОПОЛИТЕН
      </div>
      <div
        style={{
          ...font,
          marginTop: 68,
          color: C.muted,
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: 2.3,
          opacity: end.opacity,
          transform: end.transform,
        }}
      >
        СПАСИБО ЗА ПУТЕШЕСТВИЕ · СПАСИБО ЗА ПУТЕШЕСТВИЕ
      </div>
    </Scene>
  );
};

export const SaintPetersburgMetro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const fadeOut = interpolate(time, [FADE_OUT.start, FADE_OUT.end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <PageTexture />
      <Intro />
      <Network />
      <History />
      <MapScene />
      <Depth />
      <Architecture />
      <Service />
      <Outro />
      <FinePrint />
      <BilingualSubtitles />
      <Audio src={staticFile('voiceover/narration.ru.mp3')} volume={1} />
      <AbsoluteFill style={{zIndex: 40, background: '#000', opacity: fadeOut, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
