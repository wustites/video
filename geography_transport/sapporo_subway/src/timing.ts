import {useCurrentFrame, useVideoConfig} from 'remotion';
import segDurations from '../public/voiceover/segment-durations.json';

export const FPS = 30;

/** 场景 id 顺序，与旁白段落（narration.ja.txt 的 \n\n 分段）一一对应 */
const SCENE_IDS = [
  'intro',
  'network',
  'namboku',
  'tozai',
  'toho',
  'technology',
  'ridership',
  'outro',
] as const;

if (segDurations.length !== SCENE_IDS.length) {
  throw new Error(
    `旁白段落数(${segDurations.length})与场景数(${SCENE_IDS.length})不匹配，请先运行 npm run voiceover 重新生成音频`,
  );
}

/** 场景时间轴（秒）：由旁白实测时长推导，重新生成旁白后自动对齐，无需手工同步 */
export const SCENES: {id: (typeof SCENE_IDS)[number]; start: number; end: number}[] = [];
let acc = 0;
for (let i = 0; i < SCENE_IDS.length; i++) {
  const start = acc;
  acc += segDurations[i];
  SCENES.push({id: SCENE_IDS[i], start, end: acc});
}

const LAST_END = SCENES[SCENES.length - 1].end;

/** 结尾黑场淡出窗口（秒）：旁白结束后 0.5s 起，持续 2.5s */
export const FADE_OUT = {
  start: LAST_END + 0.5,
  end: LAST_END + 3.0,
};

/** 总时长（秒）：旁白结束后留出结尾黑场淡出 + 尾帧余量；旁白变长则自动延长 */
export const TOTAL_SECONDS = Math.max(56, Math.ceil(LAST_END + 3.8));

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

/** 场景内线路绘制进度：相对场景开始的秒数（offsetSec 起画，durationSec 内完成） */
export function useLineDraw(sceneId: string, offsetSec: number, durationSec: number): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = SCENES.find((s) => s.id === sceneId)!;
  const t = frame / fps - (scene.start + offsetSec);
  return Math.max(0, Math.min(1, t / durationSec));
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
