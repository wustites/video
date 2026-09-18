import {createRemotionTimeline} from '@video/core';
import durations from '../public/voiceover/segment-durations.json';

export const FPS = 30;
export const SCENE_IDS = ['intro', 'formation', 'lod', 'hijack', 'dissolve', 'justice', 'outro'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

if (durations.length !== SCENE_IDS.length) {
  throw new Error('ナレーションの段落数とシーン数が一致しません。npm run voiceover を実行してください。');
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
