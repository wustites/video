import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  ALL_PROVINCES,
  END_YEAR,
  START_YEAR,
  TOTAL_FRAMES,
  interpolateData,
  regionColors,
} from './data';
import {fontFamily} from './fonts';

const ROW_H = 76;
const MAX_BAR_W = 550;

export const PopulationCn: React.FC = () => {
  const frame = useCurrentFrame();
  const currentYear = interpolate(frame, [0, TOTAL_FRAMES - 1], [START_YEAR, END_YEAR]);
  const topData = interpolateData(currentYear);
  const maxBirths = topData[0]?.b ?? 100;
  const yearDisplay = Math.floor(currentYear);

  const rankByProvince = new Map(topData.map((item, index) => [item.p, index]));
  const valueByProvince = new Map(topData.map((item) => [item.p, item.b]));

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        fontFamily: `"${fontFamily}", "Noto Sans SC", "Segoe UI", Arial, sans-serif`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
        }}
      >
        <div
          style={{
            color: '#fff',
            fontSize: 48,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          中国各省出生人口变化
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 50}}>
          <span
            style={{
              color: '#e6194b',
              fontSize: 96,
              fontWeight: 'bold',
              minWidth: 200,
              textAlign: 'center',
              fontFamily: `"${fontFamily}", Arial, sans-serif`,
            }}
          >
            {yearDisplay}
          </span>
          <span style={{color: '#aaa', fontSize: 36}}>年</span>
        </div>
        <div style={{width: 900, height: 1200, position: 'relative'}}>
          {ALL_PROVINCES.map((province) => {
            const rank = rankByProvince.get(province);
            const visible = rank !== undefined;
            const value = valueByProvince.get(province) ?? 0;
            return (
              <div
                key={province}
                style={{
                  position: 'absolute',
                  left: 0,
                  width: 900,
                  height: ROW_H,
                  display: 'flex',
                  alignItems: 'center',
                  opacity: visible ? 1 : 0,
                  top: visible ? (rank as number) * ROW_H : 0,
                }}
              >
                <div
                  style={{
                    width: 140,
                    textAlign: 'right',
                    paddingRight: 10,
                    color: '#fff',
                    fontSize: 26,
                    fontWeight: 'bold',
                  }}
                >
                  {province}
                </div>
                <div
                  style={{
                    height: 48,
                    borderRadius: 8,
                    background: regionColors[province] || '#888',
                    width: visible ? (value / maxBirths) * MAX_BAR_W : 0,
                  }}
                />
                <div style={{marginLeft: 14, color: '#fff', fontSize: 22}}>
                  {visible ? `${value} 万` : ''}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 40, color: '#b8b6c8', fontSize: 22}}>
          单位：万人 | 数据来源：国家统计局
        </div>
      </div>
    </AbsoluteFill>
  );
};
