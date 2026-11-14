// Video "UVGo: crear un pedido". Funcionalidad, sin voz.
// Cotizar -> Electrónica -> busca "servomotor 360" en el Stock (sin coincidencias) -> lo busca en el
// Buscador de productos -> Agregar -> Crear pedido -> llena el diálogo "Solicitar cotización" -> enviada.
import type { FC } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Globe, Mail, PackagePlus } from 'lucide-react';
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
import { BrowserFrame, CHROME_H, VW } from '../crear-cuenta/screens';
import { CotizarInicioScreen, D, ElectronicaScreen, P, SolicitudDialog, type DialogState, type TextState } from './screens';

const SHIFT = launchIntroLength(0) - 8;
const BODY = 690;
const END = SHIFT + BODY;
export const DURATION = END + 100;

const WX = (1920 - VW) / 2;
const WY = 70;
const ui = (p: { x: number; y: number }) => ({ x: WX + p.x, y: WY + CHROME_H + p.y });

// ---------------------------------------------------------------- tiempos del cuerpo

const QUERY = 'servomotor 360';
const T = {
  elecClick: 50,
  route: 54,
  stockClick: 84,
  stockType: 88,
  stockEnter: 114,
  stockDone: 132,
  extClick: 172,
  extType: 176,
  buscar: 204,
  extDone: 256,
  add: 284,
  crear: 330,
  plus: 366,
  enviar: 556,
  success: 586,
  winOut: 670
};

type DKey = 'curso' | 'catedratico' | 'fecha' | 'punto' | 'obs';
const DFIELDS: { key: DKey; click: number; text: string }[] = [
  { key: 'curso', click: 380, text: 'Robótica Móvil' },
  { key: 'catedratico', click: 410, text: 'Ing. Carlos Méndez' },
  { key: 'fecha', click: 446, text: '25/11/2026' },
  { key: 'punto', click: 470, text: 'Edificio J, lobby' },
  { key: 'obs', click: 504, text: 'Rotación continua, 5 V' }
];
const FPC = 1.4;
const dStart = (i: number) => DFIELDS[i].click + 4;

const text = (f: number, value: string, focus: boolean): TextState => ({ value, focus, caret: caretOn(f) });
const press = (f: number, at: number) => kf(f, [at + 1, at + 4, at + 10], [1, 0.94, 1]);

const electronica = (f: number) => {
  const stockVal = typed(f, QUERY, T.stockType, FPC);
  const extVal = typed(f, QUERY, T.extType, FPC);
  return {
    stock: { ...text(f, stockVal, f >= T.stockClick + 2 && f < T.extClick + 2), query: f >= T.stockEnter ? QUERY : '', loading: f >= T.stockEnter && f < T.stockDone },
    ext: { ...text(f, extVal, f >= T.extClick + 2 && f < T.buscar + 2), query: f >= T.buscar + 2 ? QUERY : '', loading: f >= T.buscar + 2 && f < T.extDone },
    buscarPress: press(f, T.buscar),
    added: f >= T.add + 2,
    addPress: press(f, T.add),
    crearPress: press(f, T.crear)
  };
};

const dialog = (f: number): DialogState => {
  const st = {} as Record<DKey, TextState>;
  DFIELDS.forEach((fd, i) => {
    const next = i < DFIELDS.length - 1 ? DFIELDS[i + 1].click : T.enviar;
    st[fd.key] = text(f, typed(f, fd.text, dStart(i), FPC), f >= fd.click + 2 && f < next + 2);
  });
  return {
    ...st,
    cantidad: f >= T.plus + 2 ? 2 : 1,
    plusPress: press(f, T.plus),
    sending: f >= T.enviar + 2 && f < T.success,
    sendPress: press(f, T.enviar),
    success: f >= T.success
  };
};

// ---------------------------------------------------------------- cámara y cursor (escenario)

const C = (f: number, x: number, y: number, z: number): CamKey => ({ f, fx: x, fy: y, z });
const CAM: CamKey[] = [
  C(0, 960, 540, 0.98),
  C(28, 960, 540, 1.0),
  C(48, 1060, 480, 1.3),
  C(58, 1060, 480, 1.3),
  C(80, 860, 470, 1.55),
  C(146, 860, 470, 1.55),
  C(170, 1060, 470, 1.55),
  C(292, 1060, 470, 1.55),
  C(318, 1010, 700, 1.4),
  C(338, 1010, 700, 1.4),
  C(358, 960, 560, 1.5),
  C(640, 960, 560, 1.5),
  C(668, 960, 540, 1.0)
];

const CURSOR: Waypoint[] = (() => {
  const w: Waypoint[] = [];
  const at = (f: number, p: { x: number; y: number }, click = false) => w.push({ f, ...ui(p), click });
  const end = (start: number, s: string) => typedEnd(s, start, FPC);
  at(28, { x: 1100, y: 640 });
  at(T.elecClick, P.elec, true);
  at(T.route + 8, P.elec);
  at(T.stockClick, { x: P.stockField.x + 40, y: P.stockField.y + 6 }, true);
  at(end(T.stockType, QUERY) + 20, { x: P.stockField.x + 40, y: P.stockField.y + 6 });
  at(T.extClick, { x: P.extField.x + 40, y: P.extField.y + 6 }, true);
  at(end(T.extType, QUERY), { x: P.extField.x + 40, y: P.extField.y + 6 });
  at(T.buscar, { x: P.buscar.x, y: P.buscar.y + 4 }, true);
  at(T.extDone, { x: P.buscar.x + 10, y: P.buscar.y + 40 });
  at(T.add, { x: P.add.x, y: P.add.y + 4 }, true);
  at(T.add + 20, { x: P.add.x, y: P.add.y + 4 });
  at(T.crear, { x: P.crear.x, y: P.crear.y + 4 }, true);
  at(T.crear + 14, { x: P.crear.x, y: P.crear.y + 4 });
  at(T.plus, D.plus, true);
  DFIELDS.forEach((fd, i) => {
    const p = { x: D[fd.key].x + 50, y: D[fd.key].y + 6 };
    at(fd.click, p, true);
    at(end(dStart(i), fd.text), p);
  });
  at(T.enviar, { x: D.enviar.x, y: D.enviar.y + 4 }, true);
  at(T.enviar + 30, { x: D.enviar.x, y: D.enviar.y + 4 });
  at(T.success + 30, { x: 1000, y: 700 });
  return w;
})();

// ---------------------------------------------------------------- escenas

const Body: FC = () => {
  const f = useCurrentFrame();
  const onElec = f >= T.route;
  const inicio = 1 - kf(f, [T.route, T.route + 8], [0, 1]);
  const elec = kf(f, [T.route + 2, T.route + 10], [0, 1]);
  const open = kf(f, [T.crear + 4, T.crear + 14], [0, 1], EASE.out);
  const routeFlash = kf(f, [T.route, T.route + 4, T.route + 24], [0, 1, 0]);

  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: WX, top: WY, perspective: 2400 }}>
          <div style={{ position: 'relative', ...windowMotion(f, 0, T.winOut) }}>
            <BrowserFrame route={onElec ? '/cotizar/electronica' : '/cotizar'} routeFlash={routeFlash}>
              {inicio > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: inicio }}>
                  <CotizarInicioScreen hoverElec={kf(f, [T.elecClick - 6, T.elecClick - 2], [0, 1])} />
                </div>
              )}
              {elec > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: elec }}>
                  <ElectronicaScreen st={electronica(f)} />
                </div>
              )}
              {open > 0 && <SolicitudDialog st={dialog(f)} open={open} />}
            </BrowserFrame>
          </div>
        </div>
        {f >= 26 && f < T.winOut + 6 && <Cursor path={CURSOR} scale={0.8} />}
      </Camera>

      <Caption at={30} out={76} text="Entra a Cotizar y elige Electrónica" />
      <Caption at={84} out={140} text="Busca el servomotor en el stock" />
      <Caption at={144} out={252} text="¿No hay? Usa el Buscador de productos" />
      <Caption at={264} out={340} text="Agrégalo y pulsa Crear pedido" />
      <Caption at={358} out={540} text="Llena los datos del pedido" />
      <Caption at={556} out={660} text="Envía la solicitud y espera tu cotización" />

      <Callout at={146} out={200} x={1460} y={360} width={430} icon={<Globe size={28} />} title="Sin coincidencias" body="No está en el stock de UVGo" />
      <Callout at={212} out={262} x={40} y={560} width={430} icon={<PackagePlus size={28} />} title="Nosotros lo conseguimos" body="Busca una referencia en tiendas" />
      <Callout at={598} out={660} x={1460} y={420} width={430} tint="#2f7d32" icon={<Mail size={28} />} title="Te llega un correo" body="La cotización, en Mis solicitudes" />
    </AbsoluteFill>
  );
};

const BACKDROP = 'radial-gradient(circle at 18% 12%, #3d6b39 0%, transparent 45%), radial-gradient(circle at 88% 90%, rgba(224,122,95,.35) 0%, transparent 40%), linear-gradient(160deg, #245021 0%, #1d411b 50%, #132c12 100%)';

export const CrearPedido: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Crea tu pedido" badge="COTIZAR" icon={<PackagePlus size={64} strokeWidth={2.2} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)', opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="Si no está, UVGo lo consigue." highlight={['UVGo']} subtitle="Cotizar → Electrónica → Buscador → Crear pedido" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={110} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
