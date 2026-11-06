import { Composition, registerRoot } from 'remotion';
import { withBrand } from '../../../../core/platform';
import { BRAND } from '../../platform';
import { AvisoVersion, DURATION } from './AvisoVersion';
const Root = () => (
  <Composition id="aviso-version" component={withBrand(BRAND, AvisoVersion)} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
registerRoot(Root);
