import cuesEn from '../public/voiceover/cues.en.json';
import cuesJa from '../public/voiceover/cues.ja.json';
import cuesKo from '../public/voiceover/cues.ko.json';
import cuesZh from '../public/voiceover/cues.zh.json';

export const FPS = 30;

/** Extra tail after the last cue so the finale can settle. Mirrors
 * END_PADDING in scripts/generate_voiceover.py (already baked into the
 * committed compositionDuration values). */
export const END_PADDING = 0.5;

export type SolarLocale = 'en' | 'zh' | 'ja' | 'ko';

export type SolarCue = {
  id: string;
  start: number;
  end: number;
  text: string;
  scene: string;
  name: string;
};

export type SolarVoiceover = {
  language: string;
  voice: string;
  audioDuration: number;
  compositionDuration: number;
  cues: SolarCue[];
};

const DATA: Record<SolarLocale, SolarVoiceover> = {
  en: cuesEn as SolarVoiceover,
  zh: cuesZh as SolarVoiceover,
  ja: cuesJa as SolarVoiceover,
  ko: cuesKo as SolarVoiceover,
};

export const LOCALES: SolarLocale[] = ['en', 'zh', 'ja', 'ko'];

export const getVoiceover = (locale: SolarLocale): SolarVoiceover => {
  return DATA[locale];
};

export const durationInFrames = (locale: SolarLocale): number => {
  return Math.round(getVoiceover(locale).compositionDuration * FPS);
};

export type Segment = {
  name: string;
  start: number;
  end: number;
};

export const getSegments = (locale: SolarLocale): Segment[] => {
  return getVoiceover(locale).cues.map((cue) => ({
    name: cue.scene,
    start: Math.round(cue.start * FPS),
    end: Math.round(cue.end * FPS),
  }));
};

