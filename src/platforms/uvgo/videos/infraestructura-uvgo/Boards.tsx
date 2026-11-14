// Escenas a pantalla completa: entrada, leyenda de la vista general, el puente REST/WebSocket,
// la pizarra de POO, servicios externos, despliegue y el resumen final.
import type { CSSProperties, FC, ReactNode } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ArrowRight, Check, GitBranch, Hammer, KeyRound, Lock, Rocket, ShoppingCart, Store, Unlock, X } from 'lucide-react';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { KineticText } from '../../../../core/KineticText';
import { C, LAYER, LAYOUT_BG, Pill, TechLogo, mono, useEnter } from '../../components/ui';
import { T } from './layout';

// ---------------------------------------------------------------- Entrada

export const Intro: FC = () => {
  const frame = useCurrentFrame();
  const out = kf(frame, [T.overview - 22, T.overview], [0, 1], EASE.in);
  const logo = sp(frame, 6, SPRING.soft);
  // La caja cae, aplasta y rebota.
  const fall = kf(frame, [14, 30], [-700, 0], EASE.in);
  const land = sp(frame, 30, SPRING.pop);
  const squash = frame < 30 ? 1 : 1 - 0.18 * Math.sin(Math.min(1, (frame - 30) / 10) * Math.PI) * (1 - land * 0.6);
  const sub = sp(frame, 78);
  if (frame > T.overview + 2) return null;
  return (
    <AbsoluteFill style={{ background: LAYOUT_BG, alignItems: 'center', justifyContent: 'center', opacity: 1 - out }}>
      <Img src={staticFile('uvgo/brand/logo.png')} style={{ position: 'absolute', top: 70, height: 96, opacity: logo, transform: `translateY(${(1 - logo) * -20}px)` }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${1 - out * 0.08})` }}>
        <Img
          src={staticFile('uvgo/caja.png')}
          style={{
            width: 270,
            transform: `translateY(${fall}px) scale(${1 / squash ** 0.5}, ${squash})`,
            transformOrigin: '50% 100%',
            filter: 'drop-shadow(0 30px 26px rgba(0,0,0,.25))'
          }}
        />
        <div style={{ height: 34 }} />
        <KineticText text="Cómo está construido UVGo" start={40} highlight={['UVGo']} style={{ fontSize: 112, justifyContent: 'center' }} />
        <div style={{ marginTop: 26, display: 'flex', gap: 14, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          {['Infraestructura', 'Lenguajes', 'Carpetas', 'Patrones de diseño'].map((t, i) => (
            <div key={t} style={{ transform: `scale(${sp(frame, 78 + i * 5, SPRING.pop)})` }}>
              <Pill color={[LAYER.data, LAYER.server, LAYER.web, C.amberDeep][i]} style={{ fontSize: 28, padding: '12px 24px' }}>
                {t}
              </Pill>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Vista general

export const OverviewLegend: FC = () => {
  const e = useEnter(T.overview + 40, T.web - 10, -30);
  if (!e.visible) return null;
  const items = [
    { c: LAYER.web, t: 'App web' },
    { c: LAYER.server, t: 'Servidor' },
    { c: LAYER.data, t: 'Datos' },
    { c: C.sky, t: 'Azure' },
    { c: C.amberDeep, t: 'Externos' },
    { c: LAYER.pilot, t: 'Piloto' }
  ];
  return (
    <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...e.style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '16px 30px', borderRadius: 999, background: 'rgba(255,255,255,.9)', boxShadow: '0 20px 40px -24px rgba(0,0,0,.4)' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, marginRight: 8 }}>Sigamos una caja: el pedido de un estudiante</div>
        {items.map((it) => (
          <div key={it.t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 700, color: C.muted }}>
            <div style={{ width: 18, height: 18, borderRadius: 6, background: it.c }} />
            {it.t}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Puente

export const BridgeOverlay: FC = () => {
  const frame = useCurrentFrame();
  const e = useEnter(T.bridge + 20, T.server - 10, -30);
  if (!e.visible) return null;
  const rest = ['/api/v1/auth', '/api/v1/pedidos', '/api/v1/extracciones', '/articulos', '/api/v1/pilotos'];
  return (
    <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...e.style }}>
      <div style={{ width: 1560, padding: '26px 34px', borderRadius: 34, background: 'rgba(255,255,255,.92)', boxShadow: '0 30px 60px -30px rgba(0,0,0,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <div style={{ fontSize: 38, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>El puente</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: C.muted }}>así viaja la petición del navegador al servidor</div>
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 18 }}>
          <div style={{ flex: 2.2 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: LAYER.web, letterSpacing: '0.08em' }}>REST · JSON (pedir y guardar)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
              {rest.map((r, i) => (
                <div key={r} style={{ transform: `scale(${sp(frame, T.bridge + 40 + i * 6, SPRING.pop)})` }}>
                  <Pill color={LAYER.web} style={{ fontFamily: mono }}>
                    {r}
                  </Pill>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: LAYER.pilot, letterSpacing: '0.08em' }}>WEBSOCKET · EN VIVO</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, transform: `scale(${sp(frame, T.bridge + 75, SPRING.pop)})`, transformOrigin: 'left' }}>
              <Pill color={LAYER.pilot} style={{ fontFamily: mono }}>
                /ws
              </Pill>
              <Pill color={LAYER.pilot}>GPS y avisos</Pill>
            </div>
          </div>
          <div style={{ flex: 1.1, display: 'flex', alignItems: 'center', gap: 14, opacity: sp(frame, T.bridge + 100) }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <KeyRound size={32} color="#422006" strokeWidth={2.6} />
            </div>
            <div style={{ fontSize: 23, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>
              El <b>Interceptor</b> de api.ts le pega el token JWT a cada petición
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Pizarra de POO

const Board: FC<{ at: number; out: number; children: ReactNode; tabs: { label: string; from: number }[] }> = ({ at, out, children, tabs }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.smooth);
  const q = kf(frame, [out, out + 14], [0, 1], EASE.in);
  if (frame < at - 1 || frame > out + 15) return null;
  const active = tabs.reduce((acc, t, i) => (frame >= t.from ? i : acc), 0);
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(223,230,220,${0.72 * Math.min(p, 1 - q)})` }} />
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 60,
          width: 1780,
          height: 960,
          borderRadius: 44,
          background: '#fffdf9',
          boxShadow: '0 50px 100px -40px rgba(0,0,0,.45)',
          padding: '40px 54px',
          opacity: Math.min(1, p * 1.3) * (1 - q),
          transform: `translateY(${(1 - p) * 80}px) scale(${0.95 + 0.05 * p})`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <TechLogo name="openjdk" color="#ea7100" size={66} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.12em', color: C.green }}>DENTRO DEL SERVIDOR · JAVA</div>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink }}>Programación orientada a objetos</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            {tabs.map((t, i) => (
              <div
                key={t.label}
                style={{
                  padding: '12px 24px',
                  borderRadius: 999,
                  fontSize: 22,
                  fontWeight: 700,
                  background: i === active ? C.green : 'rgba(23,23,23,.06)',
                  color: i === active ? '#fff' : C.faint
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', flex: 1, marginTop: 30 }}>{children}</div>
      </div>
    </>
  );
};

const Klass: FC<{ name: string; tag?: string; color: string; fields?: string[]; methods?: string[]; width?: number; style?: CSSProperties; dashed?: boolean }> = ({
  name,
  tag,
  color,
  fields = [],
  methods = [],
  width = 330,
  style,
  dashed
}) => (
  <div
    style={{
      width,
      borderRadius: 22,
      background: '#fff',
      boxShadow: `inset 0 0 0 3px ${color}, 0 18px 36px -22px rgba(0,0,0,.45)`,
      border: dashed ? `3px dashed ${color}` : undefined,
      overflow: 'hidden',
      ...style
    }}
  >
    <div style={{ padding: '12px 18px', background: `${color}18`, textAlign: 'center' }}>
      {tag && <div style={{ fontFamily: mono, fontSize: 17, fontWeight: 700, color }}>«{tag}»</div>}
      <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, fontStyle: tag === 'abstracta' ? 'italic' : undefined }}>{name}</div>
    </div>
    {(fields.length > 0 || methods.length > 0) && (
      <div style={{ padding: '10px 18px', fontFamily: mono, fontSize: 19, lineHeight: 1.55, color: C.muted }}>
        {fields.map((f) => (
          <div key={f}>{f}</div>
        ))}
        {methods.map((m) => (
          <div key={m} style={{ color: C.ink, fontWeight: 700 }}>
            {m}
          </div>
        ))}
      </div>
    )}
  </div>
);

const Note: FC<{ at: number; title: string; text: string; color: string }> = ({ at, title, text, color }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  return (
    <div style={{ flex: 1, padding: '18px 22px', borderRadius: 22, background: `${color}12`, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{title}</div>
      <div style={{ fontSize: 23, fontWeight: 500, color: C.ink, lineHeight: 1.35, marginTop: 4 }}>{text}</div>
    </div>
  );
};

const InheritStep: FC = () => {
  const frame = useCurrentFrame();
  const a = T.oopInherit;
  const kids = [
    { name: 'Estudiante', role: 'ESTUDIANTE', color: LAYER.web, x: 160 },
    { name: 'Administrador', role: 'ADMINISTRADOR', color: LAYER.server, x: 670 },
    { name: 'Piloto', role: 'PILOTO', color: LAYER.pilot, x: 1180 }
  ];
  const lines = kf(frame, [a + 25, a + 45], [0, 1], EASE.out);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 506, top: 0, transform: `scale(${sp(frame, a + 5, SPRING.pop)})` }}>
        <Klass name="Usuario" tag="abstracta" color={C.ink} width={460} fields={['- id: UUID', '- correo: String', '- contrasenaHash: String']} methods={['+ obtenerRol(): String  (abstracto)']} />
      </div>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1}>
        <path d="M 736 238 V 270" stroke={C.ink} strokeWidth={4} strokeDasharray={`${40 * lines} 40`} />
        <polygon points="722,262 750,262 736,240" fill="#fff" stroke={C.ink} strokeWidth={4} opacity={lines} />
        <path d={`M 325 330 V 300 H 1345 V 330 M 836 300 V 330`} stroke={C.ink} strokeWidth={4} fill="none" strokeDasharray={`${1400 * lines} 1400`} />
        <path d="M 736 270 V 300" stroke={C.ink} strokeWidth={4} opacity={lines} />
      </svg>
      {kids.map((k, i) => {
        const p = sp(frame, a + 40 + i * 8, SPRING.pop);
        const b = sp(frame, a + 80 + i * 22, SPRING.pop);
        return (
          <div key={k.name} style={{ position: 'absolute', left: k.x, top: 330, transform: `scale(${p})`, transformOrigin: '50% 0' }}>
            <Klass name={k.name} color={k.color} width={330} methods={['+ obtenerRol()']} />
            <div
              style={{
                marginTop: 14,
                padding: '10px 16px',
                borderRadius: 16,
                background: k.color,
                color: '#fff',
                fontFamily: mono,
                fontSize: 21,
                fontWeight: 800,
                textAlign: 'center',
                opacity: b,
                transform: `translateY(${(1 - b) * -14}px)`
              }}
            >
              → "{k.role}"
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', gap: 18 }}>
        <Note at={a + 140} color={C.green} title="Herencia" text="Los tres comparten id, correo y contraseña de Usuario." />
        <Note at={a + 160} color={C.coral} title="Polimorfismo" text="Cada tipo responde distinto a obtenerRol()." />
        <Note at={a + 180} color={C.deepSky} title="En la base" text="Una sola tabla usuarios; el rol viaja dentro del JWT." />
      </div>
    </div>
  );
};

const STATES = ['SOLICITADO', 'COTIZADO', 'CONFIRMADO', 'EN_COMPRA', 'LISTO', 'ENTREGADO', 'PAGADO', 'CANCELADO'];

const EncapStep: FC = () => {
  const frame = useCurrentFrame();
  const a = T.oopEncap;
  // Estado actual del pedido segun la animacion de metodos.
  const cur = frame < a + 70 ? 'COTIZADO' : frame < a + 140 ? 'CONFIRMADO' : 'PAGADO';
  const action = frame < a + 50 ? null : frame < a + 120 ? 'aceptar' : frame < a + 190 ? 'registrarPago' : 'aceptar-x';
  const methods = ['cotizar()', 'aceptar()', 'registrarPago()', 'cancelar()', 'getTotal()'];
  const pressed = (m: string) =>
    (m === 'aceptar()' && (action === 'aceptar' || action === 'aceptar-x')) || (m === 'registrarPago()' && action === 'registrarPago');
  const msg =
    action === 'aceptar'
      ? { ok: true, text: 'aceptar() solo funciona si está COTIZADO' }
      : action === 'registrarPago'
        ? { ok: true, text: 'registrarPago() exige el comprobante' }
        : action === 'aceptar-x'
          ? { ok: false, text: '409 · Solo se puede aceptar una solicitud cotizada' }
          : null;
  const mp = msg ? sp(frame, action === 'aceptar' ? a + 50 : action === 'registrarPago' ? a + 120 : a + 190, SPRING.pop) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 600, opacity: sp(frame, a + 5), transform: `translateX(${(1 - sp(frame, a + 5)) * -40}px)` }}>
        <div style={{ borderRadius: 26, background: '#fff', boxShadow: `inset 0 0 0 3px ${C.green}, 0 24px 44px -26px rgba(0,0,0,.45)`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', background: `${C.green}16` }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.ink }}>Pedido</div>
            <div style={{ fontFamily: mono, fontSize: 17, color: C.green, fontWeight: 700 }}>«entidad rica»</div>
          </div>
          <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[`- estado: ${cur}`, '- version: long', '- piloto: Piloto', '- items: List<ItemPedido>'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: mono, fontSize: 21, color: C.muted }}>
                <Lock size={20} color={C.coral} strokeWidth={2.6} />
                {f}
              </div>
            ))}
            <div style={{ height: 2, background: C.hair, margin: '6px 0' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {methods.map((m) => {
                const on = pressed(m);
                return (
                  <div
                    key={m}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 14px',
                      borderRadius: 12,
                      fontFamily: mono,
                      fontSize: 19,
                      fontWeight: 800,
                      background: on ? C.green : `${C.green}12`,
                      color: on ? '#fff' : C.green,
                      transform: `scale(${on ? 1.06 : 1})`
                    }}
                  >
                    <Unlock size={16} /> + {m}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, fontSize: 22, fontWeight: 600, color: C.muted, opacity: sp(frame, a + 30) }}>
          <div style={{ fontFamily: mono, fontWeight: 800, color: C.green }}>◆ 1..*</div>
          <Pill color={C.green} style={{ fontFamily: mono }}>
            ItemPedido
          </Pill>
          CATALOGO · WEB · TEXTO
        </div>
      </div>
      <div style={{ position: 'absolute', left: 660, top: 0, right: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, opacity: sp(frame, a + 15) }}>
          enum <span style={{ fontFamily: mono, color: C.red }}>EstadoPedido</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
          {STATES.map((s, i) => {
            const on = s === cur;
            const p = sp(frame, a + 18 + i * 4, SPRING.pop);
            return (
              <div
                key={s}
                style={{
                  padding: '12px 18px',
                  borderRadius: 14,
                  fontFamily: mono,
                  fontSize: 21,
                  fontWeight: 800,
                  background: on ? C.red : '#fff',
                  color: on ? '#fff' : C.muted,
                  boxShadow: on ? `0 12px 24px -10px ${C.red}` : `inset 0 0 0 2px ${C.border}`,
                  transform: `scale(${p * (on ? 1.08 : 1)})`
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
        {msg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 30,
              padding: '18px 24px',
              borderRadius: 20,
              background: msg.ok ? `${C.green}14` : `${C.red}14`,
              color: msg.ok ? C.green : C.red,
              fontSize: 26,
              fontWeight: 800,
              opacity: mp,
              transform: `scale(${0.9 + 0.1 * mp})`
            }}
          >
            {msg.ok ? <Check size={32} strokeWidth={3.2} /> : <X size={32} strokeWidth={3.2} />}
            <span style={{ fontFamily: mono, fontSize: 23 }}>{msg.text}</span>
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', gap: 18 }}>
        <Note at={a + 60} color={C.coral} title="Encapsulamiento" text="Los atributos son privados; solo cambian por sus métodos." />
        <Note at={a + 130} color={C.red} title="State" text="Cada método revisa el estado antes de actuar." />
        <Note at={a + 200} color={C.green} title="Modelo rico + composición" text="Las reglas viven en Pedido, que contiene sus ítems." />
      </div>
    </div>
  );
};

const IfaceStep: FC = () => {
  const frame = useCurrentFrame();
  const a = T.oopIface;
  const pairs = [
    {
      i: { name: 'AlmacenArchivos', tag: 'interfaz', methods: ['+ guardar()', '+ leer()', '+ eliminar()'] },
      c: { name: 'AlmacenAzureBlob', tag: 'adaptador', methods: ['Azure Storage SDK'] },
      user: 'PedidoService'
    },
    {
      i: { name: 'ArticuloRepository', tag: 'puerto', methods: ['+ getAll()', '+ guardar()'] },
      c: { name: 'ArticuloEntityRepository', tag: 'adaptador', methods: ['JPA + MapStruct'] },
      user: 'ArticuloService'
    }
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {pairs.map((pr, r) => {
        const p = sp(frame, a + 10 + r * 40, SPRING.pop);
        const dash = kf(frame, [a + 30 + r * 40, a + 50 + r * 40], [0, 1]);
        return (
          <div key={pr.i.name} style={{ position: 'absolute', left: 0, right: 0, top: r * 300, display: 'flex', alignItems: 'center', gap: 26, opacity: Math.min(1, p * 1.4) }}>
            <Pill color={C.green} solid style={{ fontSize: 24, padding: '14px 22px' }}>
              {pr.user}
            </Pill>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 18, fontWeight: 700, color: C.muted }}>
              usa
              <ArrowRight size={36} color={C.ink} />
            </div>
            <div style={{ transform: `scale(${p})` }}>
              <Klass name={pr.i.name} tag={pr.i.tag} color={C.amberDeep} width={400} methods={pr.i.methods} />
            </div>
            <svg width={150} height={40} style={{ overflow: 'visible' }}>
              <path d="M 150 20 H 22" stroke={C.ink} strokeWidth={4} strokeDasharray="12 9" opacity={dash} />
              <polygon points="0,20 24,8 24,32" fill="#fff" stroke={C.ink} strokeWidth={4} opacity={dash} />
              <text x={75} y={-2} textAnchor="middle" fontSize={18} fontWeight={700} fill={C.muted} opacity={dash}>
                implementa
              </text>
            </svg>
            <div style={{ transform: `scale(${sp(frame, a + 35 + r * 40, SPRING.pop)})` }}>
              <Klass name={pr.c.name} tag={pr.c.tag} color={C.sky} width={420} methods={pr.c.methods} />
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', gap: 18 }}>
        <Note at={a + 110} color={C.amberDeep} title="Interfaces (abstracción)" text="El servicio solo conoce el contrato, no cómo se cumple." />
        <Note at={a + 135} color={C.sky} title="Strategy · Puertos y adaptadores" text="Cambiar Azure por otro almacén no toca el resto del código." />
      </div>
    </div>
  );
};

export const OopBoard: FC = () => (
  <Board
    at={T.oop}
    out={T.data - 10}
    tabs={[
      { label: 'Herencia', from: 0 },
      { label: 'Encapsulamiento', from: T.oopEncap },
      { label: 'Interfaces', from: T.oopIface }
    ]}
  >
    <StepFill at={T.oopInherit} out={T.oopEncap - 12}>
      <InheritStep />
    </StepFill>
    <StepFill at={T.oopEncap} out={T.oopIface - 12}>
      <EncapStep />
    </StepFill>
    <StepFill at={T.oopIface} out={T.data - 10}>
      <IfaceStep />
    </StepFill>
  </Board>
);

const StepFill: FC<{ at: number; out: number; children: ReactNode }> = ({ at, out, children }) => {
  const e = useEnter(at, out, 30);
  if (!e.visible) return null;
  return <div style={{ position: 'absolute', inset: 0, ...e.style }}>{children}</div>;
};

// ---------------------------------------------------------------- Servicios externos

export const SatsOverlay: FC = () => {
  const frame = useCurrentFrame();
  const e = useEnter(T.sats + 20, T.deploy - 10, 40);
  if (!e.visible) return null;
  const cards = [
    { at: T.sats + 40, logo: <TechLogo name="claude" color="#d97757" size={64} />, name: 'Claude API', text: 'Lee el PDF con la lista de materiales y extrae los productos', where: 'ExtraccionService' },
    { at: T.sats + 90, logo: <IconTile icon={<ShoppingCart size={34} />} />, name: 'SerpApi', text: 'Busca precios en Google Shopping', where: 'BusquedaExternaService' },
    { at: T.sats + 140, logo: <IconTile icon={<Store size={34} />} />, name: 'BrightData', text: 'Trae productos de tiendas en línea', where: 'BrightDataService' },
    { at: T.sats + 190, logo: <TechLogo name="mapbox" color="#000" size={64} />, name: 'Mapbox', text: 'Dibuja el mapa del campus y las rutas', where: 'en el navegador' }
  ];
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, bottom: 50, ...e.style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <Pill color={C.amberDeep} solid style={{ fontSize: 26, padding: '12px 24px' }}>
          Servicios externos (SaaS)
        </Pill>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.ink, padding: '8px 18px', borderRadius: 999, background: 'rgba(255,255,255,.85)' }}>
          El servidor y la web los usan por HTTPS
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        {cards.map((c) => {
          const p = sp(frame, c.at, SPRING.pop);
          return (
            <div
              key={c.name}
              style={{
                flex: 1,
                padding: 22,
                borderRadius: 26,
                background: 'rgba(255,255,255,.95)',
                boxShadow: '0 24px 44px -26px rgba(0,0,0,.45)',
                opacity: Math.min(1, p * 1.4),
                transform: `translateY(${(1 - p) * 50}px)`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {c.logo}
                <div style={{ fontSize: 30, fontWeight: 800, color: C.ink }}>{c.name}</div>
              </div>
              <div style={{ fontSize: 23, fontWeight: 500, color: C.muted, lineHeight: 1.35, marginTop: 12 }}>{c.text}</div>
              <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.amberDeep, marginTop: 10 }}>{c.where}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const IconTile: FC<{ icon: ReactNode }> = ({ icon }) => (
  <div style={{ width: 64, height: 64, borderRadius: 18, background: `${C.amberDeep}1c`, color: C.amberDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
);

// ---------------------------------------------------------------- Despliegue

export const DeployOverlay: FC = () => {
  const frame = useCurrentFrame();
  const e = useEnter(T.deploy + 20, T.summary - 10, -40);
  if (!e.visible) return null;
  const steps = [
    { at: T.deploy + 40, icon: <GitBranch size={34} />, title: 'push a main', text: 'en el repositorio del backend' },
    { at: T.deploy + 90, icon: <Hammer size={34} />, title: 'GitHub Actions', text: 'compila: ./gradlew clean build' },
    { at: T.deploy + 140, icon: <KeyRound size={34} />, title: 'Entra a Azure', text: 'por OIDC, sin contraseñas guardadas' },
    { at: T.deploy + 190, icon: <Rocket size={34} />, title: 'Despliega el JAR', text: 'en App Service: uvgospringboot' }
  ];
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 40, ...e.style }}>
      <Pill color="#24292f" solid style={{ fontSize: 26, padding: '12px 24px', marginBottom: 16 }}>
        Así llega a producción
      </Pill>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 22, borderRadius: 30, background: 'rgba(255,255,255,.95)', boxShadow: '0 24px 44px -26px rgba(0,0,0,.45)' }}>
        {steps.map((s, i) => {
          const p = sp(frame, s.at, SPRING.pop);
          return (
            <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, opacity: Math.max(0.2, Math.min(1, p * 1.4)), transform: `scale(${0.9 + 0.1 * p})` }}>
                <div
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 20,
                    background: frame >= s.at ? '#24292f' : '#fff',
                    color: frame >= s.at ? '#fff' : '#24292f',
                    boxShadow: 'inset 0 0 0 3px #24292f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 27, fontWeight: 800, color: C.ink }}>{s.title}</div>
                  <div style={{ fontSize: 21, fontWeight: 500, color: C.muted }}>{s.text}</div>
                </div>
              </div>
              {i < steps.length - 1 && <ArrowRight size={34} color={C.faint} style={{ flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Resumen

const Col: FC<{ at: number; title: string; color: string; children: ReactNode; flex?: number }> = ({ at, title, color, children, flex = 1 }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  return (
    <div
      style={{
        flex,
        padding: 28,
        borderRadius: 30,
        background: '#fff',
        boxShadow: `inset 0 6px 0 ${color}, 0 24px 44px -28px rgba(0,0,0,.45)`,
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 50}px)`
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.12em', color, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
};

const TechLine: FC<{ logos: { name: string; color: string }[]; title: string; sub: string }> = ({ logos, title, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
    {logos.map((l) => (
      <TechLogo key={l.name} name={l.name} color={l.color} size={58} />
    ))}
    <div>
      <div style={{ fontSize: 27, fontWeight: 800, color: C.ink }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: C.faint }}>{sub}</div>
    </div>
  </div>
);

export const SummaryBoard: FC = () => {
  const frame = useCurrentFrame();
  const a = T.summary + 150;
  const p = sp(frame, a, SPRING.smooth);
  const q = kf(frame, [T.end - 16, T.end], [0, 1], EASE.in);
  if (frame < a - 1 || frame > T.end + 1) return null;
  const front = ['Route Guard', 'Container / Presentational', 'Custom Hooks', 'Store', 'Adapter', 'Service Layer', 'Singleton', 'Interceptor', 'Observer'];
  const back = ['Capas', 'Repository', 'Puertos y adaptadores', 'Strategy', 'Observer', 'State', 'Modelo rico', 'Herencia', 'Chain of Responsibility', 'Inyección de dependencias'];
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(223,230,220,${0.92 * p * (1 - q)})` }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 60, bottom: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 1 - q }}>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, opacity: p, transform: `translateY(${(1 - p) * -30}px)` }}>
          UVGo en una mirada
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
          <Col at={a + 10} title="Lenguajes" color={LAYER.server}>
            <TechLine logos={[{ name: 'typescript', color: '#3178c6' }, { name: 'react', color: '#149eca' }]} title="TypeScript + React" sub="la app web" />
            <TechLine logos={[{ name: 'openjdk', color: '#ea7100' }, { name: 'springboot', color: '#6db33f' }]} title="Java 21 + Spring Boot 4" sub="el servidor" />
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.12em', color: LAYER.data, marginTop: 26 }}>BASE DE DATOS</div>
            <div style={{ marginTop: 14 }}>
              <TechLine logos={[{ name: 'postgresql', color: '#336791' }]} title="PostgreSQL en Azure" sub="JPA / Hibernate · Flyway" />
            </div>
          </Col>
          <Col at={a + 20} title="Infraestructura" color={C.sky}>
            {[
              ['Azure App Service', 'corre el servidor'],
              ['Azure PostgreSQL', 'guarda los datos'],
              ['Blob Storage', 'guarda comprobantes'],
              ['Communication Services', 'envía los correos'],
              ['Identidad administrada', 'despliegue sin secretos'],
              ['Claude · SerpApi · BrightData · Mapbox', 'servicios externos']
            ].map(([t, s], i) => (
              <div key={t} style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, opacity: sp(frame, a + 30 + i * 5) }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: i === 5 ? C.amberDeep : C.sky, flexShrink: 0, transform: 'translateY(-3px)' }} />
                <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>
                  {t} <span style={{ fontWeight: 500, color: C.muted }}>· {s}</span>
                </div>
              </div>
            ))}
          </Col>
          <Col at={a + 30} title="Patrones de diseño" color={C.coral} flex={1.25}>
            <div style={{ fontSize: 21, fontWeight: 800, color: LAYER.web }}>App web</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {front.map((t, i) => (
                <div key={t} style={{ transform: `scale(${sp(frame, a + 40 + i * 3, SPRING.pop)})` }}>
                  <Pill color={LAYER.web} style={{ fontSize: 22, padding: '8px 15px' }}>
                    {t}
                  </Pill>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, color: LAYER.server, marginTop: 20 }}>Servidor</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {back.map((t, i) => (
                <div key={t} style={{ transform: `scale(${sp(frame, a + 70 + i * 3, SPRING.pop)})` }}>
                  <Pill color={LAYER.server} style={{ fontSize: 22, padding: '8px 15px' }}>
                    {t}
                  </Pill>
                </div>
              ))}
            </div>
          </Col>
        </div>
      </div>
    </>
  );
};

