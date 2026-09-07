import {loadFont} from '@remotion/google-fonts/NotoSansSC';

/**
 * Noto Sans SC（与 HyperFrames 版 @font-face 同款字体）。
 * Root 用 waitUntilDone() 门控，字体就绪前不挂载，避免首帧回退字体闪烁。
 */
export const notoSansSC = loadFont('normal', {
  weights: ['400', '500', '700', '900'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});
