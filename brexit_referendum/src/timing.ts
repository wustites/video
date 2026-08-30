import {useCurrentFrame, useVideoConfig} from 'remotion';
import segDurations from '../public/voiceover/segment-durations.json';

export const FPS = 30;

/** Scene ids in order; must match the paragraphs in narration.en.txt */
const SCENE_IDS = [
  'intro',
  'causes',
  'vote',
  'aftermath',
  'exit',
  'outro',
] as const;

if (segDurations.length !== SCENE_IDS.length) {
  throw new Error(
    `Narration has ${segDurations.length} paragraphs but there are ${SCENE_IDS.length} scenes; run "npm run voiceover" to regenerate audio.`,
  );
}

/** Scene timeline (seconds), derived from measured narration durations. */
export const SCENES: {id: (typeof SCENE_IDS)[number]; start: number; end: number}[] = [];
let acc = 0;
for (let i = 0; i < SCENE_IDS.length; i++) {
  const start = acc;
  acc += segDurations[i];
  SCENES.push({id: SCENE_IDS[i], start, end: acc});
}

const LAST_END = SCENES[SCENES.length - 1].end;

/** Total length: narration plus a short tail. */
export const TOTAL_SECONDS = Math.ceil(LAST_END + 2);

/** Scene opacity: hard cuts aligned with narration paragraph boundaries. */
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
