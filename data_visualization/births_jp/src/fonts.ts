import {loadFont as loadSC} from '@remotion/google-fonts/NotoSansSC';
import {loadFont as loadJP} from '@remotion/google-fonts/NotoSansJP';

export const notoSansSC = loadSC('normal', {
  weights: ['400', '700', '900'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});

export const notoSansJP = loadJP('normal', {
  weights: ['400', '700', '900'],
  subsets: ['japanese', 'latin'],
  ignoreTooManyRequestsWarning: true,
});

export const fontFamilies = {zh: notoSansSC.fontFamily, ja: notoSansJP.fontFamily};
