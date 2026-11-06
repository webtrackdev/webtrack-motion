// Video de mejora: herramientas de IA (MCP) mas seguras y claras. PR reactive-backend#521.
// Guion en guion.md. Entrada rapida (LaunchIntro) y el cuerpo en un Sequence despues de ella.
import { Check, CircleAlert, Fingerprint, KeyRound, MapPin, Sparkles } from 'lucide-react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { Backdrop } from '../../../../core/Backdrop';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { SideHeader } from '../../../../core/templates/SideHeader';
import { BRAND } from '../../platform';
import { fontFamily } from '../../fonts';
import { ErrorsScene, KeysScene, OptimizationScene, PermissionsScene, RECAP, ValidationScene } from './Scenes';
import '../../style.css';

const S = {
  keys: [70, 240] as const,
  perms: [240, 430] as const,
  valid: [430, 620] as const,
  errors: [620, 790] as const,
  optim: [790, 980] as const,
  recap: [980, 1080] as const,
  end: { title: 1086, subtitle: 1104, logo: 1120 }
};
const BODY_DURATION = 1200;

const Body = () => {
  const frame = useCurrentFrame();
  const local = (r: readonly [number, number]) => frame - r[0];
  const visible = (r: readonly [number, number]) => frame >= r[0] - 2 && frame < r[1] + 2;
  const sceneOut = (r: readonly [number, number]) => 1 - kf(frame, [r[1] - 12, r[1]], [0, 1], EASE.in);
  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />

      {visible(S.keys) && (
        <AbsoluteFill style={{ opacity: sceneOut(S.keys) }}>
          <KeysScene f={local(S.keys)} />
        </AbsoluteFill>
      )}
      <SideHeader tag="1 · CREDENCIALES" icon={<KeyRound size={20} />} title="Una llave a la vez" body="Una API key de solo lectura ya no puede escribir aunque venga con un token de sesión." at={S.keys[0] + 4} out={S.keys[1] - 10} />

      {visible(S.perms) && (
        <AbsoluteFill style={{ opacity: sceneOut(S.perms) }}>
          <PermissionsScene f={local(S.perms)} />
        </AbsoluteFill>
      )}
      <SideHeader tag="2 · PERMISOS" icon={<Fingerprint size={20} />} title="Cada acción, su permiso" body="Crear con un agente exige permiso de agregar, y editar exige permiso de editar." at={S.perms[0] + 4} out={S.perms[1] - 10} />

      {visible(S.valid) && (
        <AbsoluteFill style={{ opacity: sceneOut(S.valid) }}>
          <ValidationScene f={local(S.valid)} />
        </AbsoluteFill>
      )}
      <SideHeader tag="3 · VALIDACIONES" icon={<MapPin size={20} />} title="Solo datos válidos" body="Nada de coordenadas 0,0 o fuera de rango, y solo en organizaciones a tu alcance." at={S.valid[0] + 4} out={S.valid[1] - 10} />

      {visible(S.errors) && (
        <AbsoluteFill style={{ opacity: sceneOut(S.errors) }}>
          <ErrorsScene f={local(S.errors)} />
        </AbsoluteFill>
      )}
      <SideHeader tag="4 · ERRORES CLAROS" icon={<CircleAlert size={20} />} title="Errores que se entienden" body="Si falta un parámetro obligatorio, el agente recibe su nombre." at={S.errors[0] + 4} out={S.errors[1] - 10} />

      {visible(S.optim) && (
        <AbsoluteFill style={{ opacity: sceneOut(S.optim) }}>
          <OptimizationScene f={local(S.optim)} />
        </AbsoluteFill>
      )}
      <SideHeader tag="5 · OPTIMIZACIÓN" icon={<Sparkles size={20} />} title="Tus descansos se quedan" body="Al agregar una corrida a un plan, las demás conservan sus descansos y asignaciones." at={S.optim[0] + 4} out={S.optim[1] - 10} />

      {visible(S.recap) && (
        <AbsoluteFill>
          <div style={{ position: 'absolute', left: 150, top: 230, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {RECAP.map((t, i) => {
              const p = sp(frame, S.recap[0] + 4 + i * 6, SPRING.pop);
              const q = kf(frame, [S.recap[1] - 10, S.recap[1]], [0, 1], EASE.in);
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: Math.min(1, p * 1.5) * (1 - q), transform: `translateX(${(1 - p) * -60}px)` }}>
                  <div style={{ width: 58, height: 58, borderRadius: 29, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`, color: '#fff', flex: 'none' }}>
                    <Check size={32} strokeWidth={3.5} />
                  </div>
                  <div style={{ fontSize: 52, fontWeight: 800, color: BRAND.ink, letterSpacing: '-0.02em' }}>{t}</div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: 'absolute',
              left: 1340 + kf(frame, [S.recap[0], S.recap[1]], [-140, 260], (t) => t),
              top: 260 - kf(frame, [S.recap[0], S.recap[1]], [-60, 120], (t) => t),
              width: 420,
              opacity: kf(frame, [S.recap[0], S.recap[0] + 10, S.recap[1] - 8, S.recap[1]], [0, 1, 1, 0]),
              transform: `rotate(${-8 + Math.sin(frame / 8) * 3}deg)`
            }}
          >
            <Img src={staticFile('webtrack/webi/webi-cohete-flotando.svg')} style={{ width: 420 }} />
          </div>
        </AbsoluteFill>
      )}

      {frame >= S.recap[1] && <EndCard title="Webi, más seguro." highlight={['seguro']} subtitle="Agentes de IA con los permisos correctos." at={S.end} />}
    </AbsoluteFill>
  );
};

// Entrada y cuerpo: el cuerpo arranca cuando la entrada empieza a salir.
// Funcionalidad: solo el titulo y directo a los detalles. El cuerpo se monta desde la primera
// mejora (S.keys), alineada con la salida de la entrada.
const SHIFT = launchIntroLength(0) - 8;
const SKIP = S.keys[0];
export const DURATION = BODY_DURATION - SKIP + SHIFT;

export const WebiMcpSeguro = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT - SKIP}>
      <Body />
    </Sequence>
    <LaunchIntro
      title="Webi, más seguro"
      icon={<Img src={staticFile('webtrack/webi/webi-frente.svg')} style={{ width: 96, marginTop: 34 }} />}
    />
  </AbsoluteFill>
);
