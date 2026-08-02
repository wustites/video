import {useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;

/** 场景时间轴（秒），与旁白 8 段对齐（实测时长见 public/voiceover/segment-durations.json） */
export const SCENES = [
  {id: 'intro', start: 0.0, end: 4.872},
  {id: 'ridership', start: 4.872, end: 9.984},
  {id: 'map-l1', start: 9.984, end: 18.816},
  {id: 'l1record', start: 18.816, end: 25.368},
  {id: 'map-l2', start: 25.368, end: 33.744},
  {id: 'l2progress', start: 33.744, end: 39.336},
  {id: 'future', start: 39.336, end: 45.792},
  {id: 'fare', start: 45.792, end: 52.176},
] as const;

export const TOTAL_SECONDS = 56;

/** 场景整体不透明度（含场景边界的淡入淡出） */
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
      return {opacity: eased, transform: `translateY(${(1 - eased) * 40}px)`};
    case 'scale':
      return {opacity: eased, transform: `scale(${0.8 + 0.2 * eased})`};
    default:
      return {opacity: eased};
  }
}
