import {loadFont} from '@remotion/google-fonts/NotoSansSC';

export const fontFamily = '"Noto Sans SC", "Segoe UI", Arial, sans-serif';

export async function loadFonts(): Promise<void> {
  await loadFont('normal', {
    weights: ['400', '700', '800', '900'],
    subsets: ['chinese-simplified', 'latin'],
    ignoreTooManyRequestsWarning: true,
  });
}
