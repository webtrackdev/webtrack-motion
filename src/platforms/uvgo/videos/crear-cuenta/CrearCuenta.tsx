// Video "UVGo: crear cuenta". Funcionalidad, sin voz.
// Entrada con solo el título y de una al flujo real: pestaña Crear cuenta -> formulario de
// registro (nombre, correo @uvg.edu.gt, teléfono, carné, carrera opcional, contraseña de 12+)
// -> "Creando cuenta…" -> la app inicia sesión sola y redirige a /dashboard (Inicio vacío).
import type { FC } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { CircleCheck, Lock, Mail, UserPlus } from 'lucide-react';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Caption } from '../../../../core/Caption';
import { Callout } from '../../../../core/Callout';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { windowMotion } from '../../../../core/AppWindow';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { EASE, kf } from '../../../../core/anim';
import { caretOn, typed, typedEnd } from '../../../../core/typing';
import { useBrand } from '../../../../core/theme';
import { AccessScreen, BrowserFrame, CHROME_H, INICIO, InicioScreen, TAB_REGISTRO, VW, registroTargets, type FieldState, type RegistroState } from './screens';

const SHIFT = launchIntroLength(0) - 8;
const BODY = 600;
const END = SHIFT + BODY;
export const DURATION = END + 100;

// Ventana en el escenario: contenido de la app desde (WX, WY + barra)
const WX = (1920 - VW) / 2;
const WY = 70;
const ui = (p: { x: number; y: number }) => ({ x: WX + p.x, y: WY + CHROME_H + p.y });

// ---------------------------------------------------------------- tiempos del cuerpo

const T = {
  tabClick: 48,
  morph: [52, 64],
  submit: 278,
  redirect: 332,
  winOut: 580
};

type Key = 'nombre' | 'correo' | 'telefono' | 'carne' | 'carrera' | 'contrasena';
const FIELDS: { key: Key; click: number; text: string; fpc: number }[] = [
  { key: 'nombre', click: 72, text: 'Ana Lucía López', fpc: 1.4 },
  { key: 'correo', click: 106, text: 'ana.lopez@uvg.edu.gt', fpc: 1.4 },
  { key: 'telefono', click: 148, text: '5555 0123', fpc: 1.4 },
  { key: 'carne', click: 174, text: '23145', fpc: 1.4 },
  { key: 'carrera', click: 194, text: 'Ingeniería Mecatrónica', fpc: 1.4 },
  { key: 'contrasena', click: 240, text: 'uvgo-mecatronica', fpc: 1.2 }
];
const startOf = (i: number) => FIELDS[i].click + 6;
const endOf = (i: number) => typedEnd(FIELDS[i].text, startOf(i), FIELDS[i].fpc);

const TGT = registroTargets();

const registroState = (f: number): RegistroState => {
  const st = {} as Record<Key, FieldState>;
  FIELDS.forEach((fd, i) => {
    const next = i < FIELDS.length - 1 ? FIELDS[i + 1].click : T.submit;
    const focus = f >= fd.click + 2 && f < next + 2;
    st[fd.key] = { value: typed(f, fd.text, startOf(i), fd.fpc), focus, caret: caretOn(f) };
  });
  return {
    ...st,
    pending: f >= T.submit + 2,
    press: kf(f, [T.submit + 1, T.submit + 4, T.submit + 10], [1, 0.97, 1])
  };
};

// ---------------------------------------------------------------- cámara (coordenadas del escenario)

const C = (f: number, x: number, y: number, z: number): CamKey => ({ f, fx: x, fy: y, z });
const CAM: CamKey[] = [
  C(0, 960, 540, 0.98),
  C(34, 960, 540, 1.0),
  C(66, 960, 500, 1.75),
  C(140, 960, 500, 1.75),
  C(180, 960, 610, 1.75),
  C(236, 960, 690, 1.75),
  C(292, 960, 690, 1.75),
  C(326, 960, 600, 0.92),
  C(392, 960, 600, 0.92),
  C(430, 810, 420, 1.7),
  C(468, 810, 420, 1.7),
  C(500, 1090, 420, 1.6),
  C(548, 1090, 420, 1.6),
  C(574, 960, 540, 0.98)
];

// ---------------------------------------------------------------- cursor (coordenadas del escenario)

const CURSOR: Waypoint[] = (() => {
  const w: Waypoint[] = [];
  const at = (f: number, p: { x: number; y: number }, click = false) => w.push({ f, ...ui(p), click });
  at(28, { x: 1000, y: 640 });
  at(T.tabClick, TAB_REGISTRO, true);
  at(T.morph[1], TAB_REGISTRO);
  FIELDS.forEach((fd, i) => {
    // el cursor queda sobre el campo mientras se escribe y luego pasa al siguiente
    const p = { x: TGT[fd.key].x + 60, y: TGT[fd.key].y + 6 };
    at(fd.click, p, true);
    at(endOf(i), p);
  });
  at(T.submit, { x: TGT.submit.x + 40, y: TGT.submit.y + 4 }, true);
  at(T.submit + 40, { x: TGT.submit.x + 40, y: TGT.submit.y + 4 });
  at(T.redirect + 30, { x: 700, y: 560 });
  at(470, { x: 760, y: 300 });
  at(504, { x: INICIO.newButton.x + 30, y: INICIO.newButton.y + 6 });
  return w;
})();

// ---------------------------------------------------------------- escenas

const Body: FC = () => {
  const f = useCurrentFrame();
  const morph = kf(f, T.morph, [0, 1], EASE.inOut);
  const reg = registroState(f);
  const loggedIn = f >= T.redirect;
  const access = 1 - kf(f, [T.redirect, T.redirect + 10], [0, 1]);
  const inicio = kf(f, [T.redirect + 2, T.redirect + 12], [0, 1]);
  const enter = kf(f, [T.redirect + 4, T.redirect + 12], [0, 1], EASE.out);
  const routeFlash = kf(f, [T.redirect, T.redirect + 4, T.redirect + 24], [0, 1, 0]);
  const hoverNew = kf(f, [506, 512], [0, 1]);

  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: WX, top: WY, perspective: 2400 }}>
          <div style={{ position: 'relative', ...windowMotion(f, 0, T.winOut) }}>
          <BrowserFrame route={loggedIn ? '/dashboard' : '/login'} routeFlash={routeFlash}>
            {access > 0 && (
              <div style={{ position: 'absolute', inset: 0, opacity: access }}>
                <AccessScreen morph={morph} reg={reg} />
              </div>
            )}
            {inicio > 0 && (
              <div style={{ position: 'absolute', inset: 0, opacity: inicio }}>
                <InicioScreen nombre="Ana" initials="AL" enter={enter} hoverNew={hoverNew} />
              </div>
            )}
          </BrowserFrame>
          </div>
        </div>
        {f >= 26 && f < T.winOut + 6 && <Cursor path={CURSOR} scale={0.8} />}
      </Camera>

      <Caption at={30} out={66} text="Abre la pestaña Crear cuenta" />
      <Caption at={76} out={236} text="Completa tus datos con tu correo UVG" />
      <Caption at={268} out={348} text="Pulsa Crear cuenta y entras de una vez" />
      <Caption at={420} out={566} text="Tu Inicio, listo para tu primera cotización" />

      <Callout at={118} out={170} x={1470} y={420} width={420} icon={<Mail size={28} />} title="Correo institucional" body="Solo se aceptan @uvg.edu.gt" />
      <Callout at={246} out={292} x={40} y={570} width={420} icon={<Lock size={28} />} title="Contraseña" body="Al menos 12 caracteres" />
      <Callout at={354} out={410} x={700} y={945} width={520} tint="#2f7d32" icon={<CircleCheck size={28} />} title="Sesión iniciada" body="Crear la cuenta ya te deja dentro" />
    </AbsoluteFill>
  );
};

const BACKDROP = 'radial-gradient(circle at 18% 12%, #3d6b39 0%, transparent 45%), radial-gradient(circle at 88% 90%, rgba(224,122,95,.35) 0%, transparent 40%), linear-gradient(160deg, #245021 0%, #1d411b 50%, #132c12 100%)';

export const CrearCuenta: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Crea tu cuenta" badge="REGISTRO" icon={<UserPlus size={64} strokeWidth={2.2} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)', opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="Tu cuenta UVGo, lista." highlight={['UVGo']} subtitle="Crear cuenta → Inicio" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={130} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
