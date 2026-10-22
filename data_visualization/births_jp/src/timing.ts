import durationsJa from '../public/voiceover/segment-durations.ja.json';
import durationsZh from '../public/voiceover/segment-durations.zh.json';
import marksJa from '../public/voiceover/word-marks.ja.json';
import marksZh from '../public/voiceover/word-marks.zh.json';
import type {Locale} from './i18n';

export const FPS = 30;
export const SCENE_IDS = ['intro', 'trend', 'ranking', 'map', 'small', 'risers', 'outro'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

type Marks = {text: string; start: number}[][];
const SOURCES: Record<Locale, {durations: number[]; marks: Marks}> = {
  zh: {durations: durationsZh, marks: marksZh as Marks},
  ja: {durations: durationsJa, marks: marksJa as Marks},
};

export type Timeline = {
  scenes: {id: SceneId; start: number; end: number}[];
  duration: number;
  /** Frames from the start of scene `id` until the narration says `word`. */
  cue: (id: SceneId, word: string, nth?: number) => number;
};

/** Scene windows (frames) from the measured narration of `locale`, back to back, plus a 2 s hold. */
export function getTimeline(locale: Locale): Timeline {
  const {durations, marks} = SOURCES[locale];
  if (durations.length !== SCENE_IDS.length) {
    throw new Error(`旁白(${locale})有 ${durations.length} 段，场景有 ${SCENE_IDS.length} 个；请运行 npm run voiceover`);
  }
  let acc = 0;
  const scenes = SCENE_IDS.map((id, i) => {
    const start = Math.round(acc * FPS);
    acc += durations[i];
    return {id, start, end: Math.round(acc * FPS)};
  });
  const cue = (id: SceneId, word: string, nth = 0) => {
    const hits = marks[SCENE_IDS.indexOf(id)].filter((w) => w.text.includes(word));
    if (!hits[nth]) throw new Error(`旁白(${locale})中找不到「${word}」（${id}）`);
    return Math.round(hits[nth].start * FPS);
  };
  return {scenes, duration: scenes[scenes.length - 1].end + 2 * FPS, cue};
}
