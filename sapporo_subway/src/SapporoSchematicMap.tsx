import React from 'react';

/**
 * 札幌市営地下鉄 示意地图（schematic map）——手绘风格，非地理精确。
 * 布局：三线放射状，于都心大通站（三线交汇）与さっぽろ站（南北/东丰）相交。
 *   南北線（緑 N）：x=540 纵贯，北=麻生 → 南=真駒内。
 *   東西線（橙 T）：y=990 横贯，西=宮の沢 → 東=新さっぽろ。
 *   東豊線（空色 H）：斜贯，北=栄町 → 南=福住；核心段落入 x=540 与南北重合，
 *                    途经さっぽろ(540,900)与大通(540,990)两个共享换乘点。
 * 事实依据：系统 48km/46站；南北 14.3km/16站、东西 20.1km/19站、东丰 13.6km/14站；
 *           全部案内轨道式（中央橡胶胎，“札幌方式”），1971/1976/1988 依次开线。
 */

export const C = {
  bgDeep: '#081120',
  bgTop: '#0d1f3c',
  grid: 'rgba(120,160,220,0.07)',
  namboku: '#00ac84',
  nambokuGlow: 'rgba(0,172,132,0.35)',
  tozai: '#fda44a',
  tozaiGlow: 'rgba(253,164,74,0.35)',
  toho: '#00a4e4',
  tohoGlow: 'rgba(0,164,228,0.35)',
  station: '#e8eef8',
  label: '#c3d2ea',
  dim: '#5b6f92',
  snow: '#dce9f7',
};

interface Station {
  name: string;
  x: number;
  y: number;
  labelSide: 'left' | 'right' | 'top' | 'bottom';
  interchange?: boolean;
  anchor?: 'start' | 'middle' | 'end';
}

/** 南北線（自北→南，麻生→真駒内） */
const N_STATIONS: Station[] = [
  {name: '麻生', x: 540, y: 620, labelSide: 'left'},
  {name: '北24条', x: 540, y: 720, labelSide: 'right'},
  {name: '北18条', x: 540, y: 820, labelSide: 'left'},
  {name: 'さっぽろ', x: 540, y: 900, labelSide: 'right', interchange: true},
  {name: '大通', x: 540, y: 990, labelSide: 'left', interchange: true},
  {name: 'すすきの', x: 540, y: 1080, labelSide: 'right'},
  {name: '中島公園', x: 540, y: 1170, labelSide: 'left'},
  {name: '幌平橋', x: 540, y: 1260, labelSide: 'right'},
  {name: '南平岸', x: 540, y: 1350, labelSide: 'left'},
  {name: '真駒内', x: 540, y: 1440, labelSide: 'right'},
];

/** 東西線（自西→東，宮の沢→新さっぽろ） */
const T_STATIONS: Station[] = [
  {name: '宮の沢', x: 300, y: 990, labelSide: 'bottom'},
  {name: '発寒南', x: 380, y: 990, labelSide: 'top'},
  {name: '琴似', x: 460, y: 990, labelSide: 'bottom'},
  {name: '大通', x: 540, y: 990, labelSide: 'top', interchange: true},
  {name: '菊水', x: 620, y: 990, labelSide: 'bottom'},
  {name: '白石', x: 700, y: 990, labelSide: 'top'},
  {name: '南郷7丁目', x: 780, y: 990, labelSide: 'bottom'},
  {name: '新さっぽろ', x: 860, y: 990, labelSide: 'top'},
];

/** 東豊線（自北→南，栄町→福住）；核心段与南北线重合，共享さっぽろ・大通 */
const H_STATIONS: Station[] = [
  {name: '栄町', x: 650, y: 760, labelSide: 'top'},
  {name: '環状通東', x: 595, y: 830, labelSide: 'right'},
  {name: '東区役所前', x: 560, y: 865, labelSide: 'left'},
  {name: 'さっぽろ', x: 540, y: 900, labelSide: 'right', interchange: true},
  {name: '大通', x: 540, y: 990, labelSide: 'left', interchange: true},
  {name: '豊水すすきの', x: 500, y: 1060, labelSide: 'top'},
  {name: '月寒中央', x: 460, y: 1140, labelSide: 'right'},
  {name: '福住', x: 420, y: 1230, labelSide: 'left'},
];

/** 由站点数组生成折线 path */
function polyline(stations: {x: number; y: number}[]): string {
  return stations.map((s, i) => `${i === 0 ? 'M' : 'L'}${s.x} ${s.y}`).join(' ');
}

interface SchematicMapProps {
  emphasize?: 'n' | 't' | 'h';
  nDrawProgress?: number;
  tDrawProgress?: number;
  hDrawProgress?: number;
  showLabels?: boolean;
}

const Stroke: React.FC<{d: string; color: string; glow: string; width: number; progress: number; opacity?: number}> = ({
  d,
  color,
  glow,
  width,
  progress,
  opacity = 1,
}) => (
  <>
    <path
      d={d}
      fill="none"
      stroke={glow}
      strokeWidth={width * 3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      style={{opacity: opacity * 0.6, filter: 'blur(6px)'}}
    />
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      style={{opacity}}
    />
  </>
);

/** 按绘制进度渲染一组车站 */
function renderStations(
  keyPrefix: string,
  stations: Station[],
  active: boolean,
  color: string,
  progress: number,
): React.ReactNode[] {
  return stations.map((s, i) => {
    const reached = progress >= (i + 1) / stations.length;
    if (!active || !reached) return null;
    return (
      <g key={`${keyPrefix}${i}`}>
        <circle cx={s.x} cy={s.y} r={s.interchange ? 15 : 10} fill={C.bgDeep} stroke={color} strokeWidth={4} />
        {s.interchange && <circle cx={s.x} cy={s.y} r={6} fill={color} />}
      </g>
    );
  });
}

export const SapporoSchematicMap: React.FC<SchematicMapProps> = ({
  emphasize = 'n',
  nDrawProgress = 1,
  tDrawProgress = 1,
  hDrawProgress = 1,
  showLabels = true,
}) => {
  const n = emphasize === 'n';
  const t = emphasize === 't';
  const h = emphasize === 'h';
  const nDim = !n ? 0.22 : 1;
  const tDim = !t ? 0.22 : 1;
  const hDim = !h ? 0.22 : 1;

  const shown = emphasize === 'n' ? N_STATIONS : emphasize === 't' ? T_STATIONS : H_STATIONS;

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.bgTop} />
          <stop offset="100%" stopColor={C.bgDeep} />
        </linearGradient>
      </defs>

      <rect width={1080} height={1920} fill="url(#bg)" />

      {Array.from({length: 26}).map((_, i) => (
        <line key={`v${i}`} x1={i * 45} y1={0} x2={i * 45} y2={1920} stroke={C.grid} strokeWidth={1} />
      ))}
      {Array.from({length: 44}).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 45} x2={1080} y2={i * 45} stroke={C.grid} strokeWidth={1} />
      ))}

      {/* 雪片装饰 */}
      {[
        {x: 120, y: 260},
        {x: 930, y: 380},
        {x: 200, y: 1650},
        {x: 880, y: 1550},
      ].map((p, i) => (
        <text key={`snow${i}`} x={p.x} y={p.y} fill="rgba(220,233,247,0.10)" fontSize={90} textAnchor="middle">
          ❄
        </text>
      ))}

      <text x={540} y={1790} fill="rgba(160,190,235,0.10)" fontSize={110} fontWeight={800} letterSpacing={20} textAnchor="middle">
        SAPPORO
      </text>

      <Stroke d={polyline(H_STATIONS)} color={C.toho} glow={C.tohoGlow} width={h ? 13 : 9} progress={hDrawProgress} opacity={hDim} />
      <Stroke d={polyline(T_STATIONS)} color={C.tozai} glow={C.tozaiGlow} width={t ? 13 : 9} progress={tDrawProgress} opacity={tDim} />
      <Stroke d={polyline(N_STATIONS)} color={C.namboku} glow={C.nambokuGlow} width={n ? 15 : 9} progress={nDrawProgress} opacity={nDim} />

      {renderStations('s1', N_STATIONS, n, C.namboku, nDrawProgress)}
      {renderStations('s2', T_STATIONS, t, C.tozai, tDrawProgress)}
      {renderStations('s3', H_STATIONS, h, C.toho, hDrawProgress)}

      {showLabels &&
        shown.map((s, i) => {
          const tx = s.labelSide === 'left' ? s.x - 22 : s.labelSide === 'right' ? s.x + 22 : s.x;
          const ty = s.labelSide === 'top' ? s.y - 26 : s.labelSide === 'bottom' ? s.y + 36 : s.y + 6;
          const anchor = s.anchor ?? (s.labelSide === 'left' ? 'end' : s.labelSide === 'right' ? 'start' : 'middle');
          return (
            <text
              key={`t${i}`}
              x={tx}
              y={ty}
              fill={s.interchange ? '#ffffff' : C.label}
              fontSize={s.interchange ? 21 : 18}
              fontWeight={s.interchange ? 700 : 500}
              textAnchor={anchor}
            >
              {s.name}
            </text>
          );
        })}
    </svg>
  );
};
