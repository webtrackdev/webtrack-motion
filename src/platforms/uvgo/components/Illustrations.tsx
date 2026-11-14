// Ilustraciones 2D del mapa de UVGo: laptop con la app, edificio del servidor, boveda de datos,
// recursos de Azure, moto del piloto, mapa, satelites de servicios externos y GitHub.
// Todo se dibuja centrado en (x, y) del mundo y entra con un resorte en `at`.
import type { FC, ReactNode } from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { Archive, Cloud, Database, KeyRound, Mail, MapPin, ShoppingCart, Smartphone, Store } from 'lucide-react';
import { SPRING, kf, sp } from '../../../core/anim';
import { C, LAYOUT_BG, TechLogo, mono } from './ui';
import { TECH_PATHS } from './techPaths';

/** Contenedor de una parada: posiciona, hace aparecer y resalta con un halo. */
export const Station: FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  glow?: number;
  color?: string;
  label?: string;
  sub?: string;
  labelGap?: number;
  children: ReactNode;
}> = ({ x, y, w, h, at, glow = 0, color = C.green, label, sub, labelGap = 22, children }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  if (frame < at - 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        opacity: Math.min(1, p * 1.6),
        transform: `scale(${0.55 + 0.45 * p}) translateY(${(1 - p) * 60}px)`
      }}
    >
      {glow > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: -70,
            borderRadius: 999,
            background: `radial-gradient(closest-side, ${color}${Math.round(glow * 70)
              .toString(16)
              .padStart(2, '0')}, transparent)`,
            transform: `scale(${1 + 0.04 * Math.sin(frame / 8)})`
          }}
        />
      )}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>{children}</div>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: h + labelGap,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <div
            style={{
              padding: '10px 26px',
              borderRadius: 999,
              background: '#fff',
              fontSize: 32,
              fontWeight: 800,
              color: C.ink,
              letterSpacing: '-0.02em',
              boxShadow: `0 14px 30px -18px rgba(23,23,23,.5), inset 0 0 0 2.5px ${color}`
            }}
          >
            {label}
          </div>
          {sub && <div style={{ fontSize: 22, fontWeight: 700, color }}>{sub}</div>}
        </div>
      )}
    </div>
  );
};

/** Laptop con una pantalla de UVGo dibujada con su paleta (siderail, tarjetas y boton coral). */
export const Laptop: FC<{ highlight?: number }> = ({ highlight = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 0,
          right: 30,
          height: 330,
          borderRadius: 26,
          background: '#1c2a1c',
          padding: 14,
          boxShadow: '0 30px 60px -28px rgba(0,0,0,.6)'
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 14, background: LAYOUT_BG, overflow: 'hidden', display: 'flex', gap: 10, padding: 12 }}>
          <div style={{ width: 40, borderRadius: 14, background: 'rgba(255,255,255,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: 6, background: i === 1 ? C.coral : 'rgba(23,23,23,.18)' }} />
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>Cotizar materiales</div>
            <div style={{ display: 'flex', gap: 9 }}>
              {[
                ['#fde68a', '#d4d4d4'],
                ['#bae6fd', '#d4d4d4'],
                ['#e2e8f0', '#94a3b8']
              ].map(([a, b], i) => {
                const lit = highlight > 0 && i === 1;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 150,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,.7)',
                      padding: 8,
                      boxShadow: lit ? `0 0 0 3px ${C.coral}` : undefined
                    }}
                  >
                    <div style={{ height: 82, borderRadius: 9, background: `linear-gradient(135deg, ${a}, ${b})` }} />
                    <div style={{ height: 9, width: '80%', borderRadius: 4, background: 'rgba(23,23,23,.55)', marginTop: 9 }} />
                    <div style={{ height: 8, width: '50%', borderRadius: 4, background: 'rgba(23,23,23,.2)', marginTop: 7 }} />
                    <div style={{ height: 14, width: 52, borderRadius: 7, background: C.green, marginTop: 8, opacity: 0.85 }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <div
                style={{
                  padding: '9px 18px',
                  borderRadius: 999,
                  background: C.coral,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  transform: `scale(${1 + 0.05 * highlight * Math.max(0, Math.sin(frame / 5))})`
                }}
              >
                Enviar solicitud
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 334,
          height: 30,
          borderRadius: '6px 6px 22px 22px',
          background: 'linear-gradient(180deg, #d9ded6, #b9c1b5)',
          boxShadow: '0 18px 30px -16px rgba(0,0,0,.45)'
        }}
      >
        <div style={{ margin: '0 auto', width: 110, height: 9, borderRadius: '0 0 10px 10px', background: '#a7b0a2' }} />
      </div>
    </div>
  );
};

/** Edificio del servidor: techo con el logo de Spring y cuatro pisos (las capas). */
export const ServerBuilding: FC<{ lit?: number; floorAt?: number }> = ({ lit = -1 }) => {
  const frame = useCurrentFrame();
  const floors = [
    { name: 'Controller', sub: 'recibe', color: '#2f7d32' },
    { name: 'Service', sub: 'decide', color: '#3f8f3a' },
    { name: 'Entidad', sub: 'reglas', color: '#5aa34a' },
    { name: 'Repository', sub: 'guarda', color: '#77b866' }
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* techo */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 0,
          height: 110,
          borderRadius: '60px 60px 12px 12px',
          background: `linear-gradient(180deg, ${C.green}, #2b5a28)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: '#fff'
        }}
      >
        <TechLogo name="springboot" color="#6db33f" size={64} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Spring Boot 4</div>
          <div style={{ fontSize: 19, fontWeight: 600, opacity: 0.8 }}>Java 21</div>
        </div>
      </div>
      {floors.map((f, i) => {
        const on = lit === i;
        return (
          <div
            key={f.name}
            style={{
              position: 'absolute',
              left: 34,
              right: 34,
              top: 118 + i * 96,
              height: 88,
              borderRadius: 14,
              background: on ? '#fff' : `linear-gradient(90deg, ${f.color}, ${f.color}dd)`,
              boxShadow: on ? `0 0 0 4px ${C.coral}, 0 16px 34px -10px ${C.coral}` : '0 8px 18px -12px rgba(0,0,0,.5)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 22px',
              gap: 14,
              transform: on ? 'scale(1.04)' : undefined
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: on ? C.green : '#fff' }}>{f.name}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: on ? C.muted : 'rgba(255,255,255,.8)' }}>{f.sub}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 22px)', gap: 8 }}>
              {Array.from({ length: 8 }).map((_, k) => {
                const blink = Math.sin(frame / 9 + k * 1.7 + i * 2.3) > 0.2;
                return (
                  <div
                    key={k}
                    style={{ width: 22, height: 18, borderRadius: 5, background: blink ? '#fef3c7' : 'rgba(255,255,255,.28)', opacity: on ? 0.5 : 1 }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 506,
          height: 50,
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 16px 30px -16px rgba(0,0,0,.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          fontFamily: mono,
          fontSize: 21,
          fontWeight: 700,
          color: C.green
        }}
      >
        <Cloud size={24} color={C.sky} strokeWidth={2.5} /> uvgospringboot · App Service
      </div>
    </div>
  );
};

/** Boveda de datos: tres discos de base de datos con el logo de PostgreSQL. */
export const DataVault: FC<{ ghost?: boolean; scale?: number }> = ({ ghost }) => {
  const top = ghost ? '#e5e5e5' : '#7dd3fc';
  const side = ghost ? 'linear-gradient(90deg,#d4d4d4,#e5e5e5,#cfcfcf)' : `linear-gradient(90deg, ${C.deepSky}, #0ea5e9, ${C.deepSky})`;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {[2, 1, 0].map((i) => (
        <div key={i} style={{ position: 'absolute', left: 20, right: 20, top: 70 + i * 92, height: 120 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 30, bottom: 0, borderRadius: '0 0 50% 50% / 0 0 40px 40px', background: side }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 64,
              borderRadius: '50%',
              background: top,
              boxShadow: ghost ? undefined : 'inset 0 -6px 0 rgba(3,105,161,.25)'
            }}
          />
        </div>
      ))}
      {!ghost && (
        <div style={{ position: 'absolute', left: '50%', top: 210, transform: 'translateX(-50%)' }}>
          <TechLogo name="postgresql" color="#336791" size={92} />
        </div>
      )}
    </div>
  );
};

/** Tarjeta de un recurso de Azure (correo, archivos, identidad...). */
export const AzureTile: FC<{ icon: 'mail' | 'blob' | 'sql' | 'id'; title: string; sub: string; ghost?: boolean; pulse?: number }> = ({
  icon,
  title,
  sub,
  ghost,
  pulse = 0
}) => {
  const Ico = { mail: Mail, blob: Archive, sql: Database, id: KeyRound }[icon];
  const color = ghost ? C.faint : C.sky;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 30,
        background: ghost ? 'rgba(255,255,255,.45)' : '#fff',
        border: ghost ? `3px dashed ${C.border}` : undefined,
        boxShadow: ghost ? undefined : `0 20px 40px -24px rgba(3,105,161,.6), 0 0 0 ${pulse * 8}px ${C.sky}33`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        textAlign: 'center',
        padding: 14
      }}
    >
      <div style={{ width: 74, height: 74, borderRadius: 22, background: `${color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ico size={42} color={color} strokeWidth={2.2} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: ghost ? C.faint : C.ink, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.faint, lineHeight: 1.25 }}>{sub}</div>
      {ghost && (
        <div style={{ position: 'absolute', top: -18, right: -14, padding: '6px 14px', borderRadius: 999, background: C.faint, color: '#fff', fontSize: 18, fontWeight: 800 }}>
          sin uso
        </div>
      )}
    </div>
  );
};

/** Moto del piloto con la caja de UVGo atras; las ruedas giran con `speed`. */
export const Moto: FC<{ speed?: number }> = ({ speed = 1 }) => {
  const frame = useCurrentFrame();
  const rot = frame * 9 * speed;
  const bob = Math.sin(frame / 3) * 2 * speed;
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} 238)`}>
      <circle r={52} fill="#1f2937" />
      <circle r={30} fill="#d1d5db" />
      <g transform={`rotate(${rot})`}>
        {[0, 60, 120].map((a) => (
          <rect key={a} x={-3} y={-30} width={6} height={60} rx={3} fill="#6b7280" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={9} fill="#374151" />
    </g>
  );
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 460 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <ellipse cx={235} cy={292} rx={200} ry={10} fill="rgba(0,0,0,.14)" />
        {wheel(100)}
        {wheel(370)}
        <g transform={`translate(0 ${bob})`}>
          {/* cuerpo */}
          <path d="M70 200 Q80 150 150 150 L270 150 Q300 150 315 120 L340 70 L362 74 L345 140 Q395 170 400 215 L340 215 Q320 180 280 190 L170 205 Q120 215 70 200 Z" fill={C.coral} />
          <path d="M150 150 L270 150 Q285 150 292 140 L170 140 Q150 140 150 150 Z" fill="#c2603f" />
          {/* asiento */}
          <rect x={150} y={128} width={120} height={20} rx={10} fill="#1f2937" />
          {/* manubrio */}
          <rect x={330} y={58} width={56} height={12} rx={6} fill="#1f2937" />
          <circle cx={398} cy={150} r={12} fill="#fef3c7" />
          {/* parrilla */}
          <rect x={40} y={136} width={110} height={10} rx={5} fill="#374151" />
        </g>
      </svg>
      <Img
        src={staticFile('uvgo/caja.png')}
        style={{ position: 'absolute', left: 6, top: 18 + bob * 0.5, width: 170, transform: 'rotate(-3deg)' }}
      />
    </div>
  );
};

/** Telefono del piloto con un aviso. */
export const Phone: FC<{ text: string; sub: string; on: number }> = ({ text, sub, on }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 34,
      background: '#1f2937',
      padding: 10,
      boxShadow: '0 24px 40px -20px rgba(0,0,0,.6)'
    }}
  >
    <div style={{ width: '100%', height: '100%', borderRadius: 26, background: LAYOUT_BG, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ width: 60, height: 8, borderRadius: 4, background: 'rgba(0,0,0,.25)', alignSelf: 'center' }} />
      <div
        style={{
          borderRadius: 16,
          background: '#fff',
          padding: '12px 12px',
          boxShadow: '0 8px 18px -10px rgba(0,0,0,.35)',
          opacity: on,
          transform: `translateY(${(1 - on) * -20}px)`
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Smartphone size={18} color={C.coral} />
          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{text}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.faint, marginTop: 4 }}>{sub}</div>
      </div>
      <div style={{ flex: 1, borderRadius: 16, background: 'rgba(255,255,255,.5)' }} />
    </div>
  </div>
);

/** Mapa del campus estilizado con el pin del piloto avanzando por la ruta (0..1). */
export const CampusMap: FC<{ progress: number }> = ({ progress }) => {
  const route = 'M40 230 C 120 230, 120 120, 210 120 S 320 60, 380 60';
  // Puntos aproximados de la ruta para el pin (Bezier simple muestreado).
  const pts = [
    [40, 230],
    [90, 222],
    [120, 180],
    [160, 128],
    [210, 120],
    [260, 108],
    [320, 70],
    [380, 60]
  ];
  const t = Math.max(0, Math.min(0.9999, progress)) * (pts.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f;
  const py = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 30, background: '#fff', padding: 12, boxShadow: '0 24px 44px -26px rgba(0,0,0,.5)' }}>
      <svg viewBox="0 0 420 280" width="100%" height="100%" style={{ borderRadius: 20, background: '#e8efe4' }}>
        {[
          [30, 30, 90, 60],
          [150, 20, 70, 70],
          [260, 120, 120, 70],
          [40, 120, 60, 50],
          [180, 180, 70, 60]
        ].map(([x, y, w, h], k) => (
          <rect key={k} x={x} y={y} width={w} height={h} rx={10} fill={k % 2 ? '#b8d4b6' : '#cfe1cb'} />
        ))}
        <path d="M0 250 H420 M0 100 H420 M130 0 V280 M240 0 V280" stroke="#fff" strokeWidth={14} />
        <path d={route} stroke={C.coral} strokeWidth={6} fill="none" strokeDasharray="12 10" strokeLinecap="round" />
        <circle cx={380} cy={60} r={12} fill={C.green} />
        <g transform={`translate(${px} ${py - 26})`}>
          <circle cy={26} r={16} fill={`${C.coral}55`} />
          <path d="M0 26 C -14 8, -14 -6, 0 -6 C 14 -6, 14 8, 0 26 Z" fill={C.coral} transform="translate(0 -4)" />
          <circle cy={-2} r={5} fill="#fff" />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 26, top: 22, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: '#fff', fontSize: 17, fontWeight: 800, color: C.ink }}>
        <MapPin size={18} color={C.coral} /> Seguimiento en vivo
      </div>
    </div>
  );
};

/** Satelite de un servicio externo: ficha con logo, paneles y un leve vaiven. */
export const Satellite: FC<{ logo?: string; icon?: 'cart' | 'store'; color: string; seed?: number }> = ({ logo, icon, color, seed = 0 }) => {
  const frame = useCurrentFrame();
  const y = Math.sin(frame / 18 + seed) * 8;
  const r = Math.sin(frame / 24 + seed) * 4;
  const Ico = icon === 'cart' ? ShoppingCart : Store;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${y}px) rotate(${r}deg)` }}>
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            top: 52,
            left: s < 0 ? 0 : undefined,
            right: s > 0 ? 0 : undefined,
            width: 70,
            height: 40,
            borderRadius: 8,
            background: `repeating-linear-gradient(90deg, ${C.deepSky}, ${C.deepSky} 14px, #38bdf8 14px, #38bdf8 17px)`,
            boxShadow: '0 8px 16px -10px rgba(0,0,0,.5)'
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 12,
          width: 120,
          height: 120,
          marginLeft: -60,
          borderRadius: 999,
          background: '#fff',
          boxShadow: `0 0 0 6px ${color}33, 0 18px 34px -16px rgba(0,0,0,.5)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {logo ? (
          <svg viewBox="0 0 24 24" width={62} height={62}>
            <path d={TECH_PATHS[logo]} fill={color} />
          </svg>
        ) : (
          <Ico size={58} color={color} strokeWidth={2.2} />
        )}
      </div>
    </div>
  );
};

/** Nodo de GitHub Actions. */
export const GithubNode: FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 34,
      background: '#24292f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 24px 44px -22px rgba(0,0,0,.6)'
    }}
  >
    <svg viewBox="0 0 24 24" width={110} height={110}>
      <path d={TECH_PATHS.githubactions} fill="#fff" />
    </svg>
  </div>
);

/** Region de Azure: rectangulo punteado con su etiqueta. */
export const AzureRegion: FC<{ x: number; y: number; w: number; h: number; at: number }> = ({ x, y, w, h, at }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.soft);
  if (frame < at - 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 70,
        background: 'rgba(14,165,233,.07)',
        border: `4px dashed ${C.sky}88`,
        opacity: p,
        transform: `scale(${0.94 + 0.06 * p})`
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 50,
          bottom: -34,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 26px',
          borderRadius: 999,
          background: C.sky,
          color: '#fff',
          fontSize: 32,
          fontWeight: 800
        }}
      >
        <Cloud size={34} strokeWidth={2.6} /> Microsoft Azure
      </div>
    </div>
  );
};

/** Progreso 0..1 entre dos frames (atajo para animar dentro de las ilustraciones). */
export const prog = (frame: number, a: number, b: number) => kf(frame, [a, b], [0, 1]);
