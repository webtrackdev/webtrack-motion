// Videos del tema Fútbol. Un <Composition> por video; el id es el nombre del archivo final.
import { Composition } from 'remotion';
import { withBrand } from '../../core/platform';
import { BRAND } from './platform';
import { AgarrePortero, DURATION as AGARRE } from './videos/agarre-portero/AgarrePortero';

const video = { fps: 30, width: 1920, height: 1080 };

export const RemotionRoot = () => (
  <>
    <Composition id="agarre-portero" component={withBrand(BRAND, AgarrePortero)} durationInFrames={AGARRE} {...video} />
  </>
);
