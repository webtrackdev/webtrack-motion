import { Composition, registerRoot } from 'remotion';
import { withBrand } from '../../../../core/platform';
import { BRAND } from '../../platform';
import { AeropuertoActualizando, DURATION } from './AeropuertoActualizando';
const Root = () => (
  <Composition id="aeropuerto-actualizando" component={withBrand(BRAND, AeropuertoActualizando)} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
registerRoot(Root);
