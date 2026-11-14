// Video "UVGo: del boceto al prototipo". Solo visual, sin voz.
// Cuatro mesas de trabajo (Login, Inicio, Cotizar, Seguimiento) se construyen en vivo:
// boceto a lapiz -> bloques grises -> diseno real -> prototipo v0.1 (notas, zonas clicables,
// partes en construccion) y una flecha de flujo lleva a la siguiente pantalla.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { EndCard } from '../../../../core/templates/EndCard';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { useBrand } from '../../../../core/theme';
import { AB_H, AB_W, Artboard, FlowArrow, Hotspot, ProtoRibbon, Redline, Sticky, type Stages } from '../../components/artboard';
import { GRAPHITE, HAND } from '../../components/build';
import { C } from '../../components/ui';
import { COTIZAR_HOT, CotizarScreen, INICIO_HOT, InicioScreen, LAYOUT_BG, LOGIN_BG, LOGIN_HOT, LoginScreen, SeguimientoScreen } from './screens';

const INTRO = 90;
const SEG = 450;
const GAP = 1700;
const N = 4;
const OV = INTRO + N * SEG;
const END = OV + 250;
export const DURATION = END + 130;

const base = (i: number) => INTRO + i * SEG;
const stages = (i: number): Stages => ({ sketch: base(i) + 40, wire: base(i) + 150, paint: base(i) + 235, proto: base(i) + 330 });
const X = (i: number) => i * GAP;

const CANVAS = '#e7ebe4';

type Hot = { x: number; y: number; w: number; h: number };
const HOTS: (Hot | null)[] = [LOGIN_HOT, INICIO_HOT, COTIZAR_HOT, null];

const NOTES: { x: number; y: number; text: string; rot: number; color?: string }[][] = [
  [
    { x: 40, y: 690, text: 'validar dominio @uvg.edu.gt', rot: -5 },
    { x: 1100, y: 210, text: 'falta: recuperar contraseña', rot: 4, color: '#fbcfe8' }
  ],
  [
    { x: 150, y: 640, text: 'conectar datos reales', rot: -4 },
    { x: 1150, y: 690, text: '¿ordenar por urgencia?', rot: 5, color: '#bae6fd' }
  ],
  [
    { x: 230, y: 600, text: 'probar PDFs de varios cursos', rot: -3 },
    { x: 1030, y: 190, text: 'abrir Mecatrónica en v0.2', rot: 4, color: '#bae6fd' }
  ],
  [
    { x: 620, y: 650, text: 'conectar historial real', rot: -4 },
    { x: 1160, y: 250, text: 'validar tipo de archivo', rot: 5, color: '#fbcfe8' }
  ]
];

const REDLINES: { x1: number; y1: number; x2: number; y2: number; label: string }[][] = [
  [{ x1: 440, y1: 730, x2: 1000, y2: 730, label: '560' }],
  [
    { x1: 537, y1: 300, x2: 553, y2: 300, label: '16' },
    { x1: 1060, y1: 30, x2: 1400, y2: 30, label: '340' }
  ],
  [{ x1: 104, y1: 100, x2: 647, y2: 100, label: '1fr' }, { x1: 663, y1: 100, x2: 1424, y2: 100, label: '1.4fr' }],
  [{ x1: 104, y1: 892, x2: 444, y2: 892, label: '340' }]
];

const SCREENS: { name: string; bg: string; el: (s: Stages) => ReactNode }[] = [
  { name: 'Login', bg: LOGIN_BG, el: (s) => <LoginScreen s={s} /> },
  { name: 'Inicio', bg: LAYOUT_BG, el: (s) => <InicioScreen s={s} /> },
  { name: 'Cotizar', bg: LAYOUT_BG, el: (s) => <CotizarScreen s={s} /> },
  { name: 'Seguimiento', bg: LAYOUT_BG, el: (s) => <SeguimientoScreen s={s} /> }
];

/** Punto de la mesa al que se acerca la camara en la fase de prototipo. */
const FOCUS = [
  { x: 720, y: 470, z: 1.42 },
  { x: 860, y: 330, z: 1.22 },
  { x: 560, y: 420, z: 1.15 },
  { x: 760, y: 330, z: 1.2 }
];

const CAM: CamKey[] = (() => {
  const k: CamKey[] = [{ f: 0, fx: X(0) + 720, fy: 440, z: 0.86 }];
  for (let i = 0; i < N; i++) {
    const b = base(i);
    k.push({ f: b + 40, fx: X(i) + 720, fy: 430, z: 1.0 });
    k.push({ f: b + 230, fx: X(i) + 720, fy: 430, z: 1.03 });
    // Fase de prototipo: acerca la camara a la accion y vuelve antes de la flecha.
    const p = stages(i).proto;
    const focus = FOCUS[i];
    k.push({ f: p + 4, fx: X(i) + focus.x, fy: focus.y, z: focus.z });
    k.push({ f: p + 80, fx: X(i) + focus.x, fy: focus.y, z: focus.z });
    k.push({ f: p + 104, fx: X(i) + 720, fy: 430, z: 1.0 });
    k.push({ f: b + 440, fx: X(i) + 720, fy: 430, z: 1.0 });
  }
  const mid = (X(N - 1) + AB_W) / 2;
  k.push({ f: OV + 70, fx: mid, fy: 430, z: 0.27 });
  k.push({ f: END, fx: mid, fy: 430, z: 0.285 });
  return k;
})();

/** Cursor de cada pantalla del prototipo (solo durante su fase de prototipo). */
const ProtoCursor: FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const s = stages(i);
  const hot = HOTS[i];
  if (!hot || frame < s.proto - 2 || frame > s.proto + 120) return null;
  const ox = X(i);
  const cx = ox + hot.x + hot.w / 2;
  const cy = hot.y + hot.h / 2;
  const path: Waypoint[] =
    i === 0
      ? [
          { f: s.proto, x: ox + 760, y: 470 },
          { f: s.proto + 6, x: ox + 640, y: 400, click: true },
          { f: s.proto + 40, x: ox + 640, y: 400 },
          { f: s.proto + 44, x: ox + 640, y: 486, click: true },
          { f: s.proto + 74, x: cx, y: cy },
          { f: s.proto + 80, x: cx, y: cy, click: true }
        ]
      : [
          { f: s.proto + 30, x: cx + 260, y: cy + 220 },
          { f: s.proto + 74, x: cx, y: cy },
          { f: s.proto + 80, x: cx, y: cy, click: true }
        ];
  return <Cursor path={path} />;
};

const Intro: FC = () => {
  const frame = useCurrentFrame();
  const out = kf(frame, [INTRO - 20, INTRO + 4], [0, 1], EASE.in);
  const logo = sp(frame, 4, SPRING.soft);
  const line = kf(frame, [30, 56], [0, 1], EASE.out);
  if (frame > INTRO + 5) return null;
  return (
    <AbsoluteFill
      style={{
        background: '#fbf8f1',
        backgroundImage: 'linear-gradient(rgba(14,165,233,.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(14,165,233,.12) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - out
      }}
    >
      <Img src={staticFile('uvgo/brand/logo.png')} style={{ height: 120, opacity: logo, transform: `translateY(${(1 - logo) * 20}px)` }} />
      <div style={{ position: 'relative', marginTop: 30 }}>
        <div style={{ fontFamily: HAND, fontSize: 92, fontWeight: 700, color: GRAPHITE, opacity: kf(frame, [16, 30], [0, 1]) }}>del boceto al prototipo</div>
        <svg width={760} height={30} style={{ position: 'absolute', left: 0, bottom: -18, overflow: 'visible' }}>
          <path d="M 10 18 C 200 4, 420 30, 740 10" stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={`${800 * line} 800`} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const Outro: FC = () => {
  const frame = useCurrentFrame();
  const e = sp(frame, OV + 90, SPRING.smooth);
  const q = kf(frame, [END - 14, END], [0, 1], EASE.in);
  if (frame < OV + 88 || frame > END + 1) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', opacity: e * (1 - q), transform: `translateY(${(1 - e) * 40}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '20px 34px', borderRadius: 999, background: '#fff', boxShadow: '0 30px 60px -30px rgba(0,0,0,.45)' }}>
        <Img src={staticFile('uvgo/brand/logo.png')} style={{ height: 44 }} />
        <div style={{ width: 2, height: 40, background: C.border }} />
        <div style={{ fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>Prototipo navegable</div>
        <div style={{ padding: '8px 18px', borderRadius: 999, background: C.coral, color: '#fff', fontSize: 26, fontWeight: 800 }}>v0.1</div>
      </div>
    </div>
  );
};

export const BocetoPrototipo: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: CANVAS, fontFamily: brand.font, overflow: 'hidden' }}>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: -3000, top: -3000, width: 14000, height: 7000, backgroundImage: 'radial-gradient(rgba(29,65,27,.14) 3px, transparent 3px)', backgroundSize: '48px 48px' }} />
        {SCREENS.map((sc, i) => {
          const s = stages(i);
          const hot = HOTS[i];
          return (
            <div key={sc.name}>
              <Artboard x={X(i)} y={0} num={`0${i + 1}`} name={sc.name} s={s} finalBg={sc.bg}>
                {sc.el(s)}
                {REDLINES[i].map((r, k) => (
                  <Redline key={k} {...r} at={s.paint + 50 + k * 10} out={s.proto - 6} />
                ))}
                <ProtoRibbon at={s.proto} />
                {hot && <Hotspot {...hot} at={s.proto + 58} r={i === 2 ? 12 : 99} />}
              </Artboard>
              <div style={{ position: 'absolute', left: X(i), top: 0, width: AB_W, height: AB_H }}>
                {NOTES[i].map((n, k) => (
                  <Sticky key={k} x={n.x} y={n.y} text={n.text} rot={n.rot} color={n.color} at={s.proto + 14 + k * 18} />
                ))}
              </div>
              {hot && i < N - 1 && <FlowArrow x1={X(i) + hot.x + hot.w} y1={hot.y + hot.h / 2} x2={X(i + 1) - 6} y2={AB_H / 2} at={s.proto + 88} />}
              <ProtoCursor i={i} />
            </div>
          );
        })}
      </Camera>
      <Outro />
      <Intro />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: LAYOUT_BG, opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="De un boceto a UVGo" highlight={['UVGo']} subtitle="Prototipo v0.1 · Login · Inicio · Cotizar · Seguimiento" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={130} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
