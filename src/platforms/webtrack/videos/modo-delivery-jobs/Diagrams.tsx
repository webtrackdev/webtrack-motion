// Ilustraciones explicativas del video del Modo Delivery. No son pantallas de la app: la app
// móvil de Jobs no está en reactive, así que su pantalla Hoy se explica con un esquema
// (lo dice la etiqueta "Ilustración"). Todo lo que afirman sale del PR reactive#1788.
import type { FC, ReactNode } from 'react';
import { Check, Settings2, Table2, Truck, UserCog, Wrench } from 'lucide-react';
import { useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { BRAND } from '../../platform';
import { IcoIcon } from '../../components/IcoIcon';

const INK = '#0f172a';
const MUTED = '#64748b';
const BLUE = '#040EFF';
const GREEN = '#00B26B';
const pop = (frame: number, at: number) => (frame < at ? 0 : Math.min(1, sp(frame, at, SPRING.pop)));

const Tag: FC<{ children: ReactNode; x: number; y: number }> = ({ children, x, y }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontSize: 18, fontWeight: 700, color: MUTED, letterSpacing: '.08em', textTransform: 'uppercase' }}>{children}</div>
);

const Bullet: FC<{ at: number; out: number; icon: ReactNode; title: string; body: string; y: number }> = ({ at, out, icon, title, body, y }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at);
  const q = kf(frame, [out, out + 10], [0, 1], EASE.in);
  return (
    <div style={{ position: 'absolute', left: 900, top: y, width: 860, display: 'flex', gap: 26, alignItems: 'flex-start', opacity: p * (1 - q), transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ width: 76, height: 76, borderRadius: 22, background: 'rgba(4,14,255,.08)', color: BLUE, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 46, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 30, color: MUTED, marginTop: 10, lineHeight: 1.3 }}>{body}</div>
      </div>
    </div>
  );
};

// ── 1. Qué hace el Modo Delivery (frases 2 a 4) ──────────────────────────────────────────

const ORDERS = ['Orden 1021 · Tienda Norte', 'Orden 1022 · Farmacia Sur', 'Orden 1023 · Bodega Central'];

/** Esquema de la pantalla Hoy en Modo Delivery: cada orden del job se entrega con un toque. */
export const AppConcept: FC<{ at: number; bullets: [number, number, number]; taps: number[]; out: number }> = ({ at, bullets, taps, out }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at);
  const q = kf(frame, [out, out + 12], [0, 1], EASE.in);
  const done = taps.filter((t) => frame >= t + 4).length;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - q }}>
      <div style={{ position: 'absolute', left: 250, top: 140, width: 420, height: 800, borderRadius: 56, background: '#fff', border: '10px solid #1e293b', boxShadow: '0 40px 80px rgba(15,23,42,.18)', transform: `translateY(${(1 - p) * 60}px)`, opacity: p, overflow: 'hidden' }}>
        <div style={{ height: 34, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 120, height: 22, borderRadius: 12, background: '#1e293b' }} />
        </div>
        <div style={{ padding: '18px 26px 0' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: BLUE, letterSpacing: '.08em' }}>MODO DELIVERY</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: INK }}>Hoy</div>
          <div style={{ marginTop: 16, borderRadius: 18, background: '#f1f5f9', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 800, color: INK }}>
              <Truck size={22} color={BLUE} /> Job · Ruta Centro
            </div>
            <div style={{ fontSize: 15, color: MUTED, marginTop: 4 }}>
              {ORDERS.length - done} por entregar · {done} entregadas
            </div>
          </div>
          {ORDERS.map((o, i) => {
            const t = taps[i] ?? 1e9;
            const ok = frame >= t + 4;
            const tap = kf(frame, [t - 2, t + 3, t + 14], [0, 1, 0]);
            return (
              <div key={o} style={{ marginTop: 14, borderRadius: 16, border: `2px solid ${ok ? GREEN : '#e2e8f0'}`, background: ok ? 'rgba(0,178,107,.08)' : '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: INK }}>{o}</div>
                <div style={{ position: 'relative', width: 46, height: 46, borderRadius: 23, background: ok ? GREEN : BLUE, color: '#fff', display: 'grid', placeItems: 'center' }}>
                  {ok ? <Check size={24} strokeWidth={3} /> : <Truck size={20} />}
                  {tap > 0 && <div style={{ position: 'absolute', inset: -10 - 14 * tap, borderRadius: '50%', border: `3px solid rgba(4,14,255,${0.5 * (1 - tap)})` }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 250, top: 958, width: 420, textAlign: 'center', fontSize: 18, color: MUTED, opacity: p }}>Ilustración · la pantalla real puede variar</div>
      <Bullet at={bullets[0]} out={out} y={250} icon={<IcoIcon name="Jobs" size={40} />} title="La app de Jobs" body="La usa tu equipo en campo para ver y completar sus trabajos del día." />
      <Bullet at={bullets[1]} out={out} y={480} icon={<Truck size={40} />} title="Pantalla Hoy, enfocada" body="Entregar las órdenes de cada job, con un solo toque por entrega." />
      <Bullet at={bullets[2]} out={out} y={710} icon={<Check size={40} strokeWidth={3} />} title="Ideal para reparto" body="Menos pasos y a la vista lo que importa: qué falta por entregar." />
    </div>
  );
};

// ── 2. El equipo del ejemplo (frase 10) ──────────────────────────────────────────────────

export const Team: FC<{ at: number; split: number; out: number }> = ({ at, split, out }) => {
  const frame = useCurrentFrame();
  const q = kf(frame, [out, out + 12], [0, 1], EASE.in);
  const s = Math.min(1, kf(frame, [split, split + 20], [0, 1]));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - q }}>
      <Tag x={260} y={150}>Ejemplo · 20 conductores</Tag>
      <div style={{ position: 'absolute', left: 260, top: 210, display: 'grid', gridTemplateColumns: 'repeat(10, 120px)', gap: 22 }}>
        {Array.from({ length: 20 }, (_, i) => {
          const p = pop(frame, at + i * 2);
          const maint = i >= 15;
          const tint = maint ? s : 0;
          return (
            <div key={i} style={{ width: 120, height: 150, borderRadius: 24, background: maint && s > 0.5 ? '#f1f5f9' : 'rgba(4,14,255,.07)', border: `2px solid ${maint && s > 0.5 ? '#cbd5e1' : 'rgba(4,14,255,.25)'}`, display: 'grid', placeItems: 'center', opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>
              <div style={{ color: tint > 0.5 ? MUTED : BLUE }}>{tint > 0.5 ? <Wrench size={54} /> : <Truck size={54} />}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 260, top: 620, display: 'flex', gap: 60, opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Truck size={56} color={BLUE} />
          <div>
            <div style={{ fontSize: 64, fontWeight: 800, color: INK }}>15</div>
            <div style={{ fontSize: 28, color: MUTED }}>reparten pedidos</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Wrench size={56} color={MUTED} />
          <div>
            <div style={{ fontSize: 64, fontWeight: 800, color: INK }}>5</div>
            <div style={{ fontSize: 28, color: MUTED }}>hacen mantenimiento</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 3. "Igual que la organización" sigue al interruptor general (frase 14) ───────────────

const MiniSwitch: FC<{ on: boolean; size?: number }> = ({ on, size = 1 }) => (
  <div style={{ width: 64 * size, height: 36 * size, borderRadius: 18 * size, background: on ? BLUE : '#cbd5e1', position: 'relative', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 4 * size, left: on ? 32 * size : 4 * size, width: 28 * size, height: 28 * size, borderRadius: '50%', background: '#fff' }} />
  </div>
);

export const Inherit: FC<{ at: number; flips: number[]; out: number }> = ({ at, flips, out }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at);
  const q = kf(frame, [out, out + 10], [0, 1], EASE.in);
  const on = flips.filter((f) => frame >= f).length % 2 === 0;
  const people = ['Carlos', 'Lucía', 'Sofía'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `rgba(246,247,251,${0.985 * p * (1 - q)})` }}>
      <div style={{ position: 'absolute', left: 360, top: 170, width: 1200, opacity: p * (1 - q), transform: `translateY(${(1 - p) * 30}px)` }}>
        <div style={{ margin: '0 auto', width: 760, borderRadius: 28, background: '#fff', boxShadow: '0 20px 50px rgba(15,23,42,.10)', padding: '30px 36px', display: 'flex', alignItems: 'center', gap: 26 }}>
          <Settings2 size={44} color={BLUE} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, color: MUTED, fontWeight: 700 }}>Organización</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: INK }}>Modo Delivery en la app de Jobs</div>
          </div>
          <MiniSwitch on={on} size={1.4} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 70, color: '#94a3b8', lineHeight: 1.1, margin: '6px 0' }}>↓</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 30 }}>
          {people.map((n) => (
            <div key={n} style={{ width: 300, borderRadius: 24, background: '#fff', boxShadow: '0 14px 36px rgba(15,23,42,.08)', padding: '24px 26px' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: INK }}>{n}</div>
              <div style={{ fontSize: 21, color: '#0891b2', fontWeight: 700, marginTop: 4 }}>Igual que la organización</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
                <MiniSwitch on={on} />
                <div style={{ fontSize: 24, fontWeight: 700, color: on ? BLUE : MUTED }}>{on ? 'Con Modo Delivery' : 'Sin Modo Delivery'}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 30, color: MUTED, marginTop: 34 }}>Cambias el interruptor una vez y todos lo siguen, sin tocarlos uno por uno.</div>
      </div>
    </div>
  );
};

// ── 4. Resumen (frase 21) ────────────────────────────────────────────────────────────────

export const Recap: FC<{ at: [number, number, number]; out: number }> = ({ at, out }) => {
  const frame = useCurrentFrame();
  const q = kf(frame, [out, out + 12], [0, 1], EASE.in);
  const cards = [
    { icon: <Settings2 size={52} />, k: 'Regla general', t: 'Interruptor de la organización', b: 'Configuración de Jobs › General' },
    { icon: <UserCog size={52} />, k: 'Excepciones', t: 'Gestión de Preferencias', b: 'Igual que la organización, Activado o Desactivado' },
    { icon: <Table2 size={52} />, k: 'Comprobar', t: 'Columna Modo Delivery', b: 'Ajustes de Usuario, el valor de cada persona' }
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - q }}>
      <Tag x={180} y={200}>En resumen</Tag>
      <div style={{ position: 'absolute', left: 180, top: 260, display: 'flex', gap: 36 }}>
        {cards.map((c, i) => {
          const p = pop(frame, at[i]);
          return (
            <div key={c.k} style={{ width: 492, height: 460, borderRadius: 34, background: '#fff', boxShadow: '0 24px 60px rgba(15,23,42,.10)', padding: '44px 40px', opacity: p, transform: `translateY(${(1 - p) * 50}px)` }}>
              <div style={{ width: 96, height: 96, borderRadius: 28, background: 'rgba(4,14,255,.08)', color: BRAND.primary, display: 'grid', placeItems: 'center' }}>{c.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: BLUE, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 34 }}>{`${i + 1} · ${c.k}`}</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: INK, marginTop: 12, lineHeight: 1.12 }}>{c.t}</div>
              <div style={{ fontSize: 28, color: MUTED, marginTop: 16, lineHeight: 1.3 }}>{c.b}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
