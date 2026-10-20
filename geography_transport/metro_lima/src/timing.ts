import {useCurrentFrame, useVideoConfig} from 'remotion';
import segDurations from '../public/voiceover/segment-durations.json';
import wordMarks from '../public/voiceover/word-marks.json';

export const FPS = 30;

/** 场景 id 顺序，与旁白段落（narration.es.txt 的 \n\n 分段）一一对应 */
const SCENE_IDS = [
  'intro',
  'ridership',
  'map-l1',
  'l1record',
  'map-l2',
  'l2progress',
  'future',
  'fare',
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

/** 结尾黑场淡出窗口（秒）：旁白结束后先停留 1s 让结尾画面落定，再用 1.5s 淡出 */
export const FADE_OUT = {
  start: LAST_END + 1.0,
  end: LAST_END + 2.5,
};

/** 总时长（秒）：完全由旁白长度决定，淡出结束后立即收尾，不留长黑场 */
export const TOTAL_SECONDS = Math.ceil(LAST_END + 2.6);

/** 旁白念到 `word`（第 nth 次出现）时，相对场景 `sceneId` 开头的秒数；来自 Edge TTS WordBoundary */
export function cue(sceneId: (typeof SCENE_IDS)[number], word: string, nth = 0): number {
  const words = (wordMarks as {text: string; start: number}[][])[SCENE_IDS.indexOf(sceneId)];
  const hits = words.filter((w) => w.text.includes(word));
  if (!hits[nth]) throw new Error(`旁白中找不到「${word}」（${sceneId}）`);
  return hits[nth].start;
}

/** 场景开始时间（秒） */
export const sceneStart = (sceneId: string) => SCENES.find((s) => s.id === sceneId)!.start;

/**
 * 场景整体不透明度：先出后进。场景在自身窗口内开头 0.35s 淡入、结尾 0.35s 淡出，
 * 相邻场景不会同时出现；第一个场景开场即可见，最后一个场景保持到黑场淡出。
 */
export function useSceneOpacity(sceneId: string): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const index = SCENES.findIndex((s) => s.id === sceneId);
  const {start, end} = SCENES[index];
  const fade = 0.35;
  const isFirst = index === 0;
  const isLast = index === SCENES.length - 1;
  if (t < start) return 0;
  if (t > end && !isLast) return 0;
  const fadeIn = isFirst ? 1 : Math.min(1, (t - start) / fade);
  const fadeOut = isLast ? 1 : Math.min(1, (end - t) / fade);
  return Math.max(0, Math.min(fadeIn, fadeOut));
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
