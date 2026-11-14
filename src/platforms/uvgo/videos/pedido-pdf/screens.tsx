// Piezas del video "Pedido desde PDF": el diálogo "Importar materiales desde PDF" (ImportarMateriales)
// y "Solicitar cotización" con los materiales del PDF (CrearSolicitudDialog con ítems de texto).
// Textos, medidas e iconos del repo UVGo (solo lectura). Viewport 1440x900. Datos ficticios.
import type { FC, ReactNode } from 'react';
import { Check, FileText, Minus, Plus, X } from 'lucide-react';
import { U } from '../crear-cuenta/screens';
import { FormField, Ghost, HAIR, Optional, Primary, type TextState } from '../crear-pedido/screens';

export const PDF_NAME = 'lista-materiales-electronica.pdf';

export const MATERIALES = [
  { nombre: 'Resistencia 220 Ω 1/4 W', cantidad: 10 },
  { nombre: 'LED rojo 5 mm', cantidad: 10 },
  { nombre: 'Capacitor electrolítico 100 µF 25 V', cantidad: 4 },
  { nombre: 'Circuito integrado 74LS08 (AND)', cantidad: 2 },
  { nombre: 'Potenciómetro 10 kΩ', cantidad: 2 },
  { nombre: 'Protoboard 830 puntos', cantidad: 1 }
];

const DIALOG_SHADOW = '0 25px 50px -12px rgb(0 0 0 / 0.25)';

const Shell: FC<{ open: number; top: number; children: ReactNode }> = ({ open, top, children }) => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,.32)', opacity: open }} />
    <div
      style={{
        position: 'absolute',
        left: 400,
        top,
        width: 640,
        borderRadius: 24,
        background: '#fff',
        boxShadow: DIALOG_SHADOW,
        color: U.text,
        opacity: open,
        transform: `translateY(${(1 - open) * 24}px) scale(${0.97 + 0.03 * open})`
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Title: FC<{ title: string; text: string }> = ({ title, text }) => (
  <div>
    <div style={{ fontSize: 20, fontWeight: 700, color: U.strong }}>{title}</div>
    <div style={{ marginTop: 4, fontSize: 14, color: U.muted }}>{text}</div>
  </div>
);

const Actions: FC<{ children: ReactNode }> = ({ children }) => <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingTop: 8 }}>{children}</div>;

// ------------------------------------------------------------------ Importar materiales desde PDF

export type ImportState = {
  fase: 'archivo' | 'analizando' | 'lista';
  archivo: boolean;
  analizarPress: number;
  /** Filas visibles (aparecen al terminar el análisis). */
  filas: number;
  /** Cantidad editada del LED (10 -> 12). */
  ledCantidad: string;
  ledFocus: boolean;
  caret: boolean;
  agregarPress: number;
};

/** Medidas del diálogo (viewport) en cada fase. */
export const IMP = {
  topArchivo: 313,
  topLista: 145,
  input: { x: 500, y: 439 },
  analizar: { x: 952, y: 542 },
  ledCantidad: { x: 926, y: 381 },
  agregar: { x: 920, y: 713 }
};

/** Input de archivo nativo de Chrome dentro del FormField de la app. */
const FileInput: FC<{ name: string | null; disabled?: boolean }> = ({ name, disabled }) => (
  <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', borderRadius: 12, border: `1px solid ${HAIR}`, background: '#fff', fontSize: 14, fontWeight: 500, color: U.text, opacity: disabled ? 0.6 : 1 }}>
    <span style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #767676', background: '#efefef', fontSize: 13, fontWeight: 400, color: '#000' }}>Seleccionar archivo</span>
    <span style={{ fontWeight: 400, color: name ? U.text : U.muted }}>{name ?? 'Ningún archivo seleccionado'}</span>
  </div>
);

const SmallField: FC<{ label: string; value: string; focus?: boolean; caret?: boolean; w?: number; pop?: number }> = ({ label, value, focus, caret, w, pop = 1 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 500, color: U.muted, width: w, minWidth: 0 }}>
    {label}
    <div
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderRadius: 12,
        border: `1px solid ${focus ? U.coral : HAIR}`,
        boxShadow: focus ? '0 0 0 3px rgba(224,122,95,.16)' : undefined,
        background: '#fff',
        fontSize: 14,
        fontWeight: 500,
        color: U.text,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        transform: `scale(${pop})`
      }}
    >
      {value}
      {focus && <span style={{ display: 'inline-block', width: 2, height: 16, marginLeft: 1, background: caret ? U.text : 'transparent' }} />}
    </div>
  </div>
);

export const ImportarDialog: FC<{ st: ImportState; open: number; rowPop: (k: number) => number }> = ({ st, open, rowPop }) => {
  const lista = st.fase === 'lista';
  return (
    <Shell open={open} top={lista ? IMP.topLista : IMP.topArchivo}>
      <Title title="Importar materiales desde PDF" text="Claude lee el PDF y arma la lista. Revísala antes de agregarla a tu solicitud." />
      {!lista && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 500, color: U.muted }}>
            PDF de hasta 5 MB (sirve también si es un escaneo)
            <FileInput name={st.archivo ? PDF_NAME : null} disabled={st.fase === 'analizando'} />
          </div>
          <div style={{ marginTop: 4, minHeight: 17, fontSize: 14, color: U.muted }}>{st.fase === 'analizando' ? 'Analizando… puede tardar hasta un minuto.' : ''}</div>
        </>
      )}
      {lista && (
        <>
          <div style={{ marginTop: 4, fontSize: 14, color: U.muted }}>Corrige los nombres y cantidades que no coincidan con el PDF.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: 400, padding: 2, overflow: 'hidden' }}>
            {MATERIALES.map((m, k) => {
              const p = rowPop(k);
              if (k >= st.filas) return <div key={k} style={{ height: 63, flexShrink: 0 }} />;
              const led = k === 1;
              return (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 100px auto', alignItems: 'end', gap: 8, flexShrink: 0, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 16}px)` }}>
                  <SmallField label="Producto" value={m.nombre} />
                  <SmallField label="Cantidad" value={led ? st.ledCantidad : String(m.cantidad)} focus={led && st.ledFocus} caret={st.caret} />
                  <span style={{ width: 32, height: 32, marginBottom: 6, display: 'grid', placeItems: 'center', color: U.muted }}>
                    <X size={16} />
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
      <Actions>
        <Ghost disabled={st.fase === 'analizando'}>Cancelar</Ghost>
        {lista ? (
          <Primary press={st.agregarPress}>Agregar {MATERIALES.length} materiales</Primary>
        ) : (
          <Primary disabled={!st.archivo || st.fase === 'analizando'} press={st.analizarPress}>
            {st.fase === 'analizando' ? 'Analizando…' : 'Analizar PDF'}
          </Primary>
        )}
      </Actions>
    </Shell>
  );
};

// ------------------------------------------------------------------ Solicitar cotización con materiales del PDF

export type SolicitudPdfState = {
  scroll: number;
  curso: TextState;
  catedratico: TextState;
  fecha: TextState;
  punto: TextState;
  sending: boolean;
  sendPress: number;
  success: boolean;
};

export const SOL = {
  top: 84,
  successTop: 300,
  curso: { x: 569, y: 513 },
  catedratico: { x: 871, y: 513 },
  fecha: { x: 569, y: 588 },
  punto: { x: 871, y: 588 },
  enviar: { x: 937, y: 771 }
};

const ItemPdf: FC<{ nombre: string; cantidad: number }> = ({ nombre, cantidad }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto auto', alignItems: 'center', gap: 12, flexShrink: 0, padding: '8px 12px', borderRadius: 16, border: `1px solid ${HAIR}`, background: 'rgba(242,244,240,.6)' }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', color: U.faint, display: 'grid', placeItems: 'center' }}>
      <FileText size={16} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: U.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
      <div style={{ fontSize: 11, color: U.faint }}>Material del PDF</div>
    </div>
    <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 99, border: `1px solid ${HAIR}`, background: '#fff' }}>
      <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', opacity: cantidad <= 1 ? 0.5 : 1 }}>
        <Minus size={14} />
      </span>
      <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600, color: U.strong }}>{cantidad}</span>
      <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
        <Plus size={14} />
      </span>
    </div>
    <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: U.faint }}>
      <X size={16} />
    </span>
  </div>
);

export const SolicitudPdfDialog: FC<{ st: SolicitudPdfState; open: number }> = ({ st, open }) => {
  if (st.success)
    return (
      <Shell open={open} top={SOL.successTop}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0', textAlign: 'center' }}>
          <span style={{ width: 56, height: 56, marginBottom: 8, borderRadius: 99, background: 'rgba(29,65,27,.1)', color: U.green, display: 'grid', placeItems: 'center' }}>
            <Check size={24} />
          </span>
          <div style={{ fontSize: 20, fontWeight: 700, color: U.strong }}>¡Solicitud enviada!</div>
          <div style={{ marginTop: 4, fontSize: 14, color: U.muted }}>
            Te enviamos un correo de confirmación. El equipo de UVGo revisará los productos y te mandará la cotización con el total. La podrás revisar y pagar en “Mis solicitudes”.
          </div>
        </div>
        <Actions>
          <Ghost>Seguir cotizando</Ghost>
          <Primary>Ver mis solicitudes</Primary>
        </Actions>
      </Shell>
    );
  return (
    <Shell open={open} top={SOL.top}>
      <Title title="Solicitar cotización" text="Revisaremos los productos y te enviaremos la cotización por correo." />
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: U.strong }}>
          Productos <span style={{ fontSize: 12, fontWeight: 500, color: U.faint }}>{MATERIALES.length}</span>
        </div>
        <div style={{ height: 260, marginTop: 8, padding: 2, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, transform: `translateY(${-st.scroll}px)` }}>
            {MATERIALES.map((m, k) => (
              <ItemPdf key={k} nombre={m.nombre} cantidad={k === 1 ? 12 : m.cantidad} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField label="Curso" st={st.curso} />
        <FormField label="Catedrático" st={st.catedratico} />
        <FormField label="Fecha límite" st={st.fecha} date />
        <FormField
          label={
            <span>
              Punto de entrega <Optional />
            </span>
          }
          st={st.punto}
          ph="Ej. Edificio CIT, lobby"
        />
      </div>
      <FormField
        label={
          <span>
            Observaciones <Optional />
          </span>
        }
        st={{ value: '', focus: false, caret: false }}
        ph="Marca, modelo o cualquier detalle que nos ayude a conseguirlo"
        area
      />
      <Actions>
        <Ghost disabled={st.sending}>Cancelar</Ghost>
        <Primary disabled={st.sending} press={st.sendPress}>
          {st.sending ? 'Enviando…' : 'Enviar solicitud'}
        </Primary>
      </Actions>
    </Shell>
  );
};

// ------------------------------------------------------------------ PDF ilustrado (lo que Claude lee)

/**
 * Hoja de la lista de materiales en 2D. `scan` 0..1 baja la línea de lectura y resalta las filas leídas.
 * Pieza explicativa del video (la app solo muestra "Analizando…").
 */
export const PdfDoc: FC<{ scan: number; w?: number }> = ({ scan, w = 330 }) => {
  const rows = MATERIALES.length;
  const h = w * 1.3;
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: 14, background: '#fff', boxShadow: '0 30px 60px -24px rgba(0,0,0,.55)', overflow: 'hidden', padding: 22 }}>
      <div style={{ position: 'absolute', right: 0, top: 0, width: 54, height: 54, background: 'linear-gradient(225deg, #e5e7eb 50%, #fff 50%)' }} />
      <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 800 }}>PDF</div>
      <div style={{ marginTop: 12, fontSize: 19, fontWeight: 800, color: U.strong, lineHeight: 1.15 }}>Lista de materiales</div>
      <div style={{ fontSize: 13, color: U.faint }}>Electrónica Digital · Lab. 3</div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {MATERIALES.map((m, k) => {
          const read = scan * (rows + 1) > k + 1;
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 6, background: read ? 'rgba(224,122,95,.16)' : 'transparent' }}>
              <span style={{ width: 18, fontSize: 12, fontWeight: 700, color: read ? U.coral : U.faint }}>{m.cantidad}</span>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: U.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nombre}</span>
              {read && (
                <span style={{ width: 16, height: 16, borderRadius: 99, background: U.green, color: '#fff', display: 'grid', placeItems: 'center' }}>
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </div>
          );
        })}
      </div>
      {scan > 0 && scan < 1 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120 + scan * (h - 150), height: 26, background: 'linear-gradient(rgba(224,122,95,0), rgba(224,122,95,.45), rgba(224,122,95,0))' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 12, height: 2, background: U.coral }} />
        </div>
      )}
    </div>
  );
};
