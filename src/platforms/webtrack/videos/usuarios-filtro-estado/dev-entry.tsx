import { Composition, registerRoot } from 'remotion';
import { withBrand } from '../../../../core/platform';
import { BRAND } from '../../platform';
import { UsuariosFiltroEstado, DURATION } from './UsuariosFiltroEstado';
const Root = () => (
  <Composition id="usuarios-filtro-estado" component={withBrand(BRAND, UsuariosFiltroEstado)} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
registerRoot(Root);
