// Marca de la plataforma activa. Cada plataforma define la suya (platforms/<nombre>/platform.ts)
// y la entrega con withBrand(); los componentes del nucleo la leen con useBrand().
import { createContext, useContext } from 'react';

export type Brand = {
  /** Nombre visible de la plataforma. */
  name: string;
  /** Color principal (hex de 6 digitos). */
  primary: string;
  /** Segundo color del degradado de marca. */
  accent: string;
  /** Version clara del primario (punto del subtitulo). Si falta se deriva. */
  primarySoft?: string;
  ink: string;
  body: string;
  muted: string;
  bg: string;
  card: string;
  border: string;
  success: string;
  danger: string;
  /** font-family CSS ya cargada por la plataforma. */
  font: string;
  /** Rutas dentro de public/ (para staticFile). */
  logo?: string;
  mark?: string;
};

export const NEUTRAL_BRAND: Brand = {
  name: 'Producto',
  primary: '#2563eb',
  accent: '#7c3aed',
  ink: '#0f1728',
  body: '#3a4256',
  muted: '#677187',
  bg: '#f6f7fb',
  card: '#ffffff',
  border: '#eceef3',
  success: '#22c55e',
  danger: '#ef4444',
  font: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
};

const BrandContext = createContext<Brand>(NEUTRAL_BRAND);
export const BrandProvider = BrandContext.Provider;
export const useBrand = () => useContext(BrandContext);

/** Hex de 6 digitos a rgba con alfa. */
export const hexA = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

export const shadows = (brand: Brand) => ({
  window: '0 60px 120px -30px rgba(16,24,40,.35), 0 24px 48px -24px rgba(16,24,40,.25)',
  float: '0 30px 60px -18px rgba(16,24,40,.32), 0 10px 24px -12px rgba(16,24,40,.18)',
  lift: `0 18px 40px -12px ${hexA(brand.primary, 0.35)}`
});
