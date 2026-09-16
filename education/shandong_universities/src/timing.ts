import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import durations from '../public/voiceover/segment-durations.json';
import {CITIES} from './data';
import {buildCameraKeys} from './mapCamera';
import {buildTimeline, FPS, sceneOpacity} from './scenes';

export {FPS};

/** 场景 id 顺序，与 narration.zh.txt 的 \n\n 分段（intro、16 个地市）一一对应 */
export const SCENE_IDS = ['intro', ...CITIES.map((c) => c.name)] as const;

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

/** 地图相机关键帧：地市场景聚焦该市真实边界，全省场景取整省，交界处连续平移缩放 */
export const CAMERA_KEYS = buildCameraKeys(SCENE_IDS, SCENES, FPS);

function sceneOf(id: string) {
  const scene = SCENE_BY_ID[id];
  if (!scene) throw new Error(`未知场景 ${id}`);
  return scene;
}

/** 场景内文字退场时长（秒）：比场景淡化更快，避免两段文字长时间叠在一起 */
const EXIT_SECONDS = 0.2;

/**
 * 场景内容的可见度：入场由 useEntrance 另行控制，退场在 0.2s 内让位给下一个场景的文字。
 * 底板与地图是常驻图层，因此这里只影响文字，切点不会出现空白或双重曝光。
 */
export function useContentOpacity(id: string): number {
  const frame = useCurrentFrame();
  const scene = sceneOf(id);
  const exit = interpolate(frame, [scene.endFrame, scene.endFrame + EXIT_SECONDS * FPS], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(sceneOpacity(scene, frame), exit);
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
