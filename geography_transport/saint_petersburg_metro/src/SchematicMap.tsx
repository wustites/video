import React from 'react';

export type MetroLine = 1 | 2 | 3 | 4 | 5 | 6;
export type MapEmphasis = MetroLine | 'all';

export const LINE_COLORS: Record<MetroLine, string> = {
  1: '#e45058',
  2: '#4d9be8',
  3: '#53bf8a',
  4: '#f0a052',
  5: '#a879e8',
  6: '#45c4c7',
};

const LINE_GLOWS: Record<MetroLine, string> = {
  1: 'rgba(228, 80, 88, 0.34)',
  2: 'rgba(77, 155, 232, 0.34)',
  3: 'rgba(83, 191, 138, 0.34)',
  4: 'rgba(240, 160, 82, 0.34)',
  5: 'rgba(168, 121, 232, 0.34)',
  6: 'rgba(69, 196, 199, 0.34)',
};

interface Station {
  name: string;
  x: number;
  y: number;
  side: 'left' | 'right' | 'top' | 'bottom';
  transfer?: boolean;
  major?: boolean;
}

const LINE_PATHS: Record<MetroLine, string> = {
  1: 'M 540 350 L 540 1530',
  2: 'M 300 500 L 425 735 L 540 910 L 650 1120 L 820 1460',
  3: 'M 175 950 L 905 950',
  4: 'M 840 400 L 700 650 L 610 910 L 430 1180 L 250 1480',
  5: 'M 350 1370 L 470 1280 L 560 1180 L 670 1080 L 780 970',
  6: 'M 300 1480 L 500 1370',
};

const STATIONS: Record<MetroLine, Station[]> = {
  1: [
    {name: 'Девяткино', x: 540, y: 350, side: 'left', major: true},
    {name: 'Пл. Восстания', x: 540, y: 650, side: 'right', transfer: true},
    {name: 'Адмиралтейская', x: 540, y: 910, side: 'left', transfer: true},
    {name: 'Автово', x: 540, y: 1180, side: 'right'},
    {name: 'Проспект Славы', x: 540, y: 1530, side: 'left', major: true},
  ],
  2: [
    {name: 'Удельная', x: 300, y: 500, side: 'left', major: true},
    {name: 'Петроградская', x: 425, y: 735, side: 'right'},
    {name: 'Пл. Восстания', x: 540, y: 910, side: 'right', transfer: true},
    {name: 'Технологический ин-т', x: 650, y: 1120, side: 'left', transfer: true},
    {name: 'Парк Победы', x: 820, y: 1460, side: 'right', major: true},
  ],
  3: [
    {name: 'Беговая', x: 175, y: 950, side: 'left', major: true},
    {name: 'Приморская', x: 390, y: 950, side: 'left'},
    {name: 'Невский проспект', x: 640, y: 950, side: 'top', transfer: true},
    {name: 'Литейный проспект', x: 790, y: 950, side: 'bottom'},
    {name: 'Достоевская', x: 905, y: 950, side: 'right', major: true},
  ],
  4: [
    {name: 'Лахта', x: 840, y: 400, side: 'right', major: true},
    {name: 'Обуховская', x: 700, y: 650, side: 'left'},
    {name: 'Спасская', x: 610, y: 910, side: 'left', transfer: true},
    {name: 'Спортивная', x: 430, y: 1180, side: 'right', transfer: true},
    {name: 'Удельная', x: 250, y: 1480, side: 'left'},
  ],
  5: [
    {name: 'Комендантский проспект', x: 350, y: 1370, side: 'left', major: true},
    {name: 'Пионерская', x: 470, y: 1280, side: 'right'},
    {name: 'Спортивная', x: 560, y: 1180, side: 'top', transfer: true},
    {name: 'Чкаловская', x: 670, y: 1080, side: 'bottom'},
    {name: 'Приморская', x: 780, y: 970, side: 'right', transfer: true},
  ],
  6: [
    {name: 'Юго-Западная', x: 300, y: 1480, side: 'left', major: true},
    {name: 'Путиловская', x: 500, y: 1370, side: 'right', major: true},
  ],
};

const LINE_ORDER: MetroLine[] = [1, 2, 3, 4, 5, 6];

const lineName = (line: MetroLine): string => {
  const names: Record<MetroLine, string> = {
    1: 'Красно-Выборгская',
    2: 'Московско-Петроградская',
    3: 'Невско-Василеостровская',
    4: 'Лахтинско-Правобережная',
    5: 'Фрунзенско-Приморская',
    6: 'Красносельско-Калининская',
  };
  return names[line];
};

const labelPosition = (station: Station) => {
  if (station.side === 'left') return {x: station.x - 20, y: station.y + 6, anchor: 'end' as const};
  if (station.side === 'right') return {x: station.x + 20, y: station.y + 6, anchor: 'start' as const};
  if (station.side === 'top') return {x: station.x, y: station.y - 25, anchor: 'middle' as const};
  return {x: station.x, y: station.y + 36, anchor: 'middle' as const};
};

const Stroke: React.FC<{
  d: string;
  color: string;
  glow: string;
  width: number;
  progress: number;
  opacity: number;
}> = ({d, color, glow, width, progress, opacity}) => (
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
      style={{opacity: opacity * 0.42}}
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

export interface SchematicMapProps {
  emphasis?: MapEmphasis;
  progress?: Partial<Record<MetroLine, number>>;
  showLabels?: boolean;
  /** Lightweight mode for high-resolution renders: lines and major nodes only. */
  compact?: boolean;
}

export const SchematicMap: React.FC<SchematicMapProps> = ({
  emphasis = 'all',
  progress = {},
  showLabels = true,
  compact = false,
}) => {
  const progressFor = (line: MetroLine) => Math.max(0, Math.min(1, progress[line] ?? 1));
  const isActive = (line: MetroLine) => emphasis === 'all' || emphasis === line;

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" role="img" aria-label="Схема петербургского метрополитена">
      <defs>
        <linearGradient id="spb-map-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12213b" />
          <stop offset="55%" stopColor="#091321" />
          <stop offset="100%" stopColor="#060b16" />
        </linearGradient>
        <radialGradient id="spb-map-glow" cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor="rgba(55, 104, 145, 0.22)" />
          <stop offset="100%" stopColor="rgba(5, 10, 20, 0)" />
        </radialGradient>
        <filter id="spb-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={1080} height={1920} fill="url(#spb-map-bg)" />
      <rect width={1080} height={1920} fill="url(#spb-map-glow)" />

      {!compact && Array.from({length: 25}).map((_, index) => (
        <line key={`v-${index}`} x1={index * 45} y1={0} x2={index * 45} y2={1920} stroke="rgba(137, 178, 218, 0.065)" strokeWidth={1} />
      ))}
      {!compact && Array.from({length: 44}).map((_, index) => (
        <line key={`h-${index}`} x1={0} y1={index * 45} x2={1080} y2={index * 45} stroke="rgba(137, 178, 218, 0.065)" strokeWidth={1} />
      ))}

      {!compact && (
        <>
          {/* Невa: a quiet, schematic river ribbon. */}
          <path
            d="M -30 820 C 150 745 275 890 410 835 C 575 765 680 875 820 820 C 940 772 1020 835 1120 790"
            fill="none"
            stroke="#2b5c78"
            strokeWidth={28}
            strokeLinecap="round"
            opacity={0.48}
          />
          <path
            d="M -30 820 C 150 745 275 890 410 835 C 575 765 680 875 820 820 C 940 772 1020 835 1120 790"
            fill="none"
            stroke="#76b4ca"
            strokeWidth={2}
            strokeDasharray="3 18"
            strokeLinecap="round"
            opacity={0.55}
          />
          <text x={930} y={790} fill="rgba(157, 207, 224, 0.58)" fontSize={22} fontWeight={700} letterSpacing={7} textAnchor="middle">
            НЕВА
          </text>
        </>
      )}

      {!compact && (
        <>
          {/* A low skyline silhouette anchors the lower edge. */}
          <path
            d="M 0 1700 L 0 1610 L 95 1610 L 95 1525 L 145 1525 L 145 1660 L 220 1660 L 220 1550 L 270 1550 L 270 1640 L 345 1640 L 345 1490 L 420 1490 L 420 1610 L 500 1610 L 500 1540 L 560 1540 L 560 1680 L 650 1680 L 650 1500 L 720 1500 L 720 1620 L 800 1620 L 800 1560 L 855 1560 L 855 1660 L 940 1660 L 940 1535 L 995 1535 L 995 1610 L 1080 1610 L 1080 1920 L 0 1920 Z"
            fill="rgba(3, 8, 16, 0.46)"
          />
          <text x={540} y={1790} fill="rgba(191, 214, 235, 0.09)" fontSize={116} fontWeight={800} letterSpacing={20} textAnchor="middle">
            PETERSBURG
          </text>
        </>
      )}

      {/* Lines are rendered first so station markers remain crisp. */}
      {LINE_ORDER.map((line) => {
        const active = isActive(line);
        return (
          <Stroke
            key={`line-${line}`}
            d={LINE_PATHS[line]}
            color={LINE_COLORS[line]}
            glow={LINE_GLOWS[line]}
            width={active ? 14 : 8}
            progress={progressFor(line)}
            opacity={active ? 1 : 0.17}
          />
        );
      })}

      {/* All station dots, with interchange nodes emphasized. */}
      {LINE_ORDER.map((line) => {
        const active = isActive(line);
        const progressValue = progressFor(line);
        return STATIONS[line].map((station, index) => {
          const reached = progressValue >= (index + 1) / STATIONS[line].length;
          if (!active || !reached || (compact && !station.major && !station.transfer)) return null;
          return (
            <g key={`station-${line}-${index}`}>
              <circle
                cx={station.x}
                cy={station.y}
                r={station.transfer ? 15 : 9}
                fill="#081321"
                stroke={LINE_COLORS[line]}
                strokeWidth={station.transfer ? 4 : 3.5}
              />
              {station.transfer && <circle cx={station.x} cy={station.y} r={5} fill={LINE_COLORS[line]} />}
            </g>
          );
        });
      })}

      {showLabels &&
        LINE_ORDER.map((line) => {
          const active = isActive(line);
          if (!active) return null;
          return STATIONS[line].map((station, index) => {
            if (emphasis === 'all' && !station.major) return null;
            if (compact && !station.major) return null;
            const {x, y, anchor} = labelPosition(station);
            const progressValue = progressFor(line);
            if (progressValue < (index + 1) / STATIONS[line].length) return null;
            return (
              <text
                key={`label-${line}-${index}`}
                x={x}
                y={y}
                fill={station.transfer ? '#ffffff' : '#c9d8e9'}
                fontSize={station.transfer ? 20 : 17}
                fontWeight={station.transfer ? 750 : 500}
                textAnchor={anchor}
                style={{paintOrder: 'stroke', stroke: '#081321', strokeWidth: 5, strokeLinejoin: 'round'}}
              >
                {station.name}
              </text>
            );
          });
        })}

      {!compact && (
        /* Small line legend in the corner keeps the color coding self-explanatory. */
        <g transform="translate(72 1640)" opacity={0.82}>
          <rect x={-20} y={-30} width={292} height={52} rx={18} fill="rgba(5, 12, 24, 0.72)" stroke="rgba(135, 180, 220, 0.22)" />
          <text x={0} y={3} fill="#d6e4f2" fontSize={18} fontWeight={700} letterSpacing={2}>
            {emphasis === 'all' ? '6 ЛИНИЙ · СХЕМАТИЧНО' : `ЛИНИЯ ${emphasis}`}
          </text>
        </g>
      )}
    </svg>
  );
};

export const MetroLineName = ({line}: {line: MetroLine}) => (
  <span style={{color: LINE_COLORS[line]}}>{lineName(line)}</span>
);
