import {createRemotionTimeline} from '@video/core';
import durations from '../public/voiceover/segment-durations.json';

export const FPS = 30;
export const SCENE_IDS = ['intro', 'problem', 'how', 'labs', 'quera', 'industry', 'limits', 'outro'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

if (durations.length !== SCENE_IDS.length) {
  throw new Error('旁白段落数与场景数不一致，请运行 npm run voiceover。');
}

const timeline = createRemotionTimeline(SCENE_IDS, durations, {
  tailSeconds: 2.6,
  fadeSeconds: 0.38,
  entranceDistance: 36,
  entranceScale: 0.88,
});

export const SCENES = timeline.scenes;
export const AUDIO_END = timeline.audioEnd;
export const TOTAL_SECONDS = timeline.totalSeconds;
export const sceneById = timeline.sceneById;
export const useSceneProgress = timeline.useSceneProgress;
export const useSceneOpacity = timeline.useSceneOpacity;
export const useEntrance = timeline.useEntrance;
