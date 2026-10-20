import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneId, sceneById} from './timing';

const islands = [
  {name: '歯舞群島', path: 'M205 1360c20-14 52-9 67 7 10 11-1 26-23 24-21-2-54-16-44-31z', lx: 114, ly: 1410},
  {name: '色丹島', path: 'M315 1245c34-24 99-17 121 11 18 24-11 49-55 46-44-2-88-29-66-57z', lx: 180, ly: 1260},
  {name: '国後島', path: 'M355 875c35-73 102-152 160-204 31-27 63-14 50 24-28 80-85 194-146 252-31 29-86-21-64-72z', lx: 180, ly: 845},
  {name: '択捉島', path: 'M565 560c46-105 154-249 252-344 42-40 78-29 60 25-35 103-151 272-248 364-41 38-90 14-64-45z', lx: 470, ly: 500},
];

/**
 * Conceptual map of the four islands (west → east: Habomai, Shikotan, Kunashiri, Etorofu).
 * `revealAt` gives, per island, the seconds into the scene at which it appears, so the
 * map can follow the narration; without it the islands appear in a quick stagger.
 */
export const IslandMap: React.FC<{sceneId: SceneId; labels?: boolean; width?: number; revealAt?: number[]}> = ({
  sceneId,
  labels = true,
  width = 900,
  revealAt,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame / fps - sceneById(sceneId).start;
  const dash = interpolate(local, [0.2, 2.2], [1800, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lastShown = revealAt ? revealAt.filter((t) => local >= t).length - 1 : -1;
  return (
    <svg viewBox="0 0 940 1520" style={{width, height: (width * 1520) / 940, overflow: 'visible'}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="13" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffc857"/><stop offset="1" stopColor="#e76f51"/></linearGradient>
      </defs>
      <path d="M-30 1510c63-118 151-175 254-191 74-12 128 39 86 90-48 58-101 96-161 131H-30z" fill="#476072" opacity=".7"/>
      <text x="12" y="1480" fill="#a9bbc7" fontSize="34" fontWeight="700">北海道・根室</text>
      <path d="M170 1440C360 1140 504 856 918 105" fill="none" stroke="#ffc857" strokeWidth="3" strokeDasharray="9 15" opacity=".35"/>
      {islands.map((island, index) => {
        const start = revealAt ? revealAt[index] : index * 0.28;
        const p = Math.max(0, Math.min(1, (local - start) / (revealAt ? 0.45 : 0.8)));
        const current = index === lastShown;
        return <g key={island.name} opacity={p}>
          <path d={island.path} fill="url(#land)" filter="url(#glow)" opacity={current ? 0.6 : 0.25}/>
          <path d={island.path} fill="url(#land)" stroke={current ? '#ffffff' : '#ffe8a3'} strokeWidth={current ? 6 : 3}/>
          {labels && <g transform={`translate(${island.lx} ${island.ly})`}>
            <circle r="7" fill="#f9d976"/>
            <line x1="0" y1="0" x2="70" y2="-35" stroke="#f9d976" strokeWidth="2"/>
            <text x="82" y="-28" fill="#f5f1e8" fontSize={current ? 44 : 38} fontWeight="900">{island.name}</text>
          </g>}
        </g>;
      })}
      <path d="M175 1450C350 1130 530 700 920 85" fill="none" stroke="#f9d976" strokeWidth="7" strokeDasharray="1800" strokeDashoffset={dash} opacity=".85"/>
      <text x="680" y="1320" fill="#5cc8d7" fontSize="30" fontWeight="700" transform="rotate(-55 680 1320)">太平洋</text>
      <text x="268" y="440" fill="#5cc8d7" fontSize="30" fontWeight="700" transform="rotate(-55 268 440)">オホーツク海</text>
    </svg>
  );
};
