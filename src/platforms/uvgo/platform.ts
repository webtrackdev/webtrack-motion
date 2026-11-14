// Perfil de la plataforma UVGo.
// Fuente de diseno: repo ../../UVG/POO/UVGo (solo lectura, alias @uvgo).
// Colores tomados de src/styles/theme.ts del repo (bg, text, accent, addAction).
import type { Brand } from '../../core/theme';
import { fontFamily } from './fonts';

export const BRAND: Brand = {
  name: "UVGo",
  primary: '#1d411b',
  accent: '#e07a5f',
  ink: '#171717',
  body: '#525252',
  muted: '#737373',
  bg: '#dfe6dc',
  card: '#ffffff',
  border: '#d4d4d4',
  success: '#2f7d32',
  danger: '#ef4444',
  font: fontFamily,
  logo: 'uvgo/brand/logo.png'
};
