import {loadFont} from '@remotion/google-fonts/NotoSansSC';

export const notoSansSC = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800', '900'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});
