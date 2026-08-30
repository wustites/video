import {useCurrentFrame, useVideoConfig} from 'remotion';
import durations from '../public/voiceover/segment-durations.json';

export const FPS = 30;
export const SCENE_IDS = ['intro', 'background', 'article12', 'adoption', 'limits', 'enactment', 'outro'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

if (durations.length !== SCENE_IDS.length) {
  throw new Error('ナレーションの段落数とシーン数が一致しません。npm run voiceover を実行してください。');
}

export const SCENES: {id: SceneId; start: number; end: number}[] = [];
let cursor = 0;
for (let index = 0; index < SCENE_IDS.length; index++) {
  const start = cursor;
  cursor += durations[index];
  SCENES.push({id: SCENE_IDS[index], start, end: cursor});
}

export const AUDIO_END = cursor;
export const TOTAL_SECONDS = Math.ceil(AUDIO_END + 2.6);

export const sceneById = (id: SceneId) => SCENES.find((scene) => scene.id === id)!;

export const useSceneProgress = (id: SceneId) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = sceneById(id);
  return Math.max(0, Math.min(1, (frame / fps - scene.start) / (scene.end - scene.start)));
};

export const useSceneOpacity = (id: SceneId) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const scene = sceneById(id);
  const fade = 0.38;
  if (time >= scene.start && time <= scene.end) return 1;
  if (time >= scene.start - fade && time < scene.start) return (time - scene.start + fade) / fade;
  if (time > scene.end && time <= scene.end + fade) return 1 - (time - scene.end) / fade;
  return 0;
};

export const useEntrance = (id: SceneId, offset = 0, duration = 0.65) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = sceneById(id);
  const raw = (frame / fps - scene.start - offset) / duration;
  const p = Math.max(0, Math.min(1, raw));
  const eased = 1 - Math.pow(1 - p, 3);
  return {opacity: eased, y: (1 - eased) * 36, scale: 0.88 + eased * 0.12};
};
