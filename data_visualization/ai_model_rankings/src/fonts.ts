import {loadFont as loadSC} from '@remotion/google-fonts/NotoSansSC';
import {loadFont as loadJP} from '@remotion/google-fonts/NotoSansJP';

// Multilang project: en renders with system fonts, zh needs Noto Sans SC,
// ja needs Noto Sans JP. Loaded once at module scope so every composition
// shares the gated families.
export const notoSansSCInfo = loadSC('normal', {
  weights: ['400', '700', '900'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});
export const {fontFamily: notoSansSC} = notoSansSCInfo;

export const notoSansJPInfo = loadJP('normal', {
  weights: ['400', '700', '900'],
  subsets: ['japanese', 'latin'],
  ignoreTooManyRequestsWarning: true,
});
export const {fontFamily: notoSansJP} = notoSansJPInfo;
