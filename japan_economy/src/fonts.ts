import {loadFont} from '@remotion/google-fonts/NotoSansJP';

export const notoSansJP = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800', '900'],
  subsets: ['japanese', 'latin'],
  ignoreTooManyRequestsWarning: true,
});
