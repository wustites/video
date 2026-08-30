import {loadFont} from '@remotion/google-fonts/Inter';

export const inter = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});
