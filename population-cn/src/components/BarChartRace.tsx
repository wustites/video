import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from "remotion";
import { populationData, regionColors } from "../data/population";
import { interpolateData, getTopN } from "../utils/interpolate";
import { ProvinceBar } from "./ProvinceBar";

const TOP_N = 15;

interface RankRecord {
  rank: number;
  prevRank: number;
  frameChanged: number;
}

export const BarChartRace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const startYear = 2000;
  const endYear = 2025;
  const progress = frame / durationInFrames;
  const currentYear = startYear + (endYear - startYear) * progress;

  const interpolatedData = interpolateData(populationData, currentYear);
  const topData = getTopN(interpolatedData, TOP_N);
  const maxBirths = topData[0]?.births ?? 100;

  const currentRankMap: Record<string, number> = {};
  topData.forEach((item, i) => {
    currentRankMap[item.province] = i;
  });

  const rankRecords = useRef<Record<string, RankRecord>>({});

  topData.forEach((item) => {
    const currentRank = currentRankMap[item.province];
    const record = rankRecords.current[item.province];

    if (!record) {
      rankRecords.current[item.province] = {
        rank: currentRank,
        prevRank: currentRank,
        frameChanged: 0,
      };
    } else if (record.rank !== currentRank) {
      rankRecords.current[item.province] = {
        rank: currentRank,
        prevRank: record.rank,
        frameChanged: frame,
      };
    }
  });

  const yearDisplay = Math.floor(currentYear);
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px",
      }}
    >
      <Audio src={staticFile("bgm.mp3")} volume={0.3} startFrom={240} />

      <div style={{ opacity: titleOpacity }}>
        <h1
          style={{
            color: "white",
            fontSize: "48px",
            fontFamily: "Noto Sans CJK SC, Microsoft YaHei, SimHei, sans-serif",
            margin: "0 0 10px 0",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          中国各省出生人口变化
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          marginBottom: "50px",
          gap: "10px",
        }}
      >
        <span
          style={{
            color: "#e6194b",
            fontSize: "96px",
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            minWidth: "200px",
            textAlign: "center",
          }}
        >
          {yearDisplay}
        </span>
        <span
          style={{
            color: "#aaa",
            fontSize: "36px",
            fontFamily: "Noto Sans CJK SC, Microsoft YaHei, SimHei, sans-serif",
          }}
        >
          年
        </span>
      </div>

      <svg width="900" height="1200" viewBox="0 0 900 1200">
        {topData.map((item, index) => {
          const record = rankRecords.current[item.province]!;

          return (
            <ProvinceBar
              key={item.province}
              province={item.province}
              births={item.births}
              maxBirths={maxBirths}
              rank={index}
              prevRank={record.prevRank}
              frameChanged={record.frameChanged}
              color={regionColors[item.province] || "#888"}
            />
          );
        })}
      </svg>

      <div
        style={{
          marginTop: "40px",
          color: "#666",
          fontSize: "22px",
          fontFamily: "Noto Sans CJK SC, Microsoft YaHei, SimHei, sans-serif",
        }}
      >
        单位：万人 | 数据来源：国家统计局
      </div>
    </div>
  );
};
