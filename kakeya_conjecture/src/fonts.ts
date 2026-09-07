import {loadFont} from '@remotion/google-fonts/NotoSansSC';
import {loadFont as loadSerifFont} from '@remotion/google-fonts/NotoSerifSC';

// Body / headings: Noto Sans SC (weights mirror the HyperFrames @font-face set)
export const notoSansSC = loadFont('normal', {
  weights: ['300', '400', '700', '900'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});

// Formulas / serif emphasis: Noto Serif SC
export const notoSerifSC = loadSerifFont('normal', {
  weights: ['400', '700'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});

export const SANS = '"Noto Sans SC", sans-serif';
export const SERIF = '"Noto Serif SC", serif';
