import { Composition, registerRoot } from 'remotion';
import { withBrand } from '../../../../core/platform';
import { BRAND } from '../../platform';
import { ConfigappAfiliacion, DURATION } from './ConfigappAfiliacion';

const Root = () => (
  <Composition id="configapp-afiliacion" component={withBrand(BRAND, ConfigappAfiliacion)} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
registerRoot(Root);
