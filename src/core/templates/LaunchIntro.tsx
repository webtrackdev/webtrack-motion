// Entrada rapida para funcionalidades y lanzamientos (estilo Meta), ~3 s.
// 1) El color de marca estalla desde el centro. 2) Palabras grandes golpean una tras otra con
// corte seco y fondo alterno. 3) Nombre de la funcionalidad con icono y pildora "NUEVO".
// 4) Barrido hacia arriba que revela lo que sigue. Nunca lleva la etiqueta de tutorial.
// Ritmo: cada palabra ~0.45 s y el nombre ~1.4 s; mas rapido no da tiempo de leer.
// Para mostrar una funcionalidad se usa SIN palabras: solo el titulo (~2 s) y se entra directo
// a los detalles. Las palabras quedan para lanzamientos con mas narrativa.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from '../anim';
import { hexA, useBrand } from '../theme';

export const launchIntroLength = (words: number, beat = 13, lock = 42) => 8 + words * beat + lock + 9;

export const LaunchIntro: FC<{
  /** Palabras o frases cortas que golpean una tras otra ("Ida.", "Vuelta.", "Un clic."). */
  words?: string[];
  /** Nombre de la funcionalidad para el cierre de la entrada. */
  title: string;
  icon?: ReactNode;
  badge?: string;
  /** Frame de inicio. */
  at?: number;
  /** Frames por palabra (12-15 se lee bien sin perder ritmo). */
  beat?: number;
  /** Frames que el nombre queda en pantalla. */
  lock?: number;
}> = ({ words = [], title, icon, badge = 'NUEVO', at = 0, beat = 13, lock: lockFrames = 42 }) => {
  const brand = useBrand();
  const f = useCurrentFrame() - at;
  const total = launchIntroLength(words.length, beat, lockFrames);
  if (f < 0 || f > total) return null;

  const wordsStart = 8;
  const lockStart = wordsStart + words.length * beat;
  const exitStart = lockStart + lockFrames;

  // Estallido inicial y barrido de salida
  const burst = kf(f, [0, 9], [0, 150], EASE.out);
  const exit = kf(f, [exitStart, exitStart + 9], [0, 100], EASE.in);
  const clip = f < exitStart ? `circle(${burst}% at 50% 52%)` : `inset(0 0 ${exit}% 0)`;

  const wordIdx = f >= wordsStart && f < lockStart ? Math.floor((f - wordsStart) / beat) : -1;
  const inBeat = wordIdx >= 0 ? f - wordsStart - wordIdx * beat : 0;
  const onBrand = wordIdx % 2 === 0;
  const bg =
    wordIdx >= 0
      ? onBrand
        ? brand.primary
        : brand.card
      : `linear-gradient(120deg, ${brand.primary} 0%, ${brand.accent} 100%)`;

  // Golpe: escala grande que se asienta rapido, con un leve desenfoque al entrar
  const hit = sp(f, wordsStart + wordIdx * beat, SPRING.snappy);
  const flash = inBeat < 2 ? 1 - inBeat / 2 : 0;

  // Cierre con el nombre
  const lock = sp(f, lockStart, SPRING.pop);
  const lockText = sp(f, lockStart + 4, SPRING.smooth);
  const lockPush = kf(f, [exitStart - 4, exitStart + 9], [1, 1.12], EASE.in);

  // Franja diagonal que cruza en cada corte
  const stripeX = inBeat >= 0 ? kf(inBeat, [0, 9], [-40, 140], EASE.out) : -100;

  return (
    <AbsoluteFill style={{ clipPath: clip, background: bg, fontFamily: brand.font, overflow: 'hidden', zIndex: 100 }}>
      {wordIdx >= 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: -200,
              bottom: -200,
              left: `${stripeX}%`,
              width: 180,
              transform: 'skewX(-18deg)',
              background: onBrand ? hexA('#ffffff', 0.14) : hexA(brand.primary, 0.1)
            }}
          />
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                fontSize: 230,
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 1,
                color: onBrand ? '#ffffff' : brand.ink,
                transform: `scale(${1.45 - 0.45 * hit}) translateY(${(1 - hit) * 30}px)`,
                filter: hit < 0.6 ? `blur(${(0.6 - hit) * 16}px)` : undefined,
                whiteSpace: 'nowrap'
              }}
            >
              {onBrand ? (
                words[wordIdx]
              ) : (
                <span style={{ backgroundImage: `linear-gradient(100deg, ${brand.primary}, ${brand.accent})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  {words[wordIdx]}
                </span>
              )}
            </div>
          </AbsoluteFill>
          {flash > 0 && <AbsoluteFill style={{ background: '#ffffff', opacity: flash * 0.35 }} />}
        </>
      )}

      {f >= lockStart && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${lockPush})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
            {icon && (
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 40,
                  display: 'grid',
                  placeItems: 'center',
                  background: '#ffffff',
                  color: brand.primary,
                  boxShadow: '0 30px 60px -20px rgba(0,0,0,.35)',
                  transform: `scale(${lock}) rotate(${(1 - lock) * -25}deg)`
                }}
              >
                {icon}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 18px',
                  borderRadius: 999,
                  background: hexA('#ffffff', 0.2),
                  color: '#ffffff',
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  opacity: lockText,
                  transform: `translateY(${(1 - lockText) * 16}px)`
                }}
              >
                {badge}
              </div>
              <div
                style={{
                  fontSize: 132,
                  fontWeight: 800,
                  letterSpacing: '-0.045em',
                  lineHeight: 1,
                  color: '#ffffff',
                  opacity: lockText,
                  transform: `translateX(${(1 - lockText) * 60}px)`,
                  whiteSpace: 'nowrap'
                }}
              >
                {title}
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
