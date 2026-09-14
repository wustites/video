import {useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;

/**
 * 场景时间轴（秒），与旁白 9 段逐段对齐。
 * 实测段落时长见 public/voiceover/segment-durations.json：
 * [10.968, 10.392, 12.072, 11.832, 8.208, 8.904, 7.944, 8.352, 11.064]
 */
export const SCENES = [
  {id: 'intro', start: 0.0, end: 11.85},
  {id: 'founding', start: 10.55, end: 22.05},
  {id: 'fame', start: 20.94, end: 34.22},
  {id: 'ssl', start: 33.02, end: 46.0},
  {id: 'workers', start: 44.85, end: 54.25},
  {id: 'dns', start: 53.08, end: 63.15},
  {id: 'ipo', start: 61.98, end: 71.0},
  {id: 'expansion', start: 69.91, end: 79.45},
  {id: 'today', start: 78.3, end: 90.0},
] as const;

export const TOTAL_SECONDS = 90;

/** 场景整体不透明度（含场景边界的淡入淡出），fade 时长 0.5s */
export function useSceneOpacity(sceneId: string): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const scene = SCENES.find((s) => s.id === sceneId)!;
  const fade = 0.5;
  const {start, end} = scene;
  if (t >= start && t <= end) return 1;
  if (t > start - fade && t < start) return (t - (start - fade)) / fade;
  if (t > end && t < end + fade) return 1 - (t - end) / fade;
  return 0;
}

/** 场景内元素的入场动画：offsetSec 为相对场景开始的秒数 */
export function useEntrance(
  sceneId: string,
  offsetSec: number,
  durationSec = 0.6,
  mode: 'fade' | 'rise' | 'scale' = 'fade',
): {opacity: number; transform?: string} {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = SCENES.find((s) => s.id === sceneId)!;
  const t = (frame / fps - (scene.start + offsetSec)) / durationSec;
  const p = Math.max(0, Math.min(1, t));
  const eased = p * p * (3 - 2 * p); // smoothstep
  switch (mode) {
    case 'rise':
      return {opacity: eased, transform: `translateY(${(1 - eased) * 44}px)`};
    case 'scale':
      return {opacity: eased, transform: `scale(${0.82 + 0.18 * eased})`};
    default:
      return {opacity: eased};
  }
}
