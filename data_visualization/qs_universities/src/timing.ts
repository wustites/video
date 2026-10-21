import durations from '../public/voiceover/segment-durations.json';
import wordMarks from '../public/voiceover/word-marks.json';

export const FPS = 30;
export const SCENE_IDS = ['intro', 'top10', 'countries', 'china', 'scroll', 'outro'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

if (durations.length !== SCENE_IDS.length) {
  throw new Error(`旁白段落数(${durations.length})与场景数(${SCENE_IDS.length})不一致，请运行 npm run voiceover`);
}

/** Scene windows in frames, one per narration paragraph, back to back. */
export const SCENES = (() => {
  let acc = 0;
  return SCENE_IDS.map((id, i) => {
    const start = Math.round(acc * FPS);
    acc += durations[i];
    return {id, start, end: Math.round(acc * FPS)};
  });
})();

/** Narration end plus a short hold on the outro. */
export const DURATION_IN_FRAMES = SCENES[SCENES.length - 1].end + 2 * FPS;

/** Frames from the start of scene `id` until the narration says `word` (Edge TTS WordBoundary). */
export const cue = (id: SceneId, word: string, nth = 0): number => {
  const words = (wordMarks as {text: string; start: number}[][])[SCENE_IDS.indexOf(id)];
  const hits = words.filter((w) => w.text.includes(word));
  if (!hits[nth]) throw new Error(`旁白中找不到「${word}」（${id}）`);
  return Math.round(hits[nth].start * FPS);
};
