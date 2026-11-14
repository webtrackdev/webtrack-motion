// Pantallas reales de UVGo para el video "Estados del pedido": Mis solicitudes (estudiante) y
// Solicitudes (vista admin), desde "Por cotizar" hasta "Confirmada". No llega a validar el pago ni
// a asignar conductor. Estructura, textos y medidas del repo UVGo (solo lectura): pages/MisSolicitudes
// (CotizacionDetail, ComprobanteUpload), pages/Admin/Solicitudes (SolicitudDetail), components/SolicitudList,
// components/ComprobanteViewer y utilities/estadoPedido. Viewport 1440x900. Datos ficticios.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Check, CircleCheck, Clipboard, Clock, Copy, ExternalLink, FileText, Inbox, Maximize2, Download, RefreshCw, Tag, UploadCloud, X } from 'lucide-react';
import { Rail, U } from '../crear-cuenta/screens';
import { RESULTS, ServoArt } from '../crear-pedido/screens';

const LAYOUT_BG = 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)';
const HAIR = 'rgba(82,82,82,0.1)';
const ACCENT_WASH = 'rgba(224,122,95,0.16)';
const SHADOW_MD = '0 1px 3px 0 rgb(0 0 0 / 0.1)';

// ------------------------------------------------------------------ datos del pedido (ficticios)

export const PEDIDO = {
  curso: 'Robótica Móvil',
  catedratico: 'Ing. Carlos Méndez',
  solicitada: '12 nov, 9:41 a. m.',
  limite: '25 nov 2026',
  entrega: 'Edificio J, lobby',
  observaciones: 'Rotación continua, 5 V',
  producto: RESULTS[0],
  cantidad: 2
};

// ------------------------------------------------------------------ piezas compartidas

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  padding: 16,
  borderRadius: 24,
  background: U.surfaceMuted,
  boxShadow: SHADOW_MD,
  outline: '1px solid rgba(255,255,255,.6)',
  outlineOffset: -1
};

type Tone = 'neutral' | 'accent' | 'success' | 'danger';
const TONES: Record<Tone, [string, string]> = {
  neutral: [U.muted, 'rgba(82,82,82,.08)'],
  accent: ['#a34f3a', 'rgba(224,122,95,.14)'],
  success: [U.green, 'rgba(29,65,27,.1)'],
  danger: ['#b91c1c', 'rgba(239,68,68,.1)']
};
const Badge: FC<{ tone: Tone; children: ReactNode; pop?: number }> = ({ tone, children, pop = 1 }) => (
  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', color: TONES[tone][0], background: TONES[tone][1], transform: `scale(${pop})` }}>{children}</span>
);

const IconBadge: FC<{ children: ReactNode }> = ({ children }) => (
  <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 99, background: ACCENT_WASH, color: U.coral, display: 'grid', placeItems: 'center' }}>{children}</span>
);

const Count: FC<{ children: ReactNode }> = ({ children }) => (
  <span style={{ padding: '4px 8px', borderRadius: 99, background: '#fff', fontSize: 12, fontWeight: 500, color: U.muted }}>{children}</span>
);

const Primary: FC<{ children: ReactNode; disabled?: boolean; press?: number; full?: boolean }> = ({ children, disabled, press = 1, full }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 44,
      padding: '0 24px',
      width: full ? '100%' : undefined,
      borderRadius: 999,
      background: U.strong,
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      opacity: disabled ? 0.5 : 1,
      transform: `scale(${press})`
    }}
  >
    {children}
  </div>
);

const Danger: FC<{ children: ReactNode; full?: boolean; disabled?: boolean }> = ({ children, full, disabled }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 36, padding: '0 16px', width: full ? '100%' : undefined, borderRadius: 99, border: `1px solid ${HAIR}`, background: '#fff', fontSize: 12, fontWeight: 600, color: '#b91c1c', whiteSpace: 'nowrap', opacity: disabled ? 0.5 : 1 }}>
    {children}
  </div>
);

const Ghost: FC<{ children: ReactNode }> = ({ children }) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 12, fontWeight: 500, color: U.muted }}>{children}</span>;

const Aviso: FC<{ children: ReactNode; show: number }> = ({ children, show }) =>
  show > 0 ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: 'rgba(29,65,27,.1)', fontSize: 14, fontWeight: 500, color: U.green, opacity: show, transform: `translateY(${(1 - show) * -8}px)` }}>
      <CircleCheck size={16} />
      {children}
    </div>
  ) : null;

const PageHeader: FC<{ eyebrow: string; title: string; right?: ReactNode }> = ({ eyebrow, title, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '8px 4px 0' }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: U.muted }}>{eyebrow}</div>
      <div style={{ marginTop: 4, fontSize: 36, lineHeight: 1.1, fontWeight: 700, color: U.strong }}>{title}</div>
    </div>
    {right}
  </div>
);

const Frame: FC<{ admin?: boolean; children: ReactNode }> = ({ admin, children }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: 16, padding: 16, background: '#fff', backgroundImage: LAYOUT_BG, color: U.text }}>
    <Rail initials={admin ? 'DR' : 'AL'} active={admin ? 1 : 2} admin={admin} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, minHeight: 0 }}>{children}</div>
  </div>
);

const Thumb: FC<{ size?: number }> = ({ size = 44 }) => (
  <div style={{ width: size, height: size, flexShrink: 0, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
    <ServoArt body={PEDIDO.producto.body} size={size} />
  </div>
);

/** Ítem de SolicitudList. */
const ListItem: FC<{ selected: boolean; badges: ReactNode }> = ({ selected, badges }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '12px 16px',
      borderRadius: 16,
      border: `1px solid ${selected ? U.coral : HAIR}`,
      background: selected ? '#fff' : 'rgba(255,255,255,.45)',
      boxShadow: selected ? '0 0 0 3px rgba(224,122,95,.16)' : undefined
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: U.text }}>{PEDIDO.curso}</span>
      <span style={{ fontSize: 12, color: U.faint }}>{PEDIDO.solicitada}</span>
    </div>
    <span style={{ fontSize: 12, color: U.faint }}>
      {PEDIDO.catedratico} · Para el {PEDIDO.limite}
    </span>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{badges}</div>
  </div>
);

const ListPanel: FC<{ titulo: string; total: number; children: ReactNode }> = ({ titulo, total, children }) => (
  <div style={panel}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0 4px 12px', borderBottom: `1px solid ${HAIR}` }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: U.strong }}>
          <IconBadge>
            <Inbox size={16} />
          </IconBadge>
          {titulo}
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: U.faint }}>Más recientes primero</div>
      </div>
      <Count>{total}</Count>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, padding: 2, flex: 1 }}>{children}</div>
  </div>
);

const Empty: FC<{ title: string; text: string }> = ({ title, text }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '28px 16px', textAlign: 'center', color: U.faint }}>
    <div style={{ fontSize: 15, fontWeight: 600, color: U.text }}>{title}</div>
    <div style={{ maxWidth: 320, fontSize: 14 }}>{text}</div>
  </div>
);

// ------------------------------------------------------------------ estudiante: Mis solicitudes

export type Fase = 'solicitado' | 'cotizado' | 'confirmado';

export type AlumnoState = {
  fase: Fase;
  archivo: boolean;
  sending: boolean;
  sendPress: number;
  dropHover: boolean;
  aviso: number;
  pop: number;
};

/** Coordenadas (viewport) del estudiante con la solicitud cotizada. */
export const A = {
  badge: { x: 260, y: 214 },
  estado: { x: 1238, y: 300 },
  total: { x: 900, y: 360 },
  drop: { x: 1238, y: 458 },
  enviar: { x: 1238, y: 514 }
};

/** Foto del comprobante de transferencia (ilustración). */
const ReciboArt: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x={14} y={6} width={36} height={52} rx={3} fill="#fff" stroke="#d4d4d4" />
    <rect x={18} y={11} width={18} height={4} rx={2} fill="#1d4ed8" />
    <circle cx={32} cy={27} r={7} fill="rgba(29,65,27,.15)" />
    <path d="M28.5 27 L31 29.5 L36 24.5" stroke="#1d411b" strokeWidth={2} fill="none" strokeLinecap="round" />
    {[38, 43, 48].map((y) => (
      <rect key={y} x={19} y={y} width={26} height={2.4} rx={1.2} fill="#cbd5e1" />
    ))}
    <rect x={30} y={51} width={15} height={3} rx={1.5} fill="#171717" />
  </svg>
);

export const MisSolicitudesScreen: FC<{ st: AlumnoState }> = ({ st }) => {
  const { fase } = st;
  const conPrecios = fase !== 'solicitado';
  const estadoBadge = fase === 'solicitado' ? <Badge tone="accent" pop={st.pop}>Por cotizar</Badge> : fase === 'cotizado' ? <Badge tone="neutral" pop={st.pop}>Cotizada</Badge> : <Badge tone="success" pop={st.pop}>Confirmada</Badge>;
  const headerBadge = fase === 'solicitado' ? <Badge tone="accent" pop={st.pop}>Por cotizar</Badge> : fase === 'cotizado' ? <Badge tone="neutral" pop={st.pop}>Lista para pagar</Badge> : <Badge tone="success" pop={st.pop}>Confirmada</Badge>;
  const r = PEDIDO.producto;

  return (
    <Frame>
      <PageHeader eyebrow="Cotizaciones" title="Mis solicitudes" />
      <Aviso show={st.aviso}>¡Listo! Recibimos tu comprobante de {PEDIDO.curso}. Lo validaremos y te avisaremos por correo.</Aviso>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '340px minmax(0,1fr)', gap: 16 }}>
        <ListPanel titulo="Tus solicitudes" total={1}>
          <ListItem
            selected
            badges={
              <>
                {estadoBadge}
                {fase === 'confirmado' && <Badge tone="accent">Comprobante por validar</Badge>}
                <Badge tone="neutral">1 de la web</Badge>
              </>
            }
          />
        </ListPanel>

        {/* CotizacionDetail */}
        <div style={panel}>
          <div style={{ padding: '0 4px 12px', borderBottom: `1px solid ${HAIR}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: U.strong }}>
                <IconBadge>
                  <Clipboard size={16} />
                </IconBadge>
                {PEDIDO.curso}
              </div>
              {headerBadge}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: U.faint }}>
              {PEDIDO.catedratico} · Solicitada el {PEDIDO.solicitada} · Para el {PEDIDO.limite}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: U.strong }}>{conPrecios ? 'Productos cotizados' : 'Productos solicitados'}</div>
              <div style={{ padding: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 16, border: `1px solid ${HAIR}`, background: 'rgba(255,255,255,.45)' }}>
                  <Thumb />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: U.text }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: U.faint }}>Cantidad: {PEDIDO.cantidad} · {r.store}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {conPrecios ? (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 600, color: U.strong }}>Q190.00</div>
                        <div style={{ fontSize: 11, color: U.faint }}>2 × Q95.00</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 11, color: U.faint }}>Por cotizar</div>
                    )}
                  </div>
                </div>
              </div>
              {conPrecios && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 16px', marginTop: 12, padding: '12px 4px 0', borderTop: `1px solid ${HAIR}`, fontSize: 12, color: U.faint }}>
                    <span>Productos</span>
                    <span style={{ textAlign: 'right', color: U.text }}>Q190.00</span>
                    <span>Cargo por servicio</span>
                    <span style={{ textAlign: 'right', color: U.text }}>Q25.00</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: U.strong }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: U.strong, textAlign: 'right' }}>Q215.00</span>
                  </div>
                  <div style={{ marginTop: 12, padding: '8px 12px', borderLeft: `3px solid ${U.coral}`, borderRadius: 6, background: 'rgba(224,122,95,.08)', fontSize: 12, color: U.muted }}>
                    <b style={{ fontWeight: 600, color: U.text }}>Notas de UVGo:</b> Llega en 3 días hábiles
                  </div>
                </>
              )}
            </div>

            {/* PagoCard */}
            <div style={{ alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 24, border: '1px solid rgba(255,255,255,.8)', background: 'rgba(255,255,255,.7)', boxShadow: '0 1px 2px 0 rgb(0 0 0/.05)' }}>
              {fase === 'solicitado' && (
                <EstadoBox tone="accent" icon={<Clock size={22} />} title="Estamos cotizando tu solicitud" text="Te avisaremos por correo cuando esté lista para que la revises y pagues." extra={<Ghost>Cancelar solicitud</Ghost>} />
              )}
              {fase === 'cotizado' && (
                <>
                  <div style={{ fontSize: 18, fontWeight: 700, color: U.strong }}>
                    Transferencia
                    <div style={{ marginTop: 2, fontSize: 12, fontWeight: 400, color: U.faint }}>Deposita el total y sube tu comprobante para confirmar el pedido.</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '4px 12px', padding: 12, borderRadius: 16, background: 'rgba(242,244,240,.9)', fontSize: 12, color: U.faint }}>
                    <span>Banco</span>
                    <b style={{ fontWeight: 600, color: U.text }}>Banco de ejemplo</b>
                    <span>Cuenta</span>
                    <b style={{ fontWeight: 600, color: U.text, display: 'flex', alignItems: 'center' }}>
                      Monetaria 000-000000-0
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: 'rgba(82,82,82,.08)', fontSize: 11, fontWeight: 500, color: U.muted }}>
                        <Copy size={12} /> Copiar
                      </span>
                    </b>
                    <span>A nombre de</span>
                    <b style={{ fontWeight: 600, color: U.text }}>UVGo</b>
                    <span>Monto</span>
                    <b style={{ fontWeight: 600, color: U.strong, fontSize: 15 }}>Q215.00</b>
                    <span>Referencia</span>
                    <b style={{ fontWeight: 600, color: U.text }}>3F9A1C2B</b>
                  </div>
                  {st.archivo ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', alignItems: 'center', gap: 12, padding: 8, borderRadius: 16, border: `1px solid ${HAIR}`, background: '#fff' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 12, background: 'rgba(242,244,240,.9)', display: 'grid', placeItems: 'center' }}>
                        <ReciboArt size={60} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: U.text }}>comprobante-robotica.jpg</div>
                        <div style={{ fontSize: 11, color: U.faint }}>248 KB</div>
                      </div>
                      <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: U.faint }}>
                        <X size={16} />
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: 16,
                        borderRadius: 16,
                        border: `1.5px dashed ${st.dropHover ? U.coral : 'rgba(82,82,82,.28)'}`,
                        background: st.dropHover ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.55)',
                        textAlign: 'center',
                        color: U.faint
                      }}
                    >
                      <UploadCloud size={24} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: U.text }}>Subir comprobante</div>
                      <div style={{ fontSize: 11 }}>Arrastra la foto o el PDF de tu transferencia, o haz clic para elegirlo · Máx. 5 MB</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Primary full disabled={!st.archivo || st.sending} press={st.sendPress}>
                      {st.sending ? 'Enviando…' : 'Enviar comprobante y confirmar'}
                    </Primary>
                    <Danger full disabled={st.sending}>
                      Rechazar cotización
                    </Danger>
                  </div>
                </>
              )}
              {fase === 'confirmado' && (
                <>
                  <EstadoBox tone="accent" icon={<Clock size={22} />} title="Comprobante en revisión" text="Estamos validando tu pago. Te avisaremos por correo cuando lo confirmemos." />
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', alignItems: 'center', gap: 12, padding: 8, borderRadius: 16, border: `1px solid ${HAIR}`, background: '#fff' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: 'rgba(242,244,240,.9)', display: 'grid', placeItems: 'center' }}>
                      <ReciboArt size={66} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: U.text }}>comprobante-robotica.jpg</div>
                      <div style={{ fontSize: 11, color: U.faint }}>248 KB · Subido el 12 nov, 10:15 a. m.</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 2, fontSize: 11, fontWeight: 600, color: U.text }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Maximize2 size={12} /> Ver completo
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <ExternalLink size={12} /> Abrir en otra pestaña
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Download size={12} /> Descargar
                        </span>
                      </div>
                    </div>
                  </div>
                  <Ghost>¿Te equivocaste de archivo? Reemplazar comprobante</Ghost>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
};

const EstadoBox: FC<{ tone: 'accent' | 'success'; icon: ReactNode; title: string; text: string; extra?: ReactNode }> = ({ tone, icon, title, text, extra }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', textAlign: 'center' }}>
    <span style={{ width: 48, height: 48, borderRadius: 99, display: 'grid', placeItems: 'center', color: tone === 'accent' ? U.coral : U.green, background: tone === 'accent' ? 'rgba(224,122,95,.14)' : 'rgba(29,65,27,.1)' }}>{icon}</span>
    <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>{title}</div>
    <div style={{ fontSize: 12, color: U.faint }}>{text}</div>
    {extra}
  </div>
);

// ------------------------------------------------------------------ admin: Solicitudes

export type TextState = { value: string; focus: boolean; caret: boolean };

export type AdminState = {
  precio: TextState;
  cargo: TextState;
  notas: TextState;
  sending: boolean;
  sendPress: number;
  sent: boolean;
  aviso: number;
};

/** Coordenadas (viewport) del detalle admin. */
export const AD = {
  precio: { x: 1327, y: 329 },
  cargo: { x: 596, y: 846 },
  notas: { x: 900, y: 846 },
  enviar: { x: 1326, y: 846 }
};

const Caret: FC<{ on: boolean }> = ({ on }) => <span style={{ display: 'inline-block', width: 2, height: 16, marginLeft: 1, background: on ? U.text : 'transparent', verticalAlign: 'middle' }} />;

const PriceField: FC<{ st: TextState; ph?: string; w?: number }> = ({ st, ph = '0.00', w = 90 }) => {
  const missing = st.value === '' && !st.focus;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        height: 40,
        padding: '0 12px',
        borderRadius: 12,
        border: `1px solid ${st.focus ? U.coral : missing ? 'rgba(224,122,95,.6)' : HAIR}`,
        boxShadow: st.focus ? '0 0 0 3px rgba(224,122,95,.16)' : undefined,
        background: '#fff',
        fontSize: 14,
        fontWeight: 600,
        color: U.strong
      }}
    >
      Q
      <span style={{ width: w, textAlign: 'right', color: st.value ? U.strong : U.disabled }}>
        {st.value || (st.focus ? '' : ph)}
        {st.focus && <Caret on={st.caret} />}
      </span>
    </div>
  );
};

const Segmented: FC<{ items: { label: string; count?: number; hl?: boolean }[]; sel: number }> = ({ items, sel }) => (
  <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 99, background: 'rgba(82,82,82,.06)' }}>
    {items.map((it, i) => (
      <span
        key={it.label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 99,
          background: i === sel ? '#fff' : 'transparent',
          boxShadow: i === sel ? '0 1px 2px 0 rgb(0 0 0/.05)' : undefined,
          fontSize: 14,
          fontWeight: i === sel ? 600 : 500,
          color: i === sel ? U.strong : U.muted,
          whiteSpace: 'nowrap'
        }}
      >
        {it.label}
        {it.count !== undefined && (
          <span style={{ minWidth: 20, padding: '0 6px', borderRadius: 99, background: it.hl ? U.coral : 'rgba(82,82,82,.1)', color: it.hl ? '#fff' : U.muted, fontSize: 11, lineHeight: '20px', fontWeight: 600, textAlign: 'center' }}>{it.count}</span>
        )}
      </span>
    ))}
  </div>
);

const money = (n: number) => `Q${n.toFixed(2)}`;

export const AdminScreen: FC<{ st: AdminState }> = ({ st }) => {
  const precio = st.precio.value ? Number(st.precio.value) : null;
  const cargo = st.cargo.value ? Number(st.cargo.value) : 0;
  const subtotal = (precio ?? 0) * PEDIDO.cantidad;
  const listo = precio !== null;
  const r = PEDIDO.producto;
  return (
    <Frame admin>
      <PageHeader
        eyebrow="Vista admin"
        title="Solicitudes"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Segmented items={[{ label: 'Por cotizar' }, { label: 'Cotizadas' }, { label: 'Por validar pago' }, { label: 'Pagadas' }, { label: 'Todas' }]} sel={0} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 99, background: U.strong, color: '#fff', fontSize: 14, fontWeight: 600 }}>
              <RefreshCw size={16} /> Cargar datos
            </span>
          </div>
        }
      />
      <Aviso show={st.aviso}>Cotización de {PEDIDO.curso} enviada. Le avisamos al estudiante por correo.</Aviso>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '380px minmax(0,1fr)', gap: 16 }}>
        <ListPanel titulo="Por cotizar" total={st.sent ? 0 : 1}>
          {st.sent ? (
            <Empty title="Sin solicitudes" text="No hay solicitudes en este estado. Cuando un estudiante pida una cotización aparecerá aquí." />
          ) : (
            <ListItem
              selected
              badges={
                <>
                  <Badge tone="accent">Por cotizar</Badge>
                  <Badge tone="neutral">1 de la web</Badge>
                </>
              }
            />
          )}
        </ListPanel>

        {st.sent ? (
          <div style={panel}>
            <Empty title="Nada que revisar" text="Selecciona una solicitud para ver sus productos y cotizarla." />
          </div>
        ) : (
          <div style={panel}>
            <div style={{ padding: '0 4px 12px', borderBottom: `1px solid ${HAIR}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: U.strong }}>
                  <IconBadge>
                    <Clipboard size={16} />
                  </IconBadge>
                  {PEDIDO.curso}
                </div>
                <Badge tone="accent">Por cotizar</Badge>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 8, fontSize: 12, color: U.faint }}>
                {[
                  ['Catedrático', PEDIDO.catedratico],
                  ['Solicitada', PEDIDO.solicitada],
                  ['Fecha límite', PEDIDO.limite],
                  ['Entrega', PEDIDO.entrega]
                ].map(([k, v]) => (
                  <span key={k} style={{ display: 'flex', gap: 4 }}>
                    {k} <b style={{ fontWeight: 500, color: U.text }}>{v}</b>
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', borderLeft: `3px solid ${U.coral}`, borderRadius: 6, background: 'rgba(224,122,95,.08)', fontSize: 12, color: U.muted }}>
                <b style={{ fontWeight: 600, color: U.text }}>Observaciones:</b> {PEDIDO.observaciones}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Segmented items={[{ label: 'De la web', count: 1, hl: !listo }, { label: 'Del catálogo', count: 0 }]} sel={0} />
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, padding: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, border: `1px solid ${HAIR}`, background: 'rgba(255,255,255,.45)' }}>
                <Thumb />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: U.text }}>{r.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: 12, color: U.faint }}>
                    <span>Cantidad: {PEDIDO.cantidad}</span>
                    <span>{r.store}</span>
                    <span>Ref. Q92.50</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: U.strong, textDecoration: 'underline' }}>
                      Ver producto <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <PriceField st={st.precio} />
                  <span style={{ fontSize: 11, color: U.faint }}>{precio === null ? 'Falta el precio' : `Subtotal ${money(subtotal)}`}</span>
                </div>
              </div>
            </div>
            {/* Footer de la cotización */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${HAIR}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px minmax(0,1fr)', gap: 12, alignSelf: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 500, color: U.muted }}>
                  Cargo por servicio
                  <PriceField st={st.cargo} ph="0" w={70} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 500, color: U.muted }}>
                  Notas para el estudiante
                  <div
                    style={{
                      height: 40,
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: `1px solid ${st.notas.focus ? U.coral : HAIR}`,
                      boxShadow: st.notas.focus ? '0 0 0 3px rgba(224,122,95,.16)' : undefined,
                      background: '#fff',
                      fontSize: 14,
                      fontWeight: 400,
                      color: st.notas.value ? U.text : U.disabled,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden'
                    }}
                  >
                    {st.notas.value || (st.notas.focus ? '' : 'Ej. tiempo de entrega, productos sustitutos…')}
                    {st.notas.focus && <Caret on={st.notas.caret} />}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 16px', fontSize: 12, color: U.faint, textAlign: 'right' }}>
                  <span>Productos</span>
                  <span style={{ color: U.text }}>{money(subtotal)}</span>
                  <span>Cargo por servicio</span>
                  <span style={{ color: U.text }}>{money(cargo)}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: U.strong }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: U.strong }}>{money(subtotal + cargo)}</span>
                </div>
                {!listo && <div style={{ fontSize: 12, color: U.faint }}>Falta el precio de 1 producto.</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Danger disabled={st.sending}>Cancelar solicitud</Danger>
                  <Primary disabled={!listo || st.sending} press={st.sendPress}>
                    {st.sending ? 'Enviando…' : 'Enviar cotización'}
                  </Primary>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
};

// ------------------------------------------------------------------ línea de estados (pieza de motion)

const PASOS = [
  { label: 'Por cotizar', Icon: Clock },
  { label: 'Cotizada', Icon: Tag },
  { label: 'Confirmada', Icon: Check }
];

/**
 * Estados reales del pedido (ESTADOS de pedido.model) hasta "Confirmada".
 * `progress` 0..3: cuántos pasos están encendidos (con fracciones para animar la línea).
 */
export const EstadoTracker: FC<{ progress: number; role: string; show: number }> = ({ progress, role, show }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: show, transform: `translateY(${(1 - show) * -30}px)`, zIndex: 50 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '16px 26px', borderRadius: 999, background: 'rgba(255,255,255,.96)', boxShadow: '0 30px 60px -30px rgba(0,0,0,.6)' }}>
      {PASOS.map(({ label, Icon }, i) => {
        const on = Math.max(0, Math.min(1, progress - i));
        const lit = on >= 1;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 99,
                  display: 'grid',
                  placeItems: 'center',
                  background: lit ? (i === 2 ? U.green : U.coral) : 'rgba(82,82,82,.1)',
                  color: lit ? '#fff' : U.disabled,
                  transform: `scale(${1 + (on > 0 && on < 1 ? 0.25 * Math.sin(on * Math.PI) : 0)})`
                }}
              >
                <Icon size={24} strokeWidth={2.6} />
              </span>
              <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: lit ? U.strong : U.disabled }}>{label}</span>
            </div>
            {i < PASOS.length - 1 && (
              <div style={{ position: 'relative', width: 110, height: 6, margin: '0 22px', borderRadius: 9, background: 'rgba(82,82,82,.12)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${Math.max(0, Math.min(1, progress - i - 1)) * 100}%`, background: U.coral, borderRadius: 9 }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 99, background: 'rgba(15,23,40,.88)', color: '#fff', fontSize: 24, fontWeight: 700 }}>
      <FileText size={20} /> {role}
    </div>
  </div>
);
