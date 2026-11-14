// Video "UVGo: estados del pedido". Funcionalidad, sin voz.
// Por cotizar (estudiante) -> el admin pone precios y envía la cotización -> Cotizada (estudiante ve
// el total y sube su comprobante) -> Confirmada. Termina ahí: no valida el pago ni asigna conductor.
import type { FC } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { ListChecks } from 'lucide-react';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Caption } from '../../../../core/Caption';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { windowMotion } from '../../../../core/AppWindow';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { SPRING, kf, sp } from '../../../../core/anim';
import { caretOn, typed, typedEnd } from '../../../../core/typing';
import { useBrand } from '../../../../core/theme';
import { BrowserFrame, CHROME_H, VW } from '../crear-cuenta/screens';
import { A, AD, AdminScreen, EstadoTracker, MisSolicitudesScreen, type AdminState, type AlumnoState, type Fase, type TextState } from './screens';

const SHIFT = launchIntroLength(0) - 8;
const BODY = 820;
const END = SHIFT + BODY;
export const DURATION = END + 100;

const WX = (1920 - VW) / 2;
const WY = 70;
const ui = (p: { x: number; y: number }) => ({ x: WX + p.x, y: WY + CHROME_H + p.y });

// ---------------------------------------------------------------- tiempos del cuerpo

const T = {
  toAdmin: 200,
  precio: 250,
  cargo: 278,
  notas: 300,
  enviarCot: 346,
  cotSent: 366,
  toAlumno: 446,
  drop: 540,
  enviarComp: 580,
  confirmado: 604,
  winOut: 800
};
const PRECIO = '95.00';
const CARGO = '25.00';
const NOTAS = 'Llega en 3 días hábiles';

const text = (f: number, value: string, focus: boolean): TextState => ({ value, focus, caret: caretOn(f) });
const press = (f: number, at: number) => kf(f, [at + 1, at + 4, at + 10], [1, 0.94, 1]);

const adminState = (f: number): AdminState => ({
  precio: text(f, typed(f, PRECIO, T.precio + 4, 2), f >= T.precio + 2 && f < T.cargo + 2),
  cargo: text(f, typed(f, CARGO, T.cargo + 4, 2), f >= T.cargo + 2 && f < T.notas + 2),
  notas: text(f, typed(f, NOTAS, T.notas + 4, 1.2), f >= T.notas + 2 && f < T.enviarCot + 2),
  sending: f >= T.enviarCot + 2 && f < T.cotSent,
  sendPress: press(f, T.enviarCot),
  sent: f >= T.cotSent,
  aviso: kf(f, [T.cotSent, T.cotSent + 8], [0, 1])
});

const alumnoState = (f: number): AlumnoState => {
  const fase: Fase = f < T.toAlumno ? 'solicitado' : f < T.confirmado ? 'cotizado' : 'confirmado';
  const popAt = fase === 'confirmado' ? T.confirmado : T.toAlumno;
  return {
    fase,
    archivo: f >= T.drop + 6,
    sending: f >= T.enviarComp + 2 && f < T.confirmado,
    sendPress: press(f, T.enviarComp),
    dropHover: f >= T.drop - 8 && f < T.drop + 6,
    aviso: kf(f, [T.confirmado, T.confirmado + 8], [0, 1]),
    pop: f >= popAt && f < popAt + 16 ? 1 + 0.25 * Math.sin(((f - popAt) / 16) * Math.PI) : 1
  };
};

// ---------------------------------------------------------------- cámara, cursor y línea de estados

const C = (f: number, x: number, y: number, z: number): CamKey => ({ f, fx: x, fy: y, z });
const WIDE = (f: number) => C(f, 960, 470, 0.72);
const CAM: CamKey[] = [
  WIDE(0),
  WIDE(70),
  C(96, 1000, 470, 1.35),
  C(170, 1000, 470, 1.35),
  WIDE(196),
  WIDE(214),
  C(240, 994, 700, 1.4),
  C(352, 994, 700, 1.4),
  C(376, 960, 485, 1.3),
  C(408, 960, 485, 1.3),
  WIDE(432),
  WIDE(462),
  C(488, 1018, 520, 1.45),
  C(686, 1018, 520, 1.45),
  WIDE(712),
  WIDE(820)
];

const CURSOR: Waypoint[] = (() => {
  const w: Waypoint[] = [];
  const at = (f: number, p: { x: number; y: number }, click = false) => w.push({ f, ...ui(p), click });
  at(230, { x: 1100, y: 560 });
  at(T.precio, AD.precio, true);
  at(typedEnd(PRECIO, T.precio + 4, 2), AD.precio);
  at(T.cargo, AD.cargo, true);
  at(typedEnd(CARGO, T.cargo + 4, 2), AD.cargo);
  at(T.notas, AD.notas, true);
  at(typedEnd(NOTAS, T.notas + 4, 1.2), AD.notas);
  at(T.enviarCot, AD.enviar, true);
  at(T.enviarCot + 40, AD.enviar);
  at(500, { x: 980, y: 560 });
  at(T.drop, A.drop, true);
  at(T.drop + 16, A.drop);
  at(T.enviarComp, A.enviar, true);
  at(T.enviarComp + 50, A.enviar);
  return w;
})();

/** Progreso de la línea de estados: 1 = Por cotizar, 2 = Cotizada, 3 = Confirmada. */
const progress = (f: number) => kf(f, [22, 40], [0, 1]) + kf(f, [440, 458], [0, 1]) + kf(f, [716, 734], [0, 1]);
const trackerShow = (f: number) =>
  Math.max(
    Math.min(sp(f, 12, SPRING.smooth), 1 - kf(f, [70, 80], [0, 1])),
    Math.min(sp(f, 188, SPRING.smooth), 1 - kf(f, [228, 238], [0, 1])),
    Math.min(sp(f, 428, SPRING.smooth), 1 - kf(f, [474, 484], [0, 1])),
    sp(f, 706, SPRING.smooth)
  );
const role = (f: number) =>
  f < 186 ? 'Estudiante · Mis solicitudes' : f < 426 ? 'Admin UVGo · Solicitudes' : f < 704 ? 'Estudiante · Mis solicitudes' : 'Estudiante · Pedido confirmado';

// ---------------------------------------------------------------- escenas

const Body: FC = () => {
  const f = useCurrentFrame();
  const admin = kf(f, [T.toAdmin, T.toAdmin + 10], [0, 1]) - kf(f, [T.toAlumno, T.toAlumno + 10], [0, 1]);
  const route = admin > 0.5 ? '/admin/solicitudes' : '/mis-solicitudes';
  const flash = Math.max(kf(f, [T.toAdmin, T.toAdmin + 4, T.toAdmin + 24], [0, 1, 0]), kf(f, [T.toAlumno, T.toAlumno + 4, T.toAlumno + 24], [0, 1, 0]));

  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: WX, top: WY, perspective: 2400 }}>
          <div style={{ position: 'relative', ...windowMotion(f, 0, T.winOut) }}>
            <BrowserFrame route={route} routeFlash={flash}>
              {admin < 1 && (
                <div style={{ position: 'absolute', inset: 0, opacity: 1 - admin }}>
                  <MisSolicitudesScreen st={alumnoState(f)} />
                </div>
              )}
              {admin > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: admin }}>
                  <AdminScreen st={adminState(f)} />
                </div>
              )}
            </BrowserFrame>
          </div>
        </div>
        {f >= 228 && f < 650 && <Cursor path={CURSOR} scale={0.8} />}
      </Camera>

      <EstadoTracker progress={progress(f)} role={role(f)} show={trackerShow(f)} />

      <Caption at={100} out={166} text="Tu solicitud queda Por cotizar" />
      <Caption at={242} out={336} text="El equipo UVGo pone los precios" />
      <Caption at={340} out={404} text="Y envía la cotización" />
      <Caption at={492} out={590} text="Revisa el total y sube tu comprobante" />
      <Caption at={606} out={682} text="Tu pedido queda Confirmado" />
    </AbsoluteFill>
  );
};

const BACKDROP = 'radial-gradient(circle at 18% 12%, #3d6b39 0%, transparent 45%), radial-gradient(circle at 88% 90%, rgba(224,122,95,.35) 0%, transparent 40%), linear-gradient(160deg, #245021 0%, #1d411b 50%, #132c12 100%)';

export const EstadosPedido: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Estados del pedido" badge="SEGUIMIENTO" icon={<ListChecks size={64} strokeWidth={2.2} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)', opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="Tu pedido, confirmado." highlight={['confirmado']} subtitle="Por cotizar → Cotizada → Confirmada" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={130} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

