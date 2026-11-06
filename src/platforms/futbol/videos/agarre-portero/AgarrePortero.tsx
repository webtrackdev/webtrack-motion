// Tutorial sin audio: agarre de portero en "W". Guion en guion.md. 1260 frames = 42 s.
import type { FC, ReactNode } from 'react';
import { evolvePath } from '@remotion/paths';
import { Check, X } from 'lucide-react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, lerp, sp } from '../../../../core/anim';
import { Backdrop } from '../../../../core/Backdrop';
import { KineticText } from '../../../../core/KineticText';
import { Hook } from '../../../../core/templates/Hook';
import { EndCard } from '../../../../core/templates/EndCard';
import { hexA } from '../../../../core/theme';
import { BallLayer, type BallState } from '../../components/SoccerBall3D';
import { Glove, gloveKeyPoints, type GlovePlacement, type GlovePose } from '../../components/Glove';
import { KeeperArm, KeeperBody, type KeeperPose } from '../../components/Keeper';
import { BallIcon } from '../../components/BallIcon';
import { PitchLines } from '../../components/Pitch';
import { BRAND } from '../../platform';
import { fontFamily } from '../../fonts';
import '../../style.css';

export const DURATION = 1260;

const T = {
  hook: { tag: 6, line1: 12, line2: 26, out: 78 },
  intro: [86, 206] as const,
  s1: [206, 336] as const,
  s2: [336, 536] as const,
  s3: [536, 736] as const,
  s4: [736, 916] as const,
  errors: [916, 1086] as const,
  recap: [1086, 1156] as const,
  end: { title: 1162, subtitle: 1180, logo: 9999 }
};
const CX = 1250;
const CY = 560;
const GLOVE = { accent: BRAND.accent, band: BRAND.primary };

// ── Encabezado de paso (columna izquierda) ─────────────────────────────────────
const StepHeader: FC<{ n: number; title: string; body: string; at: number; out: number }> = ({ n, title, body, at, out }) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > out + 14) return null;
  const p = sp(frame, at, SPRING.pop);
  const q = kf(frame, [out, out + 12], [0, 1], EASE.in);
  const b = sp(frame, at + 14);
  return (
    <div style={{ position: 'absolute', left: 130, top: 300, width: 660, opacity: 1 - q, transform: `translateY(${-q * 20}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontSize: 36,
            fontWeight: 800,
            background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`,
            boxShadow: `0 16px 34px -12px ${hexA(BRAND.primary, 0.55)}`,
            transform: `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -20}deg)`,
            opacity: Math.min(1, p * 1.5)
          }}
        >
          {n}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.14em', color: BRAND.primary, opacity: Math.min(1, p * 1.5) }}>PASO {n} DE 4</div>
      </div>
      <KineticText text={title} start={at + 4} out={out} style={{ fontSize: 86, lineHeight: 1.02 }} />
      <div style={{ marginTop: 26, fontSize: 36, fontWeight: 600, lineHeight: 1.3, color: BRAND.muted, opacity: b * (1 - q), transform: `translateY(${(1 - b) * 16}px)` }}>{body}</div>
    </div>
  );
};

// Etiqueta con linea guia hacia un punto de la ilustracion.
const Pointer: FC<{ at: number; out: number; x: number; y: number; tx: number; ty: number; text: string }> = ({ at, out, x, y, tx, ty, text }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = sp(frame, at, SPRING.pop);
  const q = kf(frame, [out, out + 10], [0, 1]);
  const lineP = kf(frame, [at, at + 12], [0, 1], EASE.out);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - q }}>
        <line x1={x} y1={y} x2={lerp(x, tx, lineP)} y2={lerp(y, ty, lineP)} stroke={BRAND.ink} strokeWidth={3} strokeDasharray="6 6" />
        <circle cx={x} cy={y} r={9 * p} fill={BRAND.accent} stroke={BRAND.ink} strokeWidth={3} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: tx,
          top: ty,
          transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * p})`,
          opacity: Math.min(1, p * 1.5) * (1 - q),
          padding: '10px 18px',
          borderRadius: 14,
          background: BRAND.ink,
          color: '#fff',
          fontSize: 26,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          boxShadow: '0 16px 30px -14px rgba(11,26,18,.6)'
        }}
      >
        {text}
      </div>
    </>
  );
};

const ErrorCard: FC<{ at: number; x: number; ok: boolean; title: string; body: string; children: ReactNode }> = ({ at, x, ok, title, body, children }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  const q = kf(frame, [T.errors[1] - 10, T.errors[1]], [0, 1], EASE.in);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 250,
        top: 330,
        width: 500,
        height: 520,
        borderRadius: 32,
        background: '#fff',
        border: `2px solid ${ok ? hexA(BRAND.success, 0.5) : hexA(BRAND.danger, 0.35)}`,
        boxShadow: '0 40px 80px -30px rgba(11,26,18,.35)',
        opacity: Math.min(1, p * 1.5) * (1 - q),
        transform: `translateY(${(1 - p) * 60 - q * 30}px) scale(${0.85 + 0.15 * p})`,
        overflow: 'hidden'
      }}
    >
      <svg width={500} height={300} viewBox="0 0 500 300" style={{ display: 'block', background: hexA(BRAND.primary, 0.05) }}>
        {children}
      </svg>
      <div style={{ position: 'absolute', right: 22, top: 22, width: 58, height: 58, borderRadius: 29, display: 'grid', placeItems: 'center', background: ok ? BRAND.success : BRAND.danger, color: '#fff', transform: `scale(${sp(frame, at + 10, SPRING.pop)})` }}>
        {ok ? <Check size={34} strokeWidth={3.5} /> : <X size={34} strokeWidth={3.5} />}
      </div>
      <div style={{ padding: '26px 30px' }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: BRAND.ink, letterSpacing: '-0.02em' }}>{title}</div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 600, color: BRAND.muted, lineHeight: 1.3 }}>{body}</div>
      </div>
    </div>
  );
};

export const AgarrePortero = () => {
  const frame = useCurrentFrame();
  const inRange = (r: readonly [number, number], pad = 0) => frame >= r[0] - pad && frame < r[1] + pad;

  // ── Guantes (pasos 1-3) ─────────────────────────────────────────────────────
  const glovesIn = sp(frame, T.s1[0] + 6, SPRING.smooth);
  const glovesOut = kf(frame, [T.s4[0] - 10, T.s4[0] + 6], [0, 1], EASE.in);
  const toW = kf(frame, [T.s2[0] + 6, T.s2[0] + 44], [0, 1], EASE.inOut);
  const impactAt = T.s3[0] + 64;
  const impact = frame < impactAt ? 0 : sp(frame, impactAt, { damping: 9, stiffness: 160, mass: 0.6 });
  const recoil = frame < impactAt ? 0 : Math.max(0, 1 - impact) * 1 + (frame < impactAt + 4 ? 1 : 0) * 0;
  const push = frame < impactAt ? 0 : kf(frame, [impactAt, impactAt + 4, impactAt + 18], [0, 1, 0.35], EASE.out);
  const idle = Math.sin(frame / 14) * 4;
  const pose: GlovePose = {
    spread: lerp(0.55, 0.72, toW),
    thumb: lerp(18, 58, toW),
    curl: frame < impactAt ? 0 : kf(frame, [impactAt, impactAt + 10], [0, 0.7], EASE.out)
  };
  const gx = lerp(215, 157, toW);
  const gy = CY + 60 + (1 - glovesIn) * 520 + push * 16 + idle * (1 - toW * 0.5);
  const gScale = 1 - push * 0.05;
  const left: GlovePlacement = { x: CX - gx, y: gy, rotate: lerp(0, -6, toW), scale: gScale };
  const right: GlovePlacement = { ...left, x: CX + gx, mirror: true };
  const kL = gloveKeyPoints(pose, left);
  const kR = gloveKeyPoints(pose, right);
  const wPath = `M ${kL.index.x} ${kL.index.y} L ${kL.web.x} ${kL.web.y} L ${kL.thumb.x} ${kL.thumb.y} L ${kR.thumb.x} ${kR.thumb.y} L ${kR.web.x} ${kR.web.y} L ${kR.index.x} ${kR.index.y}`;
  const wDraw = kf(frame, [T.s2[0] + 48, T.s2[0] + 90], [0, 1], EASE.inOut);
  const wFade = kf(frame, [T.s3[0], T.s3[0] + 14], [0, 1]);
  const evo = evolvePath(Math.max(0.0001, wDraw), wPath);

  // ── Balon ───────────────────────────────────────────────────────────────────
  const balls: BallState[] = [];
  const spin = frame * 0.06;
  if (inRange(T.intro, 4)) {
    const p = sp(frame, T.intro[0] + 4, { damping: 16, stiffness: 70, mass: 1 });
    const out = kf(frame, [T.intro[1] - 18, T.intro[1]], [0, 1], EASE.in);
    balls.push({ x: lerp(1760, 960, p), y: lerp(140, 470, p) - out * 700, r: lerp(26, 230, p), rx: 0.5 + spin, ry: spin * 1.3, opacity: 1 - out * 0.2 });
  }
  if (inRange(T.s3) && frame >= T.s3[0] + 24) {
    const t = kf(frame, [T.s3[0] + 24, impactAt], [0, 1], EASE.in);
    const settle = push * 14;
    balls.push({
      x: lerp(CX + 60, CX, t),
      y: lerp(CY - 330, CY - 62, t) + settle,
      r: lerp(30, 172, t) * (1 - push * 0.03),
      rx: 0.3 + (frame < impactAt ? frame * 0.12 : impactAt * 0.12),
      ry: 0.4 + (frame < impactAt ? frame * 0.05 : impactAt * 0.05),
      opacity: 1 - kf(frame, [T.s4[0] - 10, T.s4[0] + 4], [0, 1])
    });
  }

  // ── Portero de perfil (paso 4) ──────────────────────────────────────────────
  const keeperIn = sp(frame, T.s4[0] + 6, SPRING.smooth);
  const keeperOut = kf(frame, [T.s4[1] - 12, T.s4[1]], [0, 1], EASE.in);
  const arrive = kf(frame, [T.s4[0] + 20, T.s4[0] + 54], [0, 1], EASE.out);
  const toChest = kf(frame, [T.s4[0] + 70, T.s4[0] + 120], [0, 1], EASE.inOut);
  const ext = { x: CX + 185, y: CY - 50 };
  const chest = { x: CX + 74, y: CY + 40 };
  const ball4 = { x: lerp(lerp(CX + 640, ext.x, arrive), chest.x, toChest), y: lerp(lerp(CY - 330, ext.y, arrive), chest.y, toChest) };
  const keeper: KeeperPose = { x: CX - 70 + (1 - keeperIn) * 300, y: CY + 150, hand: { x: ball4.x - 20, y: ball4.y + 34 }, lean: lerp(10, 4, toChest) };
  if (inRange(T.s4) && frame >= T.s4[0] + 20) {
    balls.push({ x: ball4.x, y: ball4.y, r: 74, rx: 0.4 + Math.min(frame, T.s4[0] + 54) * 0.1, ry: 0.8, opacity: 1 - keeperOut });
  }
  const keeperOpacity = Math.min(1, keeperIn * 1.5) * (1 - keeperOut);

  // Sacudida al impacto
  const shake = frame >= impactAt && frame < impactAt + 12 ? Math.sin((frame - impactAt) * 2.4) * (12 - (frame - impactAt)) * 0.8 : 0;
  const ring = frame >= impactAt ? kf(frame, [impactAt, impactAt + 18], [0, 1], EASE.out) : 0;

  const errorsVisible = inRange(T.errors, 4);
  const recapVisible = inRange(T.recap, 4);

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg, overflow: 'hidden' }}>
      <Backdrop />
      <PitchLines opacity={0.55} />

      {frame < T.intro[0] + 20 && <Hook tag="TUTORIAL · PORTEROS" lines={['Agarra el balón', 'como un portero.']} highlight={['portero']} fontSize={124} at={T.hook} />}

      {inRange(T.intro, 4) && (
        <AbsoluteFill style={{ alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: 800, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <KineticText text="4 pasos para un agarre seguro" start={T.intro[0] + 40} out={T.intro[1] - 16} highlight={['seguro']} style={{ fontSize: 72, justifyContent: 'center' }} />
          </div>
        </AbsoluteFill>
      )}

      {/* Ilustracion: guantes, W, impacto */}
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
        {frame >= T.s1[0] && frame < T.s4[0] + 10 && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - glovesOut }}>
            <ellipse cx={CX} cy={CY + 260} rx={300} ry={26} fill={hexA(BRAND.ink, 0.08)} />
            <Glove pose={pose} at={left} {...GLOVE} />
            <Glove pose={pose} at={right} {...GLOVE} />
            {wDraw > 0 && (
              <g opacity={1 - wFade}>
                <path d={wPath} stroke={BRAND.accent} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.35} strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
                <path d={wPath} stroke={BRAND.primary} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
              </g>
            )}
          </svg>
        )}

        {/* Portero de perfil: cuerpo y brazo lejano detras del balon */}
        {inRange(T.s4, 2) && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: keeperOpacity }}>
            <ellipse cx={keeper.x} cy={keeper.y + 245} rx={170} ry={22} fill={hexA(BRAND.ink, 0.1)} />
            <KeeperArm p={keeper} far jersey={BRAND.primary} accent={BRAND.accent} dx={26} />
            <KeeperBody p={keeper} jersey={BRAND.primary} accent={BRAND.accent} />
          </svg>
        )}

        <BallLayer balls={balls} rim={BRAND.accent} />

        {inRange(T.s4, 2) && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: keeperOpacity }}>
            <KeeperArm p={keeper} jersey={BRAND.primary} accent={BRAND.accent} />
          </svg>
        )}

        {ring > 0 && ring < 1 && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <circle cx={CX} cy={CY - 62} r={172 + ring * 120} fill="none" stroke={BRAND.accent} strokeWidth={10 * (1 - ring)} opacity={1 - ring} />
          </svg>
        )}
      </AbsoluteFill>

      <Pointer at={T.s2[0] + 96} out={T.s2[1] - 6} x={(kL.thumb.x + kR.thumb.x) / 2} y={kL.thumb.y} tx={CX} ty={CY + 330} text="Pulgares casi tocándose" />
      <Pointer at={T.s2[0] + 112} out={T.s2[1] - 6} x={kR.index.x} y={kR.index.y} tx={CX + 330} ty={CY - 260} text="Índices hacia arriba" />
      <Pointer at={impactAt + 30} out={T.s3[1] - 6} x={CX - 168} y={CY - 150} tx={CX - 300} ty={CY - 330} text="Dedos detrás del balón" />
      <Pointer at={impactAt + 46} out={T.s3[1] - 6} x={CX + 160} y={CY + 150} tx={CX + 330} ty={CY + 330} text="Codos flexionados" />

      <StepHeader n={1} title="Manos al frente" body="Dedos abiertos, relajados y apuntando hacia arriba." at={T.s1[0] + 4} out={T.s1[1] - 8} />
      <StepHeader n={2} title="Forma una W" body="Junta las manos: los pulgares casi se tocan y los índices miran arriba." at={T.s2[0] + 4} out={T.s2[1] - 8} />
      <StepHeader n={3} title="Atrapa detrás del balón" body="Recíbelo con los dedos y flexiona los codos para amortiguar." at={T.s3[0] + 4} out={T.s3[1] - 8} />
      <StepHeader n={4} title="Llévalo al pecho" body="Abrázalo con brazos y antebrazos para protegerlo." at={T.s4[0] + 4} out={T.s4[1] - 8} />

      {errorsVisible && (
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 150, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <KineticText text="Evita estos errores" start={T.errors[0] + 4} out={T.errors[1] - 10} highlight={['errores']} style={{ fontSize: 96, justifyContent: 'center' }} />
          </div>
          <ErrorCard at={T.errors[0] + 22} x={430} ok={false} title="Manos separadas" body="El balón se cuela entre ellas.">
            <Glove pose={{ spread: 0.6, thumb: 22 }} at={{ x: 120, y: 175, scale: 0.55 }} {...GLOVE} />
            <Glove pose={{ spread: 0.6, thumb: 22 }} at={{ x: 380, y: 175, scale: 0.55, mirror: true }} {...GLOVE} />
            <BallIcon x={250} y={110 + kf(frame, [T.errors[0] + 40, T.errors[0] + 80], [0, 120], EASE.in)} r={42} rotate={frame * 4} />
          </ErrorCard>
          <ErrorCard at={T.errors[0] + 38} x={960} ok={false} title="Palmas rígidas" body="El balón rebota y se escapa.">
            <Glove pose={{ spread: 0.7, thumb: 58 }} at={{ x: 200, y: 190, scale: 0.55, rotate: -6 }} {...GLOVE} />
            <Glove pose={{ spread: 0.7, thumb: 58 }} at={{ x: 300, y: 190, scale: 0.55, rotate: -6, mirror: true }} {...GLOVE} />
            <path d="M 255 115 Q 300 50 360 70" stroke={BRAND.danger} strokeWidth={6} fill="none" strokeDasharray="10 8" strokeLinecap="round" />
            <BallIcon x={lerp(250, 370, kf(frame, [T.errors[0] + 56, T.errors[0] + 90], [0, 1], EASE.out))} y={lerp(120, 100, kf(frame, [T.errors[0] + 56, T.errors[0] + 90], [0, 1], EASE.out))} r={42} rotate={frame * 5} />
          </ErrorCard>
          <ErrorCard at={T.errors[0] + 54} x={1490} ok title="W firme" body="Agarre seguro y controlado.">
            <Glove pose={{ spread: 0.72, thumb: 58, curl: 0.6 }} at={{ x: 200, y: 190, scale: 0.55, rotate: -6 }} {...GLOVE} />
            <Glove pose={{ spread: 0.72, thumb: 58, curl: 0.6 }} at={{ x: 300, y: 190, scale: 0.55, rotate: -6, mirror: true }} {...GLOVE} />
            <BallIcon x={250} y={150} r={60} rotate={10} />
          </ErrorCard>
        </AbsoluteFill>
      )}

      {recapVisible && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {['Manos al frente', 'Forma una W', 'Atrapa detrás del balón', 'Llévalo al pecho'].map((t, i) => {
              const p = sp(frame, T.recap[0] + 4 + i * 7, SPRING.pop);
              const q = kf(frame, [T.recap[1] - 8, T.recap[1] + 2], [0, 1], EASE.in);
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: Math.min(1, p * 1.5) * (1 - q), transform: `translateX(${(1 - p) * -60}px)` }}>
                  <div style={{ width: 62, height: 62, borderRadius: 31, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`, color: '#fff' }}>
                    <Check size={34} strokeWidth={3.5} />
                  </div>
                  <div style={{ fontSize: 64, fontWeight: 800, color: BRAND.ink, letterSpacing: '-0.02em' }}>{t}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {frame >= T.recap[1] && <EndCard title="Atrapa con seguridad." highlight={['seguridad']} subtitle="Practica la W en cada entrenamiento." at={T.end} />}
    </AbsoluteFill>
  );
};
