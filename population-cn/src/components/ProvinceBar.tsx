import React from "react";
import { useCurrentFrame } from "remotion";

interface ProvinceBarProps {
  province: string;
  births: number;
  maxBirths: number;
  rank: number;
  prevRank: number;
  frameChanged: number;
  color: string;
}

export const ProvinceBar: React.FC<ProvinceBarProps> = ({
  province,
  births,
  maxBirths,
  rank,
  prevRank,
  frameChanged,
  color,
}) => {
  const frame = useCurrentFrame();

  const maxWidth = 550;
  const width = (births / maxBirths) * maxWidth;

  const targetY = rank * 76;
  const prevY = prevRank * 76;
  const isSwapping = rank !== prevRank;

  const framesSinceChange = frame - frameChanged;
  const animDuration = 20;

  let animatedY = targetY;

  if (isSwapping && framesSinceChange < animDuration) {
    const t = framesSinceChange / animDuration;
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    animatedY = prevY + (targetY - prevY) * ease;
  }

  return (
    <g transform={`translate(0, ${animatedY})`}>
      <text
        x={140}
        y={32}
        textAnchor="end"
        fill="white"
        fontSize={26}
        fontFamily="Noto Sans CJK SC, Microsoft YaHei, SimHei, sans-serif"
        fontWeight="bold"
      >
        {province}
      </text>
      <rect
        x={150}
        y={4}
        width={width}
        height={48}
        fill={color}
        rx={8}
        ry={8}
      />
      <text
        x={150 + width + 14}
        y={38}
        fill="white"
        fontSize={22}
        fontFamily="Noto Sans CJK SC, Microsoft YaHei, SimHei, sans-serif"
      >
        {births} 万
      </text>
    </g>
  );
};
