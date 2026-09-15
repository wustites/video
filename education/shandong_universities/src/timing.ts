import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import durations from '../public/voiceover/segment-durations.json';
import {CITIES} from './data';
import {buildTimeline, FPS, sceneOpacity} from './scenes';

export {FPS};

/** 场景 id 顺序，与 narration.zh.txt 的 \n\n 分段（intro、overview、16 个地市、outro）一一对应 */
export const SCENE_IDS = ['intro', 'overview', ...CITIES.map((c) => c.name), 'outro'] as const;

/** 场景时间轴：由旁白实测时长推导，重新生成旁白后自动对齐；段落数不匹配时直接抛错 */
export const TIMELINE = buildTimeline(SCENE_IDS, durations);
export const SCENES = TIMELINE.scenes;

const SCENE_BY_ID: Record<string, (typeof SCENES)[number]> = Object.fromEntries(
  SCENES.map((s) => [s.id, s]),
);

/** 结尾黑场淡出窗口（秒）：旁白结束后 0.5s 起，持续 2.5s */
export const FADE_OUT = TIMELINE.fadeOut;
export const TOTAL_SECONDS = TIMELINE.totalSeconds;
export const TOTAL_FRAMES = TIMELINE.totalFrames;

function sceneOf(id: string) {
  const scene = SCENE_BY_ID[id];
  if (!scene) throw new Error(`未知场景 ${id}`);
  return scene;
}

/** 场景整体不透明度：旁白区间内为 1，前后各 0.5s 淡入/淡出，相邻场景在切点交叠，不出现空画面 */
export function useSceneOpacity(id: string): number {
  const frame = useCurrentFrame();
  return sceneOpacity(sceneOf(id), frame);
}

/** 场景内元素的入场动画：offsetSec 为相对场景开始的秒数 */
export function useEntrance(id: string, offsetSec: number, durationSec = 0.6): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return interpolate(frame - sceneOf(id).startFrame - offsetSec * fps, [0, durationSec * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
}
