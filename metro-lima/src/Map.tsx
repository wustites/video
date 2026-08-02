import React, {useMemo} from 'react';
import {geoMercator, geoPath} from 'd3-geo';
import {continueRender, delayRender, staticFile} from 'remotion';
import type {FeatureCollection, MultiLineString, LineString, Point} from 'geojson';

interface MapData {
  lines: FeatureCollection<LineString>;
  l2Under: FeatureCollection<MultiLineString>;
  stations: FeatureCollection<Point>;
  coastline: FeatureCollection<MultiLineString>;
}

export type {MapData};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function useMapData(): MapData | null {
  const [data, setData] = React.useState<MapData | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    const handle = delayRender('Loading map geojson data');
    Promise.all([
      fetchJson<FeatureCollection<LineString>>(staticFile('data/lines.geojson')),
      fetchJson<FeatureCollection<MultiLineString>>(staticFile('data/lines_l2_under.geojson')),
      fetchJson<FeatureCollection<Point>>(staticFile('data/stations.geojson')),
      fetchJson<FeatureCollection<MultiLineString>>(staticFile('data/coastline.geojson')),
    ])
      .then(([lines, l2Under, stations, coastline]) => {
        if (!cancelled) setData({lines, l2Under, stations, coastline});
      })
      .catch((err) => {
        console.error('Failed to load map data:', err);
        // 渲染 fail-fast，避免静默产出缺失地图的视频
        throw err;
      })
      .finally(() => {
        continueRender(handle);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

export function useMapProjection(data: MapData | null) {
  return useMemo(() => {
    if (!data) return null;
    // 收集所有用于 fitExtent 的几何：海岸线 + 线路（保证地图视野覆盖线路）
    const all: unknown[] = [];
    const push = (fc: FeatureCollection) => {
      for (const f of fc.features) all.push(f.geometry);
    };
    push(data.coastline);
    push(data.lines);
    push(data.l2Under);
    const projection = geoMercator().fitExtent(
      [
        [60, 160],
        [1020, 1700],
      ],
      {type: 'FeatureCollection', features: all.map((geometry) => ({type: 'Feature', geometry}))} as never,
    );
    return {projection, path: geoPath(projection)};
  }, [data]);
}

interface LimaMapProps {
  data?: MapData | null; // 外部注入的数据（顶层单次加载）；缺省时内部自取
  showL2Under?: boolean;
  showLabels?: boolean;
  lineDrawProgress?: number; // 0..1 L1 线路绘制进度
  l2DrawProgress?: number; // 0..1 L2 运营段绘制进度
  emphasize?: 'l1' | 'l2' | 'none';
}

export const LimaMap: React.FC<LimaMapProps> = ({
  data: injectedData,
  showL2Under = true,
  showLabels = true,
  lineDrawProgress = 1,
  l2DrawProgress = 1,
  emphasize = 'none',
}) => {
  const ownData = useMapData();
  const data = injectedData ?? ownData;
  const proj = useMapProjection(data);

  const l1Highlight = emphasize === 'l1';
  const l2Highlight = emphasize === 'l2';

  if (!data || !proj) {
    return <div style={{flex: 1}} />;
  }

  const drawLine = (progress: number, coords: [number, number][], pathFn: (g: unknown) => string | null) => {
    if (progress <= 0) return null;
    if (progress >= 1) return pathFn({type: 'LineString', coordinates: coords});
    // 渐进绘制：取前 N% 的点
    const n = Math.max(2, Math.floor(coords.length * progress));
    return pathFn({type: 'LineString', coordinates: coords.slice(0, n)});
  };

  const l1Coords = data.lines.features.find((f) => f.properties?.ref === 'L1')?.geometry.coordinates ?? [];
  const l2Coords = data.lines.features.find((f) => f.properties?.ref === 'L2')?.geometry.coordinates ?? [];

  const l1Path = drawLine(lineDrawProgress, l1Coords as [number, number][], (g) => proj.path(g as never));
  const l2OpPath = drawLine(l2DrawProgress, l2Coords as [number, number][], (g) => proj.path(g as never));

  const l2UnderPaths = showL2Under
    ? (data.l2Under.features[0]?.geometry.coordinates ?? [])
        .map((c) => proj.path({type: 'LineString', coordinates: c} as never))
    : [];

  const stationPoints = data.stations.features.map((f) => {
    const [x, y] = proj.projection(f.geometry.coordinates as [number, number]) ?? [0, 0];
    return {x, y, name: f.properties?.name ?? '', line: f.properties?.line ?? ''};
  });

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* 海洋背景 */}
        <rect width={1080} height={1920} fill="#0a1626" />
        {/* 海岸线 */}
        <g fill="none" stroke="#274060" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
          {(data.coastline.features[0]?.geometry.coordinates ?? []).map((line, i) => (
            <path key={i} d={proj.path({type: 'LineString', coordinates: line} as never) ?? ''} />
          ))}
        </g>

        {/* L2 在建段（虚线，弱化） */}
        {l2UnderPaths.map((d, i) =>
          d ? (
            <path
              key={`u${i}`}
              d={d}
              fill="none"
              stroke="#8a7d3a"
              strokeWidth={7}
              strokeDasharray="14 14"
              opacity={l2Highlight ? 0.55 : 0.35}
              strokeLinecap="round"
            />
          ) : null,
        )}

        {/* L2 运营段 */}
        {l2OpPath ? (
          <path
            d={l2OpPath}
            fill="none"
            stroke={l2Highlight ? '#ffd75e' : '#c9b458'}
            strokeWidth={l2Highlight ? 16 : 11}
            strokeLinecap="round"
            opacity={l2Highlight ? 1 : 0.85}
          />
        ) : null}

        {/* L1 线路 */}
        {l1Path ? (
          <path
            d={l1Path}
            fill="none"
            stroke={l1Highlight ? '#ff4d4d' : '#e0434a'}
            strokeWidth={l1Highlight ? 16 : 11}
            strokeLinecap="round"
            opacity={l1Highlight ? 1 : 0.85}
          />
        ) : null}

        {/* 车站 */}
        {stationPoints.map((s, i) => {
          const isL1 = s.line.includes('Línea 1') || s.line.includes('Linea 1');
          const isL2 = !isL1 && (s.line === '' || s.line.includes('2'));
          const visible = (emphasize === 'l1' && isL1) || (emphasize === 'l2' && isL2) || emphasize === 'none';
          if (!visible) return null;
          const color = isL2 ? '#ffd75e' : '#ffffff';
          return (
            <g key={i}>
              <circle cx={s.x} cy={s.y} r={isL1 && emphasize === 'l1' ? 13 : 9} fill="#0a1626" stroke={color} strokeWidth={5} />
            </g>
          );
        })}

        {/* 站名标签 */}
        {showLabels &&
          stationPoints.map((s, i) => {
            const isL1 = s.line.includes('Línea 1') || s.line.includes('Linea 1');
            const isL2 = !isL1;
            const visible =
              (emphasize === 'l1' && isL1) || (emphasize === 'l2' && isL2) || emphasize === 'none';
            if (!visible || s.name.length < 3) return null;
            return (
              <text key={`t${i}`} x={s.x} y={s.y - 18} fill="#9fb2d4" fontSize={17} fontWeight={600} textAnchor="middle">
                {s.name}
              </text>
            );
          })}
      </svg>
    </div>
  );
};
