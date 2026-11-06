import { loadFont } from '@remotion/google-fonts/Barlow';

export const { fontFamily, waitUntilDone } = loadFont('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
