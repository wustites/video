// 场景时间轴（纯函数，无 Remotion 依赖，便于测试）：由旁白分段实测时长推导场景起止与边界淡入淡出窗口。

export const FPS = 30;

/** 场景边界的交叠淡化时长（秒）：相邻场景在此窗口内交叠，切点不会出现空画面 */
export const FADE_SECONDS = 0.5;

/** 结尾黑场淡出：旁白结束后 0.5s 起，持续 2.5s */
const FADE_OUT_DELAY = 0.5;
const FADE_OUT_SECONDS = 2.5;

/** 淡出结束后的尾帧余量（秒） */
const TAIL_SECONDS = 0.8;

/** 最短成片时长（秒） */
const MIN_SECONDS = 30;

export type Scene = {
  id: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
};

export type Timeline = {
  scenes: Scene[];
  fadeFrames: number;
  fadeOut: {start: number; end: number};
  totalSeconds: number;
  totalFrames: number;
};

/**
 * 生成场景时间轴。场景窗口按帧取整且首尾相接（startFrame[i+1] === endFrame[i]），
 * 因此每一帧都恰好属于一个场景的旁白区间，不存在空白帧。
 */
export function buildTimeline(ids: readonly string[], durations: number[]): Timeline {
  if (ids.length !== durations.length) {
    throw new Error(
      `旁白段落数 ${durations.length} 与场景数 ${ids.length} 不匹配，请运行 npm run voiceover`,
    );
  }
  const scenes: Scene[] = [];
  const fadeFrames = Math.round(FADE_SECONDS * FPS);
  let acc = 0;
  for (let i = 0; i < ids.length; i++) {
    const start = acc;
    acc = start + durations[i];
    scenes.push({
      id: ids[i],
      start,
      end: acc,
      startFrame: Math.round(start * FPS),
      endFrame: Math.round(acc * FPS),
    });
  }
  const fadeOut = {start: acc + FADE_OUT_DELAY, end: acc + FADE_OUT_DELAY + FADE_OUT_SECONDS};
  const totalSeconds = Math.max(MIN_SECONDS, Math.ceil(fadeOut.end + TAIL_SECONDS));
  return {scenes, fadeFrames, fadeOut, totalSeconds, totalFrames: Math.round(totalSeconds * FPS)};
}

/** 单个场景的不透明度：旁白区间内为 1，区间前后各 fadeFrames 帧淡入/淡出 */
export function sceneOpacity(scene: Scene, frame: number): number {
  const fade = Math.round(FADE_SECONDS * FPS);
  if (frame < scene.startFrame - fade) return 0;
  if (frame < scene.startFrame) return (frame - (scene.startFrame - fade)) / fade;
  if (frame <= scene.endFrame) return 1;
  if (frame <= scene.endFrame + fade) return 1 - (frame - scene.endFrame) / fade;
  return 0;
}
