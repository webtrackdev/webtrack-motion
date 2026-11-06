// Perfil de la plataforma Webtrack.
// Fuente de diseno: repo ../reactive (solo lectura). Su CSS real entra por style.css y sus
// archivos se importan con el alias @webtrack (ver platforms.json en la raiz).
import type { Brand } from '../../core/theme';
import { fontFamily } from './fonts';

export const BRAND: Brand = {
  name: 'Webtrack',
  primary: '#040eff',
  accent: '#5b2bff',
  primarySoft: '#5c66ff',
  ink: '#0f1728',
  body: '#3a4256',
  muted: '#677187',
  bg: '#f6f7fb',
  card: '#ffffff',
  border: '#eceef3',
  success: '#22c55e',
  danger: '#ef4444',
  font: fontFamily,
  logo: 'webtrack/brand/webtrack-wordmark.png',
  mark: 'webtrack/brand/webtrack-mark.png'
};
