import {useCurrentFrame, useVideoConfig} from 'remotion';
import segDurations from '../public/voiceover/segment-durations.json';

export const FPS = 30;

/** 场景 id 顺序，与旁白段落（narration.ja.txt 的 \n\n 分段）一一对应 */
const SCENE_IDS = [
  'intro',
  'bubble',
  'lost',
  'yen',
  'dashboard',
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

/** 总时长（秒）：旁白结束后留出尾帧余量；旁白变长则自动延长 */
export const TOTAL_SECONDS = Math.ceil(LAST_END + 2);

/**
 * 场景整体不透明度：硬切。
 * 场景边界与旁白段落边界对齐，语义停顿即转场；不做交叉淡化，避免相邻场景内容叠影。
 */
export function useSceneOpacity(sceneId: string): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const scene = SCENES.find((item) => item.id === sceneId)!;
  return t >= scene.start && t <= scene.end ? 1 : 0;
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
