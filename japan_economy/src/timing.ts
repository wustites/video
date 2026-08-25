import {useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;

export const SCENES = [
  {id: 'intro', start: 0, end: 7},
  {id: 'bubble', start: 6.4, end: 18.5},
  {id: 'lost', start: 17.9, end: 31.5},
  {id: 'yen', start: 30.9, end: 44.5},
  {id: 'dashboard', start: 43.9, end: 58.5},
  {id: 'outro', start: 57.9, end: 70},
] as const;

export const TOTAL_SECONDS = 70;

export function useSceneOpacity(sceneId: string): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const scene = SCENES.find((item) => item.id === sceneId)!;
  const fade = 0.55;
  if (t >= scene.start && t <= scene.end) return 1;
  if (t > scene.start - fade && t < scene.start) return (t - scene.start + fade) / fade;
  if (t > scene.end && t < scene.end + fade) return 1 - (t - scene.end) / fade;
  return 0;
}

export function useEntrance(
  sceneId: string,
  offsetSec: number,
  durationSec = 0.6,
  mode: 'fade' | 'rise' | 'scale' = 'fade',
): {opacity: number; transform: string} {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = SCENES.find((item) => item.id === sceneId)!;
  const p = Math.max(0, Math.min(1, (frame / fps - scene.start - offsetSec) / durationSec));
  const eased = p * p * (3 - 2 * p);
  if (mode === 'rise') return {opacity: eased, transform: `translateY(${(1 - eased) * 38}px)`};
  if (mode === 'scale') return {opacity: eased, transform: `scale(${0.86 + eased * 0.14})`};
  return {opacity: eased, transform: 'none'};
}

export function useSceneProgress(sceneId: string): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = SCENES.find((item) => item.id === sceneId)!;
  return Math.max(0, Math.min(1, (frame / fps - scene.start) / (scene.end - scene.start)));
}
