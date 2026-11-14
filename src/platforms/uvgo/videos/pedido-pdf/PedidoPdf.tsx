// Video "UVGo: pedido desde PDF". Funcionalidad, sin voz.
// Cotizar -> Seleccionar PDF -> "Importar materiales desde PDF": elegir archivo, Analizar PDF (Claude lee
// la lista), revisar y corregir cantidades, Agregar N materiales -> la app abre "Solicitar cotización"
// con los materiales del PDF -> datos del curso -> Enviar solicitud -> ¡Solicitud enviada!
import type { FC } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { FileText, ListChecks } from 'lucide-react';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Caption } from '../../../../core/Caption';
import { Callout } from '../../../../core/Callout';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { windowMotion } from '../../../../core/AppWindow';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { caretOn, typed, typedEnd } from '../../../../core/typing';
import { useBrand } from '../../../../core/theme';
import { BrowserFrame, CHROME_H, VW } from '../crear-cuenta/screens';
import { CotizarInicioScreen, ElectronicaScreen, type ElectronicaState, type TextState } from '../crear-pedido/screens';
import { IMP, ImportarDialog, MATERIALES, PdfDoc, SOL, SolicitudPdfDialog, type ImportState, type SolicitudPdfState } from './screens';

const SHIFT = launchIntroLength(0) - 8;
const BODY = 670;
const END = SHIFT + BODY;
export const DURATION = END + 100;

const WX = (1920 - VW) / 2;
const WY = 70;
const ui = (p: { x: number; y: number }) => ({ x: WX + p.x, y: WY + CHROME_H + p.y });

// ---------------------------------------------------------------- tiempos del cuerpo

const T = {
  pdfClick: 48,
  importOpen: 52,
  fileClick: 88,
  fileSet: 110,
  analizar: 124,
  listo: 206,
  led: 250,
  agregar: 290,
  route: 300,
  solOpen: 312,
  enviar: 522,
  success: 548,
  winOut: 650
};

type SKey = 'curso' | 'catedratico' | 'fecha' | 'punto';
const SFIELDS: { key: SKey; click: number; text: string }[] = [
  { key: 'curso', click: 378, text: 'Electrónica Digital' },
  { key: 'catedratico', click: 412, text: 'Inga. Sofía Castillo' },
  { key: 'fecha', click: 452, text: '28/11/2026' },
  { key: 'punto', click: 478, text: 'Edificio J, lobby' }
];
const FPC = 1.4;
const sStart = (i: number) => SFIELDS[i].click + 4;

const text = (f: number, value: string, focus: boolean): TextState => ({ value, focus, caret: caretOn(f) });
const press = (f: number, at: number) => kf(f, [at + 1, at + 4, at + 10], [1, 0.94, 1]);

const importState = (f: number): ImportState => ({
  fase: f < T.analizar + 2 ? 'archivo' : f < T.listo ? 'analizando' : 'lista',
  archivo: f >= T.fileSet,
  analizarPress: press(f, T.analizar),
  filas: f >= T.listo ? MATERIALES.length : 0,
  ledCantidad: f < T.led + 8 ? '10' : f < T.led + 12 ? '1' : '12',
  ledFocus: f >= T.led + 2 && f < T.agregar,
  caret: caretOn(f),
  agregarPress: press(f, T.agregar)
});

const solicitudState = (f: number): SolicitudPdfState => {
  const st = {} as Record<SKey, TextState>;
  SFIELDS.forEach((fd, i) => {
    const next = i < SFIELDS.length - 1 ? SFIELDS[i + 1].click : T.enviar;
    st[fd.key] = text(f, typed(f, fd.text, sStart(i), FPC), f >= fd.click + 2 && f < next + 2);
  });
  return {
    ...st,
    scroll: kf(f, [338, 362], [0, 128], EASE.inOut) - kf(f, [368, 376], [0, 128], EASE.inOut),
    sending: f >= T.enviar + 2 && f < T.success,
    sendPress: press(f, T.enviar),
    success: f >= T.success
  };
};

// Al enviarse la solicitud la app limpia la selección (onCreada -> limpiar)
const electronica = (f: number): ElectronicaState => ({
  stock: { value: '', focus: false, caret: false, query: '', loading: false },
  ext: { value: '', focus: false, caret: false, query: '', loading: false },
  buscarPress: 1,
  added: false,
  addPress: 1,
  crearPress: 1,
  pdf: f >= T.success ? 0 : MATERIALES.length
});

// ---------------------------------------------------------------- cámara y cursor (escenario)

const C = (f: number, x: number, y: number, z: number): CamKey => ({ f, fx: x, fy: y, z });
const CAM: CamKey[] = [
  C(0, 960, 540, 0.98),
  C(26, 960, 540, 1.0),
  C(54, 960, 540, 1.0),
  C(74, 960, 560, 1.6),
  C(200, 960, 560, 1.6),
  C(218, 960, 560, 1.32),
  C(296, 960, 560, 1.32),
  C(320, 960, 560, 1.25),
  C(626, 960, 560, 1.25),
  C(648, 960, 540, 1.0)
];

const PDF_BTN = { x: 376, y: 533 };

const CURSOR: Waypoint[] = (() => {
  const w: Waypoint[] = [];
  const at = (f: number, p: { x: number; y: number }, click = false) => w.push({ f, ...ui(p), click });
  const end = (start: number, s: string) => typedEnd(s, start, FPC);
  at(26, { x: 700, y: 700 });
  at(T.pdfClick, PDF_BTN, true);
  at(T.importOpen + 10, PDF_BTN);
  at(T.fileClick, { x: IMP.input.x - 20, y: IMP.input.y + 6 }, true);
  at(T.fileSet + 4, { x: IMP.input.x - 20, y: IMP.input.y + 6 });
  at(T.analizar, { x: IMP.analizar.x, y: IMP.analizar.y + 4 }, true);
  at(T.analizar + 30, { x: IMP.analizar.x + 20, y: IMP.analizar.y + 60 });
  at(T.led, { x: IMP.ledCantidad.x + 20, y: IMP.ledCantidad.y + 6 }, true);
  at(T.led + 20, { x: IMP.ledCantidad.x + 20, y: IMP.ledCantidad.y + 6 });
  at(T.agregar, { x: IMP.agregar.x, y: IMP.agregar.y + 4 }, true);
  at(T.agregar + 20, { x: IMP.agregar.x, y: IMP.agregar.y + 4 });
  at(336, { x: 760, y: 330 });
  SFIELDS.forEach((fd, i) => {
    const p = { x: SOL[fd.key].x + 50, y: SOL[fd.key].y + 6 };
    at(fd.click, p, true);
    at(end(sStart(i), fd.text), p);
  });
  at(T.enviar, { x: SOL.enviar.x, y: SOL.enviar.y + 4 }, true);
  at(T.enviar + 40, { x: SOL.enviar.x, y: SOL.enviar.y + 4 });
  return w;
})();

// ---------------------------------------------------------------- escenas

/** Hoja del PDF: vuela al campo de archivo y luego se lee mientras Claude analiza (pantalla). */
const PdfOverlay: FC<{ f: number }> = ({ f }) => {
  // vuelo al input (a z 1.6 el input queda cerca de x 608, y 522 de la pantalla)
  const fly = kf(f, [T.fileClick + 2, T.fileSet], [0, 1], EASE.inOut);
  const flying = f >= T.fileClick && f < T.fileSet + 2;
  const read = sp(f, T.analizar + 2, SPRING.pop);
  const out = kf(f, [T.listo + 8, T.listo + 20], [0, 1], EASE.in);
  const scan = kf(f, [T.analizar + 8, T.listo - 4], [0, 1], (t) => t);
  return (
    <>
      {flying && (
        <div style={{ position: 'absolute', left: 120 + fly * (560 - 120), top: 640 - fly * (640 - 470), transform: `scale(${0.5 - fly * 0.38}) rotate(${-8 + fly * 8}deg)`, transformOrigin: '0 0', opacity: 1 - kf(f, [T.fileSet - 4, T.fileSet], [0, 1]) }}>
          <PdfDoc scan={0} />
        </div>
      )}
      {f >= T.analizar && out < 1 && (
        <div style={{ position: 'absolute', left: 50, top: 250, opacity: Math.min(1, read * 1.5) * (1 - out), transform: `translateX(${(1 - read) * -60 - out * 80}px) rotate(${-3 + read * 3}deg)` }}>
          <PdfDoc scan={scan} />
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 99, background: 'rgba(15,23,40,.88)', color: '#fff', fontSize: 20, fontWeight: 700 }}>
            <FileText size={18} /> Claude está leyendo la lista…
          </div>
        </div>
      )}
    </>
  );
};

const Body: FC = () => {
  const f = useCurrentFrame();
  const onElec = f >= T.route;
  const cotizar = 1 - kf(f, [T.route, T.route + 8], [0, 1]);
  const elec = kf(f, [T.route + 2, T.route + 10], [0, 1]);
  const importOpen = kf(f, [T.importOpen, T.importOpen + 10], [0, 1], EASE.out) * (1 - kf(f, [T.agregar + 4, T.agregar + 12], [0, 1]));
  const solOpen = kf(f, [T.solOpen, T.solOpen + 10], [0, 1], EASE.out);
  const routeFlash = kf(f, [T.route, T.route + 4, T.route + 24], [0, 1, 0]);
  const rowPop = (k: number) => sp(f, T.listo + 2 + k * 4, SPRING.pop);

  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: WX, top: WY, perspective: 2400 }}>
          <div style={{ position: 'relative', ...windowMotion(f, 0, T.winOut) }}>
            <BrowserFrame route={onElec ? '/cotizar/electronica' : '/cotizar'} routeFlash={routeFlash}>
              {cotizar > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: cotizar }}>
                  <CotizarInicioScreen hoverElec={0} hoverPdf={kf(f, [T.pdfClick - 6, T.pdfClick - 2], [0, 1])} />
                </div>
              )}
              {elec > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: elec }}>
                  <ElectronicaScreen st={electronica(f)} />
                </div>
              )}
              {importOpen > 0 && <ImportarDialog st={importState(f)} open={importOpen} rowPop={rowPop} />}
              {solOpen > 0 && <SolicitudPdfDialog st={solicitudState(f)} open={solOpen} />}
            </BrowserFrame>
          </div>
        </div>
        {f >= 24 && f < T.winOut + 6 && <Cursor path={CURSOR} scale={0.8} />}
      </Camera>

      <PdfOverlay f={f} />

      <Caption at={28} out={110} text="Sube la lista de tu curso en PDF" />
      <Caption at={128} out={236} text="Claude lee el PDF y arma la lista" />
      <Caption at={240} out={296} text="Revisa productos y cantidades" />
      {/* arriba: el diálogo de la solicitud ocupa casi todo el alto */}
      <Caption at={318} out={372} text="Tu pedido se arma con los 6 materiales" y={14} />
      <Caption at={380} out={544} text="Completa los datos y envía" y={14} />
      <Caption at={554} out={640} text="¡Pedido creado desde tu PDF!" />

      <Callout at={214} out={256} x={1460} y={330} width={430} icon={<ListChecks size={28} />} title="6 materiales detectados" body="Revísalos antes de agregarlos" />
    </AbsoluteFill>
  );
};

const BACKDROP = 'radial-gradient(circle at 18% 12%, #3d6b39 0%, transparent 45%), radial-gradient(circle at 88% 90%, rgba(224,122,95,.35) 0%, transparent 40%), linear-gradient(160deg, #245021 0%, #1d411b 50%, #132c12 100%)';

export const PedidoPdf: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Pedido desde PDF" badge="COTIZAR" icon={<FileText size={64} strokeWidth={2.2} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)', opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="Tu PDF, convertido en pedido." highlight={['pedido']} subtitle="Cotizar → Importar PDF → Solicitar cotización" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={116} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
