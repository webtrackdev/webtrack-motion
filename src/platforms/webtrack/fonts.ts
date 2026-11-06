import { loadFont } from '@remotion/google-fonts/Manrope';

// Manrope es la fuente de la app (--app-font-sans).
export const { fontFamily, waitUntilDone } = loadFont('normal', {
  weights: ['500', '600', '700', '800'],
  subsets: ['latin']
});
