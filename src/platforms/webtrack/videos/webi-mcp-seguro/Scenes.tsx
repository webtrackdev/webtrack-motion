// Ilustraciones 2D de las mejoras del PR 521. Cada escena recibe su frame local (f) y dibuja
// en el area derecha del cuadro. Paleta saturada sobre fondo claro para que contraste.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Briefcase, Building2, CalendarCheck, Car, Check, Coffee, IdCard, KeyRound, Lock, MapPin, Route, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Img, staticFile } from 'remotion';
import { EASE, SPRING, kf, lerp, sp } from '../../../../core/anim';
import { hexA } from '../../../../core/theme';
import { BRAND } from '../../platform';
import { IcoIcon } from '../../components/IcoIcon';

export const CX = 1350;
export const CY = 540;

const C = { amber: '#f59e0b', cyan: '#06b6d4', green: '#16a34a', red: '#e5484d', violet: '#7c3aed', pink: '#ec4899', orange: '#f97316', teal: '#0d9488' };

/** Pildora con un mensaje real del backend. */
export const Msg: FC<{ kind: 'error' | 'ok' | 'neutral'; children: ReactNode; style?: CSSProperties; p?: number; mono?: boolean }> = ({ kind, children, style, p = 1, mono }) => {
  const color = kind === 'error' ? C.red : kind === 'ok' ? C.green : '#64748b';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '16px 20px',
        borderRadius: 18,
        background: '#fff',
        border: `2px solid ${hexA(color, 0.45)}`,
        boxShadow: `0 20px 40px -18px ${hexA(color, 0.45)}`,
        color: BRAND.ink,
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.35,
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
        opacity: Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * 24}px) scale(${0.9 + 0.1 * p})`,
        ...style
      }}
    >
      <span style={{ flex: 'none', width: 32, height: 32, borderRadius: 16, display: 'grid', placeItems: 'center', background: color, color: '#fff', marginTop: 1 }}>
        {kind === 'error' ? <X size={20} strokeWidth={3} /> : <Check size={20} strokeWidth={3} />}
      </span>
      <span>{children}</span>
    </div>
  );
};

// ── 0. Webi presenta ───────────────────────────────────────────────────────────
export const WebiHero: FC<{ f: number }> = ({ f }) => {
  const p = sp(f, 2, SPRING.pop);
  const shield = sp(f, 16, SPRING.pop);
  const out = kf(f, [58, 70], [0, 1], EASE.in);
  const bob = Math.sin(f / 9) * 8;
  return (
    <div style={{ position: 'absolute', left: 960 - 170, top: 150 + bob - out * 40, width: 340, opacity: 1 - out, transform: `scale(${0.5 + 0.5 * p})`, transformOrigin: '50% 100%' }}>
      <Img src={staticFile('webtrack/webi/webi-frente.svg')} style={{ width: 340 }} />
      <div style={{ position: 'absolute', right: -40, top: 150, width: 120, height: 120, borderRadius: 34, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`, color: '#fff', boxShadow: `0 20px 40px -14px ${hexA(BRAND.primary, 0.6)}`, transform: `scale(${shield}) rotate(${(1 - shield) * 30}deg)` }}>
        <ShieldCheck size={70} strokeWidth={2.2} />
      </div>
    </div>
  );
};

// ── 1. Credenciales ────────────────────────────────────────────────────────────
const KeyBadge: FC<{ x: number; y: number; color: string; label: string; tilt: number }> = ({ x, y, color, label, tilt }) => (
  <div style={{ position: 'absolute', left: x - 90, top: y - 90, width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 150, height: 150, borderRadius: 44, background: color, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: `0 24px 40px -16px ${hexA(color, 0.7)}`, transform: `rotate(${tilt}deg)` }}>
      <KeyRound size={86} strokeWidth={2.2} />
    </div>
    <div style={{ padding: '8px 16px', borderRadius: 12, background: '#fff', border: `2px solid ${hexA(color, 0.5)}`, fontSize: 22, fontWeight: 800, color: BRAND.ink, whiteSpace: 'nowrap' }}>{label}</div>
  </div>
);

export const KeysScene: FC<{ f: number }> = ({ f }) => {
  const approach = kf(f, [20, 78], [0, 1], EASE.inOut);
  const hitAt = 80;
  const bounce = f < hitAt ? 0 : sp(f, hitAt, { damping: 9, stiffness: 140, mass: 0.7 });
  const kx = lerp(430, 175, approach) + bounce * 120;
  const flash = f >= hitAt ? kf(f, [hitAt, hitAt + 4, hitAt + 26], [0, 1, 0]) : 0;
  const shake = f >= hitAt && f < hitAt + 14 ? Math.sin((f - hitAt) * 2.6) * (14 - (f - hitAt)) : 0;
  const shieldIn = sp(f, 4, SPRING.pop);
  const msg = f < hitAt + 8 ? 0 : sp(f, hitAt + 8, SPRING.pop);
  const plus = f < 50 ? 0 : sp(f, 50, SPRING.pop) * (1 - kf(f, [hitAt, hitAt + 6], [0, 1]));
  return (
    <>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="sh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={BRAND.primary} />
            <stop offset="1" stopColor={BRAND.accent} />
          </linearGradient>
        </defs>
        <g transform={`translate(${CX + shake} ${CY - 70}) scale(${shieldIn})`}>
          <path d="M 0 -170 L 140 -115 L 140 10 C 140 105 70 160 0 190 C -70 160 -140 105 -140 10 L -140 -115 Z" fill="url(#sh)" stroke="#0f1728" strokeWidth={6} />
          <path d="M 0 -170 L 140 -115 L 140 10 C 140 105 70 160 0 190 C -70 160 -140 105 -140 10 L -140 -115 Z" fill={C.red} opacity={flash * 0.85} />
          <rect x={-46} y={-20} width={92} height={74} rx={14} fill="#fff" />
          <path d="M -28 -20 L -28 -46 A 28 28 0 0 1 28 -46 L 28 -20" stroke="#fff" strokeWidth={14} fill="none" />
          <circle cx={0} cy={14} r={10} fill={BRAND.primary} />
        </g>
      </svg>
      <KeyBadge x={CX - kx} y={CY - 70} color={C.amber} label="API key · solo lectura" tilt={-12 + bounce * -14} />
      <KeyBadge x={CX + kx} y={CY - 70} color={C.cyan} label="Token de sesión" tilt={12 + bounce * 14} />
      {plus > 0 && (
        <div style={{ position: 'absolute', left: CX - 34, top: CY - 330, width: 68, height: 68, borderRadius: 34, background: BRAND.ink, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 44, fontWeight: 800, transform: `scale(${plus})` }}>+</div>
      )}
      <div style={{ position: 'absolute', left: CX - 330, top: CY + 190, width: 660 }}>
        <Msg kind="error" p={msg} mono>
          400 · Use either an MCP API key or a session token, not both
        </Msg>
      </div>
    </>
  );
};

// ── 2. Permisos por accion ─────────────────────────────────────────────────────
const ENTITIES: { name: string; icon: ReactNode; color: string }[] = [
  { name: 'Vehículos', icon: <Car size={34} />, color: C.orange },
  { name: 'Conductores', icon: <IdCard size={34} />, color: C.pink },
  { name: 'Referencias', icon: <MapPin size={34} />, color: C.red },
  { name: 'Rutas', icon: <Route size={34} />, color: BRAND.primary },
  { name: 'Geocercas', icon: <IcoIcon name="Geofences" size={36} />, color: C.teal },
  { name: 'Trabajos', icon: <Briefcase size={34} />, color: C.violet },
  { name: 'Planes de trabajo', icon: <CalendarCheck size={34} />, color: C.cyan },
  { name: 'Optimización', icon: <Sparkles size={34} />, color: C.amber }
];

const Pill: FC<{ ok: boolean; label: string; shake?: number; glow?: number }> = ({ ok, label, shake = 0, glow = 0 }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 16,
      fontWeight: 800,
      background: ok ? hexA(C.green, 0.12 + glow * 0.2) : hexA(C.red, 0.1 + glow * 0.25),
      color: ok ? C.green : C.red,
      transform: `translateX(${shake}px)`
    }}
  >
    {ok ? <Check size={14} strokeWidth={3} /> : <Lock size={13} strokeWidth={3} />}
    {label}
  </span>
);

export const PermissionsScene: FC<{ f: number }> = ({ f }) => {
  const tileW = 236;
  const tileH = 150;
  const gap = 20;
  const x0 = CX - (4 * tileW + 3 * gap) / 2;
  const y0 = 150;
  const denyAt = 112;
  const hi = f < 70 ? 0 : sp(f, 70, SPRING.smooth);
  const shake = f >= denyAt && f < denyAt + 14 ? Math.sin((f - denyAt) * 2.6) * (14 - (f - denyAt)) * 0.6 : 0;
  const user = f < 66 ? 0 : sp(f, 66, SPRING.pop);
  const bot = f < denyAt ? 0 : sp(f, denyAt, SPRING.pop);
  return (
    <>
      {ENTITIES.map((e, i) => {
        const p = sp(f, 6 + i * 4, SPRING.pop);
        const isCar = i === 0;
        const dim = isCar ? 1 : 1 - hi * 0.45;
        return (
          <div
            key={e.name}
            style={{
              position: 'absolute',
              left: x0 + (i % 4) * (tileW + gap),
              top: y0 + Math.floor(i / 4) * (tileH + gap),
              width: tileW,
              height: tileH,
              padding: 16,
              borderRadius: 22,
              background: '#fff',
              border: `2px solid ${isCar && hi > 0.5 ? e.color : BRAND.border}`,
              boxShadow: isCar && hi > 0.5 ? `0 24px 44px -18px ${hexA(e.color, 0.6)}` : '0 14px 30px -18px rgba(15,23,40,.3)',
              opacity: Math.min(1, p * 1.5) * dim,
              transform: `scale(${(0.7 + 0.3 * p) * (isCar ? 1 + hi * 0.06 : 1)})`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, display: 'grid', placeItems: 'center', background: e.color, color: '#fff' }}>{e.icon}</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: BRAND.ink, lineHeight: 1.1 }}>{e.name}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Pill ok label="Agregar" />
              <Pill ok={!isCar} label="Editar" shake={isCar ? shake : 0} glow={isCar ? bot : 0} />
            </div>
          </div>
        );
      })}
      {/* Conversacion con Webi */}
      <div style={{ position: 'absolute', left: CX - 380, top: 520, width: 760, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ alignSelf: 'flex-end', padding: '16px 22px', borderRadius: '24px 24px 8px 24px', background: hexA(BRAND.primary, 0.1), fontSize: 26, fontWeight: 600, color: BRAND.ink, opacity: user, transform: `translateY(${(1 - user) * 20}px)` }}>
          Edita la placa del vehículo P-118
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, opacity: Math.min(1, bot * 1.5), transform: `translateY(${(1 - bot) * 20}px)` }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden', background: BRAND.primary, flex: 'none', display: 'grid', placeItems: 'center' }}>
            <Img src={staticFile('webtrack/webi/webi-frente.svg')} style={{ width: 44, marginTop: 14 }} />
          </div>
          <Msg kind="error" style={{ flex: 1 }}>No tienes permiso para usar esta herramienta.</Msg>
        </div>
      </div>
    </>
  );
};

// ── 3. Validaciones ────────────────────────────────────────────────────────────
export const ValidationScene: FC<{ f: number }> = ({ f }) => {
  const gx = CX - 230;
  const gy = CY - 80;
  const R = 190;
  const globeIn = sp(f, 4, SPRING.pop);
  const partB = f >= 98;
  const outA = kf(f, [88, 100], [0, 1], EASE.in);
  const drop = kf(f, [18, 38], [0, 1], EASE.in);
  const rejectAt = 40;
  const reject = f < rejectAt ? 0 : sp(f, rejectAt, { damping: 8, stiffness: 150, mass: 0.6 });
  const pinY = lerp(gy - 340, gy - 6, drop) - (f >= rejectAt ? Math.sin(Math.min(1, (f - rejectAt) / 14) * Math.PI) * 50 : 0);
  const msgA = f < rejectAt + 6 ? 0 : sp(f, rejectAt + 6, SPRING.pop);
  // Parte B: organizaciones
  const b = (d: number) => (f < 98 + d ? 0 : sp(f, 98 + d, SPRING.pop));
  const tryAt = 136;
  const arrow = kf(f, [118, tryAt], [0, 1], EASE.inOut);
  const denied = f < tryAt ? 0 : sp(f, tryAt, SPRING.pop);
  const shakeB = f >= tryAt && f < tryAt + 14 ? Math.sin((f - tryAt) * 2.6) * (14 - (f - tryAt)) * 0.7 : 0;
  return (
    <>
      {!partB || outA < 1 ? (
        <div style={{ opacity: 1 - outA }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <radialGradient id="ocean" cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#1d4ed8" />
              </radialGradient>
              <clipPath id="globe">
                <circle cx={gx} cy={gy} r={R} />
              </clipPath>
            </defs>
            <g transform={`translate(${gx} ${gy}) scale(${globeIn}) translate(${-gx} ${-gy})`}>
              <circle cx={gx} cy={gy} r={R} fill="url(#ocean)" stroke="#0f1728" strokeWidth={6} />
              <g clipPath="url(#globe)">
                <path d={`M ${gx - 150} ${gy - 120} q 60 -40 120 -10 q 40 30 10 70 q -40 40 -100 10 z`} fill="#4ade80" />
                <path d={`M ${gx + 50} ${gy + 40} q 70 -20 110 30 q 10 60 -50 80 q -60 -10 -60 -110 z`} fill="#4ade80" />
                {[-120, -60, 0, 60, 120].map((d) => (
                  <ellipse key={`m${d}`} cx={gx} cy={gy} rx={Math.abs(d) === 0 ? 2 : R * Math.cos((d * Math.PI) / 360)} ry={R} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} />
                ))}
                {[-120, -60, 0, 60, 120].map((d) => (
                  <line key={`p${d}`} x1={gx - R} x2={gx + R} y1={gy + d} y2={gy + d} stroke="#fff" strokeOpacity={d === 0 ? 0.8 : 0.35} strokeWidth={d === 0 ? 4 : 2} />
                ))}
                <line x1={gx} x2={gx} y1={gy - R} y2={gy + R} stroke="#fff" strokeOpacity={0.8} strokeWidth={4} />
              </g>
              <text x={gx + 14} y={gy + 34} fill="#fff" fontSize={26} fontWeight={800}>0, 0</text>
            </g>
          </svg>
          {f >= 18 && (
            <div style={{ position: 'absolute', left: gx - 30 + reject * 70, top: pinY - 70, transform: `rotate(${reject * 28}deg)`, opacity: 1 - kf(f, [rejectAt + 18, rejectAt + 28], [0, 1]) }}>
              <MapPin size={70} color="#fff" fill={f >= rejectAt ? C.red : C.orange} strokeWidth={1.5} />
            </div>
          )}
          {f >= rejectAt && (
            <div style={{ position: 'absolute', left: gx - 40, top: gy - 40, width: 80, height: 80, borderRadius: 40, background: C.red, color: '#fff', display: 'grid', placeItems: 'center', transform: `scale(${reject})`, boxShadow: `0 12px 24px -8px ${hexA(C.red, 0.6)}` }}>
              <X size={50} strokeWidth={3.5} />
            </div>
          )}
          <div style={{ position: 'absolute', left: CX - 10, top: CY - 200, width: 520 }}>
            <Msg kind="error" p={msgA}>Las coordenadas 0,0 no son una posición válida: indica la latitud y longitud reales.</Msg>
          </div>
        </div>
      ) : null}
      {partB && (
        <>
          {[
            { name: 'Transportes Demo', sub: 'Tu organización', ok: true, d: 0 },
            { name: 'Organización 812', sub: 'Fuera de tu alcance', ok: false, d: 6 }
          ].map((o, i) => {
            const p = b(o.d);
            return (
              <div
                key={o.name}
                style={{
                  position: 'absolute',
                  left: CX - 420 + i * 440 + (o.ok ? 0 : shakeB),
                  top: 200,
                  width: 400,
                  padding: 26,
                  borderRadius: 26,
                  background: '#fff',
                  border: `3px solid ${o.ok ? hexA(C.green, 0.5) : hexA(C.red, 0.3 + 0.4 * denied)}`,
                  boxShadow: '0 24px 50px -24px rgba(15,23,40,.4)',
                  opacity: Math.min(1, p * 1.5),
                  transform: `translateY(${(1 - p) * 40}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18
                }}
              >
                <div style={{ width: 76, height: 76, borderRadius: 22, display: 'grid', placeItems: 'center', background: o.ok ? C.green : C.red, color: '#fff', flex: 'none' }}>
                  {o.ok ? <Building2 size={42} /> : <Lock size={40} />}
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: BRAND.ink }}>{o.name}</div>
                  <div style={{ fontSize: 21, fontWeight: 600, color: o.ok ? C.green : C.red }}>{o.sub}</div>
                </div>
              </div>
            );
          })}
          {/* Webi intenta crear en la organizacion 812 */}
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <path d={`M ${CX - 60} 520 Q ${CX + 120} 470 ${CX + 240} 340`} stroke={BRAND.primary} strokeWidth={6} fill="none" strokeDasharray="12 10" strokeLinecap="round" opacity={arrow > 0 ? 1 : 0} pathLength={1} strokeDashoffset={0} style={{ clipPath: `inset(0 ${100 - arrow * 100}% 0 0)` }} />
          </svg>
          <div style={{ position: 'absolute', left: CX - 150, top: 470, width: 110, opacity: b(10) }}>
            <Img src={staticFile('webtrack/webi/webi-tres-cuartos.svg')} style={{ width: 110 }} />
          </div>
          <div style={{ position: 'absolute', left: CX - 20, top: 560, width: 560 }}>
            <Msg kind="error" p={denied}>No se encontró la Organización 812 o no tienes acceso a ella.</Msg>
          </div>
        </>
      )}
    </>
  );
};

// ── 4. Errores claros ──────────────────────────────────────────────────────────
export const ErrorsScene: FC<{ f: number }> = ({ f }) => {
  const win = sp(f, 2, SPRING.smooth);
  const user = f < 14 ? 0 : sp(f, 14, SPRING.pop);
  const before = f < 44 ? 0 : sp(f, 44, SPRING.pop);
  const strike = kf(f, [66, 80], [0, 1], EASE.out);
  const after = f < 86 ? 0 : sp(f, 86, SPRING.pop);
  const glow = f < 86 ? 0 : 0.5 + 0.5 * Math.sin((f - 86) / 6);
  return (
    <div
      style={{
        position: 'absolute',
        left: CX - 380,
        top: 140,
        width: 760,
        height: 660,
        borderRadius: 28,
        background: '#fff',
        border: `1px solid ${BRAND.border}`,
        boxShadow: '0 50px 100px -40px rgba(15,23,40,.45)',
        opacity: win,
        transform: `translateY(${(1 - win) * 60}px) scale(${0.94 + 0.06 * win})`,
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderBottom: `1px solid ${BRAND.border}`, background: '#fafbfd' }}>
        <div style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', background: BRAND.primary, display: 'grid', placeItems: 'center' }}>
          <Img src={staticFile('webtrack/webi/webi-frente.svg')} style={{ width: 38, marginTop: 12 }} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: BRAND.ink }}>Webi</div>
      </div>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ alignSelf: 'flex-end', padding: '14px 22px', borderRadius: '22px 22px 6px 22px', background: hexA(BRAND.primary, 0.1), fontSize: 25, fontWeight: 600, color: BRAND.ink, opacity: user, transform: `translateY(${(1 - user) * 18}px)` }}>
          Crea la ruta Zona 12 – Villa Nueva
        </div>
        <div style={{ opacity: before }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.12em', color: '#94a3b8', marginBottom: 8 }}>ANTES</div>
          <div style={{ position: 'relative', padding: '16px 20px', borderRadius: 16, background: '#f1f5f9', color: '#64748b', fontSize: 23, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            An error occurred invoking 'create_route'.
            <div style={{ position: 'absolute', left: 16, right: 16, top: '50%', height: 3, background: C.red, transform: `scaleX(${strike})`, transformOrigin: '0 50%' }} />
          </div>
        </div>
        <div style={{ opacity: Math.min(1, after * 1.5), transform: `translateY(${(1 - after) * 20}px)` }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.12em', color: C.green, marginBottom: 8 }}>AHORA</div>
          <Msg kind="ok" style={{ boxShadow: `0 0 0 ${6 * glow}px ${hexA(C.green, 0.15)}, 0 20px 40px -18px ${hexA(C.green, 0.45)}` }}>
            Faltan parámetros obligatorios: stops.
          </Msg>
        </div>
      </div>
    </div>
  );
};

// ── 5. Planes de optimizacion ──────────────────────────────────────────────────
const RunRow: FC<{ name: string; unit: string; color: string; breaks: number[]; stops: number[]; p: number; ghost?: number; glow?: number; tag?: ReactNode }> = ({ name, unit, color, breaks, stops, p, ghost = 0, glow = 0, tag }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 60}px)` }}>
    <div style={{ width: 170 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.ink }}>{name}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: BRAND.muted }}>{unit}</div>
    </div>
    <div style={{ position: 'relative', flex: 1, height: 54, borderRadius: 14, background: hexA(color, 0.14) }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `2px solid ${hexA(color, 0.45)}` }} />
      {stops.map((s) => (
        <div key={s} style={{ position: 'absolute', left: `${s * 100}%`, top: 17, width: 20, height: 20, marginLeft: -10, borderRadius: 10, background: color, border: '3px solid #fff' }} />
      ))}
      {breaks.map((b) => (
        <div
          key={b}
          style={{
            position: 'absolute',
            left: `${b * 100}%`,
            top: 6,
            width: 70,
            height: 42,
            borderRadius: 10,
            background: ghost > 0 ? 'transparent' : C.amber,
            border: ghost > 0 ? `3px dashed ${hexA(C.red, 0.7)}` : `3px solid ${hexA('#ffffff', 0.9)}`,
            boxShadow: glow > 0 ? `0 0 0 ${6 * glow}px ${hexA(C.green, 0.35)}` : undefined,
            display: 'grid',
            placeItems: 'center',
            color: ghost > 0 ? C.red : '#fff',
            opacity: ghost > 0 ? 0.6 + 0.4 * (1 - ghost) : 1
          }}
        >
          <Coffee size={24} strokeWidth={2.6} />
        </div>
      ))}
    </div>
    {tag}
  </div>
);

export const OptimizationScene: FC<{ f: number }> = ({ f }) => {
  const card = sp(f, 2, SPRING.smooth);
  const r = (d: number) => (f < d ? 0 : sp(f, d, SPRING.pop));
  const newRun = r(62);
  const beforeOn = f >= 80 && f < 112;
  const ghost = beforeOn ? 1 : 0;
  const keep = f < 114 ? 0 : 0.5 + 0.5 * Math.sin((f - 114) / 6);
  const lblBefore = f >= 80 ? sp(f, 80, SPRING.pop) * (1 - kf(f, [108, 114], [0, 1])) : 0;
  const lblAfter = f < 114 ? 0 : sp(f, 114, SPRING.pop);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: CX - 470,
          top: 170,
          width: 940,
          padding: '28px 32px',
          borderRadius: 28,
          background: '#fff',
          border: `1px solid ${BRAND.border}`,
          boxShadow: '0 50px 100px -40px rgba(15,23,40,.45)',
          opacity: card,
          transform: `translateY(${(1 - card) * 50}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.amber, color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Sparkles size={32} />
          </div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, color: BRAND.ink }}>Plan Ruta Norte</div>
            <div style={{ fontSize: 19, fontWeight: 600, color: BRAND.muted }}>Plan de optimización</div>
          </div>
        </div>
        <RunRow name="Corrida 1" unit="P-118" color={BRAND.primary} breaks={[0.38]} stops={[0.12, 0.62, 0.86]} p={r(10)} ghost={ghost} glow={keep} />
        <RunRow name="Corrida 2" unit="C-204" color={C.violet} breaks={[0.52]} stops={[0.2, 0.36, 0.8]} p={r(18)} ghost={ghost} glow={keep} />
        <RunRow
          name="Corrida 3"
          unit="M-310"
          color={C.teal}
          breaks={[0.45]}
          stops={[0.15, 0.7]}
          p={newRun}
          tag={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: hexA(BRAND.primary, 0.1), color: BRAND.primary, fontSize: 17, fontWeight: 800, whiteSpace: 'nowrap', opacity: newRun }}>
              <Img src={staticFile('webtrack/webi/webi-frente.svg')} style={{ width: 20 }} />
              Desde Webi
            </div>
          }
        />
      </div>
      <div style={{ position: 'absolute', left: CX - 330, top: 640, width: 660 }}>
        {lblBefore > 0 && <Msg kind="error" p={lblBefore}>Antes: las otras corridas perdían sus descansos y asignaciones.</Msg>}
        {lblAfter > 0 && <Msg kind="ok" p={lblAfter}>Ahora: se conservan tal como las guardaste.</Msg>}
      </div>
    </>
  );
};

// ── 6. Repaso ──────────────────────────────────────────────────────────────────
export const RECAP = [
  'Una key de solo lectura no escribe',
  'Cada acción exige su permiso',
  'Coordenadas y organizaciones válidas',
  'Errores con el parámetro que falta',
  'Los planes conservan sus descansos'
];
