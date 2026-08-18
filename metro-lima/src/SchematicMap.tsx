import React from 'react';

/**
 * 利马地铁示意地图（schematic map）——手绘风格，非地理精确。
 * 布局：L1 为南北向竖线（南= Villa El Salvador，北= Bayóvar/San Juan de Lurigancho），
 *       L2 为东西向横线（西= Callao，东= Ate），两线在 Veintiocho de Julio 换乘。
 * 事实依据：L1 26 站 34.6km；L2 一期 5 站（Evitamiento→Mercado Santa Anita）2023 年开通，
 *       其余段在建/规划（2028 年全线），换乘站 Veintiocho de Julio 未开通。
 */

export const C = {
  bgDeep: '#081120',
  bgTop: '#0d1f3c',
  grid: 'rgba(120,160,220,0.07)',
  l1: '#ff4d4d',
  l1Glow: 'rgba(255,77,77,0.35)',
  l2: '#ffd75e',
  l2Glow: 'rgba(255,215,94,0.35)',
  under: '#6b7f9e',
  station: '#e8eef8',
  label: '#c3d2ea',
  dim: '#5b6f92',
  ocean: '#1d4a7a',
};

interface Station {
  name: string;
  x: number;
  y: number;
  labelSide: 'left' | 'right' | 'top' | 'bottom';
  interchange?: boolean;
  anchor?: 'start' | 'middle' | 'end'; // 标签锚点覆盖
}

/** L1 站（自南→北），仅示意主要站点 */
const L1_STATIONS: Station[] = [
  {name: 'Villa El Salvador', x: 300, y: 1540, labelSide: 'left'},
  {name: 'Atocongo', x: 300, y: 1440, labelSide: 'right'},
  {name: 'Jorge Chávez', x: 300, y: 1345, labelSide: 'left'},
  {name: 'Angamos', x: 300, y: 1250, labelSide: 'right'},
  {name: 'San Borja Sur', x: 300, y: 1155, labelSide: 'left'},
  {name: 'La Cultura', x: 300, y: 1065, labelSide: 'right'},
  {name: 'Gamarra', x: 300, y: 980, labelSide: 'left'},
  {name: 'Veintiocho de Julio', x: 300, y: 950, labelSide: 'right', interchange: true},
  {name: 'Miguel Grau', x: 300, y: 890, labelSide: 'left'},
  {name: 'Caja de Agua', x: 300, y: 800, labelSide: 'right'},
  {name: 'Pirámide del Sol', x: 300, y: 715, labelSide: 'left'},
  {name: 'San Carlos', x: 300, y: 625, labelSide: 'right'},
  {name: 'Bayóvar', x: 300, y: 520, labelSide: 'left'},
];

/** L2 站（自西→东） */
const L2_STATIONS: Station[] = [
  {name: 'Puerto del Callao', x: 120, y: 950, labelSide: 'bottom'},
  {name: 'Veintiocho de Julio', x: 300, y: 950, labelSide: 'top', interchange: true},
  {name: 'Evitamiento', x: 560, y: 950, labelSide: 'bottom'},
  {name: 'Óvalo Santa Anita', x: 655, y: 950, labelSide: 'top'},
  {name: 'Colectora Industrial', x: 750, y: 950, labelSide: 'bottom'},
  {name: 'Hermilio Valdizán', x: 845, y: 950, labelSide: 'top'},
  {name: 'Mercado Santa Anita', x: 940, y: 950, labelSide: 'bottom'},
  {name: 'Ate (proyectado)', x: 1000, y: 950, labelSide: 'top', anchor: 'end'},
];

/** 由站点数组生成折线 path */
function polyline(stations: {x: number; y: number}[]): string {
  return stations.map((s, i) => `${i === 0 ? 'M' : 'L'}${s.x} ${s.y}`).join(' ');
}

interface SchematicMapProps {
  emphasize?: 'l1' | 'l2';
  lineDrawProgress?: number; // 0..1 L1 绘制进度
  l2DrawProgress?: number; // 0..1 L2 运营段绘制进度
  showL2Under?: boolean; // 是否显示 L2 在建段
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
    {/* 霓虹光晕 */}
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
    {/* 主线 */}
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

export const SchematicMap: React.FC<SchematicMapProps> = ({
  emphasize = 'l1',
  lineDrawProgress = 1,
  l2DrawProgress = 1,
  showL2Under = true,
  showLabels = true,
}) => {
  const l1 = emphasize === 'l1';
  const l2 = emphasize === 'l2';
  const l1Dim = !l1 ? 0.22 : 1;
  const l2Dim = !l2 ? 0.22 : 1;

  // L2 段坐标：在建段（Callao→Evitamiento，虚线）、运营段（Evitamiento→Mercado Santa Anita，实线）、规划延伸（Mercado Santa Anita→Ate，虚线）
  const l2UnderPts = L2_STATIONS.slice(0, 3); // Puerto del Callao → Veintiocho de Julio → Evitamiento
  const l2OpPts = L2_STATIONS.slice(2, 7); // Evitamiento → … → Mercado Santa Anita（运营）
  const l2PlanPts = L2_STATIONS.slice(6); // Mercado Santa Anita → Ate（规划延伸）

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.bgTop} />
          <stop offset="100%" stopColor={C.bgDeep} />
        </linearGradient>
      </defs>

      {/* 背景渐变 */}
      <rect width={1080} height={1920} fill="url(#bg)" />

      {/* 城市街区网格（装饰） */}
      {Array.from({length: 26}).map((_, i) => (
        <line key={`v${i}`} x1={i * 45} y1={0} x2={i * 45} y2={1920} stroke={C.grid} strokeWidth={1} />
      ))}
      {Array.from({length: 44}).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 45} x2={1080} y2={i * 45} stroke={C.grid} strokeWidth={1} />
      ))}

      {/* 太平洋示意（左侧淡蓝竖条 + 标注） */}
      <rect x={30} y={250} width={10} height={1400} rx={5} fill={C.ocean} opacity={0.5} />
      <text
        x={30}
        y={220}
        fill={C.dim}
        fontSize={22}
        fontWeight={600}
        letterSpacing={6}
        textAnchor="middle"
        style={{writingMode: 'vertical-rl'}}
      >
        OCÉANO PACÍFICO
      </text>

      {/* LIMA 水印 */}
      <text x={860} y={1760} fill="rgba(160,190,235,0.10)" fontSize={150} fontWeight={800} letterSpacing={18} textAnchor="middle">
        LIMA
      </text>
      <text x={860} y={1860} fill="rgba(160,190,235,0.10)" fontSize={150} fontWeight={800} letterSpacing={18} textAnchor="middle">
        LIMA
      </text>

      {/* L2 在建段（虚线） */}
      {showL2Under && (
        <path
          d={polyline(l2UnderPts)}
          fill="none"
          stroke={C.under}
          strokeWidth={7}
          strokeDasharray="2 18"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDashoffset={0}
          style={{opacity: l2 ? 0.85 : l2Dim * 0.6}}
        />
      )}

      {/* L2 规划延伸段（Ate 方向，更淡的虚线） */}
      {showL2Under && (
        <path
          d={polyline(l2PlanPts)}
          fill="none"
          stroke={C.under}
          strokeWidth={6}
          strokeDasharray="2 14"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{opacity: l2 ? 0.45 : l2Dim * 0.3}}
        />
      )}

      {/* L2 主线（运营段 + 规划延伸，实线绘制动画） */}
      <Stroke
        d={polyline(l2OpPts)}
        color={C.l2}
        glow={C.l2Glow}
        width={l2 ? 13 : 9}
        progress={l2DrawProgress}
        opacity={l2Dim}
      />

      {/* L1 主线（绘制动画） */}
      <Stroke d={polyline(L1_STATIONS)} color={C.l1} glow={C.l1Glow} width={l1 ? 15 : 9} progress={lineDrawProgress} opacity={l1Dim} />

      {/* L2 车站 */}
      {L2_STATIONS.map((s, i) => {
        const opPts = L2_STATIONS.slice(2, 7);
        const isOp = opPts.some((o) => o.name === s.name);
        const isUnder = L2_STATIONS.slice(0, 3).some((o) => o.name === s.name);
        const isPlan = L2_STATIONS.slice(6).some((o) => o.name === s.name);
        // 运营站进度：Evitamiento(全索引2) → Mercado(全索引6)，相对 0..1
        const reached = isOp ? l2DrawProgress >= (i - 2) / (opPts.length - 1) : true;
        if (!l2 || !reached) return null;
        if (isOp) {
          // 运营站：黄色，随绘制动画点亮
          return (
            <g key={`s2${i}`} style={{opacity: 1}}>
              <circle cx={s.x} cy={s.y} r={s.interchange ? 16 : 10} fill={C.bgDeep} stroke={C.l2} strokeWidth={4} />
              {s.interchange && <circle cx={s.x} cy={s.y} r={6} fill={C.l2} />}
            </g>
          );
        }
        if ((isUnder || isPlan) && showL2Under) {
          // 在建/规划站：灰点
          return (
            <g key={`s2${i}`} style={{opacity: 0.7}}>
              <circle cx={s.x} cy={s.y} r={s.interchange ? 14 : 9} fill={C.bgDeep} stroke={C.under} strokeWidth={3.5} strokeDasharray={s.interchange ? undefined : '3 4'} />
            </g>
          );
        }
        return null;
      })}

      {/* L1 车站 */}
      {L1_STATIONS.map((s, i) => {
        const reached = lineDrawProgress >= (i + 1) / L1_STATIONS.length;
        if (!reached) return null;
        const isInterchange = s.interchange;
        return (
          <g key={`s1${i}`} style={{opacity: l1 ? 1 : 0.5}}>
            <circle cx={s.x} cy={s.y} r={isInterchange ? 16 : 10} fill={C.bgDeep} stroke={C.l1} strokeWidth={4} />
            {isInterchange && <circle cx={s.x} cy={s.y} r={6} fill={C.l1} />}
          </g>
        );
      })}

      {/* 站名标签：仅显示当前强调线路的站名，避免跨线重叠 */}
      {showLabels &&
        (emphasize === 'l1' ? L1_STATIONS : L2_STATIONS).map((s, i) => {
          const isL1 = emphasize === 'l1';
          const isInterchange = s.interchange;
          const l1Reached = isL1 ? lineDrawProgress >= (i + 1) / L1_STATIONS.length : true;
          if (!l1Reached) return null;
          const dim = isL1 ? (l1 ? 1 : 0.45) : l2 ? 1 : 0.45;
          const tx =
            s.labelSide === 'left' ? s.x - 22 : s.labelSide === 'right' ? s.x + 22 : s.x;
          const ty =
            s.labelSide === 'top' ? s.y - 26 : s.labelSide === 'bottom' ? s.y + 36 : s.y + 6;
          const anchor = s.anchor ?? (s.labelSide === 'left' ? 'end' : s.labelSide === 'right' ? 'start' : 'middle');
          return (
            <text
              key={`t${i}`}
              x={tx}
              y={ty}
              fill={isInterchange ? '#ffffff' : C.label}
              fontSize={isInterchange ? 21 : 18}
              fontWeight={isInterchange ? 700 : 500}
              textAnchor={anchor}
              style={{opacity: dim}}
            >
              {s.name}
            </text>
          );
        })}
    </svg>
  );
};
