import {useCurrentFrame, useVideoConfig} from 'remotion';
import segmentDurations from '../public/voiceover/segment-durations.json';

export const FPS = 30;

export const SCENE_IDS = [
  'intro',
  'network',
  'history',
  'map',
  'depth',
  'architecture',
  'service',
  'outro',
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

const durations = segmentDurations as number[];

if (durations.length !== SCENE_IDS.length) {
  throw new Error(
    `旁白段落数(${durations.length})与场景数(${SCENE_IDS.length})不匹配，请先运行 npm run voiceover 重新生成音频`,
  );
}

export const SCENES: {id: SceneId; start: number; end: number}[] = [];
let accumulated = 0;
for (let index = 0; index < SCENE_IDS.length; index++) {
  const start = accumulated;
  accumulated += durations[index];
  SCENES.push({id: SCENE_IDS[index], start, end: accumulated});
}

export const LAST_END = SCENES[SCENES.length - 1].end;

/** 旁白结束后留出稳定的结尾淡出黑场。 */
export const FADE_OUT = {
  start: LAST_END + 0.55,
  end: LAST_END + 3.1,
};

export const TOTAL_SECONDS = Math.max(70, Math.ceil(LAST_END + 3.8));

export function getSceneAtTime(time: number) {
  return SCENES.find((scene) => time >= scene.start && time <= scene.end);
}

/** 场景整体不透明度（含场景边界的淡入淡出）。 */
export function useSceneOpacity(sceneId: SceneId): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const scene = SCENES.find((item) => item.id === sceneId)!;
  const fade = 0.5;

  if (time >= scene.start && time <= scene.end) return 1;
  if (time > scene.start - fade && time < scene.start) {
    return (time - (scene.start - fade)) / fade;
  }
  if (time > scene.end && time < scene.end + fade) {
    return 1 - (time - scene.end) / fade;
  }
  return 0;
}

/** 场景内线路绘制的归一化进度。 */
export function useLineDraw(sceneId: SceneId, offsetSec: number, durationSec: number): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = SCENES.find((item) => item.id === sceneId)!;
  const progress = (frame / fps - (scene.start + offsetSec)) / durationSec;
  return Math.max(0, Math.min(1, progress));
}

/** 场景内元素的入场动画。 */
export function useEntrance(
  sceneId: SceneId,
  offsetSec: number,
  durationSec = 0.6,
  mode: 'fade' | 'rise' | 'scale' = 'fade',
): {opacity: number; transform?: string} {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = SCENES.find((item) => item.id === sceneId)!;
  const progress = (frame / fps - (scene.start + offsetSec)) / durationSec;
  const p = Math.max(0, Math.min(1, progress));
  const eased = p * p * (3 - 2 * p);

  switch (mode) {
    case 'rise':
      return {opacity: eased, transform: `translateY(${(1 - eased) * 40}px)`};
    case 'scale':
      return {opacity: eased, transform: `scale(${0.8 + 0.2 * eased})`};
    default:
      return {opacity: eased};
  }
}
