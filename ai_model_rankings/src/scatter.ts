export const SCATTER_W = 952;
export const SCATTER_H = 800;
const PADDING = 60;
const LABEL_GAP = 16;
const LABEL_WIDTH = 280;

type Point = {speed: number | null; score: number};

/** Scale the complete snapshot into the plot, including future higher scores. */
export function layoutScatter(points: readonly Point[]) {
  const maxSpeed = Math.max(1, ...points.map((p) => p.speed ?? 0));
  const minScore = Math.min(0, ...points.map((p) => p.score));
  const maxScore = Math.max(minScore + 1, ...points.map((p) => p.score));
  return points.map((point) => {
    const x = PADDING + ((point.speed ?? 0) / maxSpeed) * (SCATTER_W - 2 * PADDING);
    const y = SCATTER_H - PADDING - ((point.score - minScore) / (maxScore - minScore)) * (SCATTER_H - 2 * PADDING);
    // Place labels on the side with more room; wrap long model names.
    const labelOnLeft = x > SCATTER_W / 2;
    const labelLeft = labelOnLeft ? x - LABEL_GAP - LABEL_WIDTH : x + LABEL_GAP;
    return {x, y, labelLeft, labelWidth: LABEL_WIDTH, labelOnLeft};
  });
}
