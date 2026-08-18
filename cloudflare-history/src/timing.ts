import {useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;

/**
 * 场景时间轴（秒），与旁白 9 段逐段对齐。
 * 实测段落时长见 public/voiceover/segment-durations.json：
 * [9.72, 9.696, 10.248, 10.848, 8.376, 8.808, 10.512, 8.664, 10.512]
 */
export const SCENES = [
  {id: 'intro', start: 0.0, end: 10.6},
  {id: 'founding', start: 9.3, end: 20.1},
  {id: 'fame', start: 19.0, end: 30.4},
  {id: 'ssl', start: 29.25, end: 41.2},
  {id: 'workers', start: 40.1, end: 49.7},
  {id: 'dns', start: 48.5, end: 58.4},
  {id: 'ipo', start: 57.3, end: 68.9},
  {id: 'expansion', start: 67.8, end: 77.5},
  {id: 'today', start: 76.5, end: 90.0},
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