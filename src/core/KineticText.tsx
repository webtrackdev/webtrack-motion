// Titular que entra palabra por palabra desde una mascara (estilo lanzamiento de producto).
import type { CSSProperties, FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useBrand } from './theme';
import { EASE, SPRING, kf, sp } from './anim';

export const KineticText: FC<{
  text: string;
  start: number;
  /** Frame en que sale (opcional). */
  out?: number;
  stagger?: number;
  /** Palabras resaltadas con el degradado de marca. */
  highlight?: string[];
  style?: CSSProperties;
}> = ({ text, start, out, stagger = 3, highlight = [], style }) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  const words = text.split(' ');
  return (
    <div
      style={{
        fontWeight: 800,
        letterSpacing: '-0.035em',
        lineHeight: 1.08,
        color: brand.ink,
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '0.26em',
        ...style
      }}
    >
      {words.map((w, i) => {
        const p = sp(frame, start + i * stagger, SPRING.smooth);
        const q = out != null ? kf(frame, [out + i * 1.5, out + i * 1.5 + 12], [0, 1], EASE.in) : 0;
        const y = (1 - p) * 105 - q * 105;
        const isHi = highlight.some((h) => w.replace(/[.,!?¿¡]/g, '') === h);
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.22em', marginBottom: '-0.22em' }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${y}%)`,
                opacity: Math.min(p * 1.4, 1 - q),
                ...(isHi
                  ? {
                      backgroundImage: `linear-gradient(100deg, ${brand.primary}, ${brand.accent})`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      // El degradado solo pinta dentro de la caja: se extiende para las letras con
                      // descendente (g, j, p, q, y).
                      paddingBottom: '0.18em',
                      marginBottom: '-0.18em'
                    }
                  : null)
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};
