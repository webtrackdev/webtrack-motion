import { Composition, registerRoot } from 'remotion';
import { withBrand } from '../../../../core/platform';
import { BRAND } from '../../platform';
import { PoliticaContrasenas, DURATION } from './PoliticaContrasenas';
const Root = () => (
  <Composition id="politica-contrasenas" component={withBrand(BRAND, PoliticaContrasenas)} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
registerRoot(Root);
