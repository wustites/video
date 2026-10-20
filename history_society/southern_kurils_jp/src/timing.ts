import {createRemotionTimeline} from '@video/core';
import durations from '../public/voiceover/segment-durations.json';
import wordMarks from '../public/voiceover/word-marks.json';

export const FPS = 30;
export const SCENE_IDS = ['intro', 'location', 'scale', 'nature', 'history', 'positions', 'outro'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

if (durations.length !== SCENE_IDS.length) {
  throw new Error('ナレーションの段落数とシーン数が一致しません。npm run voiceover を実行してください。');
}

const timeline = createRemotionTimeline(SCENE_IDS, durations, {
  tailSeconds: 2.6,
  fadeSeconds: 0.38,
  entranceDistance: 34,
  entranceScale: 0.92,
});

export const SCENES = timeline.scenes;
export const AUDIO_END = timeline.audioEnd;
export const TOTAL_SECONDS = timeline.totalSeconds;
export const sceneById = timeline.sceneById;
export const useSceneProgress = timeline.useSceneProgress;
export const useSceneOpacity = timeline.useSceneOpacity;
export const useEntrance = timeline.useEntrance;

/** Seconds from the start of scene `id` until the narration says `word`
 * (the nth occurrence), from Edge TTS WordBoundary marks. */
export const cue = (id: SceneId, word: string, nth = 0): number => {
  const words = (wordMarks as {text: string; start: number}[][])[SCENE_IDS.indexOf(id)];
  const hits = words.filter((w) => w.text.includes(word));
  if (!hits[nth]) throw new Error(`ナレーションに「${word}」が見つかりません（${id}）`);
  return hits[nth].start;
};
