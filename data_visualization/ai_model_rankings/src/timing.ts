import durationsEn from '../public/voiceover/segment-durations.en.json';
import durationsZh from '../public/voiceover/segment-durations.zh.json';
import durationsJa from '../public/voiceover/segment-durations.ja.json';
import marksEn from '../public/voiceover/word-marks.en.json';
import marksZh from '../public/voiceover/word-marks.zh.json';
import marksJa from '../public/voiceover/word-marks.ja.json';
import type {LocaleKey as Locale} from './i18n';

export const FPS = 30;
export const SCENE_IDS = ['intro', 'ranking', 'scatter', 'efficiency', 'tiers', 'providers', 'outro'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

type Marks = {text: string; start: number}[][];
const SOURCES: Record<Locale, {durations: number[]; marks: Marks}> = {
  en: {durations: durationsEn, marks: marksEn as Marks},
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
    throw new Error(`Narration (${locale}) has ${durations.length} paragraphs, expected ${SCENE_IDS.length}; run npm run voiceover`);
  }
  let acc = 0;
  const scenes = SCENE_IDS.map((id, i) => {
    const start = Math.round(acc * FPS);
    acc += durations[i];
    return {id, start, end: Math.round(acc * FPS)};
  });
  const cue = (id: SceneId, word: string, nth = 0) => {
    const hits = marks[SCENE_IDS.indexOf(id)].filter((w) => w.text.toLowerCase().includes(word.toLowerCase()));
    if (!hits[nth]) throw new Error(`"${word}" not found in the ${locale} narration of ${id}`);
    return Math.round(hits[nth].start * FPS);
  };
  return {scenes, duration: scenes[scenes.length - 1].end + 2 * FPS, cue};
}
