import {loadFont as loadNotoSans} from '@remotion/google-fonts/NotoSans';
import {loadFont as loadNotoSansJP} from '@remotion/google-fonts/NotoSansJP';
import {loadFont as loadNotoSansKR} from '@remotion/google-fonts/NotoSansKR';
import {loadFont as loadNotoSansSC} from '@remotion/google-fonts/NotoSansSC';
import type {SolarLocale} from './cues';

/** Load every Noto Sans variant the four locales need. Resolves when all
 * four are ready to render; Root gates compositions on this promise. */
export const loadSolarFonts = (): Promise<unknown> => {
  const loaders = [
    loadNotoSans('normal', {
      weights: ['400', '500', '700', '900'],
      subsets: ['latin'],
      ignoreTooManyRequestsWarning: true,
    }),
    loadNotoSansSC('normal', {
      weights: ['400', '500', '700', '900'],
      subsets: ['chinese-simplified', 'latin'],
      ignoreTooManyRequestsWarning: true,
    }),
    loadNotoSansJP('normal', {
      weights: ['400', '500', '700', '900'],
      subsets: ['japanese', 'latin'],
      ignoreTooManyRequestsWarning: true,
    }),
    loadNotoSansKR('normal', {
      weights: ['400', '500', '700', '900'],
      subsets: ['korean', 'latin'],
      ignoreTooManyRequestsWarning: true,
    }),
  ];
  return Promise.all(loaders.map((f) => f.waitUntilDone()));
};

const FAMILY: Record<SolarLocale, string> = {
  en: '"Noto Sans", sans-serif',
  zh: '"Noto Sans SC", sans-serif',
  ja: '"Noto Sans JP", sans-serif',
  ko: '"Noto Sans KR", sans-serif',
};

export const fontFamilyForLocale = (locale: SolarLocale): string => {
  return FAMILY[locale];
};
