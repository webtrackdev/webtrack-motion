// Replica de Usuarios > "Creación Rápida de Usuarios" (SlidingPaneQuickCreateUser) y del aviso
// de limite de licencias (UserLicenseLimitDialog). Textos del i18n real de reactive (solo
// lectura). Lo que el cursor toca esta montado desde el frame 0 para medir sus anclas.
import type { FC, ReactNode } from 'react';
import { Check, ChevronDown, ChevronUp, ChevronRight, Loader2, Plus, TriangleAlert, X } from 'lucide-react';
import { Btn, Label, Menu, SelectField, TextField } from '../../components/FormKit';

export type UsersState = {
  frame: number;
  /** 0..1 entrada del panel lateral. */
  pane: number;
  org: string;
  division: string;
  subdivision: string;
  orgOpen: number;
  orgHover: number | null;
  /** 0..1 resalte verde de la membresia. */
  glow: number;
  savePress: number;
  busy: null | 'validating' | 'creating';
  /** 0..1 aviso de licencias. */
  dialog: number;
  cancelPress: number;
};

export const ORGS = ['Transportes Alfa', 'Logística Norte', 'Distribuidora Sur'];
export const MEMBERSHIP: Record<string, { division: string; subdivision: string }> = {
  'Transportes Alfa': { division: 'Zona Centro', subdivision: 'Ruta 1' },
  'Logística Norte': { division: 'Zona Norte', subdivision: 'Ruta 4' },
  'Distribuidora Sur': { division: 'Zona Sur', subdivision: 'Ruta 2' }
};

const USERS = [
  ['Carlos Méndez', 'cmendez@ejemplo.com', 'Despachador', 'Transportes Alfa'],
  ['Lucía Barrios', 'lbarrios@ejemplo.com', 'Supervisor', 'Transportes Alfa'],
  ['Diego Paz', 'dpaz@ejemplo.com', 'Monitoreo', 'Logística Norte'],
  ['Sofía Ruiz', 'sruiz@ejemplo.com', 'Despachador', 'Distribuidora Sur'],
  ['Mario León', 'mleon@ejemplo.com', 'Administrador', 'Transportes Alfa'],
  ['Elena Soto', 'esoto@ejemplo.com', 'Monitoreo', 'Logística Norte']
];

const Page: FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px' }}>
    <div className="page-header">
      <nav className="page-breadcrumb">
        <span>Administración</span>
        <ChevronRight />
        <span data-slot="breadcrumb-page">Usuarios</span>
      </nav>
      <h1 className="page-title">Usuarios</h1>
    </div>
    <div className="surface-card" style={{ padding: '6px 0', marginTop: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.6fr 1fr 1.2fr 0.7fr', padding: '12px 22px', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
        <span>Nombre</span>
        <span>Correo</span>
        <span>Rol</span>
        <span>Organización</span>
        <span>Estado</span>
      </div>
      {USERS.map((u) => (
        <div key={u[1]} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.6fr 1fr 1.2fr 0.7fr', padding: '13px 22px', fontSize: 13, borderTop: '1px solid var(--border)', color: 'var(--foreground)', alignItems: 'center' }}>
          <span style={{ fontWeight: 700 }}>{u[0]}</span>
          <span style={{ color: 'var(--muted-foreground)' }}>{u[1]}</span>
          <span>{u[2]}</span>
          <span>{u[3]}</span>
          <span style={{ justifySelf: 'start', padding: '2px 10px', borderRadius: 999, background: 'rgba(34,197,94,.14)', color: '#15803d', fontWeight: 700, fontSize: 12 }}>Activo</span>
        </div>
      ))}
    </div>
  </div>
);

const Radio: FC<{ on?: boolean; children: ReactNode }> = ({ on, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 26, fontSize: 13, color: 'var(--foreground)' }}>
    <span style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${on ? 'var(--primary)' : 'var(--input)'}`, display: 'grid', placeItems: 'center' }}>
      {on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
    </span>
    {children}
  </div>
);

const Spinner: FC<{ frame: number; message: string }> = ({ frame, message }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 56, bottom: 0, background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <Loader2 size={46} style={{ color: 'var(--primary)', transform: `rotate(${frame * 18}deg)` }} />
    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-foreground)' }}>{message}</span>
  </div>
);

export const UsersScreen: FC<{ s: UsersState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Page />
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,40,.32)', opacity: s.pane }} />

    {/* Panel lateral */}
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 768,
        height: 810,
        background: 'var(--card)',
        boxShadow: '-24px 0 60px -20px rgba(15,23,40,.35)',
        transform: `translateX(${(1 - s.pane) * 790}px)`
      }}
    >
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--heading-foreground)' }}>Creación Rápida de Usuarios</span>
        <X size={18} style={{ color: 'var(--muted-foreground)' }} />
      </div>

      {/* El formulario sigue montado mientras se valida o se crea (el cambio del PR) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 56, bottom: 0, padding: '18px 28px', visibility: s.busy ? 'hidden' : 'visible' }}>
        <div style={{ marginBottom: 12 }}>
          <Label required>Nombre Completo</Label>
          <TextField value="Ana Morales" />
        </div>
        <div style={{ marginBottom: 6 }}>
          <Label required>Correo</Label>
          <TextField value="ana.morales@ejemplo.com" />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Este correo será el nombre de usuario para iniciar sesión</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
          <Plus size={14} /> Agregar Usuario
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <div style={{ marginBottom: 12 }}>
            <Label required>Nivel de Acceso</Label>
            <SelectField value="Operación" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label required>Rol</Label>
            <SelectField value="Despachador" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label>Operador</Label>
            <SelectField value="Operador Demo" />
          </div>
          <div style={{ marginBottom: 12, position: 'relative', zIndex: 20 }}>
            <Label>Organización</Label>
            <SelectField value={s.org} anchor="org" open={s.orgOpen > 0.5} glow={s.glow}>
              <Menu open={s.orgOpen} options={ORGS} prefix="org-opt" hover={s.orgHover} selected={s.org} />
            </SelectField>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label>División</Label>
            <SelectField value={s.division} glow={s.glow} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label>Subdivisión</Label>
            <SelectField value={s.subdivision} glow={s.glow} />
          </div>
        </div>
        <div style={{ marginTop: 2 }}>
          <Label>Contraseña</Label>
          <Radio on>Generar automáticamente una contraseña segura</Radio>
          <Radio>Crear contraseña</Radio>
          <Radio>Invitar por correo electrónico</Radio>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 13, color: 'var(--foreground)' }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Check size={12} strokeWidth={3} />
          </span>
          Pedir al usuario que cambie su contraseña cuando inicie sesión
        </div>
      </div>

      {s.busy && <Spinner frame={s.frame} message={s.busy === 'validating' ? 'Validando correos...' : 'Creando usuarios...'} />}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 66, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--card)' }}>
        <Btn anchor="save" press={s.savePress} minWidth={110}>
          Guardar
        </Btn>
        <Btn variant="outline" minWidth={110}>
          Cancelar
        </Btn>
      </div>
    </div>

    {/* Aviso de limite de licencias */}
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,40,.5)', opacity: s.dialog, visibility: s.dialog > 0.01 ? 'visible' : 'hidden', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          width: 512,
          padding: 26,
          borderRadius: 16,
          background: 'var(--card)',
          boxShadow: '0 30px 80px -20px rgba(15,23,40,.5)',
          transform: `translateY(${(1 - s.dialog) * 18}px) scale(${0.96 + 0.04 * s.dialog})`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 19, fontWeight: 800, color: 'var(--heading-foreground)' }}>
          <TriangleAlert size={22} style={{ color: '#f59e0b' }} />
          Límite de licencias alcanzado
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted-foreground)', margin: '8px 0 18px' }}>Falta 1 licencia de usuario para completar la creación.</p>
        <p data-anchor="dlg-summary" style={{ fontSize: 14, color: 'var(--foreground)', margin: '0 0 16px', lineHeight: 1.5 }}>
          <strong>Logística Norte</strong> tiene 1 licencia de usuario y 1 ocupada: 1 activo.
        </p>
        <Label>Nueva cantidad de licencias de usuarios</Label>
        <div style={{ height: 'var(--app-control-h)', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid var(--input)', borderRadius: 'var(--radius-control)', fontSize: 13, color: 'var(--foreground)' }}>
          <span style={{ flex: 1 }}>2</span>
          <span style={{ display: 'flex', flexDirection: 'column', color: 'var(--chevron)' }}>
            <ChevronUp size={13} />
            <ChevronDown size={13} />
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
          <Btn height={40} minWidth={150}>
            Aumentar y crear
          </Btn>
          <Btn variant="outline" height={40} minWidth={110} anchor="dlg-cancel" press={s.cancelPress}>
            Cancelar
          </Btn>
        </div>
      </div>
    </div>
  </div>
);
